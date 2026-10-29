/**
 * lucky-canvas 工具页示例目录（聚合入口）
 *
 * - 改某个示例：打开 `wheel.ts` / `grid.ts` / `slot.ts`
 * - 图片：public/lucky-canvas/{type}/{id}/imgs/
 * - 素材来源 100px.net / buuing；仅供学习，禁止商用与赌博相关用途
 */
import { GRID_DEMOS } from './grid';
import { SLOT_DEMOS } from './slot';
import { WHEEL_DEMOS } from './wheel';
import type { LuckyDemoItem, LuckyDemoType } from './types';

export type {
  LuckyDemoItem,
  LuckyDemoType,
  LuckyExternalButton,
  LuckyCanvasOptions,
} from './types';
export { asset, GRID_AXIS } from './helpers';

/** 全部示例（大转盘 → 九宫格 → 老虎机） */
export const LUCKY_DEMOS: LuckyDemoItem[] = [...WHEEL_DEMOS, ...GRID_DEMOS, ...SLOT_DEMOS];

export const LUCKY_DEMO_TABS: { key: LuckyDemoType | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'wheel', label: '大转盘' },
  { key: 'grid', label: '九宫格' },
  { key: 'slot', label: '老虎机' },
];
