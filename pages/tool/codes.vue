<template>
  <div class="p-4 max-w-6xl mx-auto rounded-xl bg-base-100 flex flex-wrap justify-around">
    <div class="mt-4 card w-96 bg-base-100 shadow-xl border border-base-300">
      <div class="card-body">
        <h2 class="card-title">
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
    <div class="mt-4 card w-96 bg-base-100 shadow-xl border border-base-300">
      <div class="card-body">
        <h2 class="card-title">
          二维码
        </h2>
        <div class="card-actions">
          <div class="join w-full">
            <input
              v-model="qrcodeVal"
              class="input w-full input-bordered join-item"
              placeholder="text"
            >
            <button class="btn join-item">
              生成
            </button>
          </div>
        </div>
      </div>
      <figure>
        <canvas ref="vueQrcode" />
      </figure>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount } from 'vue';
import { originUrl } from '~/config';

definePageMeta({
  keepalive: true, // nuxt 默认缓存所有页面
});
onBeforeUnmount(() => {});
const getCode = () => 'NO ' + Math.floor(Math.random() * 100000000000).toString();
const barcodeVal = ref('');
const qrcodeVal = ref(originUrl);
const vueQrcode = ref(null);
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
  const qrcode = QRCode.toCanvas(vueQrcode.value, qrcodeVal.value, (error: any) => {
    if (error) console.error(error);
    console.log('success!');
  });
};

onMounted(() => {
  createBarcode();
  createQRCode();
});
</script>
