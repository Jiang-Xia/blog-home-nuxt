<script setup lang="ts">
import type { ItemConfigView } from '~~/types/rpg';
import { useRpgModal } from '~~/composables/use-rpg-modal';

const props = defineProps<{
  pets: any[];
  eggs: any[];
  catalog: ItemConfigView[];
  equippedPetId: number | null;
  loading: boolean;
}>();

const emit = defineEmits<{
  hatch: [itemCode: string];
  buy: [petCode: string];
  deploy: [petId: number];
  rest: [];
  rename: [id: number, nickname: string];
  goto: [target: 'lottery' | 'quests'];
}>();

const { confirm } = useRpgModal();

const ownedPetCodes = computed(
  () => new Set((props.pets || []).map((p: any) => p.petCode).filter(Boolean)),
);

/** 钻石可兑换项（含已兑换，用于展示完整兑换列表） */
const exchangeCatalog = computed(() =>
  (props.catalog || []).filter(item => (item.effectJson?.currencyCost ?? 0) > 0),
);

const isOwned = (code: string) => ownedPetCodes.value.has(code);

/** 当前出战宠物（用于大图展示位） */
const equippedPet = computed(
  () => (props.pets || []).find((p: any) => p.id === props.equippedPetId) || null,
);

/* ── v3 ④ 宠物图鉴：全集 = 兑换目录 ∪ 已拥有宠物 ∪ 蛋对应物种 ── */
interface DexEntry {
  code: string;
  name: string;
  icon?: string;
  iconUrl?: string;
  owned: boolean;
}

const dexEntries = computed<DexEntry[]>(() => {
  const owned = (props.pets || []).map((p: any) => p.petCode).filter(Boolean);
  const ownedSet = new Set<string>(owned);
  const map = new Map<string, DexEntry>();

  for (const item of props.catalog || []) {
    map.set(item.code, {
      code: item.code,
      name: item.name,
      icon: item.icon,
      iconUrl: item.iconUrl,
      owned: ownedSet.has(item.code),
    });
  }

  // 已拥有但不在兑换目录的宠物（抽奖限定等）补进图鉴
  for (const p of props.pets || []) {
    if (p.petCode && !map.has(p.petCode)) {
      map.set(p.petCode, {
        code: p.petCode,
        name: p.nickname || p.config?.name || p.petCode,
        icon: p.config?.icon,
        iconUrl: p.config?.iconUrl,
        owned: true,
      });
    }
  }

  // 蛋对应物种：egg-xxx → xxx（未孵化只算「图鉴未点亮」，不算拥有）
  for (const e of props.eggs || []) {
    const code = (e.itemCode || '').replace(/^egg-/, '');
    if (code && code !== e.itemCode && !map.has(code)) {
      map.set(code, {
        code,
        name: '？？？',
        icon: e.config?.icon,
        iconUrl: e.config?.iconUrl,
        owned: false,
      });
    }
  }

  return [...map.values()];
});

const dexOwnedCount = computed(() => dexEntries.value.filter(d => d.owned).length);

/** 出战宠物加成 chips（读 effectJson，直出） */
const petBonusChips = computed(() => {
  const fx = equippedPet.value?.config?.effectJson || {};
  const chips: string[] = [];
  if (fx.expBoost) chips.push(`阅读 EXP +${Math.round(fx.expBoost * 100)}%`);
  if (fx.currencyBoost) chips.push(`金币 +${Math.round(fx.currencyBoost * 100)}%`);
  if (fx.reputationBoost) chips.push(`声望 +${Math.round(fx.reputationBoost * 100)}%`);
  return chips;
});

const canExchange = (item: ItemConfigView) =>
  (item.effectJson?.currencyCost ?? 0) > 0 && !isOwned(item.code);

const showRenameModal = ref(false);
const renamePetId = ref<number | null>(null);
const renamePetName = ref('');
const renameOriginalName = ref('');

const openRenameModal = (pet: any) => {
  renamePetId.value = pet.id;
  renameOriginalName.value = pet.nickname || pet.config?.name || '';
  renamePetName.value = pet.nickname || '';
  showRenameModal.value = true;
};

const closeRenameModal = () => {
  showRenameModal.value = false;
  renamePetId.value = null;
  renamePetName.value = '';
};

const saveRename = () => {
  const name = renamePetName.value.trim();
  if (!renamePetId.value || !name) return;
  emit('rename', renamePetId.value, name);
  closeRenameModal();
};

const handleBuy = async (catalogItem: ItemConfigView) => {
  if (isOwned(catalogItem.code)) return;
  const cost = catalogItem.effectJson?.currencyCost ?? 0;
  const ok = await confirm({
    title: '确认兑换宠物',
    description: `将消耗 ${cost} 钻石兑换「${catalogItem.name}」，确定继续吗？`,
    confirmLabel: '确认兑换',
    confirmColor: 'warning',
  });
  if (ok) emit('buy', catalogItem.code);
};
</script>

<template>
  <div class="pet-panel space-y-4">
    <RpgPanelLoading v-if="loading" compact />
    <template v-else>
      <!-- ① 出战详情：金圈光环大图 + 加成 chips + 改名/休息 -->
      <div v-if="equippedPet" class="rpg-pet-hero">
        <div class="rpg-pet-stage">
          <span class="rpg-pet-stage__halo" aria-hidden="true" />
          <RpgItemIcon
            class="rpg-pet-stage__icon"
            :icon="equippedPet.config?.icon"
            :icon-url="equippedPet.config?.iconUrl"
            :bg-url="equippedPet.config?.bgUrl"
            :item-type-icon="equippedPet.config?.itemTypeIcon"
            :rarity-color="equippedPet.config?.rarityColor"
            size="xl"
          />
          <span class="rpg-pet-stage__deploy">出战中</span>
        </div>
        <div class="rpg-pet-hero__meta">
          <h3 class="rpg-pet-hero__name">
            {{ equippedPet.nickname || equippedPet.config?.name }}
          </h3>
          <div v-if="petBonusChips.length" class="rpg-pet-bonus">
            <span v-for="chip in petBonusChips" :key="chip" class="rpg-pet-bonus__chip">{{
              chip
            }}</span>
          </div>
          <p class="rpg-pet-hero__desc">
            Lv{{ equippedPet.level }} · 加成在阅读/评论结算时自动生效
          </p>
          <div class="rpg-pet-hero__actions">
            <button class="rpg-pet-btn rpg-pet-btn--ghost" @click="openRenameModal(equippedPet)">
              改名
            </button>
            <button class="rpg-pet-btn rpg-pet-btn--ghost" @click="emit('rest')">
              休息（卸下）
            </button>
          </div>
        </div>
      </div>

      <!-- ② 孵化仓：持有蛋 → 一键即时孵化（无进度条）；v3 ⑦ 空态规范 -->
      <div v-if="eggs.length">
        <h4 class="rpg-section-heading">
          孵化仓 <small class="rpg-section-sub">蛋即点即孵 · pets/summon</small>
        </h4>
        <div class="rpg-egg-grid">
          <div v-for="e in eggs" :key="e.itemCode" class="rpg-egg-card">
            <RpgItemIcon
              class="rpg-egg-card__icon"
              :icon="e.config?.icon"
              :icon-url="e.config?.iconUrl"
              :bg-url="e.config?.bgUrl"
              :item-type-icon="e.config?.itemTypeIcon"
              size="lg"
              :tinted="false"
            />
            <b class="rpg-egg-card__name">{{ e.config?.name }}</b>
            <span class="rpg-egg-card__hint">孵化后自动进入宠物仓库</span>
            <span class="rpg-egg-card__qty">×{{ e.quantity }}</span>
            <button class="rpg-pet-btn rpg-pet-btn--gold" @click="emit('hatch', e.itemCode)">
              立即孵化
            </button>
          </div>
        </div>
      </div>
      <div v-else class="rpg-empty-card">
        <img class="rpg-empty-card__art" src="/rpg/icons/egg.png" alt="" loading="lazy">
        <b>孵化仓空空如也</b>
        <p>去抽奖池碰碰运气，或用钻石直购一只蛋宠。</p>
        <button class="rpg-pet-btn rpg-pet-btn--gold" @click="emit('goto', 'lottery')">
          去抽奖
        </button>
      </div>

      <!-- v3 ④ 宠物图鉴：收集进度 + 未拥有灰化剪影 -->
      <div v-if="dexEntries.length">
        <h4 class="rpg-section-heading">
          宠物图鉴 <small class="rpg-section-sub">收集全图鉴 → 解锁隐藏成就「万物有灵」</small>
        </h4>
        <div class="rpg-dex-bar">
          <b>{{ dexOwnedCount }}<small> / {{ dexEntries.length }} 图鉴</small></b>
          <div class="rpg-dex-bar__track">
            <i :style="{ width: (dexOwnedCount / dexEntries.length) * 100 + '%' }" />
          </div>
        </div>
        <div class="rpg-dex-grid">
          <div
            v-for="d in dexEntries"
            :key="d.code"
            class="rpg-dex"
            :class="{ 'rpg-dex--owned': d.owned, 'rpg-dex--locked': !d.owned }"
          >
            <RpgItemIcon
              class="rpg-dex__icon"
              :icon="d.icon"
              :icon-url="d.iconUrl"
              size="md"
              :tinted="!d.owned"
            />
            <b>{{ d.owned ? d.name : '？？？' }}</b>
          </div>
        </div>
      </div>

      <!-- ③ 宠物仓库：点击出战（loadout/equip pet 槽） -->
      <div>
        <h4 class="rpg-section-heading">
          宠物仓库 <small class="rpg-section-sub">点击宠物 → 出战</small>
        </h4>

        <div v-if="!pets.length" class="rpg-pet-empty">
          <img class="rpg-pet-empty__art" src="/rpg/art/dragon-pet.png" alt="" loading="lazy">
          <p class="rpg-pet-empty__text">
            还没有宠物，去孵化或兑换一只吧
          </p>
        </div>
        <div v-else class="rpg-loot-grid rpg-pet-grid">
          <div
            v-for="p in pets"
            :key="p.id"
            class="rpg-loot-card rpg-pet-card"
            :class="{ 'rpg-pet-card--deployed': equippedPetId === p.id }"
            role="button"
            tabindex="0"
            @click="equippedPetId !== p.id && emit('deploy', p.id)"
            @keydown.enter="equippedPetId !== p.id && emit('deploy', p.id)"
          >
            <span v-if="equippedPetId === p.id" class="rpg-pet-card__tag">出战</span>
            <RpgItemIcon
              class="rpg-pet-card__icon"
              :icon="p.config?.icon"
              :icon-url="p.config?.iconUrl"
              :bg-url="p.config?.bgUrl"
              :item-type-icon="p.config?.itemTypeIcon"
              :rarity-color="p.config?.rarityColor"
              size="lg"
            />
            <b class="rpg-pet-card__name">{{ p.nickname || p.config?.name }}</b>
            <span class="rpg-pet-card__lv">Lv{{ p.level }}</span>
            <div v-if="equippedPetId !== p.id" class="rpg-pet-card__actions">
              <button
                class="rpg-pet-btn rpg-pet-btn--ghost rpg-pet-btn--sm"
                @click.stop="openRenameModal(p)"
              >
                改名
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ④ 钻石兑换：没有蛋了？钻石直购 -->
      <div v-if="exchangeCatalog.length">
        <h4 class="rpg-section-heading">
          钻石兑换 <small class="rpg-section-sub">没有蛋了？钻石直购宠物 · pets/exchange</small>
        </h4>
        <div class="rpg-loot-grid">
          <div
            v-for="c in exchangeCatalog"
            :key="c.code"
            class="rpg-loot-card rpg-loot-card--stacked"
            :class="{ 'rpg-loot-card--claimed': isOwned(c.code) }"
          >
            <div class="rpg-loot-card-body">
              <div class="rpg-loot-card-head">
                <RpgItemIcon
                  :icon="c.icon"
                  :icon-url="c.iconUrl"
                  :bg-url="c.bgUrl"
                  :item-type-icon="c.itemTypeIcon"
                  :rarity-color="c.rarityColor"
                />
                <span v-if="isOwned(c.code)" class="rpg-loot-status rpg-loot-status--done">已兑换</span>
              </div>
              <div class="rpg-loot-name">
                {{ c.name }}
              </div>
              <p v-if="c.description" class="rpg-loot-desc">
                {{ c.description }}
              </p>
              <RpgRarityBadge
                :rarity="c.rarity"
                :rarity-label="c.rarityLabel"
                :rarity-color="c.rarityColor"
                :rarity-icon="c.rarityIcon"
              />
            </div>
            <div class="rpg-loot-footer rpg-loot-footer--center">
              <button v-if="canExchange(c)" class="rpg-loot-claim-btn w-full" @click="handleBuy(c)">
                <img class="btn-art" src="/rpg/icons/gem.png" alt="" loading="lazy">
                {{ c.effectJson?.currencyCost }} 兑换
              </button>
              <span v-else class="rpg-loot-owned-mark">已拥有</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <dialog class="modal rpg-theme" :class="{ 'modal-open': showRenameModal }">
      <div class="modal-box max-w-sm">
        <h3 class="font-bold text-lg mb-1">
          宠物改名
        </h3>
        <p v-if="renameOriginalName" class="text-sm text-base-content/60 mb-3">
          当前：{{ renameOriginalName }}
        </p>
        <input
          v-model="renamePetName"
          class="input input-bordered w-full"
          maxlength="20"
          placeholder="输入新昵称"
          @keyup.enter="saveRename"
        >
        <div class="rpg-modal-actions">
          <button
            type="button"
            class="rpg-modal-btn rpg-modal-btn--secondary rpg-modal-btn--sm"
            @click="closeRenameModal"
          >
            取消
          </button>
          <button
            type="button"
            class="rpg-modal-btn rpg-modal-btn--primary rpg-modal-btn--sm"
            :disabled="!renamePetName.trim()"
            @click="saveRename"
          >
            保存
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click="closeRenameModal">
        <button>close</button>
      </form>
    </dialog>
  </div>
</template>

<style scoped>
  .pet-panel .rpg-loot-card {
    min-height: 128px;
  }

  .rpg-section-sub {
    font-size: 11px;
    font-weight: 500;
    color: var(--rpg-text-muted, oklch(var(--bc) / 0.55));
    margin-left: 6px;
  }

  /* ── ① 出战详情 ── */
  .rpg-pet-hero {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 18px 20px;
    border-radius: 16px;
    border: 1px solid var(--rpg-border, oklch(var(--b3)));
    background:
      radial-gradient(
        90% 140% at 0% 50%,
        color-mix(in oklch, var(--rpg-art-violet, #7c5cf0) 12%, transparent) 0%,
        transparent 60%
      ),
      var(--rpg-surface, oklch(var(--b1)));
  }

  .rpg-pet-stage {
    position: relative;
    width: 118px;
    flex-shrink: 0;
    text-align: center;
  }

  .rpg-pet-stage__halo {
    position: absolute;
    inset: -10px -4px;
    border-radius: 50%;
    background: var(--rpg-art-halo);
    animation: rpgPetHalo 2.6s ease-in-out infinite;
    pointer-events: none;
  }

  .rpg-pet-stage__icon {
    width: 96px !important;
    height: 96px !important;
    border-radius: 50% !important;
    box-shadow:
      0 0 0 3px var(--rpg-surface, #fff),
      0 0 0 5px var(--rpg-art-gold, #d9a13c),
      0 10px 22px rgb(217 161 60 / 0.3) !important;
  }

  .rpg-pet-stage__deploy {
    display: inline-block;
    margin-top: 10px;
    padding: 2px 12px;
    border-radius: 999px;
    background: var(--rpg-art-violet, #7c5cf0);
    color: #fff;
    font-size: 10px;
    font-weight: 700;
  }

  .rpg-pet-hero__meta {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 9px;
  }

  .rpg-pet-hero__name {
    margin: 0;
    font-size: 19px;
    font-weight: 800;
    color: var(--rpg-text-heading, oklch(var(--bc)));
  }

  .rpg-pet-bonus {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .rpg-pet-bonus__chip {
    font-size: 11px;
    font-weight: 700;
    color: var(--rpg-art-violet-deep, #5b3fd6);
    background: var(--rpg-art-violet-soft, #f1edfb);
    border-radius: 999px;
    padding: 4px 10px;
  }

  .rpg-pet-hero__desc {
    margin: 0;
    font-size: 12px;
    line-height: 1.7;
    color: var(--rpg-text-muted, oklch(var(--bc) / 0.6));
  }

  .rpg-pet-hero__actions {
    display: flex;
    gap: 8px;
    margin-top: auto;
  }

  /* ── 通用小按钮（紫/金 双色系）── */
  .rpg-pet-btn {
    border: 0;
    cursor: pointer;
    font-weight: 700;
    font-size: 12.5px;
    padding: 7px 16px;
    border-radius: 10px;
    transition:
      filter 0.2s,
      transform 0.15s,
      box-shadow 0.2s;
  }

  .rpg-pet-btn:active {
    transform: translateY(1px);
  }

  .rpg-pet-btn--ghost {
    background: var(--rpg-art-violet-soft, #f1edfb);
    color: var(--rpg-art-violet-deep, #5b3fd6);
  }

  .rpg-pet-btn--ghost:hover {
    filter: brightness(0.97);
  }

  .rpg-pet-btn--gold {
    background: var(--rpg-art-gold-grad);
    color: var(--rpg-art-gold-ink, #3a2408);
    box-shadow: var(--rpg-art-shadow-gold);
  }

  .rpg-pet-btn--gold:hover {
    filter: brightness(1.05);
  }

  .rpg-pet-btn--sm {
    font-size: 11px;
    padding: 5px 12px;
    border-radius: 8px;
  }

  /* ── ② 孵化仓 ── */
  .rpg-egg-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }

  .rpg-egg-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    text-align: center;
    border: 1px solid var(--rpg-border, oklch(var(--b3)));
    border-radius: 14px;
    padding: 16px 10px 14px;
    background: var(--rpg-bg-alt, oklch(var(--b2)));
    transition:
      transform 0.2s,
      box-shadow 0.2s;
  }

  .rpg-egg-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--rpg-art-shadow-gold);
  }

  .rpg-egg-card__icon {
    transition: transform 0.2s;
  }

  .rpg-egg-card:hover .rpg-egg-card__icon {
    transform: scale(1.06);
  }

  .rpg-egg-card__name {
    display: block;
    font-size: 13px;
    margin-top: 6px;
    color: var(--rpg-text-heading, oklch(var(--bc)));
  }

  .rpg-egg-card__hint {
    font-size: 11px;
    color: var(--rpg-text-muted, oklch(var(--bc) / 0.55));
    margin-bottom: 8px;
  }

  .rpg-egg-card__qty {
    position: absolute;
    top: 8px;
    right: 8px;
    font-size: 10px;
    font-weight: 800;
    padding: 1px 7px;
    border-radius: 999px;
    background: var(--rpg-art-violet-soft, #f1edfb);
    color: var(--rpg-art-violet-deep, #5b3fd6);
  }

  /* ── ③ 宠物仓库 ── */
  .rpg-pet-grid {
    grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
  }

  .rpg-pet-card {
    align-items: center;
    text-align: center;
    gap: 2px;
    cursor: pointer;
  }

  .rpg-pet-card:hover {
    transform: translateY(-3px);
  }

  .rpg-pet-card--deployed {
    border-color: color-mix(in oklch, var(--rpg-art-violet, #7c5cf0) 55%, transparent);
    background: var(--rpg-art-violet-soft, #f1edfb);
  }

  .rpg-pet-card__tag {
    position: absolute;
    top: 6px;
    left: 6px;
    font-size: 9.5px;
    font-weight: 800;
    padding: 2px 8px;
    border-radius: 999px;
    color: #fff;
    background: var(--rpg-art-violet, #7c5cf0);
    z-index: 1;
  }

  .rpg-pet-card__name {
    display: block;
    font-size: 12px;
    font-weight: 800;
    margin-top: 6px;
    color: var(--rpg-text-heading, oklch(var(--bc)));
  }

  .rpg-pet-card__lv {
    font-size: 10.5px;
    color: var(--rpg-text-muted, oklch(var(--bc) / 0.55));
  }

  .rpg-pet-card__actions {
    margin-top: 6px;
  }

  /* ── 空状态吉祥物 ── */
  .rpg-pet-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 18px 12px 22px;
    border-radius: 14px;
    border: 1px dashed var(--rpg-border, oklch(var(--b3)));
    background: var(--rpg-bg-alt, oklch(var(--b2)));
  }

  .rpg-pet-empty__art {
    width: 110px;
    height: 110px;
    object-fit: contain;
    animation: rpgPetIdle 2.8s ease-in-out infinite;
  }

  .rpg-pet-empty__text {
    font-size: 13px;
    color: var(--rpg-text-muted, oklch(var(--bc) / 0.6));
  }

  @keyframes rpgPetIdle {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-6px);
    }
  }

  @keyframes rpgPetHalo {
    0%,
    100% {
      opacity: 0.55;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
  }

  @media (max-width: 639px) {
    .rpg-pet-hero {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .rpg-pet-stage {
      align-self: center;
    }

    .rpg-egg-grid {
      grid-template-columns: 1fr;
    }

    .rpg-pet-grid {
      grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
    }
  }

  /* ── v3 ④ 宠物图鉴 ── */
  .rpg-dex-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  .rpg-dex-bar b {
    font-size: 18px;
    color: var(--rpg-text-heading, oklch(var(--bc)));
    white-space: nowrap;
  }

  .rpg-dex-bar b small {
    font-size: 11.5px;
    font-weight: 600;
    color: var(--rpg-text-muted, oklch(var(--bc) / 0.6));
  }

  .rpg-dex-bar__track {
    flex: 1;
    height: 10px;
    border-radius: 999px;
    background: var(--rpg-border, #efeaf9);
    overflow: hidden;
  }

  .rpg-dex-bar__track i {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, #e8b04b, #d9a13c);
    border-radius: 999px;
    transition: width 0.4s ease;
  }

  .rpg-dex-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(86px, 1fr));
    gap: 10px;
  }

  .rpg-dex {
    position: relative;
    text-align: center;
    border: 2px solid var(--rpg-border, #e8e3f2);
    border-radius: 14px;
    padding: 10px 4px 8px;
    background: var(--rpg-surface, #faf9fe);
    transition: border-color 0.2s;
  }

  .rpg-dex__icon {
    margin: 0 auto;
  }

  .rpg-dex b {
    display: block;
    font-size: 10.5px;
    margin-top: 5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--rpg-text-heading, oklch(var(--bc)));
  }

  .rpg-dex--owned {
    border-color: #c9b9f7;
    background: var(--rpg-art-violet-soft, #f6f2fe);
  }

  .rpg-dex--owned::after {
    content: '✓';
    position: absolute;
    top: 5px;
    right: 7px;
    font-size: 11px;
    font-weight: 800;
    color: #2fa46a;
  }

  .rpg-dex--locked {
    opacity: 0.55;
    filter: grayscale(0.65);
  }

  .rpg-dex--locked b {
    color: var(--rpg-text-muted, oklch(var(--bc) / 0.55));
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
</style>
