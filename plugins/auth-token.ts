/**
 * 从 Cookie 同步 access/refresh token 到 useToken，保证 SSR 与客户端 hydration 登录态一致。
 * 客户端有 token 时拉取 userInfo，避免刷新后 uid 未写入导致误判未登录。
 * 读写统一走 utils/cookie.ts（js-cookie），勿用 useCookie 以免 SSR 覆盖登录 Cookie。
 */
import {
  refreshUserInfo,
  syncAuthTokensFromCookie,
  useAuthSession,
} from '@/composables/use-common';

export default defineNuxtPlugin({
  name: 'auth-token',
  enforce: 'pre',
  setup(nuxtApp) {
    const { sync } = useAuthSession();

    const bootstrapAuth = () => {
      syncAuthTokensFromCookie();
      if (import.meta.client && useToken().value) {
        void refreshUserInfo();
      }
    };

    bootstrapAuth();

    nuxtApp.hook('app:mounted', () => {
      sync();
      bootstrapAuth();
    });
  },
});
