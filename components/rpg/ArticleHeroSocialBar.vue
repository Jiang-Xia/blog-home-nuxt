<script setup lang="ts">
/**
   * 文章详情 Hero 社交栏：加油 / 砸蛋 / 送花 / 打赏入口
   * 发送方操作成功后播放对应 social* 音效（收方由 WS 弹窗播音）
   */
import { socialCheer, socialEgg, socialFlower } from '~~/api/rpg';
import { messageError, messageSuccess } from '~~/utils/toast';
import { handleRpgCurrencyError } from '~~/utils/rpg-currency-error';
import { useRpg } from '~~/composables/use-rpg';
import type { RpgSynthSfxKey } from '~~/constants/rpg-audio';

const props = defineProps<{
  authorUid: number;
  articleId: number | string;
}>();

const emit = defineEmits<{ tipped: [] }>();

const userInfo = useUserInfo();
const { fetchQuests } = useRpg();
const { playSfx } = useRpgAudio();
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

/** 统一社交操作：API 成功后可选播放发送方音效 */
const act = async (
  fn: () => Promise<any>,
  getLabel?: (_res: any) => string,
  sfx?: RpgSynthSfxKey,
) => {
  if (!(await ensureLogin())) return;
  if (isAuthor.value) {
    messageError('不能对自己操作');
    return;
  }
  if (loading.value) return;
  loading.value = true;
  try {
    const res = await fn();
    if (sfx) void playSfx(sfx);
    messageSuccess(getLabel ? getLabel(res) : '操作成功');
    await fetchQuests();
  }
  catch (e: any) {
    handleRpgCurrencyError(e, '操作失败');
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
          'socialCheer',
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
          'socialEgg',
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
          'socialFlower',
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
      <div class="rpg-modal-actions">
        <button
          type="button"
          class="rpg-modal-btn rpg-modal-btn--secondary rpg-modal-btn--sm"
          @click="showTipModal = false"
        >
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
    border-top: 1px solid var(--rpg-hero-social-bar-border, var(--rpg-border-subtle));
  }

  .hero-social-btn {
    backdrop-filter: var(--rpg-hero-social-btn-backdrop, blur(6px));
    background-color: var(--rpg-hero-social-btn-bg, transparent);
    border-color: var(--rpg-hero-social-btn-border, var(--rpg-border));
    color: var(--rpg-hero-social-btn-fg, var(--rpg-text-body));
  }

  .hero-social-btn.btn-warning {
    border-color: var(--rpg-hero-social-btn-warning-border, var(--color-warning));
    color: var(--rpg-hero-social-btn-warning-fg, inherit);
  }

  .hero-social-btn.btn-secondary {
    border-color: var(--rpg-hero-social-btn-secondary-border, var(--color-secondary));
    color: var(--rpg-hero-social-btn-secondary-fg, inherit);
  }
</style>
