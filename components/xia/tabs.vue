<script setup lang="ts">
  const emits = defineEmits(['click', 'input'])
  const props = defineProps({
    config: {
      type: Object,
      default: () => ({}),
    },
  })
  const clickTab = (index:number) => {
    active.value = index
    emits('click', props.config.list[index])
    emits('input', index)
  }
  const active = ref(0)
</script>
<template>
  <div class="xia-tabs">
    <div class="tabs">
      <a
        v-for="(tab, index) in config.list"
        class="tab tab-lifted"
        :class="active === index ? 'tab-active' : ''"
        @click="clickTab(index)"
      >{{ tab.label }}</a>
    </div>
    <div v-for="(tab, index) in config.list" v-show="active === index" class="tab-pane">
      <div
        :style="
          {
            'border-top-left-radius':active===0?'0px': ''
          }
        "
        class="tab-pane__content bg-base-300 rounded-b-lg rounded-tr-lg rounded-tl-lg min-h-16"
      >
        <slot :tab="tab" :index="index" />
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped>
  .xia-tabs {
    .tab-lifted {
      @apply border-transparent;
    }
    .tab-active {
      @apply bg-base-300;
    }
    .tab-active::after,
    .tab-active::before {
      display: none;
    }
    .tab-pane {
    }
    .tab-pane__content {
    }
  }
</style>
