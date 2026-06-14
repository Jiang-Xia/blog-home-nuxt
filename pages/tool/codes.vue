<template>
  <div class="flex flex-wrap justify-around gap-4">
    <div
      class="mt-4 card w-96 border border-tech bg-[var(--tech-input-bg)] shadow-xl rounded-2xl text-tech"
    >
      <div class="card-body">
        <h2 class="card-title text-tech">
          条形码
        </h2>
        <div class="card-actions">
          <div class="join w-full">
            <input
              v-model="barcodeVal"
              class="input w-full input-bordered join-item"
              placeholder="text"
            >
            <button class="btn join-item" @click="createBarcode(1)">
              测试
            </button>
            <button class="btn join-item" @click="createBarcode()">
              生成
            </button>
          </div>
        </div>
      </div>
      <figure class="h-44">
        <canvas id="barcode" />
      </figure>
    </div>
    <div
      class="mt-4 card w-96 border border-tech bg-[var(--tech-input-bg)] shadow-xl rounded-2xl text-tech"
    >
      <div class="card-body">
        <h2 class="card-title text-tech">
          二维码
        </h2>
        <div class="card-actions">
          <div class="join w-full">
            <input
              v-model="qrcodeVal"
              class="input w-full input-bordered join-item"
              placeholder="text"
            >
            <button class="btn join-item" @click="createQRCode">
              生成
            </button>
          </div>
        </div>
      </div>
      <figure class="h-44">
        <div ref="vueQrcode" />
      </figure>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount } from 'vue';
import { originUrl } from '~/config';
import { loadBarcodeScripts } from '~/utils/script-loader';

definePageMeta({
  keepalive: true, // nuxt 默认缓存所有页面
});
onBeforeUnmount(() => {});
const getCode = () => 'NO ' + Math.floor(Math.random() * 100000000000).toString();
const barcodeVal = ref('');
const qrcodeVal = ref(originUrl);
const vueQrcode = ref(null);
let qrcode: any = null;
const createBarcode = (random?: any) => {
  if (random) {
    barcodeVal.value = getCode();
  }
  /* 路由默认为缓存的 需要在onActivated才能获取到dom */
  JsBarcode('#barcode', '1234', {
    text: barcodeVal.value,
    format: 'pharmacode',
    lineColor: '#37cdbe',
    width: 4,
    height: 60,
    displayValue: true,
  });
};
const createQRCode = () => {
  qrcode.clear(); // clear the code.
  qrcode.makeCode(qrcodeVal.value);
};

onMounted(async () => {
  // 按需加载条码生成脚本
  await loadBarcodeScripts();

  createBarcode();
  qrcode = new QRCode(vueQrcode.value, {
    text: qrcodeVal.value,
    width: 128,
    height: 128,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H,
    useSVG: true,
  });
});
</script>
