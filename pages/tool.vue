<script setup lang="ts">
//   import QRCode from "qrcode";

  // With promises
//   onMounted(() => {
//     QRCode.toDataURL("I am a pony!")
//       .then((url) => {
//         console.log(url);
//       })
//       .catch((err) => {
//         console.error(err);
//       });

//     // With async/await
//     const generateQR = async (text) => {
//       try {
//         console.log(await QRCode.toDataURL(text));
//       } catch (err) {
//         console.error(err);
//       }
//     };
//   });
</script>
<template>
  <div class="padding-top-bar xia-page"> 工具箱 </div>
</template>
<style lang="less" scoped>
  .xia-page {
    height: 1000vh;
    padding-top: 64px;
  }
</style>
