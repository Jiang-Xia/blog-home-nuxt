<script setup lang="ts">
import { computed, ref } from "vue";
import { UserAddIcon } from "@heroicons/vue/solid";
import { TransitionRoot, Dialog, TransitionChild,ComboboxInput } from "@headlessui/vue";
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
      <div class="h-10 flex justify-end text-xs">
        <button
          type="button"
          @click="openModal"
          class="link-btn text-white flex justify-center items-center rounded-md w-16 bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500"
        >
          <UserAddIcon class="h-6 w-6" />
        </button>
      </div>

      <TransitionRoot appear :show="isOpen" as="template">
        <Dialog as="div" @close="closeModal" class="relative z-10">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0"
            enter-to="opacity-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100"
            leave-to="opacity-0"
          >
            <div class="fixed inset-0 bg-black bg-opacity-25" />
          </TransitionChild>

          <div class="fixed inset-0 overflow-y-auto">
            <div
              class="flex min-h-full items-center justify-center p-4 text-center"
            >
              <TransitionChild
                as="template"
                enter="duration-300 ease-out"
                enter-from="opacity-0 scale-95"
                enter-to="opacity-100 scale-100"
                leave="duration-200 ease-in"
                leave-from="opacity-100 scale-100"
                leave-to="opacity-0 scale-95"
              >
                <DialogPanel
                  class="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-4 text-left align-middle shadow-xl transition-all"
                >
                  <DialogTitle
                    as="h3"
                    class="text-lg font-medium leading-6 text-gray-900"
                  >
                    申请外链
                  </DialogTitle>

                  <div class="mt-2">
                    111
                    <ComboboxInput
                      class="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                      @change=""
                    />
                  </div>

                  <div class="mt-4 flex justify-end">
                    <button
                      type="button"
                      class="inline-flex mr-4 justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      @click="closeModal"
                    >
                      关闭
                    </button>
                    <button
                      type="button"
                      class="inline-flex justify-center rounded-md border border-transparent bg-blue-200 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      @click="closeModal"
                    >
                      确认
                    </button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </TransitionRoot>
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
