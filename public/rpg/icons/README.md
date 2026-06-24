# RPG 物品图标资产

目录：`public/rpg/icons/`  
前端：`RpgItemIcon` + `utils/rpg-item-asset.ts`  
**后端只需已有 `icon` 字段，无需新增任何 API 字段。**

## 命名规则

文件名 = `rpg_item_config.icon` + 扩展名：

```
{icon}.png   ← 你的美术图（优先）
{icon}.webp  ← 可选
{icon}.svg   ← 当前占位矢量
```

示例：DB 里 `icon = 'dragon'` → 放 `dragon.png` 并在 `utils/rpg-item-asset.ts` 的 `RPG_ICON_RASTER_KEYS` 登记 `'dragon'`，即可优先走 raster；可删掉 `dragon.svg`。

## 加载顺序

1. 管理端上传 `iconUrl`（`/static/rpgAssets/itemIcon/...`）
2. `/rpg/icons/{icon}.png` / `.webp`（仅 `RPG_ICON_RASTER_KEYS` 已登记时请求）
3. `/rpg/icons/{icon}.svg`
4. emoji 回退（`utils/rpg-item-icon.ts`）

仅 `RPG_ICON_ASSET_KEYS` 中登记的 key 会请求图片，避免无文件时大量 404。

## 换图步骤

1. **推荐（管理端）**：后台「系统物品」→ 填写 `icon` ID → 上传 icon/背景，保存至服务端 `public/rpgAssets/itemIcon|itemBg/{icon}.*`
2. **本地占位**：将成图放入本目录，如 `dragon.png`
3. 确认物品 `icon` 键一致（seed 里已有 `dragon` / `slime` 等）
4. 刷新页面即可，**不用改数据库**

C 端加载顺序：`iconUrl`（上传资产）→ 本目录 `{icon}.png|.webp|.svg` → emoji 回退。

## 新增物品

1. 后端 seed：`icon: 'my_pet'`
2. 添加 `public/rpg/icons/my_pet.png`（或 `.svg` 占位）
3. 在 `utils/rpg-item-asset.ts` → `RPG_ICON_ASSET_KEYS` 追加 `'my_pet'`
4. （可选）在 `ITEM_ICON_MAP` 加 emoji 回退

## 已登记 key

见 `manifest.json` 与 `utils/rpg-item-asset.ts`。
