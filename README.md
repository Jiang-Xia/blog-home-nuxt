<div align="center">
  <h1>Blog Home Nuxt</h1>
  <p>基于 Nuxt3 + Vue3 + TypeScript + TailwindCSS 的现代化个人博客系统</p>
</div>

[![license](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Nuxt](https://img.shields.io/badge/Nuxt-3.17.7-00DC82?logo=nuxt.js)](https://nuxt.com/)
[![Vue](https://img.shields.io/badge/Vue-3.5.13-4FC08D?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.6-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

## 📖 项目简介

Blog Home Nuxt 是一个基于现代前端技术栈构建的个人博客系统，采用 Nuxt3 框架开发，提供完整的博客功能和丰富的工具集合。项目具有优秀的用户体验、现代化的UI设计和强大的功能扩展性。

本仓库为博客三端架构中的**用户前台**，配套服务：
- 后端 API：[blog-server](../blog-server)
- 管理后台：[blog-admin](../blog-admin)

## ✨ 主要特性

### 🎨 现代化设计
- **响应式布局**：完美适配桌面端和移动端
- **优雅动画**：流畅的页面过渡和交互动画
- **主题切换**：支持明暗主题模式切换
- **UI组件库**：基于 DaisyUI 和 TailwindCSS 的现代化组件

### 📝 博客功能
- **文章管理**：支持 Markdown 编辑和预览（`md-editor-v3`）
- **分类标签**：完整的文章分类和标签系统
- **评论系统**：支持文章评论和回复功能
- **收藏点赞**：文章收藏与点赞互动
- **搜索功能**：全文搜索和标签筛选
- **归档系统**：按时间归档文章
- **用户中心**：个人资料、前台文章创作

### 🎮 RPG 游戏化
- **冒险中心**：`/rpg` 页面集成签到、成就、任务、抽奖
- **背包装扮**：称号、头像框、宠物穿戴展示
- **社交互动**：文章打赏、加油/砸蛋/送花
- **实时推送**：Socket.IO `/rpg` 命名空间接收升级/禁言等通知
- **公开主页**：用户 RPG 状态在 `/user/:uid` 展示

### 🛠️ 实用工具
- **代码生成器**：条形码、二维码生成
- **图片处理**：图片滤镜、批量处理、导出功能
- **加密工具**：RSA、SM2/SM3/SM4 国密算法
- **音视频工具**：音频可视化、WebRTC 视频聊天
- **文件处理**：PDF 查看、文件上传切片
- **AI 工具**：集成 AI 对话功能
- **开发工具**：截图、延迟测试、UniApp 测试

### 🚀 技术特性
- **SSR/SSG**：支持服务端渲染和静态生成
- **SEO 优化**：自动生成 sitemap，优化搜索引擎收录
- **性能优化**：图片懒加载、代码分割、缓存策略
- **开发体验**：热重载、TypeScript 支持、ESLint 规范

## 🛠️ 技术栈

### 核心框架
- **[Nuxt3](https://nuxt.com/)** - Vue.js 全栈框架
- **[Vue3](https://vuejs.org/)** - 渐进式 JavaScript 框架
- **[TypeScript](https://www.typescriptlang.org/)** - 类型安全的 JavaScript

### 样式与UI
- **[TailwindCSS](https://tailwindcss.com/)** - 实用优先的 CSS 框架
- **[DaisyUI](https://daisyui.com/)** - Tailwind CSS 组件库
- **[Less](https://lesscss.org/)** - CSS 预处理器

### 状态管理
- **[Pinia](https://pinia.vuejs.org/)** - Vue 状态管理库

### 工具库
- **[VueUse](https://vueuse.org/)** - Vue 组合式 API 工具集
- **[Day.js](https://day.js.org/)** - 轻量级日期处理库
- **[CryptoJS](https://cryptojs.gitbook.io/)** - 加密算法库
- **[md-editor-v3](https://github.com/imzbf/md-editor-v3)** - Markdown 编辑器与预览
- **[Socket.IO Client](https://socket.io/)** - RPG 实时通信

### 开发工具
- **[ESLint](https://eslint.org/)** - 代码质量检查
- **[Prettier](https://prettier.io/)** - 代码格式化
- **[Husky](https://typicode.github.io/husky/)** - Git hooks 工具
- **[Commitlint](https://commitlint.js.org/)** - 提交信息规范

## 📁 项目结构

```
blog-home-nuxt/
├── api/                    # API 接口定义（含 rpg.ts）
├── app.vue                 # 应用入口
├── assets/                 # 静态资源
│   ├── css/               # 样式文件
│   ├── font/              # 字体文件
│   ├── icons/             # 图标资源
│   └── images/            # 图片资源
├── components/            # 组件库
│   ├── base/             # 基础组件
│   ├── rpg/              # RPG 游戏化组件（19 个面板）
│   ├── user/             # 用户相关（文章编辑等）
│   └── xia/              # 自定义组件（评论、回复等）
├── composables/           # 组合式函数
│   ├── use-rpg.ts        # RPG 状态管理
│   └── use-rpg-socket.ts # RPG WebSocket
├── config/               # 配置文件（API 地址等）
├── layouts/              # 布局组件
├── middleware/           # 中间件
├── modules/              # Nuxt 模块（sitemap 等）
├── pages/                # 页面文件（文件路由）
│   ├── index/           # 首页
│   ├── detail/          # 文章详情
│   ├── archives/        # 归档
│   ├── links/           # 友链
│   ├── msgboard/        # 留言板
│   ├── about/           # 关于
│   ├── projects/        # 项目
│   ├── rpg/             # RPG 冒险中心
│   ├── tool/            # 工具箱
│   └── user/            # 用户中心
├── plugins/              # 插件
├── public/               # 公共资源
├── stores/               # 状态管理（Pinia）
├── styles/               # 全局样式
├── types/                # TypeScript 类型（含 rpg.ts）
└── utils/                # 工具函数
```

## 🏗️ 技术架构

```
浏览器
  → Nuxt3 页面/组件
    → api/*.ts（HTTP 请求 + JWT 刷新）
      → 开发代理 /blog-api → blog-server /api/v1
    → composables/use-rpg-socket.ts
      → Socket.IO /rpg（升级、禁言等实时推送）
```

- **内容渲染**：文章详情页用 `MdPreview` 客户端渲染 Markdown 源文
- **内容编辑**：用户中心/文章编辑用 `MdEditor`，同时提交 `content` 与 `contentHtml`
- **状态管理**：Pinia + `useState` composables（RPG 跨组件共享）
- **SEO**：自定义 sitemap 模块，生产环境 hostname `jiang-xia.top`

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0
- 已启动的 [blog-server](../blog-server)（MySQL + Redis）

### 环境配置

复制或修改 `.env.development`：

```env
VITE_ENV=development
VITE_NUXT_ORIGIN_URL=http://localhost:5000
VITE_NUXT_API_PREFIX=/api/v1
VITE_NUXT_PREFIX_PATH=/blog-api
VITE_NUXT_ADMIN_URL=https://admin.jiang-xia.top/login
VITE_NUXT_OPEN_ENCRYPT=false
```

开发模式下，`nuxt.config.ts` 将 `/blog-api` 代理到 `http://localhost:5000/api/v1`。

### 安装依赖

```bash
# 使用 yarn（推荐）
yarn install

# 或使用 npm
npm install
```

### 开发环境

```bash
# 启动开发服务器
yarn dev

# 或指定 IP 访问（局域网）
yarn dev:ip
```

访问 [http://localhost:5050](http://localhost:5050) 查看效果

**常用页面**：

| 路径 | 说明 |
|------|------|
| `/` | 首页文章列表 |
| `/detail/:id` | 文章详情（含打赏 FAB） |
| `/archives` | 时间归档 |
| `/user/profile` | 个人中心 |
| `/rpg` | RPG 冒险中心 |
| `/login` | 登录注册 |

### 生产构建

```bash
# 构建生产版本
yarn build

# 预览生产版本
yarn preview

# 生成静态文件
yarn generate
```

### 代码规范

```bash
# 代码检查
yarn lint

# 自动修复
yarn lint:fix

# 代码格式化
yarn prettier
```

## 📦 部署

### Docker 部署

```bash
# 构建 Docker 镜像
docker build -t blog-home-nuxt .

# 运行容器
docker run -p 3000:3000 blog-home-nuxt
```

### PM2 部署

```bash
# 生产环境
yarn pm2:prod

# 开发环境
yarn pm2:dev
```

## 🌐 在线预览

- **官方网站**: [https://jiang-xia.top/](https://jiang-xia.top/)

## 📚 相关文档

- [blog-server README](../blog-server/README.md) - 后端 API 与部署
- [blog-server RPG 玩法](../blog-server/src/modules/rpg/RPG-GAMEPLAY.md) - RPG 规则与接口
- [Nuxt3 官方文档](https://nuxt.com/docs)
- [Vue3 官方文档](https://vuejs.org/guide/)
- [TailwindCSS 文档](https://tailwindcss.com/docs)
- [DaisyUI 文档](https://daisyui.com/components/)

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 开源协议

本项目基于 [MIT](LICENSE) 协议开源。

## ⭐ Star History

<a href="https://www.star-history.com/#jiang-xia/blog-home-nuxt&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=jiang-xia/blog-home-nuxt&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=jiang-xia/blog-home-nuxt&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=jiang-xia/blog-home-nuxt&type=Date" />
 </picture>
</a>

## 👨‍💻 作者

**jiang-xia**

- 个人网站: [https://jiang-xia.top/](https://jiang-xia.top/)
- GitHub: [@jiang-xia](https://github.com/jiang-xia)

---

如果这个项目对你有帮助，请给个 ⭐ Star 支持一下！
