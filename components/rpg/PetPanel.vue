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
      <div v-if="exchangeCatalog.length">
        <h4 class="rpg-section-heading">
          钻石兑换
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
                <div class="rpg-loot-icon">
                  🐾
                </div>
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
            <div class="rpg-loot-footer">
              <button v-if="canExchange(c)" class="rpg-loot-claim-btn w-full" @click="handleBuy(c)">
                💎 {{ c.effectJson?.currencyCost }} 兑换
              </button>
              <span v-else class="rpg-loot-status rpg-loot-status--pending w-full justify-center">
                已拥有
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="eggs.length">
        <h4 class="rpg-section-heading">
          宠物蛋
        </h4>
        <div class="rpg-panel-tabs">
          <button
            v-for="e in eggs"
            :key="e.itemCode"
            class="rpg-panel-tab"
            @click="emit('hatch', e.itemCode)"
          >
            🥚 {{ e.config?.name }} 孵化
          </button>
        </div>
      </div>

      <div>
        <div class="flex items-center justify-between mb-2">
          <h4 class="rpg-section-heading mb-0">
            我的宠物
          </h4>
          <button v-if="equippedPetId" class="rpg-panel-tab" @click="emit('rest')">
            休息（下架）
          </button>
        </div>
        <div v-if="!pets.length" class="rpg-empty-inline">
          暂无宠物
        </div>
        <div v-else class="rpg-loot-grid">
          <div
            v-for="p in pets"
            :key="p.id"
            class="rpg-loot-card"
            :class="{ 'rpg-loot-card--active': equippedPetId === p.id }"
          >
            <div class="rpg-loot-card-head">
              <div class="rpg-loot-icon">
                🐾
              </div>
              <span v-if="equippedPetId === p.id" class="rpg-loot-status rpg-loot-status--done">出战中</span>
            </div>
            <div class="rpg-loot-name">
              {{ p.nickname || p.config?.name }}
            </div>
            <div class="rpg-loot-desc">
              Lv{{ p.level }}
              <span v-if="p.config?.effectJson?.expBoost">
                · 经验+{{ Math.round(p.config.effectJson.expBoost * 100) }}%
              </span>
            </div>
            <div class="rpg-loot-footer">
              <div class="rpg-loot-card-actions">
                <button
                  v-if="equippedPetId !== p.id"
                  class="rpg-loot-claim-btn"
                  @click="emit('deploy', p.id)"
                >
                  出战
                </button>
                <button class="rpg-panel-tab" @click="openRenameModal(p)">
                  改名
                </button>
              </div>
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
</style>
