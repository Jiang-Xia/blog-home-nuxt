// 'use-client'
/**
 * RSA 加解密（npm jsencrypt，不依赖 CDN 异步加载）。
 * 网关 aes 套件封 key / 登录密码加密均走此处，避免登录页验证码抢跑导致 JSEncrypt 未定义。
 */
import JSEncrypt from 'jsencrypt';
import Base64 from 'crypto-js/enc-base64';
import Hex from 'crypto-js/enc-hex';
import { privateKey, serverPublicKey } from '~~/config/ssh';

/**
 * RSA 加密
 * @description 使用公钥加密；默认输出 Hex（大小写由调用方再规范，网关会转小写）
 * @param word 明文
 * @param pubKey PEM 公钥
 * @param type Hex | Base64
 */
export function rsaEncrypt(word = '非对称加解密', pubKey = serverPublicKey, type = 'Hex'): string {
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(pubKey);
  const encrypted = encrypt.encrypt(word) as string;
  if (!encrypted) {
    throw new Error('RSA encrypt failed');
  }
  if (type === 'Hex') {
    return Hex.stringify(Base64.parse(encrypted)).toLowerCase();
  }
  return encrypted;
}

/**
 * RSA 解密
 * @description 私钥解密；失败返回原文
 */
export function rsaDecrypt(encryptedWord: any, priKey = privateKey, type = 'Hex') {
  const decrypt = new JSEncrypt();
  decrypt.setPrivateKey(priKey);
  if (type === 'Hex') {
    const base64 = Base64.stringify(Hex.parse(encryptedWord));
    return (decrypt.decrypt(base64) as string) || encryptedWord;
  }
  return (decrypt.decrypt(encryptedWord) as string) || encryptedWord;
}

export default {
  rsaEncrypt,
  rsaDecrypt,
};
