import { baseUrl } from '~~/config'
import { messageDanger } from '~~/utils/toast'
import { TokenKey, RefreshTokenKey } from '@/utils/cookie'
// const errorResponse: ApiResponse = {
//   success: false,
//   code: 0,
//   message: '',
//   data: null,
// }
interface PendingTask {
  config: any
  url: string
  resolve: Function
}

// 无感刷新token
let refreshing = false // 是否正在刷新token
let queue: PendingTask[] = []

// async/await函数错误统一处理 const [err, data] = await checkFile({ hash, })
export const awaitWrap = <T, U = any>(promise: Promise<T>): Promise<[U | null, T | null]> => {
  return promise.then<[null, T]>((data: T) => [null, data]).catch<[U, null]>(err => [err, null])
}
// 创建一个实例
const apiFetch = $fetch.create({ baseURL: baseUrl, })
const $http = async (url: string, options: any): Promise<ApiResponse> => {
  const { method = 'GET', params = {}, body = {}, headers, } = options
  // console.log({
  //   method,
  //   params,
  //   body,
  //   bool: ["POST", "PUT", "PATCH"].includes(method.toUpperCase()),
  // });
  const config: any = {
    headers: {
      ...headers,
    },
    credentials: 'include', // session需要携带cookie
    method,
    /* fetch中 params和body不能同时存在 */
    params: ['GET', 'DELETE'].includes(method.toUpperCase()) ? params : undefined,
    body: ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) ? body : undefined,
    onRequest (ctx: any) {
      ctx.options.headers.Authorization = getToken()
    },
  }

  const res = await apiFetch<ApiResponse>(url, {
    ...config,
    async onResponseError (ctx: any) {
      console.log('onResponseError', ctx)
      // console.log('status', ctx.response)
      const status: number = ctx.response.status
      const { url, } = ctx.response
      if (refreshing) {
        return new Promise((resolve) => {
          queue.push({
            config,
            url: baseUrl,
            resolve,
          })
        })
      }
      try {
        if (status === 401 && !url.includes('/user/refresh')) {
          refreshing = true
          const res = await refreshToken()
          refreshing = false
          if (res) {
            queue.forEach(({ config, url, resolve, }) => {
              config.headers.Authorization = getToken()
              resolve(apiFetch(url, config))
            })
            console.log('queue', queue)
            queue = []
            config.headers.Authorization = getToken()
            apiFetch(url, config)
          } else {
            // 清除token
            const token = useToken()
            token.value = ''
            localStorage.setItem(TokenKey, '')
            console.error(ctx.response._data.message)
          }
        } else {
          messageDanger(ctx.response._data.message || '')
        }
        // 返回错误信息，各接口自行处理
        return await Promise.reject(ctx.response._data)
      } catch (error) {
        // console.log("onRequestError", error);
        return await Promise.reject(error)
      }
    },
  })
  // console.log({ type: '$http ', res, })
  // 200 成功才会返回
  return res
}
// 获取 token
const getToken = () => {
  const tk = useToken()
  let token = ''
  if (tk.value) {
    token = 'Bearer ' + tk.value
  }
  // console.log({ token });
  return token
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
  const accessToken = localStorage.getItem(RefreshTokenKey) || ''
  const res = await get('/user/refresh', { token: accessToken, })
  localStorage.setItem(TokenKey, res.accessToken)
  localStorage.setItem(RefreshTokenKey, res.refreshToken)
  token.value = res.accessToken
  const { nickname, homepage, intro, avatar, id: uid, role, } = await get('/user/info')
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
