<script setup lang="ts">
/**
   * 用户文章编辑表单 - 新增与编辑共用
   * - 草稿 localStorage autosave（debounce 3s）
   * - 发布成功展示 Cyber 结果面板；离开页 RPG 确认弹窗
   */
import { computed, nextTick, onMounted, reactive, ref, watch, onBeforeUnmount } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { useDebounceFn } from '@vueuse/core';
import { MdEditor } from 'md-editor-v3';
import dayjs from 'dayjs';
import { createArticle, editArticle, getArticleInfo, uploadArticleImage } from '@/api/article';
import { getAllCategory } from '@/api/category';
import { getAllTag } from '@/api/tag';
import { uploadCover, parseUploadedUrl } from '@/api/resources';
import { resolveStaticUrl } from '@/utils/static-url';
import { messageDanger, messageSuccess } from '@/utils/toast';
import { useRpgModal } from '@/composables/use-rpg-modal';
import { COVER_IMAGE, coverAspectRatio } from '@/utils/image-compress';

const props = defineProps<{
  articleId?: string;
}>();

const emit = defineEmits<{
  saved: [];
}>();

const router = useRouter();
const { confirm } = useRpgModal();
const { playSfx } = useRpgAudio();
const mdEditorTheme = useMdEditorTheme();
const loading = ref(false);
const submitting = ref(false);
const categoryOptions = ref<any[]>([]);
const tagsOptions = ref<any[]>([]);
const coverError = ref(false);
const coverUploading = ref(false);
const publishSuccess = ref<{ id: number; title: string } | null>(null);
const draftRestored = ref(false);
const isDirty = ref(false);
const mdEditorRef = ref<{ $el?: HTMLElement } | null>(null);
let mdEditorFullscreenObserver: MutationObserver | null = null;

/** 同步 md-editor 网页全屏状态，全屏时隐藏站点顶栏避免遮挡工具栏 */
function syncArticleEditorPageFullscreen() {
  if (!import.meta.client) return;
  const root = mdEditorRef.value?.$el;
  const active = Boolean(root?.classList?.contains('md-editor-fullscreen'));
  document.body.classList.toggle('article-editor-page-fs', active);
}

function bindMdEditorFullscreenObserver() {
  mdEditorFullscreenObserver?.disconnect();
  const root = mdEditorRef.value?.$el;
  if (!root) return;
  syncArticleEditorPageFullscreen();
  mdEditorFullscreenObserver = new MutationObserver(syncArticleEditorPageFullscreen);
  mdEditorFullscreenObserver.observe(root, { attributes: true, attributeFilter: ['class'] });
}

watch(mdEditorRef, () => nextTick(bindMdEditorFullscreenObserver));

/** localStorage 草稿 key；新建与编辑分 key 存储 */
const draftStorageKey = computed(() => `draft:${props.articleId || 'new'}`);

/** 表单变更 debounce 写入本地草稿，防止意外丢失 */
const saveDraftToLocal = useDebounceFn(() => {
  if (!import.meta.client || publishSuccess.value) return;
  localStorage.setItem(
    draftStorageKey.value,
    JSON.stringify({ ...formState, savedAt: Date.now() }),
  );
}, 3000);

/** 清除本地草稿（发布/保存成功后调用） */
const clearLocalDraft = () => {
  if (import.meta.client) {
    localStorage.removeItem(draftStorageKey.value);
  }
};

/** 新建文章时尝试恢复 localStorage 草稿 */
const tryRestoreDraft = () => {
  if (!import.meta.client || props.articleId) return;
  const raw = localStorage.getItem(draftStorageKey.value);
  if (!raw) return;
  try {
    const draft = JSON.parse(raw);
    if (draft.title || draft.content) {
      Object.assign(formState, { ...defaultForm, ...draft });
      draftRestored.value = true;
    }
  }
  catch {
    // ignore invalid draft
  }
};

/** 关闭标签页/刷新时浏览器原生拦截（无法用自定义 Modal） */
const onBeforeUnload = (e: BeforeUnloadEvent) => {
  if (isDirty.value && !submitting.value && !publishSuccess.value) {
    e.preventDefault();
    e.returnValue = '';
  }
};

const tagToRgb = (color: string, alpha = 0.24) => {
  if (!color?.startsWith('#') || color.length < 7) return 'transparent';
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const isEdit = computed(() => !!props.articleId);

interface FormState {
  title: string;
  description: string;
  content: string;
  contentHtml: string;
  category: string;
  cover: string;
  tags: number[];
  status: 'publish' | 'draft' | 'scheduled';
  scheduledPublishAt: string;
}

const defaultForm: FormState = {
  title: '',
  description: '',
  content: '**哈喽！有什么灵感的话赶紧写下来吧~**',
  contentHtml: '',
  category: '',
  cover: '',
  tags: [],
  status: 'publish',
  scheduledPublishAt: '',
};

const formState = reactive<FormState>({ ...defaultForm });

watch(
  formState,
  () => {
    isDirty.value = true;
    saveDraftToLocal();
  },
  { deep: true },
);

const submitLabel = computed(() => {
  if (formState.status === 'draft') return '保存草稿';
  if (formState.status === 'scheduled') return '定时发布';
  return '发布文章';
});

const coverPreviewUrl = computed(() => resolveStaticUrl(formState.cover));

const loadOptions = async () => {
  const [categories, tags] = await Promise.all([getAllCategory(), getAllTag()]);
  categoryOptions.value = categories || [];
  tagsOptions.value = tags || [];
};

const loadArticle = async () => {
  if (!props.articleId) return;
  loading.value = true;
  try {
    const res = await getArticleInfo({ id: props.articleId });
    if (!res?.info) {
      messageDanger('文章不存在或已下线');
      router.push('/user/profile?tab=article');
      return;
    }
    const info = res.info;
    formState.title = info.title;
    formState.description = info.description;
    formState.content = info.content;
    formState.category = info.category?.id || '';
    formState.cover = info.cover || '';
    formState.tags = (info.tags || []).map((v: { id: number }) => v.id);
    formState.status = info.status || 'publish';
    formState.scheduledPublishAt = info.scheduledPublishAt
      ? dayjs(info.scheduledPublishAt).format('YYYY-MM-DDTHH:mm')
      : '';
    coverError.value = false;
  }
  catch {
    messageDanger('加载文章失败');
    router.push('/user/profile?tab=article');
  }
  finally {
    loading.value = false;
  }
};

const validateForm = () => {
  if (!formState.title.trim()) {
    messageDanger('请填写标题');
    return false;
  }
  if (!formState.description.trim()) {
    messageDanger('请填写描述');
    return false;
  }
  if (!formState.cover.trim()) {
    messageDanger('请填写封面链接');
    return false;
  }
  if (!formState.category) {
    messageDanger('请选择分类');
    return false;
  }
  if (!formState.tags.length) {
    messageDanger('请至少选择一个标签');
    return false;
  }
  if (!formState.content.trim()) {
    messageDanger('请填写正文内容');
    return false;
  }
  if (formState.status === 'scheduled' && !formState.scheduledPublishAt) {
    messageDanger('请选择定时发布时间');
    return false;
  }
  return true;
};

/** 即时发布成功时播放 contentPost（推进发文任务） */
const playPublishSfxIfNeeded = () => {
  if (formState.status === 'publish') {
    void playSfx('contentPost');
  }
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  submitting.value = true;
  try {
    const params: Record<string, unknown> = {
      title: formState.title.trim(),
      description: formState.description.trim(),
      content: formState.content,
      contentHtml: formState.contentHtml,
      category: formState.category,
      cover: formState.cover.trim(),
      tags: formState.tags,
      status: formState.status,
      scheduledPublishAt:
          formState.status === 'scheduled'
            ? dayjs(formState.scheduledPublishAt).format('YYYY-MM-DD HH:mm:ss')
            : null,
    };

    if (isEdit.value) {
      params.id = Number(props.articleId);
      await editArticle(params);
      messageSuccess('文章更新成功');
      // 即时发布：展示成功面板，不跳转 profile
      if (formState.status === 'publish') {
        playPublishSfxIfNeeded();
        publishSuccess.value = { id: Number(props.articleId), title: formState.title.trim() };
        clearLocalDraft();
        isDirty.value = false;
        return;
      }
    }
    else {
      const created = await createArticle(params);
      const newId = created?.id ?? created?.info?.id;
      messageSuccess('文章创建成功');
      // 新建并发布：展示成功面板，保留在当前页便于复制链接
      if (formState.status === 'publish' && newId) {
        playPublishSfxIfNeeded();
        publishSuccess.value = { id: Number(newId), title: formState.title.trim() };
        clearLocalDraft();
        isDirty.value = false;
        return;
      }
    }

    clearLocalDraft();
    isDirty.value = false;
    emit('saved');
    router.push('/user/profile?tab=article');
  }
  catch {
    // 请求失败由全局拦截器处理
  }
  finally {
    submitting.value = false;
  }
};

const resetForm = () => {
  Object.assign(formState, { ...defaultForm });
  coverError.value = false;
};

const onHtmlChanged = (html: string) => {
  formState.contentHtml = html;
};

const onUploadImg = async (files: File[], callback: (urls: string[]) => void) => {
  try {
    const urls = await Promise.all(files.map(file => uploadArticleImage(file)));
    callback(urls);
  }
  catch {
    messageDanger('图片上传失败');
  }
};

const onCoverFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  coverUploading.value = true;
  try {
    const res = await uploadCover(file, formState.cover);
    formState.cover = parseUploadedUrl(res);
    coverError.value = false;
  }
  catch {
    messageDanger('封面上传失败');
  }
  finally {
    coverUploading.value = false;
    input.value = '';
  }
};

const toggleTag = (id: number) => {
  const index = formState.tags.indexOf(id);
  if (index >= 0) {
    formState.tags.splice(index, 1);
  }
  else {
    formState.tags.push(id);
  }
};

const onCoverInput = () => {
  coverError.value = false;
};

const onCoverError = () => {
  coverError.value = true;
};

onMounted(async () => {
  tryRestoreDraft();
  await loadOptions();
  if (isEdit.value) {
    await loadArticle();
    isDirty.value = false;
  }
  if (import.meta.client) {
    window.addEventListener('beforeunload', onBeforeUnload);
  }
});

onBeforeUnmount(() => {
  mdEditorFullscreenObserver?.disconnect();
  mdEditorFullscreenObserver = null;
  if (import.meta.client) {
    window.removeEventListener('beforeunload', onBeforeUnload);
    document.body.classList.remove('article-editor-page-fs');
  }
});

/** 站内路由离开：未保存时用 RPG 确认弹窗 */
onBeforeRouteLeave(async () => {
  if (isDirty.value && !submitting.value && !publishSuccess.value) {
    return await confirm({
      title: '未保存的修改',
      description: '有未保存的修改，确定离开吗？离开后当前修改将丢失。',
      confirmLabel: '确定离开',
      cancelLabel: '继续编辑',
      confirmColor: 'warning',
    });
  }
  return true;
});

/** 复制已发布文章详情页链接 */
const copyPublishedLink = async () => {
  if (!publishSuccess.value || !import.meta.client) return;
  const url = `${window.location.origin}/detail/${publishSuccess.value.id}`;
  try {
    await navigator.clipboard.writeText(url);
    messageSuccess('链接已复制');
  }
  catch {
    messageSuccess(url);
  }
};
</script>

<template>
  <div class="article-edit-form px-4 pt-5 pb-0 sm:px-6 sm:pt-6">
    <div v-if="publishSuccess" class="publish-success">
      <div class="publish-success__glow" aria-hidden="true" />
      <div class="publish-success__card">
        <div class="publish-success__badge" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <p class="cyber-section-label publish-success__label">
          PUBLISHED
        </p>
        <h2 class="publish-success__title">
          发布成功
        </h2>
        <p class="publish-success__desc">
          文章已上线，读者现在可以阅读了
        </p>
        <div class="publish-success__article">
          <xia-icon icon="blog-open-book" width="15px" />
          <span class="truncate">{{ publishSuccess.title }}</span>
        </div>
        <div class="publish-success__actions">
          <CyberButton
            :to="`/detail/${publishSuccess.id}`"
            variant="primary"
            class="publish-success__btn"
          >
            查看文章
          </CyberButton>
          <CyberButton variant="secondary" class="publish-success__btn" @click="copyPublishedLink">
            复制链接
          </CyberButton>
          <CyberButton
            to="/user/profile?tab=article"
            variant="secondary"
            class="publish-success__btn"
          >
            我的文章
          </CyberButton>
        </div>
      </div>
    </div>

    <div v-else-if="loading" class="space-y-3">
      <div class="skeleton h-8 w-full rounded-md" />
      <div class="skeleton h-14 w-full rounded-md" />
      <div class="skeleton h-56 w-full rounded-md" />
    </div>

    <template v-else>
      <div
        v-if="draftRestored"
        class="mb-4 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-tech-muted"
      >
        已恢复本地草稿，继续编辑或保存即可。
      </div>

      <form class="flex flex-col" @submit.prevent="handleSubmit">
        <!-- 基本信息 -->
        <section class="pb-5 mb-5 border-b border-base-300/60 space-y-3">
          <h2 class="text-xs font-bold uppercase tracking-wider text-base-content/50 m-0">
            基本信息
          </h2>
          <div class="form-grid-2">
            <label class="form-control">
              <span
                class="flex items-center gap-1.5 text-[0.8125rem] font-semibold text-base-content/80 mb-1.5"
              >
                标题 <em class="text-error not-italic">*</em>
              </span>
              <input
                v-model="formState.title"
                type="text"
                class="input input-bordered w-full"
                placeholder="给文章起个吸引人的标题"
              >
            </label>
            <label class="form-control">
              <span
                class="flex items-center gap-1.5 text-[0.8125rem] font-semibold text-base-content/80 mb-1.5"
              >
                分类 <em class="text-error not-italic">*</em>
              </span>
              <select v-model="formState.category" class="select select-bordered w-full">
                <option disabled value=""> 选择分类 </option>
                <option v-for="item in categoryOptions" :key="item.id" :value="item.id">
                  {{ item.label }}
                </option>
              </select>
            </label>
          </div>

          <label class="form-control">
            <span
              class="flex items-center gap-1.5 text-[0.8125rem] font-semibold text-base-content/80 mb-1.5"
            >
              描述 <em class="text-error not-italic">*</em>
            </span>
            <textarea
              v-model="formState.description"
              class="textarea textarea-bordered w-full min-h-16 py-2.5"
              rows="2"
              placeholder="列表页展示的简短描述，建议 50～120 字"
            />
          </label>
        </section>

        <!-- 封面与标签 -->
        <section class="pb-5 mb-5 border-b border-base-300/60 space-y-3">
          <h2 class="text-xs font-bold uppercase tracking-wider text-base-content/50 m-0">
            封面与标签
          </h2>
          <div class="form-grid-cover">
            <label class="form-control min-w-0">
              <span
                class="flex items-center gap-1.5 text-[0.8125rem] font-semibold text-base-content/80 mb-1.5"
              >
                封面 <em class="text-error not-italic">*</em>
              </span>
              <div class="flex flex-wrap items-center gap-2">
                <input
                  v-model="formState.cover"
                  type="url"
                  class="input input-bordered w-full min-w-0 flex-1"
                  placeholder="上传或粘贴封面链接"
                  @input="onCoverInput"
                >
                <label class="btn btn-outline btn-sm shrink-0 cursor-pointer">
                  <span v-if="coverUploading" class="loading loading-spinner loading-xs" />
                  <span v-else>上传封面</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    class="hidden"
                    :disabled="coverUploading"
                    @change="onCoverFileChange"
                  >
                </label>
              </div>
              <span class="block mt-1.5 text-[0.6875rem] text-base-content/45">建议 {{ COVER_IMAGE.maxWidth }}×{{ COVER_IMAGE.maxHeight }}（Open Graph
                分享图），上传后自动裁剪压缩</span>
            </label>
            <figure
              class="cover-thumb rounded-lg overflow-hidden shrink-0 border border-dashed transition-colors"
              :class="coverError ? 'border-error/50 bg-error/5' : 'border-base-300 bg-base-200/50'"
            >
              <img
                v-if="formState.cover && !coverError"
                :src="coverPreviewUrl"
                alt="封面预览"
                class="object-cover w-full h-full"
                @error="onCoverError"
              >
              <span
                v-else
                class="flex flex-col items-center justify-center gap-1.5 w-full h-full text-[0.6875rem] text-base-content/35"
              >
                <svg
                  v-if="!coverError"
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-6 h-6 opacity-45"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="1.5"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022 18.75V5.25A2.25 2.25 0 0019.75 3H4.25A2.25 2.25 0 002 5.25v13.5A2.25 2.25 0 004.25 21z"
                  />
                </svg>
                <span>{{ coverError ? '链接无效' : '封面预览' }}</span>
              </span>
            </figure>
          </div>

          <div class="form-control">
            <span
              class="flex items-center gap-1.5 text-[0.8125rem] font-semibold text-base-content/80 mb-1.5"
            >
              标签 <em class="text-error not-italic">*</em>
              <span class="text-[0.6875rem] font-medium text-base-content/45">已选 {{ formState.tags.length }} 个</span>
            </span>
            <div class="flex flex-wrap gap-2 max-h-[88px] overflow-y-auto py-0.5">
              <button
                v-for="item in tagsOptions"
                :key="item.id"
                type="button"
                class="badge badge-outline badge-sm cursor-pointer transition-colors"
                :style="{
                  borderColor: item.color,
                  color: formState.tags.includes(item.id)
                    ? 'var(--color-primary-content)'
                    : item.color,
                  backgroundColor: formState.tags.includes(item.id)
                    ? item.color
                    : tagToRgb(item.color),
                }"
                @click="toggleTag(item.id)"
              >
                {{ item.label }}
              </button>
            </div>
          </div>
        </section>

        <!-- 正文 -->
        <section class="pb-4 space-y-3">
          <h2 class="text-xs font-bold uppercase tracking-wider text-base-content/50 m-0">
            正文内容
          </h2>
          <ClientOnly>
            <div class="article-md-editor-wrap rounded-lg border border-base-300 shadow-inner">
              <MdEditor
                ref="mdEditorRef"
                v-model="formState.content"
                class="x-md-editor article-md-editor"
                :theme="mdEditorTheme"
                @on-html-changed="onHtmlChanged"
                @on-upload-img="onUploadImg"
              />
            </div>
          </ClientOnly>
        </section>

        <!-- 发布 + 操作 -->
        <div
          class="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 -mx-4 px-4 py-3 sm:-mx-6 sm:px-6 sm:py-3.5 border-t border-base-300/80 bg-base-100/95 backdrop-blur-sm"
        >
          <div class="flex flex-wrap items-center gap-2.5">
            <span class="text-xs font-semibold text-base-content/55 shrink-0">发布方式</span>
            <div role="tablist" class="tabs tabs-boxed tabs-sm h-9 p-0.5 bg-base-200/80">
              <button
                type="button"
                role="tab"
                class="tab tab-sm px-3 min-h-0 h-full"
                :class="{ 'tab-active': formState.status === 'publish' }"
                @click="formState.status = 'publish'"
              >
                立即发布
              </button>
              <button
                type="button"
                role="tab"
                class="tab tab-sm px-3 min-h-0 h-full"
                :class="{ 'tab-active': formState.status === 'draft' }"
                @click="formState.status = 'draft'"
              >
                草稿
              </button>
              <button
                type="button"
                role="tab"
                class="tab tab-sm px-3 min-h-0 h-full"
                :class="{ 'tab-active': formState.status === 'scheduled' }"
                @click="formState.status = 'scheduled'"
              >
                定时
              </button>
            </div>
            <input
              v-if="formState.status === 'scheduled'"
              v-model="formState.scheduledPublishAt"
              type="datetime-local"
              class="input input-bordered input-sm w-48"
            >
          </div>
          <div class="flex items-center gap-1.5 ml-auto">
            <NuxtLink to="/user/profile?tab=article" class="btn btn-ghost btn-sm"> 取消 </NuxtLink>
            <button v-if="!isEdit" type="button" class="btn btn-ghost btn-sm" @click="resetForm">
              重置
            </button>
            <button type="submit" class="btn btn-primary btn-sm min-w-24" :disabled="submitting">
              <span v-if="submitting" class="loading loading-spinner loading-xs" />
              {{ submitLabel }}
            </button>
          </div>
        </div>
      </form>
    </template>
  </div>
</template>

<style scoped>
  .form-grid-2 {
    display: grid;
    gap: 12px;
    grid-template-columns: 1fr;
  }

  @media (min-width: 640px) {
    .form-grid-2 {
      grid-template-columns: 1fr 200px;
    }
  }

  .form-grid-cover {
    display: grid;
    gap: 12px;
    grid-template-columns: 1fr;
    align-items: start;
  }

  @media (min-width: 640px) {
    .form-grid-cover {
      grid-template-columns: 1fr 140px;
      align-items: end;
    }
  }

  .cover-thumb {
    width: 100%;
    aspect-ratio: v-bind(coverAspectRatio);
  }

  @media (min-width: 640px) {
    .cover-thumb {
      width: 140px;
    }
  }

  .article-md-editor {
    height: 400px;
    border: none !important;
  }

  @media (min-width: 768px) {
    .article-md-editor {
      height: min(680px, calc(100vh - 300px));
      min-height: 520px;
    }
  }

  @media (min-width: 1280px) {
    .article-md-editor {
      height: min(760px, calc(100vh - 280px));
      min-height: 560px;
    }
  }

  .article-md-editor :deep(.md-editor) {
    border: none;
    border-radius: 0;
    height: 100%;
  }

  .article-md-editor :deep(.md-editor-toolbar-wrapper) {
    padding: 6px 8px;
    border-bottom: 1px solid color-mix(in oklab, var(--color-base-300) 60%, transparent);
  }

  .publish-success {
    position: relative;
    margin-bottom: 1.25rem;
  }

  .publish-success__glow {
    pointer-events: none;
    position: absolute;
    inset: -0.5rem;
    border-radius: 1.75rem;
    background:
      radial-gradient(
        circle at 20% 20%,
        color-mix(in oklch, var(--color-primary) 18%, transparent),
        transparent 55%
      ),
      radial-gradient(
        circle at 80% 0%,
        color-mix(in oklch, var(--color-secondary) 14%, transparent),
        transparent 50%
      );
    filter: blur(8px);
  }

  .publish-success__card {
    position: relative;
    overflow: hidden;
    border-radius: 1.5rem;
    border: 1px solid var(--tech-border);
    background: var(--color-base-200);
    padding: 2rem 1.25rem 1.5rem;
    text-align: center;
    box-shadow:
      0 0 0 1px color-mix(in oklch, var(--color-primary) 12%, transparent),
      0 18px 40px color-mix(in oklch, var(--color-base-content) 12%, transparent);
  }

  .publish-success__card::before {
    content: '';
    position: absolute;
    inset: 0 auto auto 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(
      to right,
      var(--tech-gradient-from),
      var(--tech-gradient-mid),
      var(--tech-gradient-to)
    );
  }

  .publish-success__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 3.5rem;
    height: 3.5rem;
    margin-bottom: 0.875rem;
    border-radius: 999px;
    border: 1px solid color-mix(in oklch, var(--color-success) 35%, var(--tech-border));
    background: color-mix(in oklch, var(--color-success) 12%, var(--color-base-200));
    color: var(--color-success);
    box-shadow: 0 0 24px color-mix(in oklch, var(--color-success) 22%, transparent);
  }

  .publish-success__label {
    margin-bottom: 0.375rem;
  }

  .publish-success__title {
    font-size: 1.375rem;
    font-weight: 700;
    line-height: 1.3;
    background: linear-gradient(
      to right,
      var(--tech-gradient-from),
      var(--tech-gradient-mid),
      var(--tech-gradient-to)
    );
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .publish-success__desc {
    margin-top: 0.5rem;
    font-size: 0.8125rem;
    color: var(--tech-muted, var(--tech-fg-muted));
  }

  .publish-success__article {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    max-width: 100%;
    margin-top: 1rem;
    border-radius: 0.75rem;
    border: 1px solid var(--tech-border);
    background: var(--color-base-100);
    padding: 0.5rem 0.875rem;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--tech-fg);
  }

  .publish-success__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.625rem;
    margin-top: 1.25rem;
  }

  .publish-success__btn {
    min-width: 7.5rem;
  }
</style>
