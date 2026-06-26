/**
 * 客户端专用：hydration 后再次从 Cookie 同步 token，修复线上 payload 空 token 导致导航栏误显登录按钮
 */
import {
  refreshUserInfo,
  syncAuthTokensFromCookie,
  useAuthSession,
} from '@/composables/use-common';

export default defineNuxtPlugin({
  name: 'auth-token-client',
  setup(nuxtApp) {
    const { sync } = useAuthSession();

    const resync = () => {
      sync();
      if (useToken().value) {
        void refreshUserInfo();
      }
    };

    // payload hydration 后再同步一次
    nuxtApp.hook('app:mounted', () => {
      resync();
      nextTick(resync);
    });

    nuxtApp.hook('page:finish', () => {
      syncAuthTokensFromCookie();
    });
  },
});
