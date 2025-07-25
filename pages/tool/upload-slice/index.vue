<template>
  <div class="p-4 max-w-6xl mx-auto rounded-xl bg-base-100 overflow-hidden flex justify-center">
    <!-- multiple -->
    <section>
      <div class="join">
        <input
          ref="fileContents"
          type="file"
          name="fileContents"
          class="join-item file-input file-input-bordered w-full max-w-xs"
          @change="changeHandle"
        >
        <!-- <button class="btn join-item" @click="mergeFileHandle">合成文件</button> -->
      </div>

      <div v-show="fileBlob" class="flex items-center mt-4 bg-base-100 rounded-sm p-4">
        <xia-icon icon="blog-wenjian" width="28px" height="28px" class="cursor-pointer" />
        <div class="flex-1 flex flex-col mx-2">
          <div class="text-sm text-ellipsis">
            {{ fileName || '--' }}
          </div>
          <xia-progress :value="progressValue" />
        </div>
        <xia-icon
          :icon="statusIcon"
          width="28px"
          height="28px"
          class="cursor-pointer"
          @click="startingHandle"
        />
      </div>
      <span v-if="loading" class="loading loading-dots loading-md bg-accent" />
    </section>
  </div>
</template>

<script setup lang="js">
import { watch, stop } from 'vue';
import { uploadFileRequest, mergeFile, checkFile } from '@/api/tool';
import { messageDanger, messageSuccess } from '@/utils/toast';

let currentIndex = 0;
let stopUpload = false;
let requests = [];
/*
  限制请求并发数 递归实现
  浏览器递归深度大概在9500左右，超出会报栈溢出
  完成一个请求追加一个请求
  暂停开始操作实现不了
*/
async function limitRequests1(chunks) {
  requests = [...chunks];
  const maxConcurrency = MaxRequest;
  currentIndex = 0;
  // 第一次并发MaxRequest=6次
  const requestPromises = [];
  async function sendNextRequest() {
    if (stopUpload) {
      throw new Error('停止');
    }
    // 递归临界判断
    if (currentIndex < requests.length) {
      const chunk = requests[currentIndex++];
      try {
        // currentIndex++先使用在加
        await uploadHandler(toFormData(chunk));
        curProgress.value++;
        return sendNextRequest();
        // 第一次并发MaxRequest=6请求数中,任意一个完成之后接着调用递归
        // 每次调用 sendNextRequest() 都会返回一个 Promise 对象
      }
      catch (error) {
        // 只会重试一次
        await uploadHandler(toFormData(chunk));
        curProgress.value++;
        return sendNextRequest();
      }
    }
  }

  for (let i = 0; i < maxConcurrency; i++) {
    // sendNextRequest() 因为一直在递归，一个promise完成又会返回一个新的promise
    const promise = sendNextRequest();
    requestPromises.push(promise);
  }

  // 等待所有请求完成
  console.log('requestPromises1====>', requestPromises);
  if (stopUpload) {
    await Promise.reject(new Error('停止'));
    return;
  }
  // 这里需要 Promise.all全部完成
  await Promise.all(requestPromises);
  console.log('requestPromises2====>', requestPromises);
}
/*
    限制请求并发数 队列实现
    首次最大并发数请求，后续一个请求完成则继续从队列取出数据接着请求，先进先出
  */
function limitRequests2(chunks, fn, maxRequest) {
  requests = [...chunks];
  const totalRequests = chunks.length;
  const requestFn = fn;
  let errorNum = 0; // 错误数
  currentIndex = 0;
  return new Promise((resolve, reject) => {
    const makeRequest = async (chunk) => {
      if (stopUpload) {
        reject(new Error('停止'));
        return;
      }
      try {
        await requestFn(toFormData(chunk));
        currentIndex++;
        curProgress.value++;
        // console.log('Request to completed', response)
      }
      catch (error) {
        errorNum++;
        // 请求失败重试逻辑
        if (errorNum < 10) {
          console.log('Retrying request to', errorNum);
          await makeRequest(chunk); // 重新发起请求
        }
      }
      finally {
        // await之后执行
        // 如果还有待处理的请求，则发起下一个请求
        if (requests.length > 0) {
          await makeRequest(requests.shift());
        }
        if (errorNum > 10) {
          reject(new Error('错误数太多'));
        }
        if (requests.length === 0 && currentIndex === totalRequests) {
          resolve(true);
        }
      }
    };
      // 初始化拿出最大最大并发数请求
    for (let i = 0; i < maxRequest; i++) {
      makeRequest(requests.shift());
    }
  });
}
const fileName = ref('');
const fileHash = ref('');
const loading = ref(false);
const chunkTotal = ref(0);
const starting = ref(false);
const MaxRequest = 3;
const ChunkSize = 2097152; // 131072 // 2097152
const curProgress = ref(0);
let fileBlob = ''; // 文件内容
const progressValue = computed(() => {
  const w = (curProgress.value / chunkTotal.value).toFixed(4) * 100 || 0;
  // console.log('progressValue==================>', w)
  return w;
});
  // watch(() => curProgress.value, (n) => {
  //   console.log('curProgress===========>', n)
  // })
  // 状态icon
const statusIcon = computed(() => {
  let icon;
  if (starting.value) {
    icon = 'blog-zanting2';
  }
  else {
    icon = 'blog-zanting1';
  }
  if (progressValue.value === 100) {
    icon = 'blog-chenggong';
  }
  return icon;
});
  // input callback
const changeHandle = async (e) => {
  curProgress.value = 0;
  if (!e.target.files.length) {
    return;
  }
  starting.value = true;
  loading.value = true;
  fileBlob = e.target.files[0];
  await uploadFile(fileBlob);
};
  // btn callback
const startingHandle = () => {
  if (starting.value) {
    currentIndex = chunkTotal.value;
    stopUpload = true;
  }
  else {
    stopUpload = false;
    uploadFile(fileBlob);
  }
  starting.value = !starting.value;
  // console.log(starting.value)
};
  // 批量上传切片
const uploadChunks = async (chunks) => {
  try {
    const resList = await limitRequests2(chunks, uploadHandler, MaxRequest);
    // const resList = await limitRequests1(chunks)
    console.log('resList====>', resList);
    return resList;
  }
  catch (error) {
    //  console.log(error)
  }
};
  // 转为formData
const toFormData = (chunk) => {
  const fd = new FormData();
  Object.keys(chunk).forEach(k => fd.append(k, chunk[k]));
  return fd;
};
  // 上传
const uploadHandler = (formData) => {
  return uploadFileRequest(formData);
};

// 使用线程创建切片
const createChunksByWorker = (file) => {
  return new Promise((resolve, reject) => {
    const url = new URL('./worker.js', import.meta.url).href;
    const myWorker = new Worker(url);
    myWorker.postMessage({ file, chunkSize: ChunkSize });
    myWorker.onmessage = (e) => {
      // console.log('线程切片完成', e.data)
      resolve(e.data);
      myWorker.terminate();
    };
  });
};
  // 上传执行函数
const uploadFile = async (file) => {
  // 设置文件名
  fileName.value = file.name;
  // 获取文件hash值
  const { chunkList, hash } = await createChunksByWorker(file);
  fileHash.value = hash;
  chunkTotal.value = chunkList.length;
  // console.log(chunks, fileName)
  const [err, data] = await checkFile({ hash });
  const { isExist, chunks = [] } = data;
  curProgress.value = chunks.length;
  if (err) {
    console.log(err, data);
    return;
  }
  console.log(
    'curProgress==================>',
    curProgress.value,
    chunkTotal.value,
    curProgress.value / chunkTotal.value,
  );
  if (isExist) {
    messageDanger('文件已存在');
    loading.value = false;
    return;
  }
  // 只上传没上传成功的
  const filterChunkList = chunkList.filter(v => !chunks.includes(v.index));
  const uploaded = await uploadChunks(filterChunkList);
  if (uploaded) {
    currentIndex = 0;
    const [err, data] = await mergeFile({
      chunks: chunkTotal.value,
      fileName: fileName.value,
      hash,
    });
    if (!err) {
      messageSuccess('上传成功');
    }
    setTimeout(() => {
      starting.value = false;
      loading.value = false;
    }, 1000);
  }
};
const mergeFileHandle = async () => {
  await mergeFile({ fileName: fileName.value, hash: fileHash.value });
  fileName.value = '';
  fileHash.value = '';
  messageSuccess('合并成功');
};
onMounted(() => {});
</script>

<style lang="less" scoped>
  .progress {
    transition: all 0.6s ease;
  }
</style>
