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
const { openRechargeModal } = useRpgRecharge();

const activeType = ref<string>('all');

/** 钻石货币行（含历史 diamond code） */
const isCurrencyItem = (item: InventoryItem) =>
  item.itemCode === 'currency'
  || item.itemCode === 'diamond'
  || item.config?.itemType === 'currency';

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
    <div class="rpg-section-heading">
      背包
    </div>
    <RpgPanelLoading v-if="loading" compact />
    <div v-else-if="!items.length" class="rpg-empty-inline">
      背包为空
    </div>
    <template v-else>
      <div v-if="typeTabs.length > 2" class="rpg-panel-tabs">
        <button
          v-for="tab in typeTabs"
          :key="tab.key"
          class="rpg-panel-tab"
          :class="{ active: activeType === tab.key }"
          @click="switchTypeTab(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>
      <div class="rpg-loot-grid inventory-grid">
        <div
          v-for="item in filteredItems"
          :key="item.id || item.itemCode"
          class="rpg-loot-card rpg-loot-card--stacked"
          :class="{ 'rpg-loot-card--active': isEquipped(item) }"
        >
          <div class="rpg-loot-card-body">
            <div class="rpg-loot-card-head">
              <RpgItemIcon
                :icon="item.config?.icon"
                :item-type-icon="item.config?.itemTypeIcon"
                :rarity-color="item.config?.rarityColor"
              />
              <span class="rpg-loot-progress-text">×{{ item.quantity }}</span>
            </div>
            <div class="rpg-loot-name">
              {{ item.config?.name || item.itemCode }}
            </div>
            <div class="inventory-meta">
              <span v-if="item.config?.itemType" class="rpg-chip-tag">
                {{ item.config.itemTypeLabel || item.config.itemType }}
              </span>
              <RpgRarityBadge
                :rarity="item.config?.rarity"
                :rarity-label="item.config?.rarityLabel"
                :rarity-color="item.config?.rarityColor"
                :rarity-icon="item.config?.rarityIcon"
              />
            </div>
            <span v-if="item.sourceLabel || item.source" class="rpg-loot-desc">
              {{ item.sourceLabel || item.source }}
            </span>
          </div>
          <button
            v-if="isCurrencyItem(item)"
            type="button"
            class="rpg-loot-card-strip rpg-loot-card-strip--recharge"
            @click="openRechargeModal"
          >
            💎 充值
          </button>
          <button
            v-else-if="isEquippable(item)"
            type="button"
            class="rpg-loot-card-strip"
            :class="{ 'rpg-loot-card-strip--active': isEquipped(item) }"
            @click="toggleEquip(item)"
          >
            <template v-if="isEquipped(item)">
              <span class="equip-dot" />
              穿戴中 · 卸下
            </template>
            <template v-else>
              穿戴
            </template>
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
  .inventory-grid .rpg-loot-card {
    min-height: 118px;
  }

  .inventory-meta {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
  }

  .equip-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--rpg-violet-light);
    box-shadow: 0 0 6px color-mix(in oklch, var(--rpg-violet-light) 60%, transparent);
  }

  .rpg-loot-card-strip--recharge {
    color: var(--rpg-violet-light);
    font-weight: 600;
  }

  .rpg-loot-card-strip--recharge:hover {
    color: var(--rpg-violet);
    background: color-mix(in oklch, var(--rpg-violet) 12%, transparent);
  }
</style>
