<template>
  <div class="container m-auto flex flex-col">
    <div class="mockup-window border bg-base-300">
      <div class="flex justify-center p-4 bg-base-200 h-full">
        <iframe class="iframe" :src="goUrl" />
      </div>
    </div>

    <div class="mockup-phone mt-10">
      <div class="camera" />
      <div class="display">
        <div class="artboard artboard-demo phone-1 md:phone-3">
          <div class="iframe-wrap">
            <iframe class="iframe" :src="zoneUrl" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { adminUrl } from '@/config'
const token = useToken()
const goUrl = `${adminUrl}?ticket=${token.value}`
const zoneUrl = 'https://jiang-xia.top/zone/#/'

</script>
<style lang="less" scoped>
.container {
    padding-top: 84px;

    .iframe-wrap {
        padding-top: 25px;
        height: 100%;
        width: 100%;
        background-color: #f8f8f8;
    }

    .iframe {
        height: 100%;
        width: 100%;
        border-radius: 10px;
        border-width: none;
        border-style: solid;
        border-color: #555555;
        border-image: none;
        background: #ffffff;
    }

    .mockup-window {
        .iframe {
            min-height: 75vh;
        }
    }
    .mockup-phone{
    }
}
</style>
