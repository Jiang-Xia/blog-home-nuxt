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
import { originUrl } from '@/config';
import { messageDanger, messageSuccess } from '@/utils/toast';

const props = defineProps<{
  articleId?: string;
}>();

const emit = defineEmits<{
  saved: [];
}>();

const router = useRouter();
const theme = useTheme();
const loading = ref(false);
const submitting = ref(false);
const categoryOptions = ref<any[]>([]);
const tagsOptions = ref<any[]>([]);
const coverError = ref(false);

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

const resolveStaticUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (import.meta.env.MODE === 'production') {
    return `${originUrl}/x-api/blog-server${path}`;
  }
  return `${originUrl}${path}`;
};

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
    const results = await Promise.all(files.map(file => uploadArticleImage(file)));
    callback(
      results.map((item: any) => {
        const file = Array.isArray(item) ? item[0] : item?.data?.[0] || item;
        return resolveStaticUrl(file?.url || '');
      }),
    );
  }
  catch {
    messageDanger('图片上传失败');
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
  <div class="article-edit-form">
    <div v-if="loading" class="space-y-3">
      <div class="skeleton h-8 w-full rounded-md" />
      <div class="skeleton h-14 w-full rounded-md" />
      <div class="skeleton h-56 w-full rounded-md" />
    </div>

    <form v-else class="compact-form" @submit.prevent="handleSubmit">
      <!-- 基本信息：标题 + 分类同行 -->
      <div class="form-grid form-grid-2">
        <label class="form-control">
          <span class="field-label">标题 <em>*</em></span>
          <input
            v-model="formState.title"
            type="text"
            class="input input-bordered input-sm w-full"
            placeholder="文章标题"
          >
        </label>
        <label class="form-control">
          <span class="field-label">分类 <em>*</em></span>
          <select v-model="formState.category" class="select select-bordered select-sm w-full">
            <option disabled value=""> 选择分类 </option>
            <option v-for="item in categoryOptions" :key="item.id" :value="item.id">
              {{ item.label }}
            </option>
          </select>
        </label>
      </div>

      <label class="form-control">
        <span class="field-label">描述 <em>*</em></span>
        <textarea
          v-model="formState.description"
          class="textarea textarea-bordered textarea-sm w-full min-h-14 py-2"
          rows="2"
          placeholder="列表页展示的简短描述"
        />
      </label>

      <!-- 封面：链接 + 小预览 -->
      <div class="form-grid form-grid-cover">
        <label class="form-control min-w-0">
          <span class="field-label">封面链接 <em>*</em></span>
          <input
            v-model="formState.cover"
            type="url"
            class="input input-bordered input-sm w-full"
            placeholder="https://..."
            @input="onCoverInput"
          >
        </label>
        <figure class="cover-thumb">
          <img
            v-if="formState.cover && !coverError"
            :src="formState.cover"
            alt="封面"
            class="object-cover w-full h-full"
            @error="onCoverError"
          >
          <span v-else class="cover-thumb-placeholder text-base-content/30">
            {{ coverError ? '无效' : '预览' }}
          </span>
        </figure>
      </div>

      <!-- 标签 -->
      <div class="form-control">
        <span class="field-label">标签 <em>*</em>
          <span class="text-base-content/40 font-normal">({{ formState.tags.length }})</span></span>
        <div class="tag-list">
          <button
            v-for="item in tagsOptions"
            :key="item.id"
            type="button"
            class="badge badge-sm cursor-pointer"
            :class="formState.tags.includes(item.id) ? 'badge-primary' : 'badge-ghost'"
            @click="toggleTag(item.id)"
          >
            {{ item.label }}
          </button>
        </div>
      </div>

      <!-- 正文 -->
      <div class="form-control">
        <span class="field-label">正文 <em>*</em></span>
        <ClientOnly>
          <div class="editor-wrap">
            <MdEditor
              v-model="formState.content"
              class="x-md-editor article-md-editor"
              :theme="theme === 'dark' ? 'dark' : 'light'"
              @on-html-changed="onHtmlChanged"
              @on-upload-img="onUploadImg"
            />
          </div>
        </ClientOnly>
      </div>

      <!-- 发布 + 操作：同一行 -->
      <div class="publish-bar">
        <div class="publish-left">
          <div role="tablist" class="tabs tabs-bordered tabs-xs h-8 p-0.5">
            <button
              type="button"
              role="tab"
              class="tab tab-xs px-2"
              :class="{ 'tab-active': formState.status === 'publish' }"
              @click="formState.status = 'publish'"
            >
              发布
            </button>
            <button
              type="button"
              role="tab"
              class="tab tab-xs px-2"
              :class="{ 'tab-active': formState.status === 'draft' }"
              @click="formState.status = 'draft'"
            >
              草稿
            </button>
            <button
              type="button"
              role="tab"
              class="tab tab-xs px-2"
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
            class="input input-bordered input-xs w-44"
          >
        </div>
        <div class="publish-actions">
          <NuxtLink to="/user/profile?tab=article" class="btn btn-ghost btn-xs"> 取消 </NuxtLink>
          <button v-if="!isEdit" type="button" class="btn btn-ghost btn-xs" @click="resetForm">
            重置
          </button>
          <button type="submit" class="btn btn-primary btn-xs min-w-20" :disabled="submitting">
            <span v-if="submitting" class="loading loading-spinner loading-xs" />
            {{ submitLabel }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped>
  .compact-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .field-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
    color: oklch(var(--bc) / 0.75);
    margin-bottom: 4px;
  }

  .field-label em {
    color: oklch(var(--er));
    font-style: normal;
  }

  .form-grid {
    display: grid;
    gap: 10px;
  }

  .form-grid-2 {
    grid-template-columns: 1fr;
  }

  @media (min-width: 640px) {
    .form-grid-2 {
      grid-template-columns: 1fr 180px;
    }
  }

  .form-grid-cover {
    grid-template-columns: 1fr 96px;
    align-items: end;
    gap: 8px;
  }

  .cover-thumb {
    width: 96px;
    height: 54px;
    border-radius: 6px;
    overflow: hidden;
    background: oklch(var(--b3) / 0.4);
    border: 1px solid oklch(var(--b3));
    flex-shrink: 0;
  }

  .cover-thumb-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-size: 0.65rem;
  }

  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    max-height: 72px;
    overflow-y: auto;
    padding: 2px 0;
  }

  .editor-wrap {
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid oklch(var(--b3));
  }

  .article-md-editor {
    min-height: 280px;
    border: none !important;
  }

  .article-md-editor :deep(.md-editor) {
    border: none;
    border-radius: 0;
  }

  .article-md-editor :deep(.md-editor-toolbar-wrapper) {
    padding: 4px 6px;
  }

  .publish-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding-top: 6px;
    border-top: 1px solid oklch(var(--b3) / 0.6);
  }

  .publish-left {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .publish-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-left: auto;
  }
</style>
