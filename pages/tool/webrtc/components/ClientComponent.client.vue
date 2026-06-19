<script setup lang="ts">
import { useDevicesList, useUserMedia, useDisplayMedia } from '@vueuse/core';
import { downloadFile } from '~/utils/common';
import { messageDanger, messageSuccess } from '~~/utils/toast';

const currentCamera = ref<string>();
const currentMicrophone = ref<string>();

const videoUserMedia = ref<HTMLVideoElement>();
const videoDisplayMedia = ref<HTMLVideoElement>();
const mediaRecorderUserMedia = ref<MediaRecorder | null>(null);
const mediaRecorderDisplayMedia = ref<MediaRecorder | null>(null);
const isRecordingUserMedia = ref(false);
const isRecordingDisplayMedia = ref(false);

const {
  devices,
  videoInputs: cameras,
  audioInputs: microphones,
} = useDevicesList({
  requestPermissions: true,
});

watch(
  devices,
  () => {
    if (!currentCamera.value && cameras.value.length) {
      currentCamera.value = cameras.value[0]?.deviceId;
    }
    if (!currentMicrophone.value && microphones.value.length) {
      currentMicrophone.value = microphones.value[0]?.deviceId;
    }
  },
  { immediate: true },
);

const {
  stream: streamUserMedia,
  enabled: enabledUserMedia,
  restart,
} = useUserMedia({
  constraints: {
    video: { deviceId: currentCamera },
    audio: { deviceId: currentMicrophone },
  },
});

const { stream: streamDisplayMedia, enabled: enabledDisplayMedia } = useDisplayMedia();

watch(currentCamera, () => {
  if (enabledUserMedia.value) {
    restart();
  }
});

watch(currentMicrophone, () => {
  if (enabledUserMedia.value) {
    restart();
  }
});

watch(streamUserMedia, (stream) => {
  if (videoUserMedia.value) {
    videoUserMedia.value.srcObject = stream ?? null;
  }
  stopRecorder(mediaRecorderUserMedia, isRecordingUserMedia);
});

watch(streamDisplayMedia, (stream) => {
  if (videoDisplayMedia.value) {
    videoDisplayMedia.value.srcObject = stream ?? null;
  }
  stopRecorder(mediaRecorderDisplayMedia, isRecordingDisplayMedia);
});

function getSupportedMimeType() {
  const types = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4',
  ];
  return types.find(type => MediaRecorder.isTypeSupported(type)) ?? '';
}

function createMediaRecorder(stream: MediaStream) {
  const mimeType = getSupportedMimeType();
  if (!mimeType) {
    messageDanger('当前浏览器不支持 MediaRecorder 录制');
    return null;
  }

  const chunks: Blob[] = [];
  const mediaRecorder = new MediaRecorder(stream, { mimeType });

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  };

  mediaRecorder.onstop = () => {
    const blob = new Blob(chunks, { type: mimeType });
    const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
    const url = URL.createObjectURL(blob);
    downloadFile(url, `录制-${Date.now()}.${ext}`);
    URL.revokeObjectURL(url);
    messageSuccess('视频已保存');
  };

  return mediaRecorder;
}

function stopRecorder(
  recorderRef: Ref<MediaRecorder | null>,
  recordingRef: Ref<boolean>,
  save = false,
) {
  const recorder = recorderRef.value;
  if (!recorder || recorder.state === 'inactive') {
    recorderRef.value = null;
    recordingRef.value = false;
    return;
  }

  if (save) {
    recorder.stop();
  }
  else {
    recorder.onstop = () => {};
    recorder.stop();
  }

  recorderRef.value = null;
  recordingRef.value = false;
}

function toggleRecording(
  stream: MediaStream | undefined,
  recorderRef: Ref<MediaRecorder | null>,
  recordingRef: Ref<boolean>,
) {
  if (!stream) {
    messageDanger('请先开启媒体流');
    return;
  }

  if (recordingRef.value) {
    stopRecorder(recorderRef, recordingRef, true);
    return;
  }

  const recorder = createMediaRecorder(stream);
  if (!recorder) {
    return;
  }

  recorderRef.value = recorder;
  recordingRef.value = true;
  recorder.start(1000);
}

function stopAllTracks() {
  streamUserMedia.value?.getTracks().forEach(track => track.stop());
  streamDisplayMedia.value?.getTracks().forEach(track => track.stop());
}

onUnmounted(() => {
  stopRecorder(mediaRecorderUserMedia, isRecordingUserMedia);
  stopRecorder(mediaRecorderDisplayMedia, isRecordingDisplayMedia);
  stopAllTracks();
});
</script>

<template>
  <section class="space-y-4">
    <h3 class="text-base font-medium text-tech">
      媒体采集
    </h3>
    <p class="text-sm text-tech-muted">
      摄像头预览与屏幕共享，支持选择设备并录制为 WebM/MP4（取决于浏览器）。
    </p>

    <div
      class="mockup-window border border-tech bg-[var(--tech-input-bg)] mx-auto md:w-3/4 text-tech"
    >
      <div class="flex flex-col items-center p-4 bg-base-200 h-full">
        <div class="join mb-2 flex-wrap justify-center">
          <button
            class="btn btn-sm cyber-btn-secondary join-item"
            @click="enabledUserMedia = !enabledUserMedia"
          >
            {{ enabledUserMedia ? '停止摄像头' : '开启摄像头' }}
          </button>
          <button
            class="btn btn-sm join-item"
            :class="isRecordingUserMedia ? 'btn-error' : 'cyber-btn-secondary'"
            :disabled="!enabledUserMedia"
            @click="toggleRecording(streamUserMedia, mediaRecorderUserMedia, isRecordingUserMedia)"
          >
            {{ isRecordingUserMedia ? '停止并保存' : '开始录制' }}
          </button>
          <select
            v-model="currentCamera"
            class="select select-bordered join-item select-sm max-w-48"
            :disabled="!cameras.length"
          >
            <option v-for="item in cameras" :key="item.deviceId" :value="item.deviceId">
              {{ item.label || `摄像头 ${item.deviceId.slice(0, 8)}` }}
            </option>
          </select>
          <select
            v-model="currentMicrophone"
            class="select select-bordered join-item select-sm max-w-48"
            :disabled="!microphones.length"
          >
            <option v-for="item in microphones" :key="item.deviceId" :value="item.deviceId">
              {{ item.label || `麦克风 ${item.deviceId.slice(0, 8)}` }}
            </option>
          </select>
        </div>
        <video
          ref="videoUserMedia"
          class="h-96 w-full max-w-3xl rounded-xl bg-black object-contain"
          muted
          autoplay
          playsinline
        />
      </div>
    </div>

    <div
      class="mockup-window border border-tech bg-[var(--tech-input-bg)] mx-auto md:w-3/4 text-tech"
    >
      <div class="flex flex-col items-center p-4 bg-base-200 h-full">
        <div class="join mb-2">
          <button
            class="btn btn-sm cyber-btn-secondary join-item"
            @click="enabledDisplayMedia = !enabledDisplayMedia"
          >
            {{ enabledDisplayMedia ? '停止共享' : '开始屏幕共享' }}
          </button>
          <button
            class="btn btn-sm join-item"
            :class="isRecordingDisplayMedia ? 'btn-error' : 'cyber-btn-secondary'"
            :disabled="!enabledDisplayMedia"
            @click="
              toggleRecording(
                streamDisplayMedia,
                mediaRecorderDisplayMedia,
                isRecordingDisplayMedia,
              )
            "
          >
            {{ isRecordingDisplayMedia ? '停止并保存' : '开始录屏' }}
          </button>
        </div>
        <video
          ref="videoDisplayMedia"
          class="h-96 w-full max-w-3xl rounded-xl bg-black object-contain"
          muted
          autoplay
          playsinline
        />
      </div>
    </div>
  </section>
</template>
