<script setup lang="ts">
import { getRpgInventory, equipLoadout, unequipLoadout, getRpgLoadout } from '~~/api/rpg';
import type { InventoryItem } from '~~/types/rpg';
import { messageSuccess, messageError } from '~~/utils/toast';

const items = ref<InventoryItem[]>([]);
const fragments = ref(0);
const loadout = ref<any>(null);
const loading = ref(false);

const fetchData = async () => {
  loading.value = true;
  try {
    const [inv, lo] = await Promise.all([getRpgInventory(), getRpgLoadout()]);
    items.value = inv.items || [];
    fragments.value = inv.fragments || 0;
    loadout.value = lo;
  }
  finally {
    loading.value = false;
  }
};

const equip = async (slot: string, itemCode: string) => {
  try {
    await equipLoadout({ slot, itemCode });
    messageSuccess('穿戴成功');
    await fetchData();
  }
  catch (e: any) {
    messageError(e?.message || '穿戴失败');
  }
};

const unequip = async (slot: string) => {
  try {
    await unequipLoadout(slot);
    await fetchData();
  }
  catch (e: any) {
    messageError(e?.message || '卸下失败');
  }
};

onMounted(fetchData);
defineExpose({ fetchData });
</script>

<template>
  <div class="inventory-panel">
    <div class="flex justify-between items-center mb-3">
      <span class="font-semibold">背包</span>
      <span class="text-sm">💎 碎片 {{ fragments }}</span>
    </div>
    <div v-if="loading" class="text-sm text-base-content/50">
      加载中...
    </div>
    <div v-else-if="!items.length" class="text-sm text-base-content/50">
      背包为空
    </div>
    <div v-else class="grid gap-2">
      <div
        v-for="item in items"
        :key="item.id"
        class="flex items-center justify-between p-2 rounded-lg border border-base-300 bg-base-100"
      >
        <div>
          <span class="font-medium">{{ item.config?.name || item.itemCode }}</span>
          <span class="text-xs text-base-content/50 ml-2">x{{ item.quantity }}</span>
        </div>
        <div
          v-if="item.config?.itemType === 'title' || item.config?.itemType === 'avatar_frame'"
          class="flex gap-1"
        >
          <button
            class="btn btn-xs btn-primary"
            @click="
              equip(item.config!.itemType === 'title' ? 'title' : 'avatar_frame', item.itemCode)
            "
          >
            穿戴
          </button>
          <button
            v-if="
              loadout?.[item.config!.itemType === 'title' ? 'titleCode' : 'avatarFrameCode']
                === item.itemCode
            "
            class="btn btn-xs btn-ghost"
            @click="unequip(item.config!.itemType === 'title' ? 'title' : 'avatar_frame')"
          >
            卸下
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
