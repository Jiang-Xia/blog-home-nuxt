export const SiteTitle = '江夏的Blog';

export interface NavLink {
  path: string;
  title: string;
  /** 导航高亮样式（RPG 冒险入口等） */
  highlight?: boolean;
  icon?: string;
}

export interface ToolLink extends NavLink {
  icon: string;
}

export const NAV_LINKS: NavLink[] = [
  { path: '/', title: '首页' },
  { path: '/rpg', title: '冒险', highlight: true, icon: '⚔️' },
  { path: '/download', title: '快速入口' },
  { path: '/archives', title: '归档' },
  { path: '/links', title: '友链' },
  { path: '/msgboard', title: '留言板' },
  { path: '/about', title: '关于' },
  { path: '/projects', title: '项目' },
  { path: '/tool', title: '工具箱' },
  { path: '/features', title: '特性' },
  // { path: '/open-source', title: '开源' },
];

export const TOOL_LINKS: ToolLink[] = [
  { path: '/tool/codes', title: '条形/二维码', icon: 'blog-erweima' },
  { path: '/tool/pdf', title: 'PDF', icon: 'blog-pdf1' },
  { path: '/tool/watermark', title: '水印', icon: 'blog-yinzhang' },
  { path: '/tool/photos', title: '光影边框', icon: 'blog-xiangji' },
  { path: '/tool/audio-visualized', title: '音频可视化', icon: 'blog-yinpin1' },
  { path: '/tool/upload-slice', title: '切片上传', icon: 'blog-upload' },
  { path: '/tool/other', title: '其他工具', icon: 'blog-qita' },
  { path: '/tool/webrtc', title: 'WebRTC', icon: 'blog-shipin1' },
  { path: '/tool/test', title: '测试', icon: 'blog-ceshi1' },
  { path: '/tool/rsa', title: 'RSA加解密工具', icon: 'blog-jiami' },
  { path: '/tool/des', title: '对称加密工具', icon: 'blog-encrypted' },
  { path: '/tool/sm', title: '国密加密工具', icon: 'blog-lock' },
  { path: '/tool/ai', title: 'AI', icon: 'blog-AI' },
  { path: '/tool/ai-summary', title: 'AI文章摘要', icon: 'blog-zhaiyao2' },
];
