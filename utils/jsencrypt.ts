// 'use-client'
import { enc } from 'crypto-js';
import { publicKey, privateKey, serverPublicKey } from '~~/config/ssh';

/**
 * RSA加密
 * @description 使用公钥加密，私钥解密
 * @param {string} word - 需要加密的参数
 * @param {string} pubKey - 加密公钥
 * @return 16进制字符串
 */
export function rsaEncrypt(word = '非对称加解密', pubKey = serverPublicKey, type = 'Hex'): string {
  const encrypt = new JSEncrypt();
  /* 公钥加密 */
  encrypt.setPublicKey(pubKey); // base64编码字符串
  const encrypted = encrypt.encrypt(word) as string; // 返回结果可能是false
  // 转为 16进制字符串
  if (type === 'Hex') {
    const hex = enc.Hex.stringify(enc.Base64.parse(encrypted)).toUpperCase();
    return hex;
  }
  else {
    return encrypted;
  }
}

/**
 * RSA解密
 * @description 使用公钥加密，私钥解密
 * @param {string} encryptedWord - 需要解密的参数
 * @param {string} priKey - 加密密钥（长度必须是 16 的整数倍）
 * @param {string} offset - 偏移量
 * @return utf8 字符串 (解密不出来返回原本字符串)
 */
export function rsaDecrypt(encryptedWord: any, priKey = privateKey, type = 'Hex') {
  const decrypt = new JSEncrypt();
  /* 私钥解密 */
  decrypt.setPrivateKey(priKey);
  if (type === 'Hex') {
    // 转为 base64字符串
    const base64 = enc.Base64.stringify(enc.Hex.parse(encryptedWord));
    const uncrypted = decrypt.decrypt(base64) as string;
    return uncrypted;
  }
  else {
    const uncrypted = decrypt.decrypt(encryptedWord) as string;
    return uncrypted;
  }
}
export default {
  aesEncrypt,
  aesDecrypt,
  rsaEncrypt,
  rsaDecrypt,
  JSEncrypt,
};
// const en = rsaEncrypt('彩票中奖号码:666',publicKey)
// console.log(en)
// const de = rsaDecrypt('123',privateKey)
// console.log(de) // 123

// const serverEn = rsaEncrypt('彩票中奖号码:666',serverPublicKey)
// console.log(serverEn)
