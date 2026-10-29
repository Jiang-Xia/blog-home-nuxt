<script setup lang="ts">
/**
   * 个人页社交栏：加油 / 砸蛋 / 送花（发送方页面音，收方走 WS 弹窗）
   */
import { socialCheer, socialEgg, socialFlower } from '~~/api/rpg';
import { ensureLoggedIn } from '@/composables/use-common';
import { messageSuccess, messageError } from '~~/utils/toast';
import { handleRpgCurrencyError } from '~~/utils/rpg-currency-error';
import type { RpgSynthSfxKey } from '~~/constants/rpg-audio';

defineProps<{ targetUid: number }>();
const loading = ref(false);
const { playSfx } = useRpgAudio();

/** 统一社交操作：API 成功后可选播放发送方音效 */
const act = async (
  fn: () => Promise<any>,
  getLabel?: (_res: any) => string,
  sfx?: RpgSynthSfxKey,
) => {
  if (!(await ensureLoggedIn())) {
    messageError('请先登录');
    return;
  }
  loading.value = true;
  try {
    const res = await fn();
    if (sfx) void playSfx(sfx);
    messageSuccess(getLabel ? getLabel(res) : '操作成功');
  }
  catch (e: any) {
    handleRpgCurrencyError(e, '操作失败');
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
      @click="
        act(
          () => socialCheer(targetUid),
          (res) => `加油成功，对方 +${Math.abs(res?.hpDelta ?? 10)} 生命`,
          'socialCheer',
        )
      "
    >
      <img class="social-btn__art" src="/rpg/icons/hands.png" alt="" loading="lazy"> 加油
    </button>
    <button
      class="btn btn-sm btn-outline btn-warning"
      :disabled="loading"
      @click="
        act(
          () => socialEgg(targetUid),
          () => '扔鸡蛋成功',
          'socialEgg',
        )
      "
    >
      <img class="social-btn__art" src="/rpg/icons/egg.png" alt="" loading="lazy"> 扔鸡蛋
      (-15钻石)
    </button>
    <button
      class="btn btn-sm btn-outline btn-secondary"
      :disabled="loading"
      @click="
        act(
          () => socialFlower(targetUid),
          () => '送鲜花成功',
          'socialFlower',
        )
      "
    >
      <img class="social-btn__art" src="/rpg/icons/flower.png" alt="" loading="lazy"> 送鲜花
      (-10钻石)
    </button>
  </div>
</template>

<style scoped>
  /* v6/G：美术小图统一 16px 内联（同 ArticleHeroSocialBar 规范） */
  .social-btn__art {
    width: 16px;
    height: 16px;
    object-fit: contain;
    vertical-align: -3px;
    margin-right: 2px;
  }
</style>
