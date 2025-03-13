type W = { _hmt: any };
declare const window: Window & W;
export default defineNuxtPlugin(() => {
  const router = useRouter();
  // console.log("router:", router);
  /* 每次路由变更时进行pv统计 */
  router.afterEach((to: any) => {
    /* 告诉增加一个PV */
    try {
      // console.log({hm:window._hmt})
      window._hmt = window._hmt || [];
      window._hmt.push(['_trackPageview', to.fullPath]);
    }
    catch (e) {}
  });
});
