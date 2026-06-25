import type { RarityDisplayFields } from '~~/types/rpg';

/** 稀有度 tier（与抽奖奖池 rarity 英文字段对齐） */
export type RarityTier = 'common' | 'rare' | 'epic' | 'legendary';

/** 普通/银色主色（与后端 RARITY_DISPLAY.common.color 对齐） */
export const RARITY_SILVER_COLOR = '#c8d4e0';

const LABEL_TO_TIER: Record<string, RarityTier> = {
  普通: 'common',
  稀有: 'rare',
  史诗: 'epic',
  传说: 'legendary',
};

/** 后端标准稀有度色 → tier（色值识别时用） */
const KNOWN_RARITY_COLORS: Record<string, RarityTier> = {
  '#c8d4e0': 'common',
  '#3b82f6': 'rare',
  '#8b5cf6': 'epic',
  '#f59e0b': 'legendary',
};

/** API 中文 rarityLabel → tier code */
export function rarityLabelToTier(rarityLabel?: string): RarityTier {
  return LABEL_TO_TIER[rarityLabel ?? ''] ?? 'common';
}

/** 奖池/物品英文字段 rarity → tier code */
export function rarityCodeToTier(rarity: string): RarityTier {
  if (rarity === 'legendary') return 'legendary';
  if (rarity === 'epic') return 'epic';
  if (rarity === 'rare') return 'rare';
  return 'common';
}

/** 是否为普通（银色）稀有度 */
export function isCommonRarity(rarity?: string | null, rarityLabel?: string | null): boolean {
  if (rarity === 'common') return true;
  if (rarityLabel === '普通') return true;
  return false;
}

/** 稀有度色是否为银色（与 common 标准色一致） */
export function isSilverRarityColor(color?: string | null): boolean {
  if (!color) return false;
  return color.toLowerCase() === RARITY_SILVER_COLOR.toLowerCase();
}

/** 是否应用银色金属样式（tier 或色值） */
export function shouldUseSilverRarityStyle(fields: RarityDisplayFields): boolean {
  return (
    isCommonRarity(fields.rarity, fields.rarityLabel) || isSilverRarityColor(fields.rarityColor)
  );
}

/** 从 API 字段解析稀有度 tier；无法识别时返回 null */
export function resolveRarityTier(fields: RarityDisplayFields): RarityTier | null {
  if (shouldUseSilverRarityStyle(fields)) return 'common';
  if (fields.rarity) return rarityCodeToTier(fields.rarity);
  if (fields.rarityLabel) {
    const tier = LABEL_TO_TIER[fields.rarityLabel];
    if (tier) return tier;
  }
  if (fields.rarityColor) {
    return KNOWN_RARITY_COLORS[fields.rarityColor.toLowerCase()] ?? null;
  }
  return null;
}

/**
 * 金属质感线性渐变（四档 CSS 与自定义色 inline 共用算法）
 * @param stops 依次为高光、浅主色、主色、暗部、边缘反光
 */
export function buildRarityMetallicGradient(
  highlight: string,
  light: string,
  main: string,
  shadow: string,
  edge: string,
): string {
  return `linear-gradient(145deg, ${highlight} 0%, ${light} 28%, ${main} 55%, ${shadow} 78%, ${edge} 100%)`;
}

/** 由单色推导金属渐变（未知稀有度色值兜底） */
export function buildRarityMetallicBadgeStyle(color: string): Record<string, string> {
  return {
    background: buildRarityMetallicGradient(
      `${color}40`,
      `${color}cc`,
      color,
      `${color}99`,
      `${color}55`,
    ),
    color,
    borderColor: color,
  };
}

/** 稀有度徽章展示：标准 tier 走 CSS class，未知色值走统一渐变 inline */
export function getRarityBadgePresentation(fields: RarityDisplayFields): {
  class?: string;
  style?: Record<string, string>;
} {
  const tier = resolveRarityTier(fields);
  if (tier) {
    return { class: `rpg-rarity-badge--${tier}` };
  }
  return {
    style: buildRarityMetallicBadgeStyle(fields.rarityColor || getRarityFallbackColor()),
  };
}

/** 稀有度徽章 CSS class */
export function getRarityBadgeClass(fields: RarityDisplayFields): string | undefined {
  return getRarityBadgePresentation(fields).class;
}

/** 稀有度徽章 inline 样式（仅未知色值） */
export function getRarityInlineStyle(
  fields: RarityDisplayFields,
): Record<string, string> | undefined {
  return getRarityBadgePresentation(fields).style;
}

/** 稀有度展示色回退（无 API 字段时） */
export function getRarityFallbackColor(): string {
  return RARITY_SILVER_COLOR;
}

/** 非抽奖来源的史诗/传说物品是否应全屏揭晓 */
export function shouldShowItemRevealCelebration(rarityLabel?: string): boolean {
  const tier = rarityLabelToTier(rarityLabel);
  return tier === 'epic' || tier === 'legendary';
}

/** 排行榜名次 → 彩带强度 tier（Top10 WS rankChange） */
export function rankToConfettiTier(rank: number): RarityTier {
  if (rank === 1) return 'legendary';
  if (rank <= 3) return 'epic';
  return 'rare';
}

/** 揭晓卡片光晕（box-shadow 值） */
export function getRarityGlow(tier: RarityTier): string {
  const map: Record<RarityTier, string> = {
    common: '0 0 28px rgba(200, 212, 224, 0.45)',
    rare: '0 0 36px rgba(59, 130, 246, 0.55)',
    epic: '0 0 48px rgba(139, 92, 246, 0.65)',
    legendary: '0 0 60px rgba(245, 158, 11, 0.85)',
  };
  return map[tier];
}

/** 奖池 rarity 英文字段 → 揭晓光晕 */
export function getRarityGlowByCode(rarity: string): string {
  return getRarityGlow(rarityCodeToTier(rarity));
}
