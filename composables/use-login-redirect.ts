/**
 * 登录后安全回跳 composable
 * - resolveRedirectPath：校验 redirect 为站内相对路径，防 open redirect
 * - goLogin：跳转 /login 并携带当前 fullPath
 */
/** 登录后安全回跳：仅允许站内相对路径 */
export function resolveRedirectPath(queryRedirect?: string | string[] | null): string {
  const raw = Array.isArray(queryRedirect) ? queryRedirect[0] : queryRedirect;
  if (!raw || typeof raw !== 'string') {
    return '/';
  }
  const path = raw.trim();
  if (!path.startsWith('/') || path.startsWith('//') || path.startsWith('/login')) {
    return '/';
  }
  return path;
}

/** 跳转登录页并携带当前路径（或指定路径）作为 redirect */
export async function goLogin(fallbackPath?: string) {
  const route = useRoute();
  const redirect = fallbackPath ?? route.fullPath;
  await navigateTo({
    path: '/login',
    query: { redirect },
  });
}

/** 组合式入口：绑定当前 route.query.redirect */
export function useLoginRedirect() {
  const route = useRoute();
  return {
    resolveRedirectPath: (queryRedirect?: string | string[] | null) =>
      resolveRedirectPath(queryRedirect ?? (route.query.redirect as string | undefined)),
    goLogin,
  };
}
