import type { DrawResult, LotteryPoolItem } from '~~/types/rpg';

export interface ReelStripItem {
  id: string;
  name: string;
  rarity: string;
  icon?: string;
  itemTypeIcon?: string;
  rarityLabel?: string;
  rarityColor?: string;
  rarityIcon?: string;
}

export interface ReelStripPlan {
  strip: ReelStripItem[];
  targetIndex: number;
}

const DEFAULT_ITEM_WIDTH = 88;
const DEFAULT_ITEM_GAP = 8;

/** 过滤未关联系统物品的奖池脏数据（与后端 getPool 一致，前端防御） */
export function filterLinkedLotteryPool(pool: LotteryPoolItem[]): LotteryPoolItem[] {
  return pool.filter(item => item.itemLinked !== false);
}

/** 奖池条目 → 滚轮展示项 */
export function poolItemToReelItem(item: LotteryPoolItem, suffix = ''): ReelStripItem {
  return {
    id: `${item.id}${suffix}`,
    name: item.name,
    rarity: item.rarity,
    icon: item.icon,
    itemTypeIcon: item.itemTypeIcon,
    rarityLabel: item.rarityLabel,
    rarityColor: item.rarityColor,
    rarityIcon: item.rarityIcon,
  };
}

/** 抽奖结果 → 滚轮展示项 */
export function drawItemToReelItem(item: DrawResult['item'], suffix = ''): ReelStripItem {
  return {
    id: `${item.code}${suffix}`,
    name: item.name,
    rarity: item.rarity,
    icon: item.icon,
    itemTypeIcon: item.itemTypeIcon,
    rarityLabel: item.rarityLabel,
    rarityColor: item.rarityColor,
    rarityIcon: item.rarityIcon,
  };
}

/**
 * 构建滚轮条带：前置随机奖池项 + 中奖位 + 尾部填充，用于减速停靠动画。
 */
export function buildReelStrip(
  pool: LotteryPoolItem[],
  winner: DrawResult['item'],
  spinLoops = 24,
): ReelStripPlan {
  const source
    = pool.length > 0
      ? pool
      : [
          {
            id: 0,
            itemCode: winner.code,
            name: winner.name,
            description: winner.description || '',
            grantType: winner.type,
            probability: 0,
            rarity: winner.rarity,
            active: true,
            sort: 0,
            icon: winner.icon,
            itemTypeIcon: winner.itemTypeIcon,
            rarityLabel: winner.rarityLabel,
            rarityColor: winner.rarityColor,
            rarityIcon: winner.rarityIcon,
          },
        ];

  const strip: ReelStripItem[] = [];
  for (let i = 0; i < spinLoops; i++) {
    const pick = source[i % source.length]!;
    strip.push(poolItemToReelItem(pick, `-${i}`));
  }

  const targetIndex = strip.length;
  strip.push(drawItemToReelItem(winner, '-win'));

  for (let i = 0; i < 4; i++) {
    const pick = source[(targetIndex + i) % source.length]!;
    strip.push(poolItemToReelItem(pick, `-tail-${i}`));
  }

  return { strip, targetIndex };
}

/** 计算滚轮停靠 translateX（px），使 targetIndex 居中于 viewport */
export function calcReelOffset(
  targetIndex: number,
  viewportWidth: number,
  itemWidth = DEFAULT_ITEM_WIDTH,
  itemGap = DEFAULT_ITEM_GAP,
): number {
  const stride = itemWidth + itemGap;
  const itemCenter = targetIndex * stride + itemWidth / 2;
  return itemCenter - viewportWidth / 2;
}

/**
 * 基于已渲染 DOM 测量停靠偏移，避免 flex/gap/边框与常量宽度不一致导致框不对齐。
 */
export function measureReelTargetOffset(
  stripEl: HTMLElement,
  targetIndex: number,
  viewportWidth: number,
): number | null {
  const targetEl = stripEl.children.item(targetIndex) as HTMLElement | null;
  if (!targetEl) return null;
  const itemCenter = targetEl.offsetLeft + targetEl.offsetWidth / 2;
  return itemCenter - viewportWidth / 2;
}

export const LOTTERY_REEL_ITEM_WIDTH = DEFAULT_ITEM_WIDTH;
export const LOTTERY_REEL_ITEM_GAP = DEFAULT_ITEM_GAP;

/** 电商抽奖节奏：滚动约 2~2.5s，停稳后停留 0.8~1s */
export const LOTTERY_SPIN_MS = 2200;
export const LOTTERY_SPIN_MS_COMPACT_BASE = 1200;
export const LOTTERY_SPIN_MS_COMPACT_STAGGER = 380;
export const LOTTERY_PAUSE_MS = 900;
export const LOTTERY_PAUSE_MS_MULTI = 1000;
export const LOTTERY_SPIN_LOOPS = 28;
export const LOTTERY_SPIN_LOOPS_COMPACT = 20;
export const LOTTERY_SPIN_FALLBACK_BUFFER_MS = 500;

/** 五连每条滚轮的时长（逐条略错开，末条约 2.4s） */
export function getCompactSpinDurationMs(index: number): number {
  return LOTTERY_SPIN_MS_COMPACT_BASE + index * LOTTERY_SPIN_MS_COMPACT_STAGGER;
}

/** spinning 阶段兜底超时（滚动 + 停留 + buffer） */
export function getSpinPhaseFallbackMs(drawCount: number, isMulti: boolean): number {
  if (!isMulti) {
    return LOTTERY_SPIN_MS + LOTTERY_PAUSE_MS + LOTTERY_SPIN_FALLBACK_BUFFER_MS;
  }
  const lastIdx = Math.max(drawCount - 1, 0);
  return (
    getCompactSpinDurationMs(lastIdx) + LOTTERY_PAUSE_MS_MULTI + LOTTERY_SPIN_FALLBACK_BUFFER_MS
  );
}

export type LotteryDrawPhase = 'charging' | 'spinning' | 'reveal' | 'summary';

/** 按稀有度返回庆祝强度（confetti 数量等） */
export function getRarityCelebrationTier(rarity: string): 'common' | 'rare' | 'epic' | 'legendary' {
  if (rarity === 'legendary') return 'legendary';
  if (rarity === 'epic') return 'epic';
  if (rarity === 'rare') return 'rare';
  return 'common';
}

/** 多连抽结果中的最高稀有度 */
export function getBestRarityTier(results: DrawResult[]): 'common' | 'rare' | 'epic' | 'legendary' {
  const order = ['common', 'rare', 'epic', 'legendary'] as const;
  let best = 0;
  for (const r of results) {
    const idx = order.indexOf(getRarityCelebrationTier(r.item.rarity));
    if (idx > best) best = idx;
  }
  return order[best]!;
}
