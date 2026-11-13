# 文章发现与详情（Home 消费）

## 目标

读者浏览、搜索、打开文章详情；展示字段全部来自 API。

## 依赖契约

- Server：`blog-server/docs/specs/article/spec.md`
- 常用路由：见根目录 `README.md`「常用页面」
- API 封装：`api/` 下文章相关模块

## 页面行为

| 路径 | 行为 |
|------|------|
| `/` | 分页列表、置顶 |
| `/detail/:id` | 正文、相关推荐、相邻导航、分享 |
| `/search`、`/archives`、`/category/:id`、`/tag/:id` | 发现与筛选 |
| `/feed.xml` | Nitro RSS |

## 验收

- [ ] 未登录可读写公开内容路径
- [ ] 详情缺数据时有合理空态/错误，不白屏
- [ ] 新路由已写入 README 常用页面表
