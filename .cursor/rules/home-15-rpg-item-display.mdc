---
description: RPG 前端物品展示只用 API 字段，禁止物品 map 硬编码
globs: types/rpg.ts,components/rpg/**/*
alwaysApply: false
---

# RPG 前端物品展示

与后端 `rpg_item_config` + enrich 对齐；组件文件头建议注明「展示字段来自哪个 API」。

## 使用 API 字段

- `reward.avatarFrame?.name`、`reward.title?.name`
- `item.config?.itemTypeLabel`、`item.config?.rarityColor`、`item.sourceLabel`
- 抽奖：`item.rarityLabel`、`item.rarityIcon`

## 禁止新增

`AVATAR_FRAME_MAP`、`TITLE_NAME_MAP`、`ITEM_TYPE_MAP`、`RARITY_MAP`、`ITEM_SOURCE_MAP`

## 允许

Buff/成就/公会等非 `rpg_item_config` 的 UI map（须在常量处注释「非物品配置表数据」）
