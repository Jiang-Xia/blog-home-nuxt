/**
 * 区块视频：进视口才 play，离开 pause（减轻滚动卡顿）。
 */
export function useWelcomeInViewVideo(videoRef: Ref<HTMLVideoElement | null>) {
  onMounted(() => {
    const video = videoRef.value;
    if (!video) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.removeAttribute('autoplay');
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          void video.play().catch(() => {});
        }
        else {
          video.pause();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(video);
    onBeforeUnmount(() => io.disconnect());
  });
}
