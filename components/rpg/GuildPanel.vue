<script setup lang="ts">
import { getGuildRoleLabel } from '~~/types/rpg';

const props = defineProps<{
  myGuild: any;
  guildList: any[];
  loading: boolean;
}>();

const emit = defineEmits<{
  create: [name: string];
  join: [guildId: number];
  leave: [];
}>();

const guildName = ref('');
const userInfo = useUserInfo();

const isLeader = computed(() => {
  const uid = userInfo.value?.uid;
  return !!uid && props.myGuild?.leaderUid === uid;
});
</script>

<template>
  <div class="guild-panel">
    <RpgPanelLoading v-if="loading" compact />
    <div v-else-if="myGuild" class="rpg-loot-card rpg-loot-card--active guild-mine">
      <div class="rpg-loot-card-head">
        <div class="rpg-loot-name">
          {{ myGuild.name }}
        </div>
        <span class="rpg-loot-status rpg-loot-status--done">我的公会</span>
      </div>
      <p class="rpg-loot-desc">
        {{ myGuild.announcement || '暂无公告' }}
      </p>
      <span class="rpg-chip-tag">👥 {{ myGuild.memberCount }} 人</span>
      <div
        v-if="myGuild.members?.length"
        class="rpg-loot-grid rpg-loot-grid--compact member-grid mt-2"
      >
        <div v-for="m in myGuild.members" :key="m.uid" class="rpg-loot-card member-card">
          <div class="rpg-loot-name truncate">
            {{ m.nickname }}
          </div>
          <div class="rpg-loot-desc">
            {{ getGuildRoleLabel(m.role) }}
          </div>
        </div>
      </div>
      <div class="rpg-loot-footer mt-2">
        <button
          v-if="!isLeader"
          class="rpg-loot-card-strip w-full rounded-b-[12px]"
          @click="emit('leave')"
        >
          退出公会
        </button>
        <span v-else class="rpg-loot-status rpg-loot-status--pending w-full justify-center">
          会长不可直接退出
        </span>
      </div>
    </div>
    <div v-else class="space-y-4">
      <div class="rpg-loot-card">
        <h4 class="rpg-section-heading">
          创建公会
        </h4>
        <div class="flex gap-2">
          <input
            v-model="guildName"
            class="input input-sm input-bordered flex-1"
            placeholder="公会名称"
          >
          <button
            class="rpg-loot-claim-btn !min-w-0"
            @click="
              emit('create', guildName);
              guildName = '';
            "
          >
            创建
          </button>
        </div>
      </div>
      <div>
        <h4 class="rpg-section-heading">
          加入公会
        </h4>
        <div v-if="!guildList.length" class="rpg-empty-inline">
          暂无可加入的公会
        </div>
        <div v-else class="rpg-loot-grid">
          <div v-for="g in guildList" :key="g.id" class="rpg-loot-card rpg-loot-card--stacked">
            <div class="rpg-loot-card-body">
              <div class="rpg-loot-card-head">
                <div class="rpg-loot-icon">
                  ⚔️
                </div>
                <span class="rpg-chip-tag">👥 {{ g.memberCount }}</span>
              </div>
              <div class="rpg-loot-name">
                {{ g.name }}
              </div>
              <p v-if="g.announcement" class="rpg-loot-desc">
                {{ g.announcement }}
              </p>
            </div>
            <button
              class="rpg-loot-card-strip rpg-loot-card-strip--active"
              @click="emit('join', g.id)"
            >
              加入公会
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .guild-mine {
    padding: 12px;
  }

  .member-grid .member-card {
    min-height: 72px;
    padding: 8px 10px;
    gap: 4px;
  }

  .member-grid .member-card::after {
    display: none;
  }
</style>
