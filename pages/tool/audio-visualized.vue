<template>
  <div class="p-4 overflow-hidden">
    <!-- <ClientOnly fallback-tag="span" fallback="Loading audio..."> -->
    <!-- </ClientOnly> -->
    <section class="flex items-center justify-center mb-4">
      <audio
        ref="audio"
        controls
        :src="mp3Src"
      />
    </section>
    <section
      ref="canvasWrap"
      class="bg-base-300 rounded-lg"
    >
      <span
        v-if="!isInit"
        class="loading loading-dots loading-md bg-accent"
      />
      <canvas ref="canvas" />
    </section>
  </div>
</template>

<script setup lang="ts">
const mp3Src
    = 'https://jiang-xia.top/x-blog/api/v1/static/uploads/2024-03/eqiic4bsyyu39pd95y7eh9-江南-林俊杰.128.mp3';
  // import mp3Src from './江南-林俊杰.128.mp3'
const canvasWrap = ref();
const canvas = ref();
const audio = ref();
const isInit = ref(false);
onMounted(() => {
  const canvasEle = canvas.value;
  const audioEle = audio.value;
  const ctx = canvasEle.getContext('2d');
  const initCvs = () => {
    // canvasEle.width = window.innerWidth * devicePixelRatio
    canvasEle.width = canvasWrap.value.offsetWidth;
    canvasEle.height = (window.innerHeight / 2) * devicePixelRatio;
  };
  initCvs();
  let dataArray: Uint8Array;
  let analyser: AnalyserNode;
  audioEle.onplay = () => {
    console.log('=>>>>>>>>>>>>>>>>>>>>>>>>', isInit.value);
    if (isInit.value) {
      return;
    }
    // 初始化
    const audioCtx = new AudioContext(); // 创建音频上下文
    const source = audioCtx.createMediaElementSource(audioEle); // 创建音频源节点
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    // 创建数组用于接口分析器节点的分析数据
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    isInit.value = true;
  };
  const draw = () => {
    requestAnimationFrame(draw);
    const { width, height } = canvasEle;
    // 清空画布
    ctx.clearRect(0, 0, width, height);
    if (!isInit.value) {
      return;
    }
    // 让分析器节点分析出数据到数组中去
    analyser.getByteFrequencyData(dataArray);
    // console.log('=>>>>>>>>>>>>>>>>>>>>>>>>', dataArray)
    const len = dataArray.length / 2.5;
    const barWidth = width / len / 2;
    // ctx.fillStyle = '#78c5f7'
    const linearGradient = ctx.createLinearGradient(0, 0, width, height);
    linearGradient.addColorStop(0, 'pink');
    linearGradient.addColorStop(1, 'blue');
    ctx.fillStyle = linearGradient;
    // console.log(dataArray, len)
    for (let i = 0; i < len; i++) {
      const data = dataArray[i]; // <256
      const barHeight = (data / 255) * height;
      const x1 = i * barWidth + width / 2;
      const x2 = width / 2 - (i + 1) * barWidth;
      const y = height - barHeight;
      ctx.fillRect(x1, y, barWidth - 2, barHeight);
      ctx.fillRect(x2, y, barWidth - 2, barHeight);
    }
  };
  draw();
});
</script>

<style lang="less" scoped></style>
