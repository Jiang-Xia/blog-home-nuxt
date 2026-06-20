/** 稀有度 tier（与抽奖奖池 rarity 英文字段对齐） */
export type RarityTier = 'common' | 'rare' | 'epic' | 'legendary';

const LABEL_TO_TIER: Record<string, RarityTier> = {
  普通: 'common',
  稀有: 'rare',
  史诗: 'epic',
  传说: 'legendary',
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
    common: '0 0 24px rgba(148, 163, 184, 0.35)',
    rare: '0 0 36px rgba(59, 130, 246, 0.55)',
    epic: '0 0 48px rgba(139, 92, 246, 0.65)',
    legendary: '0 0 60px rgba(245, 158, 11, 0.85)',
  };
  return map[tier];
}
