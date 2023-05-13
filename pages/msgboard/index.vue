<script setup lang="ts">
  import { reactive, ref, computed } from 'vue'
  import { messageDanger, messageSuccess } from '@/utils/toast'
  import { beforeTimeNow } from '@/utils'
  import request from '~~/api/request'
  interface MsgInterFace {
    name: string
    eamil: string
    address: string
    comment: string
  }
  const { data: msgboardList, refresh, } = await useAsyncData('msgboard_Get', () =>
    request.get('/msgboard').then(res => res.data)
  )
  // 分组
  const buildTree = (list: any[], rootId = 0) => {
    const tree: any[] = []
    for (const v of list) {
      if (v.pId === rootId) {
        const child = buildTree(list, v.id)
        if (child.length) {
          v.children = child
        }
        tree.push(v)
      }
    }
    return tree
  }
  msgboardList.value = buildTree(msgboardList.value)
  const userInfo = useUserInfo()
  const showToast = ref(false)
  const msgForm: MsgInterFace = reactive({
    name: userInfo.value.nickname,
    eamil: '',
    address: '',
    comment: '',
  })
  const showTip = () => {
    showToast.value = true
    setTimeout(() => {
      showToast.value = false
    }, 1500)
  }
  onMounted(() => {
    document.addEventListener('click', () => {
      dialog.value = false
    })
  })
  const getAllMsgboard = async () => {
    const list = await request.get('/msgboard').then(res => res.data)
    msgboardList.value = buildTree(list)
  }
  // 邮箱正则
  const confirmHandle = async () => {
    try {
      const keys = Object.keys(msgForm)
      if (keys.some(k => !msgForm[k as keyof MsgInterFace])) {
        showTip()
        return
      }
      const eamilRegx = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/
      if (!eamilRegx.test(msgForm.eamil)) {
        messageDanger('邮箱格式不正确哦！')
        return
      }
      await request.post('/msgboard', msgForm)
      keys.forEach(k => (msgForm[k as keyof MsgInterFace] = ''))
      // refresh()
      getAllMsgboard()
    } catch (error) {
      console.log(error)
    }
  }
  // 回复功能
  const clickReplyHandle = (item: any) => {
    dialog.value = true
    currentItem.value = item
    replyForm.value = {
      name: userInfo.value.nickname,
      comment: '',
    }
  }
  const currentItem = ref<any>()
  const dialog = ref(false)
  const replyForm: any = ref({
    name: userInfo.value.nickname,
    comment: '',
  })
  const okHandle = async () => {
    if (!replyForm.value) {
      messageDanger('名称不能为空')
      return
    } else if (!replyForm.value.comment) {
      messageDanger('内容不能为空')
      return
    }
    const pId = currentItem.value.pId
    await request.post('/msgboard', {
      pId: pId !== 0 ? pId : currentItem.value.id,
      name: replyForm.value.name,
      replyId: currentItem.value.id,
      respondent: currentItem.value.name,
      eamil: '',
      address: '',
      comment: replyForm.value.comment,
      avatar: userInfo.value.avatar,
    })
    dialog.value = false
    getAllMsgboard()
  }
  // 删除留言
  const delComment = async (t: number, item: any) => {
    let ids = [item.id]
    if (t === 0 && item.children) {
      ids = [...ids, ...item.children.map((v: any) => v.id)]
    }
    await request.post('/msgboard/delete', ids)
    messageSuccess('删除成功')
    getAllMsgboard()
  }
  const showDelBtn = computed(() => ['super', 'admin'].includes(userInfo.value.role))

  useHead({
    title: '留言板',
    titleTemplate: title => `${title} - 江夏的博客`,
  })
</script>
<template>
  <NuxtLayout name="main-content">
    <h1 class="hidden">网站留言板 - 江夏的博客</h1>
    <div class="msgboard-container">
      <div class="form-wrap max-w-3xl mx-auto">
        <div v-show="showToast" class="alert alert-info absolute top-0 left-0">
          <span>请填写完整信息哦！</span>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text"><span class="text-red-600 px-2">*</span>昵称</span>
          </label>
          <input
            v-model="msgForm.name"
            type="text"
            placeholder="您的昵称"
            class="input input-bordered"
            maxlength="10"
          >
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text"><span class="text-red-600 px-2">*</span>邮件</span>
          </label>
          <input
            v-model="msgForm.eamil"
            type="text"
            placeholder="您的邮件"
            class="input input-bordered"
            maxlength="30"
          >
          <label class="label">
            <a
              href="http://milu.blog/message"
              class="label-text-alt link link-primary link-hover"
              target="_blank"
            >Gravatar?</a>
          </label>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text"><span class="text-red-600 px-2">*</span>主页</span>
          </label>
          <input
            v-model="msgForm.address"
            type="text"
            placeholder="您的主页"
            class="input input-bordered"
            maxlength="30"
          >
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text"><span class="text-red-600 px-2">*</span>评论</span>
          </label>
          <textarea
            v-model="msgForm.comment"
            class="textarea textarea-bordered"
            placeholder="您的评论"
            maxlength="800"
          />
        </div>
        <div class="form-control mt-6">
          <button class="btn btn-primary" @click="confirmHandle">发表</button>
        </div>
      </div>
      <!-- 留言内容列表 -->
      <div class="mt-6 max-w-3xl mx-auto">
        <section v-for="item in msgboardList" :key="item.id" class="bg-base-100 mb-3 rounded">
          <div class="card card-compact card-side mb-3">
            <div class="card-body bg-base-100 rounded">
              <h2 class="card-title text-sm font-normal text-gray-400 flex">
                <div class="avatar h-7 w-7">
                  <div class="w-7 rounded-full bg-base-300" title="点击跳转他的主页！">
                    <a :href="item.address" target="_blank">
                      <img v-lazyImg="item.avatar">
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
                <div class="text-sm content">{{ replyItem.comment }}</div>

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
      <div
        class="modal transition duration-700 ease-in-out"
        :class="{ 'dialog-show': dialog }"
        @click.stop=""
      >
        <div class="modal-box relative">
          <label
            class="btn btn-sm btn-circle absolute right-2 top-2"
            @click="dialog = !dialog"
          >✕</label>
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
              <label for="link-add-modal" class="btn" @click="okHandle">确 认</label>
            </div>
          </div>
        </div>
      </div>
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
      background: var(--minor-bgc);
      padding: 8px 10px;
    }
  }
  .dialog-show {
    pointer-events: auto;
    visibility: visible;
    opacity: 1;
  }
</style>
