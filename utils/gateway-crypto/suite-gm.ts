/**
 * 国密套件（客户端）：SM4-CBC + SM2 封 key + HMAC-SM3。
 * 对称 key 16 字节 Hex；SM2 cipherMode=1（C1C3C2）。
 */

// sm-crypto 为 CJS；命名导入在 Nitro SSR 会报 does not provide an export named 'sm4'
import smCrypto from 'sm-crypto';
import { serverSm2PublicKey } from '~~/config/ssh';
import { hmacSm3Hex } from './hmac';
import { logTimingSince } from './log';
import type { GatewayCryptoSuite } from './types';

const { sm2, sm4 } = smCrypto;

/**
 * SM2 公钥加密明文（symKey Hex 或登录密码），输出 Hex 小写。
 */
function sm2PublicEncrypt(plainUtf8: string): string {
  const t0 = Date.now();
  const out = sm2.doEncrypt(plainUtf8, serverSm2PublicKey, 1).toLowerCase();
  logTimingSince('sm2 publicEncrypt', t0);
  return out;
}

/** SM4-CBC 加密 → Hex 小写 */
function sm4EncryptHex(plain: string, symKeyHex: string, ivHex: string): string {
  const t0 = Date.now();
  const out = String(
    sm4.encrypt(plain, symKeyHex.toLowerCase(), { mode: 'cbc', iv: ivHex.toLowerCase() }),
  ).toLowerCase();
  logTimingSince('sm4 encrypt', t0);
  return out;
}

/** SM4-CBC 解密 */
function sm4DecryptHex(cipherHex: string, symKeyHex: string, ivHex: string): string {
  const t0 = Date.now();
  const out = sm4.decrypt(cipherHex.toLowerCase(), symKeyHex.toLowerCase(), {
    mode: 'cbc',
    iv: ivHex.toLowerCase(),
  });
  logTimingSince('sm4 decrypt', t0);
  return out;
}

export const suiteGm: GatewayCryptoSuite = {
  alg: 'gm',
  symKeyBytes: 16,
  publicEncrypt: sm2PublicEncrypt,
  symEncrypt: sm4EncryptHex,
  symDecrypt: sm4DecryptHex,
  hmac: hmacSm3Hex,
};
