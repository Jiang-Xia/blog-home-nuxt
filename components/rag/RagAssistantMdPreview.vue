<script setup lang="ts">
/**
   * 助手 Markdown 预览：流式阶段纯文本；完成后离屏延迟挂载 MdPreview，减轻长对话卡顿。
   */
import { MdPreview } from 'md-editor-v3';

const props = defineProps<{
  messageId: string;
  text: string;
  /** 是否为当前流式输出中的 assistant 消息 */
  streaming: boolean;
  theme: 'light' | 'dark';
}>();

const rootRef = ref<HTMLElement | null>(null);
/** 是否挂载 MdPreview（流式结束后或进入视口后） */
const shouldRenderMd = ref(false);

let observer: IntersectionObserver | null = null;

/** 流式结束后立即渲染 Markdown，避免再等 IO */
function enableMdPreview() {
  shouldRenderMd.value = true;
  observer?.disconnect();
  observer = null;
}

/** 非流式消息：接近视口再挂载 MdPreview */
function setupLazyMount() {
  if (props.streaming) return;

  const el = rootRef.value;
  if (!el || typeof IntersectionObserver === 'undefined') {
    enableMdPreview();
    return;
  }

  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) {
        enableMdPreview();
      }
    },
    { rootMargin: '240px 0px' },
  );
  observer.observe(el);
}

watch(
  () => props.streaming,
  (streaming, wasStreaming) => {
    if (wasStreaming && !streaming) {
      enableMdPreview();
      return;
    }
    if (streaming) {
      shouldRenderMd.value = false;
    }
  },
);

onMounted(() => {
  if (props.streaming) return;
  setupLazyMount();
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
});
</script>

<template>
  <div ref="rootRef" class="rag-assistant-md-preview">
    <p
      v-if="!shouldRenderMd"
      class="rag-assistant-md-preview__plain m-0 whitespace-pre-wrap text-xs leading-snug"
    >
      {{ text }}
    </p>
    <ClientOnly v-else>
      <MdPreview
        :editor-id="`rag-${messageId}`"
        :model-value="text"
        class="x-md-editor rag-assistant__chat-md rounded-lg bg-transparent"
        preview-only
        preview-theme="default"
        :theme="theme"
      />
    </ClientOnly>
  </div>
</template>
