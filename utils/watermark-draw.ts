/**
 * 水印 Canvas 绘制（主线程预览与 Worker 导出共用）。
 * 纯绘制与样式解析，不含解码/编码；文案由调用方传入以保证预览与导出一致。
 */

export type WatermarkPosition
  = | 'bottom'
    | 'top'
    | 'center'
    | 'bottom-left'
    | 'bottom-right'
    | 'tile';
export type FontSizeMode = 'auto' | 'manual';
export type WatermarkColorMode = 'white' | 'black' | 'custom';
export type WatermarkFontKey = 'harmony' | 'pingfang' | 'yahei' | 'song' | 'kaiti' | 'mono';
export type ExportFormat = 'png' | 'jpeg';

export interface WatermarkFontOption {
  value: WatermarkFontKey;
  label: string;
  family: string;
}

/** 字体下拉选项；family 须与主文档 @font-face / 系统字体一致 */
export const WATERMARK_FONT_OPTIONS: WatermarkFontOption[] = [
  { value: 'harmony', label: '鸿蒙 Sans（推荐）', family: 'HarmonyOS-Sans, sans-serif' },
  { value: 'pingfang', label: '苹方', family: '"PingFang SC", "Hiragino Sans GB", sans-serif' },
  { value: 'yahei', label: '微软雅黑', family: '"Microsoft YaHei", sans-serif' },
  { value: 'song', label: '宋体', family: '"Songti SC", SimSun, serif' },
  { value: 'kaiti', label: '楷体', family: '"Kaiti SC", KaiTi, STKaiti, serif' },
  { value: 'mono', label: '等宽', family: 'ui-monospace, "SF Mono", Consolas, monospace' },
];

export interface WatermarkStyle {
  position: WatermarkPosition;
  opacity: number;
  fontSizeMode: FontSizeMode;
  customFontSize: number;
  colorMode: WatermarkColorMode;
  customColor: string;
  rotation: number;
  fontFamily: WatermarkFontKey;
}

export interface ExportOptions {
  format: ExportFormat;
  jpegQuality: number;
}

interface WatermarkColors {
  fill: string;
  shadow: string;
}

/** 2D 上下文：HTMLCanvas 与 OffscreenCanvas 共用绘制 API */
export type WatermarkDrawContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

/** 解析 CSS font-family 字符串 */
export function resolveFontFamily(style: WatermarkStyle): string {
  return (
    WATERMARK_FONT_OPTIONS.find(opt => opt.value === style.fontFamily)?.family
    ?? WATERMARK_FONT_OPTIONS[0]!.family
  );
}

/** 组装 canvas `font` 属性 */
export function buildCanvasFont(fontSize: number, style: WatermarkStyle): string {
  return `${fontSize}px ${resolveFontFamily(style)}`;
}

/**
 * 预加载绘制用字体（主线程 document.fonts / Worker self.fonts）。
 * @param fonts FontFaceSet；不可用时跳过
 */
export async function ensureWatermarkFont(
  fonts: FontFaceSet | undefined,
  style: WatermarkStyle,
  fontSize: number,
): Promise<void> {
  if (!fonts) return;
  try {
    await fonts.load(buildCanvasFont(fontSize, style));
    await fonts.ready;
  }
  catch {
    // 系统字体或已加载字体失败时仍尝试绘制
  }
}

/**
 * 平铺未设角度时默认 -30°，与原先页面逻辑一致。
 */
export function resolveRotationDeg(style: WatermarkStyle): number {
  if (style.position === 'tile' && style.rotation === 0) {
    return -30;
  }
  return style.rotation;
}

/**
 * 拼接水印文案（自定义文字 + 可选日期）。
 * 导出时应在主线程调用后传入 Worker，避免预览与导出日期不一致。
 */
export function buildWatermarkText(customMark: string, withTime: boolean): string {
  const parts: string[] = [];
  const text = customMark.trim();
  if (text) {
    parts.push(text);
  }
  if (withTime) {
    parts.push(new Date().toLocaleDateString('zh-CN'));
  }
  return parts.join('  ');
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace('#', '').trim();
  if (normalized.length === 3) {
    return {
      r: Number.parseInt(normalized[0]! + normalized[0]!, 16),
      g: Number.parseInt(normalized[1]! + normalized[1]!, 16),
      b: Number.parseInt(normalized[2]! + normalized[2]!, 16),
    };
  }
  if (normalized.length === 6) {
    return {
      r: Number.parseInt(normalized.slice(0, 2), 16),
      g: Number.parseInt(normalized.slice(2, 4), 16),
      b: Number.parseInt(normalized.slice(4, 6), 16),
    };
  }
  return null;
}

function getWatermarkColors(style: WatermarkStyle): WatermarkColors {
  const alpha = Math.min(100, Math.max(20, style.opacity)) / 100;

  if (style.colorMode === 'black') {
    return {
      fill: `rgba(0, 0, 0, ${alpha})`,
      shadow: `rgba(255, 255, 255, ${alpha * 0.45})`,
    };
  }

  if (style.colorMode === 'custom') {
    const rgb = hexToRgb(style.customColor) ?? { r: 255, g: 255, b: 255 };
    return {
      fill: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`,
      shadow: `rgba(0, 0, 0, ${alpha * 0.4})`,
    };
  }

  return {
    fill: `rgba(255, 255, 255, ${alpha})`,
    shadow: `rgba(0, 0, 0, ${alpha * 0.5})`,
  };
}

/**
 * 计算水印字号。
 * @param scale 预览相对原图的缩放比；固定字号时按比例缩小
 */
export function resolveFontSize(
  width: number,
  height: number,
  style: WatermarkStyle,
  scale = 1,
): number {
  if (style.fontSizeMode === 'manual') {
    const px = (style.customFontSize || 30) * scale;
    return Math.min(120, Math.max(8, Math.round(px)));
  }
  return Math.max(16, Math.round(Math.min(width, height) * 0.04));
}

function drawTextWithShadow(
  ctx: WatermarkDrawContext,
  text: string,
  x: number,
  y: number,
  colors: WatermarkColors,
): void {
  ctx.fillStyle = colors.shadow;
  ctx.fillText(text, x + 1, y + 1);
  ctx.fillStyle = colors.fill;
  ctx.fillText(text, x, y);
}

function drawSingleWatermark(
  ctx: WatermarkDrawContext,
  text: string,
  width: number,
  height: number,
  style: WatermarkStyle,
  scale = 1,
): void {
  const fontSize = resolveFontSize(width, height, style, scale);
  const pad = Math.round(fontSize * 0.65);
  const colors = getWatermarkColors(style);
  const rotationRad = (resolveRotationDeg(style) * Math.PI) / 180;

  ctx.font = buildCanvasFont(fontSize, style);
  ctx.textBaseline = 'middle';

  let x = width / 2;
  let y = height - pad - fontSize / 2;
  let textAlign: CanvasTextAlign = 'center';

  switch (style.position) {
    case 'top':
      y = pad + fontSize / 2;
      break;
    case 'center':
      y = height / 2;
      break;
    case 'bottom-left':
      x = pad;
      y = height - pad - fontSize / 2;
      textAlign = 'left';
      break;
    case 'bottom-right':
      x = width - pad;
      y = height - pad - fontSize / 2;
      textAlign = 'right';
      break;
    default:
      break;
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotationRad);
  ctx.textAlign = textAlign;
  drawTextWithShadow(ctx, text, 0, 0, colors);
  ctx.restore();
}

function drawTiledWatermark(
  ctx: WatermarkDrawContext,
  text: string,
  width: number,
  height: number,
  style: WatermarkStyle,
  scale = 1,
): void {
  const fontSize = resolveFontSize(width, height, style, scale);
  const colors = getWatermarkColors(style);
  const rotationRad = (resolveRotationDeg(style) * Math.PI) / 180;

  ctx.save();
  ctx.font = buildCanvasFont(fontSize, style);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const textWidth = ctx.measureText(text).width;
  const gapX = textWidth + fontSize * 2;
  const gapY = fontSize * 3;
  const radius = Math.sqrt(width * width + height * height);

  ctx.translate(width / 2, height / 2);
  ctx.rotate(rotationRad);

  for (let y = -radius; y < radius; y += gapY) {
    for (let x = -radius; x < radius; x += gapX) {
      drawTextWithShadow(ctx, text, x, y, colors);
    }
  }

  ctx.restore();
}

/**
 * 在已绘制底图的 canvas 上叠水印层（单点或平铺）。
 * @param text 完整水印字符串；空则跳过
 */
export function drawWatermarkLayer(
  ctx: WatermarkDrawContext,
  width: number,
  height: number,
  style: WatermarkStyle,
  text: string,
  scale = 1,
): void {
  if (!text) return;

  if (style.position === 'tile') {
    drawTiledWatermark(ctx, text, width, height, style, scale);
    return;
  }

  drawSingleWatermark(ctx, text, width, height, style, scale);
}

/** 导出扩展名 */
export function getExportExtension(format: ExportFormat): string {
  return format === 'jpeg' ? 'jpg' : 'png';
}
