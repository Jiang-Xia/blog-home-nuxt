<script setup lang="ts">
/**
   * 用户文章编辑表单 - 新增与编辑共用
   */
import { computed, onMounted, reactive, ref } from 'vue';
import { MdEditor } from 'md-editor-v3';
import dayjs from 'dayjs';
import { createArticle, editArticle, getArticleInfo, uploadArticleImage } from '@/api/article';
import { getAllCategory } from '@/api/category';
import { getAllTag } from '@/api/tag';
import { uploadCover, parseUploadedUrl } from '@/api/resources';
import { resolveStaticUrl } from '@/utils/common';
import { messageDanger, messageSuccess } from '@/utils/toast';

const props = defineProps<{
  articleId?: string;
}>();

const emit = defineEmits<{
  saved: [];
}>();

const router = useRouter();
const mdEditorTheme = useMdEditorTheme();
const loading = ref(false);
const submitting = ref(false);
const categoryOptions = ref<any[]>([]);
const tagsOptions = ref<any[]>([]);
const coverError = ref(false);
const coverUploading = ref(false);

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
    }
    else {
      await createArticle(params);
      messageSuccess('文章创建成功');
    }

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
    const res = await uploadCover(file);
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
  await loadOptions();
  if (isEdit.value) {
    await loadArticle();
  }
});
</script>

<template>
  <div class="article-edit-form px-4 pt-5 pb-0 sm:px-6 sm:pt-6">
    <div v-if="loading" class="space-y-3">
      <div class="skeleton h-8 w-full rounded-md" />
      <div class="skeleton h-14 w-full rounded-md" />
      <div class="skeleton h-56 w-full rounded-md" />
    </div>

    <form v-else class="flex flex-col" @submit.prevent="handleSubmit">
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
            <span class="block mt-1.5 text-[0.6875rem] text-base-content/45">建议 16:9，上传后自动压缩</span>
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
          <div class="rounded-lg overflow-hidden border border-base-300 shadow-inner">
            <MdEditor
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
    aspect-ratio: 16 / 9;
  }

  @media (min-width: 640px) {
    .cover-thumb {
      width: 140px;
    }
  }

  .article-md-editor {
    min-height: 360px;
    border: none !important;
  }

  .article-md-editor :deep(.md-editor) {
    border: none;
    border-radius: 0;
  }

  .article-md-editor :deep(.md-editor-toolbar-wrapper) {
    padding: 6px 8px;
    border-bottom: 1px solid color-mix(in oklab, var(--color-base-300) 60%, transparent);
  }
</style>
