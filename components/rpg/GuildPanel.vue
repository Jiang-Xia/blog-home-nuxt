<script setup lang="ts">
/** 公会面板：已加入视角（信息+统计+成员列表）/ 未加入视角（空态+公会列表）；头像/昵称可跳转用户主页 */
import { getGuildRoleLabel } from '~~/types/rpg';
import { resolveStaticUrl } from '@/utils/static-url';

const props = defineProps<{
  myGuild: any;
  guildList: any[];
  loading: boolean;
}>();

const emit = defineEmits<{
  create: [name: string];
  join: [guildId: number];
  leave: [];
}>();

const guildName = ref('');
const userInfo = useUserInfo();

const isLeader = computed(() => {
  const uid = userInfo.value?.uid;
  return !!uid && props.myGuild?.leaderUid === uid;
});

/** joinTime → YYYY-MM-DD（后端字段缺失时隐藏） */
const formatJoinTime = (t?: string | null) => {
  if (!t) return '';
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/* ── v6/H 公会列表徽章行：徽章主色按 id 哈希取四档色，图标双手/盾交替 ── */
const GUILD_TONES = ['gold', 'violet', 'green', 'blue'] as const;
const GUILD_ICONS = ['hands', 'shield'] as const;

const guildTone = (id: number) => GUILD_TONES[(Number(id) || 0) % GUILD_TONES.length];
const guildIcon = (id: number) => GUILD_ICONS[(Number(id) || 0) % GUILD_ICONS.length];
</script>

<template>
  <div class="guild-panel">
    <RpgPanelLoading v-if="loading" compact />

    <!-- ① 已加入视角：徽章 + 公告 + 统计 + 成员列表 -->
    <div v-else-if="myGuild" class="rpg-loot-card rpg-loot-card--active guild-mine">
      <div class="guild-head">
        <img class="guild-head__emblem" src="/rpg/icons/shield.png" alt="公会徽章" loading="lazy">
        <div class="guild-head__text">
          <h3 class="guild-head__name">
            {{ myGuild.name }}
            <span
              class="guild-role"
              :class="isLeader ? 'guild-role--leader' : 'guild-role--member'"
            >
              {{ isLeader ? '会长' : '成员' }}
            </span>
          </h3>
          <p class="guild-head__announcement">
            {{ myGuild.announcement || '暂无公告' }}
          </p>
        </div>
      </div>

      <div class="guild-stats">
        <div class="guild-stat">
          <b><img class="guild-stat__art" src="/rpg/icons/hands.png" alt="" loading="lazy">
            {{ myGuild.memberCount }}</b>
          <span>成员</span>
        </div>
        <div class="guild-stat">
          <b>#{{ myGuild.id }}</b>
          <span>公会 ID</span>
        </div>
        <div class="guild-stat">
          <b>{{ isLeader ? '会长' : '成员' }}</b>
          <span>我的身份</span>
        </div>
      </div>

      <div v-if="myGuild.members?.length" class="guild-members">
        <NuxtLink
          v-for="m in myGuild.members"
          :key="m.uid"
          :to="`/user/${m.uid}`"
          class="guild-member"
          :title="`查看 ${m.nickname} 的主页`"
        >
          <span class="guild-member__avatar">
            <img v-if="m.avatar" :src="resolveStaticUrl(m.avatar)" :alt="m.nickname">
            <span v-else class="guild-member__fallback">{{ m.nickname?.charAt(0) || '?' }}</span>
          </span>
          <span class="guild-member__who">
            <b>
              {{ m.nickname }}
              <span
                class="guild-role"
                :class="m.role === 'leader' ? 'guild-role--leader' : 'guild-role--member'"
              >{{ getGuildRoleLabel(m.role) }}</span>
            </b>
            <small v-if="formatJoinTime(m.joinTime)" class="guild-member__join">
              {{ formatJoinTime(m.joinTime) }} 加入
            </small>
          </span>
        </NuxtLink>
      </div>

      <div class="rpg-loot-footer mt-2">
        <button
          v-if="!isLeader"
          class="rpg-loot-card-strip w-full rounded-b-[12px]"
          @click="emit('leave')"
        >
          退出公会
        </button>
        <span v-else class="rpg-loot-status rpg-loot-status--pending w-full justify-center">
          会长不可直接退出
        </span>
      </div>
    </div>

    <!-- ② 未加入视角：空态引导 + 创建 + 公会列表 -->
    <div v-else class="space-y-4">
      <div class="rpg-loot-card guild-empty-card">
        <div class="guild-empty">
          <img class="guild-empty__art" src="/rpg/icons/hands.png" alt="" loading="lazy">
          <b class="guild-empty__title">还没有加入公会</b>
          <p class="guild-empty__text">
            浏览下方公会列表，或创建属于你的公会。<br>创建/加入都会推进对应成就与任务。
          </p>
        </div>
        <div class="guild-create">
          <input
            v-model="guildName"
            class="input input-sm input-bordered flex-1"
            placeholder="输入公会名称"
            maxlength="20"
          >
          <button
            class="rpg-pet-btn rpg-pet-btn--primary"
            @click="
              emit('create', guildName);
              guildName = '';
            "
          >
            创建公会
          </button>
        </div>
      </div>

      <div>
        <h4 class="rpg-section-heading">
          公会列表 <small class="guild-section-sub">GET guilds</small>
        </h4>
        <div v-if="!guildList.length" class="rpg-empty-inline">
          暂无可加入的公会
        </div>
        <div v-else class="guild-list">
          <div
            v-for="g in guildList"
            :key="g.id"
            class="guild-grow"
            :class="`guild-grow--${guildTone(g.id)}`"
          >
            <div class="guild-grow__emb">
              <img :src="`/rpg/icons/${guildIcon(g.id)}.png`" alt="" loading="lazy">
            </div>
            <div class="guild-grow__info">
              <b>{{ g.name }}</b>
              <span>{{ g.memberCount }} 名成员 · 招募中</span>
            </div>
            <div class="guild-avstack">
              <span class="guild-avstack__more">+{{ g.memberCount }}</span>
            </div>
            <button type="button" class="guild-grow__join" @click="emit('join', g.id)">
              加入
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* v6/G：成员数美术小图 */
  .guild-stat__art {
    width: 14px;
    height: 14px;
    object-fit: contain;
    vertical-align: -2px;
    margin-right: 2px;
  }

  .guild-section-sub {
    font-size: 11px;
    font-weight: 500;
    color: var(--rpg-text-muted, oklch(var(--bc) / 0.55));
    margin-left: 6px;
  }

  .guild-mine {
    padding: 16px 18px;
  }

  /* ── 公会头部 ── */
  .guild-head {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .guild-head__emblem {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid var(--rpg-art-gold, #d9a13c);
    box-shadow: 0 8px 18px rgb(217 161 60 / 0.3);
    flex-shrink: 0;
  }

  .guild-head__name {
    margin: 0;
    font-size: 17px;
    font-weight: 800;
    color: var(--rpg-text-heading, oklch(var(--bc)));
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .guild-head__announcement {
    margin: 4px 0 0;
    font-size: 12px;
    line-height: 1.6;
    color: var(--rpg-text-muted, oklch(var(--bc) / 0.6));
  }

  /* ── 职位徽章 ── */
  .guild-role {
    display: inline-block;
    font-size: 10px;
    font-weight: 800;
    padding: 2px 9px;
    border-radius: 999px;
  }

  .guild-role--leader {
    background: var(--rpg-art-gold-grad);
    color: var(--rpg-art-gold-ink, #3a2408);
  }

  .guild-role--member {
    background: var(--rpg-art-violet-soft, #f1edfb);
    color: var(--rpg-art-violet-deep, #5b3fd6);
  }

  /* ── 统计三格 ── */
  .guild-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-top: 14px;
  }

  .guild-stat {
    background: var(--rpg-bg-alt, oklch(var(--b2)));
    border: 1px solid var(--rpg-border-subtle, oklch(var(--b3)));
    border-radius: 12px;
    padding: 10px 8px;
    text-align: center;
  }

  .guild-stat b {
    font-size: 15px;
    display: block;
    color: var(--rpg-text-heading, oklch(var(--bc)));
  }

  .guild-stat span {
    font-size: 10.5px;
    color: var(--rpg-text-muted, oklch(var(--bc) / 0.55));
  }

  /* ── 成员列表 ── */
  .guild-members {
    margin-top: 14px;
    display: flex;
    flex-direction: column;
  }

  .guild-member {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 2px;
    border-bottom: 1px solid var(--rpg-border-subtle, oklch(var(--b3)));
    font-size: 13px;
    text-decoration: none;
    color: inherit;
    transition: background 0.15s;
  }

  .guild-member:last-child {
    border-bottom: 0;
  }

  .guild-member:hover {
    background: var(--rpg-stat-hover, oklch(var(--b2)));
  }

  .guild-member__avatar {
    display: block;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    overflow: hidden;
    background: var(--rpg-track, oklch(var(--b2)));
    border: 2px solid var(--rpg-surface, #fff);
    box-shadow: 0 0 0 2px var(--rpg-border-subtle, oklch(var(--b3)));
    flex-shrink: 0;
  }

  .guild-member__avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .guild-member__fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-size: 13px;
    font-weight: 700;
    color: var(--rpg-text-secondary, oklch(var(--bc) / 0.7));
  }

  .guild-member__who {
    min-width: 0;
  }

  .guild-member__who b {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--rpg-text-heading, oklch(var(--bc)));
  }

  .guild-member__join {
    display: block;
    font-size: 11px;
    color: var(--rpg-text-muted, oklch(var(--bc) / 0.55));
    margin-top: 1px;
  }

  /* ── 未加入视角 ── */
  .guild-empty-card {
    padding: 18px 16px;
  }

  .guild-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .guild-empty__art {
    width: 84px;
    height: 84px;
    border-radius: 50%;
    object-fit: cover;
    opacity: 0.92;
  }

  .guild-empty__title {
    display: block;
    font-size: 14px;
    margin-top: 8px;
    color: var(--rpg-text-heading, oklch(var(--bc)));
  }

  .guild-empty__text {
    font-size: 12.5px;
    color: var(--rpg-text-muted, oklch(var(--bc) / 0.6));
    margin: 6px 0 14px;
    line-height: 1.7;
  }

  .guild-create {
    display: flex;
    gap: 8px;
    border-top: 1px solid var(--rpg-border-subtle, oklch(var(--b3)));
    padding-top: 14px;
  }

  .rpg-pet-btn {
    border: 0;
    cursor: pointer;
    font-weight: 700;
    font-size: 12.5px;
    padding: 8px 18px;
    border-radius: 10px;
    white-space: nowrap;
    transition:
      filter 0.2s,
      transform 0.15s;
  }

  .rpg-pet-btn:active {
    transform: translateY(1px);
  }

  .rpg-pet-btn--primary {
    background: var(--rpg-art-violet-grad);
    color: #fff;
    box-shadow: var(--rpg-art-shadow-violet);
  }

  .rpg-pet-btn--primary:hover {
    filter: brightness(1.06);
  }

  .rpg-pet-btn--sm {
    font-size: 11.5px;
    padding: 6px 14px;
  }

  /* ── 公会列表行 ── */
  .guild-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  /* ── v6/H 公会徽章行（原型 .grow）── */
  .guild-grow {
    display: flex;
    align-items: center;
    gap: 12px;
    border: 1.5px solid var(--rpg-border-subtle, oklch(var(--b3)));
    border-radius: 14px;
    padding: 10px 14px;
    background: var(--rpg-surface, #fbfaff);
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease;
  }

  .guild-grow:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 18px rgb(60 40 110 / 0.14);
  }

  .guild-grow__emb {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 2.5px solid;
    flex-shrink: 0;
  }

  .guild-grow__emb img {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
  }

  .guild-grow--gold .guild-grow__emb {
    border-color: var(--rpg-art-gold, #d9a13c);
    background: radial-gradient(circle at 34% 30%, #fff8e6, #f0d9a0);
  }

  .guild-grow--violet .guild-grow__emb {
    border-color: var(--rpg-art-violet, #7c5cf0);
    background: radial-gradient(circle at 34% 30%, #f6f2fe, #d9c8f7);
  }

  .guild-grow--green .guild-grow__emb {
    border-color: #22c55e;
    background: radial-gradient(circle at 34% 30%, #f0fdf4, #bbf7d0);
  }

  .guild-grow--blue .guild-grow__emb {
    border-color: #38bdf8;
    background: radial-gradient(circle at 34% 30%, #f0f9ff, #bae6fd);
  }

  .guild-grow__info {
    flex: 1;
    min-width: 0;
  }

  .guild-grow__info b {
    display: block;
    font-size: 12.5px;
    color: var(--rpg-text-heading, oklch(var(--bc)));
  }

  .guild-grow__info span {
    font-size: 10.5px;
    color: var(--rpg-text-muted, oklch(var(--bc) / 0.55));
  }

  .guild-avstack {
    display: flex;
    flex-shrink: 0;
  }

  .guild-avstack__more {
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: #2b2440;
    color: #fff;
    font-size: 9.5px;
    font-weight: 800;
    border: 2px solid #fff;
  }

  html.tech-shell[data-theme='cyber'] .guild-avstack__more {
    background: rgb(255 255 255 / 0.16);
  }

  .guild-grow__join {
    border: none;
    cursor: pointer;
    font-weight: 700;
    font-size: 12px;
    padding: 6px 16px;
    border-radius: 10px;
    background: linear-gradient(135deg, #f0c979, #d9a13c);
    color: #3a2408;
    box-shadow: 0 3px 10px rgb(217 161 60 / 0.35);
    flex-shrink: 0;
    transition: filter 0.15s ease;
  }

  .guild-grow__join:hover {
    filter: brightness(1.06);
  }

  html.tech-shell[data-theme='cyber'] .guild-grow__join {
    color: #241538;
  }

  @media (max-width: 639px) {
    .guild-stats {
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
    }

    .guild-create {
      flex-wrap: wrap;
    }
  }
</style>
