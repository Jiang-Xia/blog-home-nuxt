<script setup lang="ts">
import { getMyPets, summonPet, renamePet, equipLoadout, getRpgInventory } from '~~/api/rpg';
import { messageSuccess, messageError } from '~~/utils/toast';

const pets = ref<any[]>([]);
const eggs = ref<any[]>([]);
const renameId = ref<number | null>(null);
const nickname = ref('');

const fetchData = async () => {
  const [p, inv] = await Promise.all([getMyPets(), getRpgInventory('consumable')]);
  pets.value = p || [];
  eggs.value = (inv.items || []).filter((i: any) => i.config?.effectJson?.grantType === 'pet');
};

const hatch = async (itemCode: string) => {
  try {
    await summonPet(itemCode);
    messageSuccess('孵化成功');
    await fetchData();
  }
  catch (e: any) {
    messageError(e?.message || '孵化失败');
  }
};

const deploy = async (petId: number) => {
  try {
    await equipLoadout({ slot: 'pet', petId });
    messageSuccess('宠物已出战');
  }
  catch (e: any) {
    messageError(e?.message || '出战失败');
  }
};

const saveRename = async () => {
  if (!renameId.value) return;
  try {
    await renamePet(renameId.value, nickname.value);
    renameId.value = null;
    await fetchData();
  }
  catch (e: any) {
    messageError(e?.message || '改名失败');
  }
};

onMounted(fetchData);
</script>

<template>
  <div class="pet-panel space-y-4">
    <div v-if="eggs.length">
      <h4 class="text-sm font-semibold mb-2">
        宠物蛋
      </h4>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="e in eggs"
          :key="e.itemCode"
          class="btn btn-sm btn-outline"
          @click="hatch(e.itemCode)"
        >
          🥚 {{ e.config?.name }} 孵化
        </button>
      </div>
    </div>
    <div>
      <h4 class="text-sm font-semibold mb-2">
        我的宠物
      </h4>
      <div v-if="!pets.length" class="text-sm text-base-content/50">
        暂无宠物
      </div>
      <div
        v-for="p in pets"
        :key="p.id"
        class="flex items-center justify-between p-2 border rounded-lg mb-2"
      >
        <span>🐾 {{ p.nickname || p.config?.name }} Lv{{ p.level }}</span>
        <div class="flex gap-1">
          <button class="btn btn-xs" @click="deploy(p.id)">
            出战
          </button>
          <button
            class="btn btn-xs btn-ghost"
            @click="
              renameId = p.id;
              nickname = p.nickname;
            "
          >
            改名
          </button>
        </div>
      </div>
    </div>
    <div v-if="renameId" class="flex gap-2">
      <input v-model="nickname" class="input input-sm input-bordered flex-1">
      <button class="btn btn-sm btn-primary" @click="saveRename">
        保存
      </button>
    </div>
  </div>
</template>
