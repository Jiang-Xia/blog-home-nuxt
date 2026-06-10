<script setup lang="ts">
/**
   * 用户名片卡片 - 展示基础资料，提供进入 RPG 冒险模块入口
   */
const userInfo = useUserInfo();
</script>

<template>
  <div class="business-card">
    <div class="card-hero">
      <div class="avatar-wrap">
        <div class="avatar placeholder">
          <div class="avatar-inner">
            <img v-if="userInfo?.avatar" :src="userInfo.avatar" :alt="userInfo.nickname">
            <span v-else class="avatar-fallback">
              {{ userInfo?.nickname?.charAt(0) || '?' }}
            </span>
          </div>
        </div>
      </div>
      <h3 class="nickname">
        {{ userInfo?.nickname || '访客' }}
      </h3>
      <p v-if="userInfo?.role" class="role-tag">
        {{ userInfo.role }}
      </p>
    </div>

    <div class="card-body">
      <div v-if="userInfo?.intro" class="info-row">
        <span class="info-label">简介</span>
        <p class="info-value">
          {{ userInfo.intro }}
        </p>
      </div>
      <div v-if="userInfo?.homepage" class="info-row">
        <span class="info-label">主页</span>
        <a :href="userInfo.homepage" target="_blank" rel="noopener noreferrer" class="info-link">
          {{ userInfo.homepage }}
        </a>
      </div>
      <div v-if="userInfo?.uid" class="info-row">
        <span class="info-label">UID</span>
        <span class="info-value">{{ userInfo.uid }}</span>
      </div>
      <p v-if="!userInfo?.intro && !userInfo?.homepage" class="empty-tip">
        完善个人资料，让名片更有辨识度
      </p>
    </div>

    <div class="card-footer">
      <NuxtLink to="/rpg" class="rpg-entry-btn">
        <span class="rpg-icon">⚔️</span>
        进入 RPG 冒险
      </NuxtLink>
      <p class="rpg-hint">
        签到、升级、任务与排行榜都在冒险模块
      </p>
    </div>
  </div>
</template>

<style scoped>
  .business-card {
    overflow: hidden;
  }

  .card-hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 0 20px;
    border-bottom: 1px dashed oklch(var(--bc) / 0.12);
  }

  .avatar-wrap {
    margin-bottom: 12px;
  }

  .avatar-inner {
    width: 5rem;
    height: 5rem;
    border-radius: 9999px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: oklch(var(--p));
    color: oklch(var(--pc));
    box-shadow:
      0 0 0 2px oklch(var(--p) / 0.2),
      0 0 0 4px oklch(var(--b1));
  }

  .avatar-inner img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-fallback {
    font-size: 2rem;
    font-weight: 700;
  }

  .nickname {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
  }

  .role-tag {
    margin-top: 6px;
    font-size: 12px;
    padding: 2px 10px;
    border-radius: 9999px;
    background: oklch(var(--p) / 0.12);
    color: oklch(var(--p));
    font-weight: 600;
  }

  .card-body {
    padding: 18px 0;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .info-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .info-label {
    font-size: 12px;
    color: oklch(var(--bc) / 0.5);
    font-weight: 600;
  }

  .info-value {
    font-size: 14px;
    line-height: 1.6;
    margin: 0;
    word-break: break-word;
  }

  .info-link {
    font-size: 14px;
    color: #3b82f6;
    word-break: break-all;
    text-decoration: none;
  }

  .info-link:hover {
    text-decoration: underline;
  }

  .empty-tip {
    font-size: 13px;
    color: oklch(var(--bc) / 0.45);
    text-align: center;
    margin: 0;
  }

  .card-footer {
    padding-top: 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .rpg-entry-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 12px 20px;
    border-radius: 12px;
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    color: #fff;
    font-size: 15px;
    font-weight: 700;
    text-decoration: none;
    transition:
      transform 0.15s,
      box-shadow 0.15s;
    box-shadow: 0 4px 14px rgb(59 130 246 / 0.35);
  }

  .rpg-entry-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgb(59 130 246 / 0.45);
  }

  .rpg-icon {
    font-size: 18px;
  }

  .rpg-hint {
    font-size: 12px;
    color: oklch(var(--bc) / 0.45);
    margin: 0;
    text-align: center;
  }
</style>
