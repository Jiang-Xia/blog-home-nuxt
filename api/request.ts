import type { ApiResponse } from './ApiResponse'
import { baseUrl } from '~~/config'
import { messageDanger } from '~~/utils/toast'
import { setToken, getToken, removeToken, TokenKey, RefreshTokenKey } from '@/utils/cookie'
import { aesEncrypt, aesDecrypt } from '~~/utils/crypto'

const openRequestLog = true
const openEncrypt = import.meta.env.VITE_NUXT_OPEN_ENCRYPT
console.log(openEncrypt)
const log = (msg: string, type = 'log') => {
  if (openRequestLog) {
    // @ts-ignore:
    console[type](msg)
  }
}
// const errorResponse: ApiResponse = {
//   success: false,
//   code: 0,
//   message: '',
//   data: null,
// }
interface PendingTask {
  config: any
  url: string
  fn: Function
}

// 无感刷新token
let refreshing = false // 是否正在刷新token
let queue: PendingTask[] = []

// async/await函数错误统一处理 const [err, data] = await checkFile({ hash, })
export const awaitWrap = <T, U = any>(promise: Promise<T>): Promise<[U | null, T | null]> => {
  return promise.then<[null, T]>((data: T) => [null, data]).catch<[U, null]>(err => [err, null])
}
// 防止重复请求
const requestMap = new Map()

// 加密请求 body
const encryptMsg = (body: any, url: string) => {
  const bool = url.includes('encrypt')
  if (bool && body) {
    // console.log('encryptMsg-body====>', JSON.stringify(body))
    body = aesEncrypt(JSON.stringify(body))
    // console.log('encryptMsg-body====>', body)
    // console.log('encryptMsg-body====>', { content: body, })
    return {
      content: body,
    }
  } else {
    return body
  }
}

// 解密响应 body
const decryptMsg = (body: any, url: string) => {
  const bool = url.includes('encrypt')
  if (bool && body) {
    body = aesDecrypt(body.content)
    body = JSON.parse(body)
    // console.log('decryptMsg-body', body)
    return body
  } else {
    return body
  }
}

// 创建一个实例
const apiFetch = $fetch.create({ baseURL: baseUrl, })
const $http = async (url: string, options: any): Promise<ApiResponse> => {
  const { method = 'GET', params = {}, headers, } = options
  // log({
  //   method,
  //   params,
  //   body,
  //   bool: ["POST", "PUT", "PATCH"].includes(method.toUpperCase()),
  // });
  if (openEncrypt && !url.includes('http')) {
    url = '/encrypt' + url
  }
  const body = encryptMsg(options.body, url)

  const defaultConfig: any = {
    headers: {
      ...headers,
    },
    credentials: 'include', // session需要携带cookie
    method,
    /* fetch中 params和body不能同时存在 */
    params: ['GET', 'DELETE'].includes(method.toUpperCase()) ? params : undefined,
    body: ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) ? body : undefined,
    onRequest (ctx: any) {
      // ctx.options.headers.Authorization = 'Bearer ' + getToken()
    },
  }
  return await new Promise((resolve, reject) => {
    const requestId = `${url}_${JSON.stringify(options)}`
    log(`请求开始 req --------------> ${url}`)
    try {
      if (requestMap.has(requestId)) {
        // log('正在请求中 requestId-------------->', requestId)
        log(`防抖，禁止重复请求！--------------> ${url}`, 'warn')
        reject(new Error('防抖，禁止重复请求！'))
        return
      } else {
        requestMap.set(requestId, options)
      }
    } catch (error) {}
    const getTk = () => {
      const token = getToken()
      return token ? 'Bearer ' + token : ''
    }
    const getDTconfig = () => {
      const config = defaultConfig
      config.headers.Authorization = getTk()
      return config
    }
    apiFetch<ApiResponse>(url, {
      ...getDTconfig(),
      onResponse (ctx) {
        log(`请求结束 res --------------> ${url}`)
        requestMap.delete(requestId)
        const status: number = ctx.response.status
        const body = decryptMsg(ctx.response._data, url)
        // console.log('onResponse =====>', ctx.response._data)

        if (status === 200 || status === 201) {
          resolve(body)
        }
      },
      async onResponseError (ctx: any) {
        const { url, } = ctx.response
        log(`请求结束 fail onResponseError --------------> ${url}`)
        requestMap.delete(requestId)
        const body = decryptMsg(ctx.response._data, url)
        // log('status', ctx.response)
        const status: number = ctx.response.status
        if (refreshing) {
          queue.push({
            config: getDTconfig(),
            url,
            // 作用是把当前状态为pending的promise放进全局数组中
            // 刷新完token之后再把对应的promise状态改为fulfilled，
            // 这样之前报401响应的请求没有变更状态，刷新token再变为fulfilled响应后执行等待的相关操作
            fn: resolve,
          })
          // return为关键，不执行下面代码，不然下面resolve变更promise状态，
          // 造成每个promise都会执行foreach请求多个
          return
        }
        try {
          if (status === 401 && !url.includes('/user/refresh')) {
            refreshing = true
            const res = await refreshToken()
            refreshing = false
            if (res) {
              queue.forEach(({ config, url, fn, }) => {
                // 需动态重装config 查询获取本地的token
                config.headers.Authorization = getTk()
                fn(apiFetch(url, config))
              })
              console.log('queue', queue)
              queue = []
              resolve(apiFetch(url, getDTconfig()))
            } else {
              // 清除token
              const token = useToken()
              token.value = ''
              removeToken(TokenKey)
              console.log(body.message)
            }
          } else {
            // 其他状态码直接变为reject
            messageDanger(body.message || '')
            reject(body)
          }
        } catch (error) {
          reject(error)
        }
      },
    })
  })
}

const get = async (url: string, params = {}): Promise<any> => {
  return await $http(url, { method: 'GET', params, }).then(res => res.data)
}

const del = async (url: string, params = {}): Promise<any> => {
  return await $http(url, { method: 'DELETE', params, }).then(res => res.data)
}

const post = async (url: string, params = {}): Promise<any> => {
  return await $http(url, { method: 'POST', body: params, }).then(res => res.data)
}

const put = async (url: string, params = {}): Promise<any> => {
  return await $http(url, { method: 'PUT', body: params, }).then(res => res.data)
}
// 刷新token
async function refreshToken () {
  const token = useToken()
  const userInfo = useUserInfo()
  const refreshToken = getToken(RefreshTokenKey)

  const res = await get('/user/refresh', { token: refreshToken, })
  setToken(TokenKey, res.accessToken)
  setToken(RefreshTokenKey, res.refreshToken, '', 7)

  token.value = res.accessToken
  const { nickname, homepage, intro, avatar, id: uid, role, } = res.user
  userInfo.value = {
    nickname,
    homepage,
    intro,
    avatar,
    uid,
    role,
  }
  return res
}

export default { http: $http, get, post, put, del, awaitWrap, }
