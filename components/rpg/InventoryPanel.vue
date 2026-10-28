<script setup lang="ts">
/** 背包面板：三槽装备栏（称号/头像框/宠物）+ 分类筛选 + 稀有度描边网格 */
import type { InventoryItem } from '~~/types/rpg';

const props = defineProps<{
  items: InventoryItem[];
  loadout: any;
  pets: any[];
  equippedPetId: number | null;
  loading: boolean;
}>();

const emit = defineEmits<{
  equip: [slot: string, itemCode: string];
  unequip: [slot: string];
  restPet: [];
  goto: [target: 'status'];
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

/* ── 三槽装备栏数据（loadout：title / avatar_frame / pet）── */
const titleItem = computed(
  () => props.items.find(i => i.itemCode === props.loadout?.titleCode) || null,
);
const frameItem = computed(
  () => props.items.find(i => i.itemCode === props.loadout?.avatarFrameCode) || null,
);
const equippedPet = computed(
  () => (props.pets || []).find(p => p.id === props.equippedPetId) || null,
);

/** 稀有度描边 class：rare 紫晶 / epic+ 鎏金（美术改版 v2） */
const rarityClass = (item: InventoryItem) => {
  const r = (item.config?.rarity || '').toLowerCase();
  if (r === 'rare') return 'inv-cell--rare';
  if (r === 'epic' || r === 'legendary' || r === 'ssr') return 'inv-cell--epic';
  return '';
};
</script>

<template>
  <div class="inventory-panel">
    <div class="rpg-section-heading">
      背包
    </div>
    <RpgPanelLoading v-if="loading" compact />
    <div v-else-if="!items.length" class="rpg-empty-card">
      <img class="rpg-empty-card__art" src="/rpg/icons/library.png" alt="" loading="lazy">
      <b>背包还没开张</b>
      <p>完成任务、参与抽奖都能拿到第一件装备。</p>
      <button class="rpg-empty-card__btn" @click="emit('goto', 'status')">
        看看今日任务
      </button>
    </div>
    <template v-else>
      <!-- 三槽装备栏：称号 / 头像框 / 宠物（对齐 loadout 实际槽位） -->
      <div class="equip-strip">
        <div class="equip-slot" :class="{ filled: titleItem }">
          <RpgItemIcon
            v-if="titleItem"
            class="equip-slot__art"
            :icon="titleItem.config?.icon"
            :icon-url="titleItem.config?.iconUrl"
            :rarity-color="titleItem.config?.rarityColor"
            :tinted="false"
          />
          <span v-else class="equip-slot__empty">
            <img class="equip-slot__ico" src="/rpg/icons/crown.png" alt="">
          </span>
          <div class="equip-slot__text">
            <small>称号</small>
            <b>{{
              titleItem?.config?.name || (loadout?.titleCode ? loadout.titleCode : '未穿戴')
            }}</b>
          </div>
          <button
            v-if="titleItem"
            type="button"
            class="equip-slot__off"
            @click="emit('unequip', 'title')"
          >
            卸下
          </button>
        </div>
        <div class="equip-slot" :class="{ filled: frameItem }">
          <RpgItemIcon
            v-if="frameItem"
            class="equip-slot__art"
            :icon="frameItem.config?.icon"
            :icon-url="frameItem.config?.iconUrl"
            :rarity-color="frameItem.config?.rarityColor"
            :tinted="false"
          />
          <span v-else class="equip-slot__empty">
            <img class="equip-slot__ico" src="/rpg/icons/frame-gold.png" alt="">
          </span>
          <div class="equip-slot__text">
            <small>头像框</small>
            <b>{{
              frameItem?.config?.name
                || (loadout?.avatarFrameCode ? loadout.avatarFrameCode : '未穿戴')
            }}</b>
          </div>
          <button
            v-if="frameItem"
            type="button"
            class="equip-slot__off"
            @click="emit('unequip', 'avatar_frame')"
          >
            卸下
          </button>
        </div>
        <div class="equip-slot" :class="{ filled: equippedPet }">
          <RpgItemIcon
            v-if="equippedPet"
            class="equip-slot__art"
            :icon="equippedPet.config?.icon"
            :icon-url="equippedPet.config?.iconUrl"
            :rarity-color="equippedPet.config?.rarityColor"
            :tinted="false"
          />
          <span v-else class="equip-slot__empty">
            <img class="equip-slot__ico" src="/rpg/icons/paw.png" alt="">
          </span>
          <div class="equip-slot__text">
            <small>宠物</small>
            <b>{{ equippedPet ? equippedPet.nickname || equippedPet.config?.name : '未出战' }}</b>
          </div>
          <button v-if="equippedPet" type="button" class="equip-slot__off" @click="emit('restPet')">
            休息
          </button>
        </div>
      </div>

      <!-- 分类 pills：映射 GET inventory 的 itemTypes 过滤 -->
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
          class="rpg-loot-card rpg-loot-card--stacked inv-cell"
          :class="[rarityClass(item), { 'rpg-loot-card--active': isEquipped(item) }]"
        >
          <div class="rpg-loot-card-body">
            <div class="rpg-loot-card-head">
              <RpgItemIcon
                :icon="item.config?.icon"
                :icon-url="item.config?.iconUrl"
                :bg-url="item.config?.bgUrl"
                :item-type-icon="item.config?.itemTypeIcon"
                :rarity-color="item.config?.rarityColor"
              />
              <span class="inv-cell__qty">×{{ item.quantity }}</span>
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
    background: var(--rpg-art-violet, #7c5cf0);
    box-shadow: 0 0 6px color-mix(in oklch, var(--rpg-art-violet, #7c5cf0) 60%, transparent);
  }

  .rpg-loot-card-strip--recharge {
    color: var(--rpg-art-violet-deep, #5b3fd6);
    font-weight: 600;
  }

  .rpg-loot-card-strip--recharge:hover {
    color: var(--rpg-art-violet, #7c5cf0);
    background: color-mix(in oklch, var(--rpg-art-violet, #7c5cf0) 12%, transparent);
  }

  /* ── 稀有度描边（art v2）：rare 紫晶 / epic+ 鎏金 ── */
  .inv-cell--rare {
    border-color: var(--rpg-art-rare, #8d7bf5) !important;
    box-shadow: 0 0 0 3px var(--rpg-art-rare-glow, rgb(141 123 245 / 0.18));
  }

  .inv-cell--epic {
    border-color: var(--rpg-art-epic, #b8842c) !important;
    box-shadow: 0 0 0 3px var(--rpg-art-epic-glow, rgb(217 161 60 / 0.25));
  }

  .inv-cell__qty {
    position: absolute;
    right: 8px;
    bottom: 8px;
    padding: 1px 6px;
    border-radius: 6px;
    background: color-mix(in oklch, var(--rpg-text-heading, #2b2440) 85%, transparent);
    color: #fff;
    font-size: 10px;
    font-weight: 700;
  }

  /* ── 三槽装备栏 ── */
  .equip-strip {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin-bottom: 14px;
  }

  .equip-slot {
    display: flex;
    align-items: center;
    gap: 9px;
    min-width: 0;
    border: 1px dashed var(--rpg-border, oklch(var(--b3)));
    border-radius: 14px;
    padding: 10px;
    background: var(--rpg-bg-alt, oklch(var(--b2)));
  }

  .equip-slot.filled {
    border-style: solid;
    border-color: color-mix(in oklch, var(--rpg-art-violet, #7c5cf0) 45%, transparent);
    background: var(--rpg-art-violet-soft, #f6f2fe);
  }

  .equip-slot__ico {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--rpg-surface, #fff);
    box-shadow: 0 0 0 2px color-mix(in oklch, var(--rpg-art-violet, #7c5cf0) 40%, transparent);
    flex-shrink: 0;
  }

  .equip-slot__art {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
  }

  .equip-slot__art :deep(img.rpg-loot-icon__img) {
    width: 92%;
    height: 92%;
  }

  .equip-slot__empty .equip-slot__ico {
    opacity: 0.45;
    border-style: dashed;
    box-shadow: none;
    border-color: var(--rpg-border, oklch(var(--b3)));
  }

  .equip-slot__text {
    flex: 1;
    min-width: 0;
  }

  .equip-slot__text small {
    display: block;
    font-size: 10.5px;
    color: var(--rpg-text-muted, oklch(var(--bc) / 0.55));
  }

  .equip-slot__text b {
    display: block;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--rpg-text-heading, oklch(var(--bc)));
  }

  .equip-slot__off {
    border: 0;
    background: transparent;
    padding: 0;
    font-size: 10.5px;
    font-weight: 700;
    color: var(--rpg-art-violet-deep, #5b3fd6);
    cursor: pointer;
    flex-shrink: 0;
  }

  .equip-slot__off:hover {
    text-decoration: underline;
  }

  @media (max-width: 639px) {
    .equip-strip {
      grid-template-columns: 1fr;
    }
  }

  /* ── v3 ⑦ 空态规范：圆图 + 人话 + 行动按钮 ── */
  .rpg-empty-card {
    text-align: center;
    padding: 24px 16px;
    border: 1.5px dashed var(--rpg-border, #e8e3f2);
    border-radius: 16px;
    background: var(--rpg-surface, #fbfaff);
  }

  .rpg-empty-card__art {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    object-fit: cover;
    opacity: 0.9;
  }

  .rpg-empty-card b {
    display: block;
    font-size: 13px;
    margin: 8px 0 4px;
    color: var(--rpg-text-heading, oklch(var(--bc)));
  }

  .rpg-empty-card p {
    font-size: 11.5px;
    color: var(--rpg-text-muted, oklch(var(--bc) / 0.6));
    line-height: 1.6;
    margin-bottom: 10px;
  }

  .rpg-empty-card__btn {
    border: none;
    cursor: pointer;
    font-weight: 700;
    font-size: 12px;
    padding: 7px 16px;
    border-radius: 10px;
    background: linear-gradient(135deg, #7c5cf0, #5b3fd6);
    color: #fff;
    box-shadow: 0 4px 12px rgb(92 63 214 / 0.3);
  }

  .rpg-empty-card__btn:hover {
    filter: brightness(1.06);
  }
</style>
