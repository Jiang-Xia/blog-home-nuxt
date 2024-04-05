import { baseUrl } from '~~/config'
import { messageDanger } from '~~/utils/toast'
// const errorResponse: ApiResponse = {
//   success: false,
//   code: 0,
//   message: '',
//   data: null,
// }
export const awaitWrap = <T, U = any>(promise: Promise<T>): Promise<[U | null, T | null]> => {
  return promise.then<[null, T]>((data: T) => [null, data]).catch<[U, null]>(err => [err, null])
}
const $http = async (baseUrl: string, options: any): Promise<ApiResponse> => {
  const { method = 'GET', params = {}, body = {}, headers, } = options
  // console.log({
  //   method,
  //   params,
  //   body,
  //   bool: ["POST", "PUT", "PATCH"].includes(method.toUpperCase()),
  // });

  const res: any = await $fetch<ApiResponse>(baseUrl, {
    headers: {
      ...headers,
      Authorization: getToken(),
    },
    credentials: 'include', // session需要携带cookie
    method,
    /* fetch中 params和body不能同时存在 */
    params: ['GET', 'DELETE'].includes(method.toUpperCase()) ? params : undefined,
    body: ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) ? body : undefined,
    onResponseError (ctx: any) {
      console.log('onRequestError', ctx)
      // console.log("status", ctx.response);
      const status: number = ctx.response.status
      try {
        if (status === 401) {
          // 清除token
          const token = useToken()
          token.value = ''
          localStorage.setItem('x-token', '')
          console.error(ctx.response._data.message)
        }
        messageDanger(ctx.response._data.message || '')
        // 返回错误信息，各接口自行处理
        return Promise.reject(ctx.response._data)
      } catch (error) {
        // console.log("onRequestError", error);
        return Promise.reject(error)
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
  return await $http(baseUrl + url, { method: 'GET', params, }).then(res => res.data)
}

const del = async (url: string, params = {}): Promise<any> => {
  return await $http(baseUrl + url, { method: 'DELETE', params, }).then(res => res.data)
}

const post = async (url: string, params = {}): Promise<any> => {
  return await $http(baseUrl + url, { method: 'POST', body: params, }).then(res => res.data)
}

const put = async (url: string, params = {}): Promise<any> => {
  return await $http(baseUrl + url, { method: 'PUT', body: params, }).then(res => res.data)
}

export default { http: $http, get, post, put, del, awaitWrap, }
