// 读取外部脚本(外部库)
importScripts('https://cdn.jsdelivr.net/npm/spark-md5@3.0.2/spark-md5.min.js')
const ChunkSize = 2097152 // 131072 // 2097152
// 创建切片
const createChunks = ({ file, chunkSize = ChunkSize, }) => {
  return new Promise((resolve, reject) => {
    const fileName = file.name
    // Read in chunks of 2MB
    const chunkList = [] // 切片文件数据
    const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice
    const chunks = Math.ceil(file.size / chunkSize)
    let currentChunk = 0
    // console.log(self, globalThis)
    const spark = new SparkMD5.ArrayBuffer()
    const fileReader = new FileReader()

    fileReader.onload = function (e) {
      // console.log('read chunk nr', currentChunk + 1, 'of', chunks)
      spark.append(e.target.result) // Append array buffer
      currentChunk++
      if (currentChunk < chunks) {
        loadNext()
      } else {
        console.log('finished loading')
        const hash = spark.end()
        console.info('computed hash', hash) // Compute hash
        console.info('chunkList.length', chunkList.length)
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
      // https://developer.mozilla.org/zh-CN/docs/Web/API/FileReader/readAsArrayBuffer
      fileReader.readAsArrayBuffer(sliceFile)
    }

    loadNext()
  })
}
onmessage = async (e) => {
  const { chunkList, hash, } = await createChunks(e.data)
  postMessage({ chunkList, hash, })
}
