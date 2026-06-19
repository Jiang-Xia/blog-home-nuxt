<script setup lang="ts">
/**
   * 全站 RPG 初始化 — 登录后拉取状态、连接 WebSocket、统一推送反馈
   *
   * WS 事件 → 全屏弹窗映射（其余事件仅 Toast，见 use-rpg-realtime-handlers）：
   * - levelUp              → RpgLevelUpAnimation
   * - achievementComplete  → RpgAchievementAnimation
   * - masterpiece          → RpgMasterpieceAnimation
   */
import { useRpg } from '~~/composables/use-rpg';
import { useRealtimeSocket } from '~~/composables/use-realtime-socket';
import { useRpgRealtimeHandlers } from '~~/composables/use-rpg-realtime-handlers';
import { refreshUserInfo } from '@/composables/use-common';
import { messageInfo } from '@/utils/toast';

const token = useToken();
const userInfo = useUserInfo();

const { signInfo, fetchStatus, fetchSignInfo, fetchQuests, fetchBanStatus } = useRpg();
const { connect, disconnect } = useRealtimeSocket();
const initInflight = ref<Promise<void> | null>(null);

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
} = useRpgRealtimeHandlers();

/** 登录后立即连 Socket，用户信息与 RPG 数据并行拉取 */
const initGlobalRpg = () => {
  if (!token.value) return;
  if (initInflight.value) return initInflight.value;
  initInflight.value = (async () => {
    if (!userInfo.value?.uid) {
      await refreshUserInfo();
    }
    if (!token.value || !userInfo.value?.uid) return;
    connect();
    await Promise.all([fetchStatus(), fetchSignInfo(), fetchQuests(), fetchBanStatus()]);
  })().finally(() => {
    initInflight.value = null;
  });
  return initInflight.value;
};

const teardown = () => {
  disconnect();
};

onMounted(() => {
  if (token.value) {
    void initGlobalRpg();
  }
});

watch(
  () => userInfo.value?.uid,
  (uid) => {
    if (uid && token.value) {
      void initGlobalRpg();
    }
    else {
      teardown();
    }
  },
);

watch(token, (t) => {
  if (t) {
    void initGlobalRpg();
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
