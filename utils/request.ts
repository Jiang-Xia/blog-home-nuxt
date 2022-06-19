/*
 * @Author: 酱
 * @LastEditors: 酱
 * @Date: 2021-11-17 16:26:53
 * @LastEditTime: 2022-06-19 13:33:33
 * @Description:
 * @FilePath: \blog-home-nuxt\utils\request.ts
 */
import axios from 'axios'
import { AxiosRequestConfig, AxiosResponse } from 'axios'
// import router from '@/router/'
import { getToken, removeToken, removeInfo } from '@/utils/cookie'
// import { getCode } from '@/utils/common'
// import showXiaLogin from '@/components/xia-login/main'
import { baseUrl } from '@/config'
import { ElMessage } from 'element-plus'
interface MessageConfig {
  message: string
  duration?: number
  type?: string
}
function errorMsg(msg: string) {
  msg && ElMessage.error(msg)
}
const $axios = axios.create({
  timeout: 4290000,
  baseURL: ''
})
$axios.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // openLoading()
    const token = ''
    // const token = getToken()
    config.headers = {}
    config.baseURL = baseUrl
    // if (config.method === 'get') {
    //   // 解决get请求axios不能设置Content-Type
    //   config.data = true
    // }
    // config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    if (token) {
      // 请求头部添加token
      config.headers.Authorization = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)
/**
 * 响应拦截器
 * 用于处理loading状态关闭、请求成功回调、响应错误处理
 */
$axios.interceptors.response.use(
  (response: AxiosResponse) => {
    // console.log(response.data)
    const status = response.status
    const code = response.data.code
    if ((status >= 200 && status < 300) || status === 304) {
      // const pollingStatus = response.data.data.status
      if (code === 200) {
        // 全部json数据
        return Promise.resolve(response.data)
      } else {
        response && errorMsg(response.message)
        return Promise.reject(new Error(response.data || 'Error'))
      }
    } else {
      return Promise.reject(response)
    }
  },
  (error) => {
    console.log('error: ', error.response)
    if (error.response) {
      const data = error.response && error.response.data
      switch (error.response.status) {
        case 401:
          errorMsg(data.message || '权限不足')
          removeToken()
          removeInfo()
          break
        case 404:
          errorMsg(data.message || '网络请求不存在')
          break
        default:
          errorMsg(data.message)
      }
    } else {
      // 请求超时或者网络有问题
      if (error.message.includes('timeout')) {
        errorMsg('请求超时！请检查网络是否正常')
      } else {
        errorMsg('请求失败，请检查网络是否已连接')
      }
    }
    return Promise.reject(error)
  }
)
export default $axios
