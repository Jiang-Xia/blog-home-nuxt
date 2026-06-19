<script setup lang="ts">
import { tipArticle } from '~~/api/rpg';
import { messageSuccess, messageError } from '~~/utils/toast';
import { handleRpgCurrencyError } from '~~/utils/rpg-currency-error';

const props = defineProps<{ articleId: number; authorUid: number }>();
const emit = defineEmits<{ tipped: [] }>();
const userInfo = useUserInfo();
const amount = ref(50);
const loading = ref(false);

const submit = async () => {
  if (!userInfo.value?.uid) {
    messageError('请先登录');
    return;
  }
  if (userInfo.value.uid === props.authorUid) {
    messageError('不能打赏自己的文章');
    return;
  }
  loading.value = true;
  try {
    await tipArticle(props.articleId, amount.value);
    messageSuccess(`打赏 ${amount.value} 钻石成功`);
    emit('tipped');
  }
  catch (e: any) {
    handleRpgCurrencyError(e, '打赏失败');
  }
  finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="tip-panel flex items-center gap-2 mt-3 p-3 rounded-lg bg-base-200/50">
    <span class="text-sm">💎 打赏作者</span>
    <input
      v-model.number="amount"
      type="number"
      min="1"
      class="input input-sm input-bordered w-20"
    >
    <button class="btn btn-sm btn-primary" :disabled="loading" @click="submit">
      打赏
    </button>
  </div>
</template>
