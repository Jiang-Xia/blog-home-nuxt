/**
 * 模拟 Home use-site-notification + use-realtime-socket 联调
 * 用法: node scripts/verify-realtime-notification.mjs
 */
import { createRequire } from 'node:module';
import { setTimeout as sleep } from 'node:timers/promises';

const require = createRequire(import.meta.url);
const jwt = require('../../blog-server/node_modules/jsonwebtoken');
const { io } = require('socket.io-client');

const API_ORIGIN = process.env.VITE_NUXT_ORIGIN_URL || 'http://127.0.0.1:5000';
const API = `${API_ORIGIN}/api/v1`;
const JWT_SECRET = process.env.auth_jwtSecret || 'xia-007';

const USER_A = 5;
const USER_C = 55;
const ARTICLE_BY_C = 104;

function authHeader(uid) {
  const token = jwt.sign({ id: uid, nickname: `u${uid}`, username: `u${uid}`, role: [] }, JWT_SECRET, {
    expiresIn: '1h',
  });
  return `Bearer ${token}`;
}

async function api(uid, method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: authHeader(uid),
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

/** 对齐 use-realtime-socket.connect + use-site-notification.on('siteNotification') */
async function simulateHomeBellListener(authorUid) {
  const received = [];
  let unreadCount = 0;

  const socket = io(`${API_ORIGIN}/realtime`, {
    auth: { token: authHeader(authorUid) },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
  });

  await new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('connect timeout')), 10000);
    socket.on('connect', () => {
      clearTimeout(t);
      resolve(undefined);
    });
    socket.on('connect_error', (e) => {
      clearTimeout(t);
      reject(e);
    });
  });

  socket.on('siteNotification', (data) => {
    received.push(data);
    if (typeof data?.unreadCount === 'number') {
      unreadCount = data.unreadCount;
    }
    else {
      unreadCount += 1;
    }
  });

  return {
    socket,
    received,
    getUnread: () => unreadCount,
  };
}

async function main() {
  console.log('=== Home 通知铃铛模拟联调 ===');
  console.log(`API_ORIGIN=${API_ORIGIN}\n`);

  const before = await api(USER_C, 'GET', '/notification/unread-count');
  const beforeCount = Number(before.data?.data ?? before.data) || 0;
  console.log(`作者 uid=${USER_C} 初始未读: ${beforeCount}`);

  const bell = await simulateHomeBellListener(USER_C);
  console.log(`WebSocket 已连接 /realtime (${bell.socket.id})`);

  const commentRes = await api(USER_A, 'POST', '/comment/create', {
    uid: USER_A,
    articleId: ARTICLE_BY_C,
    content: `Home模拟铃铛 ${Date.now()}`,
  });
  if (!commentRes.ok) {
    throw new Error(`comment failed: ${commentRes.status} ${JSON.stringify(commentRes.data)}`);
  }

  await sleep(2000);

  const wsUnread = bell.getUnread();
  const after = await api(USER_C, 'GET', '/notification/unread-count');
  const afterCount = Number(after.data?.data ?? after.data) || 0;

  bell.socket.disconnect();

  const wsOk = wsUnread > beforeCount;
  const httpOk = afterCount > beforeCount;

  console.log(`WS 角标未读: ${wsUnread} (期望 > ${beforeCount})`);
  console.log(`HTTP 未读: ${afterCount} (期望 > ${beforeCount})`);
  console.log(wsOk && httpOk ? '\n✅ Home 通知链路正常' : '\n❌ Home 通知链路异常');
  process.exit(wsOk && httpOk ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
