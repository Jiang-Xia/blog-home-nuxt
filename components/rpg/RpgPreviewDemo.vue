<script setup lang="ts">
/**
   * 未登录访客 RPG 试玩预览 — 动效演示玩法闭环
   */
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
    class="rpg-preview-demo rpg-theme relative overflow-hidden rounded-2xl border border-[var(--rpg-violet-bg)] bg-[var(--rpg-surface)] p-4 shadow-lg"
  >
    <div class="mb-3 flex items-center justify-between gap-2">
      <span class="badge badge-sm border-0 bg-[var(--rpg-violet-bg)] text-[var(--rpg-violet)]">
        试玩预览
      </span>
      <span class="text-[10px] text-[var(--rpg-text-muted)]">登录后数据实时同步</span>
    </div>

    <div class="mb-4 flex items-center gap-3">
      <div
        class="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--rpg-amber-bg-faint)] text-2xl"
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
      class="mb-3 rounded-xl border border-[var(--rpg-border-subtle)] bg-[var(--rpg-bg-alt)] p-3"
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
        class="flex items-center gap-2 rounded-lg bg-[var(--rpg-amber-bg-faint)] px-3 py-2 text-sm text-[var(--rpg-amber-text)]"
      >
        <span class="text-lg">{{ phases[demoPhase].icon }}</span>
        <span>{{ phases[demoPhase].text }}</span>
      </div>
    </Transition>

    <div class="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] text-[var(--rpg-text-muted)]">
      <div class="rounded-lg bg-[var(--rpg-empty-bg)] py-2">
        <div class="text-base">
          💎
        </div>
        <div>打赏</div>
      </div>
      <div class="rounded-lg bg-[var(--rpg-empty-bg)] py-2">
        <div class="text-base">
          🐾
        </div>
        <div>宠物</div>
      </div>
      <div class="rounded-lg bg-[var(--rpg-empty-bg)] py-2">
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
