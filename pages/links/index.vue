<script setup lang="ts">
import { computed, ref } from "vue";
import request from "~~/api/request";
const { data: linkList } = await useAsyncData("link_Get", () =>
  request.get("/link").then((res) => res.data)
);
console.log(linkList.value);
const openModal = () => {
  isOpen.value = true;
};
const closeModal = () => (isOpen.value = false);
const isOpen = ref(false);
useHead({
  title: "友链",
  titleTemplate: (title) => `${title} - 江夏的个人博客`,
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  charset: "utf-8",
  meta: [
    { name: "Keywords", content: "江夏的个人博客" },
    {
      name: "description",
      content: "江夏的个人博客，用于记录工作生活学习中的点滴~",
    },
  ],
});
</script>
<template>
  <NuxtLayout name="main-content">
    <div class="links-container">
      <!-- <el-empty description="友链页面 暂时没有东西哦！" /> -->
      <div class="h-10 flex justify-end text-xs"></div>
      <!-- The button to open modal -->
      <label for="link-add-modal" class="btn modal-button">+ 申请外链</label>

      <!-- Put this part before </body> tag -->
      <input type="checkbox" id="link-add-modal" class="modal-toggle" />
      <div class="modal">
        <div class="modal-box relative">
          <label
            for="link-add-modal"
            class="btn btn-sm btn-circle absolute right-2 top-2"
            >✕</label
          >
          <h3 class="text-lg font-bold">申请外链!</h3>

          <div class="py-4">
            <div class="form-control">
              <label class="input-group input-group-sm">
                <span>SM</span>
                <input
                  type="text"
                  placeholder="Type here"
                  class="input input-bordered input-sm"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
<style lang="less" scoped>
.links-container {
  min-height: 100%;
  .link-btn:hover {
    animation: jump ease 1.5s 1;
  }
}
</style>
