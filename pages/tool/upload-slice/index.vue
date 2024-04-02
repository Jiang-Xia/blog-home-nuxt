<template>
  <div class="p-4 overflow-hidden flex justify-center">
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
        <button class="btn join-item" @click="mergeFileHandle">合成文件</button>
      </div>

      <div v-show="fileBlob" class="flex items-center mt-4 bg-base-100 rounded-sm p-4">
        <xia-icon icon="blog-wenjian" width="28px" height="28px" class="cursor-pointer" />
        <div class="flex-1 flex flex-col mx-2">
          <div class="text-sm text-ellipsis"> {{ fileName || '--' }}</div>
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
  import { watch } from 'vue'
  import { uploadFileRequest, mergeFile, checkFile } from '@/api/tool'
  import { messageDanger, messageSuccess } from '@/utils/toast'

  /*
  限制请求并发数 while实现
  是maxConcurrency一批完成再到一批
*/
  let currentIndex = 0
  async function limitRequests (chunks) {
    const maxConcurrency = MaxRequest
    const totalRequests = chunks.length
    // let currentIndex = 0
    const requestPromises = []
    currentIndex = 0
    while (currentIndex < totalRequests) {
      // console.log('currentIndex-totalRequests====>', currentIndex, totalRequests)
      const promises = []
      for (let i = 0; i < maxConcurrency && currentIndex < totalRequests; i++) {
        currentIndex++
        curProgress.value++
        const requestPromise = uploadHandler(toFormData(chunks[currentIndex - 1]))
        promises.push(requestPromise)
      }
      // console.log('promises====>', promises.length)
      const finishedPromise = await Promise.race(promises)
      requestPromises.push(finishedPromise)
    }
    // console.log('requestPromises====>', requestPromises)
    // 等待所有请求完成
    // return await Promise.all(requestPromises)
    return requestPromises
  }
  /*
  限制请求并发数 递归实现
  完成一个请求追加一个请求
*/
  async function limitRequests2 (chunks) {
    const maxConcurrency = MaxRequest
    currentIndex = 0
    // 第一次并发MaxRequest=6次
    const requestPromises = []
    async function sendNextRequest () {
      // 递归临界判断
      if (currentIndex < chunks.length) {
        // currentIndex++先使用在加
        curProgress.value++
        await uploadHandler(toFormData(chunks[currentIndex++]))
        // 第一次并发MaxRequest=6请求数中,任意一个完成之后接着调用递归
        return sendNextRequest() // 返回递归调用的Promise
      }
    }

    for (let i = 0; i < maxConcurrency; i++) {
      requestPromises.push(sendNextRequest())
    }

    // 等待所有请求完成
    // console.log('requestPromises====>', requestPromises)
    // 这里需要 Promise.all全部都是成功
    await Promise.all(requestPromises)
  }
  const fileName = ref('')
  const fileHash = ref('')
  const loading = ref(false)
  const chunkTotal = ref(10)
  const starting = ref(false)
  const MaxRequest = 2
  const ChunkSize = 2097152 // 131072 // 2097152
  const curProgress = ref(0)
  let fileBlob = '' // 文件内容
  const progressValue = computed(() => {
    const w = (curProgress.value / chunkTotal.value).toFixed(4) * 100 || 0
    // console.log('progressValue==================>', w)
    return w
  })
  // watch(() => curProgress.value, (n) => {
  //   console.log('curProgress===========>', n)
  // })
  // 状态icon
  const statusIcon = computed(() => {
    let icon
    if (starting.value) {
      icon = 'blog-zanting2'
    } else {
      icon = 'blog-zanting1'
    }
    if (progressValue.value === 100) {
      icon = 'blog-chenggong'
    }
    return icon
  })
  // input callback
  const changeHandle = async (e) => {
    curProgress.value = 0
    if (!e.target.files.length) {
      return
    }
    starting.value = true
    loading.value = true
    fileBlob = e.target.files[0]
    await uploadFile(fileBlob)
  }
  // btn callback
  const startingHandle = () => {
    if (starting.value) {
      currentIndex = chunkTotal.value
    } else {
      uploadFile(fileBlob)
    }
    starting.value = !starting.value
    // console.log(starting.value)
  }
  // 批量上传切片
  const uploadChunks = async (chunks) => {
    const resList = await limitRequests2(chunks)
    console.log('resList====>', resList)
  }
  // 转为formData
  const toFormData = (chunk) => {
    const fd = new FormData()
    Object.keys(chunk).forEach(k => fd.append(k, chunk[k]))
    return fd
  }
  // 上传
  const uploadHandler = (formData) => {
    return uploadFileRequest(formData)
  }

  // 使用线程创建切片
  const createChunksByWorker = (file) => {
    return new Promise((resolve, reject) => {
      const url = new URL('./worker.js', import.meta.url).href
      const myWorker = new Worker(url)
      myWorker.postMessage({ file, chunkSize: ChunkSize, })
      myWorker.onmessage = (e) => {
        // console.log('线程切片完成', e.data)
        resolve(e.data)
        myWorker.terminate()
      }
    })
  }
  // 上传执行函数
  const uploadFile = async (file) => {
    // 设置文件名
    fileName.value = file.name
    // 获取文件hash值
    const { chunkList, hash, } = await createChunksByWorker(file)
    fileHash.value = hash
    chunkTotal.value = chunkList.length
    // console.log(chunks, fileName)
    const { isExist, chunks = [], } = await checkFile({ hash, })
    curProgress.value = curProgress.value + chunks.length
    console.log(
      'curProgress==================>',
      curProgress.value,
      chunkTotal.value,
      curProgress.value / chunkTotal.value
    )
    if (isExist) {
      messageDanger('文件已存在')
      loading.value = false
      return
    }
    // 只上传没上传成功的
    const filterChunkList = chunkList.filter(v => !chunks.includes(v.index))
    await uploadChunks(filterChunkList)
    currentIndex = 0
    // const res = await mergeFile({ fileName: fileName.value, hash, })
    // if (res) {
    //   messageSuccess('上传成功')
    // }
    setTimeout(() => {
      starting.value = false
      loading.value = false
    }, 1000)
  }
  const mergeFileHandle = async () => {
    await mergeFile({ fileName: fileName.value, hash: fileHash.value, })
    fileName.value = ''
    fileHash.value = ''
    messageSuccess('合并成功')
  }
  onMounted(() => {})
</script>
<style lang="less" scoped>
  .progress {
    transition: all 0.6s ease;
  }
</style>
