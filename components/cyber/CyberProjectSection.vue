<template>
  <section
    :class="['cyber-project-section cyber-glass-card overflow-hidden shadow-xl', props.class]"
  >
    <div class="cyber-project-section__titlebar border-b border-tech">
      <div class="flex min-w-0 flex-1 basis-0 items-center gap-2 sm:gap-3">
        <div aria-hidden="true" class="hidden shrink-0 gap-1.5 sm:flex">
          <span class="cyber-project-section__dot cyber-project-section__dot--red" />
          <span class="cyber-project-section__dot cyber-project-section__dot--yellow" />
          <span class="cyber-project-section__dot cyber-project-section__dot--green" />
        </div>

        <label class="swap swap-flip shrink-0 text-xl leading-none sm:text-2xl md:text-3xl">
          <input type="checkbox">
          <div class="swap-on">
            {{ iconOn }}
          </div>
          <div class="swap-off">
            {{ iconOff }}
          </div>
        </label>

        <div class="min-w-0">
          <p class="cyber-section-label mb-0.5">
            {{ label }}
          </p>
          <p class="truncate text-base font-medium text-tech md:text-lg">
            {{ title }}
          </p>
        </div>
      </div>

      <div class="cyber-project-section__address hidden md:block">
        <div
          class="truncate rounded-lg border border-tech bg-[var(--tech-input-bg)] px-3 py-1.5 text-center text-xs text-tech-muted"
          :title="displayUrl"
        >
          {{ displayUrl }}
        </div>
      </div>

      <div class="flex flex-1 basis-0 items-center justify-end">
        <CyberButton variant="secondary" class="!px-4 !py-2 text-sm" @click="handleGo">
          GO
        </CyberButton>
      </div>
    </div>

    <div class="cyber-project-section__body">
      <div
        v-if="preview === 'phone'"
        class="cyber-project-section__phone-layout flex flex-col md:flex-row"
      >
        <div class="cyber-project-section__phone mockup-phone">
          <div class="mockup-phone-camera" />
          <div class="mockup-phone-display">
            <div class="iframe-wrap">
              <iframe class="iframe iframe--phone" :src="url" :title="title" />
            </div>
          </div>
        </div>
        <div
          v-if="$slots.aside"
          class="cyber-project-section__aside flex flex-1 flex-wrap items-start justify-center md:pl-2"
        >
          <slot name="aside" />
        </div>
      </div>

      <iframe v-else class="iframe iframe--window" :src="url" :title="title" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { stripCacheBust } from '@/utils/url';

const props = withDefaults(
  defineProps<{
    title: string;
    iconOn: string;
    iconOff: string;
    url: string;
    label?: string;
    preview?: 'window' | 'phone';
    class?: string;
  }>(),
  {
    label: 'PROJECT',
    preview: 'window',
    class: '',
  },
);

const displayUrl = computed(() => stripCacheBust(props.url));

function handleGo() {
  if (props.url) {
    window.open(props.url, '_blank');
  }
}
</script>

<style lang="less" scoped>
  .cyber-project-section {
    position: relative;

    &::before {
      content: '';
      position: absolute;
      inset: 0 0 auto;
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent,
        color-mix(in srgb, var(--tech-gradient-from) 55%, transparent),
        color-mix(in srgb, var(--tech-gradient-to) 55%, transparent),
        transparent
      );
      pointer-events: none;
    }
  }

  .cyber-project-section__titlebar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 0.875rem;
    background: color-mix(in oklch, var(--tech-shell-header) 88%, transparent);

    @media (width >= 640px) {
      gap: 0.75rem;
      padding: 0.875rem 1rem;
    }
  }

  .cyber-project-section__address {
    flex: none;
    width: min(100%, 28rem);
    padding-inline: 0.75rem;
  }

  .cyber-project-section__dot {
    display: block;
    width: 0.7rem;
    height: 0.7rem;
    border-radius: 9999px;

    &--red {
      background: #ff5f57;
    }

    &--yellow {
      background: #febc2e;
    }

    &--green {
      background: #28c840;
    }
  }

  .cyber-project-section__body {
    background: var(--tech-shell-header);
    overflow: hidden;
  }

  .cyber-project-section__phone-layout {
    gap: 1rem;
    padding: 0;

    @media (width >= 768px) {
      padding: 1.5rem;
    }
  }

  .cyber-project-section__phone {
    width: 100%;
    margin-inline: 0;

    @media (width >= 768px) {
      width: 24rem;
      flex-shrink: 0;
    }
  }

  .cyber-project-section__aside {
    width: 100%;
    padding: 0 0.75rem 1rem;

    @media (width >= 768px) {
      padding: 0 0 0 0.5rem;
    }
  }

  .iframe-wrap {
    height: 100%;
    width: 100%;
    background: var(--tech-shell);
  }

  .iframe {
    display: block;
    width: 100%;
    border: 0;
    background: var(--tech-input-bg);

    &--window {
      min-height: 65vh;
      height: 65vh;
      border-radius: 0 0 1.5rem 1.5rem;
    }

    &--phone {
      height: 100%;
      min-height: 0;
      border-radius: 0.625rem;
    }
  }
</style>
