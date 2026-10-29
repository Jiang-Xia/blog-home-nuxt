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
      <img class="ban-icon__art" src="/rpg/icons/megaphone.png" alt="">
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
  /* v6/I2：灰章 + 红左缘警示（同 H 敏感词卡纪律感语言） */
  .ban-warning {
    display: flex;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 0 12px 12px 0;
    border: 1px solid var(--rpg-danger-border);
    border-left: 4px solid var(--rpg-danger);
    background: linear-gradient(
      90deg,
      var(--rpg-danger-bg),
      color-mix(in srgb, var(--rpg-danger-bg) 55%, transparent)
    );
    margin: 12px 0;
  }

  .ban-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    border: 2px solid var(--rpg-danger-border);
    background: var(--rpg-surface);
  }

  .ban-icon__art {
    width: 22px;
    height: 22px;
    object-fit: contain;
    filter: grayscale(0.35) opacity(0.85);
  }

  .ban-info {
    flex: 1;
  }

  .ban-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--rpg-danger);
    margin-bottom: 6px;
  }

  .ban-detail {
    font-size: 14px;
    color: var(--rpg-danger-text);
    margin-bottom: 4px;
  }

  .ban-end-time {
    font-size: 12px;
    color: var(--rpg-danger-text-soft);
    margin-bottom: 8px;
  }

  .ban-tip {
    font-size: 12px;
    color: var(--rpg-text-muted);
    line-height: 1.4;
  }
</style>
