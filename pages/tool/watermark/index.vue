<template>
  <div class="p-4 overflow-hidden">
    <div class="text-center pb-4 text-gray-950">
      <h2 class="text-xl">批量加水印工具</h2>
      <p class="text-sm text-gray-500">本功能ts部分由chatGPT编写的(图片查看器全部chatGPT编写)</p>
    </div>
    <section class="m-auto w-full sm:w-3/5 flex flex-col pb-4 items-center">
      <div class="join pb-4 w-full">
        <select v-model="timeMark" class="select select-bordered join-item">
          <option value="no">无时间水印</option>
          <option value="yes">有时间水印</option>
        </select>
        <input
          v-model="customMark"
          class="flex-1 input input-bordered join-item"
          placeholder="输入自定义水印描述"
        >
      </div>
      <input
        ref="fileContents"
        multiple
        type="file"
        class="file-input file-input-bordered w-full"
        name="fileContents"
        accept="image/*"
        @change="handleFileUpload"
      >
      <!-- <button class="btn join-item" @click="mergeFileHandle">清空文件</button> -->
    </section>
    <div class="m-auto card bg-base-100 w-full sm:w-3/5 shadow-xl">
      <span v-if="loading" class="loading loading-dots loading-md bg-accent" />
      <div class="card-body p-0 sm:p-4">
        <div>
          <span class="text-sm text-gray-500">瀑布流展示已选照片</span>
          <div class="card-actions justify-end">
            <button class="btn btn-neutral btn-sm" @click="downloadAllImages">下载所有图片</button>
          </div>
        </div>
        <div class="container mx-auto columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
          <div v-for="(image, index) in imageSrcList" class="item mb-4" @click="openViewer(index)">
            <canvas ref="canvasRefs" class="w-full h-auto rounded-lg" />
          </div>
        </div>
      </div>
    </div>
    <base-image-viewer
      v-if="isViewerOpen"
      :images="markMmageSrcList"
      :initial-index="initialIndex"
      @close="isViewerOpen = false"
    />
  </div>
</template>
<script setup lang="ts">
  import JSZip from 'jszip'
  import { messageDanger } from '@/utils/toast'
  const customMark = ref('江夏的图片')
  const timeMark = ref('yes')
  // 存储所有选择的图片源数据
  const imageSrcList = ref<string[]>([])
  // 已经加了水印的图片列表
  const markMmageSrcList = ref<string[]>([])
  // 存储canvas元素的引用
  const canvasRefs = ref<(HTMLCanvasElement | null)[]>([])
  const loading = ref(false)
  // 处理批量文件上传
  const handleFileUpload = (event: Event): void => {
    const input = event.target as HTMLInputElement
    const files = input.files
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            imageSrcList.value.push(e.target.result as string)
            drawWatermark(e.target.result as string, imageSrcList.value.length - 1)
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  // 给图片加水印
  const drawWatermark = (src: string, index: number): void => {
    const img = new Image()
    img.src = src
    // console.log(canvasRefs.value, index)
    img.onload = () => {
      const canvas = canvasRefs.value[index]
      if (!canvas) {
        return
      }
      const ctx = canvas.getContext('2d')

      // 设置canvas大小为图片的尺寸
      canvas.width = img.width
      canvas.height = img.height

      // 绘制图片
      ctx?.drawImage(img, 0, 0)

      // 设置水印的样式
      const watermarkText = `${customMark.value}  ${timeMark.value === 'yes' ? new Date().toLocaleDateString() : ''}`
      const fontSize = 30
      ctx!.font = `${fontSize}px Arial`
      ctx!.fillStyle = 'rgba(255, 255, 255, 0.7)' // 半透明白色
      ctx!.textAlign = 'center'
      ctx!.textBaseline = 'middle'

      // 水印的坐标位置
      const x = canvas.width / 2
      const y = canvas.height - fontSize - 20

      // 在图片上绘制水印
      ctx!.fillText(watermarkText, x, y)
      const dataUrl = canvas.toDataURL('image/png')
      markMmageSrcList.value.push(dataUrl)
    }
  }

  // 批量下载加水印的图片
  const downloadAllImages = (): void => {
    if (!imageSrcList.value.length) {
      messageDanger('请先选择图片!')
      return
    }
    loading.value = true
    setTimeout(() => {
      const zip = new JSZip() // 使用 JSZip 来打包文件

      markMmageSrcList.value.forEach((item, index) => {
        // const canvas = canvasRefs.value[index]
        // if (!canvas) { return }
        // const dataUrl = canvas.toDataURL('image/png')

        // 将每张图片添加到压缩包中
        zip.file(`watermarked-image-${index + 1}.png`, item.split(',')[1], { base64: true, })
      })

      // 生成并下载zip文件
      zip.generateAsync({ type: 'blob', }).then(function (content) {
        const link = document.createElement('a')
        link.href = URL.createObjectURL(content)
        link.download = 'watermarked-images.zip'
        link.click()
        loading.value = false
      })
    }, 10)
  }
  const isViewerOpen = ref(false)
  const initialIndex = ref(0)
  const openViewer = (index) => {
    isViewerOpen.value = true
    initialIndex.value = index
  }
  onMounted(() => {})
</script>
<style lang="less" scoped>
  .image-item {
    width: 100%;
    height: 200px;
    background-color: #ccc;
    opacity: 0;
    transform: translateY(20px);
    transition:
      opacity 0.5s ease,
      transform 0.5s ease;
  }

  .image-item.loaded {
    opacity: 1;
    transform: translateY(0);
  }
</style>
