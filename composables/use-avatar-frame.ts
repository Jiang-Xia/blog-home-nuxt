import type { RpgStatus, AvatarFrameInfo } from '~~/types/rpg';

/** 从公开 loadout / userInfo 解析头像框展示信息 */
export function resolvePublicAvatarFrame(
  frame:
    | {
      code?: string;
      name?: string;
      color?: string | null;
      effectJson?: { color?: string };
    }
    | null
    | undefined,
): AvatarFrameInfo | null {
  if (!frame) return null;
  const color = frame.color ?? frame.effectJson?.color ?? null;
  if (!frame.code && !frame.name && !color) return null;
  return {
    code: frame.code ?? '',
    name: frame.name ?? frame.code ?? '',
    color,
  };
}

/** 从 RPG 状态解析当前应展示的头像框（优先装备框，其次角色专属框） */
export function resolveAvatarFrameFromRpgStatus(
  status: RpgStatus | null | undefined,
): AvatarFrameInfo | null {
  if (!status) return null;
  const equippedCode = status.equippedAvatarFrame;
  if (equippedCode) {
    const equipped = status.unlockedAvatarFrames?.find(item => item.code === equippedCode);
    if (equipped) {
      return {
        code: equipped.code,
        name: equipped.name,
        color: equipped.color ?? null,
      };
    }
  }
  const roleReward = status.roleReward;
  if (roleReward?.avatarFrameColor) {
    return {
      code: roleReward.avatarFrame,
      name: roleReward.avatarFrameName || roleReward.avatarFrame,
      color: roleReward.avatarFrameColor,
    };
  }
  return null;
}

/** 当前登录用户的装备头像框（需先 fetchStatus） */
export function useEquippedAvatarFrame() {
  const { rpgStatus, fetchStatus } = useRpg();
  const frame = computed(() => resolveAvatarFrameFromRpgStatus(rpgStatus.value));
  return { frame, fetchStatus, rpgStatus };
}
