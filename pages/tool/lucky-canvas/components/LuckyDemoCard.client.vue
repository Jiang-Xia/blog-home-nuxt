<!--
  lucky-canvas 单个示例播放器：按 catalog 的 type 渲染 LuckyWheel / LuckyGrid / SlotMachine。
  进入视口后再挂载画布；纯前端演示，无后端 API。
-->
<script setup lang="ts">
import { LuckyWheel, LuckyGrid, SlotMachine } from '@lucky-canvas/vue';
import loadingGif from '@/assets/images/gif/loading3-min.gif';
import type { LuckyDemoItem } from '../demos/catalog';

const props = defineProps<{
  demo: LuckyDemoItem;
}>();

const rootRef = ref<HTMLElement | null>(null);
const inView = ref(false);
const luckyRef = ref<{ play: () => void; stop: (index: number) => void } | null>(null);
const resultText = ref('');
const spinning = ref(false);

/** 从奖品对象拼出结果文案（纯图奖品需在配置里写 name/title） */
function prizeLabel(prize: Record<string, unknown> | undefined | null): string {
  if (!prize) return '未中奖';
  if (typeof prize.name === 'string' && prize.name.trim()) return prize.name.trim();
  if (typeof prize.title === 'string' && prize.title.trim()) return prize.title.trim();
  if (typeof prize.id === 'string' || typeof prize.id === 'number') return String(prize.id);
  const fonts = prize.fonts as Array<{ text?: string }> | undefined;
  const fontText = fonts?.map(f => f.text).find(t => typeof t === 'string' && t.trim());
  if (fontText) return fontText.trim();
  return '未命名奖品';
}

/** 播放动画后随机停到某一奖品 */
function onStart() {
  if (spinning.value || !luckyRef.value) return;
  spinning.value = true;
  resultText.value = '';
  luckyRef.value.play();
  const prizes = props.demo.options.prizes || [];
  const n = Math.max(prizes.length, 1);
  window.setTimeout(() => {
    luckyRef.value?.stop((Math.random() * n) | 0);
  }, 2500);
}

function onExternalStart() {
  onStart();
}

/** 抽奖结束：标明为演示结果，避免真发奖口吻 */
function onEnd(prize: Record<string, unknown>) {
  spinning.value = false;
  resultText.value = `演示结果：${prizeLabel(prize)}`;
}

const opts = computed(() => props.demo.options);

const hasOverlayBtn = computed(
  () => !!props.demo.externalButton?.overlay && props.demo.externalButton.kind === 'image',
);

const hasBelowBtn = computed(
  () => !!props.demo.externalButton && !props.demo.externalButton.overlay,
);

const overlayStyle = computed(() => {
  const o = props.demo.externalButton?.overlay;
  if (!o) return {};
  return {
    width: o.width || '180px',
    left: o.left || '25%',
    top: o.top || '70%',
  };
});

/** 进入视口（含预加载边距）后再创建 Canvas，减轻一页 15 实例压力 */
onMounted(() => {
  const el = rootRef.value;
  if (!el || typeof IntersectionObserver === 'undefined') {
    inView.value = true;
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some(e => e.isIntersecting)) {
        inView.value = true;
        io.disconnect();
      }
    },
    { rootMargin: '160px 0px', threshold: 0.01 },
  );
  io.observe(el);
  onBeforeUnmount(() => io.disconnect());
});
</script>

<template>
  <div ref="rootRef" class="lucky-demo-card flex flex-col items-center">
    <!-- 未进入视口：占位，避免布局跳动 -->
    <div
      v-if="!inView"
      class="flex items-center justify-center rounded-lg border border-dashed border-tech/40 bg-tech/5"
      :style="{ width: demo.width, height: demo.height }"
    >
      <img
        :src="loadingGif"
        alt="加载中"
        class="max-h-[70%] max-w-[70%] rounded-lg object-contain opacity-90"
      >
    </div>

    <template v-else>
      <div
        v-if="demo.type === 'slot' && hasOverlayBtn"
        class="relative overflow-hidden rounded-xl leading-none"
        :style="{ width: demo.width, height: demo.height }"
      >
        <SlotMachine
          ref="luckyRef"
          :width="demo.width"
          :height="demo.height"
          :blocks="opts.blocks || []"
          :prizes="opts.prizes || []"
          :slots="opts.slots || []"
          :default-style="opts.defaultStyle || {}"
          :default-config="opts.defaultConfig || {}"
          @end="onEnd"
        />
        <button
          type="button"
          class="absolute cursor-pointer border-0 bg-transparent p-0"
          :style="overlayStyle"
          :disabled="spinning"
          @click="onExternalStart"
        >
          <img
            :src="demo.externalButton!.src"
            :alt="demo.externalButton!.label"
            class="block w-full"
          >
          <span
            class="pointer-events-none absolute inset-0 flex items-center justify-center font-bold text-white"
            style="text-shadow: 0 1px 2px #000; font-size: 18px"
          >
            {{ demo.externalButton!.label }}
          </span>
        </button>
      </div>

      <template v-else>
        <!-- 画布外包一层圆角裁剪（如 bilibili 背景图为直角） -->
        <div class="overflow-hidden rounded-xl leading-none">
          <LuckyWheel
            v-if="demo.type === 'wheel'"
            ref="luckyRef"
            :width="demo.width"
            :height="demo.height"
            :blocks="opts.blocks || []"
            :prizes="opts.prizes || []"
            :buttons="opts.buttons || []"
            :default-style="opts.defaultStyle || {}"
            :default-config="opts.defaultConfig || {}"
            @start="onStart"
            @end="onEnd"
          />
          <LuckyGrid
            v-else-if="demo.type === 'grid'"
            ref="luckyRef"
            :width="demo.width"
            :height="demo.height"
            :rows="opts.rows || 3"
            :cols="opts.cols || 3"
            :blocks="opts.blocks || []"
            :prizes="opts.prizes || []"
            :buttons="opts.buttons || []"
            :button="opts.button"
            :default-style="opts.defaultStyle || {}"
            :active-style="opts.activeStyle || {}"
            :default-config="opts.defaultConfig || {}"
            @start="onStart"
            @end="onEnd"
          />
          <SlotMachine
            v-else
            ref="luckyRef"
            :width="demo.width"
            :height="demo.height"
            :blocks="opts.blocks || []"
            :prizes="opts.prizes || []"
            :slots="opts.slots || []"
            :default-style="opts.defaultStyle || {}"
            :default-config="opts.defaultConfig || {}"
            @end="onEnd"
          />
        </div>
      </template>

      <button
        v-if="hasBelowBtn && demo.externalButton?.kind === 'button'"
        type="button"
        class="cyber-btn-primary mt-3 px-6 py-2 text-sm"
        :disabled="spinning"
        @click="onExternalStart"
      >
        {{ demo.externalButton.label }}
      </button>

      <button
        v-else-if="hasBelowBtn && demo.externalButton?.kind === 'image'"
        type="button"
        class="relative mt-2 w-full max-w-[350px] cursor-pointer border-0 bg-transparent p-0"
        :disabled="spinning"
        @click="onExternalStart"
      >
        <img :src="demo.externalButton.src" :alt="demo.externalButton.label" class="block w-full">
        <span
          class="pointer-events-none absolute inset-0 flex items-center justify-center font-bold text-white"
          style="text-shadow: 0 1px 2px #000"
        >
          {{ demo.externalButton.label }}
        </span>
      </button>
    </template>

    <p class="mt-3 min-h-[1.4em] text-center text-sm font-medium text-primary">
      {{ resultText }}
    </p>
  </div>
</template>
