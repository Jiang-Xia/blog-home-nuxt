/**
 * 网关 HMAC 与时间安全比较。
 * 规范串：有密文 iv&content&ts；无密文 KEY&ts。Hex 输出统一小写。
 */

import Hex from 'crypto-js/enc-hex';
import HmacSHA256 from 'crypto-js/hmac-sha256';
// sm-crypto 为 CJS；命名导入在 Nitro SSR 会报 does not provide an export named 'sm3'
import smCrypto from 'sm-crypto';

const { sm3 } = smCrypto;

/**
 * 常量时间比较两个 Hex 签名，防止时序旁路。
 */
export function timingSafeEqualHex(a: string, b: string): boolean {
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

/**
 * HMAC-SHA256（aes 套件），密钥为对称 key 的原始字节（由 Hex 解码）。
 */
export function hmacSha256Hex(symKeyHex: string, canonical: string): string {
  return HmacSHA256(canonical, Hex.parse(symKeyHex)).toString(Hex).toLowerCase();
}

/**
 * HMAC-SM3（gm 套件）。sm-crypto：sm3(msg, { key }) 即为 HMAC。
 */
export function hmacSm3Hex(symKeyHex: string, canonical: string): string {
  return sm3(canonical, { key: symKeyHex.toLowerCase() }).toLowerCase();
}

/** 有密文时的签名规范串：iv & content & ts */
export function bodyCanonical(iv: string, content: string, ts: number | string): string {
  return `${iv}&${content}&${ts}`;
}

/** 无密文（仅传 key）时的签名规范串：KEY&ts */
export function keyOnlyCanonical(ts: number | string): string {
  return `KEY&${ts}`;
}
