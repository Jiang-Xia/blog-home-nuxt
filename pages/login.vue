<script setup lang="ts">
  import { reactive, ref } from "vue";
  import request from "~~/api/request.js";
  import api from "@/api";
  const token = useToken();
  // const userInfo = useUserInfo();
  definePageMeta({
    layout: "custom", // 不使用default布局
  });
  useHead({
    title: "登录",
    titleTemplate: (title) => `${title} - 江夏的个人博客-记录生活记录你~`,
  });
  interface loginState extends StringKey {
    mobile: string;
    password: string;
  }
  const loginFrom: loginState = reactive({
    mobile: "",
    password: "",
  });
  /* 登录 */
  const loginHandle = async () => {
    // console.log(res)
  };
  const okHandle = async () => {
    const msg: loginState = {
      mobile: "填写手机号",
      password: "填写密码",
    };
    for (let key in loginFrom) {
      if (!loginFrom[key]) {
        console.log(msg[key]);
        return;
      }
    }
    const loginData = await request.post("/user/login", loginFrom).then((res) => res.data.info);
    token.value = loginData.token;
    localStorage.setItem("x-token", token.value);
    // const info:userInfoState = await api.getUserInfo();
    // userInfo.value = info;
    navigateTo("/");
  };
</script>
<template>
  <div class="login">
    <div class="w-10/12 md:w-96">
      <div class="text-center text-white">
        <h1 class="text-5xl font-bold">LOGIN</h1>
        <p class="py-6 w-full"></p>
      </div>
      <div class="card max-w-sm shadow-2x bg-base-100">
        <div class="card-body">
          <div class="form-control">
            <label class="label">
              <span class="label-text">手机号</span>
            </label>
            <input
              type="text"
              class="input input-bordered"
              v-model="loginFrom.mobile"
              maxlength="11"
              placeholder="手机号"
            />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">密码</span>
            </label>
            <input
              type="password"
              class="input input-bordered"
              v-model="loginFrom.password"
              maxlength="16"
              placeholder="密码"
            />
            <!-- <label class="label">
              <a href="#" class="label-text-alt link link-hover"
                >Forgot password?</a
              >
            </label> -->
          </div>
          <div class="form-control mt-6">
            <button class="btn btn-primary" @click="okHandle">Login</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped>
  .login {
    height: 100vh;
    width: 100vw;
    @apply bg-base-200 flex justify-center items-center;
    background-image: url(@/assets/images/login/coding3.jpg);
    background-size: 100% 100%;
    background-repeat: no-repeat;
    // color: var(--text-color);
  }
</style>
