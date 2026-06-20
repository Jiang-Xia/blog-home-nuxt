<script setup lang="ts">
/**
   * 留言板页
   * - 顶层留言分页（pageSize=30），子回复随父节点返回
   * - 发表/回复成功播放 contentPost
   */
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
const { data: initialMsgData } = await useAsyncData('msgboard_Get', () =>
  request.get('/msgboard', { page: 1, pageSize: 30 }),
);
const flatMsgList = ref<any[]>(initialMsgData.value?.list ?? []);
const msgboardPage = ref(1);
const msgboardHasMore = ref(
  (initialMsgData.value?.pagination?.total ?? 0) > flatMsgList.value.length,
);
const msgboardLoading = ref(false);

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

const msgboardList = ref<any[]>([]);

const rebuildTree = () => {
  msgboardList.value = buildTree(flatMsgList.value);
};

rebuildTree();

const reloadMsgboard = async () => {
  msgboardPage.value = 1;
  const res = await request.get('/msgboard', { page: 1, pageSize: 30 });
  flatMsgList.value = res?.list ?? [];
  msgboardHasMore.value = flatMsgList.value.length < (res?.pagination?.total ?? 0);
  rebuildTree();
};

/** 分页加载更多顶层留言 */
const loadMoreMsgboard = async () => {
  if (msgboardLoading.value || !msgboardHasMore.value) return;
  msgboardLoading.value = true;
  try {
    msgboardPage.value += 1;
    const res = await request.get('/msgboard', { page: msgboardPage.value, pageSize: 30 });
    flatMsgList.value = [...flatMsgList.value, ...(res?.list ?? [])];
    msgboardHasMore.value = flatMsgList.value.length < (res?.pagination?.total ?? 0);
    rebuildTree();
  }
  finally {
    msgboardLoading.value = false;
  }
};
const userInfo = useUserInfo();
const { isBanned } = useRpg();
const { playSfx } = useRpgAudio();
const submitting = ref(false);
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
const getAllMsgboard = reloadMsgboard;
const confirmHandle = async () => {
  if (submitting.value) {
    return;
  }
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
    submitting.value = true;
    await request.post('/msgboard', msgForm);
    void playSfx('contentPost');
    messageSuccess('留言发表成功');
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
  catch {
    messageDanger('发表失败，请稍后重试');
  }
  finally {
    submitting.value = false;
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
  void playSfx('contentPost');
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
            type="email"
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

        <CyberButton variant="primary" class="mt-2" :disabled="submitting" @click="confirmHandle">
          <span v-if="submitting" class="loading loading-spinner loading-sm" />
          {{ submitting ? '提交中...' : '发表' }}
        </CyberButton>
      </div>
    </CyberCard>

    <div class="mx-auto max-w-3xl space-y-3">
      <CyberCard
        v-if="!msgboardList?.length"
        class="!p-8 flex items-center justify-center min-h-48"
      >
        <xia-empty description="还没有留言，来抢沙发吧~" />
      </CyberCard>
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
      <div v-if="msgboardHasMore" class="flex justify-center pt-2">
        <button
          type="button"
          class="btn btn-ghost btn-sm"
          :disabled="msgboardLoading"
          @click="loadMoreMsgboard"
        >
          {{ msgboardLoading ? '加载中...' : '加载更多留言' }}
        </button>
      </div>
    </div>

    <dialog id="replay_modal" ref="replayModal" class="modal rpg-theme">
      <div class="modal-box max-w-md">
        <form method="dialog">
          <button type="button" class="rpg-modal-close">
            ✕
          </button>
        </form>
        <h3 class="text-lg font-bold">
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
          <div class="rpg-modal-actions">
            <button type="button" class="rpg-modal-btn rpg-modal-btn--primary" @click="okHandle">
              确 认
            </button>
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
