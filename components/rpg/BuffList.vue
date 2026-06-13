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

    <div v-else class="buff-list">
      <div
        v-for="buff in buffs"
        :key="buff.id"
        class="buff-item"
        :style="{ borderColor: BUFF_TYPE_MAP[buff.buffType]?.color || '#ccc' }"
      >
        <div
          class="buff-icon"
          :style="{ backgroundColor: BUFF_TYPE_MAP[buff.buffType]?.color + '20' }"
        >
          {{ BUFF_TYPE_MAP[buff.buffType]?.icon || '✨' }}
        </div>
        <div class="buff-info">
          <div class="buff-name">
            {{ buff.name }}
          </div>
          <div class="buff-effect">
            {{ getEffectText(buff) }}
          </div>
          <div class="buff-timer">
            <div class="timer-bar">
              <div
                class="timer-bar-fill"
                :style="{
                  width: getRemainingPercent(buff) + '%',
                  backgroundColor: BUFF_TYPE_MAP[buff.buffType]?.color || '#ccc',
                }"
              />
            </div>
            <span class="timer-text">{{ getRemainingText(buff.expireAt) }}</span>
          </div>
          <button
            v-if="(buff as any).triggerMode === 'manual'"
            class="btn btn-xs mt-1"
            :class="(buff as any).isActive ? 'btn-ghost' : 'btn-primary'"
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
    color: #475569;
    margin-bottom: 8px;
  }

  .buff-count {
    font-size: 11px;
    padding: 1px 6px;
    border-radius: 10px;
    background: #ede9fe;
    color: #7c3aed;
    font-weight: 700;
  }

  .buff-empty {
    font-size: 12px;
    color: #94a3b8;
    padding: 12px;
    text-align: center;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px dashed #e2e8f0;
  }

  .buff-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(188px, 1fr));
    gap: 10px;
  }

  .buff-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px;
    border-radius: 10px;
    background: white;
    border: 1.5px solid;
    transition: transform 0.2s;
    min-height: 120px;
  }

  .buff-item:hover {
    transform: translateY(-1px);
  }

  .buff-icon {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
  }

  .buff-info {
    flex: 1;
    min-width: 0;
  }

  .buff-name {
    font-size: 13px;
    font-weight: 700;
    color: #1e293b;
  }

  .buff-effect {
    font-size: 11px;
    color: #64748b;
    margin-top: 1px;
  }

  .buff-timer {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
  }

  .timer-bar {
    flex: 1;
    height: 4px;
    background: #e2e8f0;
    border-radius: 2px;
    overflow: hidden;
  }

  .timer-bar-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 1s linear;
  }

  .timer-text {
    font-size: 10px;
    color: #94a3b8;
    white-space: nowrap;
    min-width: 60px;
    text-align: right;
  }
</style>
