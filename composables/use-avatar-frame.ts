import type { RpgStatus, AvatarFrameInfo } from '~~/types/rpg';

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
