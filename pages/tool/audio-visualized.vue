<template>
  <CyberToolCard title="音频可视化" desc="播放音频并实时展示频谱">
    <section class="mb-4 flex items-center justify-center">
      <audio ref="audio" controls :src="mp3Src" class="max-w-full" />
    </section>
    <section
      ref="canvasWrap"
      class="overflow-hidden rounded-lg border border-tech bg-[var(--tech-input-bg)]"
    >
      <span v-if="!isInit" class="loading loading-dots loading-md m-4 text-primary" />
      <canvas ref="canvas" class="block w-full" />
    </section>
  </CyberToolCard>
</template>

<script setup lang="ts">
const mp3Src
  = 'https://jiang-xia.top/x-blog/api/v1static/uploads/2024-03/eqiic4bsyyu39pd95y7eh9-江南-林俊杰.128.mp3';
const canvasWrap = ref();
const canvas = ref();
const audio = ref();
const isInit = ref(false);
onMounted(() => {
  const canvasEle = canvas.value;
  const audioEle = audio.value;
  const ctx = canvasEle.getContext('2d');
  const initCvs = () => {
    canvasEle.width = canvasWrap.value.offsetWidth;
    canvasEle.height = (window.innerHeight / 2) * devicePixelRatio;
  };
  initCvs();
  let dataArray: Uint8Array;
  let analyser: AnalyserNode;
  audioEle.onplay = () => {
    if (isInit.value) {
      return;
    }
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaElementSource(audioEle);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    isInit.value = true;
  };
  const draw = () => {
    requestAnimationFrame(draw);
    if (!isInit.value) {
      return;
    }
    analyser.getByteFrequencyData(dataArray);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvasEle.width, canvasEle.height);
    const barWidth = (canvasEle.width / dataArray.length) * 2.5;
    let x = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = dataArray[i] / 2;
      ctx.fillStyle = `rgb(${barHeight + 100}, 50, 200)`;
      ctx.fillRect(x, canvasEle.height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }
  };
  draw();
});
</script>
