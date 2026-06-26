<script setup lang="ts">
/**
   * Buff列表组件 - 展示当前 Buff，带倒计时（纯展示）
   * 手动经验 Buff：未激活显示囤积期；激活中倒计时；停用后冻结 remainingMs
   */
import { BUFF_TYPE_MAP } from '~~/types/rpg';
import type { ManualExpBuffMeta, UserBuff, BuffType } from '~~/types/rpg';

const props = defineProps<{
  buffs: UserBuff[];
}>();

const emit = defineEmits<{
  toggle: [buff: UserBuff];
}>();

const toggleBuff = (buff: UserBuff) => {
  if (buff.triggerMode !== 'manual') return;
  emit('toggle', buff);
};

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

const getManualExpMeta = (buff: UserBuff): ManualExpBuffMeta | null => {
  if (buff.triggerMode !== 'manual' || buff.buffType !== 'exp_boost') return null;
  const meta = buff.effectJson as Partial<ManualExpBuffMeta> | null | undefined;
  if (!meta?.durationMinutes) return null;
  return {
    durationMinutes: meta.durationMinutes,
    activated: !!meta.activated,
    paused: !!meta.paused,
    remainingMs: meta.remainingMs,
  };
};

/** 未激活、仍在囤积期内 */
const isManualExpPending = (buff: UserBuff) => {
  const meta = getManualExpMeta(buff);
  return !!meta && !meta.activated;
};

/** 已激活过但当前停用（暂停计时） */
const isManualExpPaused = (buff: UserBuff) => {
  const meta = getManualExpMeta(buff);
  return !!meta?.activated && !buff.isActive;
};

const formatDuration = (diffMs: number): string => {
  if (diffMs <= 0) return '即将过期';
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  if (hours > 0) return `${hours}时${minutes}分${seconds}秒`;
  if (minutes > 0) return `${minutes}分${seconds}秒`;
  return `${seconds}秒`;
};

/** 效果剩余毫秒：暂停读 remainingMs，激活中读 expireAt 动态差值 */
const getEffectRemainingMs = (buff: UserBuff): number => {
  const meta = getManualExpMeta(buff);
  if (isManualExpPaused(buff)) {
    if (meta?.remainingMs != null) return meta.remainingMs;
    return Math.max(0, new Date(buff.expireAt).getTime() - now.value);
  }
  if (meta?.activated && buff.isActive) {
    return Math.max(0, new Date(buff.expireAt).getTime() - now.value);
  }
  return Math.max(0, new Date(buff.expireAt).getTime() - now.value);
};

/** 底部倒计时文案 */
const getTimeLabel = (buff: UserBuff): string => {
  const remaining = formatDuration(getEffectRemainingMs(buff));
  if (isManualExpPending(buff)) return `${remaining} 内可激活`;
  if (isManualExpPaused(buff)) return `${remaining} 效果剩余（已暂停）`;
  return remaining;
};

/** 进度条百分比 */
const getRemainingPercent = (buff: UserBuff): number => {
  const meta = getManualExpMeta(buff);
  if (isManualExpPending(buff)) {
    const created = new Date(buff.createTime).getTime();
    const expire = new Date(buff.expireAt).getTime();
    const total = expire - created;
    const remaining = expire - now.value;
    if (total <= 0) return 0;
    return Math.max(0, Math.min(100, (remaining / total) * 100));
  }

  const total = (meta?.durationMinutes ?? 0) * 60 * 1000;
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, (getEffectRemainingMs(buff) / total) * 100));
};

const getStatusText = (buff: UserBuff): string => {
  if (isManualExpPending(buff)) return '待激活';
  if (buff.triggerMode === 'manual' && buff.isActive) return '激活中';
  if (isManualExpPaused(buff)) return '已暂停';
  return '生效中';
};

const getStatusClass = (buff: UserBuff): string => {
  if (isManualExpPending(buff) || isManualExpPaused(buff)) return 'rpg-loot-status--pending';
  return 'rpg-loot-status--done';
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
          <span class="rpg-loot-status" :class="getStatusClass(buff)">
            {{ getStatusText(buff) }}
          </span>
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
            }"
          />
        </div>
        <div class="rpg-loot-footer">
          <div class="rpg-loot-meta">
            <span class="rpg-loot-progress-text">{{ getTimeLabel(buff) }}</span>
          </div>
          <button
            v-if="buff.triggerMode === 'manual'"
            class="rpg-loot-claim-btn"
            :class="{ 'rpg-loot-claim-btn--pause': buff.isActive }"
            @click="toggleBuff(buff)"
          >
            {{ buff.isActive ? '停用' : '激活' }}
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
