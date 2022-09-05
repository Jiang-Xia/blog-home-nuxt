<template>
  <div>
    <!-- 条形码 -->
    <canvas id="barcode" />
    <vue-qr v-if="mounted" text="Hello world!" />
    <!-- <vue-qr :bg-src="src" :logo-src="src2" text="Hello world!" :size="200" /> -->
    <!-- <vue-qr v-if="mounted" text="Hello world!" :callback="test" qid="testid" /> -->
  </div>
</template>
<script setup>
  // import vueQr from 'vue-qr/src/packages/vue-qr.vue'
  import JsBarcode from 'jsbarcode'
  const test = (dataUrl, id) => {
    console.log(dataUrl, id)
  }
  const mounted = ref(false)
  onMounted(() => {
    mounted.value = true
    JsBarcode('#barcode', '1234', {
      text: 'Hi!',
      format: 'pharmacode',
      lineColor: '#0aa',
      width: 4,
      height: 40,
      displayValue: true,
    })
  })
</script>
