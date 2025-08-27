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
      { 'opacity-0 pointer-events-none': !visible },
    ]"
  >
    <!-- 主进度环 -->
    <div
      class="relative cursor-pointer group"
      @click="toggleExpanded"
      @mouseenter="showTooltip = true"
      @mouseleave="showTooltip = false"
    >
      <svg :width="ringSize" :height="ringSize" class="transform -rotate-90 drop-shadow-lg">
        <!-- 背景圆环 -->
        <circle
          :cx="ringSize / 2"
          :cy="ringSize / 2"
          :r="radius"
          stroke="currentColor"
          :stroke-width="strokeWidth"
          fill="none"
          class="text-gray-200 dark:text-gray-700"
        />

        <!-- 进度圆环 -->
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

      <!-- 中心内容 -->
      <div class="absolute inset-0 flex items-center justify-center" :class="centerTextClass">
        <div class="text-center dark:text-gray-500">
          <div class="font-bold text-lg">
            {{ Math.round(progress) }}%
          </div>
          <div class="text-xs opacity-75">
            {{ readingTime }}
          </div>
        </div>
      </div>

      <!-- 工具提示 -->
      <div
        v-if="showTooltip && !expanded"
        class="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10"
      >
        点击展开目录
      </div>
    </div>

    <!-- 展开的目录面板 -->
    <Transition name="slide-fade">
      <div
        v-if="expanded"
        class="absolute top-full text-white mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border p-4 w-80 max-h-96 overflow-y-auto"
        :class="menuPosition"
      >
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-sm">
            文章目录
          </h3>
          <button class="btn btn-ghost btn-xs" @click="toggleExpanded">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="space-y-1">
          <div
            v-for="(heading, index) in headings"
            :key="index"
            class="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            :class="[
              { 'bg-blue-50 dark:bg-blue-900': currentHeading === index },
              `ml-${(heading.level - 1) * 2}`,
            ]"
            @click="scrollToHeading(heading, index)"
          >
            <div
              class="w-2 h-2 rounded-full flex-shrink-0"
              :class="currentHeading === index ? 'bg-blue-500' : 'bg-gray-300'"
            />
            <span
              class="text-sm truncate"
              :class="[
                currentHeading === index ? 'text-blue-600 dark:text-blue-400 font-medium' : '',
                `text-${getTextSize(heading.level)}`,
              ]"
            >
              {{ heading.text }}
            </span>
            <span class="text-xs text-gray-500 ml-auto"> {{ Math.round(heading.progress) }}% </span>
          </div>
        </div>

        <!-- 阅读统计 -->
        <div class="mt-4 pt-3 border-t space-y-2">
          <div class="flex justify-between text-xs text-gray-600">
            <span>阅读时间</span>
            <span>{{ readingTime }}</span>
          </div>
          <div class="flex justify-between text-xs text-gray-600">
            <span>预计剩余</span>
            <span>{{ remainingTime }}</span>
          </div>
          <div class="flex justify-between text-xs text-gray-600">
            <span>文章字数</span>
            <span>{{ wordCount.toLocaleString() }}</span>
          </div>
        </div>

        <!-- 快捷操作 -->
        <div class="mt-3 flex gap-2">
          <button class="btn btn-xs btn-outline" @click="scrollToTop">
            回到顶部
          </button>
          <button class="btn btn-xs btn-outline" @click="scrollToBottom">
            文章底部
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

interface Heading {
  level: number;
  text: string;
  element: HTMLElement;
  progress: number;
}

interface Props {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  ringSize?: number;
  strokeWidth?: number;
  autoHide?: boolean;
  readingSpeed?: number; // 每分钟阅读字数
}

const props = withDefaults(defineProps<Props>(), {
  position: 'bottom-right',
  ringSize: 60,
  strokeWidth: 4,
  autoHide: true,
  readingSpeed: 200,
});

const progress = ref(0);
const visible = ref(false);
const expanded = ref(false);
const showTooltip = ref(false);
const currentHeading = ref(-1);
const headings = ref<Heading[]>([]);
const wordCount = ref(0);

// 计算属性
const radius = computed(() => (props.ringSize - props.strokeWidth) / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);
const offset = computed(() => circumference.value - (progress.value / 100) * circumference.value);

const progressColor = computed(() => {
  if (progress.value < 25) return 'text-red-500';
  if (progress.value < 50) return 'text-yellow-500';
  if (progress.value < 75) return 'text-blue-500';
  return 'text-green-500';
});

const centerTextClass = computed(() => `text-gray-800 dark:text-gray-200`);

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

// 获取文本大小
const getTextSize = (level: number) => {
  const sizes = ['base', 'sm', 'xs', 'xs', 'xs', 'xs'];
  return sizes[level - 1] || 'xs';
};

// 收集页面标题
const collectHeadings = () => {
  const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  headings.value = Array.from(headingElements).map(el => ({
    level: parseInt(el.tagName.charAt(1)),
    text: el.textContent || '',
    element: el as HTMLElement,
    progress: 0,
  }));
};

// 计算字数
const calculateWordCount = () => {
  const content = document.querySelector('.article-info, .post-content, main, article');
  if (content) {
    const text = content.textContent || '';
    wordCount.value = text.replace(/\s+/g, '').length; // 中文字符计数
  }
};

// 更新进度
const updateProgress = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollProgress = documentHeight > 0 ? (scrollTop / documentHeight) * 100 : 0;

  progress.value = Math.min(100, Math.max(0, scrollProgress));

  // 更新当前标题
  updateCurrentHeading(scrollTop);

  // 自动隐藏/显示
  if (props.autoHide) {
    visible.value = scrollProgress > 5; // 滚动超过5%时显示
  }
};

// 更新当前标题
const updateCurrentHeading = (scrollTop: number) => {
  let current = -1;

  headings.value.forEach((heading, index) => {
    const rect = heading.element.getBoundingClientRect();
    const elementTop = scrollTop + rect.top;

    // 更新标题进度
    const headingProgress = Math.max(
      0,
      Math.min(100, ((scrollTop - elementTop + window.innerHeight) / window.innerHeight) * 100),
    );
    heading.progress = headingProgress;

    // 确定当前标题
    if (elementTop <= scrollTop + 100) {
      current = index;
    }
  });

  currentHeading.value = current;
};

// 滚动到标题
const scrollToHeading = (heading: Heading, index: number) => {
  heading.element.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
  currentHeading.value = index;
  expanded.value = false;
};

// 滚动到顶部
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  expanded.value = false;
};

// 滚动到底部
const scrollToBottom = () => {
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: 'smooth',
  });
  expanded.value = false;
};

// 切换展开状态
const toggleExpanded = () => {
  expanded.value = !expanded.value;
  if (expanded.value) {
    showTooltip.value = false;
  }
};

// 滚动事件处理
const handleScroll = () => {
  updateProgress();
};

// 点击外部关闭
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (expanded.value && !target.closest('.reading-progress-ring')) {
    expanded.value = false;
  }
};

onMounted(() => {
  collectHeadings();
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

  /* 修复深层级缩进 */
  .ml-2 {
    margin-left: 0.5rem;
  }
  .ml-4 {
    margin-left: 1rem;
  }
  .ml-6 {
    margin-left: 1.5rem;
  }
  .ml-8 {
    margin-left: 2rem;
  }
  .ml-10 {
    margin-left: 2.5rem;
  }
</style>
