<script setup lang="js">
onMounted(() => {});
const imageSrcList = ref([]);
async function selectAndReadDir() {
  try {
    // 请求用户选择目录
    const dirHandle = await window.showDirectoryPicker();
    const files = await traverseDir(dirHandle);
    console.log('目录内容:', files);
    imageSrcList.value = files.map((item) => {
      // console.log(item.content, '---');
      return item;
    });
    console.log('imageSrcList:', imageSrcList.value);
  }
  catch (err) {
    console.error('操作取消或出错:', err);
  }
}

async function traverseDir(dirHandle) {
  const entries = [];
  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'file') {
      // 获取文件对象
      const file = await entry.getFile();
      entries.push({
        name: entry.name,
        path: entry.webkitRelativePath, // 实际可能需要手动构造路径
        // content: file,
        url: URL.createObjectURL(file),
      });
    }
    else if (entry.kind === 'directory') {
      // 递归遍历子目录
      const subEntries = await traverseDir(entry);
      entries.push(...subEntries);
    }
  }
  return entries;
}
</script>

<template>
  <div class="photos-container">
    <div class="tool-btn mt-2 p-6">
      <button
        class="btn"
        @click="selectAndReadDir"
      >
        选择文件夹查看图片
      </button>
    </div>
    <div class="container mx-auto columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 p-6">
      <div
        v-for="(item, index) in imageSrcList"
        :key="item.name + item.path + index"
        class="item mb-4"
      >
        <XiaCardBorderLight :pic="item.url" />
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
  .photos-container {
    .top-banner {
      padding: 30px;
    }
    .xia-carousel {
      height: 500px;
      border-radius: 16px;
    }
  }
</style>
