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
});
</script>

<template>
  <div
    class="card-wrap border border-base-300 shadow-lg bg-base-100 rounded-lg"
    :class="{ 'flex justify-between relative': vertical }"
    :style="{
      'min-height': minHeight,
      'padding': noPadding ? '12px 0' : '',
    }"
  >
    <template v-if="!vertical">
      <h4 v-if="title">
        <slot name="header">
          <xia-icon :icon="icon" /> {{ title }}
        </slot>
      </h4>
      <div class="card-content" :class="{ padding: noPadding }">
        <slot />
      </div>
    </template>

    <template v-else>
      <h4 v-if="icon">
        <slot name="header">
          <xia-icon :icon="icon" /> {{ title }}
        </slot>
      </h4>
      <div class="card-content" :class="{ padding: noPadding }">
        <slot />
      </div>
    </template>
  </div>
</template>

<style lang="less" scoped>
  .card-wrap {
    & > h4 {
      line-height: 32px;
      font-size: 15px;
      font-weight: 600;
      // color: var(--text-color);
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
    & > h4 {
      width: 40px;
      line-height: 1.6;
      color: #999;
      padding-right: 0;
    }
    .card-content {
      flex: 1;
    }
  }
</style>
