<script setup lang="ts">
/**
   * 全站 RPG 初始化 — 登录后拉取状态、连接 WebSocket、统一推送反馈
   *
   * WS 事件 → 全屏弹窗映射（其余事件仅 Toast，见 use-rpg-socket-handlers）：
   * - levelUp              → RpgLevelUpAnimation
   * - achievementComplete  → RpgAchievementAnimation
   * - masterpiece          → RpgMasterpieceAnimation
   */
import { useRpg } from '~~/composables/use-rpg';
import { useRpgSocket } from '~~/composables/use-rpg-socket';
import { useRpgSocketHandlers } from '~~/composables/use-rpg-socket-handlers';
import { messageInfo } from '@/utils/toast';

const token = useToken();
const userInfo = useUserInfo();

const { signInfo, fetchStatus, fetchSignInfo, fetchQuests, fetchBanStatus } = useRpg();
const { connect, disconnect } = useRpgSocket();

const {
  levelUpVisible,
  levelUpData,
  achievementVisible,
  achievementName,
  achievementExpReward,
  masterpieceVisible,
  masterpieceData,
  closeLevelUp,
  closeAchievement,
  closeMasterpiece,
} = useRpgSocketHandlers();

/** 登录后立即连 Socket，RPG 数据后台并行拉取 */
const initGlobalRpg = () => {
  if (!token.value || !userInfo.value?.uid) return;
  connect();
  void Promise.all([fetchStatus(), fetchSignInfo(), fetchQuests(), fetchBanStatus()]);
};

const teardown = () => {
  disconnect();
};

onMounted(() => {
  if (token.value && userInfo.value?.uid) {
    initGlobalRpg();
  }
});

watch(
  () => userInfo.value?.uid,
  (uid) => {
    if (uid && token.value) {
      initGlobalRpg();
    }
    else {
      teardown();
    }
  },
);

watch(token, (t) => {
  if (t && userInfo.value?.uid) {
    initGlobalRpg();
  }
  else {
    teardown();
  }
});

/** 首次进入且未签到时轻提示（每会话一次） */
const signHintShown = ref(false);
watch(
  signInfo,
  (info) => {
    if (signHintShown.value || !info || info.signedToday) return;
    signHintShown.value = true;
    messageInfo('📅 今日尚未签到，去冒险页签到领 EXP 吧！');
  },
  { immediate: true },
);
</script>

<template>
  <ClientOnly>
    <RpgQuestFloater />
    <RpgLevelUpAnimation
      :visible="levelUpVisible"
      :level-up-data="levelUpData"
      @close="closeLevelUp"
    />
    <RpgAchievementAnimation
      :visible="achievementVisible"
      :name="achievementName"
      :exp-reward="achievementExpReward"
      @close="closeAchievement"
    />
    <RpgMasterpieceAnimation
      :visible="masterpieceVisible"
      :data="masterpieceData"
      @close="closeMasterpiece"
    />
  </ClientOnly>
</template>
