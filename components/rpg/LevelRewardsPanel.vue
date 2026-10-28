<script setup lang="ts">
/**
   * 等级奖励 · 冒险征程（v5 重设计）
   * 卡片语言：等级金币印章 + 主奖励大图标 + 次奖励清单行
   * 主奖励优先级：称号 > 头像框 > 货币；未解锁卡整体压灰
   */
import type { CosmeticItemSummary, LevelReward, RpgStatus } from '~~/types/rpg';

type RewardRow
  = | { kind: 'currency'; amount: number; name: string }
    | { kind: 'frame'; item: CosmeticItemSummary }
    | { kind: 'title'; item: CosmeticItemSummary };

const props = defineProps<{
  rpgStatus: RpgStatus | null;
  levelRewards: LevelReward[];
  loading?: boolean;
}>();

const currentLevel = computed(() => props.rpgStatus?.level ?? 0);

const unlockedCount = computed(
  () => props.levelRewards.filter(r => currentLevel.value >= r.level).length,
);

const unlockPercent = computed(() =>
  props.levelRewards.length > 0
    ? Math.round((unlockedCount.value / props.levelRewards.length) * 100)
    : 0,
);

const rewardRows = (reward: LevelReward): RewardRow[] => {
  const rows: RewardRow[] = [];
  if (reward.currencyReward) {
    rows.push({
      kind: 'currency',
      amount: reward.currencyReward,
      name: reward.currencyName || '钻石',
    });
  }
  if (reward.avatarFrame?.name) rows.push({ kind: 'frame', item: reward.avatarFrame });
  if (reward.title?.name) rows.push({ kind: 'title', item: reward.title });
  return rows;
};

const KIND_LABEL: Record<RewardRow['kind'], string> = {
  title: '称号',
  frame: '头像框',
  currency: '货币',
};

const rowName = (row: RewardRow) =>
  row.kind === 'currency' ? `${row.amount} ${row.name}` : row.item.name;

/** 卡片展示模型：主奖励（大图标）+ 次奖励清单行 */
const rewardCards = computed(() =>
  props.levelRewards.map((reward) => {
    const rows = rewardRows(reward);
    const primary
      = rows.find(r => r.kind === 'title')
        || rows.find(r => r.kind === 'frame')
        || rows[0]
        || null;
    return {
      level: reward.level,
      unlocked: currentLevel.value >= reward.level,
      remaining: Math.max(0, reward.level - currentLevel.value),
      primary,
      secondary: primary ? rows.filter(r => r !== primary) : [],
      empty: rows.length === 0,
    };
  }),
);
</script>

<template>
  <div class="level-rewards-panel">
    <div class="panel-header">
      <div class="panel-summary">
        <div class="summary-title">
          🗺️ 冒险征程
        </div>
        <div class="summary-label">
          已解锁 <strong class="summary-num">{{ unlockedCount }}</strong> /
          {{ levelRewards.length }} 个等级奖励
        </div>
      </div>
      <div class="summary-ring">
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
            :stroke-dasharray="`${unlockPercent}, 100`"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="var(--rpg-amber)"
            stroke-width="3"
            stroke-linecap="round"
          />
        </svg>
        <span class="ring-text">{{ unlockPercent }}%</span>
      </div>
    </div>

    <RpgPanelLoading v-if="loading" compact />
    <div v-else-if="levelRewards.length === 0" class="empty">
      暂无等级奖励配置
    </div>
    <div v-else class="reward-grid">
      <div
        v-for="card in rewardCards"
        :key="card.level"
        class="rpg-loot-card reward-card"
        :class="{
          'reward-card--unlocked': card.unlocked,
          'reward-card--locked': !card.unlocked,
        }"
      >
        <!-- 头部：等级金币印章 + 状态 -->
        <div class="rc-head">
          <div class="rc-medal" :class="{ 'rc-medal--on': card.unlocked }">
            <span class="rc-medal-lv">LV</span>
            <span class="rc-medal-num">{{ card.level }}</span>
            <span v-if="card.unlocked" class="rc-medal-check">✓</span>
          </div>
          <span v-if="card.unlocked" class="rpg-loot-status rpg-loot-status--done">已达成</span>
          <span v-else class="rpg-loot-status rpg-loot-status--pending">
            还差 {{ card.remaining }} 级
          </span>
        </div>

        <!-- 主奖励：大图标为主视觉 -->
        <div v-if="card.primary" class="rc-main">
          <RpgItemIcon
            v-if="card.primary.kind !== 'currency'"
            size="lg"
            :icon="card.primary.item.icon"
            :rarity-color="card.primary.item.color"
            :frame-color="card.primary.item.color"
            :tinted="false"
          />
          <div v-else class="rc-gem-icon">
            <img src="/rpg/icons/gem.png" alt="" loading="lazy">
          </div>
          <div class="rc-main-info">
            <span class="rc-type" :class="`rc-type--${card.primary.kind}`">
              {{ KIND_LABEL[card.primary.kind] }}
            </span>
            <span class="rc-name">{{ rowName(card.primary) }}</span>
          </div>
        </div>
        <div v-else class="rc-none">
          旅途暂无奖励
        </div>

        <!-- 次奖励清单行 -->
        <div v-if="card.secondary.length" class="rc-sub">
          <div v-for="(row, i) in card.secondary" :key="i" class="rc-sub-row">
            <RpgItemIcon
              v-if="row.kind !== 'currency'"
              class="rc-sub-icon"
              size="sm"
              :icon="row.item.icon"
              :rarity-color="row.item.color"
              :frame-color="row.item.color"
              :tinted="false"
            />
            <img
              v-else class="rc-sub-gem" src="/rpg/icons/gem.png"
              alt=""
              loading="lazy"
            >
            <span class="rc-sub-name">{{ rowName(row) }}</span>
            <span class="rc-sub-kind">{{ KIND_LABEL[row.kind] }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .level-rewards-panel {
    font-size: 13px;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .panel-summary {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .summary-title {
    font-size: 14px;
    font-weight: 800;
    color: var(--rpg-text-heading);
  }

  .summary-num {
    font-size: 15px;
    font-weight: 900;
    color: var(--rpg-amber);
  }

  .summary-label {
    font-size: 12px;
    color: var(--rpg-text-secondary);
  }

  .summary-ring {
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

  .empty {
    color: var(--rpg-text-muted);
    padding: 12px;
    text-align: center;
    background: var(--rpg-empty-bg);
    border-radius: 8px;
    border: 1px dashed var(--rpg-empty-border);
  }

  /* ── 奖励网格 ── */
  .reward-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(218px, 1fr));
    gap: 10px;
  }

  .reward-card {
    gap: 10px;
    padding: 12px;
    min-height: 128px;
  }

  /* 未解锁：整体压灰 + 图标去色 */
  .reward-card--locked {
    opacity: 0.82;
  }

  .reward-card--locked :deep(img),
  .reward-card--locked .rc-gem-icon img,
  .reward-card--locked .rc-sub-gem {
    filter: grayscale(0.92) opacity(0.75);
  }

  /* ── 等级金币印章 ── */
  .rc-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .rc-medal {
    position: relative;
    width: 46px;
    height: 46px;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    line-height: 1;
    color: var(--rpg-text-muted);
    background:
      radial-gradient(circle at 32% 28%, rgb(255 255 255 / 0.5), transparent 46%), var(--rpg-track);
    border: 2px solid var(--rpg-border-subtle);
    box-shadow: var(--rpg-loot-icon-shadow);
  }

  .rc-medal--on {
    color: var(--rpg-amber-dark);
    background:
      radial-gradient(circle at 32% 28%, rgb(255 255 255 / 0.75), transparent 48%),
      var(--rpg-amber-bg-gradient);
    border-color: var(--rpg-amber-border);
    box-shadow:
      var(--rpg-loot-icon-shadow),
      0 0 0 3px color-mix(in oklch, var(--rpg-amber) 12%, transparent);
  }

  .rc-medal-lv {
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 1px;
    opacity: 0.8;
  }

  .rc-medal-num {
    font-size: 17px;
    font-weight: 900;
  }

  .rc-medal-check {
    position: absolute;
    right: -4px;
    bottom: -4px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 900;
    color: #fff;
    background: var(--rpg-success, #3fae6a);
    border: 1.5px solid rgb(255 255 255 / 0.85);
    box-shadow: 0 1px 3px rgb(0 0 0 / 0.2);
  }

  /* ── 主奖励 ── */
  .rc-main {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
  }

  .rc-main-info {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }

  .rc-type {
    align-self: flex-start;
    font-size: 10px;
    font-weight: 700;
    line-height: 1;
    padding: 3px 7px;
    border-radius: 999px;
    letter-spacing: 0.04em;
    background: var(--rpg-violet-bg);
    color: var(--rpg-violet-light);
    border: 1px solid color-mix(in oklch, var(--rpg-violet) 28%, transparent);
  }

  .rc-type--frame {
    background: var(--rpg-amber-bg-faint);
    color: var(--rpg-amber-dark);
    border-color: var(--rpg-amber-border);
  }

  .rc-type--title {
    background: color-mix(in oklch, var(--rpg-gold, #e8b64c) 16%, transparent);
    color: var(--rpg-amber-dark);
    border-color: var(--rpg-amber-border);
  }

  .rc-type--currency {
    background: var(--rpg-surface);
    color: var(--rpg-text-secondary);
    border-color: var(--rpg-border-subtle);
  }

  .rc-name {
    font-size: 13px;
    font-weight: 800;
    color: var(--rpg-text-heading);
    line-height: 1.35;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  /* 货币主奖励的兜底大图标（与 RpgItemIcon lg 对齐） */
  .rc-gem-icon {
    flex-shrink: 0;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--rpg-loot-icon-bg);
    border: 2px solid color-mix(in oklch, var(--rpg-art-gold, #d9a13c) 34%, transparent);
    box-shadow:
      var(--rpg-loot-icon-shadow),
      0 0 0 3px color-mix(in oklch, var(--rpg-art-gold, #d9a13c) 9%, transparent);
  }

  .rc-gem-icon img {
    width: 92%;
    height: 92%;
    object-fit: contain;
    pointer-events: none;
  }

  .rc-none {
    flex: 1;
    display: flex;
    align-items: center;
    font-size: 12px;
    color: var(--rpg-text-muted);
  }

  /* ── 次奖励清单 ── */
  .rc-sub {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-top: 8px;
    border-top: 1px dashed var(--rpg-border-subtle);
  }

  .rc-sub-row {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .rc-sub-icon {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
  }

  .rc-sub-icon :deep(img.rpg-loot-icon__img) {
    width: 96%;
    height: 96%;
  }

  .rc-sub-gem {
    width: 16px;
    height: 16px;
    object-fit: contain;
    flex-shrink: 0;
    margin: 0 3px;
  }

  .rc-sub-name {
    flex: 1;
    font-size: 11px;
    font-weight: 600;
    color: var(--rpg-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .rc-sub-kind {
    flex-shrink: 0;
    font-size: 10px;
    color: var(--rpg-text-muted);
  }
</style>
