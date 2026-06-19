<template>
  <div class="grid w-full gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
    <div class="cyber-crypto-panel flex min-h-[220px] w-full min-w-0 flex-col">
      <div class="flex items-center justify-between border-b border-tech px-4 py-2.5">
        <span class="text-sm font-medium text-tech">{{ inputLabel }}</span>
        <span class="font-mono text-xs text-tech-subtle">{{ inputModel.length }} chars</span>
      </div>
      <textarea
        v-model="inputModel"
        :placeholder="inputPlaceholder"
        class="textarea crypto-textarea min-h-48 w-full min-w-0 flex-1 resize-y border-0 bg-transparent focus:outline-none"
      />
    </div>

    <div
      class="crypto-action-stack flex w-full flex-row flex-wrap items-stretch justify-center gap-2 self-center rounded-xl border border-tech bg-[var(--tech-shell-header)] p-3 lg:w-40 lg:flex-col lg:py-4"
    >
      <slot name="actions" />
    </div>

    <div class="cyber-crypto-panel flex min-h-[220px] w-full min-w-0 flex-col">
      <div class="flex items-center justify-between border-b border-tech px-4 py-2.5">
        <span class="text-sm font-medium text-tech">{{ outputLabel }}</span>
        <span class="font-mono text-xs text-tech-subtle">{{ outputModel.length }} chars</span>
      </div>
      <textarea
        v-model="outputModel"
        :placeholder="outputPlaceholder"
        class="textarea crypto-textarea min-h-48 w-full min-w-0 flex-1 resize-y border-0 bg-transparent focus:outline-none"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  inputLabel?: string;
  outputLabel?: string;
  inputPlaceholder?: string;
  outputPlaceholder?: string;
}>();

const inputModel = defineModel<string>('input', { default: '' });
const outputModel = defineModel<string>('output', { default: '' });
</script>
