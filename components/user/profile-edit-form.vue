<script setup lang="ts">
/**
   * 个人资料编辑表单
   */
import { getUserInfo, updateUserProfile } from '~~/api/index';
import { uploadImage, parseUploadedUrl } from '~~/api/resources';
import { DEFAULT_AVATAR_FALLBACK } from '~~/utils/common';
import { messageDanger, messageSuccess } from '@/utils/toast';

const emit = defineEmits<{
  saved: [];
  cancel: [];
}>();

const userInfo = useUserInfo();

const form = reactive({
  nickname: '',
  intro: '',
  homepage: '',
  avatar: '',
});

const avatarUploading = ref(false);
const submitting = ref(false);

const syncFormFromUser = () => {
  const info = userInfo.value;
  if (!info?.uid) return;
  form.nickname = info.nickname || '';
  form.intro = info.intro || '';
  form.homepage = info.homepage || '';
  form.avatar = info.avatar || DEFAULT_AVATAR_FALLBACK;
};

watch(() => userInfo.value, syncFormFromUser, { immediate: true, deep: true });

const onAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  if (img.src.includes(DEFAULT_AVATAR_FALLBACK)) return;
  img.src = DEFAULT_AVATAR_FALLBACK;
  form.avatar = DEFAULT_AVATAR_FALLBACK;
};

const onAvatarFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  avatarUploading.value = true;
  try {
    const res = await uploadImage(file, 'avatar');
    form.avatar = parseUploadedUrl(res);
  }
  catch {
    messageDanger('头像上传失败');
  }
  finally {
    avatarUploading.value = false;
    input.value = '';
  }
};

const handleSubmit = async () => {
  const nickname = form.nickname.trim();
  if (!nickname) {
    messageDanger('请填写昵称');
    return;
  }
  if (!userInfo.value?.uid) {
    messageDanger('请先登录');
    return;
  }

  submitting.value = true;
  try {
    await updateUserProfile({
      id: userInfo.value.uid,
      nickname,
      intro: form.intro.trim(),
      homepage: form.homepage.trim(),
      avatar: form.avatar,
    });
    userInfo.value = await getUserInfo();
    messageSuccess('资料已保存');
    emit('saved');
  }
  catch {
    // 错误由全局拦截器处理
  }
  finally {
    submitting.value = false;
  }
};
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <div class="flex items-center gap-4">
      <div class="avatar">
        <div
          class="w-16 h-16 rounded-full ring ring-primary/25 ring-offset-2 ring-offset-base-100 overflow-hidden"
        >
          <img
            :src="form.avatar"
            alt="头像预览"
            class="w-full h-full object-cover"
            @error="onAvatarError"
          >
        </div>
      </div>
      <label class="btn btn-outline btn-sm min-h-9 h-9">
        <span v-if="avatarUploading" class="loading loading-spinner loading-xs" />
        <span v-else>更换头像</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          class="hidden"
          :disabled="avatarUploading"
          @change="onAvatarFileChange"
        >
      </label>
    </div>

    <div class="form-control">
      <label class="login-label">
        <span class="login-label-text">昵称</span>
      </label>
      <label class="login-input input input-sm">
        <input
          v-model="form.nickname"
          type="text"
          maxlength="6"
          placeholder="昵称（最多6字）"
          required
        >
      </label>
    </div>

    <div class="form-control">
      <label class="login-label">
        <span class="login-label-text">个人简介</span>
      </label>
      <textarea
        v-model="form.intro"
        class="textarea textarea-bordered textarea-sm w-full min-h-20"
        maxlength="120"
        placeholder="一句话介绍自己（选填）"
      />
    </div>

    <div class="form-control">
      <label class="login-label">
        <span class="login-label-text">个人主页</span>
      </label>
      <label class="login-input input input-sm">
        <input
          v-model="form.homepage"
          type="url"
          maxlength="200"
          placeholder="https://example.com（选填）"
        >
      </label>
    </div>

    <div class="flex flex-wrap gap-2 pt-1">
      <button
        type="submit"
        class="btn btn-primary btn-sm"
        :disabled="submitting || avatarUploading"
      >
        <span v-if="submitting" class="loading loading-spinner loading-xs" />
        保存资料
      </button>
      <button
        type="button"
        class="btn btn-ghost btn-sm"
        :disabled="submitting"
        @click="emit('cancel')"
      >
        取消
      </button>
    </div>
  </form>
</template>
