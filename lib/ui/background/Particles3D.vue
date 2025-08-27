<template>
  <div ref="containerRef" class="particle-3d-container">
    <canvas
      ref="canvasRef"
      :width="canvasWidth"
      :height="canvasHeight"
      class="particle-canvas"
      @mousemove="onMouseMove"
      @click="onMouseClick"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface Props {
  particleCount?: number;
  colors?: string[];
  interactive?: boolean;
  connectionDistance?: number;
  mouseInfluence?: number;
  animationSpeed?: number;
}

const props = withDefaults(defineProps<Props>(), {
  particleCount: 100,
  colors: () => ['#4ea397', '#22c3aa', '#7bd9a5', '#d0648a', '#f58db2'],
  interactive: true,
  connectionDistance: 150,
  mouseInfluence: 100,
  animationSpeed: 1,
});

const containerRef = ref<HTMLElement>();
const canvasRef = ref<HTMLCanvasElement>();
const canvasWidth = ref(0);
const canvasHeight = ref(0);

let ctx: CanvasRenderingContext2D | null = null;
let particles: Particle[] = [];
let animationId = 0;
const mouse = { x: 0, y: 0, clicked: false };

// 初始化粒子
const createParticle = (): Particle => {
  const colorIndex = Math.floor(Math.random() * props.colors.length);
  const selectedColor = props.colors[colorIndex] || props.colors[0] || '#4ea397';

  return {
    x: Math.random() * canvasWidth.value,
    y: Math.random() * canvasHeight.value,
    z: Math.random() * 1000,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    vz: (Math.random() - 0.5) * 2,
    size: Math.random() * 3 + 1,
    color: selectedColor,
    alpha: Math.random() * 0.8 + 0.2,
    life: 0,
    maxLife: Math.random() * 300 + 200,
  };
};

// 初始化粒子系统
const initParticles = () => {
  particles = [];
  for (let i = 0; i < props.particleCount; i++) {
    particles.push(createParticle());
  }
};

// 更新粒子位置
const updateParticles = () => {
  particles.forEach((particle, index) => {
    // 3D 运动
    particle.x += particle.vx * props.animationSpeed;
    particle.y += particle.vy * props.animationSpeed;
    particle.z += particle.vz * props.animationSpeed;

    // 鼠标交互
    if (props.interactive && mouse.clicked) {
      const dx = mouse.x - particle.x;
      const dy = mouse.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < props.mouseInfluence) {
        const force = (props.mouseInfluence - distance) / props.mouseInfluence;
        particle.vx += dx * force * 0.01;
        particle.vy += dy * force * 0.01;
      }
    }

    // 边界检测
    if (particle.x < 0 || particle.x > canvasWidth.value) {
      particle.vx *= -1;
      particle.x = Math.max(0, Math.min(canvasWidth.value, particle.x));
    }
    if (particle.y < 0 || particle.y > canvasHeight.value) {
      particle.vy *= -1;
      particle.y = Math.max(0, Math.min(canvasHeight.value, particle.y));
    }
    if (particle.z < 0 || particle.z > 1000) {
      particle.vz *= -1;
    }

    // 生命周期
    particle.life += 1;
    if (particle.life > particle.maxLife) {
      particles[index] = createParticle();
    }

    // 3D 透视效果
    const perspective = 800;
    const scale = perspective / (perspective + particle.z);
    particle.alpha = scale * 0.8;
    particle.size = scale * 3 + 1;
  });
};

// 绘制粒子连接线
const drawConnections = () => {
  if (!ctx) return;

  particles.forEach((particleA, indexA) => {
    particles.slice(indexA + 1).forEach((particleB) => {
      const dx = particleA.x - particleB.x;
      const dy = particleA.y - particleB.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < props.connectionDistance && ctx) {
        const alpha = (1 - distance / props.connectionDistance) * 0.3;
        ctx.strokeStyle = `rgba(78, 163, 151, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(particleA.x, particleA.y);
        ctx.lineTo(particleB.x, particleB.y);
        ctx.stroke();
      }
    });
  });
};

// 绘制粒子
const drawParticles = () => {
  if (!ctx) return;

  particles.forEach((particle) => {
    if (!ctx) return;

    ctx.save();
    ctx.globalAlpha = particle.alpha;

    // 创建径向渐变
    const gradient = ctx.createRadialGradient(
      particle.x,
      particle.y,
      0,
      particle.x,
      particle.y,
      particle.size,
    );
    gradient.addColorStop(0, particle.color);
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });
};

// 动画循环
const animate = () => {
  if (!ctx) return;

  // 清空画布
  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value);

  // 更新和绘制
  updateParticles();
  drawConnections();
  drawParticles();

  animationId = requestAnimationFrame(animate);
};

// 鼠标事件处理
const onMouseMove = (event: MouseEvent) => {
  if (!props.interactive) return;

  const rect = canvasRef.value?.getBoundingClientRect();
  if (rect) {
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
  }
};

const onMouseClick = () => {
  if (!props.interactive) return;

  mouse.clicked = true;

  // 在鼠标位置创建爆炸效果
  for (let i = 0; i < 10; i++) {
    const colorIndex = Math.floor(Math.random() * props.colors.length);
    const selectedColor = props.colors[colorIndex] || props.colors[0] || '#4ea397';

    const particle: Particle = {
      x: mouse.x,
      y: mouse.y,
      z: Math.random() * 200,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      vz: (Math.random() - 0.5) * 5,
      size: Math.random() * 5 + 2,
      color: selectedColor,
      alpha: 1,
      life: 0,
      maxLife: 60,
    };
    particles.push(particle);
  }

  setTimeout(() => {
    mouse.clicked = false;
  }, 500);
};

// 调整画布大小
const resizeCanvas = () => {
  if (!containerRef.value || !canvasRef.value) return;

  const rect = containerRef.value.getBoundingClientRect();
  canvasWidth.value = rect.width;
  canvasHeight.value = rect.height;

  // 重新初始化粒子
  initParticles();
};

// 窗口大小变化监听
const handleResize = () => {
  resizeCanvas();
};

onMounted(() => {
  // 确保DOM完全渲染后再初始化
  nextTick(() => {
    if (canvasRef.value) {
      ctx = canvasRef.value.getContext('2d');
      // 延迟一帧确保容器尺寸正确
      requestAnimationFrame(() => {
        resizeCanvas();
        animate();
      });
    }
  });

  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  window.removeEventListener('resize', handleResize);
});

// 监听属性变化，重新初始化
watch(
  () => props.particleCount,
  () => {
    initParticles();
  },
);

watch(
  () => props.colors,
  () => {
    initParticles();
  },
);
</script>

<style scoped>
  .particle-3d-container {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 100vh;
    overflow: hidden;
  }

  .particle-canvas {
    display: block;
    cursor: crosshair;
    width: 100%;
    height: 100%;
  }
</style>
