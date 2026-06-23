/**
 * 从 Cookie 同步 accessToken 到 useToken，保证 SSR 与客户端 hydration 登录态一致。
 * 客户端有 token 时拉取 userInfo，避免刷新后 uid 未写入导致误判未登录。
 */
import { TokenKey } from '@/utils/cookie';
import { refreshUserInfo } from '@/composables/use-common';

export default defineNuxtPlugin(() => {
  const token = useToken();
  const cookieToken = useCookie<string | null>(TokenKey);

  if (cookieToken.value) {
    token.value = cookieToken.value;
  }

  if (import.meta.client && token.value) {
    void refreshUserInfo();
  }
});
