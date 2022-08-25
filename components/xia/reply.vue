<script setup lang="ts">
import { computed, ref } from 'vue'
import { messageDanger } from '~~/utils/toast';

const props = defineProps({
  name: {
    type: String,
    default: ''
  }
})
const emits = defineEmits(['replyed'])
const inputContent = ref('')
const addReplytHandle = async () => {
  if (!inputContent.value) {
    messageDanger('请输入你的回复！')
  }
  emits('replyed', inputContent.value)
}
const placeholder = computed(() => {
  return '@' + props.name
})
const replyClear = async () => {
  inputContent.value = ''
}
// clear
</script>
<template>
  <transition-group name="fade">
    <div key="reply-container" class="reply-container">
      <textarea
        class="textarea textarea-ghost w-full bg-base-300"
        v-model="inputContent"
        :placeholder="placeholder"
        :max-length="100"
      />
      <div class="tool-bar mt-1">
        <button class="btn btn-sm px-4 tracking-widest" :disabled="!inputContent" @click="addReplytHandle">
          确 认
        </button>
      </div>
    </div>
  </transition-group>
</template>
<style scoped lang="less">
.reply-container {
  .tool-bar {
    text-align: right;
  }
}
</style>
