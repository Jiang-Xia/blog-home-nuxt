<script setup>
  const starting = ref(false)
  let localStream
  let remoteStream
  let peerConnection
  const localVideo = ref()
  const remoteVideo = ref()
  const servers = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302', }],
  }

  // 获取本地媒体流
  async function getLocalStream () {
    try {
      localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true, })
      localVideo.value.srcObject = localStream
    } catch (error) {
      console.error('Error accessing media devices.', error)
    }
  }

  // 初始化RTCPeerConnection
  function createPeerConnection () {
    peerConnection = new RTCPeerConnection(servers)

    // 添加本地流到RTCPeerConnection
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream))

    // 处理远程流
    peerConnection.ontrack = (event) => {
      if (!remoteStream) {
        remoteStream = new MediaStream()
        remoteVideo.value.srcObject = remoteStream
      }
      remoteStream.addTrack(event.track)
    }

    // 处理ICE候选
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        sendToServer({
          type: 'candidate',
          candidate: event.candidate,
        })
      }
    }
  }

  // 创建和发送offer
  async function createOffer () {
    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
    sendToServer({
      type: 'offer',
      sdp: peerConnection.localDescription,
    })
  }

  // 处理信令消息
  function handleSignalingMessage (message) {
    if (message.type === 'offer') {
      peerConnection.setRemoteDescription(new RTCSessionDescription(message.sdp))
      createAnswer()
    } else if (message.type === 'answer') {
      peerConnection.setRemoteDescription(new RTCSessionDescription(message.sdp))
    } else if (message.type === 'candidate') {
      const candidate = new RTCIceCandidate(message.candidate)
      peerConnection.addIceCandidate(candidate)
    }
  }

  // 创建和发送answer
  async function createAnswer () {
    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)
    sendToServer({
      type: 'answer',
      sdp: peerConnection.localDescription,
    })
  }

  // 模拟发送和接收消息（替换为实际信令服务器）
  function sendToServer (message) {
    // 实际应用中，此处应通过WebSocket或其他信令机制发送消息
    handleSignalingMessage(message)
  }
  // 初始化
  async function init () {
    await getLocalStream()
    createPeerConnection()
    createOffer()
  }
  onMounted(() => {
    // init()
  })
</script>
<template>
  <div class="p-4">
    <div class="mockup-window border bg-base-100 mx-auto md:w-3/4">
      <div class="flex flex-col items-center p-4 bg-base-200 h-full">
        <button class="btn btn-sm btn-neutral" @click="init">录制</button>
        <video ref="localVideo" autoplay muted />
        <video ref="remoteVideo" autoplay />
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped></style>
