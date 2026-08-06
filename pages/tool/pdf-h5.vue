<!--
  H5 协议签署工具页：移动端协议阅读 + 倒计时 + 手写签名（xia-agreement-sign）。
  支持本地上传、?file= / ?title=；签署完成后下载 PDF。
-->
<template>
  <div class="mx-auto w-full max-w-3xl space-y-4">
    <CyberToolCard
      title="H5 协议签署"
      desc="模拟移动端协议页：滚至底部并倒计时后手写签名，自动叠加印章与日期"
    >
      <template #icon>
        <xia-icon icon="blog-pdf1" width="22px" height="22px" />
      </template>

      <ol class="mb-4 flex flex-wrap gap-2 text-xs">
        <li class="rounded-full border border-tech bg-tech-header px-3 py-1 text-tech-muted">
          1. 选择 PDF
        </li>
        <li class="rounded-full border border-tech bg-tech-header px-3 py-1 text-tech-muted">
          2. 滚到底部 + 倒计时
        </li>
        <li class="rounded-full border border-tech bg-tech-header px-3 py-1 text-tech-muted">
          3. 手写签署并下载
        </li>
      </ol>

      <div class="crypto-toolbar flex flex-wrap items-center gap-3">
        <input
          type="file"
          accept="application/pdf,.pdf"
          class="file-input file-input-bordered login-input max-w-xs"
          @change="onFilePick"
        >
        <CyberButton
          v-if="usingCustomPdf"
          variant="secondary"
          class="!py-2 !text-sm"
          @click="resetToDemo"
        >
          恢复示例
        </CyberButton>
      </div>

      <p v-if="hintText" class="mt-3 text-sm text-tech-muted">
        {{ hintText }}
      </p>
      <p v-else class="mt-3 text-xs text-tech-subtle">
        当前文档：{{ sourceLabel }}
      </p>
    </CyberToolCard>

    <CyberToolCard title="移动端预览" desc="下方为手机框内的签署组件，窄屏下自适应全宽">
      <div class="phone-shell mx-auto">
        <ClientOnly>
          <xia-agreement-sign
            :key="pdfKey"
            class="phone-body"
            :pdf-src="pdfSrc"
            :title="docTitle"
            subtitle="滚至底部并等待倒计时结束后签署"
            :second="10"
            @success="onSuccess"
          />
          <template #fallback>
            <div class="phone-body flex items-center justify-center text-sm text-tech-muted">
              加载中…
            </div>
          </template>
        </ClientOnly>
      </div>
    </CyberToolCard>
  </div>
</template>

<script setup lang="ts">
import { downloadFile } from '@/utils/common';
import { resolveStaticUrl } from '@/utils/static-url';
import { messageSuccess } from '@/utils/toast';

useSeoMeta({
  title: 'H5 协议签署',
  description: '移动端协议阅读与手写签署工具',
});

/** 站点静态示例 PDF */
const DEMO_PDF_PATH = '/static/uploads/2024-03/eqiic4bsyyu39pd95y7e7h-保证书（不可撤消）.pdf';
const DEMO_PDF_SRC = resolveStaticUrl(DEMO_PDF_PATH);

const route = useRoute();
const pdfSrc = ref(DEMO_PDF_SRC);
const pdfKey = ref(0);
const usingCustomPdf = ref(false);
const hintText = ref('');
const sourceLabel = ref('示例保证书');
const docTitle = ref('保证书（不可撤消）');

let objectUrl: string | null = null;

/** 解析 ?file= / ?title= 查询参数 */
const initFromQuery = () => {
  const queryFile = route.query.file;
  if (typeof queryFile === 'string' && queryFile.trim()) {
    pdfSrc.value = queryFile.startsWith('/static')
      ? resolveStaticUrl(queryFile.trim())
      : queryFile.trim();
    usingCustomPdf.value = true;
    sourceLabel.value = 'URL 参数指定';
    hintText.value = '当前使用 URL 参数指定的 PDF';
  }
  const queryTitle = route.query.title;
  if (typeof queryTitle === 'string' && queryTitle.trim()) {
    docTitle.value = queryTitle.trim();
  }
};

/** 用户选择本地 PDF 后切换预览源 */
const onFilePick = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) {
    return;
  }
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    hintText.value = '请选择 PDF 文件';
    input.value = '';
    return;
  }

  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
  }
  objectUrl = URL.createObjectURL(file);
  pdfSrc.value = objectUrl;
  usingCustomPdf.value = true;
  pdfKey.value += 1;
  sourceLabel.value = file.name;
  docTitle.value = file.name.replace(/\.pdf$/i, '') || '协议签署';
  hintText.value = `已加载本地文件：${file.name}`;
};

/** 恢复默认示例 PDF */
const resetToDemo = () => {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
    objectUrl = null;
  }
  pdfSrc.value = DEMO_PDF_SRC;
  usingCustomPdf.value = false;
  pdfKey.value += 1;
  sourceLabel.value = '示例保证书';
  docTitle.value = '保证书（不可撤消）';
  hintText.value = '';
};

/** 签署完成：下载已签 PDF */
const onSuccess = (blob: Blob) => {
  const url = URL.createObjectURL(blob);
  downloadFile(url, '已签署协议.pdf');
  URL.revokeObjectURL(url);
  messageSuccess('签署成功，开始下载');
};

initFromQuery();

onBeforeUnmount(() => {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
  }
});
</script>

<style lang="less" scoped>
  .phone-shell {
    width: 100%;
    max-width: 430px;
    height: min(720px, 75vh);
    overflow: hidden;
    border-radius: 16px;
    border: 1px solid var(--tech-border, #2a3140);
    background: #f5f6f8;
    box-shadow: 0 8px 32px rgb(0 0 0 / 18%);
  }

  .phone-body {
    height: 100%;
    min-height: 0;
  }

  @media (max-width: 480px) {
    .phone-shell {
      max-width: none;
      height: min(780px, 82vh);
      border-radius: 12px;
    }
  }
</style>
