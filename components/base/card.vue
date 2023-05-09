<script setup lang="ts">
  defineProps({
    title: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
    minHeight: {
      type: String,
      default: '310px',
    },
    vertical: {
      type: Boolean,
      default: false,
    },
    noPadding: {
      type: Boolean,
      default: true,
    },
  })
</script>
<template>
  <div
    class="card-wrap tag-wrap"
    :class="{ 'card-wrap__vertical': vertical }"
    :style="{ 'min-height': minHeight }"
  >
    <template v-if="!vertical">
      <h4 v-if="title">
        <slot name="header"><xia-icon :icon="icon" /> {{ title }}</slot>
      </h4>
      <div class="card-content" :class="{ padding: noPadding }"><slot /></div>
    </template>

    <template v-else>
      <h4 v-if="icon">
        <slot name="header"><xia-icon :icon="icon" /> {{ title }}</slot>
      </h4>
      <div class="card-content" :class="{ padding: noPadding }"><slot /></div>
    </template>
  </div>
</template>
<style lang="less" scoped>
  .card-wrap {
    @apply border border-base-300 shadow-lg bg-base-100;
    padding: 12px 0;
    border-radius: 8px;
    & > h4 {
      line-height: 32px;
      font-size: 15px;
      font-weight: 600;
      color: var(--text-color);
      padding: 0 20px;
    }
    .card-content {
      height: calc(100% - 32px);
      overflow-y: auto;
    }
    .padding {
      padding: 0 20px;
    }
  }
  .card-wrap__vertical {
    @apply flex justify-between relative;

    & > h4 {
      width: 40px;
      line-height: 1.6;
      color: #999;
      padding-right: 0;
    }
    .card-content {
      @apply flex-1;
    }
  }
</style>
