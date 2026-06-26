/*
 * @Author: 酱
 * @LastEditors: jx
 * @Date: 2021-11-17 16:28:36
 * @LastEditTime: 2024-11-19 14:55:21
 * @Description:
 * @FilePath: \blog-home-nuxt\utils\cookie.ts
 */
import Cookies from 'js-cookie';

export const TokenKey = 'x-accessToken';
export const RefreshTokenKey = 'x-refreshToken';
export const InfoKey = 'x-userInfo';

const DAY: number = 1; // 一天时间
const commonCookieOptions = {
  path: '/',
  secure: typeof window !== 'undefined' ? window.location.protocol === 'https:' : true,
  sameSite: 'Lax' as const,
};
export function getToken(key = TokenKey) {
  // console.log(`${key}======>`, Cookies.get(key))
  return Cookies.get(key);
}

/**
 * 从 Cookie 请求头解析 token（SSR 用，与 js-cookie 读写同一 key）
 */
export function getTokenFromCookieHeader(
  cookieHeader: string | undefined,
  key = TokenKey,
): string | undefined {
  if (!cookieHeader) {
    return undefined;
  }
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${escapedKey}=([^;]*)`));
  if (!match?.[1]) {
    return undefined;
  }
  try {
    return decodeURIComponent(match[1]);
  }
  catch {
    return match[1];
  }
}

export function setToken(key = TokenKey, token: string, type: string = '', day = DAY) {
  return Cookies.set(key, type + token, { expires: day, ...commonCookieOptions });
}

export function removeToken(key = TokenKey) {
  return Cookies.remove(key, { path: '/' });
}

export function getInfo(key = InfoKey) {
  const userInfo = Cookies.get(key) || '{}';
  if (userInfo) {
    return JSON.parse(unescape(userInfo));
  }
}
export function setInfo(userData = {}, key = InfoKey, day = DAY) {
  userData = JSON.stringify(userData);
  return Cookies.set(key, userData, { expires: day, ...commonCookieOptions });
}

export function removeInfo(key = InfoKey) {
  return Cookies.remove(InfoKey);
}
export function setNormalToken(
  type: string,
  token: string,
  time: number,
  tokenKey = 'access_token',
  day = DAY,
) {
  // day = time / (1000 * 60 * 60 * 24) // 一天时间
  return Cookies.set(tokenKey, type + ' ' + token, { expires: day, ...commonCookieOptions });
}
// cookie 过期时间 expires_at
export function setExpires(expiresAt: string, day = DAY) {
  return Cookies.set('expires_at', expiresAt, { expires: day, ...commonCookieOptions });
}

export function getExpires() {
  return Cookies.get('expires_at');
}
