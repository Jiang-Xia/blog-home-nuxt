/**
 * 从源码收集字符并调用 pyftsubset 生成 HarmonyOS 子集字体。
 * 用法: node scripts/font/build-subset.mjs
 * 依赖: pip install fonttools brotli
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const sourceFont = path.join(__dirname, 'HarmonyOS_Sans_SC_Regular.source.woff2');
const outputFont = path.join(root, 'public/fonts/HarmonyOS_Sans_SC_Subset.woff2');
const charsetFile = path.join(__dirname, 'subset-charset.txt');

/** 常用汉字 + 博客 UI / RPG 文案（补全扫描遗漏） */
const BASE_CHARS = `
0123456789
abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
，。！？、；：""''（）【】《》…—·~@#$%^&*+-=<>/\\|_
先天下之忧而忧后天下之乐而乐范仲淹岳阳楼记
个人技术博客持续更新中浏览文章查看工具开始冒险
技术文章实用工具文字冒险玩法把读博客变成
不只是阅读签到升级做任务抽卡开宝箱养宠物冲排行榜
每一次互动都在推进你的冒险进度登录开启冒险查看排行榜
试玩预览登录后数据实时同步冒险者路人每日任务每日签到
打赏宠物排行阅读互动领取奖励冲榜社交最新文章
技术分享与生活记录欢迎阅读与交流筛选条件分类筛选标签筛选
重置关键字最新评论所有文章最新的评论博客已平稳运行
Powered By Typescript Vue3 Nuxt3 Tailwindcss DaisyUI Node.js NestJS
首页归档友链留言板关于项目工具箱特性主题登录注册写文章个人中心
RPG冒险冒险大厅排行榜背包公会抽奖签到成就任务等级经验生命值
评论点赞收藏分享搜索加载更多返回顶部提交取消保存编辑删除
发布草稿待审核敏感词禁止重复请求网络请求失败请稍后重试
江夏酱酱鱼子酱咖喱酱陌生人花生酱梅子酱番茄酱
部署服务器浏览器前端后端数据库测试记录个人笔记业务安全
vue js nest go react npm node nuxt git linux java spring
TOP Read Lv EXP RPG ADVENTURE ARTICLES SITEMAP
`;

const SCAN_DIRS = ['components', 'pages', 'layouts', 'composables', 'utils', 'api'];
const SCAN_EXT = new Set(['.vue', '.ts', '.js', '.less', '.md']);

function collectFromDir(dir, chars) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      collectFromDir(full, chars);
    }
    else if (entry.isFile() && SCAN_EXT.has(path.extname(entry.name))) {
      const text = fs.readFileSync(full, 'utf8');
      for (const ch of text) {
        if (ch.charCodeAt(0) > 127) chars.add(ch);
      }
    }
  }
}

function main() {
  if (!fs.existsSync(sourceFont)) {
    console.error(`缺少源字体: ${sourceFont}`);
    console.error('请先从线上下载 HarmonyOS_Sans_SC_Regular.woff2 到 scripts/font/');
    process.exit(1);
  }

  const chars = new Set(BASE_CHARS);
  for (const dir of SCAN_DIRS) {
    collectFromDir(path.join(root, dir), chars);
  }

  fs.mkdirSync(path.dirname(outputFont), { recursive: true });
  fs.writeFileSync(charsetFile, [...chars].sort().join(''), 'utf8');
  console.log(`字符集大小: ${chars.size} 个字符`);

  const py = process.platform === 'win32' ? 'py' : 'python3';
  execSync(
    `${py} -m fontTools.subset "${sourceFont}" --output-file="${outputFont}" --flavor=woff2 --layout-features="*" --glyph-names --symbol-cmap --legacy-cmap --notdef-glyph --notdef-outline --recommended-glyphs --name-IDs="*" --name-legacy --name-languages="*" --text-file="${charsetFile}"`,
    { stdio: 'inherit' },
  );

  const size = fs.statSync(outputFont).size;
  console.log(`已生成: ${outputFont} (${(size / 1024).toFixed(1)} KB)`);
  console.log('若字符集有变更，请递增 app.less 与 nuxt.config.ts 中的字体 ?v= / FONT_SUBSET_VERSION');
}

main();
