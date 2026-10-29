/**
 * lucky-canvas 配置小助手
 */
import type { LuckyDemoType } from './types';

/** 九宫格外围 8 格坐标（顺时针，从左上起） */
export const GRID_AXIS: Array<[number, number]> = [
  [0, 0],
  [1, 0],
  [2, 0],
  [2, 1],
  [2, 2],
  [1, 2],
  [0, 2],
  [0, 1],
];

/** 拼 public 下静态图路径：/lucky-canvas/{type}/{id}/imgs/{file} */
export function asset(type: LuckyDemoType, id: string, file: string): string {
  return `/lucky-canvas/${type}/${id}/imgs/${file}`;
}
