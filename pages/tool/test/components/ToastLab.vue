<script setup lang="ts">
import {
  messageDanger,
  messageError,
  messageInfo,
  messageSuccess,
  messageWarning,
  showToast,
} from '~~/utils/toast';

const toastItems = [
  { label: 'Info', run: () => messageInfo('这是一条 Info 提示') },
  { label: 'Success', btnClass: 'btn-success', run: () => messageSuccess('操作成功') },
  { label: 'Warning', btnClass: 'btn-warning', run: () => messageWarning('请注意检查参数') },
  { label: 'Error', btnClass: 'btn-error', run: () => messageError('请求失败，请稍后重试') },
  {
    label: 'Danger',
    btnClass: 'btn-error btn-outline',
    run: () => messageDanger('危险操作已拦截'),
  },
  {
    label: 'Action',
    btnClass: 'btn-outline',
    run: () =>
      showToast({
        description: '需要登录才能继续操作',
        color: 'warning',
        duration: 5000,
        actions: [
          {
            label: '去登录',
            icon: 'i-lucide-log-in',
            color: 'info',
            variant: 'outline',
          },
        ],
      }),
  },
];
</script>

<template>
  <div class="toast-lab">
    <p class="toast-lab-tip">
      测试全站 Toast 队列（cyber 玻璃态 + RPG 语义色，含去重、间隔与 Action 按钮）。
    </p>
    <div class="toast-lab-actions">
      <button
        v-for="item in toastItems"
        :key="item.label"
        type="button"
        class="btn btn-sm btn-outline"
        :class="item.btnClass"
        @click="item.run()"
      >
        {{ item.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
  .toast-lab-tip {
    font-size: 12px;
    line-height: 1.5;
    color: oklch(var(--bc) / 0.62);
    margin-bottom: 10px;
  }

  .toast-lab-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
</style>
