<template>
  <div class="p-4 overflow-hidden flex justify-center">
    <!-- multiple -->
    <section>
      <input
        type="file"
        name="fileContents"
        class="file-input file-input-bordered w-full max-w-xs"
        @change="changeHandle"
      >
      <!-- <button class="btn join-item rounded-r-full" @click="mergeFileHandle">合成</button> -->
      <progress v-show="starting" class="progress w-full" :value="progressValue" max="100" />
    </section>
  </div>
</template>
<script setup lang="js">
  import SparkMD5 from 'spark-md5'
  import { uploadFileRequest, mergeFile } from '@/api/tool'
  import { messageDanger, messageSuccess } from '@/utils/toast'
  // 限制请求并发数 while实现
  async function limitRequests (chunks) {
    const maxConcurrency = MaxRequest
    const totalRequests = chunks.length
    let currentIndex = 0
    const requestPromises = []

    while (currentIndex < totalRequests) {
      // console.log('currentIndex-totalRequests====>', currentIndex, totalRequests)
      const promises = []
      for (let i = 0; i < maxConcurrency && currentIndex < totalRequests; i++) {
        currentIndex++
        curProgress.value = currentIndex
        // console.log('curProgress.value====>', curProgress.value)
        const requestPromise = uploadHandler(toFormData(chunks[currentIndex - 1]))
        promises.push(requestPromise)
      }
      // console.log('promises====>', promises.length)
      // finishedPromise多个响应 得用all race一个成功整个都成功
      const finishedPromise = await Promise.all(promises)
      requestPromises.push(finishedPromise)
    }
    // console.log('requestPromises====>', requestPromises)
    // 等待所有请求完成
    // return await Promise.all(requestPromises)
    return requestPromises
  }
  // 限制请求并发数 递归实现
  async function limitRequests2 (chunks) {
    const maxConcurrency = MaxRequest
    let currentIndex = 0
    // 第一次并发MaxRequest=6次
    const requestPromises = []
    async function sendNextRequest () {
      // 递归临界判断
      if (currentIndex < chunks.length) {
        // currentIndex++先使用在加
        await uploadHandler(toFormData(chunks[currentIndex++]))
        // 第一次并发MaxRequest=6请求数中,任意一个完成之后接着调用递归
        return sendNextRequest() // 返回递归调用的Promise
      }
    }

    for (let i = 0; i < maxConcurrency; i++) {
      requestPromises.push(sendNextRequest())
    }

    // 等待所有请求完成
    console.log('requestPromises====>', requestPromises)
    // 这里需要 Promise.all全部都是成功
    await Promise.all(requestPromises)
  }

  const chunks = []
  let fileName = ''
  const starting = ref(false)
  const MaxRequest = 2
  const ChunkSize = 2097152 // 131072 // 2097152
  const curProgress = ref(0)
  const progressValue = computed(() => {
    return (curProgress.value / chunks.length) * 100
  })
  const changeHandle = async (e) => {
    curProgress.value = 0
    starting.value = true
    await uploadFile(e.target.files[0])
  }
  // 创建切片
  const createChunks = (file, chunkSize = ChunkSize) => {
    return new Promise((resolve, reject) => {
      // Read in chunks of 2MB
      const chunkList = [] // 切片文件数据
      const blobSlice =
        File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice
      const chunks = Math.ceil(file.size / chunkSize)
      let currentChunk = 0
      const spark = new SparkMD5.ArrayBuffer()
      const fileReader = new FileReader()

      fileReader.onload = function (e) {
        console.log('read chunk nr', currentChunk + 1, 'of', chunks)
        spark.append(e.target.result) // Append array buffer
        currentChunk++
        if (currentChunk < chunks) {
          loadNext()
        } else {
          console.log('finished loading')
          const hash = spark.end()
          console.info('computed hash', hash) // Compute hash
          chunkList.forEach(v => (v.hash = hash))
          resolve({ chunkList, hash, })
        }
      }

      fileReader.onerror = function () {
        console.warn('oops, something went wrong.')
        reject(new Error('切片错误'))
      }

      function loadNext () {
        const start = currentChunk * chunkSize
        const end = start + chunkSize >= file.size ? file.size : start + chunkSize
        const sliceFile = blobSlice.call(file, start, end)
        chunkList.push({
          fileContents: sliceFile,
          index: currentChunk,
          hash: '',
          fileName,
        })
        fileReader.readAsArrayBuffer(sliceFile)
      }

      loadNext()
    })
  }
  // 批量上传切片
  const uploadChunks = async (chunks) => {
    const resList = await limitRequests(chunks)
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

  // 上传执行函数
  const uploadFile = async (file) => {
    // 设置文件名
    fileName = file.name
    // 获取文件hash值
    const { chunkList, hash, } = await createChunks(file)
    // console.log(chunks, fileName)
    await uploadChunks(chunkList)
    const res = await mergeFile({ fileName, hash, })
    if (res) {
      messageSuccess('上传成功')
    }
    curProgress.value = 0
    starting.value = false
  }
  const mergeFileHandle = () => {
    mergeFile({ fileName: '江南-林俊杰.128.mp3', hash: 'b9772f96f761fb7c899ee12a64be319b', })
  }
  onMounted(() => {})
</script>
<style lang="less" scoped></style>
