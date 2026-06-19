<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue';
import { useThrottleFn } from '@vueuse/core';
import type { PropType } from 'vue';
import type { tocInter } from '@/utils';

const props = defineProps({
  topics: {
    type: Array as PropType<tocInter[]>,
    default: () => [],
  },
  /** 与 layout 顶栏高度对齐，用于 scroll spy 与点击跳转偏移 */
  scrollOffset: {
    type: Number,
    default: 72,
  },
  /** 限定标题查找范围，避免误匹配页内其它同名 id */
  contentSelector: {
    type: String,
    default: '.x-md-editor',
  },
});

const activeId = ref('');
const topicsListRef = ref<HTMLElement>();

const resolveHeadingEl = (id: string): HTMLElement | null => {
  const scope = document.querySelector(props.contentSelector);
  if (scope) {
    const scoped = scope.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
    if (scoped) return scoped;
  }
  return document.getElementById(id);
};

const updateActive = () => {
  if (!props.topics.length) {
    activeId.value = '';
    return;
  }

  const scrollPos = window.scrollY + props.scrollOffset + 8;
  let currentId = props.topics[0]?.id ?? '';

  for (const item of props.topics) {
    const el = resolveHeadingEl(item.id);
    if (!el) continue;
    const top = el.getBoundingClientRect().top + window.scrollY;
    if (top <= scrollPos) {
      currentId = item.id;
    }
  }

  activeId.value = currentId;
};

const scrollActiveItemIntoView = () => {
  const container = topicsListRef.value;
  if (!container || !activeId.value) return;

  const activeEl = container.querySelector<HTMLElement>('.topic-item--active');
  if (!activeEl) return;

  const containerTop = container.scrollTop;
  const containerBottom = containerTop + container.clientHeight;
  const elTop = activeEl.offsetTop;
  const elBottom = elTop + activeEl.offsetHeight;

  if (elTop < containerTop) {
    container.scrollTop = elTop;
  }
  else if (elBottom > containerBottom) {
    container.scrollTop = elBottom - container.clientHeight;
  }
};

const onScroll = useThrottleFn(() => {
  updateActive();
}, 80);

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true });
  nextTick(updateActive);
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
});

watch(
  () => props.topics,
  () => nextTick(updateActive),
  { deep: true },
);

watch(activeId, () => {
  nextTick(scrollActiveItemIntoView);
});

const goTopicItem = (item: tocInter) => {
  const dom = resolveHeadingEl(item.id);
  if (!dom) return;

  const top = dom.getBoundingClientRect().top + window.scrollY - props.scrollOffset;
  window.scrollTo({ top, behavior: 'smooth' });
  activeId.value = item.id;
};
</script>

<template>
  <div class="catalogue-wrap">
    <p class="heading">
      目录
    </p>
    <div ref="topicsListRef" class="catalogue-topics">
      <div
        v-for="(item, index) in topics"
        :key="`${item.id}-${index}`"
        class="topic-item text-sm truncate"
        :class="{ 'topic-item--active': activeId === item.id }"
        :style="{
          paddingLeft: `${8 * Number(item.level) + 16}px`,
        }"
        @click="goTopicItem(item)"
      >
        {{ item.text }}
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
  .catalogue-wrap {
    width: 100%;

    .heading {
      font-weight: 600;
      text-indent: 1.5em;
      margin-bottom: 0.25rem;
    }

    .catalogue-topics {
      max-height: calc(100vh - 140px);
      overflow-y: auto;
      scrollbar-width: thin;
    }

    .topic-item {
      padding: 6px 16px 6px 16px;
      cursor: pointer;
      border-left: 2px solid transparent;
      transition:
        color 0.2s,
        border-color 0.2s,
        background-color 0.2s;
    }

    .topic-item:hover {
      background-color: color-mix(in srgb, var(--color-primary) 8%, transparent);
    }

    .topic-item--active {
      color: var(--color-primary);
      border-left-color: var(--color-primary);
      font-weight: 600;
      background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
    }
  }
</style>
