<script setup lang="ts">
import {
  BOUNDARY_ITEMS,
  CONTACT,
  GITHUB_REPOS,
  LICENSE_AGREEMENT_NOTE,
  OPEN_SOURCE_FAQ,
  OPEN_SOURCE_NOTICE,
  OPEN_SOURCE_PAGE_URL,
  PAID_PLANS,
} from '@/constants/open-source';
import { SiteTitle } from '@/utils/constant';

useHead({
  title: '开源与合作',
  titleTemplate: title => `${title} - ${SiteTitle}`,
});

const repoRows = [
  { ...GITHUB_REPOS.home, role: '用户前台（本站点）' },
  { ...GITHUB_REPOS.admin, role: '管理后台' },
  { ...GITHUB_REPOS.server, role: '后端 API（NestJS）' },
];

const consultMailSubject = encodeURIComponent('博客三端咨询 - ');
const consultMailBody = encodeURIComponent(
  '你好，我想咨询：\n- 目标：本地体验 / 源码学习 / 商用部署 / 功能定制\n- 当前情况：\n- 期望档位：部署入门 / 源码授权 / 定制二开\n',
);
</script>

<template>
  <CyberPageContainer
    label="OPEN SOURCE"
    title="开源与合作"
    subtitle="三端架构说明、开源边界、付费套餐与源码授权"
  >
    <CyberAlert class="mb-6" variant="info">
      {{ OPEN_SOURCE_NOTICE }}
    </CyberAlert>

    <CyberCard class="mb-8 !p-6 text-center">
      <p class="text-sm text-tech-muted">
        完整跑通线上同款博客（RPG、支付、RBAC、实时推送）需要后端服务。 前台与管理端可自由 Fork
        学习；后端源码与部署支持请按套餐联系作者。
      </p>
      <div class="mt-4 flex flex-wrap items-center justify-center gap-3">
        <a
          :href="`mailto:${CONTACT.email}?subject=${consultMailSubject}&body=${consultMailBody}`"
          class="cyber-btn-primary"
        >
          邮件咨询
        </a>
        <CyberButton variant="secondary" to="/about">
          关于我 · 微信
        </CyberButton>
        <a
          :href="GITHUB_REPOS.home.url"
          target="_blank"
          rel="noopener noreferrer"
          class="cyber-btn-secondary"
        >
          Star 前台仓库
        </a>
      </div>
      <p class="mt-3 text-xs text-tech-faint">
        添加微信 {{ CONTACT.wechat }} 时请说明目标场景，回复更快
      </p>
    </CyberCard>

    <section class="mb-8">
      <h2 class="mb-4 text-xl font-bold text-tech">
        项目组成
      </h2>
      <p class="mb-4 text-sm leading-relaxed text-tech-muted">
        江夏 Blog 采用前后端分离的三端架构：Nuxt3 前台、Vue3 管理端、NestJS 后端。 你可以直接 Fork
        前台与后台仓库学习 UI 与交互；完整跑通线上同款能力需要后端服务（闭源）。
      </p>
      <div class="grid gap-4 md:grid-cols-3">
        <CyberCard
          v-for="repo in repoRows"
          :key="repo.name"
          hover
          :class="repo.open ? '' : 'border-primary/30'"
        >
          <div class="mb-3 flex items-center justify-between gap-2">
            <h3 class="text-lg font-semibold text-tech">
              {{ repo.label }}
            </h3>
            <span :class="['badge badge-sm', repo.open ? 'badge-success' : 'badge-warning']">
              {{ repo.open ? repo.license : '闭源' }}
            </span>
          </div>
          <p class="mb-4 text-sm text-tech-subtle">
            {{ repo.role }}
          </p>
          <a
            v-if="repo.open && repo.url"
            :href="repo.url"
            target="_blank"
            rel="noopener noreferrer"
            class="link link-primary text-sm"
          >
            GitHub 仓库 →
          </a>
          <p v-else class="text-sm text-tech-muted">
            不提供公开仓库；私有化部署与源码授权请见下方套餐。
          </p>
        </CyberCard>
      </div>
    </section>

    <section class="mb-8">
      <h2 class="mb-4 text-xl font-bold text-tech">
        边界说明
      </h2>
      <div class="grid gap-4 lg:grid-cols-3">
        <CyberCard v-for="block in BOUNDARY_ITEMS" :key="block.title" class="!p-5">
          <h3 class="mb-3 text-base font-semibold text-tech">
            {{ block.title }}
          </h3>
          <ul class="space-y-2 text-sm leading-relaxed text-tech-muted">
            <li v-for="item in block.items" :key="item">
              · {{ item }}
            </li>
          </ul>
        </CyberCard>
      </div>
    </section>

    <section class="mb-8">
      <h2 class="mb-4 text-xl font-bold text-tech">
        为什么后端闭源
      </h2>
      <CyberCard class="!p-6">
        <ul class="space-y-2 text-sm leading-relaxed text-tech-muted">
          <li>· 降低公网扫描与针对性攻击面（鉴权、支付、RPG 经济等核心逻辑不公开）。</li>
          <li>· 后端含大量业务定制与运维细节，更适合按需授权与付费答疑，而非一次性裸仓库。</li>
          <li>· 前台与管理端仍 MIT 开源，欢迎 Star、PR 与 UI/交互层面的共建。</li>
        </ul>
      </CyberCard>
    </section>

    <section class="mb-8">
      <h2 class="mb-2 text-xl font-bold text-tech">
        付费套餐
      </h2>
      <p class="mb-1 text-sm text-tech-subtle">
        价格均为<strong class="text-tech">起价</strong>，对应最低交付；确认付款前会书面核对交付清单。
      </p>
      <p class="mb-4 text-xs text-tech-faint">
        赞赏（关于页）= 自愿支持，不含答疑；以下套餐 = 明确交付的技术服务。
      </p>
      <div class="grid gap-4 lg:grid-cols-3">
        <CyberCard
          v-for="plan in PAID_PLANS"
          :key="plan.id"
          hover
          :class="[
            'relative flex flex-col !p-6',
            plan.highlight && 'border-primary/40 shadow-lg shadow-primary/10',
          ]"
        >
          <span v-if="plan.badge" class="badge badge-primary absolute right-4 top-4">
            {{ plan.badge }}
          </span>
          <h3 class="text-lg font-semibold text-tech">
            {{ plan.name }}
          </h3>
          <p class="mt-2 text-2xl font-bold text-primary">
            {{ plan.price }}
          </p>
          <p class="mt-1 text-xs font-medium text-primary/80">
            {{ plan.priceNote }}
          </p>
          <p v-if="plan.compareNote" class="mt-1 text-xs text-tech-faint">
            {{ plan.compareNote }}
          </p>
          <p class="mt-3 text-sm text-tech-subtle">
            {{ plan.desc }}
          </p>

          <div class="mt-4">
            <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-tech-muted">
              包含能力
            </p>
            <ul class="space-y-1.5 text-sm text-tech-muted">
              <li v-for="item in plan.features" :key="item">
                ✓ {{ item }}
              </li>
            </ul>
          </div>

          <div class="mt-4 flex-1">
            <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-tech-muted">
              标准交付物
            </p>
            <ul class="space-y-1.5 text-sm text-tech">
              <li v-for="item in plan.deliverables" :key="item">
                📦 {{ item }}
              </li>
            </ul>
          </div>

          <div class="mt-4 border-t border-tech pt-4">
            <p class="mb-2 text-xs font-semibold text-tech-subtle">
              不含
            </p>
            <ul class="space-y-1 text-xs text-tech-faint">
              <li v-for="item in plan.notIncluded" :key="item">
                ✕ {{ item }}
              </li>
            </ul>
          </div>
        </CyberCard>
      </div>
    </section>

    <section class="mb-8">
      <h2 class="mb-4 text-xl font-bold text-tech">
        常见问题
      </h2>
      <div class="space-y-3">
        <CyberCard v-for="item in OPEN_SOURCE_FAQ" :key="item.q" class="!p-5">
          <h3 class="text-sm font-semibold text-tech">
            {{ item.q }}
          </h3>
          <p class="mt-2 text-sm leading-relaxed text-tech-muted">
            {{ item.a }}
          </p>
        </CyberCard>
      </div>
    </section>

    <section class="mb-8">
      <CyberAlert variant="info">
        <p class="text-sm leading-relaxed">
          <strong class="text-tech">{{ LICENSE_AGREEMENT_NOTE.title }}：</strong>
          {{ LICENSE_AGREEMENT_NOTE.body }}
          <a
            :href="LICENSE_AGREEMENT_NOTE.docUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="link link-primary ml-1"
          >
            {{ LICENSE_AGREEMENT_NOTE.docLabel }}
          </a>
        </p>
      </CyberAlert>
    </section>

    <section>
      <h2 class="mb-4 text-xl font-bold text-tech">
        联系作者
      </h2>
      <CyberCard class="!p-6">
        <p class="text-sm leading-relaxed text-tech-muted">
          请说明：目标（本地体验 / 源码 / 商用 / 定制）、技术栈熟悉程度、期望档位。
          确认交付清单与价格后再付款。
        </p>
        <dl class="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt class="text-tech-subtle">
              邮箱
            </dt>
            <dd>
              <a :href="`mailto:${CONTACT.email}`" class="link link-hover text-tech">
                {{ CONTACT.email }}
              </a>
            </dd>
          </div>
          <div>
            <dt class="text-tech-subtle">
              微信
            </dt>
            <dd class="text-tech">
              {{ CONTACT.wechat }}
            </dd>
          </div>
          <div class="sm:col-span-2">
            <dt class="text-tech-subtle">
              说明页链接（可转发）
            </dt>
            <dd>
              <a :href="OPEN_SOURCE_PAGE_URL" class="link link-primary text-sm">
                {{ OPEN_SOURCE_PAGE_URL }}
              </a>
            </dd>
          </div>
        </dl>
        <div class="mt-6 flex flex-wrap gap-3">
          <a
            :href="`mailto:${CONTACT.email}?subject=${consultMailSubject}&body=${consultMailBody}`"
            class="cyber-btn-primary"
          >
            发送咨询邮件
          </a>
          <CyberButton variant="secondary" to="/about">
            关于我
          </CyberButton>
        </div>
      </CyberCard>
    </section>
  </CyberPageContainer>
</template>
