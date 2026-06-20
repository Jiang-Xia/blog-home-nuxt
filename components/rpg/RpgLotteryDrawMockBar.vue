<script setup lang="ts">
/**
   * 开发：抽奖 API 完成后联动注入指定弹窗，便于测试与 DrawOverlay 层叠
   */
import type { RpgStatus } from '~~/types/rpg';
import {
  getLotteryDrawMockKey,
  RPG_LOTTERY_DRAW_MOCK_OPTIONS,
  setLotteryDrawMockKey,
} from '~~/utils/rpg-dev-mock';

defineProps<{
  status?: RpgStatus | null;
}>();

const isDev = import.meta.dev;
const selectedKey = ref('off');

const selectableOptions = RPG_LOTTERY_DRAW_MOCK_OPTIONS.filter(o => o.key !== 'off');

onMounted(() => {
  // 恢复 localStorage 中的挡板选项
  if (isDev && import.meta.client) {
    selectedKey.value = getLotteryDrawMockKey();
  }
});

/** 选项变更时写入 localStorage，供 triggerMockAfterLotteryDraw 读取 */
watch(selectedKey, (key) => {
  if (isDev) setLotteryDrawMockKey(key);
});
</script>

<template>
  <div v-if="isDev" class="lottery-draw-mock">
    <label class="mock-label" for="lottery-draw-mock-select"> 抽奖联动弹窗测试 </label>
    <select
      id="lottery-draw-mock-select"
      v-model="selectedKey"
      class="mock-select select select-xs select-bordered w-full max-w-xs"
    >
      <option value="off">
        关闭
      </option>
      <option v-for="opt in selectableOptions" :key="opt.key" :value="opt.key">
        {{ opt.icon ? `${opt.icon} ` : '' }}{{ opt.label }}
      </option>
    </select>
    <p v-if="selectedKey !== 'off'" class="mock-hint">
      API 返回约 0.6s 后注入，通常落在滚轮/揭晓阶段，可测层叠
    </p>
  </div>
</template>

<style scoped>
  .lottery-draw-mock {
    margin-bottom: 12px;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px dashed rgb(245 158 11 / 0.4);
    background: rgb(245 158 11 / 0.06);
  }

  .mock-label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: var(--rpg-text-label, oklch(var(--bc) / 0.65));
    margin-bottom: 6px;
  }

  .mock-select {
    font-size: 12px;
  }

  .mock-hint {
    margin: 6px 0 0;
    font-size: 10px;
    color: var(--rpg-text-muted, oklch(var(--bc) / 0.5));
    line-height: 1.45;
  }
</style>
