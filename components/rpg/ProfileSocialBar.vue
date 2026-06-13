<script setup lang="ts">
import { socialCheer, socialEgg, socialFlower } from '~~/api/rpg';
import { messageSuccess, messageError } from '~~/utils/toast';

defineProps<{ targetUid: number }>();
const userInfo = useUserInfo();
const loading = ref(false);

const act = async (fn: () => Promise<any>, label: string) => {
  if (!userInfo.value?.uid) {
    messageError('请先登录');
    return;
  }
  loading.value = true;
  try {
    await fn();
    messageSuccess(label);
  }
  catch (e: any) {
    messageError(e?.message || '操作失败');
  }
  finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="social-bar flex flex-wrap gap-2 mt-4">
    <button
      class="btn btn-sm btn-outline"
      :disabled="loading"
      @click="act(() => socialCheer(targetUid), '加油成功 +生命')"
    >
      👏 加油
    </button>
    <button
      class="btn btn-sm btn-outline btn-warning"
      :disabled="loading"
      @click="act(() => socialEgg(targetUid), '扔鸡蛋成功')"
    >
      🥚 扔鸡蛋 (-15钻石)
    </button>
    <button
      class="btn btn-sm btn-outline btn-secondary"
      :disabled="loading"
      @click="act(() => socialFlower(targetUid), '送鲜花成功')"
    >
      🌸 送鲜花 (-10钻石)
    </button>
  </div>
</template>
