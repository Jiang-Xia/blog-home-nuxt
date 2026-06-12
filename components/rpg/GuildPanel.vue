<script setup lang="ts">
import { getMyGuild, listGuilds, createGuild, joinGuild, leaveGuild } from '~~/api/rpg';
import { getGuildRoleLabel } from '~~/types/rpg';
import { messageSuccess, messageError } from '~~/utils/toast';

const myGuild = ref<any>(null);
const guildList = ref<any[]>([]);
const guildName = ref('');
const loading = ref(false);

const refresh = async () => {
  loading.value = true;
  try {
    myGuild.value = await getMyGuild();
    if (!myGuild.value) {
      const res = await listGuilds(1);
      guildList.value = res.list || [];
    }
  }
  finally {
    loading.value = false;
  }
};

const create = async () => {
  if (!guildName.value.trim()) return;
  try {
    await createGuild(guildName.value.trim());
    messageSuccess('公会创建成功');
    guildName.value = '';
    await refresh();
  }
  catch (e: any) {
    messageError(e?.message || '创建失败');
  }
};

const join = async (guildId: number) => {
  try {
    await joinGuild(guildId);
    messageSuccess('加入成功');
    await refresh();
  }
  catch (e: any) {
    messageError(e?.message || '加入失败');
  }
};

const leave = async () => {
  try {
    await leaveGuild();
    messageSuccess('已退出公会');
    await refresh();
  }
  catch (e: any) {
    messageError(e?.message || '退出失败');
  }
};

onMounted(refresh);
</script>

<template>
  <div class="guild-panel">
    <div v-if="loading" class="text-sm text-base-content/50">
      加载中...
    </div>
    <div v-else-if="myGuild">
      <h4 class="font-bold">
        {{ myGuild.name }}
      </h4>
      <p class="text-sm text-base-content/60 mt-1">
        {{ myGuild.announcement || '暂无公告' }}
      </p>
      <p class="text-xs mt-2">
        成员 {{ myGuild.memberCount }} 人
      </p>
      <ul class="mt-3 space-y-1 text-sm">
        <li v-for="m in myGuild.members" :key="m.uid">
          {{ m.nickname }} · {{ getGuildRoleLabel(m.role) }}
        </li>
      </ul>
      <button
        v-if="myGuild.leaderUid !== myGuild.members?.find((x: any) => x.role === 'leader')?.uid"
        class="btn btn-sm btn-outline mt-3"
        @click="leave"
      >
        退出公会
      </button>
      <button v-else class="btn btn-sm btn-outline mt-3" disabled>
        会长不可直接退出
      </button>
    </div>
    <div v-else>
      <div class="mb-4">
        <h4 class="text-sm font-semibold mb-2">
          创建公会
        </h4>
        <div class="flex gap-2">
          <input
            v-model="guildName"
            class="input input-sm input-bordered flex-1"
            placeholder="公会名称"
          >
          <button class="btn btn-sm btn-primary" @click="create">
            创建
          </button>
        </div>
      </div>
      <h4 class="text-sm font-semibold mb-2">
        加入公会
      </h4>
      <div
        v-for="g in guildList"
        :key="g.id"
        class="flex justify-between items-center py-2 border-b border-base-200"
      >
        <span>{{ g.name }} ({{ g.memberCount }}人)</span>
        <button class="btn btn-xs btn-primary" @click="join(g.id)">
          加入
        </button>
      </div>
    </div>
  </div>
</template>
