/**
 * 分片上传 Worker：按 chunk 读文件并计算 SparkMD5。
 * 必须放在 public/ 以同源经典 Worker 加载；Vite 打包成 data:/blob: 后
 * importScripts('/js/...') 会报 URL invalid。
 */
/* eslint-disable no-undef */
importScripts('/js/cdn/spark-md5.min.js');

const ChunkSize = 2097152; // 2MB

const createChunks = ({ file, chunkSize = ChunkSize }) => {
  return new Promise((resolve, reject) => {
    const fileName = file.name;
    const chunkList = [];
    const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
    const chunks = Math.ceil(file.size / chunkSize);
    let currentChunk = 0;
    const spark = new SparkMD5.ArrayBuffer();
    const fileReader = new FileReader();

    fileReader.onload = function (e) {
      spark.append(e.target.result);
      currentChunk++;
      if (currentChunk < chunks) {
        loadNext();
      } else {
        const hash = spark.end();
        chunkList.forEach((v) => (v.hash = hash));
        resolve({ chunkList, hash });
      }
    };

    fileReader.onerror = function () {
      reject(new Error('切片错误'));
    };

    function loadNext() {
      const start = currentChunk * chunkSize;
      const end = start + chunkSize >= file.size ? file.size : start + chunkSize;
      const sliceFile = blobSlice.call(file, start, end);
      chunkList.push({
        fileContents: sliceFile,
        index: currentChunk,
        hash: '',
        fileName,
      });
      fileReader.readAsArrayBuffer(sliceFile);
    }

    loadNext();
  });
};

onmessage = async (e) => {
  const { chunkList, hash } = await createChunks(e.data);
  postMessage({ chunkList, hash });
};
