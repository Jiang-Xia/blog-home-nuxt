<template>
  <div class="p-4">
    <div class="card card-compact w-96 bg-base-100 shadow-xl border border-base-300">
      <figure> <canvas id="barcode" /></figure>
      <div class="card-body">
        <h2 class="card-title">条形码</h2>
        <div class="card-actions justify-end">
          <button class="btn btn-primary" @click="createBarcode">重新生成</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
  import JsBarcode from 'jsbarcode'
  import { onBeforeUnmount, onActivated } from 'vue'
  definePageMeta({
    keepalive: true, // nuxt 默认缓存所有页面
  })
  onBeforeUnmount(() => {})
  onMounted(() => {})
  const createBarcode = () => {
    /* 路由默认为缓存的 需要在onActivated才能获取到dom */
    JsBarcode('#barcode', '1234', {
      text: 'Hi!' + Math.random(),
      format: 'pharmacode',
      lineColor: '#0aa',
      width: 4,
      height: 40,
      displayValue: true,
    })
  }
  // 路由激活事件
  onActivated(() => {
    createBarcode()
  })
</script>
