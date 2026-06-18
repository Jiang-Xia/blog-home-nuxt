<template>
  <CyberToolCard title="分片上传" desc="大文件分片上传与合并">
    <div class="flex flex-col items-center gap-4">
      <div class="join w-full max-w-md">
        <input
          ref="fileContents"
          type="file"
          name="fileContents"
          class="join-item file-input file-input-bordered login-input w-full"
          @change="changeHandle"
        >
      </div>

      <div
        v-show="fileBlob"
        class="flex w-full max-w-md items-center rounded-lg border border-tech bg-[var(--tech-input-bg)] p-4 text-tech"
      >
        <xia-icon icon="blog-wenjian" width="28px" height="28px" class="cursor-pointer" />
        <div class="mx-2 flex flex-1 flex-col">
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
      <span v-if="loading" class="loading loading-dots loading-md text-primary" />
    </div>
  </CyberToolCard>
</template>

<script setup lang="js">
import { watch, stop } from 'vue';
import { uploadFileRequest, mergeFile, checkFile } from '@/api/tool';
import { messageDanger, messageSuccess } from '@/utils/toast';

let currentIndex = 0;
let stopUpload = false;
let requests = [];
async function limitRequests1(chunks) {
  requests = [...chunks];
  const maxConcurrency = MaxRequest;
  currentIndex = 0;
  const requestPromises = [];
  async function sendNextRequest() {
    if (stopUpload) {
      throw new Error('停止');
    }
    if (currentIndex < requests.length) {
      const chunk = requests[currentIndex++];
      try {
        await uploadHandler(toFormData(chunk));
        curProgress.value++;
        return sendNextRequest();
      }
      catch (error) {
        await uploadHandler(toFormData(chunk));
        curProgress.value++;
        return sendNextRequest();
      }
    }
  }

  for (let i = 0; i < maxConcurrency; i++) {
    const promise = sendNextRequest();
    requestPromises.push(promise);
  }

  console.log('requestPromises1====>', requestPromises);
  if (stopUpload) {
    await Promise.reject(new Error('停止'));
    return;
  }
  await Promise.all(requestPromises);
  console.log('requestPromises2====>', requestPromises);
}
function limitRequests2(chunks, fn, maxRequest) {
  requests = [...chunks];
  const totalRequests = chunks.length;
  const requestFn = fn;
  let errorNum = 0;
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
      }
      catch (error) {
        errorNum++;
        if (errorNum < 10) {
          console.log('Retrying request to', errorNum);
          await makeRequest(chunk);
        }
      }
      finally {
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
const ChunkSize = 2097152;
const curProgress = ref(0);
let fileBlob = '';
const progressValue = computed(() => {
  const w = (curProgress.value / chunkTotal.value).toFixed(4) * 100 || 0;
  return w;
});
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
};
const uploadChunks = async (chunks) => {
  try {
    const resList = await limitRequests2(chunks, uploadHandler, MaxRequest);
    console.log('resList====>', resList);
    return resList;
  }
  catch (error) {
    // noop
  }
};
const toFormData = (chunk) => {
  const fd = new FormData();
  Object.keys(chunk).forEach(k => fd.append(k, chunk[k]));
  return fd;
};
const uploadHandler = (formData) => {
  return uploadFileRequest(formData);
};

const createChunksByWorker = (file) => {
  return new Promise((resolve, reject) => {
    const url = new URL('./worker.js', import.meta.url).href;
    const myWorker = new Worker(url);
    myWorker.postMessage({ file, chunkSize: ChunkSize });
    myWorker.onmessage = (e) => {
      resolve(e.data);
      myWorker.terminate();
    };
  });
};
const uploadFile = async (file) => {
  fileName.value = file.name;
  const { chunkList, hash } = await createChunksByWorker(file);
  fileHash.value = hash;
  chunkTotal.value = chunkList.length;
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
