<script setup lang="ts">
import { computed, ref } from 'vue';
import type { PropType } from 'vue';
import { useRoute } from 'vue-router';
import { beforeTimeNow } from '@/utils';
import { addComment, addReply, delComment, delReply } from '@/api/article';

import { messageDanger, messageSuccess } from '~~/utils/toast';

defineProps({
  comments: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
  total: {
    type: Number,
    default: 0,
  },
});
const emits = defineEmits(['commented']);
const userInfo = useUserInfo();
const route = useRoute();
const formactTime = (item: any) => {
  const time = new Date(item.createTime).getTime();
  return beforeTimeNow(time);
};

/* 评论功能 开始 */
const inputContent = ref('');
const addCommentHandle = async () => {
  if (!tip()) {
    return;
  }
  if (!inputContent.value) {
    messageDanger('请输入你的评论！');
    return;
  }
  const params = {
    uid: uid.value,
    content: inputContent.value,
    articleId: Number(route.params.id),
  };
  const res = await addComment(params);
  if (res) {
    messageSuccess('评论成功');
    emits('commented');
    inputContent.value = '';
  }
};
const delCommentHandle = async (id: string) => {
  await delComment(id);
  messageSuccess('删除成功');
  emits('commented');
};
const uid = computed(() => {
  return userInfo.value.uid;
});
const tip = () => {
  if (!uid.value) {
    const toast = useToast();
    toast.add({
      title: '提示',
      description: '需要登录才能评论哦',
      actions: [
        {
          icon: 'fe:paper-plane',
          label: '去登录',
          color: 'error',
          variant: 'outline',
          onClick: async () => {
            await navigateTo('/login');
          },
        },
      ],
    });
  }
  else {
    return true;
  }
};
  // 当前点击回复的id评论
const currentReplyBoxId = ref('');
// 当前点击评论id（父级）
const currentParentId = ref('');

// 点击回复按钮
/**
   * @description: 点击回复按钮回调
   * @param {*} type 区分评论/回复
   * @param {*} item /当前评论/回复的信息
   * @param {*} pId 当点击回复时才有
   * @return {*}
   */
const clickReplyHandle = (type: string, item: any, pId?: string) => {
  if (!tip()) {
    return;
  }
  currentReplyBoxId.value = item.id;
  if (type === 'comment') {
    currentParentId.value = item.id;
    targetUser.value = item.userInfo;
  }
  else {
    currentParentId.value = pId as string; // 自己断言一定有且为string
    targetUser.value = item.userInfo;
  }
};
  /* 评论功能 结束 */

/* 回复功能 开始 */
// 当前回复的目标用户
const targetUser: any = ref({});
const targetUsername = computed(() => {
  const { nickname } = targetUser.value;
  return nickname;
});
  // 回复输入框实例
const commentRefs = ref([]);
const replyRefs = ref([]);

const addReplytHandle = async (content: string) => {
  // console.log(targetUser.value);
  try {
    if (inputContent.value) {
      messageDanger('请输入你的评论！');
    }
    const params = {
      parentId: currentParentId.value, // 评论id 所有回复的父级id
      uid: uid.value, // 当前评论人uid
      content, // 评论内容
      replyUid: targetUser.value.id, // 目标用户uid
    };
    await addReply(params);
    messageSuccess('评论成功');
    currentReplyBoxId.value = '';
    emits('commented');
  }
  catch (error) {
    console.error(error);
  }
};
const delReplytHandle = async (id: string) => {
  await delReply(id);
  messageSuccess('删除成功');
  emits('commented');
};
  // 回复确定按钮回调
const replyedHandle = (content: string) => {
  addReplytHandle(content);
};
  /* 回复功能 结束 */
</script>

<template>
  <div class="comment-container text-base-content/70">
    <textarea
      v-model="inputContent"
      class="textarea textarea-success w-full"
      placeholder="动动你的双手吧~"
    />
    <div class="tool-bar mt-1">
      <h4 class="font-bold text-sm">
        全部评论({{ total }})
      </h4>
      <button
        class="btn btn-neutral btn-sm px-4 tracking-widest"
        :disabled="!inputContent"
        @click="addCommentHandle"
      >
        确 认
      </button>
    </div>
    <section v-for="commentItem in comments" :key="commentItem.id" class="flex mt-4">
      <!-- 头像 -->
      <div class="w-10 mr-2">
        <div
          class="rounded-full h-8 w-8 bg-gray-300 inline-flex items-center justify-center text-base-100"
        >
          <img
            v-if="commentItem.userInfo.avatar"
            class="rounded-full"
            :src="commentItem.userInfo.avatar"
            :alt="commentItem.userInfo.nickname"
          >
          <xia-icon v-else icon="blog-yonghu" />
        </div>
      </div>
      <!-- 评论内容主体 -->
      <div class="flex-1">
        <span class="text-xs">{{ commentItem.userInfo && commentItem.userInfo.nickname }}</span>
        <span class="text-xs pl-2">{{ formactTime(commentItem) }}</span>
        <div class="text-sm content text-base-content">
          {{ commentItem.content }}
        </div>

        <div class="py-1">
          <button
            v-show="commentItem.id !== currentReplyBoxId"
            class="btn btn-ghost btn-xs text-xs text-gray-500"
            @click="clickReplyHandle('comment', commentItem)"
          >
            <xia-icon icon="blog-pinglun" width="14px" class="mr-1" />回复
          </button>
          <button
            v-if="commentItem.id === currentReplyBoxId"
            class="btn btn-ghost btn-xs text-xs text-gray-500"
            @click="currentReplyBoxId = ''"
          >
            取消回复
          </button>
          <button
            v-if="uid === commentItem.uid"
            class="btn btn-ghost btn-xs text-xs text-gray-500"
            @click="delCommentHandle(commentItem.id)"
          >
            <xia-icon icon="blog-shanchu" width="14px" class="mr-1" />删除
          </button>
        </div>
        <!-- 回复输入框  -->
        <XiaReply
          v-if="commentItem.id === currentReplyBoxId"
          ref="commentRefs"
          :name="targetUsername"
          @replyed="replyedHandle"
        />
        <!-- 回复内容主体 -->
        <div
          v-if="commentItem.replys && commentItem.replys.length"
          class="reply-wrap mt-2 bg-base-300 rounded-md"
        >
          <section v-for="replyItem in commentItem.replys" :key="replyItem.id" class="flex mt-4">
            <!-- 头像 -->
            <div class="w-10 mr-2">
              <div
                class="rounded-full h-8 w-8 bg-gray-300 inline-flex items-center justify-center text-base-100"
              >
                <img
                  v-if="replyItem.userInfo.avatar"
                  class="rounded-full"
                  :src="replyItem.userInfo.avatar"
                  :alt="replyItem.userInfo.nickname"
                >
                <xia-icon v-else icon="blog-yonghu" />
              </div>
            </div>
            <div class="flex-1">
              <span class="text-xs">
                {{
                  commentItem.userInfo
                    && replyItem.userInfo.nickname + ' @ ' + replyItem.tUserInfo.nickname
                }}
              </span>
              <span class="text-xs pl-2">{{ formactTime(replyItem) }}</span>
              <div class="text-sm content text-base-content">
                {{ replyItem.content }}
              </div>

              <div class="py-1">
                <button
                  v-show="replyItem.id !== currentReplyBoxId"
                  class="btn btn-ghost btn-xs text-xs text-gray-500"
                  @click="clickReplyHandle('reply', replyItem, commentItem.id)"
                >
                  <xia-icon icon="blog-pinglun" width="14px" class="mr-1" />回复
                </button>
                <button
                  v-if="replyItem.id === currentReplyBoxId"
                  class="btn btn-ghost btn-xs text-xs text-gray-500"
                  @click="currentReplyBoxId = ''"
                >
                  取消回复
                </button>
                <button
                  v-if="uid === replyItem.uid"
                  class="btn btn-ghost btn-xs text-xs text-gray-500"
                  @click="delReplytHandle(replyItem.id)"
                >
                  <xia-icon icon="blog-shanchu" width="14px" class="mr-1" />删除
                </button>
              </div>
              <XiaReply
                v-if="replyItem.id === currentReplyBoxId"
                ref="replyRefs"
                :name="targetUsername"
                @replyed="replyedHandle"
              />
            </div>
          </section>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="less">
  .comment-container {
    // color: var(--text-color2);
    font-size: 12px;
    h4 {
      text-align: center;
      letter-spacing: 0.5em;
    }
    // padding-left: 10% !important;
    .reply-wrap {
      // background: var(--minor-bgc);
      // border-radius: var(--layout-border-radius);
      padding: 8px 10px;
    }
    .tool-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  .content {
    // color: var(--text-color);
  }
  .action {
    font-weight: normal;
  }
</style>
