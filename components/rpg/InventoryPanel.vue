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

const { playSfx } = useRpgAudio();

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

const isEquipped = (item: InventoryItem) => {
  const type = item.config?.itemType;
  if (type === 'title') return props.loadout?.titleCode === item.itemCode;
  if (type === 'avatar_frame') return props.loadout?.avatarFrameCode === item.itemCode;
  return false;
};

const isEquippable = (item: InventoryItem) =>
  item.config?.itemType === 'title' || item.config?.itemType === 'avatar_frame';

const getEquipSlot = (item: InventoryItem) => {
  return item.config?.itemType === 'title' ? 'title' : 'avatar_frame';
};

const toggleEquip = (item: InventoryItem) => {
  if (isEquipped(item)) {
    emit('unequip', getEquipSlot(item));
  }
  else {
    emit('equip', getEquipSlot(item), item.itemCode);
  }
};

/** 切换背包类型 Tab，变更时播放 tabSwitch */
const switchTypeTab = (key: string) => {
  if (key !== activeType.value) void playSfx('tabSwitch');
  activeType.value = key;
};
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
      <div v-if="typeTabs.length > 2" class="type-tabs">
        <button
          v-for="tab in typeTabs"
          :key="tab.key"
          class="type-tab"
          :class="{ 'type-tab--active': activeType === tab.key }"
          @click="switchTypeTab(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>
      <div class="inventory-grid">
        <div
          v-for="item in filteredItems"
          :key="item.id || item.itemCode"
          class="inventory-card"
          :class="{
            'inventory-card--equipped': isEquipped(item),
            'inventory-card--equippable': isEquippable(item),
          }"
        >
          <div class="inventory-card-body">
            <div class="inventory-card-head">
              <span class="inventory-name">{{ item.config?.name || item.itemCode }}</span>
              <span class="inventory-qty">×{{ item.quantity }}</span>
            </div>
            <div class="inventory-meta">
              <span v-if="item.config?.itemType" class="meta-tag">
                {{ item.config.itemTypeIcon }}
                {{ item.config.itemTypeLabel || item.config.itemType }}
              </span>
              <RpgRarityBadge
                :rarity="item.config?.rarity"
                :rarity-label="item.config?.rarityLabel"
                :rarity-color="item.config?.rarityColor"
                :rarity-icon="item.config?.rarityIcon"
              />
            </div>
            <span v-if="item.sourceLabel || item.source" class="inventory-source">
              {{ item.sourceLabel || item.source }}
            </span>
          </div>
          <button
            v-if="isEquippable(item)"
            type="button"
            class="equip-strip"
            :class="{ 'equip-strip--active': isEquipped(item) }"
            @click="toggleEquip(item)"
          >
            <span v-if="isEquipped(item)" class="equip-strip-label">
              <span class="equip-strip-dot" />
              穿戴中
            </span>
            <span v-else class="equip-strip-label">穿戴</span>
            <span v-if="isEquipped(item)" class="equip-strip-hint">卸下</span>
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
  .type-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 12px;
  }

  .type-tab {
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    border: 1px solid var(--rpg-border-subtle, oklch(var(--b3)));
    background: transparent;
    color: var(--rpg-text-label, oklch(var(--bc) / 0.55));
    cursor: pointer;
    transition:
      background 0.15s,
      border-color 0.15s,
      color 0.15s;
  }

  .type-tab:hover {
    border-color: oklch(var(--p) / 0.35);
    color: oklch(var(--p));
  }

  .type-tab--active {
    background: oklch(var(--p) / 0.12);
    border-color: oklch(var(--p) / 0.4);
    color: oklch(var(--p));
  }

  .inventory-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(188px, 1fr));
    gap: 10px;
  }

  .inventory-card {
    display: flex;
    flex-direction: column;
    border-radius: 10px;
    border: 1px solid var(--rpg-border-subtle, oklch(var(--b3)));
    background: var(--rpg-surface, oklch(var(--b1)));
    min-height: 108px;
    overflow: hidden;
    transition:
      border-color 0.15s,
      box-shadow 0.15s;
  }

  .inventory-card--equipped {
    border-color: oklch(var(--p) / 0.45);
    box-shadow: inset 0 0 0 1px oklch(var(--p) / 0.12);
  }

  .inventory-card-body {
    flex: 1;
    min-width: 0;
    padding: 10px 10px 8px;
  }

  .inventory-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 6px;
  }

  .inventory-name {
    font-size: 13px;
    font-weight: 600;
    line-height: 1.35;
    color: var(--rpg-text, oklch(var(--bc)));
  }

  .inventory-qty {
    flex-shrink: 0;
    font-size: 10px;
    font-weight: 600;
    color: oklch(var(--bc) / 0.45);
    padding: 1px 6px;
    border-radius: 999px;
    background: oklch(var(--b3) / 0.6);
  }

  .inventory-meta {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
    margin-top: 6px;
  }

  .meta-tag {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-size: 10px;
    font-weight: 500;
    color: oklch(var(--bc) / 0.55);
    padding: 2px 6px;
    border-radius: 4px;
    background: oklch(var(--b3) / 0.45);
  }

  .inventory-source {
    display: block;
    margin-top: 6px;
    font-size: 10px;
    color: oklch(var(--bc) / 0.38);
  }

  .equip-strip {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    padding: 7px 10px;
    border: none;
    border-top: 1px solid var(--rpg-border-subtle, oklch(var(--b3)));
    background: oklch(var(--b2) / 0.35);
    font-size: 11px;
    font-weight: 600;
    color: oklch(var(--bc) / 0.55);
    cursor: pointer;
    transition:
      background 0.15s,
      color 0.15s;
  }

  .inventory-card--equippable:not(.inventory-card--equipped) .equip-strip:hover {
    background: oklch(var(--p) / 0.1);
    color: oklch(var(--p));
  }

  .equip-strip--active {
    background: oklch(var(--p) / 0.08);
    color: oklch(var(--p));
  }

  .equip-strip--active:hover {
    background: oklch(var(--p) / 0.14);
  }

  .equip-strip-label {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  .equip-strip-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: oklch(var(--p));
    box-shadow: 0 0 6px oklch(var(--p) / 0.6);
  }

  .equip-strip-hint {
    font-size: 10px;
    font-weight: 500;
    color: oklch(var(--bc) / 0.45);
    padding-left: 6px;
    border-left: 1px solid oklch(var(--bc) / 0.12);
  }

  .equip-strip--active:hover .equip-strip-hint {
    color: oklch(var(--p) / 0.75);
  }
</style>
