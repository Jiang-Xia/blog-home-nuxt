<script setup lang="ts">
import {
  getMyPets,
  summonPet,
  exchangePet,
  renamePet,
  equipLoadout,
  unequipLoadout,
  getRpgInventory,
  getPetCatalog,
  getRpgLoadout,
} from '~~/api/rpg';
import { messageSuccess, messageError } from '~~/utils/toast';

const pets = ref<any[]>([]);
const eggs = ref<any[]>([]);
const catalog = ref<any[]>([]);
const equippedPetId = ref<number | null>(null);
const renameId = ref<number | null>(null);
const nickname = ref('');

const fetchData = async () => {
  const [p, inv, cat, loadout] = await Promise.all([
    getMyPets(),
    getRpgInventory('consumable'),
    getPetCatalog(),
    getRpgLoadout().catch(() => null),
  ]);
  pets.value = p || [];
  eggs.value = (inv.items || []).filter((i: any) => i.config?.effectJson?.grantType === 'pet');
  catalog.value = cat || [];
  equippedPetId.value = loadout?.petId ?? null;
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

const buyPet = async (petCode: string) => {
  try {
    await exchangePet(petCode);
    messageSuccess('兑换成功');
    await fetchData();
  }
  catch (e: any) {
    messageError(e?.message || '兑换失败');
  }
};

const deploy = async (petId: number) => {
  try {
    await equipLoadout({ slot: 'pet', petId });
    equippedPetId.value = petId;
    messageSuccess('宠物已出战');
  }
  catch (e: any) {
    messageError(e?.message || '出战失败');
  }
};

const restPet = async () => {
  try {
    await unequipLoadout('pet');
    equippedPetId.value = null;
    messageSuccess('宠物已休息');
  }
  catch (e: any) {
    messageError(e?.message || '操作失败');
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
    <div v-if="catalog.length">
      <h4 class="text-sm font-semibold mb-2">
        碎片兑换
      </h4>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="c in catalog.filter((x: any) => x.effectJson?.fragmentCost)"
          :key="c.code"
          class="btn btn-sm btn-outline"
          @click="buyPet(c.code)"
        >
          💎 {{ c.effectJson.fragmentCost }} · {{ c.name }}
        </button>
      </div>
    </div>

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
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-sm font-semibold">
          我的宠物
        </h4>
        <button v-if="equippedPetId" class="btn btn-xs btn-ghost" @click="restPet">
          休息（下架）
        </button>
      </div>
      <div v-if="!pets.length" class="text-sm text-base-content/50">
        暂无宠物
      </div>
      <div
        v-for="p in pets"
        :key="p.id"
        class="flex items-center justify-between p-2 border rounded-lg mb-2"
        :class="{ 'border-primary': equippedPetId === p.id }"
      >
        <span>
          🐾 {{ p.nickname || p.config?.name }} Lv{{ p.level }}
          <span v-if="equippedPetId === p.id" class="text-xs text-primary ml-1">出战中</span>
          <span v-if="p.config?.effectJson?.expBoost" class="text-xs text-base-content/50 ml-1">
            经验+{{ Math.round(p.config.effectJson.expBoost * 100) }}%
          </span>
        </span>
        <div class="flex gap-1">
          <button v-if="equippedPetId !== p.id" class="btn btn-xs" @click="deploy(p.id)">
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
