<script setup lang="ts">
/**
   * RPG状态面板 - 展示等级、经验进度、生命值、头像框、称号、签到等信息
   */
import type { LevelUpResult, UserBuff } from '~~/types/rpg';
import { activateBuff, deactivateBuff } from '~~/api/rpg';
import { messageSuccess } from '~~/utils/toast';
import { formactDate } from '@/utils/common';
import { useRpg } from '~~/composables/use-rpg';
import { useRealtimeSocket } from '~~/composables/use-realtime-socket';

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
  fetchBuffs,
  buffs,
  hitRecords,
  hitRecordsTotal,
  initRpg,
} = useRpg();

const { on } = useRealtimeSocket();

// 升级弹窗（冒险页局部；全站弹窗由 RpgGlobalInit + useRpgRealtimeHandlers 负责）
const showLevelUp = ref(false);
const levelUpData = ref<LevelUpResult | null>(null);

/** 冒险页内升级动画；与全站 LevelUpAnimation 并存 */
on('levelUp', (data: LevelUpResult) => {
  levelUpData.value = data;
  showLevelUp.value = true;
});

/** 仅同步 HP，Toast 由 useRpgRealtimeHandlers 统一处理 */
on('lifeChange', (data: { lifeDeducted: number; currentLife: number }) => {
  if (rpgStatus.value) {
    rpgStatus.value.lifeValue = data.currentLife;
  }
});

/** 仅同步禁言状态，Toast 由 useRpgRealtimeHandlers 统一处理 */
on('banStatus', (data: any) => {
  if (banStatus.value) {
    banStatus.value.banned = data.banned;
    banStatus.value.banEndTime = data.banEndTime;
  }
});

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

const handleToggleBuff = async (
  buff: UserBuff & { triggerMode?: string; isActive?: boolean },
) => {
  if (buff.triggerMode !== 'manual') return;
  if (buff.isActive) await deactivateBuff(buff.id);
  else await activateBuff(buff.id);
  messageSuccess(buff.isActive ? '已停用' : '已激活');
  await fetchBuffs();
};

// 初始化RPG数据（WebSocket 由 RpgGlobalInit 统一连接）
onMounted(async () => {
  await initRpg();
});
</script>

<template>
  <div v-if="rpgStatus" class="rpg-panel">
    <!-- 角色专属标识 -->
    <div
      v-if="roleReward"
      class="role-badge"
      :style="{ borderColor: roleReward.avatarFrameColor || '#ccc' }"
    >
      <span class="role-frame" :style="{ color: roleReward.avatarFrameColor || '#ccc' }">🛡</span>
      <span class="role-title">{{ roleReward.titleName }}</span>
      <span class="role-frame-name">{{
        roleReward.avatarFrameName || roleReward.avatarFrame
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
        <span v-if="lastSignInResult.lifeRecovered" class="hp-tip">❤️ +{{ lastSignInResult.lifeRecovered }} 生命</span>
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
          :key="frame.code"
          class="frame-item"
          :style="{ borderColor: frame.color || '#ccc' }"
        >
          <span class="frame-icon" :style="{ color: frame.color || '#ccc' }"> 🖼 </span>
          <span class="frame-name">{{ frame.name }}</span>
        </div>
      </div>
    </div>

    <!-- 称号列表 -->
    <div v-if="rpgStatus.unlockedTitles?.length" class="titles-section">
      <div class="section-title">
        已获得称号
      </div>
      <div class="titles-list">
        <span v-for="title in rpgStatus.unlockedTitles" :key="title.code" class="title-badge">
          🏆 {{ title.name }}
        </span>
      </div>
    </div>

    <!-- Buff列表 -->
    <RpgBuffList :buffs="buffs" @toggle="handleToggleBuff" />

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
            {{ formactDate(hit.createTime) }}
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
    background: var(--rpg-card-gradient);
    border: 1px solid var(--rpg-border);
  }

  .role-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border-radius: 10px;
    border: 2px solid;
    background: var(--rpg-amber-bg-gradient);
    margin-bottom: 12px;
  }

  .role-frame {
    font-size: 18px;
  }

  .role-title {
    font-weight: 800;
    font-size: 14px;
    color: var(--rpg-amber-text);
  }

  .role-frame-name {
    font-size: 12px;
    color: var(--rpg-amber-text-soft);
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
    background: var(--rpg-level-badge-gradient);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 4px 12px var(--rpg-level-shadow);
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
    color: var(--rpg-text-label);
    margin-bottom: 6px;
  }

  .exp-progress-text {
    color: var(--rpg-text-muted);
    font-size: 12px;
  }

  .exp-bar {
    height: 8px;
    background: var(--rpg-track);
    border-radius: 4px;
    overflow: hidden;
  }

  .exp-bar-fill {
    height: 100%;
    background: var(--rpg-exp-gradient);
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
    color: var(--rpg-text-label);
    margin-bottom: 6px;
  }

  .life-value {
    font-weight: 700;
  }

  .life-bar {
    height: 10px;
    background: var(--rpg-track);
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
    color: var(--rpg-danger);
    font-weight: 600;
  }

  .sign-section {
    margin-bottom: 16px;
  }

  .sign-btn {
    padding: 8px 20px;
    border-radius: 8px;
    background: var(--rpg-primary-gradient);
    color: white;
    font-weight: 700;
    font-size: 14px;
    border: none;
    cursor: pointer;
    transition: opacity 0.2s;
    margin-bottom: 8px;
  }

  .sign-btn:disabled {
    background: var(--rpg-disabled);
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
    color: var(--rpg-text-secondary);
  }

  .consecutive-badge {
    background: var(--rpg-amber-bg);
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 600;
    color: var(--rpg-amber-text-soft);
    font-size: 12px;
  }

  .next-bonus-hint {
    margin-top: 4px;
    font-size: 11px;
    color: var(--rpg-amber);
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
    color: var(--rpg-amber-dark);
    font-weight: 600;
  }

  .hp-tip {
    color: var(--rpg-success);
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
    color: var(--rpg-text-label);
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
    background: var(--rpg-surface);
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
    background: var(--rpg-amber-bg);
    font-size: 12px;
    color: var(--rpg-amber-text);
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
    color: var(--rpg-text-muted);
    padding: 8px;
  }

  .hit-item {
    padding: 8px;
    border-radius: 6px;
    background: var(--rpg-surface);
    margin-bottom: 4px;
    border: 1px solid var(--rpg-border-subtle);
  }

  .hit-content {
    font-size: 12px;
    color: var(--rpg-text-body);
    margin-bottom: 2px;
    word-break: break-all;
  }

  .hit-words {
    font-size: 11px;
    color: var(--rpg-danger);
  }

  .hit-time {
    font-size: 10px;
    color: var(--rpg-text-muted);
    margin-top: 2px;
  }

  .rpg-loading {
    padding: 24px;
    text-align: center;
    color: var(--rpg-text-muted);
  }
</style>
