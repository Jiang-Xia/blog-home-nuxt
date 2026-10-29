/**
 * lucky-canvas 示例类型
 */
export type LuckyDemoType = 'wheel' | 'grid' | 'slot';

export interface LuckyExternalButton {
  kind: 'button' | 'image';
  label: string;
  src?: string;
  /** 相对画布叠层定位（如滴滴老虎机按钮压在机台上） */
  overlay?: {
    width?: string;
    left?: string;
    top?: string;
  };
}

/** 传给 @lucky-canvas/vue 的画布配置（库本身类型较松，这里列常用键） */
export interface LuckyCanvasOptions {
  blocks?: unknown[];
  prizes?: unknown[];
  buttons?: unknown[];
  button?: unknown;
  slots?: unknown[];
  rows?: number;
  cols?: number;
  defaultStyle?: Record<string, unknown>;
  activeStyle?: Record<string, unknown>;
  defaultConfig?: Record<string, unknown>;
}

export interface LuckyDemoItem {
  id: string;
  title: string;
  type: LuckyDemoType;
  width: string;
  height: string;
  /** 画布外触发抽奖（老虎机等无内嵌按钮时） */
  externalButton: LuckyExternalButton | null;
  options: LuckyCanvasOptions;
}
