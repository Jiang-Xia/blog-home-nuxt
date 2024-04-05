import request, { awaitWrap } from '~~/api/request.js'
import { baseUrl } from '~~/config'

// 上传文件
export const uploadFileRequest = (formData: any) => {
  // !不需要手动设置'Content-Type': 'multipart/form-data; 设置了反而上传失败
  const hash = formData.get('hash')
  const index = formData.get('index')
  return request.http(baseUrl + `/file/uploadBigFile?hash=${hash}&index=${index}`, {
    method: 'POST',
    body: formData,
  })

  // 前端本地调试
  // return new Promise((resolve, reject) => {
  //   let time = 1000
  //     if (formData.get('index') === '2') {
  //       time = 2000
  //   }
  //   setTimeout(() => {
  //     try {
  //       if (formData.get('index') === '2') {
  //          throw new Error('失败')
  //       } else {
  //         console.log('成功~~', formData.get('fileName') + '----index: ' + formData.get('index'))
  //         resolve({
  //           msg: '成功',
  //           formData,
  //         })
  //       }
  //     } catch (error) {
  //       reject(error)
  //     }
  //   }, time)
  // })
}
// 合并文件
export const mergeFile = (data: any) => {
  return awaitWrap(request.post('/file/uploadBigFile/merge', data))
}

// 检查文件
export const checkFile = (data: any) => {
  return awaitWrap(request.get('/file/uploadBigFile/checkFile', data))
}
