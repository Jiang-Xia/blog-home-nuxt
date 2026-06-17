<script setup lang="ts">
import type { ItemConfigView } from '~~/types/rpg';
import { useCyberModal } from '~~/composables/use-cyber-modal';

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

const { confirm } = useCyberModal();

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
    <div v-if="loading" class="text-sm text-base-content/50">
      加载中...
    </div>
    <template v-else>
      <div v-if="exchangeCatalog.length">
        <h4 class="text-sm font-semibold mb-2">
          钻石兑换
        </h4>
        <div class="exchange-grid">
          <div
            v-for="c in exchangeCatalog"
            :key="c.code"
            class="exchange-card"
            :class="{ 'exchange-card--exchanged': isOwned(c.code) }"
          >
            <div class="exchange-card-body">
              <div class="font-medium text-sm">
                🐾 {{ c.name }}
              </div>
              <p v-if="c.description" class="text-[11px] text-base-content/50 mt-1 line-clamp-2">
                {{ c.description }}
              </p>
              <RpgRarityBadge
                class="mt-2"
                :rarity="c.rarity"
                :rarity-label="c.rarityLabel"
                :rarity-color="c.rarityColor"
                :rarity-icon="c.rarityIcon"
              />
            </div>
            <button
              v-if="canExchange(c)"
              class="btn btn-xs btn-primary w-full"
              @click="handleBuy(c)"
            >
              💎 {{ c.effectJson?.currencyCost }} 兑换
            </button>
            <button v-else-if="isOwned(c.code)" class="btn btn-xs btn-outline w-full" disabled>
              已兑换
            </button>
          </div>
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
            @click="emit('hatch', e.itemCode)"
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
          <button v-if="equippedPetId" class="btn btn-xs btn-ghost" @click="emit('rest')">
            休息（下架）
          </button>
        </div>
        <div v-if="!pets.length" class="text-sm text-base-content/50">
          暂无宠物
        </div>
        <div v-else class="pet-grid">
          <div
            v-for="p in pets"
            :key="p.id"
            class="pet-card"
            :class="{ 'pet-card--active': equippedPetId === p.id }"
          >
            <div class="pet-card-body">
              <div class="font-medium text-sm">
                🐾 {{ p.nickname || p.config?.name }}
              </div>
              <div class="text-xs text-base-content/60 mt-1">
                Lv{{ p.level }}
                <span v-if="equippedPetId === p.id" class="text-primary ml-1">出战中</span>
              </div>
              <span
                v-if="p.config?.effectJson?.expBoost"
                class="text-[10px] text-base-content/50 mt-1 block"
              >
                经验+{{ Math.round(p.config.effectJson.expBoost * 100) }}%
              </span>
            </div>
            <div class="pet-card-actions">
              <button
                v-if="equippedPetId !== p.id"
                class="btn btn-xs"
                @click="emit('deploy', p.id)"
              >
                出战
              </button>
              <button class="btn btn-xs btn-ghost" @click="openRenameModal(p)">
                改名
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <dialog class="modal" :class="{ 'modal-open': showRenameModal }">
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
        <div class="modal-action">
          <button class="btn btn-ghost btn-sm" @click="closeRenameModal">
            取消
          </button>
          <button
            class="btn btn-primary btn-sm"
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
  .exchange-grid,
  .pet-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(188px, 1fr));
    gap: 10px;
  }

  .exchange-card,
  .pet-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px;
    border-radius: 10px;
    border: 1px solid var(--rpg-border-subtle, oklch(var(--b3)));
    background: var(--rpg-surface, oklch(var(--b1)));
    min-height: 120px;
  }

  .pet-card--active {
    border-color: var(--rpg-violet, oklch(var(--p)));
    background: var(--rpg-violet-bg, oklch(var(--p) / 0.08));
  }

  .exchange-card--exchanged {
    opacity: 0.72;
    background: oklch(var(--b2) / 0.5);
  }

  .pet-card-body,
  .exchange-card-body {
    flex: 1;
    min-width: 0;
  }

  .pet-card-actions {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }
</style>
