<template>
  <CyberToolCard title="PDF 电子签名" desc="在线预览 PDF 并添加电子签名后下载">
    <div class="flex justify-center overflow-hidden">
      <div class="w-full md:w-3/5">
        <xia-signature :pdf-src="pdfSrc" @success="successHandle" />
      </div>
    </div>
  </CyberToolCard>
</template>

<script setup lang="ts">
import { downloadFile } from '@/utils/common';

const route = useRoute();
const defaultPdfSrc
  = 'https://jiang-xia.top/x-blog/api/v1/static/uploads/2024-03/eqiic4bsyyu39pd95y7e7h-保证书（不可撤消）.pdf';
const pdfSrc = (route.query.file as string) || defaultPdfSrc;
const successHandle = (res: Blob) => {
  const url = URL.createObjectURL(res);
  downloadFile(url, '已签名文件.pdf');
};
</script>
