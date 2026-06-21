import { ref } from 'vue';
import { createSharedComposable } from '@vueuse/core';

/**
 * 抽奖动画会话（蓄力 → 滚轮 → 揭晓/汇总 → 关闭）
 * - begin：API 发起前标记活跃，清空待播放队列
 * - end：动画关闭后依次 flush 队列中的庆祝/特效回调
 * - deferCelebration：会话活跃时入队，否则立即执行
 */
export const useRpgLotterySession = createSharedComposable(() => {
  const active = ref(false);
  const pendingCelebrations: Array<() => void> = [];

  const beginLotteryDrawSession = () => {
    active.value = true;
    pendingCelebrations.length = 0;
  };

  const endLotteryDrawSession = () => {
    active.value = false;
    const tasks = pendingCelebrations.splice(0);
    for (const task of tasks) {
      task();
    }
  };

  const deferCelebration = (task: () => void) => {
    if (active.value) {
      pendingCelebrations.push(task);
      return;
    }
    task();
  };

  return {
    lotteryDrawSessionActive: active,
    beginLotteryDrawSession,
    endLotteryDrawSession,
    deferCelebration,
  };
});
