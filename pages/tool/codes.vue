<template>
  <div class="flex flex-wrap justify-around gap-4">
    <CyberToolCard title="条形码" width-class="w-full max-w-sm">
      <div class="join w-full">
        <input
          v-model="barcodeVal"
          class="input join-item w-full input-bordered login-input"
          placeholder="text"
        >
        <button class="btn join-item" @click="createBarcode(1)">
          测试
        </button>
        <button class="btn join-item btn-primary" @click="createBarcode()">
          生成
        </button>
      </div>
      <figure class="mt-4 flex h-44 items-center justify-center rounded-xl bg-tech-header">
        <canvas id="barcode" />
      </figure>
    </CyberToolCard>

    <CyberToolCard title="二维码" width-class="w-full max-w-sm">
      <div class="join w-full">
        <input
          v-model="qrcodeVal"
          class="input join-item w-full input-bordered login-input"
          placeholder="text"
        >
        <button class="btn join-item btn-primary" @click="createQRCode">
          生成
        </button>
      </div>
      <figure class="mt-4 flex h-44 items-center justify-center rounded-xl bg-tech-header">
        <div ref="vueQrcode" />
      </figure>
    </CyberToolCard>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount } from 'vue';
import { originUrl } from '~/config';
import { loadBarcodeScripts } from '~/utils/script-loader';

definePageMeta({
  keepalive: true,
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
  qrcode.clear();
  qrcode.makeCode(qrcodeVal.value);
};

onMounted(async () => {
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
