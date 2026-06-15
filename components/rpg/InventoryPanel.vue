<script setup lang="ts">
/** 背包面板：展示字段来自 item.config / item.sourceLabel */
import type { InventoryItem } from '~~/types/rpg';

const props = defineProps<{
  items: InventoryItem[];
  loadout: any;
  loading: boolean;
}>();

const emit = defineEmits<{
  equip: [slot: string, itemCode: string];
  unequip: [slot: string];
}>();

const activeType = ref<string>('all');

const typeTabs = computed(() => {
  const typeMap = new Map<string, string>();
  for (const item of props.items) {
    const cfg = item.config;
    if (!cfg?.itemType) continue;
    if (!typeMap.has(cfg.itemType)) {
      typeMap.set(cfg.itemType, cfg.itemTypeLabel || cfg.itemType);
    }
  }
  return [
    { key: 'all', label: '全部' },
    ...Array.from(typeMap.entries()).map(([key, label]) => ({ key, label })),
  ];
});

const filteredItems = computed(() => {
  if (activeType.value === 'all') return props.items;
  return props.items.filter(i => i.config?.itemType === activeType.value);
});
</script>

<template>
  <div class="inventory-panel">
    <div class="flex justify-between items-center mb-3">
      <span class="font-semibold">背包</span>
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
          :key="item.id || item.itemCode"
          class="flex items-center justify-between p-2 rounded-lg border border-base-300 bg-base-100"
        >
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-medium">{{ item.config?.name || item.itemCode }}</span>
              <span class="text-xs text-base-content/50">x{{ item.quantity }}</span>
            </div>
            <div class="flex items-center gap-1 mt-1 flex-wrap">
              <span v-if="item.config?.itemType" class="badge badge-xs badge-ghost gap-0.5">
                {{ item.config.itemTypeIcon }}
                {{ item.config.itemTypeLabel || item.config.itemType }}
              </span>
              <span
                v-if="item.config?.rarity"
                class="badge badge-xs gap-0.5"
                :style="{
                  backgroundColor: (item.config.rarityColor || '#94a3b8') + '20',
                  color: item.config.rarityColor || '#64748b',
                  borderColor: item.config.rarityColor || '#94a3b8',
                }"
              >
                {{ item.config.rarityIcon }}
                {{ item.config.rarityLabel || item.config.rarity }}
              </span>
              <span v-if="item.sourceLabel || item.source" class="text-[10px] text-base-content/40">
                {{ item.sourceLabel || item.source }}
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
                emit(
                  'equip',
                  item.config!.itemType === 'title' ? 'title' : 'avatar_frame',
                  item.itemCode,
                )
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
              @click="emit('unequip', item.config!.itemType === 'title' ? 'title' : 'avatar_frame')"
            >
              卸下
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
