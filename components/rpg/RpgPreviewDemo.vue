<script setup lang="ts">
/**
   * 未登录访客 RPG 试玩预览 — 动效演示玩法闭环
   */
withDefaults(
  defineProps<{
    /** 首页首屏紧凑展示，降低卡片总高度 */
    dense?: boolean;
  }>(),
  { dense: false },
);

const demoLevel = ref(1);
const demoExp = ref(35);
const demoQuestDone = ref(1);
const demoQuestTotal = 4;
const demoPhase = ref(0);

const phases = [
  { icon: '📅', text: '每日签到 +10 EXP' },
  { icon: '💬', text: '评论文章推进任务' },
  { icon: '🎁', text: '领取奖励升级' },
  { icon: '🎰', text: '抽奖开宝箱' },
];

let timer: ReturnType<typeof setInterval> | null = null;

const startDemo = () => {
  timer = setInterval(() => {
    demoPhase.value = (demoPhase.value + 1) % phases.length;

    demoExp.value = Math.min(100, demoExp.value + 18);
    if (demoExp.value >= 100) {
      demoExp.value = 20;
      demoLevel.value = Math.min(15, demoLevel.value + 1);
    }

    if (demoPhase.value === 2 && demoQuestDone.value < demoQuestTotal) {
      demoQuestDone.value += 1;
    }
    if (demoQuestDone.value >= demoQuestTotal && demoPhase.value === 0) {
      demoQuestDone.value = 1;
    }
  }, 2200);
};

onMounted(startDemo);
onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <div
    class="rpg-preview-demo rpg-theme relative overflow-hidden rounded-2xl border border-[var(--rpg-violet-bg)] bg-[var(--rpg-surface)] shadow-lg"
    :class="dense ? 'p-3' : 'p-4'"
  >
    <div class="flex items-center justify-between gap-2" :class="dense ? 'mb-2' : 'mb-3'">
      <span class="badge badge-sm border-0 bg-[var(--rpg-violet-bg)] text-[var(--rpg-violet)]">
        试玩预览
      </span>
      <span class="text-[10px] text-[var(--rpg-text-muted)]">登录后数据实时同步</span>
    </div>

    <div class="flex items-center gap-3" :class="dense ? 'mb-2.5' : 'mb-4'">
      <div
        class="flex items-center justify-center rounded-xl bg-[var(--rpg-amber-bg-faint)] text-2xl"
        :class="dense ? 'h-10 w-10 text-xl' : 'h-12 w-12'"
      >
        🧙
      </div>
      <div class="min-w-0 flex-1">
        <div class="mb-1 flex items-center gap-2">
          <span class="text-sm font-semibold text-[var(--rpg-text-heading)]">冒险者·路人</span>
          <RpgLevelBadge :level="demoLevel" variant="author" size="sm" />
        </div>
        <div class="flex items-center gap-2 text-[10px] text-[var(--rpg-text-muted)]">
          <span>EXP</span>
          <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--rpg-track)]">
            <div
              class="h-full rounded-full transition-all duration-700"
              :style="{ width: demoExp + '%', background: 'var(--rpg-exp-gradient)' }"
            />
          </div>
          <span>{{ demoExp }}%</span>
        </div>
      </div>
    </div>

    <div
      class="rounded-xl border border-[var(--rpg-border-subtle)] bg-[var(--rpg-bg-alt)]"
      :class="dense ? 'mb-2 p-2.5' : 'mb-3 p-3'"
    >
      <div class="mb-1 flex items-center justify-between text-xs">
        <span class="font-medium text-[var(--rpg-text-body)]">每日任务</span>
        <span class="text-[var(--rpg-text-muted)]">{{ demoQuestDone }}/{{ demoQuestTotal }}</span>
      </div>
      <div class="h-1.5 overflow-hidden rounded-full bg-[var(--rpg-track)]">
        <div
          class="h-full rounded-full transition-all duration-700"
          :style="{
            width: (demoQuestDone / demoQuestTotal) * 100 + '%',
            background: 'var(--rpg-progress-green)',
          }"
        />
      </div>
    </div>

    <Transition name="rpg-phase" mode="out-in">
      <div
        :key="demoPhase"
        class="flex items-center gap-2 rounded-lg bg-[var(--rpg-amber-bg-faint)] text-[var(--rpg-amber-text)]"
        :class="dense ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm'"
      >
        <span :class="dense ? 'text-base' : 'text-lg'">{{ phases[demoPhase].icon }}</span>
        <span>{{ phases[demoPhase].text }}</span>
      </div>
    </Transition>

    <div
      class="grid grid-cols-3 gap-2 text-center text-[10px] text-[var(--rpg-text-muted)]"
      :class="dense ? 'mt-2.5' : 'mt-4'"
    >
      <div class="rounded-lg bg-[var(--rpg-empty-bg)]" :class="dense ? 'py-1.5' : 'py-2'">
        <div class="text-base">
          💎
        </div>
        <div>打赏</div>
      </div>
      <div class="rounded-lg bg-[var(--rpg-empty-bg)]" :class="dense ? 'py-1.5' : 'py-2'">
        <div class="flex justify-center" :class="dense ? 'mb-0.5' : 'mb-1'">
          <RpgItemIcon icon="slime" rarity-color="#4ade80" size="sm" />
        </div>
        <div>宠物</div>
      </div>
      <div class="rounded-lg bg-[var(--rpg-empty-bg)]" :class="dense ? 'py-1.5' : 'py-2'">
        <div class="text-base">
          🏆
        </div>
        <div>排行</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .rpg-phase-enter-active,
  .rpg-phase-leave-active {
    transition: all 0.35s ease;
  }

  .rpg-phase-enter-from {
    opacity: 0;
    transform: translateY(6px);
  }

  .rpg-phase-leave-to {
    opacity: 0;
    transform: translateY(-6px);
  }
</style>
