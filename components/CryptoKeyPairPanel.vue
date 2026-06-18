<template>
  <CryptoToolSection label="KEY PAIR">
    <div class="cyber-glass-card !p-4 md:!p-5">
      <div class="crypto-toolbar mb-4 flex flex-wrap items-end gap-3">
        <slot name="toolbar" />
      </div>
      <div class="grid w-full gap-3 lg:grid-cols-2">
        <div
          class="cyber-crypto-panel flex w-full min-w-0 flex-col"
          :class="compact ? '' : 'min-h-[180px]'"
        >
          <div class="border-b border-tech px-4 py-2.5">
            <span class="text-sm font-medium text-tech">私钥 (Private Key)</span>
          </div>
          <textarea
            v-model="privateKeyModel"
            placeholder="Private Key"
            :rows="compact ? 2 : 8"
            class="textarea crypto-textarea w-full min-w-0 resize-y border-0 bg-transparent focus:outline-none"
            :class="compact ? 'min-h-0' : 'min-h-40 flex-1'"
          />
        </div>
        <div
          class="cyber-crypto-panel flex w-full min-w-0 flex-col"
          :class="compact ? '' : 'min-h-[180px]'"
        >
          <div class="border-b border-tech px-4 py-2.5">
            <span class="text-sm font-medium text-tech">公钥 (Public Key)</span>
          </div>
          <textarea
            v-model="publicKeyModel"
            placeholder="Public Key"
            :rows="compact ? 2 : 8"
            class="textarea crypto-textarea w-full min-w-0 resize-y border-0 bg-transparent focus:outline-none"
            :class="compact ? 'min-h-0' : 'min-h-40 flex-1'"
          />
        </div>
      </div>
    </div>
  </CryptoToolSection>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    /** 国密等短密钥场景，使用较低高度 */
    compact?: boolean;
  }>(),
  {
    compact: false,
  },
);

const privateKeyModel = defineModel<string>('privateKey', { default: '' });
const publicKeyModel = defineModel<string>('publicKey', { default: '' });
</script>
