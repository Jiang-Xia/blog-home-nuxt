<script setup lang="ts">
import {
  messageDanger,
  messageError,
  messageInfo,
  messageSuccess,
  messageWarning,
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
];
</script>

<template>
  <div class="toast-lab">
    <p class="toast-lab-tip">
      测试全站 Toast 队列（含去重与间隔），与 RPG / 接口错误提示共用同一套封装。
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
