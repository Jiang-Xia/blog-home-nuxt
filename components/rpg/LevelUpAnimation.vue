<script setup lang="ts">
/**
   * 升级动画
   * unlockedRewards 已由后端 enrich（avatarFrame.name、title.name 等）
   */
import type { LevelUpResult } from '~~/types/rpg';
import { resolveRpgItemEmoji } from '~~/utils/rpg-item-icon';

const props = defineProps<{
  visible: boolean;
  levelUpData: LevelUpResult | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { playSfx } = useRpgAudio();

/** 弹窗打开时播放对应庆祝音效（与 Animation 组件展示同步） */
watch(
  () => props.visible,
  (v) => {
    if (v && props.levelUpData) void playSfx('levelUp');
  },
);

const rewards = computed(() => {
  if (!props.levelUpData?.unlockedRewards?.length) return [];
  return props.levelUpData.unlockedRewards.map(r => ({
    level: r.level,
    currencyReward: r.currencyReward || 0,
    currencyName: r.currencyName || '钻石',
    frameName: r.avatarFrame?.name || null,
    frameEmoji: r.avatarFrame ? resolveRpgItemEmoji(r.avatarFrame) : null,
    titleName: r.title?.name || null,
    titleEmoji: r.title ? resolveRpgItemEmoji(r.title) : null,
  }));
});

const handleClose = () => {
  emit('close');
};
</script>

<template>
  <Teleport to="body">
    <Transition name="level-up">
      <div v-if="visible && levelUpData" class="level-up-overlay" @click="handleClose">
        <div class="level-up-modal" @click.stop>
          <div class="level-up-icon" aria-hidden="true">
            <img class="level-up-art" src="/rpg/art/level-up.png" alt="">
          </div>
          <div class="level-up-badge">
            升级！
          </div>
          <div class="level-up-numbers">
            <span class="old-level">LV{{ levelUpData.oldLevel }}</span>
            <span class="arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="26" height="26">
                <path
                  d="M5 12h12M13 7l5 5-5 5"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
            <span class="new-level">LV{{ levelUpData.newLevel }}</span>
          </div>
          <div v-if="rewards.length" class="level-up-rewards">
            <div class="rewards-title">
              解锁奖励
            </div>
            <div v-for="r in rewards" :key="r.level" class="reward-item">
              <span v-if="r.currencyReward" class="reward-diamond">
                <img class="reward-art" src="/rpg/icons/gem.png" alt="">
                <span class="reward-text">{{ r.currencyReward }} {{ r.currencyName }}</span>
              </span>
              <span v-if="r.frameName" class="reward-frame">
                <span class="reward-emoji" aria-hidden="true">{{ r.frameEmoji }}</span>
                <span class="reward-text">{{ r.frameName }}</span>
              </span>
              <span v-if="r.titleName" class="reward-title">
                <span class="reward-emoji" aria-hidden="true">{{ r.titleEmoji }}</span>
                <span class="reward-text">{{ r.titleName }}</span>
              </span>
            </div>
          </div>
          <button class="close-btn" @click="handleClose">
            确定
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
  .level-up-overlay {
    position: fixed;
    inset: 0;
    background: var(--rpg-celebration-overlay, rgb(0 0 0 / 0.88));
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10100;
    isolation: isolate;
  }

  .level-up-modal {
    position: relative;
    /* v2 紫金语言：表面/描边/主文本走 --rpg-celebration-* 令牌（rpg-theme.css 统一管理明暗），
       暗色下为不透明深底 + 金紫提亮描边，避免半透明底叠深色遮罩发浑 */
    background: var(
      --rpg-celebration-modal-bg,
      linear-gradient(165deg, #fdf6e4 0%, #faf3de 45%, #f1edfb 100%)
    );
    border: 2px solid var(--rpg-celebration-modal-border, var(--rpg-art-gold, #d9a13c));
    border-radius: 20px;
    padding: 28px 48px 32px;
    text-align: center;
    box-shadow:
      0 20px 60px rgb(0 0 0 / 0.45),
      0 0 42px rgb(217 161 60 / 0.32);
    min-width: 280px;
    max-width: min(92vw, 380px);
    overflow: hidden;
    animation: modalGlow 2.4s ease-in-out infinite;
  }

  .level-up-icon {
    display: flex;
    justify-content: center;
    margin-bottom: 6px;
    animation: iconBounce 0.85s ease infinite;
    filter: drop-shadow(0 4px 10px rgb(217 161 60 / 0.35));
  }

  .level-up-art {
    width: 96px;
    height: 96px;
    object-fit: contain;
  }

  .level-up-badge {
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 4px;
    color: var(--rpg-celebration-modal-text, var(--rpg-art-violet-deep, #5b3fd6));
    margin-bottom: 12px;
  }

  .level-up-numbers {
    font-size: 36px;
    font-weight: 900;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: var(--rpg-celebration-modal-text, var(--rpg-art-violet-deep, #5b3fd6));
  }

  .old-level {
    color: var(--rpg-art-rare, #8d7bf5);
    text-decoration: line-through;
    opacity: 0.78;
  }

  .arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--rpg-art-gold, #d9a13c);
    margin: 0 6px;
  }

  .new-level {
    color: var(--rpg-celebration-modal-text, var(--rpg-art-violet-deep, #5b3fd6));
  }

  .level-up-rewards {
    margin-bottom: 20px;
  }

  .rewards-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--rpg-celebration-modal-text, var(--rpg-art-violet-deep, #5b3fd6));
    margin-bottom: 8px;
  }

  .reward-item {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;
    align-items: center;
    margin-bottom: 4px;
    font-size: 14px;
    color: var(--rpg-celebration-modal-text, var(--rpg-art-violet-deep, #5b3fd6));
  }

  /* 奖励项 = 图标 + 文本 的不可拆分 chip：内部不再在空格处断行，
     图标（img/emoji）与文本通过 flex align-items:center 对齐同一中线 */
  .reward-diamond,
  .reward-frame,
  .reward-title {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
    max-width: 100%;
  }

  /* 长称号名例外：允许在称号文本内部优雅换行（emoji 固定在首行行首），
     避免移动端用 ellipsis 截断奖励信息 */
  .reward-title {
    white-space: normal;
    flex-wrap: wrap;
  }

  .reward-emoji {
    line-height: 1;
  }

  .close-btn {
    padding: 8px 32px;
    border-radius: 999px;
    background: var(--rpg-art-gold-grad, linear-gradient(135deg, #e8b04b, #d9a13c));
    color: var(--rpg-art-gold-ink, #3a2408);
    font-weight: 700;
    border: none;
    cursor: pointer;
    box-shadow: var(--rpg-art-shadow-gold, 0 6px 16px rgb(217 161 60 / 0.32));
    transition:
      filter var(--rpg-anim-fast, 0.15s) ease,
      transform var(--rpg-anim-fast, 0.15s) ease,
      box-shadow var(--rpg-anim-fast, 0.15s) ease;
  }

  .close-btn:hover {
    filter: brightness(1.06);
    transform: scale(1.03);
    box-shadow: 0 8px 20px rgb(217 161 60 / 0.4);
  }

  @keyframes iconBounce {
    0%,
    100% {
      transform: translateY(0) scale(1);
    }
    50% {
      transform: translateY(-10px) scale(1.12);
    }
  }

  @keyframes modalGlow {
    0%,
    100% {
      box-shadow:
        0 20px 60px rgba(0, 0, 0, 0.3),
        0 0 32px rgb(217 161 60 / 0.24);
    }
    50% {
      box-shadow:
        0 24px 64px rgba(0, 0, 0, 0.35),
        0 0 52px rgb(217 161 60 / 0.42);
    }
  }

  /* 可访问性：全局兜底无法覆盖本组件（Teleport 到 body，不在 .rpg-theme 内），
     此处对无限循环装饰动画单独豁免；入场/退场过渡交由 transition 压缩到令牌时长 */
  @media (prefers-reduced-motion: reduce) {
    .level-up-modal,
    .level-up-icon {
      animation: none;
    }
  }

  .level-up-enter-active,
  .level-up-leave-active {
    transition: opacity var(--rpg-anim-base, 0.24s) ease;
  }

  .level-up-enter-active .level-up-modal,
  .level-up-leave-active .level-up-modal {
    transition:
      transform var(--rpg-anim-base, 0.24s) var(--rpg-anim-ease-out, ease),
      opacity var(--rpg-anim-base, 0.24s) ease;
  }

  .level-up-enter-from,
  .level-up-leave-to {
    opacity: 0;
  }

  .level-up-enter-from .level-up-modal,
  .level-up-leave-to .level-up-modal {
    opacity: 0;
    transform: scale(0.92);
  }
  /* v6/G：货币奖励美术小图。
     改为 flex 布局对齐后不再需要 vertical-align 手调基线；
     flex: none 防止 chip 换行时小图被压缩 */
  .reward-art {
    width: 14px;
    height: 14px;
    object-fit: contain;
    flex: none;
  }
</style>
