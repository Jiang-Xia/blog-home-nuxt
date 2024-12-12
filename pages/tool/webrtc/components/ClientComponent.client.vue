<script setup lang="ts">
  import { useDevicesList, useUserMedia, useDisplayMedia } from '@vueuse/core'
  import { downloadFile } from '~/utils/common'

  const currentCamera: any = ref() // 摄像头
  const currentMicrophone: any = ref() // 麦克风

  /* 摄像头(拍照) */
  const videoUserMedia = ref()
  const mediaRecorderUserMedia = ref()
  const {
    devices,
    videoInputs: cameras,
    audioInputs: microphones,
  } = useDevicesList({
    requestPermissions: true,
  })
  watch(
    () => devices.value,
    () => {
      console.log('devices.value', devices.value)
      console.log(
        'cameras.value',
        cameras.value.map(c => c.deviceId)
      )
      console.log(
        'microphones.value',
        microphones.value.map(c => c.deviceId)
      )
      currentCamera.value = cameras.value[0]?.deviceId
      currentMicrophone.value = microphones.value[0]?.deviceId
    }
  )
  const changeCamera: any = (e: any) => {
    currentCamera.value = e.target.value
    // console.log(currentCamera.value)
    // autoSwitch.value = false
    restart()
  }
  const {
    stream: streamUserMedia,
    start: startUserMedia,
    enabled: enabledUserMedia,
    restart,
    autoSwitch,
  } = useUserMedia({
    constraints: {
      // 传一个响应式对象用于可监听
      video: { deviceId: currentCamera, },
      audio: { deviceId: currentMicrophone, },
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
      const blob = new Blob(chunks, { type: 'video/mp4', })
      downloadFile(URL.createObjectURL(blob), '视频')
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
          <button
            v-if="mediaRecorderUserMedia"
            class="btn btn-sm btn-neutral join-item"
            @click="saveUserMedia"
          >
            保存
          </button>
          <button class="btn btn-sm btn-outline join-item">摄像头(录像)</button>
          <select
            class="select select-bordered join-item select-sm max-w-36"
            @change="changeCamera"
          >
            <option
              v-for="item in cameras"
              :selected="currentCamera === item.deviceId"
              :label="item.label"
              :value="item.deviceId"
            />
          </select>
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
          <button
            v-if="mediaRecorderDisplayMedia"
            class="btn btn-sm btn-neutral join-item"
            @click="saveDisplayMedia"
          >
            保存
          </button>
          <button class="btn btn-sm btn-outline join-item">屏幕共享(录屏)</button>
        </div>
        <video ref="videoDisplayMedia" class="h-96 rounded-xl" muted autoplay controls />
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped></style>
