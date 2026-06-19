<script setup lang="ts">
import { messageDanger, messageSuccess } from '~~/utils/toast';

type TestMode = 'loopback' | 'p2p';
type ConnectionState = 'idle' | 'connecting' | 'connected' | 'failed';

interface SignalingPayload {
  type: 'offer' | 'answer' | 'candidate' | 'ready';
  sdp?: { type?: string; sdp?: string };
  candidate?: { candidate?: string; sdpMid?: string | null; sdpMLineIndex?: number | null };
}

const ICE_SERVERS = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

const mode = ref<TestMode>('loopback');
const roomId = ref('webrtc-demo');
const role = ref<'host' | 'guest'>('host');
const connectionState = ref<ConnectionState>('idle');
const statusText = ref('未连接');

const localVideo = ref<HTMLVideoElement>();
const remoteVideo = ref<HTMLVideoElement>();

let localStream: MediaStream | null = null;
let callerPc: RTCPeerConnection | null = null;
let calleePc: RTCPeerConnection | null = null;
let p2pPc: RTCPeerConnection | null = null;
let broadcastChannel: BroadcastChannel | null = null;
const pendingCandidates: SignalingPayload['candidate'][] = [];
let hasRemoteDescription = false;

function setStatus(state: ConnectionState, text: string) {
  connectionState.value = state;
  statusText.value = text;
}

function bindRemoteStream(pc: RTCPeerConnection) {
  pc.ontrack = (event) => {
    const [stream] = event.streams;
    if (remoteVideo.value && stream) {
      remoteVideo.value.srcObject = stream;
    }
  };
}

function wireIceRelay(source: RTCPeerConnection, target: RTCPeerConnection) {
  source.onicecandidate = (event) => {
    if (event.candidate) {
      target.addIceCandidate(event.candidate).catch(console.error);
    }
  };
}

async function ensureLocalStream() {
  if (localStream) {
    return localStream;
  }

  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (localVideo.value) {
      localVideo.value.srcObject = localStream;
    }
    return localStream;
  }
  catch (error) {
    messageDanger('无法访问摄像头或麦克风，请检查浏览器权限');
    console.error(error);
    throw error;
  }
}

function addLocalTracks(pc: RTCPeerConnection, stream: MediaStream) {
  stream.getTracks().forEach(track => pc.addTrack(track, stream));
}

async function startLoopback() {
  await stopConnection();
  setStatus('connecting', '正在建立本页回环连接…');

  try {
    const stream = await ensureLocalStream();
    callerPc = new RTCPeerConnection(ICE_SERVERS);
    calleePc = new RTCPeerConnection(ICE_SERVERS);

    bindRemoteStream(calleePc);
    wireIceRelay(callerPc, calleePc);
    wireIceRelay(calleePc, callerPc);
    addLocalTracks(callerPc, stream);

    const offer = await callerPc.createOffer();
    await callerPc.setLocalDescription(offer);
    await calleePc.setRemoteDescription(offer);

    const answer = await calleePc.createAnswer();
    await calleePc.setLocalDescription(answer);
    await callerPc.setRemoteDescription(answer);

    setStatus('connected', '本页回环已连接，远端画面应显示本地摄像头');
    messageSuccess('回环连接成功');
  }
  catch (error) {
    setStatus('failed', '回环连接失败');
    console.error(error);
  }
}

function closeBroadcastChannel() {
  broadcastChannel?.close();
  broadcastChannel = null;
}

function postSignal(payload: SignalingPayload) {
  broadcastChannel?.postMessage(payload);
}

async function flushPendingCandidates() {
  if (!p2pPc || !hasRemoteDescription) {
    return;
  }

  while (pendingCandidates.length) {
    const candidate = pendingCandidates.shift();
    if (candidate) {
      await p2pPc.addIceCandidate(candidate);
    }
  }
}

async function handleP2pSignal(payload: SignalingPayload) {
  if (payload.type === 'ready' && role.value === 'host' && p2pPc?.localDescription) {
    postSignal({ type: 'offer', sdp: p2pPc.localDescription });
    return;
  }

  if (!p2pPc) {
    return;
  }

  try {
    if (payload.type === 'offer' && payload.sdp) {
      await p2pPc.setRemoteDescription(payload.sdp);
      hasRemoteDescription = true;
      await flushPendingCandidates();

      const answer = await p2pPc.createAnswer();
      await p2pPc.setLocalDescription(answer);
      postSignal({ type: 'answer', sdp: p2pPc.localDescription ?? undefined });
      setStatus('connected', 'P2P 已连接（双 Tab 联调）');
    }
    else if (payload.type === 'answer' && payload.sdp) {
      await p2pPc.setRemoteDescription(payload.sdp);
      hasRemoteDescription = true;
      await flushPendingCandidates();
      setStatus('connected', 'P2P 已连接（双 Tab 联调）');
    }
    else if (payload.type === 'candidate' && payload.candidate) {
      if (hasRemoteDescription) {
        await p2pPc.addIceCandidate(payload.candidate);
      }
      else {
        pendingCandidates.push(payload.candidate);
      }
    }
  }
  catch (error) {
    setStatus('failed', '信令处理失败');
    console.error(error);
  }
}

function initBroadcastChannel() {
  closeBroadcastChannel();
  const channelName = `webrtc-tool-${roomId.value.trim() || 'demo'}`;
  broadcastChannel = new BroadcastChannel(channelName);
  broadcastChannel.onmessage = (event: MessageEvent<SignalingPayload>) => {
    handleP2pSignal(event.data);
  };
}

async function startP2pHost() {
  await stopConnection();
  role.value = 'host';
  initBroadcastChannel();
  setStatus('connecting', '等待另一 Tab 加入房间…');

  try {
    const stream = await ensureLocalStream();
    p2pPc = new RTCPeerConnection(ICE_SERVERS);
    bindRemoteStream(p2pPc);
    addLocalTracks(p2pPc, stream);

    p2pPc.onicecandidate = (event) => {
      if (event.candidate) {
        postSignal({ type: 'candidate', candidate: event.candidate.toJSON() });
      }
    };

    const offer = await p2pPc.createOffer();
    await p2pPc.setLocalDescription(offer);
    postSignal({ type: 'offer', sdp: p2pPc.localDescription ?? undefined });
    setStatus('connecting', `房间 ${roomId.value}：已发送 Offer，请在另一 Tab 点击「加入房间」`);
  }
  catch (error) {
    setStatus('failed', '创建房间失败');
    console.error(error);
  }
}

async function startP2pGuest() {
  await stopConnection();
  role.value = 'guest';
  initBroadcastChannel();
  setStatus('connecting', '等待 Host 发送 Offer…');

  try {
    await ensureLocalStream();
    p2pPc = new RTCPeerConnection(ICE_SERVERS);
    bindRemoteStream(p2pPc);
    addLocalTracks(p2pPc, localStream!);

    p2pPc.onicecandidate = (event) => {
      if (event.candidate) {
        postSignal({ type: 'candidate', candidate: event.candidate.toJSON() });
      }
    };

    postSignal({ type: 'ready' });
    setStatus('connecting', `房间 ${roomId.value}：已就绪，等待 Host Offer`);
  }
  catch (error) {
    setStatus('failed', '加入房间失败');
    console.error(error);
  }
}

async function stopConnection() {
  callerPc?.close();
  calleePc?.close();
  p2pPc?.close();
  callerPc = null;
  calleePc = null;
  p2pPc = null;
  hasRemoteDescription = false;
  pendingCandidates.length = 0;
  closeBroadcastChannel();

  if (remoteVideo.value) {
    remoteVideo.value.srcObject = null;
  }

  if (connectionState.value !== 'idle') {
    setStatus('idle', '未连接');
  }
}

function stopAll() {
  stopConnection();
  localStream?.getTracks().forEach(track => track.stop());
  localStream = null;
  if (localVideo.value) {
    localVideo.value.srcObject = null;
  }
}

const stateBadgeClass = computed(() => {
  switch (connectionState.value) {
    case 'connected':
      return 'badge-success';
    case 'connecting':
      return 'badge-warning';
    case 'failed':
      return 'badge-error';
    default:
      return 'badge-ghost';
  }
});

onUnmounted(() => {
  stopAll();
});
</script>

<template>
  <section class="space-y-4">
    <h3 class="text-base font-medium text-tech">
      P2P 连接测试
    </h3>
    <p class="text-sm text-tech-muted">
      「本页回环」在同一浏览器内用双 PeerConnection 验证编解码与 ICE；「双 Tab 联调」通过
      BroadcastChannel 在同一房间的两个标签页间交换信令（无需后端）。联调时建议 Guest 先加入，Host
      再创建房间。
    </p>

    <div class="flex flex-wrap gap-2">
      <button
        class="btn btn-sm"
        :class="mode === 'loopback' ? 'cyber-btn-secondary' : 'btn-outline'"
        @click="mode = 'loopback'"
      >
        本页回环
      </button>
      <button
        class="btn btn-sm"
        :class="mode === 'p2p' ? 'cyber-btn-secondary' : 'btn-outline'"
        @click="mode = 'p2p'"
      >
        双 Tab 联调
      </button>
      <span class="badge badge-sm" :class="stateBadgeClass">
        {{ statusText }}
      </span>
    </div>

    <div
      class="mockup-window border border-tech bg-[var(--tech-input-bg)] mx-auto md:w-3/4 text-tech"
    >
      <div class="flex flex-col items-center gap-4 p-4 bg-base-200">
        <div v-if="mode === 'loopback'" class="join">
          <button class="btn btn-sm cyber-btn-secondary join-item" @click="startLoopback">
            开始回环测试
          </button>
          <button class="btn btn-sm btn-outline join-item" @click="stopAll">
            断开并释放设备
          </button>
        </div>

        <div v-else class="flex w-full max-w-3xl flex-col gap-2 sm:flex-row sm:items-center">
          <input
            v-model="roomId"
            class="input input-bordered input-sm flex-1"
            placeholder="房间 ID（两 Tab 需一致）"
          >
          <div class="join">
            <button class="btn btn-sm cyber-btn-secondary join-item" @click="startP2pHost">
              创建房间 (Host)
            </button>
            <button class="btn btn-sm btn-outline join-item" @click="startP2pGuest">
              加入房间 (Guest)
            </button>
            <button class="btn btn-sm btn-ghost join-item" @click="stopAll">
              断开
            </button>
          </div>
        </div>

        <div class="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <p class="text-xs text-tech-muted">
              本地
            </p>
            <video
              ref="localVideo"
              class="aspect-video w-full rounded-xl bg-black object-cover"
              autoplay
              muted
              playsinline
            />
          </div>
          <div class="space-y-2">
            <p class="text-xs text-tech-muted">
              远端
            </p>
            <video
              ref="remoteVideo"
              class="aspect-video w-full rounded-xl bg-black object-cover"
              autoplay
              playsinline
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
