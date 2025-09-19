<template>
  <NuxtLayout name="main-content">
    <div class="features-showcase min-h-screen">
      <!-- 3D粒子背景 -->
      <div v-if="showParticles" class="fixed inset-0 w-full h-full particles-background">
        <InParticles3D
          :particle-count="80"
          :colors="['#4ea397', '#22c3aa', '#7bd9a5', '#d0648a', '#f58db2']"
          :interactive="true"
        />
      </div>

      <div class="container mx-auto px-4 py-8">
        <!-- 页面标题 -->
        <div class="text-center mb-12">
          <h1
            class="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            ✨ 博客特色功能展示
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            探索我们为博客系统精心打造的创新功能，提升您的阅读和创作体验
          </p>
        </div>

        <!-- 功能卡片网格 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <!-- AI文章摘要 -->
          <div class="feature-card group">
            <div
              class="card bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105"
            >
              <figure class="px-6 pt-6">
                <div
                  class="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center"
                >
                  <svg
                    class="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
              </figure>
              <div class="card-body">
                <h2 class="card-title text-xl">
                  AI 文章摘要
                </h2>
                <p class="text-gray-600">
                  使用先进的AI技术，自动为长文章生成精准摘要，支持多种风格和长度选择。
                </p>
                <div class="card-actions justify-end mt-4">
                  <NuxtLink to="/tool/ai-summary" class="btn btn-primary btn-sm">
                    立即体验
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>

          <!-- 3D粒子背景 -->
          <div class="feature-card group">
            <div
              class="card bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105"
            >
              <figure class="px-6 pt-6">
                <div
                  class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center"
                >
                  <svg
                    class="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                    />
                  </svg>
                </div>
              </figure>
              <div class="card-body">
                <h2 class="card-title text-xl">
                  3D 粒子背景
                </h2>
                <p class="text-gray-600">
                  沉浸式3D粒子动画背景，支持鼠标交互，为您的博客带来科技感体验。
                </p>
                <div class="card-actions justify-end mt-4">
                  <button class="btn btn-primary btn-sm" @click="toggleParticles">
                    {{ showParticles ? '隐藏' : '显示' }}粒子
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 技术栈雷达图 -->
          <div class="feature-card group">
            <div
              class="card bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105"
            >
              <figure class="px-6 pt-6">
                <div
                  class="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center"
                >
                  <svg
                    class="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </figure>
              <div class="card-body">
                <h2 class="card-title text-xl">
                  技术栈雷达图
                </h2>
                <p class="text-gray-600">
                  可视化展示个人技能水平，支持自定义技能和动态动画效果。
                </p>
                <div class="card-actions justify-end mt-4">
                  <button class="btn btn-primary btn-sm" @click="showTechRadar = true">
                    查看示例
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 阅读进度环 -->
          <div class="feature-card group">
            <div
              class="card bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105"
            >
              <figure class="px-6 pt-6">
                <div
                  class="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center"
                >
                  <svg
                    class="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
              </figure>
              <div class="card-body">
                <h2 class="card-title text-xl">
                  阅读进度环
                </h2>
                <p class="text-gray-600">
                  可视化阅读进度，智能目录导航，让长文阅读更轻松愉悦。
                </p>
                <div class="card-actions justify-end mt-4">
                  <button
                    class="btn btn-primary btn-sm"
                    @click="showProgressRing = !showProgressRing"
                  >
                    {{ showProgressRing ? '隐藏' : '显示' }}进度环
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 更多功能 -->
          <div class="feature-card group">
            <div
              class="card bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105"
            >
              <figure class="px-6 pt-6">
                <div
                  class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center"
                >
                  <svg
                    class="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                    />
                  </svg>
                </div>
              </figure>
              <div class="card-body">
                <h2 class="card-title text-xl">
                  智能工具集
                </h2>
                <p class="text-gray-600">
                  集成更多实用工具：代码运行器、Markdown增强、数据可视化等。
                </p>
                <div class="card-actions justify-end mt-4">
                  <NuxtLink to="/tool" class="btn btn-primary btn-sm"> 探索工具 </NuxtLink>
                </div>
              </div>
            </div>
          </div>

          <!-- 社交功能 -->
          <div class="feature-card group">
            <div
              class="card bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105"
            >
              <figure class="px-6 pt-6">
                <div
                  class="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center"
                >
                  <svg
                    class="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </figure>
              <div class="card-body">
                <h2 class="card-title text-xl">
                  社交网络
                </h2>
                <p class="text-gray-600">
                  访客足迹地图、分享追踪、开发者网络等社交化功能。
                </p>
                <div class="card-actions justify-end mt-4">
                  <button class="btn btn-outline btn-sm" disabled>
                    即将推出
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 技术特色介绍 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div class="card bg-white/90 backdrop-blur-sm shadow-xl">
            <div class="card-body">
              <h2 class="card-title text-2xl mb-4">
                🚀 技术亮点
              </h2>
              <div class="space-y-3">
                <div class="flex items-start gap-3">
                  <div class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <span class="font-semibold">AI 智能化：</span>
                    <span class="text-gray-600">集成先进AI模型，提供智能摘要、情感分析等功能</span>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <span class="font-semibold">3D 可视化：</span>
                    <span class="text-gray-600">Canvas 3D 渲染，带来沉浸式视觉体验</span>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <span class="font-semibold">交互创新：</span>
                    <span class="text-gray-600">鼠标交互、手势控制、语音识别等多模态交互</span>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <span class="font-semibold">性能优化：</span>
                    <span class="text-gray-600">WebWorker、虚拟滚动、懒加载等性能优化技术</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card bg-white/90 backdrop-blur-sm shadow-xl">
            <div class="card-body">
              <h2 class="card-title text-2xl mb-4">
                💡 创新功能
              </h2>
              <div class="space-y-3">
                <div class="flex items-start gap-3">
                  <div class="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <span class="font-semibold">智能推荐：</span>
                    <span class="text-gray-600">基于阅读历史和兴趣的个性化内容推荐</span>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <span class="font-semibold">协作编辑：</span>
                    <span class="text-gray-600">实时协作、版本控制、评论批注</span>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <span class="font-semibold">数据洞察：</span>
                    <span class="text-gray-600">访问分析、用户行为、内容热度可视化</span>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <span class="font-semibold">跨平台：</span>
                    <span class="text-gray-600">PWA、移动端适配、离线阅读支持</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 功能路线图 -->
        <div class="card bg-white/90 backdrop-blur-sm shadow-xl">
          <div class="card-body">
            <h2 class="card-title text-2xl mb-6">
              🗺️ 功能路线图
            </h2>
            <div class="timeline">
              <div class="timeline-item">
                <div class="timeline-marker bg-green-500" />
                <div class="timeline-content">
                  <h3 class="font-semibold text-green-600">
                    已完成
                  </h3>
                  <p class="text-sm text-gray-600">
                    AI文章摘要、3D粒子背景、技术栈雷达图、阅读进度环
                  </p>
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-marker bg-blue-500" />
                <div class="timeline-content">
                  <h3 class="font-semibold text-blue-600">
                    开发中
                  </h3>
                  <p class="text-sm text-gray-600">
                    智能标签推荐、语音播报、代码运行器、协作编辑
                  </p>
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-marker bg-gray-400" />
                <div class="timeline-content">
                  <h3 class="font-semibold text-gray-600">
                    计划中
                  </h3>
                  <p class="text-sm text-gray-600">
                    社交网络、数据大屏、移动端优化、国际化支持
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 技术栈雷达图模态框 -->
      <div
        v-if="showTechRadar"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        @click="showTechRadar = false"
      >
        <div class="bg-white rounded-xl p-6 max-w-4xl max-h-[90vh] overflow-y-auto" @click.stop>
          <TechRadar />
          <div class="mt-4 text-center">
            <button class="btn btn-primary" @click="showTechRadar = false">
              关闭
            </button>
          </div>
        </div>
      </div>

      <!-- 阅读进度环 -->
      <ReadingProgressRing v-if="showProgressRing" :auto-hide="false" style="top: 70px" />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';

definePageMeta({
  title: '特色功能展示',
  description: '探索博客系统的创新功能和技术亮点',
});

const showParticles = ref(true);
const showTechRadar = ref(false);
const showProgressRing = ref(true);

const toggleParticles = () => {
  showParticles.value = !showParticles.value;
  console.log('粒子效果状态:', showParticles.value);
};

onMounted(() => {
  // 确保粒子效果在页面加载后显示
  nextTick(() => {
    showParticles.value = true;
    console.log('页面加载完成，启用粒子效果');
  });
});
useHead({
  title: '特色功能展示 - Blog Home',
  meta: [
    {
      name: 'description',
      content:
          '探索我们为博客系统精心打造的创新功能，包括AI文章摘要、3D粒子背景、技术栈雷达图等特色功能。',
    },
  ],
});
</script>

<style scoped>
  .feature-card {
    transition: transform 0.3s ease;
  }

  .timeline {
    position: relative;
    padding-left: 2rem;
  }

  .timeline::before {
    content: '';
    position: absolute;
    left: 0.75rem;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #e5e7eb;
  }

  .timeline-item {
    position: relative;
    padding-bottom: 2rem;
  }

  .timeline-marker {
    position: absolute;
    left: -2.25rem;
    top: 0.5rem;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .timeline-content {
    padding-left: 1rem;
  }

  /* 粒子背景样式 */
  .particles-background {
    pointer-events: none;
  }

  .particles-background .particle-3d-container {
    width: 100vw;
    height: 100vh;
  }

  .particles-background .particle-canvas {
    pointer-events: auto;
  }

  /* 毛玻璃效果增强 */
  .backdrop-blur-sm {
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
</style>
