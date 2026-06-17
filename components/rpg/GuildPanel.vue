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
    <div v-if="loading" class="text-sm text-base-content/50">
      加载中...
    </div>
    <div v-else-if="myGuild" class="guild-card guild-card--mine">
      <div class="guild-card-head">
        <h4 class="font-bold text-base">
          {{ myGuild.name }}
        </h4>
        <span class="badge badge-sm badge-primary">我的公会</span>
      </div>
      <p class="text-sm text-base-content/60 mt-2">
        {{ myGuild.announcement || '暂无公告' }}
      </p>
      <p class="text-xs mt-2 text-base-content/50">
        成员 {{ myGuild.memberCount }} 人
      </p>
      <div v-if="myGuild.members?.length" class="member-grid mt-3">
        <div v-for="m in myGuild.members" :key="m.uid" class="member-card">
          <div class="font-medium text-sm truncate">
            {{ m.nickname }}
          </div>
          <div class="text-[11px] text-base-content/50 mt-0.5">
            {{ getGuildRoleLabel(m.role) }}
          </div>
        </div>
      </div>
      <button v-if="!isLeader" class="btn btn-sm btn-outline mt-4 w-full" @click="emit('leave')">
        退出公会
      </button>
      <button v-else class="btn btn-sm btn-outline mt-4 w-full" disabled>
        会长不可直接退出
      </button>
    </div>
    <div v-else class="space-y-4">
      <div class="guild-card">
        <h4 class="text-sm font-semibold mb-2">
          创建公会
        </h4>
        <div class="flex gap-2">
          <input
            v-model="guildName"
            class="input input-sm input-bordered flex-1"
            placeholder="公会名称"
          >
          <button
            class="btn btn-sm btn-primary"
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
        <h4 class="text-sm font-semibold mb-2">
          加入公会
        </h4>
        <div v-if="!guildList.length" class="text-sm text-base-content/50">
          暂无可加入的公会
        </div>
        <div v-else class="guild-grid">
          <div v-for="g in guildList" :key="g.id" class="guild-card guild-card--join">
            <div class="guild-card-body">
              <div class="font-medium text-sm">
                {{ g.name }}
              </div>
              <p v-if="g.announcement" class="text-[11px] text-base-content/50 mt-1 line-clamp-2">
                {{ g.announcement }}
              </p>
              <span class="text-xs text-base-content/60 mt-2 block">
                👥 {{ g.memberCount }} 人
              </span>
            </div>
            <button class="btn btn-xs btn-primary w-full" @click="emit('join', g.id)">
              加入
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .guild-grid,
  .member-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(188px, 1fr));
    gap: 10px;
  }

  .guild-card {
    padding: 12px;
    border-radius: 10px;
    border: 1px solid var(--rpg-border-subtle, oklch(var(--b3)));
    background: var(--rpg-surface, oklch(var(--b1)));
  }

  .guild-card--mine {
    border-color: var(--rpg-violet, oklch(var(--p) / 0.45));
    background: var(--rpg-violet-bg, oklch(var(--p) / 0.06));
  }

  .guild-card--join {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 120px;
  }

  .guild-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .guild-card-body {
    flex: 1;
    min-width: 0;
  }

  .member-card {
    padding: 8px 10px;
    border-radius: 8px;
    border: 1px solid var(--rpg-border-subtle, oklch(var(--b3)));
    background: oklch(var(--b1));
  }
</style>
