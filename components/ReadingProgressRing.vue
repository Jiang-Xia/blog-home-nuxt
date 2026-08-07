<template>
  <div
    class="reading-progress-ring fixed z-50 transition-all duration-300"
    :class="[
      position === 'top-right'
        ? 'top-4 right-4'
        : position === 'top-left'
          ? 'top-4 left-4'
          : position === 'bottom-right'
            ? 'bottom-4 right-4'
            : 'bottom-4 left-4',
    ]"
  >
    <div class="flex flex-col items-center gap-2">
      <!-- 主进度环：有 topics 时可点击展开目录 -->
      <div
        class="relative group transition-all duration-300"
        :class="[
          { 'opacity-0 pointer-events-none': autoHide && !visible },
          hasTopics ? 'cursor-pointer' : 'cursor-default',
        ]"
        @click="onRingClick"
        @mouseenter="showTooltip = hasTopics"
        @mouseleave="showTooltip = false"
      >
        <svg :width="ringSize" :height="ringSize" class="transform -rotate-90 drop-shadow-lg">
          <circle
            :cx="ringSize / 2"
            :cy="ringSize / 2"
            :r="radius"
            stroke="currentColor"
            :stroke-width="strokeWidth"
            fill="none"
            class="text-[var(--tech-border)]"
          />
          <circle
            :cx="ringSize / 2"
            :cy="ringSize / 2"
            :r="radius"
            stroke="currentColor"
            :stroke-width="strokeWidth"
            fill="none"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="offset"
            :class="progressColor"
            class="transition-all duration-300 ease-out"
            stroke-linecap="round"
          />
        </svg>

        <div class="absolute inset-0 flex items-center justify-center text-tech">
          <div class="text-center text-tech-muted">
            <div class="font-bold text-lg">
              {{ Math.round(progress) }}%
            </div>
            <div class="text-xs opacity-75">
              {{ readingTime }}
            </div>
          </div>
        </div>

        <div
          v-if="hasTopics && showTooltip && !expanded"
          class="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-[var(--tech-dropdown-bg)] text-tech border border-tech text-xs rounded px-2 py-1 whitespace-nowrap z-10 backdrop-blur-md hidden lg:block"
        >
          点击展开目录
        </div>
      </div>

      <!-- 可选：独立「目录」按钮（默认关，避免与圆环重复） -->
      <button
        v-if="showTocButton && hasTopics"
        type="button"
        class="reading-progress-ring__toc-btn lg:hidden btn btn-sm btn-primary shadow-lg border border-primary/30"
        aria-label="打开文章目录"
        @click.stop="openMobileToc"
      >
        📑 目录
      </button>
    </div>

    <!-- 桌面端：复用 Catalogue -->
    <Transition name="slide-fade">
      <div
        v-if="expanded && hasTopics"
        class="absolute top-full mt-4 cyber-glass-card text-tech border border-tech rounded-lg shadow-xl p-3 w-80 max-h-96 overflow-y-auto hidden lg:block"
        :class="menuPosition"
      >
        <div class="flex items-center justify-end mb-1">
          <button
            type="button"
            class="btn btn-ghost btn-xs btn-circle"
            aria-label="关闭目录"
            @click="closeDesktopToc"
          >
            ✕
          </button>
        </div>
        <div @click="onTopicClickClose">
          <Catalogue :topics="topics" />
        </div>
        <div class="mt-3 pt-3 border-t border-tech space-y-2">
          <div class="flex justify-between text-xs text-tech-muted">
            <span>阅读时间</span>
            <span>{{ readingTime }}</span>
          </div>
          <div class="flex justify-between text-xs text-tech-muted">
            <span>预计剩余</span>
            <span>{{ remainingTime }}</span>
          </div>
          <div class="flex justify-between text-xs text-tech-muted">
            <span>文章字数</span>
            <span>{{ wordCount.toLocaleString() }}</span>
          </div>
        </div>
        <div class="mt-3 flex gap-2">
          <button type="button" class="btn btn-xs btn-outline" @click="scrollToTop">
            回到顶部
          </button>
          <button type="button" class="btn btn-xs btn-outline" @click="scrollToBottom">
            文章底部
          </button>
        </div>
      </div>
    </Transition>

    <!-- 移动端：底部抽屉 + Catalogue -->
    <Teleport to="body">
      <div
        v-if="mobileTocOpen && hasTopics"
        class="fixed inset-0 z-[10030] bg-black/40 backdrop-blur-[1px] lg:hidden"
        aria-hidden="true"
        @click="closeMobileToc"
      />
      <div
        v-if="mobileTocOpen && hasTopics"
        class="fixed inset-x-0 bottom-0 z-[10031] max-h-[70vh] rounded-t-2xl border border-tech bg-[var(--tech-dropdown-bg)] shadow-2xl lg:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="文章目录"
      >
        <div class="flex items-center justify-between border-b border-tech px-4 py-3">
          <span class="text-sm font-semibold text-tech">目录</span>
          <button
            type="button"
            class="btn btn-ghost btn-xs btn-circle"
            aria-label="关闭目录"
            @click="closeMobileToc"
          >
            ✕
          </button>
        </div>
        <div
          class="overflow-y-auto px-2 py-2"
          style="max-height: calc(70vh - 3rem)"
          @click="onTopicClickClose"
        >
          <Catalogue :topics="topics" />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
/**
   * 阅读进度环：滚动百分比；点击圆环展开目录。
   * 目录数据与侧栏一致：父组件传入 MdPreview 的 topics，面板内复用 Catalogue。
   */
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { tocInter } from '@/utils';

interface Props {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  ringSize?: number;
  strokeWidth?: number;
  autoHide?: boolean;
  readingSpeed?: number;
  /** MdPreview 目录，与侧栏 Catalogue 同一份 */
  topics?: tocInter[];
  /** 是否显示进度环下方的独立「目录」按钮 */
  showTocButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  position: 'bottom-right',
  ringSize: 60,
  strokeWidth: 4,
  autoHide: true,
  readingSpeed: 200,
  topics: () => [],
  showTocButton: false,
});

const progress = ref(0);
const visible = ref(false);
const expanded = ref(false);
const mobileTocOpen = ref(false);
const showTooltip = ref(false);
const wordCount = ref(0);

const hasTopics = computed(() => props.topics.length > 0);
const radius = computed(() => (props.ringSize - props.strokeWidth) / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);
const offset = computed(() => circumference.value - (progress.value / 100) * circumference.value);

const progressColor = computed(() => {
  if (progress.value < 25) return 'text-error';
  if (progress.value < 50) return 'text-warning';
  if (progress.value < 75) return 'text-info';
  return 'text-success';
});

const menuPosition = computed(() => {
  if (props.position.includes('right')) return 'right-0';
  return 'left-0';
});

const readingTime = computed(() => {
  const wordsRead = Math.floor((progress.value / 100) * wordCount.value);
  const minutes = Math.floor(wordsRead / props.readingSpeed);
  const seconds = Math.floor(((wordsRead / props.readingSpeed) % 1) * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

const remainingTime = computed(() => {
  const wordsRemaining = wordCount.value - Math.floor((progress.value / 100) * wordCount.value);
  const minutes = Math.ceil(wordsRemaining / props.readingSpeed);
  return minutes > 0 ? `${minutes}分钟` : '即将完成';
});

/** 统计正文大致字数，供环心阅读时长展示 */
const calculateWordCount = () => {
  const content = document.querySelector('.article-info, .post-content, main, article');
  if (content) {
    const text = content.textContent || '';
    wordCount.value = text.replace(/\s+/g, '').length;
  }
};

/** 根据滚动位置更新进度与显隐 */
const updateProgress = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollProgress = documentHeight > 0 ? (scrollTop / documentHeight) * 100 : 0;

  progress.value = Math.min(100, Math.max(0, scrollProgress));

  if (props.autoHide) {
    visible.value = scrollProgress > 5;
  }
};

/** 滚动到顶部并收起目录 */
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  closeAllToc();
};

/** 滚动到底部并收起目录 */
const scrollToBottom = () => {
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: 'smooth',
  });
  closeAllToc();
};

const closeDesktopToc = () => {
  expanded.value = false;
};

const openMobileToc = () => {
  if (!hasTopics.value) return;
  mobileTocOpen.value = true;
  showTooltip.value = false;
};

const closeMobileToc = () => {
  mobileTocOpen.value = false;
};

const closeAllToc = () => {
  expanded.value = false;
  mobileTocOpen.value = false;
};

/** 点击 Catalogue 条目后关闭浮层/抽屉（跳转由 Catalogue 自己处理） */
const onTopicClickClose = (e: MouseEvent) => {
  if ((e.target as HTMLElement).closest('.topic-item')) {
    closeAllToc();
  }
};

/** 点击进度环：桌面展开面板，窄屏打开抽屉 */
const onRingClick = () => {
  if (!hasTopics.value) return;
  if (import.meta.client && window.matchMedia('(max-width: 1023px)').matches) {
    openMobileToc();
    return;
  }
  expanded.value = !expanded.value;
  if (expanded.value) {
    showTooltip.value = false;
  }
};

const handleScroll = () => {
  updateProgress();
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (expanded.value && !target.closest('.reading-progress-ring')) {
    expanded.value = false;
  }
};

onMounted(() => {
  calculateWordCount();
  updateProgress();

  if (!props.autoHide) {
    visible.value = true;
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
  .slide-fade-enter-active,
  .slide-fade-leave-active {
    transition: all 0.3s ease;
  }

  .slide-fade-enter-from {
    opacity: 0;
    transform: translateY(-10px);
  }

  .slide-fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }

  .reading-progress-ring__toc-btn {
    min-width: 4.5rem;
    font-weight: 600;
    letter-spacing: 0.02em;
  }
</style>
