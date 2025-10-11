<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import { messageDanger, messageSuccess } from '@/utils/toast';
import { beforeTimeNow } from '@/utils';
import request from '~~/api/request';
import { SiteTitle } from '@/utils/constant';

interface MsgInterFace {
  name: string;
  eamil: string;
  address: string;
  comment: string;
}
const { data: msgboardList, refresh } = await useAsyncData('msgboard_Get', () =>
  request.get('/msgboard').then((res: any) => res.list),
);
  // 分组
const buildTree = (list: any[], rootId = 0) => {
  const tree: any[] = [];
  for (const v of list) {
    if (v.pId === rootId) {
      const child = buildTree(list, v.id);
      if (child.length) {
        v.children = child;
      }
      tree.push(v);
    }
  }
  return tree;
};
msgboardList.value = buildTree(msgboardList.value);
const userInfo = useUserInfo();
const showToast = ref(false);
const msgForm: MsgInterFace = reactive({
  name: userInfo.value.nickname,
  eamil: '',
  address: '',
  comment: '',
});
const showTip = () => {
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 1500);
};
onMounted(() => {
  document.addEventListener('click', () => {
    dialog.value = false;
  });
});
const getAllMsgboard = async () => {
  const { list } = await request.get('/msgboard', { pageSize: 10000 });
  msgboardList.value = buildTree(list);
};
  // 邮箱正则
const confirmHandle = async () => {
  try {
    const keys = Object.keys(msgForm);
    if (keys.some(k => !msgForm[k as keyof MsgInterFace])) {
      showTip();
      return;
    }
    const eamilRegx = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
    if (!eamilRegx.test(msgForm.eamil)) {
      messageDanger('邮箱格式不正确哦！');
      return;
    }
    await request.post('/msgboard', msgForm);
    keys.forEach(k => (msgForm[k as keyof MsgInterFace] = ''));
    // refresh()
    getAllMsgboard();
  }
  catch (error) {
    console.log(error);
  }
};
const replayModal = ref<HTMLDialogElement>();
// 回复功能
const clickReplyHandle = (item: any) => {
  dialog.value = true;
  replayModal.value?.showModal();
  currentItem.value = item;
  replyForm.value = {
    name: userInfo.value.nickname,
    comment: '',
  };
};
const currentItem = ref<any>();
const dialog = ref(false);
const replyForm: any = ref({
  name: userInfo.value.nickname,
  comment: '',
});
const okHandle = async () => {
  if (!replyForm.value.name) {
    messageDanger('名称不能为空');
    return;
  }
  else if (!replyForm.value.comment) {
    messageDanger('内容不能为空');
    return;
  }
  const pId = currentItem.value.pId;
  await request.post('/msgboard', {
    pId: pId !== 0 ? pId : currentItem.value.id,
    name: replyForm.value.name,
    replyId: currentItem.value.id,
    respondent: currentItem.value.name,
    eamil: '',
    address: '',
    comment: replyForm.value.comment,
    avatar: userInfo.value.avatar,
  });
  dialog.value = false;
  replayModal.value?.close();
  getAllMsgboard();
};
  // 删除留言
const delComment = async (t: number, item: any) => {
  let ids = [item.id];
  if (t === 0 && item.children) {
    ids = [...ids, ...item.children.map((v: any) => v.id)];
  }
  await request.post('/msgboard/delete', ids);
  messageSuccess('删除成功');
  getAllMsgboard();
};
const showDelBtn = computed(() => ['super', 'admin'].includes(userInfo.value.role));

useHead({
  title: '留言板',
  titleTemplate: title => `${title} - ${SiteTitle}`,
});
</script>

<template>
  <NuxtLayout name="main-content">
    <h1 class="hidden">
      网站留言板 - {{ SiteTitle }}
    </h1>
    <div class="msgboard-container">
      <fieldset
        class="fieldset max-w-3xl mx-auto bg-base-100 border-base-300 rounded-box border p-4"
      >
        <div v-show="showToast" role="alert" class="alert alert-warning relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>请填写完整信息哦！</span>
        </div>

        <legend class="fieldset-legend">
          留言
        </legend>

        <label class="label"><span class="text-red-600 px-2">*</span>昵称</label>
        <input
          v-model="msgForm.name"
          type="text"
          class="input input-bordered w-full"
          placeholder="您的昵称"
          maxlength="10"
        >

        <label class="label"><span class="text-red-600 px-2">*</span>邮件</label>
        <input
          v-model="msgForm.eamil"
          type="text"
          placeholder="您的邮件"
          class="input input-bordered w-full"
          maxlength="30"
        >
        <label class="label">
          <a
            href="http://milu.blog/message"
            class="label-text-alt link link-primary link-hover"
            target="_blank"
          >Gravatar?</a>
        </label>

        <label class="label"><span class="text-red-600 px-2">*</span>主页</label>
        <input
          v-model="msgForm.address"
          type="text"
          placeholder="您的主页"
          class="input input-bordered w-full"
          maxlength="30"
        >

        <label class="label"><span class="text-red-600 px-2">*</span>评论</label>
        <textarea
          v-model="msgForm.comment"
          class="textarea textarea-bordered w-full"
          placeholder="您的评论"
          maxlength="800"
        />

        <button class="btn btn-primary mt-4" @click="confirmHandle">
          发表
        </button>
      </fieldset>
      <!-- 留言内容列表 -->
      <div class="mt-6 max-w-3xl mx-auto">
        <section v-for="item in msgboardList" :key="item.id" class="bg-base-100 mb-3 rounded-box">
          <div class="card mb-3">
            <div class="card-body">
              <h2 class="card-title text-sm font-normal text-gray-400 flex">
                <div class="avatar h-7 w-7">
                  <div class="w-7 rounded-full bg-base-300" title="点击跳转他的主页！">
                    <a :href="item.address" target="_blank">
                      <xia-image :src="item.avatar" class="h-full" />
                    </a>
                  </div>
                </div>
                {{ item.name }}
                <span class="flex">
                  <xia-icon width="14px" icon="blog-shijian" /> {{ beforeTimeNow(item.createAt) }}
                </span>
                <xia-icon
                  v-if="showDelBtn"
                  width="14px"
                  class="ml-auto cursor-pointer"
                  icon="blog-shanchu"
                  @click="delComment(0, item)"
                />
              </h2>
              <p>{{ item.comment }}</p>
              <div class="card-actions justify-end text-xs text-gray-400">
                <button class="mr-auto" @click.stop="clickReplyHandle(item)">
                  <xia-icon icon="blog-pinglun" width="14px" class="mr-1" />回复
                </button>
                <span><xia-icon width="14px" icon="blog-dingwei" />{{ item.location }}</span>
                <span><xia-icon width="14px" icon="blog-os" /> {{ item.system }}</span>
                <span><xia-icon width="14px" icon="blog-browser" /> {{ item.browser }}</span>
              </div>
            </div>
          </div>
          <!-- 回复框 -->
          <div v-if="item.children?.length" class="reply-wrap md:ml-7 rounded">
            <section
              v-for="replyItem in item.children"
              :key="replyItem.id"
              class="flex mt-4 rounded"
            >
              <!-- 头像 -->
              <div class="w-10 mr-2">
                <div
                  class="rounded-full h-8 w-8 bg-gray-300 inline-flex items-center justify-center text-base-100"
                >
                  <img
                    v-if="replyItem.avatar"
                    class="rounded-full"
                    :src="replyItem.avatar"
                    :alt="replyItem.name"
                  >
                  <xia-icon v-else icon="blog-yonghu" />
                </div>
              </div>
              <div class="flex-1">
                <span class="text-xs text-gray-400">
                  {{ replyItem.name + ' @ ' + replyItem.respondent }}
                </span>
                <span class="text-xs pl-2 text-gray-400">{{
                  beforeTimeNow(replyItem.createAt)
                }}</span>
                <xia-icon
                  v-if="showDelBtn"
                  width="14px"
                  class="text-gray-400 ml-auto cursor-pointer"
                  icon="blog-shanchu"
                  @click="delComment(1, replyItem)"
                />
                <div class="text-sm content">
                  {{ replyItem.comment }}
                </div>

                <div class="py-1 text-xs text-gray-400 flex justify-end gap-2">
                  <button class="action mr-auto" @click.stop="clickReplyHandle(replyItem)">
                    <xia-icon icon="blog-pinglun" width="14px" class="mr-1" />回复
                  </button>
                  <span class="hidden md:inline-block">
                    <xia-icon width="14px" icon="blog-dingwei" />{{ replyItem.location }}
                  </span>
                  <span class="hidden md:inline-block">
                    <xia-icon width="14px" icon="blog-os" />{{ replyItem.system }}
                  </span>
                  <span class="hidden md:inline-block">
                    <xia-icon width="14px" icon="blog-browser" />{{ replyItem.browser }}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>

      <!-- 回复弹框 -->
      <dialog id="replay_modal" ref="replayModal" class="modal">
        <div class="modal-box">
          <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 class="text-lg font-bold">
            回复
          </h3>
          <div class="pl-8 pt-4">
            <div class="flex items-center mb-4">
              <span class="w-16"><span class="text-red-600">*</span>名称</span>
              <input
                v-model="replyForm.name"
                type="text"
                placeholder="你的名称"
                class="input input-bordered input-sm max-w-xs w-5/6"
                maxlength="10"
              >
            </div>
            <div class="flex items-center mb-4">
              <span class="w-16"><span class="text-red-600">*</span>内容</span>
              <textarea
                v-model="replyForm.comment"
                class="textarea textarea-bordered max-w-xs w-5/6"
                placeholder="您的评论"
                maxlength="300"
              />
            </div>
            <div class="modal-action">
              <label for="link-add-modal" class="btn btn-neutral" @click="okHandle">确 认</label>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  </NuxtLayout>
</template>

<style lang="less" scoped>
  .msgboard-container {
    position: relative;
    width: 100%;
    .avatar:hover {
      animation: rotate-scale-up 0.65s linear both;
    }
    .form-wrap {
      position: relative;
    }
    .reply-wrap {
      // background: var(--minor-bgc);
      padding: 8px 10px;
    }
  }
  .dialog-show {
    pointer-events: auto;
    visibility: visible;
    opacity: 1;
  }
</style>
