/*
 * @Author: 酱
 * @LastEditors: jx
 * @Date: 2021-11-17 16:28:36
 * @LastEditTime: 2024-11-19 14:55:21
 * @Description:
 * @FilePath: \blog-home-nuxt\utils\cookie.ts
 */
import Cookies from 'js-cookie'
export const TokenKey = 'x-accessToken'
export const RefreshTokenKey = 'x-refreshToken'
export const InfoKey = 'x-userInfo'

const DAY: number = 1 // 一天时间
export function getToken (key = TokenKey) {
  // console.log(`${key}======>`, Cookies.get(key))
  return Cookies.get(key)
}

export function setToken (key = TokenKey, token: string, type: string = '', day = DAY) {
  return Cookies.set(key, type + token, { expires: day, })
}

export function removeToken (key = TokenKey) {
  return Cookies.remove(key)
}

export function getInfo (key = InfoKey) {
  const userInfo = Cookies.get(key) || '{}'
  if (userInfo) {
    return JSON.parse(unescape(userInfo))
  }
}
export function setInfo (userData = {}, key = InfoKey, day = DAY) {
  userData = JSON.stringify(userData)
  return Cookies.set(key, userData, { expires: day, })
}

export function removeInfo (key = InfoKey) {
  return Cookies.remove(InfoKey)
}
export function setNormalToken (
  type: string,
  token: string,
  time: number,
  tokenKey = 'access_token',
  day = DAY
) {
  // day = time / (1000 * 60 * 60 * 24) // 一天时间
  return Cookies.set(tokenKey, type + ' ' + token, { expires: day, })
}
// cookie 过期时间 expires_at
export function setExpires (expiresAt: string, day = DAY) {
  return Cookies.set('expires_at', expiresAt, { expires: day, })
}

export function getExpires () {
  return Cookies.get('expires_at')
}
