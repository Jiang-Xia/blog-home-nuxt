<script setup lang="ts">
/**
   * 首页 RPG 冒险引导区块 — 向所有访客展示玩法，强化参与感
   */
const props = withDefaults(
  defineProps<{
    /** 首页首屏：贴底布局，未登录时预览卡片下边对齐视口下沿（不展示底部玩法宫格） */
    firstScreen?: boolean;
  }>(),
  { firstScreen: false },
);

const token = useToken();
const userInfo = useUserInfo();
const { rpgStatus, signInfo, questProgressText, claimableQuests } = useRpg();

const isLoggedIn = computed(() => !!token.value && !!userInfo.value?.uid);

const gameplaySteps = [
  { icon: '📅', title: '每日签到', desc: '登录冒险页签到，稳定获取 EXP 与抽奖券' },
  { icon: '💬', title: '阅读互动', desc: '评论、点赞、收藏文章，推进每日任务' },
  { icon: '🎁', title: '领取奖励', desc: '完成任务领 EXP、钻石，解锁称号与头像框' },
  { icon: '🏆', title: '冲榜社交', desc: '排行榜竞技，公会组队，宠物随行加成' },
];

const ctaTo = computed(() => (isLoggedIn.value ? '/rpg' : '/login'));
const ctaText = computed(() => {
  if (!isLoggedIn.value) return '登录开启冒险';
  if (claimableQuests.value.length > 0) return `领取 ${claimableQuests.value.length} 个任务奖励`;
  if (signInfo.value && !signInfo.value.signedToday) return '今日签到领 EXP';
  return '进入冒险大厅';
});

/** 首屏 compact 预览仅桌面端；移动端竖排用标准尺寸 */
const isLgUp = ref(import.meta.client ? window.matchMedia('(min-width: 1024px)').matches : false);

onMounted(() => {
  const mq = window.matchMedia('(min-width: 1024px)');
  const sync = () => {
    isLgUp.value = mq.matches;
  };
  sync();
  mq.addEventListener('change', sync);
  onBeforeUnmount(() => mq.removeEventListener('change', sync));
});

const previewDense = computed(() => props.firstScreen && isLgUp.value);
</script>

<template>
  <section
    class="rpg-home-banner rpg-theme"
    :class="firstScreen ? 'pb-0' : 'mx-auto max-w-6xl px-4 pb-4'"
  >
    <div
      class="relative overflow-hidden rounded-2xl border border-[var(--rpg-banner-border)] bg-[var(--rpg-banner-bg)]"
      :class="firstScreen ? 'p-4 lg:p-5' : 'p-6 md:p-8'"
    >
      <div
        class="pointer-events-none absolute -right-8 -top-8 text-[120px] opacity-[0.07] select-none"
      >
        ⚔️
      </div>

      <div
        class="relative flex flex-col lg:flex-row lg:justify-between"
        :class="[
          firstScreen ? 'gap-4' : 'gap-6',
          firstScreen && !isLoggedIn ? 'lg:items-end' : 'lg:items-center',
        ]"
      >
        <div class="max-w-xl">
          <p class="rpg-banner-label mb-1.5 text-xs font-semibold uppercase tracking-widest">
            RPG ADVENTURE
          </p>
          <h2
            class="font-bold text-[var(--rpg-text-heading)]"
            :class="firstScreen ? 'mb-2 text-xl lg:text-2xl' : 'mb-3 text-2xl md:text-3xl'"
          >
            把读博客变成<span class="text-[var(--rpg-amber-light)]">文字冒险</span>
          </h2>
          <p
            class="leading-relaxed text-[var(--rpg-text-secondary)]"
            :class="firstScreen ? 'mb-3 text-sm lg:text-base' : 'mb-4 text-sm md:text-base'"
          >
            不只是阅读——签到升级、做任务、抽卡开宝箱、养宠物、冲排行榜。
            每一次互动都在推进你的冒险进度。
          </p>

          <div
            v-if="isLoggedIn && rpgStatus"
            class="mb-4 inline-flex flex-wrap items-center gap-2 rounded-xl border border-[var(--rpg-border)] bg-[var(--rpg-surface)] px-3 py-2 text-sm"
          >
            <span
              class="rounded-md bg-[var(--rpg-level-badge-gradient)] px-2 py-0.5 text-xs font-bold text-white"
            >
              Lv.{{ rpgStatus.level }}
            </span>
            <span class="text-[var(--rpg-text-muted)]">·</span>
            <span class="text-[var(--rpg-text-body)]">任务 {{ questProgressText }}</span>
            <span v-if="claimableQuests.length" class="badge badge-warning badge-sm border-0">
              {{ claimableQuests.length }} 可领
            </span>
          </div>

          <div class="flex flex-wrap gap-2.5">
            <CyberButton
              variant="primary"
              :to="ctaTo"
              :class="firstScreen ? '!px-5 !py-2.5 text-sm' : '!px-6 !py-3'"
            >
              ⚔️ {{ ctaText }}
            </CyberButton>
            <CyberButton
              variant="secondary"
              to="/rpg?tab=leaderboard"
              :class="firstScreen ? '!px-5 !py-2.5 text-sm' : '!px-6 !py-3'"
            >
              查看排行榜
            </CyberButton>
          </div>
        </div>

        <RpgPreviewDemo
          v-if="!isLoggedIn"
          :dense="previewDense"
          class="w-full shrink-0 lg:max-w-sm"
        />

        <div v-else class="grid min-w-0 flex-1 grid-cols-2 gap-3 sm:max-w-md lg:max-w-none">
          <div
            v-for="step in gameplaySteps"
            :key="step.title"
            class="rounded-xl border border-[var(--rpg-border-subtle)] bg-[var(--rpg-surface)] p-3 transition-transform hover:scale-[1.02]"
          >
            <div class="mb-1 text-xl">
              {{ step.icon }}
            </div>
            <div class="text-sm font-semibold text-[var(--rpg-text-heading)]">
              {{ step.title }}
            </div>
            <div class="mt-0.5 text-xs leading-snug text-[var(--rpg-text-muted)]">
              {{ step.desc }}
            </div>
          </div>
        </div>
      </div>

      <!-- 首屏未登录：底部宫格会撑高 Banner，导致预览卡片无法贴齐视口下沿 -->
      <div
        v-if="!isLoggedIn && !firstScreen"
        class="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        <div
          v-for="step in gameplaySteps"
          :key="step.title"
          class="rounded-xl border border-[var(--rpg-border-subtle)] bg-[var(--rpg-surface)] p-3 text-center"
        >
          <div class="mb-1 text-xl">
            {{ step.icon }}
          </div>
          <div class="text-xs font-semibold text-[var(--rpg-text-heading)]">
            {{ step.title }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
