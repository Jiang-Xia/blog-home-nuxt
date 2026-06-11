<script setup lang="ts">
/**
   * 个人空间RPG综合卡片 - 整合等级、成就、任务、Buff等所有RPG数据
   */
import {
  AVATAR_FRAME_MAP,
  TITLE_NAME_MAP,
  ACHIEVEMENT_ICON_MAP,
  BUFF_TYPE_MAP,
} from '~~/types/rpg';
import type { LevelUpResult, SignInResult } from '~~/types/rpg';
import { messageInfo, messageSuccess } from '~~/utils/toast';
import { useRpg } from '~~/composables/use-rpg';
import { useRpgSocket } from '~~/composables/use-rpg-socket';
import RpgQuestPanel from './QuestPanel.vue';
import RpgAchievementPanel from './AchievementPanel.vue';
import RpgBuffList from './BuffList.vue';

const {
  rpgStatus,
  signInfo,
  banStatus,
  expProgress,
  lifeColor,
  lifePercent,
  isBanned,
  roleReward,
  banRemainingText,
  signingIn,
  signIn,
  completedAchievementCount,
  questProgressText,
  claimableQuests,
  activeBuffCount,
  initRpg,
  fetchHitRecords,
  fetchAchievements,
  fetchQuests,
  fetchBuffs,
  fetchStatus,
  hitRecords,
  hitRecordsTotal,
} = useRpg();

const {
  connect,
  onLevelUp,
  onLifeChange,
  onBanStatus,
  onAchievementComplete,
  onQuestReward,
  onBuffGranted,
} = useRpgSocket();

// 升级弹窗
const showLevelUp = ref(false);
const levelUpData = ref<LevelUpResult | null>(null);

// WebSocket事件处理
onLevelUp.value = (data: LevelUpResult) => {
  levelUpData.value = data;
  showLevelUp.value = true;
};

onLifeChange.value = (data: { lifeDeducted: number; currentLife: number }) => {
  if (rpgStatus.value) {
    rpgStatus.value.lifeValue = data.currentLife;
  }
};

onBanStatus.value = (data: any) => {
  if (banStatus.value) {
    banStatus.value.banned = data.banned;
    banStatus.value.banEndTime = data.banEndTime;
  }
};

onAchievementComplete.value = (data: { name: string; expReward: number }) => {
  messageSuccess(`🏆 成就达成：${data.name} +${data.expReward} EXP`);
  fetchAchievements();
  fetchStatus();
};

onQuestReward.value = (data: { questName: string; expReward: number }) => {
  messageSuccess(`📋 任务奖励：${data.questName} +${data.expReward} EXP`);
  fetchQuests();
  fetchStatus();
};

onBuffGranted.value = (data: { name: string; description?: string }) => {
  messageInfo(`✨ 获得 Buff：${data.name}`);
  fetchBuffs();
};

// 签到
const lastSignInResult = ref<any>(null);
const handleSignIn = async () => {
  const result = await signIn();
  lastSignInResult.value = result;
  if (result?.levelUp) {
    levelUpData.value = result.levelUp;
    showLevelUp.value = true;
  }
};

// 当前激活的 Tab
type RpgTab = 'quests' | 'achievements' | 'buffs';
const activeTab = ref<RpgTab>('quests');

const switchTab = (tab: RpgTab) => {
  activeTab.value = tab;
};

// 命中记录
const showHitRecords = ref(false);
const toggleHitRecords = async () => {
  showHitRecords.value = !showHitRecords.value;
  if (showHitRecords.value && hitRecords.value.length === 0) {
    await fetchHitRecords();
  }
};

// 初始化RPG数据 + 连接WebSocket
const userInfo = useUserInfo();
onMounted(async () => {
  await initRpg();
  watch(
    () => userInfo.value?.uid,
    (uid) => {
      if (uid) connect();
    },
    { immediate: true },
  );
});
</script>

<template>
  <div v-if="rpgStatus" class="rpg-card">
    <!-- 角色专属标识 -->
    <div
      v-if="roleReward"
      class="role-badge"
      :style="{ borderColor: AVATAR_FRAME_MAP[roleReward.avatarFrame]?.color || '#ccc' }"
    >
      <span class="role-frame" :style="{ color: AVATAR_FRAME_MAP[roleReward.avatarFrame]?.color }">🛡</span>
      <span class="role-title">{{ roleReward.titleName }}</span>
      <span class="role-frame-name">{{
        AVATAR_FRAME_MAP[roleReward.avatarFrame]?.name || roleReward.avatarFrame
      }}</span>
    </div>

    <!-- 禁言警告 -->
    <RpgBanWarning :ban-status="banStatus" />

    <!-- 等级与头像区域 -->
    <div class="card-header">
      <div class="level-badge">
        <span class="lv-text">LV</span>
        <span class="lv-num">{{ rpgStatus.level }}</span>
      </div>
      <div class="header-info">
        <div class="exp-row">
          <span class="exp-label">累计经验</span>
          <span class="exp-num">{{ rpgStatus.exp.toLocaleString() }}</span>
        </div>
        <div class="exp-row exp-level-row">
          <span class="exp-label">Lv{{ rpgStatus.level }} → Lv{{ rpgStatus.level + 1 }}</span>
          <span class="exp-fraction">{{ expProgress.current }} / {{ expProgress.required }}</span>
        </div>
        <div class="exp-bar">
          <div class="exp-bar-fill" :style="{ width: expProgress.percent + '%' }" />
        </div>
      </div>
    </div>

    <!-- 生命值 -->
    <div class="life-row">
      <span class="life-icon">❤️</span>
      <div class="life-bar-wrap">
        <div class="life-bar">
          <div
            class="life-bar-fill"
            :style="{ width: lifePercent + '%', backgroundColor: lifeColor }"
          />
        </div>
      </div>
      <span class="life-num" :style="{ color: lifeColor }">{{ rpgStatus.lifeValue }}</span>
    </div>

    <!-- 签到区域 -->
    <div class="sign-row">
      <button
        class="sign-btn"
        :disabled="signInfo?.signedToday || signingIn || isBanned"
        @click="handleSignIn"
      >
        {{ signInfo?.signedToday ? '✓ 已签到' : signingIn ? '...' : '签到 +10EXP' }}
      </button>
      <div class="sign-stats">
        <span class="stat">📅 {{ signInfo?.totalSignDays ?? 0 }}天</span>
        <span v-if="signInfo?.consecutiveSignDays" class="stat streak">🔥 {{ signInfo.consecutiveSignDays }}天</span>
      </div>
      <div
        v-if="lastSignInResult?.bonusExp || lastSignInResult?.lifeRecovered"
        class="sign-result-tip"
      >
        <span v-if="lastSignInResult.bonusExp" class="bonus-tip">🎁 +{{ lastSignInResult.bonusExp }}EXP</span>
        <span v-if="lastSignInResult.lifeRecovered" class="hp-tip">❤️ +{{ lastSignInResult.lifeRecovered }}HP</span>
      </div>
    </div>

    <!-- 数据概览 / Tab 切换 -->
    <div class="stats-bar" role="tablist" aria-label="RPG 数据面板">
      <button
        type="button"
        role="tab"
        class="stat-item"
        :class="{ active: activeTab === 'achievements' }"
        :aria-selected="activeTab === 'achievements'"
        @click="switchTab('achievements')"
      >
        <span class="stat-num">{{ completedAchievementCount }}</span>
        <span class="stat-label">成就</span>
      </button>
      <button
        type="button"
        role="tab"
        class="stat-item"
        :class="{ active: activeTab === 'quests' }"
        :aria-selected="activeTab === 'quests'"
        @click="switchTab('quests')"
      >
        <span class="stat-num">{{ questProgressText }}</span>
        <span class="stat-label">任务</span>
        <span v-if="claimableQuests.length" class="stat-badge">{{ claimableQuests.length }}</span>
      </button>
      <button
        type="button"
        role="tab"
        class="stat-item"
        :class="{ active: activeTab === 'buffs' }"
        :aria-selected="activeTab === 'buffs'"
        @click="switchTab('buffs')"
      >
        <span class="stat-num">{{ activeBuffCount }}</span>
        <span class="stat-label">Buff</span>
      </button>
    </div>

    <!-- Tab 内容 -->
    <div class="rpg-panels">
      <div v-show="activeTab === 'quests'" class="rpg-panel" role="tabpanel">
        <RpgQuestPanel />
      </div>
      <div v-show="activeTab === 'achievements'" class="rpg-panel" role="tabpanel">
        <RpgAchievementPanel />
      </div>
      <div v-show="activeTab === 'buffs'" class="rpg-panel" role="tabpanel">
        <RpgBuffList />
      </div>
    </div>

    <!-- 头像框 & 称号 -->
    <div
      v-if="rpgStatus.unlockedAvatarFrames?.length || rpgStatus.unlockedTitles?.length"
      class="collections"
    >
      <div v-if="rpgStatus.unlockedAvatarFrames?.length" class="collection-row">
        <span class="collection-label">🖼 头像框</span>
        <div class="collection-items">
          <span
            v-for="frame in rpgStatus.unlockedAvatarFrames"
            :key="frame"
            class="collection-tag"
            :style="{
              borderColor: AVATAR_FRAME_MAP[frame]?.color,
              color: AVATAR_FRAME_MAP[frame]?.color,
            }"
          >
            {{ AVATAR_FRAME_MAP[frame]?.name || frame }}
          </span>
        </div>
      </div>
      <div v-if="rpgStatus.unlockedTitles?.length" class="collection-row">
        <span class="collection-label">🏆 称号</span>
        <div class="collection-items">
          <span
            v-for="title in rpgStatus.unlockedTitles"
            :key="title"
            class="collection-tag title-tag"
          >
            {{ TITLE_NAME_MAP[title] || title }}
          </span>
        </div>
      </div>
    </div>

    <!-- 敏感词记录 -->
    <div class="hits-toggle">
      <div class="section-title clickable" @click="toggleHitRecords">
        敏感词记录 ({{ hitRecordsTotal }})
        <span class="toggle-icon">{{ showHitRecords ? '▼' : '▶' }}</span>
      </div>
      <div v-if="showHitRecords" class="hits-list">
        <div v-if="hitRecords.length === 0" class="hits-empty">
          暂无记录
        </div>
        <div v-for="hit in hitRecords" :key="hit.id" class="hit-item">
          <div class="hit-content">
            {{ hit.content }}
          </div>
          <div class="hit-words">
            命中: {{ hit.hitWords }}
          </div>
          <div class="hit-time">
            {{ hit.createTime }}
          </div>
        </div>
      </div>
    </div>

    <!-- 升级动画 -->
    <RpgLevelUpAnimation
      :visible="showLevelUp"
      :level-up-data="levelUpData"
      @close="showLevelUp = false"
    />
  </div>
  <div v-else class="rpg-loading">
    加载中...
  </div>
</template>

<style scoped>
  .rpg-card {
    width: 100%;
    padding: 16px;
    border-radius: 16px;
    background: linear-gradient(135deg, #f8fafc, #f1f5f9);
    border: 1px solid #e2e8f0;
  }

  .role-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 10px;
    border: 2px solid;
    background: linear-gradient(135deg, #fef9c3, #fde68a);
    margin-bottom: 12px;
  }

  .role-frame {
    font-size: 16px;
  }
  .role-title {
    font-weight: 800;
    font-size: 13px;
    color: #92400e;
  }
  .role-frame-name {
    font-size: 11px;
    color: #b45309;
    margin-left: auto;
  }

  /* Header: level + exp */
  .card-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 12px;
  }

  .level-badge {
    flex-shrink: 0;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: linear-gradient(135deg, #fbbf24, #d97706);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 3px 10px rgba(217, 119, 6, 0.3);
  }

  .lv-text {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 1px;
  }
  .lv-num {
    font-size: 18px;
    font-weight: 900;
    line-height: 1;
  }

  .header-info {
    flex: 1;
  }

  .exp-row {
    display: flex;
    align-items: baseline;
    gap: 6px;
    margin-bottom: 5px;
  }

  .exp-level-row {
    margin-bottom: 5px;
  }

  .exp-label {
    font-size: 12px;
    color: #64748b;
  }
  .exp-num {
    font-size: 15px;
    font-weight: 800;
    color: #1e293b;
  }
  .exp-fraction {
    font-size: 11px;
    color: #94a3b8;
  }

  .exp-bar {
    height: 7px;
    background: #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
  }

  .exp-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #fbbf24, #f59e0b);
    border-radius: 4px;
    transition: width 0.5s ease;
  }

  /* Life */
  .life-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  .life-icon {
    font-size: 14px;
  }

  .life-bar-wrap {
    flex: 1;
  }

  .life-bar {
    height: 8px;
    background: #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
  }

  .life-bar-fill {
    height: 100%;
    border-radius: 4px;
    transition:
      width 0.5s ease,
      background-color 0.5s ease;
  }

  .life-num {
    font-size: 13px;
    font-weight: 700;
    min-width: 28px;
    text-align: right;
  }

  /* Sign */
  .sign-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }

  .sign-btn {
    padding: 6px 16px;
    border-radius: 8px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    font-weight: 700;
    font-size: 13px;
    border: none;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .sign-btn:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }
  .sign-btn:not(:disabled):hover {
    opacity: 0.9;
  }

  .sign-stats {
    display: flex;
    gap: 10px;
    font-size: 12px;
    color: #64748b;
  }

  .stat.streak {
    background: #fef3c7;
    padding: 1px 6px;
    border-radius: 4px;
    font-weight: 600;
    color: #b45309;
  }

  .sign-result-tip {
    display: flex;
    gap: 8px;
    font-size: 11px;
    animation: fadeInTip 0.4s ease;
  }

  .bonus-tip {
    color: #d97706;
    font-weight: 600;
  }
  .hp-tip {
    color: #16a34a;
    font-weight: 600;
  }

  @keyframes fadeInTip {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Stats bar */
  .stats-bar {
    display: flex;
    justify-content: space-around;
    padding: 10px 0;
    margin-bottom: 10px;
    border-top: 1px solid #e2e8f0;
    border-bottom: 1px solid #e2e8f0;
  }

  .stat-item {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 6px 4px;
    border: none;
    border-radius: 8px;
    background: transparent;
    cursor: pointer;
    transition:
      background-color 0.2s,
      color 0.2s;
  }

  .stat-item:hover {
    background: #f1f5f9;
  }

  .stat-item.active {
    background: #ede9fe;
  }

  .stat-item.active .stat-num {
    color: #7c3aed;
  }

  .stat-item.active .stat-label {
    color: #7c3aed;
    font-weight: 600;
  }

  .stat-num {
    font-size: 16px;
    font-weight: 800;
    color: #1e293b;
  }
  .stat-label {
    font-size: 10px;
    color: #94a3b8;
    margin-top: 1px;
  }

  .stat-badge {
    position: absolute;
    top: 0;
    right: 4px;
    background: #ef4444;
    color: white;
    font-size: 9px;
    font-weight: 700;
    min-width: 14px;
    height: 14px;
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 3px;
  }

  .rpg-panels {
    margin-bottom: 12px;
  }

  .rpg-panel {
    padding: 10px;
    border-radius: 10px;
    background: white;
    border: 1px solid #e2e8f0;
  }

  /* Collections */
  .collections {
    margin-bottom: 10px;
  }

  .collection-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  .collection-label {
    font-size: 11px;
    color: #64748b;
    white-space: nowrap;
    min-width: 52px;
  }

  .collection-items {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .collection-tag {
    padding: 2px 8px;
    border-radius: 5px;
    border: 1.5px solid;
    font-size: 11px;
    font-weight: 600;
    background: white;
  }

  .title-tag {
    border-color: #fbbf24;
    background: #fef3c7;
    color: #92400e;
  }

  /* Hits */
  .hits-toggle {
    margin-top: 8px;
  }

  .section-title {
    font-size: 12px;
    font-weight: 600;
    color: #475569;
    margin-bottom: 6px;
  }

  .clickable {
    cursor: pointer;
    user-select: none;
  }
  .toggle-icon {
    font-size: 9px;
    margin-left: 4px;
  }

  .hits-list {
    max-height: 180px;
    overflow-y: auto;
  }

  .hits-empty {
    font-size: 11px;
    color: #94a3b8;
    padding: 6px;
  }

  .hit-item {
    padding: 6px;
    border-radius: 5px;
    background: white;
    margin-bottom: 3px;
    border: 1px solid #f1f5f9;
  }

  .hit-content {
    font-size: 11px;
    color: #374151;
    word-break: break-all;
  }
  .hit-words {
    font-size: 10px;
    color: #dc2626;
  }
  .hit-time {
    font-size: 9px;
    color: #94a3b8;
    margin-top: 1px;
  }

  .rpg-loading {
    padding: 24px;
    text-align: center;
    color: #94a3b8;
  }
</style>
