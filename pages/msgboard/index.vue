<script setup lang="ts">
import { reactive, ref, computed, onMounted } from "vue";

import request from "~~/api/request";
const { data: msgboardList } = await useAsyncData("msgboard_Get", () =>
  request.get("/msgboard").then((res) => res.data)
);
const authCode = ref("");
const authCodeRef = ref(null);
const showToast = ref(false);
const createCodeHandle = () => {
  authCode.value = authCodeRef.value.createCode(4);
};
const createdHandle = (v) => {
  authCode.value = v;
};
const msgForm = reactive({
  name: "",
  eamil: "",
  address: "",
  comment: "",
  code: "",
});
const isRight = computed(() => {
  return authCode.value.toUpperCase() === msgForm.code.toUpperCase();
});
const showTip = () => {
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 1500);
};
const confirmHandle = async () => {
  const keys = Object.keys(msgForm);
  console.log(
    isRight,
    authCode.value.toUpperCase() === msgForm.code.toUpperCase()
  );
  if (!isRight.value) {
    console.log("验证码错误！");
    showTip();
    return;
  }
  if (keys.every((v) => !v)) {
    showTip();
  }
  console.log(msgForm);
  request.post("/msgboard", msgForm);
  keys.forEach((k) => (msgForm[k] = ""));
};

useHead({
  title: "留言板",
  titleTemplate: (title) => `${title} - 江夏的个人博客 - 记录生活记录你~`
});
</script>
<template>
  <NuxtLayout name="main-content">
    <h1 class="hidden">网站留言板 - 江夏的个人博客 - 记录生活记录你~</h1>
    <div class="msgboard-container flex flex-wrap sm:flex-nowrap">
      <div
        class="card flex-shrink-0 w-full sm:max-w-sm shadow-2xl bg-base-100 form-wrap relative"
      >
        <div class="alert alert-info absolute top-0 left-0" v-show="showToast">
          <div>
            <span>请填写完整信息哦！</span>
          </div>
        </div>
        <div class="card-body">
          <div class="form-control">
            <label class="label">
              <span class="label-text"
                ><span class="text-red-600 px-2">*</span>昵称</span
              >
            </label>
            <input
              type="text"
              placeholder="您的昵称"
              class="input input-bordered"
              v-model="msgForm.name"
            />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text"
                ><span class="text-red-600 px-2">*</span>邮件</span
              >
            </label>
            <input
              type="text"
              placeholder="您的邮件"
              class="input input-bordered"
              v-model="msgForm.eamil"
            />
            <label class="label">
              <a
                href="http://milu.blog/message"
                class="label-text-alt link link-primary link-hover"
                target="_blank"
                >Gravatar?</a
              >
            </label>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text"
                ><span class="text-red-600 px-2">*</span>主页</span
              >
            </label>
            <input
              type="text"
              placeholder="您的主页"
              class="input input-bordered"
              v-model="msgForm.address"
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text"
                ><span class="text-red-600 px-2">*</span>评论</span
              >
            </label>
            <textarea
              class="textarea textarea-bordered"
              placeholder="您的评论"
              v-model="msgForm.comment"
            ></textarea>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text"
                ><span class="text-red-600 px-2">*</span>验证码</span
              >
            </label>
            <div class="flex justify-between items-center mb-2">
              <xia-auth-code
                class="bg-base-300 rounded-sm"
                ref="authCodeRef"
                @created="createdHandle"
              />

              <span
                class="label-text-alt link link-secondary link-hover"
                @click="createCodeHandle"
                >看不清？重新生成</span
              >
            </div>
            <input
              class="input input-bordered"
              v-model="msgForm.code"
              placeholder="请输入图片中的验证码"
            />
          </div>

          <div class="form-control mt-6">
            <button class="btn btn-primary" @click="confirmHandle">发表</button>
          </div>
        </div>
      </div>

      <!-- 留言内容列表 -->
      <!-- 正常是移动样式 大于sm宽度时变成pc样式 -->
      <div class="mt-3 ml-0 sm:ml-4 sm:mt-0 sm:flex-1 w-full card shadow-2xl">
        <div class="card-body p-0 sm:p-8">
          <div v-for="(item, index) in msgboardList">
            <div class="card lg:card-side bg-base-100 shadow-xl">
              <figure>
                <div class="avatar h-16 w-16 ml-3 mt-3 sm:mt-0">
                  <div class="w-24 rounded-full bg-base-300" title="点击跳转他的主页！">
                    <a :href="item.address" target="_blank">
                      <img :alt="item.name " :src="item.avatar" />
                    </a>
                  </div>
                </div>
              </figure>
              <div class="card-body p-4">
                <h2 class="card-title">{{ item.name }}</h2>
                <p>{{ item.comment }}</p>
                <div class="card-actions justify-end">
                  <div class="text-xs">{{ item.createAt }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
<style lang="less" scoped>
.msgboard-container {
  .form-wrap {
    max-height: 48rem;
  }
  .avatar:hover {
    animation: rotate-scale-up 0.65s linear both;
  }
}
</style>
