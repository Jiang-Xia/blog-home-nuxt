/**
 * 国际算法套件（客户端）：AES-256-CBC + RSA 封 key + HMAC-SHA256。
 * 与 Nest suite-aes / CryptoJS Hex key·iv·PKCS7 互通；密文 Hex 统一小写。
 */

import AES from 'crypto-js/aes';
import Core from 'crypto-js/core';
import Hex from 'crypto-js/enc-hex';
import Utf8 from 'crypto-js/enc-utf8';
import Pkcs7 from 'crypto-js/pad-pkcs7';
import { serverPublicKey } from '~~/config/ssh';
import { rsaEncrypt } from '~~/utils/jsencrypt';
import { hmacSha256Hex } from './hmac';
import { logTimingSince } from './log';
import type { GatewayCryptoSuite } from './types';

/**
 * RSA 公钥加密明文（symKey Hex 或登录密码），输出 Hex 小写。
 */
function rsaPublicEncrypt(plainUtf8: string): string {
  const t0 = Date.now();
  // rsaEncrypt 可能输出大写 Hex，统一转小写
  const out = rsaEncrypt(plainUtf8, serverPublicKey).toLowerCase();
  logTimingSince('rsa publicEncrypt', t0);
  return out;
}

/** AES-256-CBC 加密 → Hex 小写（mode 默认 CBC） */
function aesEncryptHex(plain: string, symKeyHex: string, ivHex: string): string {
  const t0 = Date.now();
  const encrypted = AES.encrypt(Utf8.parse(plain), Hex.parse(symKeyHex), {
    iv: Hex.parse(ivHex),
    padding: Pkcs7,
  });
  const out = encrypted.ciphertext.toString(Hex).toLowerCase();
  logTimingSince('aes encrypt', t0);
  return out;
}

/** AES-256-CBC 解密 */
function aesDecryptHex(cipherHex: string, symKeyHex: string, ivHex: string): string {
  const t0 = Date.now();
  const params = Core.lib.CipherParams.create({
    ciphertext: Hex.parse(cipherHex),
  });
  const out = AES.decrypt(params, Hex.parse(symKeyHex), {
    iv: Hex.parse(ivHex),
    padding: Pkcs7,
  }).toString(Utf8);
  logTimingSince('aes decrypt', t0);
  return out;
}

export const suiteAes: GatewayCryptoSuite = {
  alg: 'aes',
  symKeyBytes: 32,
  publicEncrypt: rsaPublicEncrypt,
  symEncrypt: aesEncryptHex,
  symDecrypt: aesDecryptHex,
  hmac: hmacSha256Hex,
};
