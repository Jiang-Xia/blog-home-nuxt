<template>
  <div class="tech-radar-container">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">
          <xia-icon icon="blog-code" />
          技术栈雷达图
        </h2>

        <!-- 控制面板 -->
        <div class="mb-4 space-y-2">
          <div class="flex gap-4 items-center">
            <label class="label">
              <span class="label-text">显示动画</span>
            </label>
            <input v-model="showAnimation" type="checkbox" class="checkbox checkbox-primary">

            <label class="label ml-4">
              <span class="label-text">显示网格</span>
            </label>
            <input v-model="showGrid" type="checkbox" class="checkbox checkbox-primary">
          </div>

          <div class="flex gap-2">
            <button
              v-for="preset in presets"
              :key="preset.name"
              class="btn btn-sm btn-outline"
              :class="{ 'btn-active': currentPreset === preset.name }"
              @click="loadPreset(preset.name)"
            >
              {{ preset.name }}
            </button>
          </div>
        </div>

        <!-- 雷达图 -->
        <div class="radar-wrapper">
          <canvas
            ref="canvasRef"
            :width="canvasSize"
            :height="canvasSize"
            class="radar-canvas"
            @mousemove="onMouseMove"
            @mouseleave="onMouseLeave"
          />

          <!-- 图例 -->
          <div class="legend mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
            <div
              v-for="(skill, index) in skills"
              :key="skill.name"
              class="legend-item flex items-center gap-2 p-2 rounded hover:bg-gray-50"
              :class="{ 'bg-blue-50': hoveredSkill === index }"
              @mouseenter="hoveredSkill = index"
              @mouseleave="hoveredSkill = -1"
            >
              <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: skill.color }" />
              <span class="text-sm">{{ skill.name }}</span>
              <span class="text-xs text-gray-500 ml-auto">{{ skill.level }}%</span>
            </div>
          </div>
        </div>

        <!-- 技能编辑 -->
        <div class="mt-6">
          <h3 class="text-lg font-semibold mb-3">
            编辑技能
          </h3>
          <div class="space-y-3">
            <div
              v-for="(skill, index) in skills"
              :key="skill.name"
              class="flex items-center gap-3 p-3 border rounded-lg"
            >
              <input
                v-model="skill.name"
                class="input input-sm input-bordered flex-1"
                placeholder="技能名称"
              >
              <input v-model="skill.color" type="color" class="w-10 h-8 rounded border">
              <input
                v-model.number="skill.level"
                type="range"
                min="0"
                max="100"
                class="range range-primary flex-1"
              >
              <span class="text-sm w-12">{{ skill.level }}%</span>
              <button class="btn btn-sm btn-error btn-outline" @click="removeSkill(index)">
                删除
              </button>
            </div>

            <button class="btn btn-sm btn-primary" @click="addSkill">
              添加技能
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';

interface Skill {
  name: string;
  level: number;
  color: string;
}

const canvasRef = ref<HTMLCanvasElement>();
const canvasSize = 400;
const centerX = canvasSize / 2;
const centerY = canvasSize / 2;
const maxRadius = 180;

const showAnimation = ref(true);
const showGrid = ref(true);
const hoveredSkill = ref(-1);
const currentPreset = ref('前端开发');

// 预设技能组合
const presets = [
  {
    name: '前端开发',
    skills: [
      { name: 'Vue.js', level: 90, color: '#4FC08D' },
      { name: 'React', level: 85, color: '#61DAFB' },
      { name: 'JavaScript', level: 95, color: '#F7DF1E' },
      { name: 'TypeScript', level: 80, color: '#3178C6' },
      { name: 'CSS', level: 85, color: '#1572B6' },
      { name: 'HTML', level: 95, color: '#E34F26' },
      { name: 'Webpack', level: 70, color: '#8DD6F9' },
      { name: 'Node.js', level: 75, color: '#339933' },
    ],
  },
  {
    name: '全栈开发',
    skills: [
      { name: 'Node.js', level: 85, color: '#339933' },
      { name: 'Python', level: 80, color: '#3776AB' },
      { name: 'Java', level: 75, color: '#ED8B00' },
      { name: 'MySQL', level: 80, color: '#4479A1' },
      { name: 'MongoDB', level: 70, color: '#47A248' },
      { name: 'Redis', level: 75, color: '#DC382D' },
      { name: 'Docker', level: 70, color: '#2496ED' },
      { name: 'AWS', level: 65, color: '#FF9900' },
    ],
  },
  {
    name: '移动开发',
    skills: [
      { name: 'React Native', level: 80, color: '#61DAFB' },
      { name: 'Flutter', level: 75, color: '#02569B' },
      { name: 'Swift', level: 70, color: '#FA7343' },
      { name: 'Kotlin', level: 65, color: '#7F52FF' },
      { name: 'Xamarin', level: 60, color: '#3498DB' },
      { name: 'Ionic', level: 70, color: '#3880FF' },
    ],
  },
];

const skills = ref<Skill[]>([...presets[0].skills]);

let ctx: CanvasRenderingContext2D | null = null;
let animationProgress = 0;
let animationId = 0;

// 添加技能
const addSkill = () => {
  skills.value.push({
    name: '新技能',
    level: 50,
    color: '#' + Math.floor(Math.random() * 16777215).toString(16),
  });
};

// 删除技能
const removeSkill = (index: number) => {
  skills.value.splice(index, 1);
};

// 加载预设
const loadPreset = (presetName: string) => {
  currentPreset.value = presetName;
  const preset = presets.find(p => p.name === presetName);
  if (preset) {
    skills.value = [...preset.skills];
  }
};

// 绘制网格
const drawGrid = () => {
  if (!ctx || !showGrid.value) return;

  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;

  // 绘制同心圆
  for (let i = 1; i <= 5; i++) {
    const radius = (maxRadius / 5) * i;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 绘制射线
  const angleStep = (Math.PI * 2) / skills.value.length;
  for (let i = 0; i < skills.value.length; i++) {
    const angle = i * angleStep - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.cos(angle) * maxRadius, centerY + Math.sin(angle) * maxRadius);
    ctx.stroke();
  }
};

// 绘制标签
const drawLabels = () => {
  if (!ctx) return;

  ctx.fillStyle = '#374151';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';

  const angleStep = (Math.PI * 2) / skills.value.length;
  for (let i = 0; i < skills.value.length; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const labelRadius = maxRadius + 20;
    const x = centerX + Math.cos(angle) * labelRadius;
    const y = centerY + Math.sin(angle) * labelRadius;

    // 高亮悬停的技能
    if (hoveredSkill.value === i) {
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 13px sans-serif';
    }
    else {
      ctx.fillStyle = '#374151';
      ctx.font = '12px sans-serif';
    }

    ctx.fillText(skills.value[i].name, x, y + 4);
  }
};

// 绘制数据区域
const drawDataArea = () => {
  if (!ctx || skills.value.length === 0) return;

  const angleStep = (Math.PI * 2) / skills.value.length;
  const progress = showAnimation.value ? animationProgress : 1;

  // 绘制填充区域
  ctx.beginPath();
  for (let i = 0; i < skills.value.length; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const level = skills.value[i].level * progress;
    const radius = (level / 100) * maxRadius;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    if (i === 0) {
      ctx.moveTo(x, y);
    }
    else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();

  // 渐变填充
  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
  gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
  gradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)');
  ctx.fillStyle = gradient;
  ctx.fill();

  // 描边
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 绘制数据点
  for (let i = 0; i < skills.value.length; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const level = skills.value[i].level * progress;
    const radius = (level / 100) * maxRadius;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    // 数据点
    ctx.beginPath();
    ctx.arc(x, y, hoveredSkill.value === i ? 6 : 4, 0, Math.PI * 2);
    ctx.fillStyle = skills.value[i].color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 显示数值
    if (hoveredSkill.value === i) {
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${skills.value[i].level}%`, x, y - 10);
    }
  }
};

// 绘制等级标识
const drawLevelLabels = () => {
  if (!ctx || !showGrid.value) return;

  ctx.fillStyle = '#9ca3af';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'left';

  for (let i = 1; i <= 5; i++) {
    const level = i * 20;
    const radius = (maxRadius / 5) * i;
    ctx.fillText(`${level}%`, centerX + radius + 5, centerY - 5);
  }
};

// 主绘制函数
const draw = () => {
  if (!ctx) return;

  // 清空画布
  ctx.clearRect(0, 0, canvasSize, canvasSize);

  // 绘制各部分
  drawGrid();
  drawLevelLabels();
  drawDataArea();
  drawLabels();
};

// 动画循环
const animate = () => {
  if (showAnimation.value && animationProgress < 1) {
    animationProgress += 0.02;
    draw();
    animationId = requestAnimationFrame(animate);
  }
  else {
    animationProgress = 1;
    draw();
  }
};

// 重新开始动画
const restartAnimation = () => {
  animationProgress = 0;
  animate();
};

// 鼠标事件
const onMouseMove = (event: MouseEvent) => {
  const rect = canvasRef.value?.getBoundingClientRect();
  if (!rect) return;

  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // 检测是否悬停在某个技能点上
  const angleStep = (Math.PI * 2) / skills.value.length;
  let newHoveredSkill = -1;

  for (let i = 0; i < skills.value.length; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const radius = (skills.value[i].level / 100) * maxRadius;
    const pointX = centerX + Math.cos(angle) * radius;
    const pointY = centerY + Math.sin(angle) * radius;

    const distance = Math.sqrt((x - pointX) ** 2 + (y - pointY) ** 2);
    if (distance < 15) {
      newHoveredSkill = i;
      break;
    }
  }

  if (newHoveredSkill !== hoveredSkill.value) {
    hoveredSkill.value = newHoveredSkill;
    draw();
  }
};

const onMouseLeave = () => {
  hoveredSkill.value = -1;
  draw();
};

onMounted(() => {
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d');
    animate();
  }
});

// 监听技能变化
watch(
  skills,
  () => {
    nextTick(() => {
      restartAnimation();
    });
  },
  { deep: true },
);

watch([showGrid, showAnimation], () => {
  if (showAnimation.value) {
    restartAnimation();
  }
  else {
    draw();
  }
});
</script>

<style scoped>
  .tech-radar-container {
    max-width: 800px;
    margin: 0 auto;
  }

  .radar-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .radar-canvas {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    cursor: crosshair;
  }

  .legend-item {
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .legend-item:hover {
    transform: translateY(-1px);
  }
</style>
