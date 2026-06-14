<script setup lang="ts">
/**
   * 全站 RPG 初始化 — 登录后拉取状态、连接 WebSocket、推送成就/升级反馈
   */
import { useRpg } from '~~/composables/use-rpg';
import { useRpgSocket } from '~~/composables/use-rpg-socket';
import { messageSuccess, messageInfo } from '@/utils/toast';
import type { LevelUpResult } from '~~/types/rpg';

const token = useToken();
const userInfo = useUserInfo();

const { rpgStatus, signInfo, fetchStatus, fetchSignInfo, fetchQuests, fetchBanStatus } = useRpg();

const { connect, disconnect, onLevelUp, onLifeChange, onAchievementComplete, onQuestReward }
  = useRpgSocket();

const levelUpVisible = ref(false);
const levelUpData = ref<LevelUpResult | null>(null);

onLevelUp.value = (data: LevelUpResult) => {
  levelUpData.value = data;
  levelUpVisible.value = true;
  if (rpgStatus.value) {
    rpgStatus.value.level = data.newLevel;
  }
  fetchStatus();
};

onLifeChange.value = (data: { currentLife: number }) => {
  if (rpgStatus.value) {
    rpgStatus.value.lifeValue = data.currentLife;
  }
};

onAchievementComplete.value = (data: { name?: string; achievementName?: string }) => {
  const name = data.name || data.achievementName || '新成就';
  messageSuccess(`🏆 成就达成：${name}`);
  fetchQuests();
};

onQuestReward.value = (data: { questName?: string; exp?: number }) => {
  const label = data.questName ? `「${data.questName}」` : '任务';
  messageSuccess(`✨ ${label} 奖励已发放${data.exp ? ` +${data.exp} EXP` : ''}`);
  fetchQuests();
  fetchStatus();
};

const initGlobalRpg = async () => {
  if (!token.value || !userInfo.value?.uid) return;
  await Promise.all([fetchStatus(), fetchSignInfo(), fetchQuests(), fetchBanStatus()]);
  connect();
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

const closeLevelUp = () => {
  levelUpVisible.value = false;
  levelUpData.value = null;
};

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
  </ClientOnly>
</template>
