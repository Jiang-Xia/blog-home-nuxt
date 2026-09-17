/**
 * HTTP 加密网关客户端（与 Nest gateway-crypto 协议对齐）。
 * - 开关：VITE_NUXT_OPEN_ENCRYPT（是否走 /encrypt）
 * - 套件：VITE_NUXT_GATEWAY_CRYPTO=aes|gm（须与 Nest app_gatewayCrypto 一致）
 * - 密文 / IV / encKey / sign 等 Hex 统一小写
 * - CryptoJS 按需引入（aes / hmac-sha256 / enc-* / core），勿 import 'crypto-js' 全量
 * - 遗留静态 AES（utils/crypto.ts）仅供 AI 摘要 URL 等工具，勿与本模块混用
 */

import AES from 'crypto-js/aes';
import Core from 'crypto-js/core';
import Hex from 'crypto-js/enc-hex';
import Utf8 from 'crypto-js/enc-utf8';
import HmacSHA256 from 'crypto-js/hmac-sha256';
import Pkcs7 from 'crypto-js/pad-pkcs7';
// sm-crypto 为 CJS；命名导入在 Nitro SSR 会报 does not provide an export named 'sm4'
import smCrypto from 'sm-crypto';
import { serverPublicKey, serverSm2PublicKey } from '~~/config/ssh';
import { rsaEncrypt } from '~~/utils/jsencrypt';

const { sm2, sm3, sm4 } = smCrypto;

export type GatewayAlg = 'aes' | 'gm';

export type GatewayRequestEnvelope = {
  alg: GatewayAlg;
  encKey: string;
  iv: string;
  content: string;
  ts: number;
  sign: string;
};

export type GatewayResponseEnvelope = {
  alg: GatewayAlg;
  iv: string;
  content: string;
  ts: number;
  sign: string;
};

/** 与 Nest GATEWAY_HEADER 一致（axios/fetch 头名大小写不敏感） */
export const GATEWAY_HEADER = {
  alg: 'X-Gateway-Alg',
  encKey: 'X-Gateway-Enc-Key',
  ts: 'X-Gateway-Ts',
  sign: 'X-Gateway-Sign',
} as const;

/** 开发环境打印加解密耗时 */
function logTiming(label: string, ms: number): void {
  if (import.meta.dev) {
    console.log(`[gateway-crypto] ${label} ${ms}ms`);
  }
}

/**
 * 读取前端网关套件，默认 aes。
 */
export function getGatewayAlg(): GatewayAlg {
  const raw = String(import.meta.env.VITE_NUXT_GATEWAY_CRYPTO || 'aes').toLowerCase();
  return raw === 'gm' ? 'gm' : 'aes';
}

/** CSPRNG 生成 Hex 小写（CryptoJS core WordArray，CBC 为 AES 默认模式） */
function randomHex(byteLen: number): string {
  return Core.lib.WordArray.random(byteLen).toString(Hex);
}

function bodyCanonical(iv: string, content: string, ts: number): string {
  return `${iv}&${content}&${ts}`;
}

function keyOnlyCanonical(ts: number): string {
  return `KEY&${ts}`;
}

function timingSafeEqualHex(a: string, b: string): boolean {
  const aa = (a || '').toLowerCase();
  const bb = (b || '').toLowerCase();
  if (aa.length !== bb.length || !aa) {
    return false;
  }
  let out = 0;
  for (let i = 0; i < aa.length; i++) {
    out |= aa.charCodeAt(i) ^ bb.charCodeAt(i);
  }
  return out === 0;
}

function hmacSha256Hex(symKeyHex: string, canonical: string): string {
  return HmacSHA256(canonical, Hex.parse(symKeyHex)).toString(Hex).toLowerCase();
}

/** HMAC-SM3：sm-crypto 原生 sm3(msg, { key }) */
function hmacSm3Hex(symKeyHex: string, canonical: string): string {
  return sm3(canonical, { key: symKeyHex.toLowerCase() }).toLowerCase();
}

function aesEncryptHex(plain: string, symKeyHex: string, ivHex: string): string {
  const t0 = Date.now();
  // mode 默认 CBC（cipher-core），无需再引 mode-cbc
  const encrypted = AES.encrypt(Utf8.parse(plain), Hex.parse(symKeyHex), {
    iv: Hex.parse(ivHex),
    padding: Pkcs7,
  });
  const out = encrypted.ciphertext.toString(Hex).toLowerCase();
  logTiming('aes encrypt', Date.now() - t0);
  return out;
}

function aesDecryptHex(cipherHex: string, symKeyHex: string, ivHex: string): string {
  const t0 = Date.now();
  const params = Core.lib.CipherParams.create({
    ciphertext: Hex.parse(cipherHex),
  });
  const out = AES.decrypt(params, Hex.parse(symKeyHex), {
    iv: Hex.parse(ivHex),
    padding: Pkcs7,
  }).toString(Utf8);
  logTiming('aes decrypt', Date.now() - t0);
  return out;
}

function sm4EncryptHex(plain: string, symKeyHex: string, ivHex: string): string {
  const t0 = Date.now();
  const out = String(
    sm4.encrypt(plain, symKeyHex.toLowerCase(), { mode: 'cbc', iv: ivHex.toLowerCase() }),
  ).toLowerCase();
  logTiming('sm4 encrypt', Date.now() - t0);
  return out;
}

function sm4DecryptHex(cipherHex: string, symKeyHex: string, ivHex: string): string {
  const t0 = Date.now();
  const out = sm4.decrypt(cipherHex.toLowerCase(), symKeyHex.toLowerCase(), {
    mode: 'cbc',
    iv: ivHex.toLowerCase(),
  });
  logTiming('sm4 decrypt', Date.now() - t0);
  return out;
}

function wrapKey(symKeyHex: string, alg: GatewayAlg): string {
  const t0 = Date.now();
  let out: string;
  if (alg === 'gm') {
    out = sm2.doEncrypt(symKeyHex, serverSm2PublicKey, 1).toLowerCase();
    logTiming('sm2 wrapKey', Date.now() - t0);
  }
  else {
    // rsaEncrypt 可能输出大写 Hex，统一转小写
    out = rsaEncrypt(symKeyHex, serverPublicKey).toLowerCase();
    logTiming('rsa wrapKey', Date.now() - t0);
  }
  return out;
}

function hmac(symKeyHex: string, canonical: string, alg: GatewayAlg): string {
  return alg === 'gm' ? hmacSm3Hex(symKeyHex, canonical) : hmacSha256Hex(symKeyHex, canonical);
}

function symEncrypt(plain: string, symKeyHex: string, ivHex: string, alg: GatewayAlg): string {
  return alg === 'gm'
    ? sm4EncryptHex(plain, symKeyHex, ivHex)
    : aesEncryptHex(plain, symKeyHex, ivHex);
}

function symDecrypt(cipherHex: string, symKeyHex: string, ivHex: string, alg: GatewayAlg): string {
  return alg === 'gm'
    ? sm4DecryptHex(cipherHex, symKeyHex, ivHex)
    : aesDecryptHex(cipherHex, symKeyHex, ivHex);
}

export type GatewaySession = {
  alg: GatewayAlg;
  symKeyHex: string;
};

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
  const keyBytes = alg === 'gm' ? 16 : 32;
  const symKeyHex = randomHex(keyBytes);
  const iv = randomHex(16);
  const ts = Date.now();
  const content = symEncrypt(JSON.stringify(plainBody), symKeyHex, iv, alg);
  const sign = hmac(symKeyHex, bodyCanonical(iv, content, ts), alg);
  const encKey = wrapKey(symKeyHex, alg);
  logTiming(`createGatewayEnvelope(${alg}) total`, Date.now() - t0);
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
  const keyBytes = alg === 'gm' ? 16 : 32;
  const symKeyHex = randomHex(keyBytes);
  const ts = Date.now();
  const encKey = wrapKey(symKeyHex, alg);
  const sign = hmac(symKeyHex, keyOnlyCanonical(ts), alg);
  logTiming(`createGatewayKeyHeaders(${alg}) total`, Date.now() - t0);
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
 * 验签并解密响应信封。
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
  const expect = hmac(
    session.symKeyHex,
    bodyCanonical(payload.iv, payload.content, payload.ts),
    alg,
  );
  if (!timingSafeEqualHex(expect, String(payload.sign))) {
    throw new Error('gateway response sign invalid');
  }
  const plain = symDecrypt(payload.content, session.symKeyHex, payload.iv, alg);
  logTiming(`openGatewayEnvelope(${alg}) total`, Date.now() - t0);
  return JSON.parse(plain);
}

/**
 * 按套件加密登录密码字段（aes→RSA，gm→SM2），输出小写 Hex。
 */
export function encryptLoginPassword(plainPassword: string): string {
  const t0 = Date.now();
  const alg = getGatewayAlg();
  const out
    = alg === 'gm'
      ? sm2.doEncrypt(plainPassword, serverSm2PublicKey, 1).toLowerCase()
      : rsaEncrypt(plainPassword, serverPublicKey).toLowerCase();
  logTiming(`encryptLoginPassword(${alg})`, Date.now() - t0);
  return out;
}
