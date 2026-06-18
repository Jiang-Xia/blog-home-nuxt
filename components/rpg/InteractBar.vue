<script setup lang="ts">
/**
   * 互动场景 RPG 提示条 - 用于评论区/留言板输入框附近
   */
import { useRpg } from '~~/composables/use-rpg';
import { useRpgSocket } from '~~/composables/use-rpg-socket';

const userInfo = useUserInfo();
const {
  rpgStatus,
  banStatus,
  isBanned,
  quests,
  questProgressText,
  claimableQuests,
  initRpgInteract,
  fetchBanStatus,
  fetchQuests,
} = useRpg();

const { on } = useRpgSocket();

on('lifeChange', (data: { currentLife: number }) => {
  if (rpgStatus.value) {
    rpgStatus.value.lifeValue = data.currentLife;
  }
});

on('banStatus', (data: { banned: boolean; banEndTime: string | null }) => {
  if (banStatus.value) {
    banStatus.value.banned = data.banned;
    banStatus.value.banEndTime = data.banEndTime;
  }
  else {
    fetchBanStatus();
  }
});

onMounted(async () => {
  if (!userInfo.value?.uid) return;
  await Promise.all([initRpgInteract(), fetchQuests()]);
});

watch(
  () => userInfo.value?.uid,
  async (uid) => {
    if (uid) {
      await Promise.all([initRpgInteract(), fetchQuests()]);
    }
  },
);

const activeQuestHints = computed(() => {
  const hints: string[] = [];
  const pending = quests.value.filter(q => !q.completed);
  for (const q of pending.slice(0, 2)) {
    hints.push(`${q.name} (${q.progress}/${q.targetCount})`);
  }
  return hints;
});
</script>

<template>
  <div v-if="userInfo?.uid && rpgStatus" class="rpg-interact-bar rpg-theme">
    <RpgBanWarning :ban-status="banStatus" />
    <div v-if="!isBanned" class="interact-panel">
      <div class="interact-hint">
        <RpgLifeIndicator :life-value="rpgStatus.lifeValue" />
        <span class="hint-text">评论/互动推进任务 · 敏感词扣生命</span>
      </div>
      <div class="interact-quests">
        <NuxtLink to="/rpg" class="quest-link">
          <span class="quest-badge">⚔️ 冒险</span>
          <span class="quest-progress">任务 {{ questProgressText }}</span>
          <span v-if="claimableQuests.length" class="claim-dot">{{ claimableQuests.length }} 可领</span>
        </NuxtLink>
        <span v-for="(hint, i) in activeQuestHints" :key="i" class="quest-hint-item">{{
          hint
        }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .rpg-interact-bar {
    margin-bottom: 8px;
  }

  .interact-panel {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px 10px;
    border-radius: 8px;
    border: 1px solid var(--rpg-border-subtle);
    background: var(--rpg-bg-alt);
  }

  .interact-hint {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .hint-text {
    font-size: 11px;
    color: var(--rpg-text-muted);
    line-height: 1.4;
  }

  .interact-quests {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px 10px;
  }

  .quest-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    text-decoration: none;
    color: var(--rpg-text-body);
    padding: 2px 8px;
    border-radius: 999px;
    background: var(--rpg-amber-bg-faint);
    border: 1px solid var(--rpg-amber-border);
    transition: transform 0.15s ease;
  }

  .quest-link:hover {
    transform: scale(1.02);
    color: var(--rpg-amber-text);
  }

  .quest-badge {
    font-weight: 600;
  }

  .quest-progress {
    color: var(--rpg-text-muted);
  }

  .claim-dot {
    font-weight: 600;
    color: var(--rpg-amber-text);
  }

  .quest-hint-item {
    font-size: 10px;
    color: var(--rpg-text-muted);
    padding: 1px 6px;
    border-radius: 4px;
    background: var(--rpg-empty-bg);
  }
</style>
