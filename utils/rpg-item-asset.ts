/**
 * RPG 物品图标资产解析
 * 加载顺序：API iconUrl → public/rpg/icons → emoji（icon 键用于占位与回退）
 */
import type { RpgItemIconSource } from '~~/utils/rpg-item-icon';
import { resolveStaticUrl } from '~~/utils/static-url';

/** 已在 public/rpg/icons/ 提供文件的 icon 键；新增本地占位后在此登记 */
export const RPG_ICON_ASSET_KEYS = new Set([
  'board',
  'bookmark',
  'bookmarks',
  'books',
  'calendar',
  'calendar-check',
  'cat',
  'chat',
  'crown',
  'crown-star',
  'diamond',
  'dragon',
  'egg',
  'exp',
  'fire',
  'flame',
  'fox',
  'frame-blue',
  'frame-gold',
  'frame-green',
  'frame-purple',
  'gem',
  'heart',
  'hearts',
  'library',
  'medal-bronze',
  'medal-gold',
  'medal-silver',
  'megaphone',
  'moon',
  'pen',
  'phoenix',
  'quill',
  'rainbow',
  'reply',
  'scroll',
  'share',
  'shield',
  'slime',
  'star',
  'starburst',
  'stars',
  'sun',
  'ticket',
  'trophy',
]);

const RASTER_EXT = ['png', 'webp'] as const;
const VECTOR_EXT = ['svg'] as const;

/**
 * 已有 png/webp 成图的 icon 键。
 * 未登记时仅请求 svg 占位，避免首页等场景对不存在的 raster 产生 404。
 */
export const RPG_ICON_RASTER_KEYS = new Set<string>([]);

export interface RpgItemAssetOptions {
  /** 后端 enrich 的上传图标 URL，优先于 public/rpg/icons */
  iconUrl?: string | null;
  /** 后端 enrich 的上传背景 URL，用于 RpgItemIcon 底图 */
  bgUrl?: string | null;
}

/** icon 键是否有本地静态资产（无则跳过图片请求，直接用 emoji） */
export function hasRpgIconAsset(key?: string | null): boolean {
  const normalized = key?.trim();
  return !!normalized && normalized !== 'default' && RPG_ICON_ASSET_KEYS.has(normalized);
}

/** 按 icon 键生成本地候选 URL（有 raster 时优先，便于 png 覆盖 svg 占位） */
export function buildLocalIconAssetUrls(key: string): string[] {
  const base = `/rpg/icons/${key}`;
  const urls: string[] = [];
  if (RPG_ICON_RASTER_KEYS.has(key)) {
    urls.push(...RASTER_EXT.map(ext => `${base}.${ext}`));
  }
  urls.push(...VECTOR_EXT.map(ext => `${base}.${ext}`));
  return urls;
}

/** 构建图片候选链（iconUrl → 本地 icons）；空数组时 RpgItemIcon 回退 emoji */
export function buildRpgItemAssetCandidates(
  source?: RpgItemIconSource | null,
  options?: RpgItemAssetOptions,
): string[] {
  const urls: string[] = [];
  // 优先级 1：管理端上传资产（/static/rpgAssets/itemIcon）
  if (options?.iconUrl) {
    urls.push(resolveStaticUrl(options.iconUrl));
  }
  if (!source) return urls;
  const key = source.icon?.trim();
  if (!key || key === 'default') return urls;
  // 优先级 2：home 本地占位 public/rpg/icons/
  if (hasRpgIconAsset(key)) {
    urls.push(...buildLocalIconAssetUrls(key));
  }
  return urls;
}

/** 解析背景图 URL（管理端上传的 itemBg） */
export function resolveRpgItemBgUrl(bgUrl?: string | null): string | undefined {
  if (!bgUrl) return undefined;
  return resolveStaticUrl(bgUrl);
}
