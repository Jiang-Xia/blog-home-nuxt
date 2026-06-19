const AUTH_PATHS = ['/user/profile', '/user/article/edit'];

export default defineNuxtRouteMiddleware((to) => {
  const needsAuth = AUTH_PATHS.some(path => to.path === path || to.path.startsWith(`${path}/`));
  if (!needsAuth) {
    return;
  }

  const token = useCookie('x-accessToken');
  if (!token.value) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    });
  }
});
