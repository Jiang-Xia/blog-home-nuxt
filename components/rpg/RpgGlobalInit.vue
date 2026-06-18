<script setup lang="ts">
/**
   * 全站 RPG 初始化 — 登录后拉取状态、连接 WebSocket、推送成就/升级反馈
   */
import { useRpg } from '~~/composables/use-rpg';
import { useRpgSocket } from '~~/composables/use-rpg-socket';
import { messageInfo } from '@/utils/toast';
import type { LevelUpResult } from '~~/types/rpg';

const token = useToken();
const userInfo = useUserInfo();

const {
  rpgStatus,
  signInfo,
  fetchStatus,
  fetchSignInfo,
  fetchQuests,
  fetchBanStatus,
  fetchAchievements,
} = useRpg();

const { connect, disconnect, on } = useRpgSocket();

const levelUpVisible = ref(false);
const levelUpData = ref<LevelUpResult | null>(null);

const achievementVisible = ref(false);
const achievementName = ref('');
const achievementExpReward = ref(0);

on('levelUp', (data: LevelUpResult) => {
  levelUpData.value = data;
  levelUpVisible.value = true;
  if (rpgStatus.value) {
    rpgStatus.value.level = data.newLevel;
  }
  fetchStatus();
});

on('lifeChange', (data: { currentLife: number }) => {
  if (rpgStatus.value) {
    rpgStatus.value.lifeValue = data.currentLife;
  }
});

on(
  'achievementComplete',
  (data: { name?: string; achievementName?: string; expReward?: number }) => {
    achievementName.value = data.name || data.achievementName || '新成就';
    achievementExpReward.value = data.expReward ?? 0;
    achievementVisible.value = true;
    fetchAchievements();
    fetchQuests();
    fetchStatus();
  },
);

on('questReward', (data: { questName?: string; exp?: number; expReward?: number }) => {
  const label = data.questName ? `「${data.questName}」` : '任务';
  const exp = data.exp ?? data.expReward;
  messageInfo(`✨ ${label} 奖励已发放${exp ? ` +${exp} EXP` : ''}`);
  fetchQuests();
  fetchStatus();
});

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

const closeLevelUp = () => {
  levelUpVisible.value = false;
  levelUpData.value = null;
};

const closeAchievement = () => {
  achievementVisible.value = false;
  achievementName.value = '';
  achievementExpReward.value = 0;
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
    <RpgAchievementAnimation
      :visible="achievementVisible"
      :name="achievementName"
      :exp-reward="achievementExpReward"
      @close="closeAchievement"
    />
  </ClientOnly>
</template>
