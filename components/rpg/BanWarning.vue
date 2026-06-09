<script setup lang="ts">
/**
   * 禁言警告组件 - 在禁言状态下显示禁言原因、剩余时间和解封提醒
   */
import type { BanStatus } from '~~/types/rpg';
import dayjs from 'dayjs';

const props = defineProps<{
  banStatus: BanStatus | null;
}>();

const remainingText = computed(() => {
  if (!props.banStatus?.banned || !props.banStatus.banEndTime) return '';
  const end = dayjs(props.banStatus.banEndTime);
  const now = dayjs();
  const diffMs = end.diff(now, 'millisecond');
  if (diffMs <= 0) return '即将解封';
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}天${hours % 24}小时`;
  }
  return `${hours}小时${minutes}分钟`;
});

const banEndTimeText = computed(() => {
  if (!props.banStatus?.banEndTime) return '';
  return dayjs(props.banStatus.banEndTime).format('YYYY-MM-DD HH:mm');
});
</script>

<template>
  <div v-if="banStatus?.banned" class="ban-warning">
    <div class="ban-icon">
      🔇
    </div>
    <div class="ban-info">
      <div class="ban-title">
        您已被禁言
      </div>
      <div class="ban-detail">
        剩余时间: <strong>{{ remainingText }}</strong>
      </div>
      <div class="ban-end-time">
        解封时间: {{ banEndTimeText }}
      </div>
      <div class="ban-tip">
        禁言期间无法签到、评论、留言和回复，但可以正常浏览内容
      </div>
    </div>
  </div>
</template>

<style scoped>
  .ban-warning {
    display: flex;
    gap: 12px;
    padding: 16px;
    border-radius: 12px;
    background: linear-gradient(135deg, #fef2f2, #fee2e2);
    border: 1px solid #fecaca;
    margin: 12px 0;
  }

  .ban-icon {
    font-size: 32px;
    flex-shrink: 0;
  }

  .ban-info {
    flex: 1;
  }

  .ban-title {
    font-size: 16px;
    font-weight: 700;
    color: #dc2626;
    margin-bottom: 6px;
  }

  .ban-detail {
    font-size: 14px;
    color: #991b1b;
    margin-bottom: 4px;
  }

  .ban-end-time {
    font-size: 12px;
    color: #b91c1c;
    margin-bottom: 8px;
  }

  .ban-tip {
    font-size: 12px;
    color: #6b7280;
    line-height: 1.4;
  }
</style>
