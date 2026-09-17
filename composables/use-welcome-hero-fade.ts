/**
 * Hero 背景片：片尾淡出再从头淡入循环（rAF 改 opacity，不做滚动 seek）。
 * 副作用：挂载后绑 canplay / timeupdate / ended；卸载清理。
 */
export function useWelcomeHeroFade(videoRef: Ref<HTMLVideoElement | null>) {
  const failed = ref(false);
  let fading = false;
  let endFadeStarted = false;
  let raf = 0;

  /** 在 durationMs 内把 opacity 从 from 插值到 to */
  const animateOpacity = (from: number, to: number, durationMs: number) => {
    const video = videoRef.value;
    if (!video) return Promise.resolve();
    fading = true;
    const start = performance.now();
    return new Promise<void>((resolve) => {
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs);
        video.style.opacity = String(from + (to - from) * t);
        if (t < 1) {
          raf = requestAnimationFrame(step);
        }
        else {
          fading = false;
          resolve();
        }
      };
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(step);
    });
  };

  const onCanPlay = async () => {
    const video = videoRef.value;
    if (!video || Number(video.style.opacity) > 0) return;
    try {
      await video.play();
      endFadeStarted = false;
      await animateOpacity(0, 1, 500);
    }
    catch {
      failed.value = true;
    }
  };

  const onTimeUpdate = () => {
    const video = videoRef.value;
    if (!video || fading || endFadeStarted || !video.duration) return;
    if (video.duration - video.currentTime <= 0.55) {
      endFadeStarted = true;
      void animateOpacity(Number(video.style.opacity || 1), 0, 500);
    }
  };

  const onEnded = async () => {
    const video = videoRef.value;
    if (!video) return;
    video.style.opacity = '0';
    await new Promise(r => setTimeout(r, 100));
    video.currentTime = 0;
    endFadeStarted = false;
    try {
      await video.play();
      await animateOpacity(0, 1, 500);
    }
    catch {
      failed.value = true;
    }
  };

  const onError = () => {
    failed.value = true;
  };

  onBeforeUnmount(() => {
    cancelAnimationFrame(raf);
  });

  return { failed, onCanPlay, onTimeUpdate, onEnded, onError };
}
