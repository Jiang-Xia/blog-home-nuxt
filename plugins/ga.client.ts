type W = { _hmt: any[] };
declare const window: Window & W;

export default defineNuxtPlugin(() => {
  const router = useRouter();
  router.afterEach((to: any) => {
    try {
      window._hmt = window._hmt || [];
      window._hmt.push(['_trackPageview', to.fullPath]);
    }
    catch {}
  });
});
