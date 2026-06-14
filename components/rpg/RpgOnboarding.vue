<script setup lang="ts">
/**
   * RPG 新手引导 — 首次进入 /rpg 时展示玩法说明
   */
const STORAGE_KEY = 'rpg-onboarding-v1';

const route = useRoute();
const visible = ref(false);
const step = ref(0);

const steps = [
  {
    icon: '⚔️',
    title: '欢迎来到 RPG 冒险',
    desc: '在这个博客里，每一次阅读、评论、点赞都是一次冒险行动。积累 EXP 升级，解锁称号与装扮。',
    tip: '建议先完成每日签到，再去做任务。',
  },
  {
    icon: '📅',
    title: '每日签到 & 生命',
    desc: '签到获得 EXP 和抽奖券，同时恢复生命值。评论时注意文明用语——命中敏感词会扣生命，归零可能触发禁言。',
    tip: '生命条在评论区和冒险页都能看到。',
  },
  {
    icon: '📋',
    title: '任务驱动参与',
    desc: '每日任务、悬赏、特殊任务覆盖评论、收藏、点赞、打赏等行为。完成后记得回来领取奖励。',
    tip: '文章页右下角 ⚔️ 按钮可快速互动赚经验。',
  },
  {
    icon: '🎒',
    title: '背包 · 抽奖 · 宠物',
    desc: '升级解锁头像框与称号；抽奖池可开出 Buff、钻石、成就；宠物出战提供被动 EXP 加成。',
    tip: '顶部 Tab 可切换背包、宠物、公会。',
  },
  {
    icon: '🏆',
    title: '开始你的冒险',
    desc: '冲排行榜、加入公会、访问他人主页送花/加油。你的等级和装扮会展示在公开名片上。',
    tip: '导航栏 HUD 随时显示你的等级与任务进度。',
  },
];

const current = computed(() => steps[step.value]);
const isLast = computed(() => step.value >= steps.length - 1);

const open = () => {
  visible.value = true;
  step.value = 0;
};

const close = (persist = true) => {
  visible.value = false;
  if (persist && import.meta.client) {
    localStorage.setItem(STORAGE_KEY, '1');
  }
};

const next = () => {
  if (isLast.value) {
    close(true);
    return;
  }
  step.value += 1;
};

const skip = () => close(true);

onMounted(() => {
  if (!import.meta.client) return;
  if (route.query.onboarding === '1') {
    open();
    return;
  }
  if (!localStorage.getItem(STORAGE_KEY)) {
    open();
  }
});

defineExpose({ open });
</script>

<template>
  <dialog class="modal rpg-theme" :class="{ 'modal-open': visible }">
    <div class="modal-box rpg-onboarding-box max-w-md p-0 overflow-hidden">
      <div class="rpg-onboarding-header px-6 pt-6 pb-4">
        <div class="mb-3 flex items-center justify-between">
          <span
            class="text-xs font-semibold uppercase tracking-widest text-[var(--rpg-banner-label)]"
          >
            新手引导 {{ step + 1 }}/{{ steps.length }}
          </span>
          <button type="button" class="btn btn-ghost btn-xs" @click="skip">
            跳过
          </button>
        </div>
        <div class="mb-2 text-4xl">
          {{ current.icon }}
        </div>
        <h3 class="text-xl font-bold text-[var(--rpg-text-heading)]">
          {{ current.title }}
        </h3>
      </div>

      <div class="px-6 pb-2">
        <p class="mb-3 text-sm leading-relaxed text-[var(--rpg-text-body)]">
          {{ current.desc }}
        </p>
        <div
          class="rounded-lg border border-[var(--rpg-amber-border)] bg-[var(--rpg-amber-bg-faint)] px-3 py-2 text-xs text-[var(--rpg-amber-text-soft)]"
        >
          💡 {{ current.tip }}
        </div>

        <div class="mt-4 flex justify-center gap-1.5">
          <span
            v-for="(_, i) in steps"
            :key="i"
            class="h-1.5 rounded-full transition-all"
            :class="i === step ? 'w-6 bg-[var(--rpg-amber)]' : 'w-1.5 bg-[var(--rpg-track)]'"
          />
        </div>
      </div>

      <div class="modal-action px-6 pb-6 pt-4">
        <button v-if="step > 0" type="button" class="btn btn-ghost btn-sm" @click="step -= 1">
          上一步
        </button>
        <button type="button" class="btn btn-primary btn-sm" @click="next">
          {{ isLast ? '开始冒险' : '下一步' }}
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop" @click="skip">
      <button>close</button>
    </form>
  </dialog>
</template>

<style scoped>
  .rpg-onboarding-box {
    background: var(--rpg-surface);
    border: 1px solid var(--rpg-border);
  }

  .rpg-onboarding-header {
    background: var(--rpg-banner-bg);
    border-bottom: 1px solid var(--rpg-banner-border);
  }
</style>
