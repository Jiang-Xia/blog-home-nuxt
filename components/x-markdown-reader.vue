<script setup lang="ts">
import { defineComponent, onMounted, ref } from "vue";
// import hljs from 'highlight.js'
// import dayjs from 'dayjs'
import { copy } from "@/utils/index";
const props = defineProps({
  content: {
    type: String,
    default: "",
  },
});
const markdownRef = ref();
onMounted(() => {
  // console.log(markdownRef.value)
  if (!markdownRef.value) {
    return;
  }
  if (markdownRef.value) {
    const blocks = markdownRef.value.querySelectorAll("pre code");
    blocks.forEach((block: HTMLElement) => {
      const span = document.createElement("span");
      const i = document.createElement("i");
      span.className = "code-left-bar";
      i.className = "copy-btn pointer";
      i.innerText = "复制";
      span.innerText = block.className.toLowerCase();
      span.appendChild(i);
      block.parentElement?.insertBefore(span, block);
      i.onclick = () => copy(block.innerText);
      // hljs.highlightBlock(block)
    });
  }
});
</script>
<template>
  <div
    ref="markdownRef"
    class="x-markdown-reader"
    v-html="props.content"
  ></div>
</template>
<style lang="less">
.x-markdown-reader {
  // 代码回显样式
  .copy-btn {
    margin-left: 20px;
    font-style: normal;
  }
  .copy-btn:hover {
    color: var(--main-color);
  }
  .code-left-bar {
    position: absolute;
    top: 8px;
    right: 5px;
    font-size: 12px;
    line-height: 1;
    cursor: pointer;
    color: hsla(0, 0%, 54.9%, 0.8);
    transition: color 0.1s;
  }
  img {
    max-width: 100%;
  }
  pre {
    position: relative;
    max-height: 400px;
    padding-top: 30px;
    border-radius: 5px;
    margin: 10px 0;
    // overflow: auto;
    background-color: var(--main-bgc);
    font-size: 1em;
    &::before {
      position: absolute;
      top: -4px;
      display: block;
      width: 100%;
      height: 30px;
      background-image: url(@/assets/icons/code-btn.png);
      background-position: 10px 10px;
      background-size: 55px;
      background-repeat: no-repeat;
      content: "";
    }
  }
  code {
    display: inline-block;
    max-height: 370px;
    border-radius: 3px;
    padding: 3px 5px;
    margin: 0 3px;
    color: var(--text-color);
    background-color: var(--main-bgc);
    margin: 0;
    word-wrap: break-word;
    word-break: break-all;

    @at-root pre {
      overflow: hidden;
    }
  }

  blockquote {
    display: block;
    border-left: 8px solid var(--main-color);
    padding: 5px 10px;
    margin: 10px 0;
    line-height: 1.4;
    font-size: 100%;
    background-color: var(--main-bgc);
  }
  p,
  h1,
  h2,
  h3,
  h4,
  h5,
  table,
  pre {
    margin: 10px 0;
    line-height: 1.5;
  }

  a {
    color: #2a6496;
    text-decoration: underline;
  }
}
</style>
