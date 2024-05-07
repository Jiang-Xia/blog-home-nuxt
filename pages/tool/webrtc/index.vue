<script setup lang="ts">
  import { useDevicesList, useUserMedia, useDisplayMedia } from '@vueuse/core'
  import { downloadFile } from '~/utils/common'
  /* 摄像头(拍照) */
  const videoUserMedia = ref()
  const mediaRecorderUserMedia = ref()
  const { videoInputs: cameras, audioInputs: microphones, } = useDevicesList({
    requestPermissions: true,
  })

  const currentCamera = computed(() => cameras.value[0]?.deviceId) // 摄像头
  const currentMicrophone = computed(() => microphones.value[0]?.deviceId) // 麦克风

  const {
    stream: streamUserMedia,
    start: startUserMedia,
    enabled: enabledUserMedia,
  } = useUserMedia({
    constraints: {
      video: { deviceId: currentCamera.value, },
      audio: { deviceId: currentMicrophone.value, },
    },
  })
  // 保存视频
  const saveUserMedia = () => {
    mediaRecorderUserMedia.value.stop()
    mediaRecorderDisplayMedia.value = null
    enabledUserMedia.value = !enabledUserMedia.value
  }

  watch(
    () => streamUserMedia.value,
    (stream) => {
      videoUserMedia.value.srcObject = stream
      if (stream) {
        mediaRecorderUserMedia.value = createMediaRecorder(stream).mediaRecorder
      }
    }
  )

  // 创建录制器
  const createMediaRecorder = (stream: MediaStream) => {
    const chunks: any[] = []
    const mediaRecorder = stream && new MediaRecorder(stream)
    mediaRecorder.ondataavailable = function (event: any) {
      chunks.push(event.data)
    }
    // 开始录制
    mediaRecorder.start()
    mediaRecorder.onstop = () => {
      // 创建一个 Blob 对象，其中包含录制的所有数据
      const blob = new Blob(chunks, { type: 'video/webm', })
      downloadFile(URL.createObjectURL(blob))
    }
    return { mediaRecorder, chunks, }
  }
  /* 屏幕共享(录屏) */
  const videoDisplayMedia = ref()
  const mediaRecorderDisplayMedia = ref()
  const {
    stream: streamDisplayMedia,
    start: startDisplayMedia,
    enabled: enabledDisplayMedia,
  } = useDisplayMedia()
  watch(
    () => streamDisplayMedia.value,
    (stream) => {
      videoDisplayMedia.value.srcObject = streamDisplayMedia.value
      if (stream) {
        mediaRecorderDisplayMedia.value = createMediaRecorder(stream).mediaRecorder
      }
    }
  )
  const saveDisplayMedia = () => {
    mediaRecorderDisplayMedia.value.stop()
    mediaRecorderDisplayMedia.value = null
    enabledDisplayMedia.value = !enabledDisplayMedia.value
  }
  onMounted(() => {
    // startUserMedia()
    // startDisplayMedia()
  })
</script>
<template>
  <div class="p-4">
    <div class="mockup-window border bg-base-100 mx-auto md:w-3/4">
      <div class="flex flex-col items-center p-4 bg-base-200 h-full">
        <div class="join mb-2">
          <button
            class="btn btn-sm btn-neutral join-item"
            @click="enabledUserMedia = !enabledUserMedia"
          >
            {{ enabledUserMedia ? '停止' : '开始' }}
          </button>
          <button class="btn btn-sm btn-outline join-item">摄像头(拍照)</button>
          <button
            v-if="mediaRecorderUserMedia"
            class="btn btn-sm btn-neutral join-item"
            @click="saveUserMedia"
          >
            保存
          </button>
        </div>
        <video ref="videoUserMedia" class="h-96 rounded-xl" muted autoplay controls />
      </div>
    </div>

    <div class="mockup-window border bg-base-100 mx-auto mt-4 md:w-3/4">
      <div class="flex flex-col items-center p-4 bg-base-200 h-full">
        <div class="join mb-2">
          <button
            class="btn btn-sm btn-neutral join-item"
            @click="enabledDisplayMedia = !enabledDisplayMedia"
          >
            {{ enabledDisplayMedia ? '停止' : '开始' }}
          </button>
          <button class="btn btn-sm btn-outline join-item">屏幕共享(录屏)</button>
          <button
            v-if="mediaRecorderDisplayMedia"
            class="btn btn-sm btn-neutral join-item"
            @click="saveDisplayMedia"
          >
            保存
          </button>
        </div>
        <video ref="videoDisplayMedia" class="h-96 rounded-xl" muted autoplay controls />
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped></style>
