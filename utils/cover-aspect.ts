/**
 * 封面展示尺寸常量（无压缩 / worker 副作用）。
 * 列表与详情页只引本文件，避免首页拉入 media-compress worker。
 */

/** 封面压缩输出尺寸（Open Graph 分享图标准 1200×630），也是各端封面展示宽高比的唯一来源 */
export const COVER_IMAGE = {
  maxWidth: 1200,
  maxHeight: 630,
} as const;

/** 供 CSS `aspect-ratio: v-bind(...)` 使用 */
export const coverAspectRatio = `${COVER_IMAGE.maxWidth} / ${COVER_IMAGE.maxHeight}`;
