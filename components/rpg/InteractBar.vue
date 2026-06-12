<script setup lang="ts">
/**
   * 互动场景 RPG 提示条 - 用于评论区/留言板输入框附近
   */
import { useRpg } from '~~/composables/use-rpg';
import { useRpgSocket } from '~~/composables/use-rpg-socket';

const userInfo = useUserInfo();
const { rpgStatus, banStatus, isBanned, initRpgInteract, fetchBanStatus } = useRpg();

const { connect, onLifeChange, onBanStatus } = useRpgSocket();

onLifeChange.value = (data: { currentLife: number }) => {
  if (rpgStatus.value) {
    rpgStatus.value.lifeValue = data.currentLife;
  }
};

onBanStatus.value = (data: { banned: boolean; banEndTime: string | null }) => {
  if (banStatus.value) {
    banStatus.value.banned = data.banned;
    banStatus.value.banEndTime = data.banEndTime;
  }
  else {
    fetchBanStatus();
  }
};

onMounted(async () => {
  if (!userInfo.value?.uid) return;
  await initRpgInteract();
  connect();
});

watch(
  () => userInfo.value?.uid,
  async (uid) => {
    if (uid) {
      await initRpgInteract();
      connect();
    }
  },
);
</script>

<template>
  <div v-if="userInfo?.uid && rpgStatus" class="rpg-interact-bar">
    <RpgBanWarning :ban-status="banStatus" />
    <div v-if="!isBanned" class="interact-hint">
      <RpgLifeIndicator :life-value="rpgStatus.lifeValue" />
      <span class="hint-text">命中敏感词将按等级扣除生命，生命归零可能触发禁言</span>
    </div>
  </div>
</template>

<style scoped>
  .rpg-interact-bar {
    margin-bottom: 8px;
  }

  .interact-hint {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .hint-text {
    font-size: 11px;
    color: #94a3b8;
    line-height: 1.4;
  }
</style>
