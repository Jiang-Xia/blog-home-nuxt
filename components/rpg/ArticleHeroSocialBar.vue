<script setup lang="ts">
import { socialCheer, socialEgg, socialFlower } from '~~/api/rpg';
import { messageError, messageSuccess } from '~~/utils/toast';
import { useRpg } from '~~/composables/use-rpg';

const props = defineProps<{
  authorUid: number;
  articleId: number | string;
}>();

const emit = defineEmits<{ tipped: [] }>();

const userInfo = useUserInfo();
const { fetchQuests } = useRpg();
const loading = ref(false);
const showTipModal = ref(false);

const isAuthor = computed(() => userInfo.value?.uid === props.authorUid);

const ensureLogin = async () => {
  if (!userInfo.value?.uid) {
    messageError('请先登录');
    await goLogin();
    return false;
  }
  return true;
};

const act = async (fn: () => Promise<any>, getLabel?: (res: any) => string) => {
  if (!(await ensureLogin())) return;
  if (isAuthor.value) {
    messageError('不能对自己操作');
    return;
  }
  if (loading.value) return;
  loading.value = true;
  try {
    const res = await fn();
    messageSuccess(getLabel ? getLabel(res) : '操作成功');
    await fetchQuests();
  }
  catch (e: any) {
    messageError(e?.message || '操作失败');
  }
  finally {
    loading.value = false;
  }
};

const openTipModal = async () => {
  if (!(await ensureLogin())) return;
  if (isAuthor.value) {
    messageError('不能打赏自己');
    return;
  }
  showTipModal.value = true;
};

const onTipped = () => {
  showTipModal.value = false;
  emit('tipped');
};
</script>

<template>
  <div v-if="authorUid && !isAuthor" class="hero-social-bar">
    <button
      class="btn btn-sm btn-outline hero-social-btn"
      :disabled="loading"
      @click="
        act(
          () => socialCheer(authorUid),
          (res) => `加油成功，对方 +${Math.abs(res?.hpDelta ?? 10)} 生命`,
        )
      "
    >
      👏 加油
    </button>
    <button
      class="btn btn-sm btn-outline btn-warning hero-social-btn"
      :disabled="loading"
      @click="
        act(
          () => socialEgg(authorUid),
          () => '扔鸡蛋成功',
        )
      "
    >
      🥚 扔鸡蛋 (-15钻石)
    </button>
    <button
      class="btn btn-sm btn-outline btn-secondary hero-social-btn"
      :disabled="loading"
      @click="
        act(
          () => socialFlower(authorUid),
          () => '送鲜花成功',
        )
      "
    >
      🌸 送鲜花 (-10钻石)
    </button>
    <button class="btn btn-sm btn-accent hero-social-btn" :disabled="loading" @click="openTipModal">
      💎 打赏作者
    </button>
  </div>

  <dialog class="modal rpg-theme" :class="{ 'modal-open': showTipModal }">
    <div class="modal-box max-w-sm">
      <h3 class="font-bold text-lg mb-2">
        💎 打赏作者
      </h3>
      <RpgArticleTipPanel
        :article-id="Number(articleId)"
        :author-uid="authorUid"
        @tipped="onTipped"
      />
      <div class="modal-action">
        <button class="btn btn-sm" @click="showTipModal = false">
          关闭
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop" @click="showTipModal = false">
      <button>close</button>
    </form>
  </dialog>
</template>

<style scoped>
  .hero-social-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid var(--rpg-border-subtle, oklch(var(--bc) / 0.12));
  }

  .hero-social-btn {
    backdrop-filter: blur(6px);
  }
</style>
