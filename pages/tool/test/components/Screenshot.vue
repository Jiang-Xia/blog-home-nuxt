<template>
  <div>
    <button @click="generatePdf">
      PDF
    </button>
    <button @click="capture">
      截图
    </button>
    <div ref="pdfContent" class="pdf-content">
      你的内容
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { captureHtmlElement } from '~/utils/dom-capture';
import { loadScreenshotScripts } from '~/utils/script-loader';

const pdfContent = ref(null);

const capture = async () => {
  try {
    const dataUrl = await captureHtmlElement(pdfContent.value, {
      scale: 2,
    });

    const link = document.createElement('a');
    link.download = 'screenshot.png';
    link.href = dataUrl;
    link.click();
  }
  catch (error) {
    console.error('截图失败:', error);
  }
};

const generatePdf = async () => {
  if (typeof window !== 'undefined' && pdfContent.value) {
    html2pdf()
      .set({
        filename: 'report.pdf',
        pagebreak: { mode: 'avoid-all' },
      })
      .from(pdfContent.value)
      .save();
  }
};

onMounted(async () => {
  await loadScreenshotScripts();
});
</script>

<style>
  .pdf-content {
    margin: 0 auto;
    background: white;
  }
</style>
