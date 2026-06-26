<script setup lang="ts">
import { SiteTitle } from '@/utils/constant';

useHead({
  title: 'RPG 冒险攻略',
  titleTemplate: title => `${title} - ${SiteTitle}`,
});

const toc = [
  { id: 'overview', label: '系统概述' },
  { id: 'start', label: '新手入门' },
  { id: 'sign', label: '签到与等级' },
  { id: 'quest', label: '任务与成就' },
  { id: 'inventory', label: '背包与装扮' },
  { id: 'lottery', label: '抽奖与 Buff' },
  { id: 'article', label: '文章成长' },
  { id: 'economy', label: '钻石经济' },
  { id: 'social', label: '社交互动' },
  { id: 'season', label: '赛季与排行' },
  { id: 'punish', label: '生命值与禁言' },
  { id: 'tips', label: '进阶技巧' },
];

const expSources = [
  { source: '每日签到', exp: '10 + 连续奖励', limit: '无' },
  { source: '评论 / 回复 / 留言', exp: '5', limit: '无' },
  { source: '发布文章', exp: '20', limit: '无' },
  { source: '点赞', exp: '2', limit: '10/天' },
  { source: '收藏', exp: '3', limit: '15/天' },
  { source: '每日 / 悬赏任务', exp: '5~15', limit: '见任务说明' },
  { source: '成就 / 抽奖', exp: '5~200', limit: '无' },
];

const levelRewards = [
  { level: 'LV2', frame: '初级头像框', title: '—', currency: '+20 钻石' },
  { level: 'LV5', frame: '中级头像框', title: '青铜达人', currency: '+50 钻石' },
  { level: 'LV10', frame: '高级头像框', title: '白银大师', currency: '+100 钻石' },
  { level: 'LV15', frame: '稀有头像框', title: '黄金传说', currency: '+200 钻石' },
];

const dailyQuests = [
  { name: '每日签到', target: '签到 1 次', exp: '5' },
  { name: '参与评论', target: '评论 2 次', exp: '10' },
  { name: '发布文章', target: '发文 1 篇', exp: '15' },
  { name: '点赞文章', target: '点赞 3 次', exp: '8' },
  { name: '收藏文章', target: '收藏 1 篇', exp: '5' },
  { name: '留言互动', target: '留言 1 条', exp: '5' },
];

const socialActions = [
  { action: '加油', effect: '目标 +10 HP', cost: '免费', limit: '3 次/天' },
  { action: '砸蛋', effect: '目标 -5 HP', cost: '15 钻石', limit: '3 次/天' },
  { action: '送花', effect: '目标 +3 声望', cost: '10 钻石', limit: '5 次/天' },
  { action: '打赏', effect: '作者获得等额钻石', cost: '≥1 钻石', limit: '不可打赏自己' },
];
</script>

<template>
  <CyberPageContainer
    label="RPG GUIDE"
    title="博客 RPG 冒险攻略"
    subtitle="从签到升级到赛季排行，一文掌握全部玩法"
    back-to="/features"
    back-label="返回特性"
    max-width="max-w-4xl"
  >
    <CyberCard class="mb-6 !p-4 md:!p-5">
      <p class="text-sm leading-relaxed text-tech-muted">
        博客 RPG 是一套嵌入站点的游戏化激励体系：你在阅读、创作、互动的同时积累
        <span class="text-primary">经验</span>、 <span class="text-primary">钻石</span>与
        <span class="text-primary">装扮</span>。 入口在导航栏「<NuxtLink
          to="/rpg"
          class="text-primary no-underline hover:underline"
        >⚔️ 冒险</NuxtLink>」，登录后即可参与。
      </p>
      <div class="mt-4 flex flex-wrap gap-2">
        <NuxtLink to="/rpg">
          <CyberButton variant="primary">进入冒险中心</CyberButton>
        </NuxtLink>
        <NuxtLink to="/login">
          <CyberButton variant="secondary">登录 / 注册</CyberButton>
        </NuxtLink>
      </div>
    </CyberCard>

    <nav class="cyber-guide-toc mb-8" aria-label="攻略目录">
      <a v-for="item in toc" :key="item.id" :href="`#${item.id}`">{{ item.label }}</a>
    </nav>

    <!-- 系统概述 -->
    <section id="overview" class="cyber-guide-section mb-8">
      <CyberSectionHeader
        class="mb-4"
        align="left"
        label="OVERVIEW"
        title="系统概述"
        subtitle="七大维度构成完整的冒险体验"
      />
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <CyberCard
          v-for="dim in [
            { icon: '📈', title: '用户成长', desc: '等级、经验、成就、每日任务' },
            { icon: '📖', title: '文章成长', desc: '文章独立等级、神作晋升、作者声望' },
            { icon: '🎒', title: '装扮收集', desc: '背包、称号、头像框、宠物出战' },
            { icon: '🎲', title: '随机惊喜', desc: 'Buff、抽奖、天气加成' },
            { icon: '🤝', title: '社交互动', desc: '打赏、加油/砸蛋/送花、公会' },
            { icon: '❤️', title: '生命值', desc: '敏感词扣血、禁言约束' },
            { icon: '🏆', title: '赛季运营', desc: '活动、排行榜、海报分享' },
          ]"
          :key="dim.title"
          class="!p-4"
        >
          <div class="flex items-start gap-3">
            <span class="text-xl">{{ dim.icon }}</span>
            <div>
              <h4 class="font-semibold text-tech">
                {{ dim.title }}
              </h4>
              <p class="mt-1 text-xs text-tech-subtle">
                {{ dim.desc }}
              </p>
            </div>
          </div>
        </CyberCard>
      </div>
      <CyberAlert variant="info" class="mt-4">
        <p>
          <strong>核心理念：</strong>
          用户等级与文章等级双轨并行；钻石为通用货币（存于背包）；称号、头像框、宠物等均通过背包持有与穿戴展示。
        </p>
      </CyberAlert>
    </section>

    <!-- 新手入门 -->
    <section id="start" class="cyber-guide-section mb-8">
      <CyberSectionHeader
        class="mb-4"
        align="left"
        label="QUICK START"
        title="新手入门"
        subtitle="注册后按此路线最快上手"
      />
      <div class="space-y-3">
        <CyberCard
          v-for="(step, i) in [
            { title: '注册登录', desc: '新用户首次创建 RPG 记录自动获得 200 钻石，可在背包查看。' },
            {
              title: '每日签到',
              desc: '进入冒险中心点击签到，获得经验、HP 恢复和抽奖券，连续签到有额外奖励。',
            },
            {
              title: '完成每日任务',
              desc: '评论、点赞、收藏、留言等日常行为会推进任务，完成后手动领取奖励。',
            },
            {
              title: '穿戴装扮',
              desc: '升级解锁头像框与称号，在背包中装备后在评论、主页等处展示。',
            },
            { title: '探索更多', desc: '尝试抽奖、加入公会、分享赛季海报解锁隐藏成就。' },
          ]"
          :key="step.title"
          class="!p-4"
        >
          <div class="flex gap-3">
            <span
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-sm font-bold text-primary"
            >{{ i + 1 }}</span>
            <div>
              <h4 class="font-semibold text-tech">
                {{ step.title }}
              </h4>
              <p class="mt-1 text-sm text-tech-muted">
                {{ step.desc }}
              </p>
            </div>
          </div>
        </CyberCard>
      </div>
    </section>

    <!-- 签到与等级 -->
    <section id="sign" class="cyber-guide-section mb-8">
      <CyberSectionHeader
        class="mb-4"
        align="left"
        label="SIGN & LEVEL"
        title="签到与等级"
        subtitle="稳定活跃的基础收益来源"
      />
      <CyberCard class="mb-4 !p-4">
        <h4 class="mb-3 font-semibold text-tech">
          签到奖励
        </h4>
        <ul class="space-y-2 text-sm text-tech-muted">
          <li>
            基础经验 <strong class="text-tech">10 EXP</strong>，HP 恢复
            <strong class="text-tech">+5</strong>（上限 100）
          </li>
          <li>
            每日抽奖券 <strong class="text-tech">+1</strong>；连续 7 的倍数天额外
            <strong class="text-tech">+3</strong>
          </li>
          <li>连续 3/7/14/30 天分别额外 +5/+15/+25/+50 经验</li>
          <li>30% 概率随机获得 Buff（经验微增 / 幸运星 / 生命加速）</li>
        </ul>
      </CyberCard>
      <CyberCard class="mb-4 !p-4">
        <h4 class="mb-3 font-semibold text-tech">
          等级公式
        </h4>
        <p class="mb-3 text-sm text-tech-muted">
          Lv.N 所需最低累计经验 = N × (N - 1) × 50。例如 LV2 需 100、LV5 需 1000、LV10 需 4500。
        </p>
        <div class="overflow-x-auto">
          <table class="cyber-data-table">
            <thead>
              <tr>
                <th>等级</th>
                <th>头像框</th>
                <th>称号</th>
                <th>钻石</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in levelRewards" :key="row.level">
                <td>{{ row.level }}</td>
                <td>{{ row.frame }}</td>
                <td>{{ row.title }}</td>
                <td>{{ row.currency }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CyberCard>
      <CyberCard class="!p-4">
        <h4 class="mb-3 font-semibold text-tech">
          经验来源一览
        </h4>
        <div class="overflow-x-auto">
          <table class="cyber-data-table">
            <thead>
              <tr>
                <th>来源</th>
                <th>经验</th>
                <th>每日上限</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in expSources" :key="row.source">
                <td>{{ row.source }}</td>
                <td>{{ row.exp }}</td>
                <td>{{ row.limit }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="mt-3 text-xs text-tech-subtle">
          经验结算时依次叠加：手动激活的 Buff → 进行中活动倍率 → 出战宠物被动 → 天气临时加成。
        </p>
      </CyberCard>
    </section>

    <!-- 任务与成就 -->
    <section id="quest" class="cyber-guide-section mb-8">
      <CyberSectionHeader
        class="mb-4"
        align="left"
        label="QUEST"
        title="任务与成就"
        subtitle="完成任务后需手动领取奖励"
      />
      <CyberCard class="mb-4 !p-4">
        <h4 class="mb-3 font-semibold text-tech">
          每日任务（6 项，每日重置）
        </h4>
        <div class="overflow-x-auto">
          <table class="cyber-data-table">
            <thead>
              <tr>
                <th>任务</th>
                <th>目标</th>
                <th>经验</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="q in dailyQuests" :key="q.name">
                <td>{{ q.name }}</td>
                <td>{{ q.target }}</td>
                <td>{{ q.exp }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="mt-3 text-sm text-tech-muted">
          当天全部每日任务完成并领取后，额外获得
          <strong class="text-primary">+2 张抽奖券</strong>（全勤奖励）。
        </p>
      </CyberCard>
      <CyberCard class="!p-4">
        <h4 class="mb-3 font-semibold text-tech">
          成就体系
        </h4>
        <p class="mb-3 text-sm text-tech-muted">
          共 22 个成就，涵盖创作（发文 1/10/50/100
          篇）、社交（评论/回复/留言）、签到（累计/连续）、探索（点赞/收藏）与等级里程碑。
          另有隐藏成就「海报传播者」——分享赛季海报后解锁。
        </p>
        <p class="text-sm text-tech-muted">
          成就达成后自动发放经验，并通过 `/realtime` WebSocket 实时推送通知。
        </p>
      </CyberCard>
    </section>

    <!-- 背包与装扮 -->
    <section id="inventory" class="cyber-guide-section mb-8">
      <CyberSectionHeader
        class="mb-4"
        align="left"
        label="INVENTORY"
        title="背包与装扮"
        subtitle="可视化你的成长与个性"
      />
      <CyberCard class="mb-4 !p-4">
        <h4 class="mb-3 font-semibold text-tech">
          三个穿戴槽位
        </h4>
        <ul class="space-y-2 text-sm text-tech-muted">
          <li><strong class="text-tech">称号</strong> — 展示在评论、主页等位置</li>
          <li><strong class="text-tech">头像框</strong> — 环绕头像的边框特效</li>
          <li><strong class="text-tech">宠物</strong> — 出战后提供永久经验被动加成</li>
        </ul>
      </CyberCard>
      <CyberCard class="!p-4">
        <h4 class="mb-3 font-semibold text-tech">
          宠物图鉴
        </h4>
        <div class="overflow-x-auto">
          <table class="cyber-data-table">
            <thead>
              <tr>
                <th>宠物</th>
                <th>稀有度</th>
                <th>经验加成</th>
                <th>钻石兑换</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>史莱姆</td>
                <td>普通</td>
                <td>+5%</td>
                <td>50</td>
              </tr>
              <tr>
                <td>灵狐</td>
                <td>稀有</td>
                <td>+8%</td>
                <td>120</td>
              </tr>
              <tr>
                <td>幼龙</td>
                <td>传说</td>
                <td>+12%</td>
                <td>300</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="mt-3 text-xs text-tech-subtle">
          宠物可通过孵化宠物蛋（抽奖获得）或钻石兑换获得。
        </p>
      </CyberCard>
    </section>

    <!-- 抽奖与 Buff -->
    <section id="lottery" class="cyber-guide-section mb-8">
      <CyberSectionHeader
        class="mb-4"
        align="left"
        label="LOTTERY"
        title="抽奖与 Buff"
        subtitle="券/钻石双货币，史诗 90 / 传说 180 独立保底"
      />
      <CyberCard class="mb-4 !p-4">
        <ul class="space-y-2 text-sm text-tech-muted">
          <li>单次可 1~10 连抽</li>
          <li><strong class="text-tech">抽奖券</strong>：1 张/次（签到、全勤、抽奖回流获得）</li>
          <li><strong class="text-tech">钻石</strong>：10/次</li>
          <li>史诗保底：累计 90 次未出史诗/传说，第 90 次强制史诗池</li>
          <li>传说保底：累计 180 次未出传说，第 180 次强制传说池（与史诗计数独立）</li>
          <li>奖品含经验、Buff 卷轴、装扮、宠物蛋、抽奖券等</li>
        </ul>
      </CyberCard>
      <CyberCard class="!p-4">
        <h4 class="mb-3 font-semibold text-tech">
          Buff 类型
        </h4>
        <div class="overflow-x-auto">
          <table class="cyber-data-table">
            <thead>
              <tr>
                <th>名称</th>
                <th>效果</th>
                <th>激活</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>经验微增</td>
                <td>经验 +20%，持续 1 小时</td>
                <td>手动激活</td>
              </tr>
              <tr>
                <td>经验大增</td>
                <td>经验 +50%，持续 30 分钟</td>
                <td>手动激活</td>
              </tr>
              <tr>
                <td>生命加速</td>
                <td>签到 HP 恢复 ×2</td>
                <td>自动</td>
              </tr>
              <tr>
                <td>护盾</td>
                <td>免疫 1 次敏感词扣血</td>
                <td>自动</td>
              </tr>
              <tr>
                <td>幸运星</td>
                <td>签到额外 +5 经验</td>
                <td>自动</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CyberCard>
    </section>

    <!-- 文章成长 -->
    <section id="article" class="cyber-guide-section mb-8">
      <CyberSectionHeader
        class="mb-4"
        align="left"
        label="ARTICLE"
        title="文章成长"
        subtitle="优质内容获得长期价值"
      />
      <CyberCard class="!p-4">
        <p class="mb-3 text-sm text-tech-muted">
          每篇文章拥有独立经验与等级，阈值公式：N × (N - 1) × 20。
        </p>
        <div class="overflow-x-auto">
          <table class="cyber-data-table">
            <thead>
              <tr>
                <th>行为</th>
                <th>文章经验</th>
                <th>作者声望</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>被访问（同访客每日 1 次）</td>
                <td>+1</td>
                <td>+1</td>
              </tr>
              <tr>
                <td>被点赞</td>
                <td>+2</td>
                <td>+2</td>
              </tr>
              <tr>
                <td>被评论</td>
                <td>+3</td>
                <td>+3</td>
              </tr>
              <tr>
                <td>被收藏</td>
                <td>+5</td>
                <td>+5</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="mt-3 text-sm text-tech-muted">
          文章等级 ≥ 10 或经验 ≥ 1000 时晋升为<strong class="text-primary">神作</strong>。
          作者声望每 100 点增加 5% 发文初始经验，上限 +50%。
        </p>
      </CyberCard>
    </section>

    <!-- 钻石经济 -->
    <section id="economy" class="cyber-guide-section mb-8">
      <CyberSectionHeader
        class="mb-4"
        align="left"
        label="ECONOMY"
        title="钻石经济"
        subtitle="通用货币，串联打赏与社交"
      />
      <CyberCard class="!p-4">
        <p class="mb-3 text-sm text-tech-muted">
          钻石存于背包（物品编码 currency），获取途径包括：
        </p>
        <ul class="mb-4 list-inside list-disc space-y-1 text-sm text-tech-muted">
          <li>注册奖励 200、升级奖励、任务奖励</li>
          <li>收到他人打赏</li>
          <li>抽奖部分奖品</li>
          <li>管理员测试充值（运营后台）</li>
        </ul>
        <p class="text-sm text-tech-muted">
          主要消耗：打赏、砸蛋、送花、钻石抽奖、兑换宠物。
        </p>
      </CyberCard>
    </section>

    <!-- 社交互动 -->
    <section id="social" class="cyber-guide-section mb-8">
      <CyberSectionHeader
        class="mb-4"
        align="left"
        label="SOCIAL"
        title="社交互动"
        subtitle="在用户公开主页与文章详情页操作"
      />
      <CyberCard class="!p-4">
        <div class="overflow-x-auto">
          <table class="cyber-data-table">
            <thead>
              <tr>
                <th>操作</th>
                <th>效果</th>
                <th>消耗</th>
                <th>日限</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in socialActions" :key="row.action">
                <td>{{ row.action }}</td>
                <td>{{ row.effect }}</td>
                <td>{{ row.cost }}</td>
                <td>{{ row.limit }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="mt-3 text-sm text-tech-muted">
          点击作者头像可进入其公开主页，查看 RPG
          状态、点赞/收藏的文章，并进行加油、砸蛋、送花等互动。
        </p>
      </CyberCard>
    </section>

    <!-- 赛季与排行 -->
    <section id="season" class="cyber-guide-section mb-8">
      <CyberSectionHeader
        class="mb-4"
        align="left"
        label="SEASON"
        title="赛季与排行"
        subtitle="周期性拉活与竞技"
      />
      <CyberCard class="mb-4 !p-4">
        <h4 class="mb-2 font-semibold text-tech">
          活动与天气
        </h4>
        <p class="text-sm text-tech-muted">
          进行中的赛季/节日活动提供经验倍率加成（取最高倍率）。 天气 Buff
          根据实时天气临时叠加经验（如雨天 +10%）。 分享赛季海报可触发隐藏成就。
        </p>
      </CyberCard>
      <CyberCard class="mb-4 !p-4">
        <h4 class="mb-2 font-semibold text-tech">
          公会
        </h4>
        <p class="text-sm text-tech-muted">
          每人只能加入一个公会，支持创建、加入、退会与公告修改。会长不可直接退会。
        </p>
      </CyberCard>
      <CyberCard class="!p-4">
        <h4 class="mb-2 font-semibold text-tech">
          排行榜
        </h4>
        <p class="text-sm text-tech-muted">
          支持经验、声望、钻石、等级、签到天数等维度；周期含总榜、周榜、月榜、赛季榜。
          入口：<NuxtLink to="/rpg/leaderboard" class="text-primary no-underline hover:underline">排行榜页面</NuxtLink>。
        </p>
      </CyberCard>
    </section>

    <!-- 生命值与禁言 -->
    <section id="punish" class="cyber-guide-section mb-8">
      <CyberSectionHeader
        class="mb-4"
        align="left"
        label="HP & BAN"
        title="生命值与禁言"
        subtitle="文明互动，违规有代价"
      />
      <CyberCard class="!p-4">
        <ul class="space-y-2 text-sm text-tech-muted">
          <li>初始/最大 HP：<strong class="text-tech">100</strong></li>
          <li>敏感词命中：<strong class="text-tech">-20 HP</strong>（护盾可免疫 1 次）</li>
          <li>签到恢复：+5 HP</li>
          <li>累计敏感词每 5 次 → 禁言 72 小时</li>
          <li>HP 归零（第 1/2 次）→ 禁言 24 小时，HP 重置满</li>
          <li>HP 连续 3 次归零 → 禁言 30 天</li>
        </ul>
        <CyberAlert variant="warning" class="mt-4">
          <p>禁言期间无法签到、评论、留言、回复等写入操作。请文明发言。</p>
        </CyberAlert>
      </CyberCard>
    </section>

    <!-- 进阶技巧 -->
    <section id="tips" class="cyber-guide-section">
      <CyberSectionHeader
        class="mb-4"
        align="left"
        label="PRO TIPS"
        title="进阶技巧"
        subtitle="高效玩家的日常路线"
      />
      <div class="space-y-3">
        <CyberCard
          v-for="tip in [
            {
              title: '每日路线',
              desc: '签到 → 领任务 → 评论/点赞/收藏各做一点 → 领全勤抽奖券 → 抽一次奖。',
            },
            { title: 'Buff 策略', desc: '经验类 Buff 需手动激活，建议在发文或做悬赏任务前开启。' },
            { title: '宠物优先', desc: '尽早兑换或孵化宠物并出战，永久经验加成长期收益最高。' },
            { title: '文章运营', desc: '优质文章被互动可累积声望与神作，发文初始经验随声望提升。' },
            {
              title: '实时通知',
              desc: '登录后连接 /realtime WebSocket，升级、成就、禁言、站内通知等即时推送。',
            },
          ]"
          :key="tip.title"
          class="!p-4"
        >
          <h4 class="font-semibold text-tech">
            {{ tip.title }}
          </h4>
          <p class="mt-1 text-sm text-tech-muted">
            {{ tip.desc }}
          </p>
        </CyberCard>
      </div>
    </section>
  </CyberPageContainer>
</template>
