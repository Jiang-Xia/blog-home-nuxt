<script setup lang="ts">
/**
   * 成就展示面板 - 奖章墙（美术改版 v6 · A 方案）
   * 图标为主视觉：已达成 = 金环 + 流光旋转；未达成 = 虚线环按稀有度点色
   */
import {
  ACHIEVEMENT_CATEGORY_ICON_FALLBACK,
  ACHIEVEMENT_CATEGORY_MAP,
  ACHIEVEMENT_ICON_MAP,
} from '~~/types/rpg';
import type { UserAchievementProgress } from '~~/types/rpg';

/** 成就图标：emoji → 美术图（v4），无资产 key 时回退 emoji */
const achArtKey = (ach: UserAchievementProgress) =>
  ACHIEVEMENT_ICON_MAP[ach.icon] || ACHIEVEMENT_CATEGORY_ICON_FALLBACK[ach.category] || null;

const props = defineProps<{
  achievements: UserAchievementProgress[];
}>();

const { playSfx } = useRpgAudio();

/** 稀有度四档环色（传说金 / 史诗紫 / 稀有绿 / 普通银），后端色优先 */
const RARITY_RING_FALLBACK: Record<string, string> = {
  common: '#9aa3b2',
  rare: '#34a85a',
  epic: '#8d5cf0',
  legendary: '#d9a13c',
  ssr: '#d9a13c',
};

const achRingColor = (ach: UserAchievementProgress) => {
  const r = (ach.rarity || '').toLowerCase();
  return ach.rarityColor || RARITY_RING_FALLBACK[r] || RARITY_RING_FALLBACK.common;
};

// 按分类分组
const groupedAchievements = computed(() => {
  const groups: Record<string, UserAchievementProgress[]> = {};
  for (const a of props.achievements) {
    if (!groups[a.category]) groups[a.category] = [];
    groups[a.category]!.push(a);
  }
  return groups;
});

// 统计
const totalCount = computed(() => props.achievements.length);
const completedCount = computed(() => props.achievements.filter(a => a.completed).length);
const completionPercent = computed(() =>
  totalCount.value > 0 ? Math.round((completedCount.value / totalCount.value) * 100) : 0,
);

// 当前选中的分类
const activeCategory = ref<string>('all');

/** 切换成就分类 Tab，变更时播放 tabSwitch */
const switchCategory = (key: string) => {
  if (key !== activeCategory.value) void playSfx('tabSwitch');
  activeCategory.value = key;
};

const filteredAchievements = computed(() => {
  if (activeCategory.value === 'all') return props.achievements;
  return groupedAchievements.value[activeCategory.value] || [];
});

/** 默认隐藏未开始的锁定成就，减轻首屏卡片密度 */
const showLocked = ref(false);

const displayedAchievements = computed(() => {
  const list = filteredAchievements.value;
  if (showLocked.value) return list;
  return list.filter(a => a.completed || a.progress > 0);
});

const hiddenLockedCount = computed(
  () => filteredAchievements.value.filter(a => !a.completed && a.progress === 0).length,
);

const categories = computed(() => {
  return Object.keys(groupedAchievements.value).map(key => ({
    key,
    label: ACHIEVEMENT_CATEGORY_MAP[key] || key,
    count: groupedAchievements.value[key]?.length || 0,
    completed: groupedAchievements.value[key]?.filter(a => a.completed).length || 0,
  }));
});
</script>

<template>
  <div class="achievement-panel">
    <!-- 总览 -->
    <div class="ach-overview">
      <div class="ach-summary">
        <div class="ach-count">
          <span class="ach-num">{{ completedCount }}</span>
          <span class="ach-total">/{{ totalCount }}</span>
        </div>
        <div class="ach-label">
          已完成成就
        </div>
      </div>
      <img class="ach-art" src="/rpg/icons/trophy.png" alt="" loading="lazy">
      <div class="ach-progress-ring">
        <svg viewBox="0 0 36 36" class="ring-svg">
          <path
            class="ring-bg"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="var(--rpg-track)"
            stroke-width="3"
          />
          <path
            class="ring-fill"
            :stroke-dasharray="`${completionPercent}, 100`"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="var(--rpg-amber)"
            stroke-width="3"
            stroke-linecap="round"
          />
        </svg>
        <span class="ring-text">{{ completionPercent }}%</span>
      </div>
    </div>

    <div class="rpg-panel-tabs ach-tabs">
      <button
        class="rpg-panel-tab rpg-panel-tab--amber"
        :class="{ active: activeCategory === 'all' }"
        @click="switchCategory('all')"
      >
        全部
        <span class="tab-count">{{ completedCount }}/{{ totalCount }}</span>
      </button>
      <button
        v-for="cat in categories"
        :key="cat.key"
        class="rpg-panel-tab rpg-panel-tab--amber"
        :class="{ active: activeCategory === cat.key }"
        @click="switchCategory(cat.key)"
      >
        {{ cat.label }}
        <span class="tab-count">{{ cat.completed }}/{{ cat.count }}</span>
      </button>
    </div>

    <!-- 奖章墙 -->
    <div class="medal-grid">
      <div
        v-for="ach in displayedAchievements"
        :key="ach.code"
        class="medal"
        :class="{ 'medal--done': ach.completed }"
        :style="{ '--rc': achRingColor(ach) }"
      >
        <div class="medal-ring">
          <img
            v-if="achArtKey(ach)"
            :src="`/rpg/icons/${achArtKey(ach)}.png`"
            alt=""
            loading="lazy"
          >
          <span v-else class="medal-fallback">🏆</span>
        </div>
        <div class="medal-rn">
          {{ ach.rarityLabel || '成就' }}
        </div>
        <div class="medal-name">
          {{ ach.name }}
        </div>
        <div class="medal-track">
          <i
            :style="{
              width: Math.min(100, (ach.progress / Math.max(ach.maxProgress, 1)) * 100) + '%',
              background: ach.completed
                ? 'linear-gradient(90deg, var(--rpg-amber), var(--rpg-art-gold, #d9a13c))'
                : 'var(--rc)',
            }"
          />
        </div>
        <div class="medal-pct" :class="{ 'medal-pct--done': ach.completed }">
          {{ ach.completed ? '已达成' : `${ach.progress} / ${ach.maxProgress}` }}
        </div>
      </div>
    </div>

    <button
      v-if="hiddenLockedCount > 0"
      type="button"
      class="ach-expand-btn"
      @click="showLocked = !showLocked"
    >
      {{ showLocked ? '收起未开始成就' : `展开未开始成就 (${hiddenLockedCount})` }}
    </button>
  </div>
</template>

<style scoped>
  .achievement-panel {
    padding: 0;
  }

  .ach-overview {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 12px;
  }

  .ach-art {
    width: 56px;
    height: 56px;
    object-fit: contain;
    flex-shrink: 0;
    margin-left: auto;
    filter: drop-shadow(0 4px 10px rgb(217 161 60 / 0.35));
  }

  .ach-summary {
    display: flex;
    flex-direction: column;
  }

  .ach-count {
    display: flex;
    align-items: baseline;
    gap: 2px;
  }

  .ach-num {
    font-size: 24px;
    font-weight: 900;
    color: var(--rpg-amber);
  }

  .ach-total {
    font-size: 14px;
    color: var(--rpg-text-muted);
  }

  .ach-label {
    font-size: 12px;
    color: var(--rpg-text-secondary);
  }

  .ach-progress-ring {
    position: relative;
    width: 44px;
    height: 44px;
  }

  .ring-svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  .ring-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 10px;
    font-weight: 700;
    color: var(--rpg-amber);
  }

  .ach-tabs {
    margin-bottom: 10px;
  }

  /* ── 奖章墙 ── */
  .medal-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
    gap: 10px;
    max-height: 400px;
    overflow-y: auto;
    padding: 4px 2px 6px;
  }

  .medal {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 12px 8px 10px;
    border-radius: 14px;
    border: 1px solid var(--rpg-border);
    background: var(--rpg-loot-bg);
    text-align: center;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }

  .medal:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgb(60 40 110 / 0.12);
  }

  .medal-ring {
    position: relative;
    width: 54px;
    height: 54px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    border: 2.5px dashed var(--rc);
    background: var(--rpg-surface);
    margin-bottom: 4px;
  }

  .medal-ring img {
    width: 34px;
    height: 34px;
    object-fit: contain;
    filter: grayscale(0.25) opacity(0.82);
    pointer-events: none;
  }

  .medal-fallback {
    font-size: 24px;
    filter: grayscale(0.25) opacity(0.82);
  }

  /* 已达成：金环 + conic 流光旋转 */
  .medal--done .medal-ring {
    border: 3px solid var(--rpg-art-gold, #d9a13c);
    background: radial-gradient(circle at 34% 30%, #fffaf0, #fdf3da);
    box-shadow: 0 0 0 3px rgb(217 161 60 / 0.16);
  }

  .medal--done .medal-ring img,
  .medal--done .medal-fallback {
    filter: none;
  }

  .medal--done .medal-ring::after {
    content: '';
    position: absolute;
    inset: -6px;
    border-radius: 50%;
    background: conic-gradient(
      from 0deg,
      transparent 0deg,
      transparent 240deg,
      rgb(251 191 36 / 0.9) 300deg,
      transparent 352deg
    );
    animation: medalShine 2.8s linear infinite;
    -webkit-mask: radial-gradient(
      farthest-side,
      transparent calc(100% - 5.5px),
      #000 calc(100% - 4.5px)
    );
    mask: radial-gradient(farthest-side, transparent calc(100% - 5.5px), #000 calc(100% - 4.5px));
    pointer-events: none;
  }

  @keyframes medalShine {
    to {
      transform: rotate(360deg);
    }
  }

  .medal-rn {
    font-size: 8.5px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--rc);
    line-height: 1;
  }

  .medal-name {
    font-size: 11.5px;
    font-weight: 700;
    color: var(--rpg-text);
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: 2.6em;
  }

  .medal-track {
    width: 100%;
    height: 5px;
    border-radius: 999px;
    background: var(--rpg-track);
    overflow: hidden;
  }

  .medal-track i {
    display: block;
    height: 100%;
    border-radius: 999px;
    transition: width 0.4s ease;
  }

  .medal-pct {
    font-size: 9.5px;
    font-weight: 600;
    color: var(--rpg-text-muted);
  }

  .medal-pct--done {
    color: var(--rpg-amber);
    font-weight: 800;
  }

  .ach-expand-btn {
    display: block;
    width: 100%;
    margin-top: 8px;
    padding: 6px 10px;
    border: 1px dashed var(--rpg-border-subtle);
    border-radius: 8px;
    background: transparent;
    font-size: 11px;
    font-weight: 600;
    color: var(--rpg-text-secondary);
    cursor: pointer;
    transition:
      color 0.15s ease,
      border-color 0.15s ease,
      background 0.15s ease;
  }

  .ach-expand-btn:hover {
    color: var(--rpg-text-body);
    border-color: var(--rpg-border);
    background: var(--rpg-stat-hover);
  }
</style>
