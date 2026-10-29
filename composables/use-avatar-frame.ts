import type { RpgStatus, AvatarFrameInfo } from '~~/types/rpg';
import { RPG_ICON_ASSET_KEYS, RPG_ICON_RASTER_KEYS } from '~~/utils/rpg-item-asset';
import { resolveStaticUrl } from '~~/utils/static-url';

/** 从公开 loadout / userInfo 解析头像框展示信息 */
export function resolvePublicAvatarFrame(
  frame:
    | {
      code?: string;
      name?: string;
      color?: string | null;
      icon?: string | null;
      iconUrl?: string | null;
      effectJson?: { color?: string };
    }
    | null
    | undefined,
): AvatarFrameInfo | null {
  if (!frame) return null;
  const color = frame.color ?? frame.effectJson?.color ?? null;
  if (!frame.code && !frame.name && !color && !frame.icon && !frame.iconUrl) return null;
  return {
    code: frame.code ?? '',
    name: frame.name ?? frame.code ?? '',
    color,
    icon: frame.icon ?? null,
    iconUrl: frame.iconUrl ?? null,
  };
}

/** 从 RPG 状态解析当前应展示的头像框（仅已穿戴时返回，未穿戴无呼吸灯） */
export function resolveAvatarFrameFromRpgStatus(
  status: RpgStatus | null | undefined,
): AvatarFrameInfo | null {
  if (!status?.equippedAvatarFrame) return null;
  const equipped = status.unlockedAvatarFrames?.find(
    item => item.code === status.equippedAvatarFrame,
  );
  if (!equipped) return null;
  return {
    code: equipped.code,
    name: equipped.name,
    color: equipped.color ?? null,
    icon: equipped.icon ?? null,
    iconUrl: (equipped as { iconUrl?: string | null }).iconUrl ?? null,
  };
}

/** 当前登录用户的装备头像框（依赖 RpgGlobalInit 已拉取的 rpgStatus） */
export function useEquippedAvatarFrame() {
  const { rpgStatus } = useRpg();
  const frame = computed(() => resolveAvatarFrameFromRpgStatus(rpgStatus.value));
  return { frame, rpgStatus };
}

/**
 * 框图 png 的中心透明孔径占整图直径比例（实测，见 _scratch 量测脚本）。
 * 渲染时按 `scale = HOLE_TARGET / ratio` 缩放，使孔径 ≈ 头像直径的 94%（外圈压住头像边缘）。
 * 未登记的 icon 键走默认值。
 */
const FRAME_HOLE_RATIOS: Record<string, number> = {
  'frame-gold': 0.48,
  'frame-blue': 0.55,
  'frame-green': 0.64,
  'frame-purple': 0.62,
};
const FRAME_HOLE_DEFAULT_RATIO = 0.55;
/** 孔径相对头像直径的目标比例（略小于 1，让框圈压住头像边缘） */
const FRAME_HOLE_TARGET = 0.94;

/** 图片框渲染信息 */
export interface AvatarFrameArt {
  url: string;
  /** 框图边长 = 头像边长 × scale */
  scale: number;
}

/**
 * 解析头像框的图片渲染信息：优先管理端上传的 iconUrl，
 * 其次 icon 键命中本地 raster 资产（public/rpg/icons/frame-*.png）。
 * 都不命中时返回 null，调用方回退颜色光环。
 */
export function resolveAvatarFrameArt(
  icon?: string | null,
  iconUrl?: string | null,
): AvatarFrameArt | null {
  // 优先级 1：管理端上传的框图（孔径未知，按默认比例缩放）
  const uploaded = iconUrl?.trim();
  if (uploaded) {
    return {
      url: resolveStaticUrl(uploaded),
      scale: Math.round((FRAME_HOLE_TARGET / FRAME_HOLE_DEFAULT_RATIO) * 100) / 100,
    };
  }
  const key = icon?.trim();
  if (!key || key === 'default') return null;
  if (!RPG_ICON_ASSET_KEYS.has(key) || !RPG_ICON_RASTER_KEYS.has(key)) return null;
  const ratio = FRAME_HOLE_RATIOS[key] ?? FRAME_HOLE_DEFAULT_RATIO;
  return {
    url: `/rpg/icons/${key}.png`,
    scale: Math.round((FRAME_HOLE_TARGET / ratio) * 100) / 100,
  };
}
