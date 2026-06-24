<script setup lang="ts">
/**
   * 全站 RAG 助手：Cyber FAB + UChatMessages（AI SDK Chat 流式，需登录，每日配额）
   */
import { isTextUIPart } from 'ai';
import { getRagStatus, type RagCitation } from '@/api/rag';
import { useRagAssistant } from '@/composables/use-rag-assistant';
import { messageError } from '@/utils/toast';

const mdEditorTheme = useMdEditorTheme();

/** 从 message.parts 提取去重后的引用来源 */
function getDedupedCitations(parts: unknown[] | undefined): RagCitation[] {
  if (!parts?.length) return [];
  const seen = new Set<number>();
  const result: RagCitation[] = [];
  for (const part of parts) {
    const p = part as { type?: string; data?: { citations?: RagCitation[] } };
    if (p.type !== 'data-citations' || !Array.isArray(p.data?.citations)) continue;
    for (const c of p.data.citations) {
      if (seen.has(c.articleId)) continue;
      seen.add(c.articleId);
      result.push(c);
    }
  }
  return result;
}

/** 输入区高度，供 UChatMessages spacingOffset 避免滚动计算压住底部 */
const INPUT_AREA_OFFSET_PX = 96;

const route = useRoute();
const panelOpen = ref(false);
const inputText = ref('');
const serviceReady = ref(true);
const serviceConfigured = ref(true);
/** 消息列表滚动容器 */
const scrollEl = ref<HTMLElement | null>(null);

const {
  chat,
  chatError,
  loading,
  quota,
  ask,
  stop,
  clearHistory,
  refreshQuota,
  isAssistantStreaming,
  maxMessages,
} = useRagAssistant();

/** 接近历史上限时提示用户可清空 */
const showHistoryTrimHint = computed(() => (chat.value?.messages.length ?? 0) >= maxMessages - 4);

const userInfo = useUserInfo();

/** 详情页右侧已有 RPG FAB，助手放左下角避免重叠 */
const fabPlacement = computed(() =>
  route.path.startsWith('/detail/') ? 'bottom-left' : 'bottom-right',
);

/** 打开面板时将消息区滚到最底部（含 MdPreview 延迟挂载后的高度变化） */
function scrollMessagesToBottom(smooth = false) {
  const el = scrollEl.value;
  if (!el) return;
  el.scrollTo({
    top: el.scrollHeight,
    behavior: smooth ? 'smooth' : 'auto',
  });
}

const openPanel = async () => {
  if (!(await ensureLoggedIn())) {
    messageError('请先登录后使用 AI 助手');
    await goLogin();
    return;
  }
  panelOpen.value = true;
  await refreshQuota();
  try {
    const status = await getRagStatus();
    serviceReady.value = status.ready;
    serviceConfigured.value = status.configured;
  }
  catch {
    serviceReady.value = false;
  }
  await nextTick();
  scrollMessagesToBottom();
  requestAnimationFrame(() => scrollMessagesToBottom());
  window.setTimeout(() => scrollMessagesToBottom(), 150);
};

const closePanel = () => {
  panelOpen.value = false;
};

const submitQuestion = async () => {
  const q = inputText.value.trim();
  if (!q) return;
  if (quota.value && quota.value.remaining <= 0) {
    messageError(`今日问答次数已用完（${quota.value.limit} 次/天）`);
    return;
  }
  inputText.value = '';
  await ask(q);
  if (chatError.value) {
    const msg = chatError.value.message || '问答失败';
    if (String(msg).includes('429') || String(msg).includes('上限')) {
      messageError('今日 AI 助手问答次数已达上限');
    }
    else {
      messageError(msg);
    }
  }
};

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    submitQuestion();
  }
};

watch(
  () => userInfo.value?.uid,
  (uid) => {
    if (!uid) panelOpen.value = false;
  },
);

/** 流式结束后补滚到底部（MdPreview 挂载会改变高度） */
watch(loading, (isLoading, wasLoading) => {
  if (wasLoading && !isLoading && panelOpen.value) {
    nextTick(() => {
      scrollMessagesToBottom();
      window.setTimeout(() => scrollMessagesToBottom(), 150);
    });
  }
});
</script>

<template>
  <div class="rag-assistant">
    <CyberFab
      aria-label="打开网站 AI 助手"
      hint="AI 助手"
      :placement="fabPlacement"
      @click="openPanel"
    >
      <RagAssistantIcon class="rag-assistant__fab-icon" />
    </CyberFab>

    <Teleport to="body">
      <div
        v-if="panelOpen"
        class="rag-assistant__backdrop fixed inset-0 z-[10020] bg-black/45 backdrop-blur-[2px]"
        aria-hidden="true"
        @click="closePanel"
      />
      <div
        v-if="panelOpen"
        class="rag-assistant__panel cyber-drawer-panel fixed z-[10021] flex flex-col"
        :class="
          fabPlacement === 'bottom-left'
            ? 'rag-assistant__panel--left'
            : 'rag-assistant__panel--right'
        "
        role="dialog"
        aria-modal="true"
        aria-label="网站 AI 助手"
      >
        <div class="cyber-drawer-panel__accent" aria-hidden="true" />

        <div class="flex shrink-0 items-center justify-between border-b border-tech px-4 py-3">
          <div>
            <div class="cyber-section-label mb-1">
              AI ASSISTANT
            </div>
            <div class="text-sm font-semibold text-tech">
              网站助手
            </div>
            <div v-if="quota" class="text-xs text-tech-muted">
              今日剩余 {{ quota.remaining }} / {{ quota.limit }} 次
            </div>
          </div>
          <div class="flex shrink-0 items-center gap-1">
            <button
              v-if="chat?.messages.length"
              type="button"
              class="btn btn-ghost btn-xs text-tech-muted hover:text-tech"
              aria-label="清空对话"
              @click="clearHistory"
            >
              清空
            </button>
            <button
              type="button"
              class="btn btn-ghost btn-xs btn-circle text-tech-muted hover:text-tech"
              aria-label="关闭"
              @click="closePanel"
            >
              ✕
            </button>
          </div>
        </div>

        <CyberAlert
          v-if="!serviceConfigured"
          variant="warning"
          class="mx-3 mt-3 shrink-0 !rounded-xl !py-2"
        >
          服务端未配置 RAG API Key，请联系管理员。
        </CyberAlert>
        <CyberAlert
          v-else-if="!serviceReady"
          variant="warning"
          class="mx-3 mt-3 shrink-0 !rounded-xl !py-2"
        >
          知识库尚未索引，请在管理后台执行「全量重建索引」。
        </CyberAlert>

        <div
          ref="scrollEl"
          class="rag-assistant__scroll min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          <p
            v-if="showHistoryTrimHint && chat?.messages.length"
            class="mx-3 mb-1 mt-2 text-center text-[0.6875rem] leading-snug text-tech-faint"
          >
            仅保留最近 {{ maxMessages }} 条消息，较早记录已自动移除；可点「清空」重新开始
          </p>
          <div v-if="!chat?.messages.length" class="px-4 py-8 text-center text-sm text-tech-faint">
            基于本站文章回答你的问题，例如：「NestJS 模块化怎么组织？」
          </div>

          <UChatMessages
            v-else
            :messages="chat!.messages"
            :status="chat!.status"
            should-auto-scroll
            should-scroll-to-bottom
            :auto-scroll="false"
            :spacing-offset="INPUT_AREA_OFFSET_PX"
            compact
            class="rag-assistant__messages"
            :user="{
              side: 'right',
              variant: 'soft',
              ui: {
                root: 'rag-assistant__user-row ml-auto max-w-[82%]',
                container: 'justify-end ml-auto gap-0.5 pb-1.5',
                content:
                  'rag-assistant__bubble-content rag-assistant__user-content inline-flex min-h-0 flex-col justify-center space-y-0 border border-primary/30 bg-primary/10 text-primary text-xs leading-normal whitespace-pre-wrap',
              },
            }"
            :assistant="{
              side: 'left',
              variant: 'soft',
              ui: {
                root: 'rag-assistant__assistant-row mr-auto max-w-[92%]',
                container: 'gap-0.5 pb-1.5',
                content:
                  'rag-assistant__bubble-content rag-assistant__assistant-content border border-tech bg-base-200/40 text-tech text-xs leading-snug w-full max-w-full min-w-0 overflow-x-auto',
              },
            }"
          >
            <template #content="{ role, parts, message }">
              <template v-if="role === 'user'">
                <p
                  v-for="(part, index) in (parts ?? message?.parts ?? []).filter(isTextUIPart)"
                  :key="`${message?.id ?? 'user'}-${index}`"
                  class="m-0"
                >
                  {{ part.text }}
                </p>
              </template>

              <template v-else-if="message">
                <RagAssistantMdPreview
                  v-for="(part, index) in message.parts.filter(isTextUIPart)"
                  :key="`${message.id}-md-${index}`"
                  :message-id="message.id"
                  :text="part.text"
                  :streaming="isAssistantStreaming(message.id)"
                  :theme="mdEditorTheme"
                />

                <div
                  v-if="getDedupedCitations(message.parts).length"
                  class="rag-assistant__citations mt-1.5 space-y-0.5 border-t border-tech/60 pt-1.5"
                >
                  <p class="text-xs text-tech-muted">
                    参考来源
                  </p>
                  <NuxtLink
                    v-for="c in getDedupedCitations(message.parts)"
                    :key="c.articleId"
                    :to="c.url"
                    class="block text-xs link link-hover text-primary"
                    @click="closePanel"
                  >
                    《{{ c.title }}》
                  </NuxtLink>
                </div>
              </template>
            </template>
          </UChatMessages>
        </div>

        <div class="rag-assistant__composer shrink-0 border-t border-tech px-3 py-3">
          <div class="flex items-end gap-2">
            <textarea
              v-model="inputText"
              class="rag-assistant__input textarea textarea-bordered login-input min-h-[52px] flex-1 resize-none text-sm leading-relaxed"
              placeholder="输入问题，Enter 发送，Shift+Enter 换行"
              :disabled="loading"
              rows="2"
              @keydown="onKeydown"
            />
            <CyberButton
              v-if="!loading"
              variant="primary"
              class="rag-assistant__send-btn shrink-0"
              :disabled="!inputText.trim()"
              @click="submitQuestion"
            >
              发送
            </CyberButton>
            <CyberButton
              v-else
              variant="secondary"
              class="rag-assistant__stop-btn shrink-0"
              @click="stop"
            >
              停止
            </CyberButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped lang="less">
  .rag-assistant {
    :deep(.cyber-fab__icon) {
      width: 2.5rem;
      height: 2.5rem;
    }

    &__fab-icon {
      width: 100%;
      height: 100%;
    }

    &__scroll {
      -webkit-overflow-scrolling: touch;
      padding-bottom: 0.25rem;
    }

    &__messages {
      padding-top: 0.375rem;
      font-size: 0.75rem;
      line-height: 1.45;

      :deep([data-slot='root']) {
        --last-message-height: 0px !important;
        min-height: 0;
        height: auto;
        padding-left: 0.75rem;
        padding-right: 0.75rem;
        row-gap: 0.375rem;
      }

      :deep(.rag-assistant__user-row) {
        margin-left: auto !important;
        margin-right: 0 !important;
        width: fit-content;
        max-width: 82%;
      }

      :deep(.rag-assistant__assistant-row) {
        margin-right: auto;
        margin-left: 0;
        width: 100%;
        max-width: 92%;
        min-width: 0;
      }

      :deep(article[data-role='user']),
      :deep(article[data-role='assistant']) {
        content-visibility: auto;
        contain-intrinsic-size: auto 4rem;
      }

      :deep(article[data-role='user']) {
        display: flex;
        justify-content: flex-end;
      }

      :deep(article[data-role='user'] [data-slot='container']) {
        justify-content: flex-end;
        margin-left: auto;
        width: fit-content;
        max-width: 100%;
      }

      :deep(article[data-role='assistant']) {
        display: flex;
        justify-content: flex-start;
        min-width: 0;
        max-width: 100%;
      }

      :deep(article[data-role='assistant'] [data-slot='container']) {
        min-width: 0;
        max-width: 100%;
      }

      :deep(article[data-role='assistant'] [data-slot='content']) {
        min-width: 0;
        max-width: 100%;
        overflow-x: auto;
        overflow-wrap: break-word;
      }

      :deep([data-slot='root'] > article:last-of-type) {
        min-height: 0 !important;
      }

      :deep(article[data-role='user'] [data-slot='content']) {
        min-height: unset !important;
      }

      :deep([data-slot='content']) {
        min-width: 0;
        overflow-wrap: anywhere;
      }
    }

    :deep(.rag-assistant__user-content.rag-assistant__bubble-content) {
      display: inline-flex !important;
      flex-direction: column;
      justify-content: center !important;
      padding: 0.3125rem 0.5rem !important;
      min-height: unset !important;

      p {
        margin: 0;
        line-height: 1.45;
      }
    }

    :deep(.rag-assistant__assistant-content.rag-assistant__bubble-content) {
      padding: 0.125rem 0.25rem !important;
      min-height: auto !important;
    }

    :deep(.rag-assistant__user-content),
    :deep(.rag-assistant__assistant-content) {
      box-shadow: none !important;
      --tw-ring-shadow: 0 0 #0000 !important;
      --tw-ring-offset-shadow: 0 0 #0000 !important;
    }

    :deep(.rag-assistant__assistant-content) {
      overflow-x: auto;
      max-width: 100%;
      scrollbar-width: thin;
      scrollbar-color: oklch(var(--bc) / 0.25) transparent;

      &::-webkit-scrollbar {
        height: 6px;
      }

      &::-webkit-scrollbar-thumb {
        border-radius: 999px;
        background: oklch(var(--bc) / 0.22);
      }

      &::-webkit-scrollbar-thumb:hover {
        background: oklch(var(--bc) / 0.32);
      }
    }

    /* 助手内 MdPreview：继承 text-xs，紧凑垂直排版（不影响文章详情） */
    &__messages :deep(.rag-assistant__chat-md) {
      padding: 0.375rem 0.5rem !important;
      width: 100%;
      min-width: 0;
      box-sizing: border-box;

      .md-editor,
      .md-editor-dark {
        --md-bk-color: transparent;
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
      }

      .md-editor-preview-wrapper,
      .md-editor-preview,
      .md-editor-dark .md-editor-preview {
        background: transparent !important;
        background-image: none !important;
        font-size: inherit;
        line-height: inherit;
      }

      .md-editor-preview h1 {
        font-size: 1.0625rem;
        margin: 0.5rem 0 0.25rem;
        line-height: 1.35;
      }

      .md-editor-preview h2 {
        font-size: 1rem;
        margin: 0.4375rem 0 0.1875rem;
        line-height: 1.35;
      }

      .md-editor-preview h3,
      .md-editor-preview h4,
      .md-editor-preview h5,
      .md-editor-preview h6 {
        font-size: 0.9375rem;
        margin: 0.375rem 0 0.125rem;
        line-height: 1.35;
      }

      .md-editor-preview p {
        margin: 0.25rem 0;
      }

      .md-editor-preview ul,
      .md-editor-preview ol {
        margin: 0.25rem 0;
        padding-left: 1.125rem;
      }

      .md-editor-preview li {
        margin: 0;
      }

      .md-editor-preview blockquote {
        margin: 0.3125rem 0;
        padding: 0.25rem 0.4375rem;
      }

      .md-editor-preview hr {
        margin: 0.375rem 0;
      }

      .md-editor-preview .md-editor-code {
        margin: 0.3125rem 0;
      }

      .md-editor-preview p:first-child,
      .md-editor-preview h1:first-child,
      .md-editor-preview h2:first-child,
      .md-editor-preview h3:first-child {
        margin-top: 0;
      }

      .md-editor-preview p:last-child {
        margin-bottom: 0;
      }
    }

    :deep(.rag-assistant__citations) {
      margin-top: 0.25rem;
      padding: 0 0.125rem 0;
      font-size: inherit;
    }

    &__composer {
      background: oklch(var(--bc) / 0.03);
    }

    &__input {
      max-height: 7rem;
    }

    :deep(.rag-assistant__send-btn),
    :deep(.rag-assistant__stop-btn) {
      height: 2.5rem !important;
      min-width: 4.25rem !important;
      padding: 0 1rem !important;
      font-size: 0.8125rem !important;
      border-radius: 0.625rem !important;

      &:disabled {
        opacity: 0.45;
        cursor: not-allowed;
        filter: grayscale(0.2);
      }
    }

    :deep(.rag-assistant__send-btn) {
      box-shadow: 0 0 18px var(--tech-primary-glow, oklch(var(--p) / 0.25));
    }

    &__panel {
      bottom: max(0.75rem, env(safe-area-inset-bottom, 0px));
      height: min(88vh, 44rem);
      width: min(calc(100vw - 0.5rem), 40rem);

      @media (min-width: 640px) {
        height: min(86vh, 46rem);
        width: min(calc(100vw - 1.5rem), 44rem);
      }

      &--right {
        right: 1rem;
        left: 1rem;
        margin-left: auto;
        margin-right: auto;

        @media (min-width: 640px) {
          left: auto;
          margin-left: 0;
          margin-right: 0;
        }
      }

      &--left {
        left: 1rem;
        right: 1rem;
        margin-left: auto;
        margin-right: auto;

        @media (min-width: 640px) {
          right: auto;
          margin-left: 0;
          margin-right: 0;
        }
      }
    }
  }
</style>
