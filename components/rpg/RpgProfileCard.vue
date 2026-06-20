<script setup lang="ts">
/**
   * 个人空间RPG综合卡片 - 整合等级、成就、任务、Buff等所有RPG数据（纯展示 + 事件上报）
   */
import type {
  BanStatus,
  RpgStatus,
  SensitiveHitRecord,
  SignInfo,
  SignInResult,
  UserAchievementProgress,
  UserBuff,
  UserQuestProgress,
} from '~~/types/rpg';
import { getRpgLifeColor } from '~~/composables/use-rpg-theme';
import { formactDate } from '@/utils/common';
import RpgQuestPanel from './QuestPanel.vue';
import RpgAchievementPanel from './AchievementPanel.vue';
import RpgBuffList from './BuffList.vue';

const props = defineProps<{
  rpgStatus: RpgStatus;
  signInfo: SignInfo | null;
  banStatus: BanStatus | null;
  achievements: UserAchievementProgress[];
  questGroups: {
    daily: UserQuestProgress[];
    bounty: UserQuestProgress[];
    special: UserQuestProgress[];
  };
  buffs: UserBuff[];
  hitRecords: SensitiveHitRecord[];
  hitRecordsTotal: number;
  signingIn: boolean;
}>();

const emit = defineEmits<{
  signIn: [];
  equip: [slot: 'title' | 'avatar_frame', code: string];
  unequip: [slot: 'title' | 'avatar_frame'];
  claimQuest: [questCode: string];
  loadHitRecords: [];
  toggleBuff: [buff: UserBuff & { triggerMode?: string; isActive?: boolean }];
}>();

const getLevelThreshold = (level: number): number => {
  if (level <= 1) return 0;
  return level * (level - 1) * 50;
};

/** 当前等级段内经验进度（current/required/percent） */
const expProgress = computed(() => {
  const { level, exp } = props.rpgStatus;
  const currentThreshold = getLevelThreshold(level);
  const nextThreshold = getLevelThreshold(level + 1);
  const current = exp - currentThreshold;
  const required = nextThreshold - currentThreshold;
  const percent = required > 0 ? Math.min(100, Math.round((current / required) * 100)) : 100;
  return { current, required, percent };
});

const lifeColor = computed(() => getRpgLifeColor(props.rpgStatus.lifeValue ?? 100));

const lifePercent = computed(() => props.rpgStatus.lifeValue ?? 100);
const isBanned = computed(() => props.banStatus?.banned ?? false);
const roleReward = computed(() => props.rpgStatus.roleReward ?? null);

const completedAchievementCount = computed(
  () => props.achievements.filter(a => a.completed).length,
);

const allQuests = computed(() => [
  ...props.questGroups.daily,
  ...props.questGroups.bounty,
  ...props.questGroups.special,
]);

const questProgressText = computed(() => {
  if (allQuests.value.length === 0) return '—';
  const completed = allQuests.value.filter(q => q.completed).length;
  return `${completed}/${allQuests.value.length}`;
});

const claimableQuests = computed(() => allQuests.value.filter(q => q.completed && !q.claimed));

const activeBuffCount = computed(() => props.buffs.length);

const lastSignInResult = ref<SignInResult | null>(null);

/** 暴露给父组件：签到成功后回填结果（升级弹窗由 RpgGlobalInit 统一处理） */
defineExpose({
  setSignInResult: (result: SignInResult | null) => {
    lastSignInResult.value = result;
  },
});

const { playSfx } = useRpgAudio();

type RpgTab = 'quests' | 'achievements' | 'buffs';
const activeTab = ref<RpgTab>('quests');

/** 切换成就 / 任务 / 增益 Tab，变更时播放 tabSwitch */
const switchTab = (tab: RpgTab) => {
  if (tab !== activeTab.value) void playSfx('tabSwitch');
  activeTab.value = tab;
};

const showHitRecords = ref(false);

/** 展开/收起敏感词记录；变更时播放 tabSwitch */
const toggleHitRecords = () => {
  showHitRecords.value = !showHitRecords.value;
  void playSfx('tabSwitch');
  if (showHitRecords.value && props.hitRecords.length === 0) {
    emit('loadHitRecords');
  }
};
</script>

<template>
  <div v-if="rpgStatus" class="rpg-card">
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
    <div class="sign-section">
      <div class="sign-main">
        <button
          class="sign-btn"
          :disabled="signInfo?.signedToday || signingIn || isBanned"
          @click="emit('signIn')"
        >
          {{ signInfo?.signedToday ? '✓ 已签到' : signingIn ? '签到中…' : '签到 +10经验' }}
        </button>
        <div class="sign-stats">
          <span class="sign-chip" title="累计签到天数">
            <span class="chip-icon" aria-hidden="true">📅</span>
            <span class="chip-text">
              累计 <strong class="chip-num">{{ signInfo?.totalSignDays ?? 0 }}</strong> 天
            </span>
          </span>
          <span v-if="signInfo?.consecutiveSignDays" class="sign-chip streak" title="连续签到天数">
            <span class="chip-icon" aria-hidden="true">🔥</span>
            <span class="chip-text">
              连续 <strong class="chip-num">{{ signInfo.consecutiveSignDays }}</strong> 天
            </span>
          </span>
        </div>
      </div>
      <div
        v-if="lastSignInResult?.bonusExp || lastSignInResult?.lifeRecovered"
        class="sign-result-tip"
      >
        <span v-if="lastSignInResult.bonusExp" class="bonus-tip">🎁 +{{ lastSignInResult.bonusExp }}经验</span>
        <span v-if="lastSignInResult.lifeRecovered" class="hp-tip">❤️ +{{ lastSignInResult.lifeRecovered }}生命</span>
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
        <span class="stat-label">增益</span>
      </button>
    </div>

    <!-- Tab 内容 -->
    <div class="rpg-panels">
      <div v-show="activeTab === 'quests'" class="rpg-panel" role="tabpanel">
        <RpgQuestPanel :quest-groups="questGroups" @claim="emit('claimQuest', $event)" />
      </div>
      <div v-show="activeTab === 'achievements'" class="rpg-panel" role="tabpanel">
        <RpgAchievementPanel :achievements="achievements" />
      </div>
      <div v-show="activeTab === 'buffs'" class="rpg-panel" role="tabpanel">
        <RpgBuffList :buffs="buffs" @toggle="emit('toggleBuff', $event)" />
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
            :key="frame.code"
            class="collection-tag clickable"
            :class="{ equipped: rpgStatus.equippedAvatarFrame === frame.code }"
            :style="{
              borderColor: frame.color || undefined,
              color: frame.color || undefined,
            }"
            @click="
              rpgStatus.equippedAvatarFrame === frame.code
                ? emit('unequip', 'avatar_frame')
                : emit('equip', 'avatar_frame', frame.code)
            "
          >
            {{ frame.name }}
            <span v-if="rpgStatus.equippedAvatarFrame === frame.code" class="equipped-badge">已穿戴</span>
          </span>
        </div>
      </div>
      <div v-if="rpgStatus.unlockedTitles?.length" class="collection-row">
        <span class="collection-label">🏆 称号</span>
        <div class="collection-items">
          <span
            v-for="title in rpgStatus.unlockedTitles"
            :key="title.code"
            class="collection-tag title-tag clickable"
            :class="{ equipped: rpgStatus.equippedTitle === title.code }"
            @click="
              rpgStatus.equippedTitle === title.code
                ? emit('unequip', 'title')
                : emit('equip', 'title', title.code)
            "
          >
            {{ title.name }}
            <span v-if="rpgStatus.equippedTitle === title.code" class="equipped-badge">已穿戴</span>
          </span>
        </div>
      </div>
    </div>

    <!-- 敏感词记录 -->
    <div class="hits-toggle">
      <div class="section-title clickable" @click="toggleHitRecords">
        敏感词记录 ({{ hitRecordsTotal || rpgStatus.sensitiveHitsCount || 0 }})
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
  </div>
</template>

<style scoped>
  .rpg-card {
    width: 100%;
    padding: 16px;
    border-radius: 14px;
    background: var(--rpg-loot-bg);
    border: 1px solid var(--rpg-loot-border);
    box-shadow: var(--rpg-loot-shadow), var(--rpg-loot-inset);
    backdrop-filter: var(--rpg-loot-backdrop);
    -webkit-backdrop-filter: var(--rpg-loot-backdrop);
  }

  .role-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 10px;
    border: 2px solid;
    background: var(--rpg-amber-bg-gradient);
    margin-bottom: 12px;
  }

  .role-frame {
    font-size: 16px;
  }
  .role-title {
    font-weight: 800;
    font-size: 13px;
    color: var(--rpg-amber-text);
  }
  .role-frame-name {
    font-size: 11px;
    color: var(--rpg-amber-text-soft);
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
    background: var(--rpg-level-badge-gradient);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 3px 10px var(--rpg-level-shadow);
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
    color: var(--rpg-text-secondary);
  }
  .exp-num {
    font-size: 15px;
    font-weight: 800;
    color: var(--rpg-text);
  }
  .exp-fraction {
    font-size: 11px;
    color: var(--rpg-text-muted);
  }

  .exp-bar {
    height: 7px;
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
    background: var(--rpg-track);
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
  .sign-section {
    margin-bottom: 12px;
  }

  .sign-main {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .sign-btn {
    flex-shrink: 0;
    height: 32px;
    padding: 0 14px;
    border-radius: 8px;
    background: var(--rpg-primary-gradient);
    color: white;
    font-weight: 700;
    font-size: 13px;
    line-height: 1;
    border: none;
    cursor: pointer;
    transition: opacity 0.2s;
    white-space: nowrap;
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
    gap: 8px;
    flex: 1;
    min-width: 0;
    justify-content: flex-end;
  }

  .sign-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 28px;
    padding: 0 10px;
    border-radius: 8px;
    font-size: 12px;
    line-height: 1;
    color: var(--rpg-text-secondary);
    background: var(--rpg-surface);
    border: 1px solid var(--rpg-border-subtle);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .sign-chip.streak {
    background: var(--rpg-amber-bg);
    border-color: color-mix(in oklch, var(--rpg-amber) 25%, transparent);
    color: var(--rpg-amber-text-soft);
  }

  .chip-icon {
    flex-shrink: 0;
    font-size: 12px;
    line-height: 1;
  }

  .chip-text {
    display: inline-flex;
    align-items: center;
    gap: 2px;
  }

  .chip-num {
    font-weight: 800;
    color: var(--rpg-text);
  }

  .sign-chip.streak .chip-num {
    color: var(--rpg-amber-text);
  }

  .sign-result-tip {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
    font-size: 11px;
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

  /* Stats bar */
  .stats-bar {
    display: flex;
    justify-content: space-around;
    padding: 10px 0;
    margin-bottom: 10px;
    border-top: 1px solid var(--rpg-border);
    border-bottom: 1px solid var(--rpg-border);
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
    background: var(--rpg-bg-alt);
  }

  .stat-item.active {
    background: var(--rpg-violet-bg);
  }

  .stat-item.active .stat-num {
    color: var(--rpg-violet);
  }

  .stat-item.active .stat-label {
    color: var(--rpg-violet);
    font-weight: 600;
  }

  .stat-num {
    font-size: 16px;
    font-weight: 800;
    color: var(--rpg-text);
  }
  .stat-label {
    font-size: 10px;
    color: var(--rpg-text-muted);
    margin-top: 1px;
  }

  .stat-badge {
    position: absolute;
    top: 0;
    right: 4px;
    background: var(--rpg-badge-alert);
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
    border-radius: 12px;
    background: var(--rpg-bg-alt);
    border: 1px solid var(--rpg-border-subtle);
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
    color: var(--rpg-text-secondary);
    white-space: nowrap;
    min-width: 52px;
  }

  .collection-items {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .collection-tag {
    padding: 3px 9px;
    border-radius: 999px;
    border: 1px solid;
    font-size: 11px;
    font-weight: 600;
    cursor: default;
    background: var(--rpg-loot-bg);
    box-shadow: var(--rpg-loot-inset);

    &.clickable {
      cursor: pointer;
      transition: opacity 0.15s;

      &:hover {
        opacity: 0.85;
      }
    }

    &.equipped {
      box-shadow:
        var(--rpg-loot-inset),
        0 0 0 2px color-mix(in oklch, currentColor 35%, transparent);
    }

    .equipped-badge {
      margin-left: 4px;
      font-size: 10px;
      opacity: 0.8;
    }
  }

  .title-tag {
    border-color: var(--rpg-amber-light);
    background: var(--rpg-amber-bg);
    color: var(--rpg-amber-text);
  }

  /* Hits */
  .hits-toggle {
    margin-top: 8px;
  }

  .section-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--rpg-text-label);
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
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .hits-empty {
    font-size: 11px;
    color: var(--rpg-text-muted);
    padding: 6px;
  }

  .hit-item {
    padding: 8px 10px;
    border-radius: 10px;
    background: var(--rpg-loot-bg);
    border: 1px solid var(--rpg-loot-border);
    box-shadow: var(--rpg-loot-inset);
  }

  .hit-content {
    font-size: 11px;
    color: var(--rpg-text-body);
    word-break: break-all;
  }
  .hit-words {
    font-size: 10px;
    color: var(--rpg-danger);
  }
  .hit-time {
    font-size: 9px;
    color: var(--rpg-text-muted);
    margin-top: 1px;
  }
</style>
