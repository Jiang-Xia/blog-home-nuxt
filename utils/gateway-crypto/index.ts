/**
 * HTTP 加密网关客户端入口（与 Nest gateway-crypto 协议对齐）。
 *
 * - 开关：VITE_NUXT_OPEN_ENCRYPT（是否走 /encrypt）
 * - 套件：VITE_NUXT_GATEWAY_CRYPTO=aes|gm（须与 Nest app_gatewayCrypto 一致）
 * - 密文 / IV / encKey / sign 等 Hex 统一小写
 * - 遗留静态 AES（utils/crypto.ts）仅供 AI 摘要等工具，勿与本模块混用
 *
 * 读代码顺序建议：types 数据流 → createGatewayEnvelope → openGatewayEnvelope → suite-*
 */

import Core from 'crypto-js/core';
import Hex from 'crypto-js/enc-hex';
import { bodyCanonical, keyOnlyCanonical, timingSafeEqualHex } from './hmac';
import { logTimingSince } from './log';
import { suiteAes } from './suite-aes';
import { suiteGm } from './suite-gm';
import type {
  GatewayAlg,
  GatewayCryptoSuite,
  GatewayRequestEnvelope,
  GatewayResponseEnvelope,
  GatewaySession,
} from './types';
import { GATEWAY_HEADER } from './types';

export { GATEWAY_HEADER };
export type { GatewayAlg, GatewayRequestEnvelope, GatewayResponseEnvelope, GatewaySession };

/**
 * 读取前端网关套件，默认 aes。
 */
export function getGatewayAlg(): GatewayAlg {
  const raw = String(import.meta.env.VITE_NUXT_GATEWAY_CRYPTO || 'aes').toLowerCase();
  return raw === 'gm' ? 'gm' : 'aes';
}

/**
 * 获取当前套件实现（aes / gm 分支集中在此）。
 */
export function getSuite(alg: GatewayAlg = getGatewayAlg()): GatewayCryptoSuite {
  return alg === 'gm' ? suiteGm : suiteAes;
}

/** CSPRNG 生成 Hex 小写 */
function randomHex(byteLen: number): string {
  return Core.lib.WordArray.random(byteLen).toString(Hex);
}

/**
 * 为有 JSON body 的请求生成网关信封，并返回会话（供解密响应）。
 * @param plainBody 业务明文对象（将 JSON.stringify）
 */
export function createGatewayEnvelope(plainBody: unknown): {
  envelope: GatewayRequestEnvelope;
  session: GatewaySession;
} {
  const t0 = Date.now();
  const alg = getGatewayAlg();
  const suite = getSuite(alg);
  const symKeyHex = randomHex(suite.symKeyBytes);
  const iv = randomHex(16);
  const ts = Date.now();
  const content = suite.symEncrypt(JSON.stringify(plainBody), symKeyHex, iv);
  const sign = suite.hmac(symKeyHex, bodyCanonical(iv, content, ts));
  const encKey = suite.publicEncrypt(symKeyHex);
  logTimingSince(`createGatewayEnvelope(${alg}) total`, t0);
  return {
    envelope: { alg, encKey, iv, content, ts, sign },
    session: { alg, symKeyHex },
  };
}

/**
 * 无 JSON body（GET/DELETE/FormData）时生成请求头 + 会话。
 */
export function createGatewayKeyHeaders(): {
  headers: Record<string, string>;
  session: GatewaySession;
} {
  const t0 = Date.now();
  const alg = getGatewayAlg();
  const suite = getSuite(alg);
  const symKeyHex = randomHex(suite.symKeyBytes);
  const ts = Date.now();
  const encKey = suite.publicEncrypt(symKeyHex);
  const sign = suite.hmac(symKeyHex, keyOnlyCanonical(ts));
  logTimingSince(`createGatewayKeyHeaders(${alg}) total`, t0);
  return {
    headers: {
      [GATEWAY_HEADER.alg]: alg,
      [GATEWAY_HEADER.encKey]: encKey,
      [GATEWAY_HEADER.ts]: String(ts),
      [GATEWAY_HEADER.sign]: sign,
    },
    session: { alg, symKeyHex },
  };
}

/**
 * 验签并解密响应信封（用 session.symKeyHex + 响应里的新 iv）。
 * @throws Error 验签失败或解密失败
 */
export function openGatewayEnvelope(
  payload: GatewayResponseEnvelope,
  session: GatewaySession,
): unknown {
  const t0 = Date.now();
  if (!payload?.content || !payload?.iv || payload.sign == null || payload.ts == null) {
    throw new Error('invalid gateway response envelope');
  }
  const alg = payload.alg || session.alg;
  const suite = getSuite(alg);
  const expect = suite.hmac(
    session.symKeyHex,
    bodyCanonical(payload.iv, payload.content, payload.ts),
  );
  if (!timingSafeEqualHex(expect, String(payload.sign))) {
    throw new Error('gateway response sign invalid');
  }
  const plain = suite.symDecrypt(payload.content, session.symKeyHex, payload.iv);
  logTimingSince(`openGatewayEnvelope(${alg}) total`, t0);
  return JSON.parse(plain);
}

/**
 * 按套件加密登录密码字段（aes→RSA，gm→SM2），输出小写 Hex。
 */
export function encryptLoginPassword(plainPassword: string): string {
  const t0 = Date.now();
  const alg = getGatewayAlg();
  const out = getSuite(alg).publicEncrypt(plainPassword);
  logTimingSince(`encryptLoginPassword(${alg})`, t0);
  return out;
}
