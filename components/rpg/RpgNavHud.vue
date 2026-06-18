<script setup lang="ts">
/**
   * 导航栏 RPG 状态 HUD — 登录后全站可见，强化参与感
   */
import { useRpg } from '~~/composables/use-rpg';

const {
  rpgStatus,
  signInfo,
  expProgress,
  lifePercent,
  lifeColor,
  claimableQuests,
  questProgressText,
  loading,
} = useRpg();

const hasClaimable = computed(() => claimableQuests.value.length > 0);
const needSignIn = computed(() => signInfo.value && !signInfo.value.signedToday);
const showPulse = computed(() => hasClaimable.value || needSignIn.value);
</script>

<template>
  <NuxtLink
    v-if="rpgStatus"
    to="/rpg"
    class="rpg-nav-hud rpg-theme hidden items-center gap-2 rounded-xl border px-2.5 py-1.5 no-underline transition-all hover:scale-[1.02] md:flex"
    :class="[
      showPulse
        ? 'rpg-hud-pulse border-[var(--rpg-amber-border)] bg-[var(--rpg-amber-bg-faint)]'
        : 'border-[var(--rpg-border)] bg-[var(--rpg-bg-alt)]',
    ]"
    title="进入 RPG 冒险"
  >
    <span class="rpg-hud-level shrink-0 rounded-md px-1.5 py-0.5 text-xs font-bold text-white">
      Lv.{{ rpgStatus.level }}
    </span>

    <div class="hidden min-w-[72px] flex-col gap-0.5 lg:flex">
      <div
        class="flex items-center justify-between gap-1 text-[10px] leading-none text-[var(--rpg-text-muted)]"
      >
        <span>EXP</span>
        <span>{{ expProgress.percent }}%</span>
      </div>
      <div class="rpg-hud-exp-track h-1 w-full overflow-hidden rounded-full">
        <div
          class="rpg-hud-exp-fill h-full rounded-full transition-all duration-500"
          :style="{ width: expProgress.percent + '%' }"
        />
      </div>
    </div>

    <div
      class="hidden h-4 w-1 overflow-hidden rounded-full bg-[var(--rpg-life-track)] xl:block"
      :title="`生命 ${lifePercent}%`"
    >
      <div
        class="w-full rounded-full transition-all duration-500"
        :style="{
          height: lifePercent + '%',
          backgroundColor: lifeColor,
          marginTop: 100 - lifePercent + '%',
        }"
      />
    </div>

    <span v-if="hasClaimable" class="badge badge-warning badge-xs shrink-0 border-0 text-[10px]">
      {{ claimableQuests.length }} 可领
    </span>
    <span v-else-if="needSignIn" class="badge badge-primary badge-xs shrink-0 border-0 text-[10px]">
      签到
    </span>
    <span v-else class="hidden shrink-0 text-[10px] text-[var(--rpg-text-muted)] xl:inline">
      任务 {{ questProgressText }}
    </span>
  </NuxtLink>

  <NuxtLink
    v-else-if="!loading"
    to="/rpg"
    class="rpg-nav-hud rpg-theme hidden items-center gap-1.5 rounded-xl border border-[var(--rpg-amber-border)] bg-[var(--rpg-amber-bg-faint)] px-2.5 py-1.5 text-xs font-medium no-underline text-[var(--rpg-amber-text)] transition-all hover:scale-[1.02] md:flex"
  >
    ⚔️ 开始冒险
  </NuxtLink>
</template>

<style scoped>
  .rpg-hud-level {
    background: var(--rpg-level-badge-gradient);
    box-shadow: 0 1px 4px var(--rpg-level-shadow);
  }

  .rpg-hud-exp-track {
    background: var(--rpg-track);
  }

  .rpg-hud-exp-fill {
    background: var(--rpg-exp-gradient);
  }
</style>
