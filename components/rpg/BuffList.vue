<script setup lang="ts">
/**
   * Buff列表组件 - 展示当前激活的Buff，带倒计时（纯展示）
   */
import { BUFF_TYPE_MAP } from '~~/types/rpg';
import type { UserBuff, BuffType } from '~~/types/rpg';

const props = defineProps<{
  buffs: UserBuff[];
}>();

const emit = defineEmits<{
  toggle: [buff: UserBuff & { triggerMode?: string; isActive?: boolean }];
}>();

const toggleBuff = (buff: UserBuff & { triggerMode?: string; isActive?: boolean }) => {
  if (buff.triggerMode !== 'manual') return;
  emit('toggle', buff);
};

// 倒计时状态
const now = ref(Date.now());
let timer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now();
  }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

/** 获取Buff剩余时间文本 */
const getRemainingText = (expireAt: string): string => {
  const diff = new Date(expireAt).getTime() - now.value;
  if (diff <= 0) return '即将过期';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  if (hours > 0) return `${hours}时${minutes}分${seconds}秒`;
  if (minutes > 0) return `${minutes}分${seconds}秒`;
  return `${seconds}秒`;
};

/** 获取Buff剩余百分比（用于进度条） */
const getRemainingPercent = (buff: UserBuff): number => {
  const created = new Date(buff.createTime).getTime();
  const expire = new Date(buff.expireAt).getTime();
  const total = expire - created;
  const remaining = expire - now.value;
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, (remaining / total) * 100));
};

/** 格式化Buff效果描述 */
const getEffectText = (buff: UserBuff): string => {
  switch (buff.buffType as BuffType) {
    case 'exp_boost':
      return `经验+${Math.round(buff.value * 100)}%`;
    case 'hp_regen':
      return `生命恢复×${buff.value}`;
    case 'shield':
      return `剩余${buff.remainingUses}次`;
    case 'lucky':
      return `+${buff.value}经验`;
    default:
      return buff.description;
  }
};
</script>

<template>
  <div class="buff-section">
    <div class="section-title">
      <span>激活增益</span>
      <span v-if="buffs.length" class="buff-count">{{ buffs.length }}个</span>
    </div>

    <div v-if="buffs.length === 0" class="buff-empty">
      暂无激活的增益，签到有概率获得哦~
    </div>

    <div v-else class="rpg-loot-grid buff-list">
      <div v-for="buff in buffs" :key="buff.id" class="rpg-loot-card rpg-loot-card--buff">
        <div class="rpg-loot-card-head">
          <div
            class="rpg-loot-icon rpg-loot-icon--tinted"
            :style="{ background: BUFF_TYPE_MAP[buff.buffType]?.color || '#8b5cf6' }"
          >
            {{ BUFF_TYPE_MAP[buff.buffType]?.icon || '✨' }}
          </div>
          <span class="rpg-loot-status rpg-loot-status--done">激活中</span>
        </div>
        <div class="rpg-loot-name">
          {{ buff.name }}
        </div>
        <div class="rpg-loot-desc">
          {{ getEffectText(buff) }}
        </div>
        <div class="rpg-loot-progress">
          <div
            class="rpg-loot-progress__fill"
            :style="{
              width: getRemainingPercent(buff) + '%',
              background: BUFF_TYPE_MAP[buff.buffType]?.color || '#8b5cf6',
              boxShadow: `0 0 8px ${BUFF_TYPE_MAP[buff.buffType]?.color || '#8b5cf6'}55`,
            }"
          />
        </div>
        <div class="rpg-loot-footer">
          <div class="rpg-loot-meta">
            <span class="rpg-loot-progress-text">{{ getRemainingText(buff.expireAt) }}</span>
          </div>
          <button
            v-if="(buff as any).triggerMode === 'manual'"
            class="rpg-loot-claim-btn"
            :class="{ 'opacity-70': (buff as any).isActive }"
            @click="toggleBuff(buff as any)"
          >
            {{ (buff as any).isActive ? '停用' : '激活' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .buff-section {
    margin-top: 0;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
    color: var(--rpg-text-label);
    margin-bottom: 8px;
  }

  .buff-count {
    font-size: 11px;
    padding: 1px 6px;
    border-radius: 10px;
    background: var(--rpg-violet-bg);
    color: var(--rpg-violet);
    font-weight: 700;
  }

  .buff-empty {
    font-size: 12px;
    color: var(--rpg-text-muted);
    padding: 12px;
    text-align: center;
    background: var(--rpg-empty-bg);
    border-radius: 8px;
    border: 1px dashed var(--rpg-empty-border);
  }

  .buff-list .rpg-loot-card {
    min-height: 132px;
  }
</style>
