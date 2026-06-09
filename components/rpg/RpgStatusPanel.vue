<script setup lang="ts">
/**
   * RPG状态面板 - 展示等级、经验进度、生命值、头像框、称号、签到等信息
   */
import { AVATAR_FRAME_MAP, TITLE_NAME_MAP } from '~~/types/rpg';
import type { LevelUpResult, SignInResult } from '~~/types/rpg';
import { useRpg } from '~~/composables/use-rpg';
import { useRpgSocket } from '~~/composables/use-rpg-socket';

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
  fetchHitRecords,
  hitRecords,
  hitRecordsTotal,
  initRpg,
} = useRpg();

const { connected, connect, onLevelUp, onLifeChange, onBanStatus } = useRpgSocket();

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
  // uid由 nav.vue 异步获取，用watch等待
  watch(
    () => userInfo.value?.uid,
    (uid) => {
      if (uid) connect(uid);
    },
    { immediate: true },
  );
});
</script>

<template>
  <div v-if="rpgStatus" class="rpg-panel">
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

    <!-- 等级与经验区域 -->
    <div class="rpg-header">
      <div class="level-badge">
        <span class="lv-text">LV</span>
        <span class="lv-num">{{ rpgStatus.level }}</span>
      </div>
      <div class="exp-section">
        <div class="exp-label">
          经验值: {{ rpgStatus.exp }}
          <span class="exp-progress-text">
            ({{ expProgress.current }}/{{ expProgress.required }})
          </span>
        </div>
        <div class="exp-bar">
          <div class="exp-bar-fill" :style="{ width: expProgress.percent + '%' }" />
        </div>
      </div>
    </div>

    <!-- 生命值区域 -->
    <div class="life-section">
      <div class="life-label">
        <span>生命值</span>
        <span class="life-value" :style="{ color: lifeColor }">
          {{ rpgStatus.lifeValue }}/100
        </span>
      </div>
      <div class="life-bar">
        <div
          class="life-bar-fill"
          :style="{ width: lifePercent + '%', backgroundColor: lifeColor }"
        />
      </div>
      <div v-if="isBanned" class="ban-inline">
        🔇 禁言中 · 剩余 {{ banRemainingText }}
      </div>
    </div>

    <!-- 签到区域 -->
    <div class="sign-section">
      <button
        class="sign-btn"
        :disabled="signInfo?.signedToday || signingIn || isBanned"
        @click="handleSignIn"
      >
        {{ signInfo?.signedToday ? '今日已签到' : signingIn ? '签到中...' : '签到 +10经验' }}
      </button>
      <div class="sign-stats">
        <span>累计 {{ signInfo?.totalSignDays ?? 0 }} 天</span>
        <span v-if="signInfo?.consecutiveSignDays" class="consecutive-badge">
          🔥 连续 {{ signInfo.consecutiveSignDays }} 天
        </span>
      </div>
      <!-- 下一个连续奖励提示 -->
      <div v-if="signInfo?.nextBonusAt && !signInfo.signedToday" class="next-bonus-hint">
        再连续签到 {{ signInfo.nextBonusAt - (signInfo.consecutiveSignDays || 0) }} 天解锁额外奖励
      </div>
      <!-- 签到成功提示 -->
      <div
        v-if="lastSignInResult?.bonusExp || lastSignInResult?.lifeRecovered"
        class="sign-result-tip"
      >
        <span v-if="lastSignInResult.bonusExp" class="bonus-tip">🎁 {{ lastSignInResult.bonusLabel }} +{{ lastSignInResult.bonusExp }}经验</span>
        <span v-if="lastSignInResult.lifeRecovered" class="hp-tip">❤️ +{{ lastSignInResult.lifeRecovered }} HP</span>
      </div>
    </div>

    <!-- 头像框列表 -->
    <div v-if="rpgStatus.unlockedAvatarFrames?.length" class="frames-section">
      <div class="section-title">
        已解锁头像框
      </div>
      <div class="frames-list">
        <div
          v-for="frame in rpgStatus.unlockedAvatarFrames"
          :key="frame"
          class="frame-item"
          :style="{ borderColor: AVATAR_FRAME_MAP[frame]?.color || '#ccc' }"
        >
          <span class="frame-icon" :style="{ color: AVATAR_FRAME_MAP[frame]?.color }"> 🖼 </span>
          <span class="frame-name">{{ AVATAR_FRAME_MAP[frame]?.name || frame }}</span>
        </div>
      </div>
    </div>

    <!-- 称号列表 -->
    <div v-if="rpgStatus.unlockedTitles?.length" class="titles-section">
      <div class="section-title">
        已获得称号
      </div>
      <div class="titles-list">
        <span v-for="title in rpgStatus.unlockedTitles" :key="title" class="title-badge">
          🏆 {{ TITLE_NAME_MAP[title] || title }}
        </span>
      </div>
    </div>

    <!-- Buff列表 -->
    <RpgBuffList />

    <!-- 敏感词命中记录 -->
    <div class="hits-section">
      <div class="section-title clickable" @click="toggleHitRecords">
        敏感词记录 ({{ hitRecordsTotal }}次)
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
  .rpg-panel {
    max-width: 1080px;
    padding: 24px;
    border-radius: 16px;
    background: linear-gradient(135deg, #f8fafc, #f1f5f9);
    border: 1px solid #e2e8f0;
  }

  .role-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border-radius: 10px;
    border: 2px solid;
    background: linear-gradient(135deg, #fef9c3, #fde68a);
    margin-bottom: 12px;
  }

  .role-frame {
    font-size: 18px;
  }

  .role-title {
    font-weight: 800;
    font-size: 14px;
    color: #92400e;
  }

  .role-frame-name {
    font-size: 12px;
    color: #b45309;
    margin-left: auto;
  }

  .rpg-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
  }

  .level-badge {
    flex-shrink: 0;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #fbbf24, #d97706);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
  }

  .lv-text {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1px;
  }

  .lv-num {
    font-size: 20px;
    font-weight: 900;
    line-height: 1;
  }

  .exp-section {
    flex: 1;
  }

  .exp-label {
    font-size: 13px;
    color: #475569;
    margin-bottom: 6px;
  }

  .exp-progress-text {
    color: #94a3b8;
    font-size: 12px;
  }

  .exp-bar {
    height: 8px;
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

  .life-section {
    margin-bottom: 16px;
  }

  .life-label {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: #475569;
    margin-bottom: 6px;
  }

  .life-value {
    font-weight: 700;
  }

  .life-bar {
    height: 10px;
    background: #e2e8f0;
    border-radius: 5px;
    overflow: hidden;
  }

  .life-bar-fill {
    height: 100%;
    border-radius: 5px;
    transition:
      width 0.5s ease,
      background-color 0.5s ease;
  }

  .ban-inline {
    margin-top: 6px;
    font-size: 12px;
    color: #dc2626;
    font-weight: 600;
  }

  .sign-section {
    margin-bottom: 16px;
  }

  .sign-btn {
    padding: 8px 20px;
    border-radius: 8px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    font-weight: 700;
    font-size: 14px;
    border: none;
    cursor: pointer;
    transition: opacity 0.2s;
    margin-bottom: 8px;
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
    align-items: center;
    gap: 12px;
    font-size: 13px;
    color: #64748b;
  }

  .consecutive-badge {
    background: #fef3c7;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 600;
    color: #b45309;
    font-size: 12px;
  }

  .next-bonus-hint {
    margin-top: 4px;
    font-size: 11px;
    color: #f59e0b;
    font-weight: 500;
  }

  .sign-result-tip {
    display: flex;
    gap: 12px;
    margin-top: 6px;
    font-size: 12px;
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

  .section-title {
    font-size: 13px;
    font-weight: 600;
    color: #475569;
    margin-bottom: 8px;
  }

  .clickable {
    cursor: pointer;
    user-select: none;
  }

  .toggle-icon {
    font-size: 10px;
    margin-left: 4px;
  }

  .frames-list {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }

  .frame-item {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 6px;
    border: 2px solid;
    background: white;
    font-size: 12px;
  }

  .titles-list {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }

  .title-badge {
    padding: 4px 10px;
    border-radius: 6px;
    background: #fef3c7;
    font-size: 12px;
    color: #92400e;
    font-weight: 600;
  }

  .hits-section {
    margin-top: 8px;
  }

  .hits-list {
    max-height: 200px;
    overflow-y: auto;
  }

  .hits-empty {
    font-size: 12px;
    color: #94a3b8;
    padding: 8px;
  }

  .hit-item {
    padding: 8px;
    border-radius: 6px;
    background: white;
    margin-bottom: 4px;
    border: 1px solid #f1f5f9;
  }

  .hit-content {
    font-size: 12px;
    color: #374151;
    margin-bottom: 2px;
    word-break: break-all;
  }

  .hit-words {
    font-size: 11px;
    color: #dc2626;
  }

  .hit-time {
    font-size: 10px;
    color: #94a3b8;
    margin-top: 2px;
  }

  .rpg-loading {
    padding: 24px;
    text-align: center;
    color: #94a3b8;
  }
</style>
