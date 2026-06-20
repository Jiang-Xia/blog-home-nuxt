/** 全站图片弹框预览（单图 / 多图） */
export interface ImagePreviewState {
  open: boolean;
  images: string[];
  initialIndex: number;
  /** simple：仅查看；full：旋转/翻转等完整工具栏 */
  mode: 'simple' | 'full';
}

const state = reactive<ImagePreviewState>({
  open: false,
  images: [],
  initialIndex: 0,
  mode: 'simple',
});

export function useImagePreview() {
  const open = (src: string | string[], options?: { index?: number; mode?: 'simple' | 'full' }) => {
    const images = (Array.isArray(src) ? src : [src]).filter(Boolean);
    if (!images.length) return;
    const index = Math.min(Math.max(options?.index ?? 0, 0), images.length - 1);
    state.images = images;
    state.initialIndex = index;
    state.mode = options?.mode ?? (images.length > 1 ? 'full' : 'simple');
    state.open = true;
  };

  const close = () => {
    state.open = false;
  };

  return { state, open, close };
}

/** Markdown 预览区内图片点击放大（支持同文多图切换） */
export function useMarkdownImagePreview(rootRef: Ref<HTMLElement | undefined | null>) {
  const { open } = useImagePreview();

  const onClick = (event: MouseEvent) => {
    const root = rootRef.value;
    if (!root) return;
    const img = (event.target as HTMLElement | null)?.closest('img');
    if (!img || !root.contains(img)) return;
    const src = img.getAttribute('src');
    if (!src) return;
    event.preventDefault();
    event.stopPropagation();
    const images = [...root.querySelectorAll<HTMLImageElement>('img')]
      .map(el => el.getAttribute('src'))
      .filter((url): url is string => Boolean(url));
    const index = images.indexOf(src);
    open(images, { index: index >= 0 ? index : 0, mode: images.length > 1 ? 'full' : 'simple' });
  };

  onMounted(() => {
    rootRef.value?.addEventListener('click', onClick);
  });

  onBeforeUnmount(() => {
    rootRef.value?.removeEventListener('click', onClick);
  });
}
