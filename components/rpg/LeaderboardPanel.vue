<script setup lang="ts">
/**
   * RPG 排行榜面板（美术改版 v2）：领奖台 Top3 + 列表 + 我的排名条
   * 头像/昵称可跳转至用户公开主页
   */
import type { LeaderboardPeriod, LeaderboardScoreType } from '~~/types/rpg';
import { resolveStaticUrl } from '@/utils/static-url';

const props = defineProps<{
  leaderboard: any[];
  rpgStatus: any | null;
  loading: boolean;
}>();

const emit = defineEmits<{
  goto: [target: 'status'];
}>();

const activeType = defineModel<LeaderboardScoreType>('activeType', { default: 'exp' });
const activePeriod = defineModel<LeaderboardPeriod>('activePeriod', { default: 'total' });

const { playSfx } = useRpgAudio();
const userInfo = useUserInfo();

/** 切换排行榜周期 Tab */
const switchPeriod = (key: LeaderboardPeriod) => {
  if (key !== activePeriod.value) void playSfx('tabSwitch');
  activePeriod.value = key;
};

/** 切换排行榜维度 Tab */
const switchType = (key: LeaderboardScoreType) => {
  if (key !== activeType.value) void playSfx('tabSwitch');
  activeType.value = key;
};

const typeOptions: { key: LeaderboardScoreType; label: string; icon: string }[] = [
  { key: 'exp', label: '经验', icon: 'exp' },
  { key: 'reputation', label: '声望', icon: 'medal-gold' },
  { key: 'currency', label: '钻石', icon: 'gem' },
  { key: 'level', label: '等级', icon: 'dice' },
  { key: 'signDays', label: '签到', icon: 'calendar' },
];

const periodOptions: { key: LeaderboardPeriod; label: string }[] = [
  { key: 'total', label: '总榜' },
  { key: 'season', label: '赛季榜' },
  { key: 'week', label: '周榜' },
  { key: 'month', label: '月榜' },
];

const getScoreText = (entry: any) => {
  if (entry.score !== undefined) return String(entry.score);
  switch (activeType.value) {
    case 'exp':
      return `${entry.exp} 经验`;
    case 'reputation':
      return `${entry.reputation} 声望`;
    case 'currency':
      return `${entry.currency} 钻石`;
    case 'signDays':
      return `${entry.totalSignDays} 天`;
    case 'level':
      return `LV${entry.level}`;
    default:
      return '';
  }
};

const getScoreShort = (entry: any) => {
  if (entry.score !== undefined) return String(entry.score);
  switch (activeType.value) {
    case 'exp':
      return `${(entry.exp ?? 0).toLocaleString()} EXP`;
    case 'reputation':
      return `${(entry.reputation ?? 0).toLocaleString()} 声望`;
    case 'currency':
      return `${(entry.currency ?? 0).toLocaleString()} 钻石`;
    case 'signDays':
      return `${entry.totalSignDays ?? 0} 天`;
    case 'level':
      return `LV${entry.level}`;
    default:
      return '';
  }
};

/* ── 领奖台 Top3：2-1-3 排布 ── */
const podiumOrder = computed(() => {
  const top3 = (props.leaderboard || []).slice(0, 3);
  return [top3[1], top3[0], top3[2]].filter(Boolean);
});

const restList = computed(() => (props.leaderboard || []).slice(3));

/* ── 我的排名条：TopN 内取实际名次；不在榜时显示未上榜（myRank 接口上线后无缝替换）── */
const myEntry = computed(
  () => (props.leaderboard || []).find(e => e.uid === userInfo.value?.uid) || null,
);

/** 数值型分数（差距条用） */
const getScoreNum = (entry: any): number => {
  if (entry.score !== undefined) return Number(entry.score) || 0;
  switch (activeType.value) {
    case 'exp':
      return entry.exp ?? 0;
    case 'reputation':
      return entry.reputation ?? 0;
    case 'currency':
      return entry.currency ?? 0;
    case 'signDays':
      return entry.totalSignDays ?? 0;
    case 'level':
      return entry.level ?? 0;
    default:
      return 0;
  }
};

/** v3 ⑤ 与上一名的差距（仅当我在 TopN 且非第一名时可算） */
const gapInfo = computed(() => {
  const me = myEntry.value;
  if (!me || me.rank <= 1) return null;
  const prev = (props.leaderboard || []).find(e => e.rank === me.rank - 1);
  if (!prev) return null;
  const prevScore = getScoreNum(prev);
  const myScore = getScoreNum(me);
  const diff = Math.max(0, prevScore - myScore);
  return {
    rank: prev.rank,
    name: prev.nickname,
    diff,
    percent: prevScore > 0 ? Math.min(100, Math.round((myScore / prevScore) * 100)) : 0,
  };
});

const myRankText = computed(() => {
  if (myEntry.value) return `#${myEntry.value.rank}`;
  return props.rpgStatus ? '未上榜' : '';
});

const myScoreText = computed(() => {
  if (myEntry.value) return getScoreShort(myEntry.value);
  const s = props.rpgStatus;
  if (!s) return '';
  switch (activeType.value) {
    case 'exp':
      return `${(s.exp ?? 0).toLocaleString()} EXP`;
    case 'reputation':
      return `${s.reputation ?? 0} 声望`;
    case 'currency':
      return `${s.currency ?? 0} 钻石`;
    case 'signDays':
      return `${s.totalSignDays ?? 0} 天`;
    case 'level':
      return `LV${s.level}`;
    default:
      return '';
  }
});

/** 我的头像（ me-bar 用；空值时隐藏 img） */
const myAvatar = computed(() => {
  const a = userInfo.value?.avatar;
  return a ? resolveStaticUrl(a) : '';
});
</script>

<template>
  <div class="leaderboard-panel">
    <div class="rpg-panel-tabs">
      <button
        v-for="opt in periodOptions"
        :key="opt.key"
        class="rpg-panel-tab"
        :class="{ active: activePeriod === opt.key }"
        @click="switchPeriod(opt.key)"
      >
        {{ opt.label }}
      </button>
    </div>
    <div class="rpg-panel-tabs">
      <button
        v-for="opt in typeOptions"
        :key="opt.key"
        class="rpg-panel-tab"
        :class="{ active: activeType === opt.key }"
        @click="switchType(opt.key)"
      >
        {{ opt.label }}
        <img class="type-ico" :src="`/rpg/icons/${opt.icon}.png`" alt="" loading="lazy">
      </button>
    </div>

    <RpgPanelLoading v-if="loading" />
    <div v-else-if="leaderboard.length === 0" class="rpg-empty-card">
      <img class="rpg-empty-card__art" src="/rpg/icons/trophy.png" alt="" loading="lazy">
      <b>榜上暂无你的名字</b>
      <p>签到、读文章、做任务都能攒 EXP，冲一冲本期榜单。</p>
      <button class="rpg-empty-card__btn" @click="emit('goto', 'status')">
        去做任务赚 EXP
      </button>
    </div>
    <template v-else>
      <!-- 领奖台 Top3 -->
      <div class="podium">
        <div
          v-for="entry in podiumOrder"
          :key="entry.uid"
          class="podium-card"
          :class="[`podium-card--${entry.rank}`, { 'podium-card--first': entry.rank === 1 }]"
        >
          <img
            class="podium-card__medal"
            :src="`/rpg/icons/medal-${['gold', 'silver', 'bronze'][entry.rank - 1]}.png`"
            :alt="['金牌', '银牌', '铜牌'][entry.rank - 1]"
            loading="lazy"
          >
          <NuxtLink :to="`/user/${entry.uid}`" class="podium-card__avatar">
            <img v-if="entry.avatar" :src="resolveStaticUrl(entry.avatar)" :alt="entry.nickname">
            <span v-else class="podium-card__fallback">{{ entry.nickname?.charAt(0) || '?' }}</span>
          </NuxtLink>
          <b class="podium-card__name">{{ entry.nickname }}</b>
          <span class="podium-card__score">{{ getScoreShort(entry) }}</span>
        </div>
      </div>

      <!-- 4 名之后列表 -->
      <div v-if="restList.length" class="rank-list">
        <div v-for="entry in restList" :key="entry.uid" class="rpg-rank-row">
          <span class="rank-num">{{ entry.rank }}</span>
          <NuxtLink
            :to="`/user/${entry.uid}`"
            class="rank-avatar"
            :title="`查看 ${entry.nickname} 的主页`"
          >
            <img v-if="entry.avatar" :src="resolveStaticUrl(entry.avatar)" :alt="entry.nickname">
            <span v-else class="avatar-placeholder">{{ entry.nickname?.charAt(0) || '?' }}</span>
          </NuxtLink>
          <div class="rank-info">
            <NuxtLink :to="`/user/${entry.uid}`" class="rank-name link link-hover">{{
              entry.nickname
            }}</NuxtLink>
            <span class="rank-sub">LV{{ entry.level }}</span>
          </div>
          <span class="rank-score">{{ getScoreText(entry) }}</span>
        </div>
      </div>

      <!-- 我的排名条（紫渐变横幅） -->
      <div v-if="rpgStatus" class="me-bar">
        <img v-if="myAvatar" class="me-bar__avatar" :src="myAvatar" alt="">
        <span class="me-bar__no">{{ myRankText }}</span>
        <div class="me-bar__meta">
          <b>我的排名</b>
          <span>LV{{ rpgStatus.level }} · {{ myScoreText }}</span>
        </div>
        <!-- v3 ⑤ 距上一名差距可视化（TopN 内可算时展示，否则显示鼓励文案） -->
        <div v-if="gapInfo" class="me-bar__gap">
          <div class="me-bar__gap-label">
            距 #{{ gapInfo.rank }} 「{{ gapInfo.name }}」差 {{ gapInfo.diff.toLocaleString() }}（{{
              gapInfo.percent
            }}%）
          </div>
          <div class="me-bar__gap-track">
            <i :style="{ width: gapInfo.percent + '%' }" />
          </div>
        </div>
        <div v-else class="me-bar__tip">
          {{ myEntry ? '进入 TopN · 保持冒险节奏' : '继续冒险，冲进 Top50 就能上榜' }}
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
  .leaderboard-panel {
    font-size: 14px;
  }

  /* DaisyUI reset 把 img 设为 block，需改回行内以免筛选项竖排变圆 */
  .type-ico {
    display: inline-block;
    width: 15px;
    height: 15px;
    object-fit: contain;
    flex-shrink: 0;
  }

  /* ── 领奖台 ── */
  .podium {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 10px;
    margin: 6px 0 16px;
  }

  .podium-card {
    flex: 1;
    max-width: 180px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    border: 1px solid var(--rpg-border, oklch(var(--b3)));
    border-radius: 14px;
    padding: 14px 8px 12px;
    background: var(--rpg-bg-alt, oklch(var(--b2)));
  }

  .podium-card--first {
    padding-top: 10px;
    border-color: var(--rpg-art-gold, #d9a13c);
    background: linear-gradient(
      160deg,
      var(--rpg-art-gold-soft, #fdf6e4),
      var(--rpg-bg-alt, oklch(var(--b2)))
    );
    box-shadow: 0 0 0 3px var(--rpg-art-epic-glow, rgb(217 161 60 / 0.25));
  }

  .podium-card__medal {
    width: 40px;
    height: 40px;
    object-fit: contain;
    margin-bottom: 6px;
    filter: drop-shadow(0 2px 4px rgb(0 0 0 / 0.18));
  }

  .podium-card--first .podium-card__medal {
    width: 48px;
    height: 48px;
  }

  .podium-card__avatar {
    display: block;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    overflow: hidden;
    background: var(--rpg-track, oklch(var(--b2)));
    border: 3px solid var(--rpg-surface, #fff);
    box-shadow: 0 0 0 2px var(--rpg-border, oklch(var(--b3)));
    margin-bottom: 6px;
  }

  .podium-card--first .podium-card__avatar {
    width: 60px;
    height: 60px;
    box-shadow: 0 0 0 2px var(--rpg-art-gold, #d9a13c);
  }

  .podium-card__avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .podium-card__fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-weight: 700;
    color: var(--rpg-text-secondary);
    font-size: 15px;
  }

  .podium-card__name {
    font-size: 13px;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--rpg-text-heading, oklch(var(--bc)));
  }

  .podium-card__score {
    font-size: 11px;
    color: var(--rpg-text-muted, oklch(var(--bc) / 0.55));
    margin-top: 2px;
  }

  /* ── 列表 ── */
  .rank-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .rank-num {
    min-width: 28px;
    text-align: center;
    font-weight: 800;
    font-size: 14px;
    color: var(--rpg-text-muted);
  }

  .rank-avatar {
    display: block;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    overflow: hidden;
    background: var(--rpg-track);
    flex-shrink: 0;
    border: 1px solid var(--rpg-border-subtle);
    transition:
      border-color 0.2s,
      transform 0.2s;
  }

  .rank-avatar:hover {
    border-color: var(--rpg-art-gold, #d9a13c);
    transform: scale(1.04);
  }

  .rank-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-weight: 700;
    color: var(--rpg-text-secondary);
    font-size: 14px;
  }

  .rank-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .rank-name {
    font-weight: 600;
    color: var(--rpg-text-heading);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .rank-sub {
    font-size: 11px;
    color: var(--rpg-text-muted);
  }

  .rank-score {
    font-weight: 700;
    color: var(--rpg-art-violet-deep, #5b3fd6);
    font-size: 13px;
    white-space: nowrap;
  }

  /* ── 我的排名条 ── */
  .me-bar {
    position: relative;
    margin-top: 16px;
    border-radius: 16px;
    padding: 14px 20px;
    display: flex;
    align-items: center;
    gap: 14px;
    background: var(--rpg-art-violet-grad);
    color: #fff;
    box-shadow: var(--rpg-art-shadow-violet);
  }

  .me-bar__avatar {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgb(255 255 255 / 0.7);
    flex-shrink: 0;
  }

  .me-bar__no {
    font-size: 20px;
    font-weight: 800;
    white-space: nowrap;
  }

  .me-bar__meta {
    min-width: 0;
  }

  .me-bar__meta b {
    display: block;
    font-size: 13px;
  }

  .me-bar__meta span {
    font-size: 12px;
    opacity: 0.88;
  }

  .me-bar__tip {
    margin-left: auto;
    font-size: 11.5px;
    opacity: 0.85;
    text-align: right;
    line-height: 1.5;
  }

  @media (max-width: 639px) {
    .podium {
      gap: 6px;
    }

    .podium-card {
      padding: 10px 4px 10px;
    }

    .podium-card__name {
      font-size: 11.5px;
    }

    .me-bar {
      flex-wrap: wrap;
      padding: 12px 14px;
    }

    .me-bar__tip {
      flex-basis: 100%;
      text-align: left;
      margin-left: 0;
    }
  }

  /* ── v3 ⑤ 距上一名差距条 ── */
  .me-bar__gap {
    margin-left: auto;
    text-align: right;
    min-width: 0;
  }

  .me-bar__gap-label {
    font-size: 11.5px;
    opacity: 0.92;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .me-bar__gap-track {
    width: 180px;
    max-width: 40vw;
    height: 7px;
    border-radius: 999px;
    background: rgb(255 255 255 / 0.22);
    overflow: hidden;
    margin: 6px 0 0 auto;
  }

  .me-bar__gap-track i {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, #e8b04b, #d9a13c);
    border-radius: 999px;
    transition: width 0.4s ease;
  }

  /* ── v3 ⑦ 空态规范 ── */
  .rpg-empty-card {
    text-align: center;
    padding: 24px 16px;
    border: 1.5px dashed var(--rpg-border, #e8e3f2);
    border-radius: 16px;
    background: var(--rpg-surface, #fbfaff);
  }

  .rpg-empty-card__art {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    object-fit: cover;
    opacity: 0.9;
  }

  .rpg-empty-card b {
    display: block;
    font-size: 13px;
    margin: 8px 0 4px;
    color: var(--rpg-text-heading, oklch(var(--bc)));
  }

  .rpg-empty-card p {
    font-size: 11.5px;
    color: var(--rpg-text-muted, oklch(var(--bc) / 0.6));
    line-height: 1.6;
    margin-bottom: 10px;
  }

  .rpg-empty-card__btn {
    border: none;
    cursor: pointer;
    font-weight: 700;
    font-size: 12px;
    padding: 7px 16px;
    border-radius: 10px;
    background: linear-gradient(135deg, #7c5cf0, #5b3fd6);
    color: #fff;
    box-shadow: 0 4px 12px rgb(92 63 214 / 0.3);
  }
</style>
