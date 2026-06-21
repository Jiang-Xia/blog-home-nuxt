<script setup lang="ts">
/**
   * 个人页社交栏：加油 / 砸蛋 / 送花（发送方页面音，收方走 WS 弹窗）
   */
import { socialCheer, socialEgg, socialFlower } from '~~/api/rpg';
import { messageSuccess, messageError } from '~~/utils/toast';
import { handleRpgCurrencyError } from '~~/utils/rpg-currency-error';
import type { RpgSynthSfxKey } from '~~/constants/rpg-audio';

defineProps<{ targetUid: number }>();
const userInfo = useUserInfo();
const loading = ref(false);
const { playSfx } = useRpgAudio();

/** 统一社交操作：API 成功后可选播放发送方音效 */
const act = async (
  fn: () => Promise<any>,
  getLabel?: (_res: any) => string,
  sfx?: RpgSynthSfxKey,
) => {
  if (!userInfo.value?.uid) {
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
      👏 加油
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
      🥚 扔鸡蛋 (-15钻石)
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
      🌸 送鲜花 (-10钻石)
    </button>
  </div>
</template>
