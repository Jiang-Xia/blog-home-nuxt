/**
 * 从 Cookie 同步 accessToken 到 useToken，保证 SSR 与客户端 hydration 登录态一致。
 * nav.vue 仅在 client 脚本中读 Cookie，会导致已登录用户 SSR 渲染未登录 UI。
 */
import { TokenKey } from '@/utils/cookie';

export default defineNuxtPlugin(() => {
  const token = useToken();
  const cookieToken = useCookie<string | null>(TokenKey);

  if (cookieToken.value) {
    token.value = cookieToken.value;
  }
});
