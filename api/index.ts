import * as article from './article'
import * as tag from './tag'
import * as category from './category'
import request from '~~/api/request.js'
import { baseUrl } from '~~/config'

// 获取用户信息
const getUserInfo = async (): Promise<userInfoState> => {
  const { data = {}, } = await request.get('/user/info')
  const { nickname, homepage, intro, avatar, id: uid, role, } = data
  return {
    nickname,
    homepage,
    intro,
    avatar,
    uid,
    role,
  }
}
// 古诗词
export const gushici = async () => {
  const res = await request.http('https://jiang-xia.top/x-zone/api/v1/third/gushici', {
    method: 'GET',
  })
  return res.data
}
// 获取天气
export const getWeather = async () => {
  const res = await request.get('/resources/weather')
  return res.data
}

// 上传文件
export const uploadFileRequest = (formData: any) => {
  // !不需要手动设置'Content-Type': 'multipart/form-data; 设置了反而上传失败
  return request.http(baseUrl + '/file/uploadBigFile', {
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

const api = {
  ...article,
  ...tag,
  ...category,
  getUserInfo,
  gushici,
  getWeather,
}
// https://gitee.com/api/v5/repos/jiang-xia/blog-home-nuxt/commits?access_token=53db1802db341bf994093cace04c275b&page=1&per_page=20
export default api
