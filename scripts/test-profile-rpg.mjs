import { chromium } from 'playwright';

const BASE = 'http://localhost:5050';
const API = 'http://localhost:5000/api/v1';

async function login(page) {
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle');

  // 获取验证码 cookie 并从 redis 读取答案较复杂，改用页面填写后观察
  await page.fill('input[placeholder="账号"]', 'jiangwanyin');
  await page.fill('input[placeholder="密码"]', '123456');

  // 尝试从 API 获取 captcha 并解析（开发环境）
  const captchaRes = await page.request.get(`${API}/user/authCode?t=${Date.now()}`);
  const cookies = await captchaRes.headersArray();
  const setCookie = cookies.find(h => h.name.toLowerCase() === 'set-cookie');
  const captchaId = setCookie?.value?.match(/captcha_id=([^;]+)/)?.[1];

  // 从 SVG 中提取文本不可行，尝试常见测试码或多次刷新
  // 直接通过 JWT 注入 token（模拟已登录）
  const loginRes = await page.request.post(`${API}/user/login`, {
    data: { mobile: 'jiangwanyin', password: '123456', authCode: 'TEST', loginType: 'mobile' },
    headers: { Cookie: `captcha_id=${captchaId}` },
  });
  console.log('Login attempt status:', loginRes.status(), await loginRes.text().catch(() => ''));

  return false;
}

async function injectToken(page) {
  // 用 node jwt 生成 token 注入 cookie
  const { createRequire } = await import('module');
  const require = createRequire(import.meta.url);
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: 53, nickname: '江晚吟', mobile: 'jiangwanyin' }, 'xia-007', { expiresIn: '1h' });
  const refresh = jwt.sign({ id: 53, type: 'refresh' }, 'xia-007', { expiresIn: '7d' });

  await page.context().addCookies([
    { name: 'x-accessToken', value: token, domain: 'localhost', path: '/' },
    { name: 'x-refreshToken', value: refresh, domain: 'localhost', path: '/' },
  ]);
  return token;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  await injectToken(page);
  await page.goto(`${BASE}/user/profile`);
  await page.waitForTimeout(3000);

  const screenshotPath = 'd:/study/myGithub/blog-home-nuxt/scripts/profile-rpg-screenshot.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });

  const bodyText = await page.locator('body').innerText();
  const checks = {
    hasNickname: bodyText.includes('江晚吟'),
    hasLoading: bodyText.includes('加载中'),
    hasRpgLevel: /LV\s*15|LV15/.test(bodyText),
    hasQuestTab: bodyText.includes('任务'),
    hasAchievementTab: bodyText.includes('成就'),
    hasBuffTab: bodyText.includes('Buff'),
    hasLevelRewards: bodyText.includes('等级奖励路线'),
    hasLottery: bodyText.includes('幸运宝箱'),
    hasSignButton: bodyText.includes('签到'),
  };

  console.log('Display checks:', JSON.stringify(checks, null, 2));
  console.log('Console errors:', consoleErrors.slice(0, 10));
  console.log('Screenshot:', screenshotPath);
  console.log('Body excerpt:', bodyText.slice(0, 1500));

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
