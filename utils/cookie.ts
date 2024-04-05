/*
 * @Author: 酱
 * @LastEditors: jx
 * @Date: 2021-11-17 16:28:36
 * @LastEditTime: 2024-04-05 23:15:43
 * @Description:
 * @FilePath: \blog-home-nuxt\utils\cookie.ts
 */
import Cookies from 'js-cookie'
export const TokenKey = 'x-accessToken'
export const RefreshTokenKey = 'x-refreshToken'
export const InfoKey = 'x-userInfo'

let day = 1 // 一天时间
export function getToken () {
  return Cookies.get(TokenKey)
}

export function setToken (type: string, token: string, time = 28800000) {
  day = time / (1000 * 60 * 60 * 24) // 一天时间
  return Cookies.set(TokenKey, type + ' ' + token, { expires: day, })
}

export function removeToken () {
  return Cookies.remove(TokenKey)
}

export function getInfo () {
  const userInfo = Cookies.get(InfoKey) || '{}'
  if (userInfo) {
    return JSON.parse(unescape(userInfo))
  }
}
export function setInfo (userData = {}) {
  userData = JSON.stringify(userData)
  return Cookies.set(InfoKey, userData, { expires: day, })
}

export function removeInfo () {
  return Cookies.remove(InfoKey)
}
export function setNormalToken (
  type: string,
  token: string,
  time: number,
  tokenKey = 'access_token'
) {
  day = time / (1000 * 60 * 60 * 24) // 一天时间
  return Cookies.set(tokenKey, type + ' ' + token, { expires: day, })
}
// cookie 过期时间 expires_at
export function setExpires (expiresAt: string, time: number) {
  day = time / (1000 * 60 * 60 * 24)
  return Cookies.set('expires_at', expiresAt, { expires: day, })
}

export function getExpires () {
  return Cookies.get('expires_at')
}
