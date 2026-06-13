<script setup lang="ts">
defineProps<{
  pets: any[];
  eggs: any[];
  catalog: any[];
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

const renameId = ref<number | null>(null);
const nickname = ref('');
</script>

<template>
  <div class="pet-panel space-y-4">
    <div v-if="loading" class="text-sm text-base-content/50">
      加载中...
    </div>
    <template v-else>
      <div v-if="catalog.length">
        <h4 class="text-sm font-semibold mb-2">
          钻石兑换
        </h4>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="c in catalog.filter((x: any) => x.effectJson?.currencyCost)"
            :key="c.code"
            class="btn btn-sm btn-outline"
            @click="emit('buy', c.code)"
          >
            💎 {{ c.effectJson.currencyCost }} · {{ c.name }}
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
            <button v-if="equippedPetId !== p.id" class="btn btn-xs" @click="emit('deploy', p.id)">
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
        <button
          class="btn btn-sm btn-primary"
          @click="
            emit('rename', renameId, nickname);
            renameId = null;
          "
        >
          保存
        </button>
      </div>
    </template>
  </div>
</template>
