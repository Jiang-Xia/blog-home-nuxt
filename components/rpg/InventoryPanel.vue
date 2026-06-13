<script setup lang="ts">
import { getRpgInventory, equipLoadout, unequipLoadout, getRpgLoadout } from '~~/api/rpg';
import {
  ITEM_TYPE_MAP,
  RARITY_MAP,
  getItemSourceLabel,
  getItemTypeLabel,
  getRarityLabel,
} from '~~/types/rpg';
import type { InventoryItem } from '~~/types/rpg';
import { messageSuccess, messageError } from '~~/utils/toast';

const items = ref<InventoryItem[]>([]);
const fragments = ref(0);
const loadout = ref<any>(null);
const loading = ref(false);
const activeType = ref<string>('all');

const typeTabs = computed(() => {
  const types = new Set(items.value.map(i => i.config?.itemType).filter(Boolean));
  return [
    { key: 'all', label: '全部' },
    ...Array.from(types).map(key => ({
      key: key as string,
      label: getItemTypeLabel(key as string),
    })),
  ];
});

const filteredItems = computed(() => {
  if (activeType.value === 'all') return items.value;
  return items.value.filter(i => i.config?.itemType === activeType.value);
});

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
      <span class="text-sm">💎 钻石 {{ fragments }}</span>
    </div>
    <div v-if="loading" class="text-sm text-base-content/50">
      加载中...
    </div>
    <div v-else-if="!items.length" class="text-sm text-base-content/50">
      背包为空
    </div>
    <template v-else>
      <div v-if="typeTabs.length > 2" class="flex flex-wrap gap-1 mb-3">
        <button
          v-for="tab in typeTabs"
          :key="tab.key"
          class="btn btn-xs"
          :class="activeType === tab.key ? 'btn-primary' : 'btn-ghost'"
          @click="activeType = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
      <div class="grid gap-2">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="flex items-center justify-between p-2 rounded-lg border border-base-300 bg-base-100"
        >
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-medium">{{ item.config?.name || item.itemCode }}</span>
              <span class="text-xs text-base-content/50">x{{ item.quantity }}</span>
            </div>
            <div class="flex items-center gap-1 mt-1 flex-wrap">
              <span v-if="item.config?.itemType" class="badge badge-xs badge-ghost gap-0.5">
                {{ ITEM_TYPE_MAP[item.config.itemType]?.icon }}
                {{ getItemTypeLabel(item.config.itemType) }}
              </span>
              <span
                v-if="item.config?.rarity"
                class="badge badge-xs gap-0.5"
                :style="{
                  backgroundColor: (RARITY_MAP[item.config.rarity]?.color || '#94a3b8') + '20',
                  color: RARITY_MAP[item.config.rarity]?.color || '#64748b',
                  borderColor: RARITY_MAP[item.config.rarity]?.color || '#94a3b8',
                }"
              >
                {{ RARITY_MAP[item.config.rarity]?.icon }}
                {{ getRarityLabel(item.config.rarity) }}
              </span>
              <span v-if="item.source" class="text-[10px] text-base-content/40">
                {{ getItemSourceLabel(item.source) }}
              </span>
            </div>
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
    </template>
  </div>
</template>
