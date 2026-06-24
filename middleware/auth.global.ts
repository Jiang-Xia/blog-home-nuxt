import { TokenKey, getToken, getTokenFromCookieHeader } from '@/utils/cookie';

const AUTH_PATHS = ['/user/profile', '/user/article/edit'];

export default defineNuxtRouteMiddleware((to) => {
  const needsAuth = AUTH_PATHS.some(path => to.path === path || to.path.startsWith(`${path}/`));
  if (!needsAuth) {
    return;
  }

  const accessToken = import.meta.client
    ? getToken(TokenKey)
    : getTokenFromCookieHeader(useRequestHeaders(['cookie']).cookie);

  if (!accessToken) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    });
  }
});
