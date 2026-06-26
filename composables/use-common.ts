import { useState } from '#app';
import api from '@/api';
import { TokenKey, RefreshTokenKey, getToken, getTokenFromCookieHeader } from '@/utils/cookie';
import { readAccessToken, readRefreshToken } from '@/utils/auth-token-state';

export const defaultInfo: userInfoState = {
  nickname: '',
  homepage: '',
  intro: '',
  avatar: '',
  uid: 0,
  role: '',
};

export const useUserInfo = () => useState<userInfoState>('userInfo', () => ({ ...defaultInfo }));
export const useToken = () => useState<string>('token', () => '');
export const useRefreshToken = () => useState<string>('refreshToken', () => '');

export const clearUserInfo = () => {
  Object.assign(useUserInfo().value, defaultInfo);
};

export const useClearUserInfo = () => clearUserInfo;

/**
 * 从 Cookie 同步 access/refresh token 到 useState（客户端 js-cookie，SSR 读请求头）
 * 与 request.ts Authorization 来源一致，避免 useCookie 与 js-cookie 双轨冲突
 */
export const syncAuthTokensFromCookie = (): { access?: string; refresh?: string } => {
  const token = useToken();
  const refreshToken = useRefreshToken();
  const cookieHeader = import.meta.client ? undefined : useRequestHeaders(['cookie']).cookie;
  const access = import.meta.client
    ? getToken(TokenKey)
    : getTokenFromCookieHeader(cookieHeader, TokenKey);
  const refresh = import.meta.client
    ? getToken(RefreshTokenKey)
    : getTokenFromCookieHeader(cookieHeader, RefreshTokenKey);
  // 客户端以 Cookie 为准双向同步，避免 payload 空 token 与 Cookie 不一致
  if (import.meta.client) {
    token.value = access || '';
    refreshToken.value = refresh || '';
  }
  else {
    if (access) token.value = access;
    if (refresh) refreshToken.value = refresh;
  }
  return { access, refresh };
};

/**
 * 导航/UI 用登录态：state 与 Cookie 任一侧有效即视为已登录
 * （线上 refresh 后常见 Cookie 在但 useToken 尚未 hydration 同步）
 */
export const useAuthSession = () => {
  const token = useToken();
  const userInfo = useUserInfo();
  const cookieTick = useState('auth-cookie-tick', () => 0);

  const sync = () => {
    syncAuthTokensFromCookie();
    cookieTick.value++;
  };

  const isLoggedIn = computed(() => {
    cookieTick.value;
    if (token.value) return true;
    if (userInfo.value?.uid) return true;
    if (import.meta.client && getToken(TokenKey)) return true;
    return false;
  });

  return { token, userInfo, isLoggedIn, sync };
};

/** @deprecated 使用 syncAuthTokensFromCookie */
export const syncAccessTokenFromCookie = syncAuthTokensFromCookie;

/**
 * 确保 userInfo 已与 token 同步（刷新后 uid 可能暂未写入）
 * @returns 是否已登录
 */
export const ensureLoggedIn = async (): Promise<boolean> => {
  const info = useUserInfo();
  if (info.value?.uid) return true;
  syncAuthTokensFromCookie();
  if (!readAccessToken()) return false;
  await refreshUserInfo();
  return !!info.value?.uid;
};

/** 根据当前 token 拉取并写入用户信息；无 token 时清空 */
export const refreshUserInfo = async () => {
  const info = useUserInfo();
  if (!readAccessToken()) {
    clearUserInfo();
    return null;
  }
  try {
    const res = await api.getUserInfo();
    Object.assign(info.value, res);
    return res;
  }
  catch {
    // 401 / 会话失效由 request.ts clearAuthSession 统一处理，此处不清 token 避免 Cookie 仍在但 UI 误判未登录
    return null;
  }
};

export default function () {
  return useState('userCommon', () => ({
    userInfo: useUserInfo(),
    token: useToken(),
    refreshToken: useRefreshToken(),
  }));
}
