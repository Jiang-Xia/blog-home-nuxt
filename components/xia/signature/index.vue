<template>
  <div class="m-signature">
    <!-- <canvas id="canvasImg"></canvas> -->
    <div class="tool-wrap flex items-center justify-between p-3 w-full">
      <button class="btn btn-sm">{{ currentPage }}/{{ totalPageCount }}</button>
      <div class="join">
        <button
          class="btn btn-sm join-item"
          :disabled="minScale === scaleFactor"
          @click="changeScale('-')"
        >
          -
        </button>
        <button
          class="btn btn-sm join-item"
          :disabled="minScale * 4 === scaleFactor"
          @click="changeScale('+')"
        >
          +
        </button>
      </div>
    </div>
    <div ref="scrollContainer" class="scroll-container">
      <div ref="pdfWrap" class="pdf-wrap" :style="{ '--scale-factor': scaleFactor }">
        <span v-if="loading" class="loading loading-spinner loading-lg" />
        <div ref="pdfContainer" class="pdf-container" />
      </div>
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
    const { width, height, } = scrollContainer.value.getBoundingClientRect()
    minScale.value = width / 612
    console.log(width, height)
    const options = {
      width: width - 24,
      height: height / 3 - 50,
      minWidth: 3,
      maxWidth: 10,
      color: '#333333',
      bgColor: '#ffffff',
      // bgColor: '#f6f6f6',
    }
    scaleFactor.value = width / 612
    signature.value = new SmoothSignature(smoothSignatureCanvas.value, options)
    document.querySelector('.scroll-container').addEventListener('scroll', (e) => {
      const scrollTop = e.target.scrollTop
      // console.log(scrollTop, pageHeight.value, Math.ceil((scrollTop + 306) / pageHeight.value))
      currentPage.value = Math.ceil((scrollTop + 306) / pageHeight.value)
      if (currentPage.value >= totalPageCount.value) {
        currentPage.value = totalPageCount
      }
    })
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
  const scrollContainer = ref('')
  const pdfContainer = ref('')
  const totalPageCount = ref(1)
  // 页数和缩放相关
  const currentPage = ref(1)
  const pageWidth = ref(0)
  const pageHeight = ref(0)
  const scaleFactor = ref(1)
  const minScale = ref(1)
  const changeScale = (t) => {
    let num = scaleFactor.value
    if (t === '-') {
      num = num - num * 0.1
      if (num <= 1) {
        num = minScale.value
      }
    } else if (t === '+') {
      num = num + num * 0.1
      if (num >= 4) {
        num = minScale.value * 4
      }
    }
    scaleFactor.value = num
  }
  const reloadPdf = async (pdfData = props.pdfSrc) => {
    loading.value = true
    const pdfDocument = await pdfjsLib.getDocument(pdfData).promise
    // console.log(pdfDocument)
    pdfContainer.value.innerHTML = '' // 清空PDF容器
    totalPageCount.value = pdfDocument.numPages
    for (let pageIndex = 1; pageIndex <= pdfDocument.numPages; pageIndex++) {
      const page = await pdfDocument.getPage(pageIndex)
      const viewport = page.getViewport({ scale: 2, })
      pageWidth.value = viewport.width / 2
      pageHeight.value = viewport.height / 2
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
    // padding-top: 68px;
    padding-bottom: 70px;
    position: relative;
    background-color: #fff;
    position: relative;
    .scroll-container {
      overflow: auto;
    }
    .tool-wrap {
      position: absolute;
      top: 0;
      left: 0;
      // background-color: #fff;
      z-index: 1;
    }
    .pdf-wrap {
      min-height: 100vh;
      width: calc(var(--scale-factor) * 612px);
      height: calc(var(--scale-factor) * 792px);
      transition: all 0.5s ease-in;
      .pdf-container {
        canvas {
          width: 100%;
        }
      }
    }
    .smoothSignatureWrap {
      .actions {
        text-align: center;
        padding: 12px 12px 0;
      }
      .mb-canvas {
        button {
          font-size: 18px;
        }
        canvas {
          margin: 12px auto;
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
