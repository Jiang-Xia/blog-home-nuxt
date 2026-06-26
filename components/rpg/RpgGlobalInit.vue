<script setup lang="ts">
/**
   * 全站 RPG 初始化 — 登录后拉取状态、连接 WebSocket、统一推送反馈
   *
   * WS 事件 → 全屏弹窗映射（其余事件仅 Toast，见 use-rpg-realtime-handlers）：
   * 抽奖动画进行中上述反馈延后至 DrawOverlay 关闭后播放（use-rpg-lottery-session）
   * - levelUp              → RpgLevelUpAnimation
   * - achievementComplete  → RpgAchievementAnimation
   * - masterpiece          → RpgMasterpieceAnimation
   * - socialReceived/tipReceived → RpgSocialFeedbackAnimation
   * - petHatched           → RpgPetHatchAnimation
   * - itemGranted（史诗/传说，非抽奖）→ RpgItemRevealAnimation
   * - rankChange           → RpgRankChangeAnimation
   * - questReward          → RpgQuestRewardAnimation
   * - questComplete        → RpgQuestCompleteBadge
   * - lifeChange/shieldUsed/buffGranted/buffExpired → RpgScreenPulseFx
   * - articleLevelUp       → RpgArticleLevelUpBadge
   * - currencyChange（≥50）  → RpgCurrencyGainFx
   * - activityUpdate（start）→ RpgActivityStartBanner
   * - banStatus（禁言）     → RpgBanPunishAnimation
   * - 钻石不足              → RpgRechargeDynamicModal（动态小程序码建单）
   */
import { useRpg } from '~~/composables/use-rpg';
import { useRealtimeSocket } from '~~/composables/use-realtime-socket';
import { useRpgRealtimeHandlers } from '~~/composables/use-rpg-realtime-handlers';
import { refreshUserInfo } from '@/composables/use-common';
import { syncUserLikes } from '@/utils/common';
import { messageInfo } from '@/utils/toast';

const token = useToken();
const userInfo = useUserInfo();
const { initAudio } = useRpgAudio();

const { signInfo, fetchStatus, fetchSignInfo, fetchQuests, fetchBanStatus } = useRpg();
const { connect, disconnect } = useRealtimeSocket();
const initInflight = ref<Promise<void> | null>(null);

const {
  levelUpVisible,
  levelUpData,
  achievementVisible,
  achievementName,
  achievementExpReward,
  achievementRarityColor,
  achievementRarityLabel,
  achievementRarityIcon,
  masterpieceVisible,
  masterpieceData,
  socialFeedbackVisible,
  socialFeedbackData,
  closeLevelUp,
  closeAchievement,
  closeMasterpiece,
  closeSocialFeedback,
  petHatchVisible,
  petHatchData,
  itemRevealVisible,
  itemRevealData,
  closePetHatch,
  closeItemReveal,
  rankChangeVisible,
  rankChangeData,
  closeRankChange,
  questRewardVisible,
  questRewardData,
  closeQuestReward,
  questCompleteVisible,
  questCompleteData,
  closeQuestComplete,
  screenPulseTick,
  screenPulseKind,
  screenPulseLabel,
  currencyGainTick,
  currencyGainData,
  activityBannerVisible,
  activityBannerData,
  closeActivityBanner,
  banPunishVisible,
  banPunishData,
  closeBanPunish,
  articleLevelUpVisible,
  articleLevelUpData,
  closeArticleLevelUp,
} = useRpgRealtimeHandlers();

const {
  visible: rechargeVisible,
  legacyVisible: rechargeLegacyVisible,
  closeRechargeModal,
  closeLegacyRechargeModal,
} = useRpgRecharge();

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
    await Promise.all([
      fetchStatus(),
      fetchSignInfo(),
      fetchQuests(),
      fetchBanStatus(),
      syncUserLikes(),
    ]);
  })().finally(() => {
    initInflight.value = null;
  });
  return initInflight.value;
};

const teardown = () => {
  disconnect();
};

onMounted(() => {
  void initAudio();
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

watch(token, (t, prev) => {
  if (t) {
    if (prev && prev !== t) {
      disconnect();
    }
    void initGlobalRpg();
  }
  else {
    teardown();
  }
});

onUnmounted(() => {
  teardown();
});

/** 首次进入且未签到时轻提示（每会话一次；挂载后再监听，避免 hydration 阶段 inject 失败） */
const signHintShown = ref(false);
onMounted(() => {
  watch(
    signInfo,
    (info) => {
      if (signHintShown.value || !info || info.signedToday) return;
      signHintShown.value = true;
      messageInfo('📅 今日尚未签到，去冒险页签到领 EXP 吧！');
    },
    { immediate: true },
  );
});
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
      :rarity-color="achievementRarityColor"
      :rarity-label="achievementRarityLabel"
      :rarity-icon="achievementRarityIcon"
      @close="closeAchievement"
    />
    <RpgMasterpieceAnimation
      :visible="masterpieceVisible"
      :data="masterpieceData"
      @close="closeMasterpiece"
    />
    <RpgSocialFeedbackAnimation
      :visible="socialFeedbackVisible"
      :data="socialFeedbackData"
      @close="closeSocialFeedback"
    />
    <RpgPetHatchAnimation :visible="petHatchVisible" :data="petHatchData" @close="closePetHatch" />
    <RpgItemRevealAnimation
      :visible="itemRevealVisible"
      :data="itemRevealData"
      @close="closeItemReveal"
    />
    <RpgRankChangeAnimation
      :visible="rankChangeVisible"
      :data="rankChangeData"
      @close="closeRankChange"
    />
    <RpgQuestRewardAnimation
      :visible="questRewardVisible"
      :data="questRewardData"
      @close="closeQuestReward"
    />
    <RpgQuestCompleteBadge
      :visible="questCompleteVisible"
      :data="questCompleteData"
      @close="closeQuestComplete"
    />
    <RpgScreenPulseFx :tick="screenPulseTick" :kind="screenPulseKind" :label="screenPulseLabel" />
    <RpgCurrencyGainFx :tick="currencyGainTick" :data="currencyGainData" />
    <RpgActivityStartBanner
      :visible="activityBannerVisible"
      :data="activityBannerData"
      @close="closeActivityBanner"
    />
    <RpgBanPunishAnimation
      :visible="banPunishVisible"
      :data="banPunishData"
      @close="closeBanPunish"
    />
    <RpgArticleLevelUpBadge
      :visible="articleLevelUpVisible"
      :data="articleLevelUpData"
      @close="closeArticleLevelUp"
    />
    <RpgRechargeDynamicModal :visible="rechargeVisible" @close="closeRechargeModal" />
    <!-- 归档组件：全站不再触发，/tool/test 可预览 -->
    <RpgRechargeModal :visible="rechargeLegacyVisible" @close="closeLegacyRechargeModal" />
  </ClientOnly>
</template>
