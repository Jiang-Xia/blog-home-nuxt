/**
 * RPG 物品图标资产解析
 * 仅读 public/rpg/icons/{icon}.png|.webp|.svg，无需后端额外字段
 *
 * 换美术图：同 icon 键覆盖文件即可，如 dragon.png 优先于 dragon.svg
 */
import type { RpgItemIconSource } from '~~/utils/rpg-item-icon';

/** 已在 public/rpg/icons/ 提供文件的 icon 键；新增资产后在此登记 */
export const RPG_ICON_ASSET_KEYS = new Set([
  'slime',
  'fox',
  'dragon',
  'phoenix',
  'egg',
  'exp',
  'gem',
  'ticket',
  'scroll',
  'frame-green',
  'frame-blue',
  'frame-purple',
  'frame-gold',
  'starburst',
  'medal-bronze',
  'medal-silver',
  'medal-gold',
  'crown',
  'quill',
  'shield',
  'sun',
  'rainbow',
  'moon',
  'cat',
]);

const RASTER_EXT = ['png', 'webp'] as const;
const VECTOR_EXT = ['svg'] as const;

/** icon 键是否有本地静态资产（无则跳过图片请求，直接用 emoji） */
export function hasRpgIconAsset(key?: string | null): boolean {
  const normalized = key?.trim();
  return !!normalized && normalized !== 'default' && RPG_ICON_ASSET_KEYS.has(normalized);
}

/** 按 icon 键生成本地候选 URL（Raster 优先，便于 png 覆盖 svg 占位） */
export function buildLocalIconAssetUrls(key: string): string[] {
  const base = `/rpg/icons/${key}`;
  return [
    ...RASTER_EXT.map(ext => `${base}.${ext}`),
    ...VECTOR_EXT.map(ext => `${base}.${ext}`),
  ];
}

/** 构建图片候选链；组件内 @error 依次尝试，耗尽后回退 emoji */
export function buildRpgItemAssetCandidates(source?: RpgItemIconSource | null): string[] {
  if (!source) return [];
  const key = source.icon?.trim();
  if (!key || key === 'default' || !hasRpgIconAsset(key)) return [];
  return buildLocalIconAssetUrls(key);
}
