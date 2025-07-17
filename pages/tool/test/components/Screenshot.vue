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
import { ref } from 'vue';

const pdfContent = ref(null);
const capture = async () => {
  try {
    console.log(html2canvas, pdfContent.value);
    const canvas = await html2canvas(pdfContent.value, {
      useCORS: true, // 允许跨域图片
      scale: 2, // 提高分辨率
    });

    // 转换为图片并下载
    const link = document.createElement('a');
    link.download = 'screenshot.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
  catch (error) {
    console.error('截图失败:', error);
  }
};
const generatePdf = async () => {
  if (typeof window !== 'undefined') {
    console.log('html2pdf', pdfContent.value);
    const canvas = await html2canvas(pdfContent.value, {
      scale: 2,
      useCORS: true, // 解决图片跨域
    });

    html2pdf()
      .set({
        filename: 'report.pdf',
        pagebreak: { mode: 'avoid-all' },
      })
      .from(canvas)
      .save();
  }
};
</script>

<style>
  .pdf-content {
    width: 210mm; /* A4 宽度 */
    min-height: 297mm; /* A4 高度 */
    margin: 0 auto;
    background: white;
  }
</style>
