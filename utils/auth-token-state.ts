/**
 * access/refresh token 读取与 state 回写（无 API 依赖，供 request 与 composable 共用）
 */
import { TokenKey, RefreshTokenKey, getToken, getTokenFromCookieHeader } from '@/utils/cookie';

/** 读取 accessToken：优先 state，客户端回退 Cookie 并回写 state */
export function readAccessToken(): string {
  const token = useToken();
  if (token.value) return token.value;
  if (import.meta.client) {
    const stored = getToken(TokenKey);
    if (stored) token.value = stored;
    return stored || '';
  }
  return getTokenFromCookieHeader(useRequestHeaders(['cookie']).cookie, TokenKey) || '';
}

/** 读取 refreshToken：优先 state，客户端回退 Cookie 并回写 state */
export function readRefreshToken(): string {
  const refreshToken = useRefreshToken();
  if (refreshToken.value) return refreshToken.value;
  if (import.meta.client) {
    const stored = getToken(RefreshTokenKey);
    if (stored) refreshToken.value = stored;
    return stored || '';
  }
  return getTokenFromCookieHeader(useRequestHeaders(['cookie']).cookie, RefreshTokenKey) || '';
}
