<template>
  <div class="p-4 overflow-hidden flex justify-center">
    <div class="w-full md:w-3/5">
      <xia-signature :pdf-src="pdfSrc" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { originUrl, apiPrefix } from '~/config';

const pdfSrc
    = originUrl + apiPrefix + '/static/uploads/2024-03/eqiic4bsyyu39pd95y7e7h-保证书（不可撤消）.pdf';
</script>

<style lang="less" scoped></style>
