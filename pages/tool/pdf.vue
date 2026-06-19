<!--
  PDF 电子签名工具页：预览 PDF、倒计时后手写签名，合成印章与日期并下载。
  默认示例 PDF 来自站点静态资源；支持 ?file= 远程 URL 或本地上传。
-->
<template>
  <div class="mx-auto w-full max-w-3xl space-y-4">
    <CyberToolCard
      title="PDF 电子签名"
      desc="在线预览 PDF，阅读确认后手写签名，自动叠加印章与日期并下载"
    >
      <template #icon>
        <xia-icon icon="blog-pdf1" width="22px" height="22px" />
      </template>

      <ol class="mb-4 flex flex-wrap gap-2 text-xs">
        <li class="rounded-full border border-tech bg-tech-header px-3 py-1 text-tech-muted">
          1. 选择 PDF
        </li>
        <li class="rounded-full border border-tech bg-tech-header px-3 py-1 text-tech-muted">
          2. 阅读并倒计时
        </li>
        <li class="rounded-full border border-tech bg-tech-header px-3 py-1 text-tech-muted">
          3. 手写签名并下载
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

    <CyberToolCard title="预览与签名" desc="滚动阅读全文，倒计时结束后即可签名">
      <xia-signature :key="pdfKey" :pdf-src="pdfSrc" @success="successHandle" />
    </CyberToolCard>
  </div>
</template>

<script setup lang="ts">
import { downloadFile, resolveStaticUrl } from '@/utils/common';
import { messageSuccess } from '@/utils/toast';

/** 站点静态示例 PDF（开发走 localhost:5000，生产走网关） */
const DEMO_PDF_PATH = '/static/uploads/2024-03/eqiic4bsyyu39pd95y7e7h-保证书（不可撤消）.pdf';
const DEMO_PDF_SRC = resolveStaticUrl(DEMO_PDF_PATH);

const route = useRoute();
const pdfSrc = ref(DEMO_PDF_SRC);
const pdfKey = ref(0);
const usingCustomPdf = ref(false);
const hintText = ref('');
const sourceLabel = ref('示例保证书');

let objectUrl: string | null = null;

/** 解析 ?file= 查询参数为初始 PDF 地址 */
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
  hintText.value = '';
};

/** 签名完成后触发浏览器下载 */
const successHandle = (blob: Blob) => {
  const url = URL.createObjectURL(blob);
  downloadFile(url, '已签名文件.pdf');
  URL.revokeObjectURL(url);
  messageSuccess('已签名 PDF 开始下载');
};

initFromQuery();

onBeforeUnmount(() => {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
  }
});
</script>
