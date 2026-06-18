<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import { messageDanger, messageSuccess, messageWarning } from '@/utils/toast';
import { useRpg } from '~~/composables/use-rpg';
import { beforeTimeNow } from '@/utils';
import { getRandomNickname } from '@/utils/common';
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
const { isBanned } = useRpg();
const showToast = ref(false);
const guestNickname = () => getRandomNickname();
const resolveFormName = () => (userInfo.value?.uid ? userInfo.value.nickname : guestNickname());
const msgForm: MsgInterFace = reactive({
  name: resolveFormName(),
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
const confirmHandle = async () => {
  try {
    if (userInfo.value?.uid && isBanned.value) {
      messageWarning('您当前处于禁言状态，暂时无法留言');
      return;
    }
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
    keys.forEach((k) => {
      if (k === 'name') {
        msgForm.name = resolveFormName();
      }
      else {
        msgForm[k as keyof MsgInterFace] = '';
      }
    });
    getAllMsgboard();
  }
  catch (error) {
    console.log(error);
  }
};
const replayModal = ref<HTMLDialogElement>();
const clickReplyHandle = (item: any) => {
  dialog.value = true;
  replayModal.value?.showModal();
  currentItem.value = item;
  replyForm.value = {
    name: resolveFormName(),
    comment: '',
  };
};
const currentItem = ref<any>();
const dialog = ref(false);
const replyForm: any = ref({
  name: resolveFormName(),
  comment: '',
});
const okHandle = async () => {
  if (userInfo.value?.uid && isBanned.value) {
    messageWarning('您当前处于禁言状态，暂时无法回复');
    return;
  }
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
  <CyberPageContainer label="MSG BOARD" title="留言板" subtitle="欢迎留言交流，分享你的想法">
    <h1 class="hidden">
      网站留言板 - {{ SiteTitle }}
    </h1>

    <CyberCard class="mx-auto mb-6 max-w-3xl !p-4 md:!p-6">
      <CyberAlert v-show="showToast" variant="warning" class="mb-4">
        <p>请填写完整信息哦！</p>
      </CyberAlert>

      <p class="cyber-section-label mb-4">
        发表留言
      </p>

      <div class="space-y-3">
        <label class="form-control">
          <span class="label"><span class="label-text"><span class="text-red-500">*</span>昵称</span></span>
          <input
            v-model="msgForm.name"
            type="text"
            class="input input-bordered w-full login-input"
            placeholder="您的昵称"
            maxlength="10"
          >
        </label>

        <label class="form-control">
          <span class="label">
            <span class="label-text"><span class="text-red-500">*</span>邮件</span>
            <a
              href="http://milu.blog/message"
              class="label-text-alt link link-primary link-hover"
              target="_blank"
            >Gravatar?</a>
          </span>
          <input
            v-model="msgForm.eamil"
            type="text"
            placeholder="您的邮件"
            class="input input-bordered w-full login-input"
            maxlength="30"
          >
        </label>

        <label class="form-control">
          <span class="label"><span class="label-text"><span class="text-red-500">*</span>主页</span></span>
          <input
            v-model="msgForm.address"
            type="text"
            placeholder="您的主页"
            class="input input-bordered w-full login-input"
            maxlength="30"
          >
        </label>

        <label class="form-control">
          <span class="label"><span class="label-text"><span class="text-red-500">*</span>评论</span></span>
          <RpgInteractBar />
          <textarea
            v-model="msgForm.comment"
            class="textarea textarea-bordered w-full login-input"
            placeholder="您的评论"
            maxlength="800"
            :disabled="!!userInfo?.uid && isBanned"
          />
        </label>

        <CyberButton variant="primary" class="mt-2" @click="confirmHandle">
          发表
        </CyberButton>
      </div>
    </CyberCard>

    <div class="mx-auto max-w-3xl space-y-3">
      <CyberCard v-for="item in msgboardList" :key="item.id" class="!p-4">
        <div class="mb-3 flex flex-wrap items-center gap-2 text-sm text-tech-subtle">
          <div class="avatar h-7 w-7">
            <div class="w-7 rounded-full bg-tech-header ring-1 ring-tech">
              <a :href="item.address" target="_blank">
                <xia-image lazyload :src="item.avatar" class="h-full" />
              </a>
            </div>
          </div>
          <span class="font-medium text-tech">{{ item.name }}</span>
          <span class="flex items-center gap-1 text-xs">
            <xia-icon width="14px" icon="blog-shijian" /> {{ beforeTimeNow(item.createAt) }}
          </span>
          <xia-icon
            v-if="showDelBtn"
            width="14px"
            class="ml-auto cursor-pointer text-tech-subtle hover:text-red-400"
            icon="blog-shanchu"
            @click="delComment(0, item)"
          />
        </div>
        <p class="mb-3 text-sm leading-relaxed text-tech">
          {{ item.comment }}
        </p>
        <div class="flex flex-wrap items-center justify-end gap-3 text-xs text-tech-subtle">
          <button
            class="mr-auto flex items-center gap-1 transition-colors hover:text-primary"
            @click.stop="clickReplyHandle(item)"
          >
            <xia-icon icon="blog-pinglun" width="14px" />回复
          </button>
          <span class="flex items-center gap-1"><xia-icon width="14px" icon="blog-dingwei" />{{ item.location }}</span>
          <span class="flex items-center gap-1"><xia-icon width="14px" icon="blog-os" /> {{ item.system }}</span>
          <span class="flex items-center gap-1"><xia-icon width="14px" icon="blog-browser" /> {{ item.browser }}</span>
        </div>

        <div v-if="item.children?.length" class="mt-4 space-y-3 border-t border-tech pt-4 md:ml-4">
          <div v-for="replyItem in item.children" :key="replyItem.id" class="flex gap-3">
            <div class="w-8 shrink-0">
              <div
                class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-tech-header text-tech"
              >
                <xia-image
                  v-if="replyItem.avatar"
                  lazyload
                  :src="replyItem.avatar"
                  class="h-full rounded-full"
                  :alt="replyItem.name"
                />
                <xia-icon v-else icon="blog-yonghu" />
              </div>
            </div>
            <div class="min-w-0 flex-1">
              <div class="mb-1 flex flex-wrap items-center gap-2 text-xs text-tech-subtle">
                <span>{{ replyItem.name + ' @ ' + replyItem.respondent }}</span>
                <span>{{ beforeTimeNow(replyItem.createAt) }}</span>
                <xia-icon
                  v-if="showDelBtn"
                  width="14px"
                  class="ml-auto cursor-pointer hover:text-red-400"
                  icon="blog-shanchu"
                  @click="delComment(1, replyItem)"
                />
              </div>
              <p class="text-sm text-tech">
                {{ replyItem.comment }}
              </p>
              <div class="mt-1 flex flex-wrap justify-end gap-2 text-xs text-tech-subtle">
                <button
                  class="mr-auto flex items-center gap-1 hover:text-primary"
                  @click.stop="clickReplyHandle(replyItem)"
                >
                  <xia-icon icon="blog-pinglun" width="14px" />回复
                </button>
                <span class="hidden items-center gap-1 md:flex">
                  <xia-icon width="14px" icon="blog-dingwei" />{{ replyItem.location }}
                </span>
                <span class="hidden items-center gap-1 md:flex">
                  <xia-icon width="14px" icon="blog-os" />{{ replyItem.system }}
                </span>
                <span class="hidden items-center gap-1 md:flex">
                  <xia-icon width="14px" icon="blog-browser" />{{ replyItem.browser }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CyberCard>
    </div>

    <dialog id="replay_modal" ref="replayModal" class="modal">
      <div class="modal-box cyber-glass-card border border-tech">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <h3 class="text-lg font-bold text-tech">
          回复
        </h3>
        <div class="mt-4 space-y-4">
          <label class="form-control">
            <span class="label"><span class="label-text"><span class="text-red-500">*</span>名称</span></span>
            <input
              v-model="replyForm.name"
              type="text"
              placeholder="你的名称"
              class="input input-bordered w-full login-input"
              maxlength="10"
            >
          </label>
          <label class="form-control">
            <span class="label"><span class="label-text"><span class="text-red-500">*</span>内容</span></span>
            <textarea
              v-model="replyForm.comment"
              class="textarea textarea-bordered w-full login-input"
              placeholder="您的评论"
              maxlength="300"
            />
          </label>
          <div class="modal-action">
            <CyberButton variant="primary" @click="okHandle">
              确 认
            </CyberButton>
          </div>
        </div>
      </div>
    </dialog>
  </CyberPageContainer>
</template>

<style lang="less" scoped>
  .avatar:hover {
    animation: rotate-scale-up 0.65s linear both;
  }
</style>
