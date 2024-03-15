<template>
  <div class="m-signature">
    <!-- <canvas id="canvasImg"></canvas> -->
    <div ref="pdfWrap" class="pdf-wrap">
      <span v-if="loading" class="loading loading-spinner loading-lg" />
      <div ref="pdfContainer" class="pdf-container" />
    </div>

    <div v-show="showSmoothSignatureWrap" class="smoothSignatureWrap">
      <div class="mb-canvas">
        <div class="actions">
          <button class="btn btn-sm mr-2" @click="handleClear">清除</button>
          <button class="btn btn-sm mr-2" @click="handleUndo">上一步</button>
          <button class="btn btn-sm mr-2" @click="handleFinish">完成</button>
          <button class="btn btn-sm mr-2" @click="handleClose">关闭</button>
        </div>
        <canvas ref="smoothSignatureCanvas" class="canvas" />
      </div>
    </div>

    <div v-if="!showSmoothSignatureWrap" class="agree-btn">
      <span v-if="localSecond">我已同意阅读并同意协议({{ localSecond }}s)</span>
      <button
        v-else
        class="btn btn-sm"
        size="small"
        style="width: 60px"
        type="primary"
        @click="showSmoothSignatureWrapHandle"
      >
        签名
      </button>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import SmoothSignature from 'smooth-signature'
  import dayjs from 'dayjs'
  const emits = defineEmits(['success'])
  const props = defineProps({
    pdfSrc: {
      type: String,
      default: '',
    },
    second: {
      type: Number,
      default: 10,
    },
    info: {
      type: Object,
      default: () => ({}),
    },
  })
  const smoothSignatureCanvas = ref('')
  const signature = ref('')
  const signaturePng = ref('')
  const showSmoothSignatureWrap = ref(false)
  const localSecond = ref(props.second)
  const loading = ref(true)
  onMounted(() => {
    const timer = setInterval(() => {
      localSecond.value--
      if (!localSecond.value) {
        clearInterval(timer)
      }
    }, 1000)
    const { width, height, } = pdfWrap.value.getBoundingClientRect()
    const options = {
      width: width - 60,
      height: height / 3 - 50,
      minWidth: 3,
      maxWidth: 10,
      color: '#333333',
      bgColor: '#ffffff',
      // bgColor: '#f6f6f6',
    }
    signature.value = new SmoothSignature(smoothSignatureCanvas.value, options)
    reloadPdf()
  })
  const handleClear = () => {
    signature.value.clear()
  }
  const handleUndo = () => {
    signature.value.undo()
  }
  const handleFinish = () => {
    // 旋转
    // const canvas = signature.value.getRotateCanvas(-90)// 不用反转
    const canvas = signature.value
    const pngUrl = canvas.toDataURL()
    signaturePng.value = pngUrl
    editPdf()
    showSmoothSignatureWrap.value = false
  }
  const handleClose = () => {
    console.log('关闭')
    handleClear()
    showSmoothSignatureWrap.value = false
  }
  const showSmoothSignatureWrapHandle = () => {
    handleClear()
    showSmoothSignatureWrap.value = true
  }

  const pdfContainer = ref('')
  const reloadPdf = async (pdfData = props.pdfSrc) => {
    loading.value = true
    const pdfDocument = await pdfjsLib.getDocument(pdfData).promise
    // console.log(pdfDocument)
    pdfContainer.value.innerHTML = '' // 清空PDF容器

    for (let pageIndex = 1; pageIndex <= pdfDocument.numPages; pageIndex++) {
      const page = await pdfDocument.getPage(pageIndex)
      const viewport = page.getViewport({ scale: 2, })
      // console.log(page)
      const canvas = document.createElement('canvas')
      pdfContainer.value.appendChild(canvas)

      const context = canvas.getContext('2d')
      canvas.width = viewport.width
      canvas.height = viewport.height

      const renderContext = {
        canvasContext: context,
        viewport,
      }
      // console.log(page)
      await page.render(renderContext)
      loading.value = false
    }
  }
  const editPdf = async () => {
    const PDFDocument = PDFLib.PDFDocument
    // showToast.loading('加载中')
    // const fontBytes = await fetch('https://jiang-xia.top/x-blog/api/v1/static/uploads/2023-12/ga0hqzh5lek2ntyxtzebx0-华文中宋.ttf').then((res) => res.arrayBuffer())
    const pdfBuffer = await fetch(props.pdfSrc).then(res => res.arrayBuffer())
    const pdfDoc = await PDFDocument.load(pdfBuffer)
    // pdfDoc.registerFontkit(fontkit)
    // const customFont = await pdfDoc.embedFont(fontBytes,{subset:true})
    const pages = pdfDoc.getPages()
    console.log('签名设置————————开始')
    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      console.log('pageIndex', pageIndex, pages[pageIndex])
      const width = pages[pageIndex].getWidth()
      const height = pages[pageIndex].getHeight()

      if (pageIndex === pages.length - 1) {
        const emblemImageBytes = await fetch(signaturePng.value).then(res => res.arrayBuffer())
        const img = await pdfDoc.embedPng(emblemImageBytes)
        const x = width - 260
        const y = height / 2 - 100
        // 签名图片
        pages[pageIndex].drawImage(img, {
          x,
          y,
          width: 160,
          height: 60,
        })
        // 日期
        const dateText = dayjs().format('YYYY MM DD')
        console.log(dateText)
        pages[pageIndex].drawText(dateText, {
          x: x + 20,
          y: y - 20,
          size: 18,
          // font: customFont,
        })
        const pdfBytes = await pdfDoc.save()
        // console.log(pdfBytes)
        const myFile = new File([pdfBytes], 'generated.pdf')
        reloadPdf(pdfBytes)
        mSignatureSuccess(myFile)
        // showToast.hide()
      }
    }
  }
  // pdf
  // all canvas to pdf
  const pdfWrap = ref()

  // 签名组件成功
  const mSignatureSuccess = (res) => {
    emits('success', res)
  }
</script>

<style lang="less">
  .m-signature {
    padding-bottom: 70px;
    position: relative;
    background-color: #fff;
    .pdf-wrap {
      min-height: 100vh;
      .pdf-container {
        canvas {
          width: 100%;
        }
      }
    }
    .smoothSignatureWrap {
      margin: 24px;
      .actions {
        padding: 16px;
        text-align: center;
      }
      .mb-canvas {
        button {
          font-size: 18px;
        }
        canvas {
          border-radius: 10px;
          border: 2px dashed #ccc;
        }
      }
    }
    .agree-btn {
      background: #fff;
      width: 100%;
      position: absolute;
      bottom: 0;
      left: 0;
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
      box-shadow: 0px -3px 6px 1px rgba(0, 0, 0, 0.12);
    }
  }
</style>
