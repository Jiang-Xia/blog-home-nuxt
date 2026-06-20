<script setup lang="ts">
/**
   * 可领取任务浮动提醒 — 引导用户回到冒险页领取奖励
   */
import { useRpg } from '~~/composables/use-rpg';

const { playSfx } = useRpgAudio();
const { claimableQuests, questProgressText } = useRpg();

const dismissed = ref(false);

const visible = computed(() => !dismissed.value && claimableQuests.value.length > 0);

const dismiss = () => {
  void playSfx('uiClick');
  dismissed.value = true;
};

watch(
  () => claimableQuests.value.length,
  (count) => {
    if (count > 0) dismissed.value = false;
  },
);
</script>

<template>
  <Transition name="rpg-float">
    <NuxtLink
      v-if="visible"
      to="/rpg?tab=status"
      class="rpg-quest-floater rpg-theme fixed bottom-24 left-4 z-[10015] flex max-w-[240px] items-start gap-3 rounded-2xl border border-[var(--rpg-amber-border)] bg-[var(--rpg-surface)] p-3 shadow-xl no-underline backdrop-blur-md"
    >
      <span class="text-2xl leading-none">🎁</span>
      <div class="min-w-0 flex-1">
        <p class="mb-0.5 text-sm font-semibold text-[var(--rpg-text-heading)]"> 任务奖励待领取 </p>
        <p class="text-xs text-[var(--rpg-text-muted)]">
          {{ claimableQuests.length }} 个任务已完成 · 总进度 {{ questProgressText }}
        </p>
        <span class="mt-1 inline-block text-xs font-medium text-[var(--rpg-amber-text)]">
          点击领取 →
        </span>
      </div>
      <button
        type="button"
        class="btn btn-ghost btn-xs btn-circle shrink-0 text-[var(--rpg-text-muted)]"
        aria-label="关闭"
        @click.prevent="dismiss"
      >
        ✕
      </button>
    </NuxtLink>
  </Transition>
</template>

<style scoped>
  .rpg-float-enter-active,
  .rpg-float-leave-active {
    transition: all 0.35s ease;
  }

  .rpg-float-enter-from,
  .rpg-float-leave-to {
    opacity: 0;
    transform: translateX(-16px);
  }
</style>
