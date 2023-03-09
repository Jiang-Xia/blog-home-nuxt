'use-client'
/* eslint-disable */
import CryptoJS, { enc, mode, AES, pad } from 'crypto-js'
import JSEncrypt from 'jsencrypt'
import { publicKey, privateKey,serverPublicKey } from '~~/config/ssh'
// 加密密钥（长度必须是 16 的整数倍，此处为 32 位）
const secretKey = '54050000778e380000fe5a120000b4ce'
// 偏移量
const iv = 'jiangxia'
/**
 * AES加密
 * @description 使用加密秘钥，对 需要加密的参数 进行加密
 * @param {string} word - 需要加密的参数
 * @param {string} key - 加密密钥（长度必须是 16 的整数倍）
 * @param {string} offset - 偏移量
 * @return 16进制字符串 256位
 */
export function aesEncrypt(word: any, key = secretKey, offset = iv) {
  // 未加密的参数 - 从 UTF-8编码 解析出原始字符串
  const wordUTF8 = enc.Utf8.parse(word)
  // 密钥 - 从 UTF-8编码 解析出原始字符串
  const keyUTF8 = enc.Utf8.parse(key)
  // 偏移量 从 UTF-8编码 解析出原始字符串
  const offsetUTF8 = enc.Utf8.parse(offset)

  const encrypted = AES.encrypt(wordUTF8, keyUTF8, {
    iv: offsetUTF8,
    mode: mode.CBC,
    padding: pad.Pkcs7,
  })
  // 转成16进制 变成大写不影响解密
  return encrypted.toString(CryptoJS.format.Hex).toUpperCase()
}

/**
 * AES解密
 * @description 使用加密秘钥，对 需要解密的参数 进行解密
 * @param {string} encryptedWord - 需要解密的参数
 * @param {string} key - 加密密钥（长度必须是 16 的整数倍）
 * @param {string} offset - 偏移量
 * @return utf8 字符串
 */
export function aesDecrypt(encryptedWord: any, key = secretKey, offset = iv) {
  // 密钥 - 从 UTF-8编码 解析出原始字符串
  const keyUTF8 = enc.Utf8.parse(key)
  // 偏移量 从 UTF-8编码 解析出原始字符串
  const offsetUTF8 = enc.Utf8.parse(offset)
  // 解析十六进制字符串
  encryptedWord = CryptoJS.format.Hex.parse(encryptedWord)
  // console.log('encryptedWord:',encryptedWord)
  const bytes = AES.decrypt(encryptedWord, keyUTF8, {
    iv: offsetUTF8,
    mode: mode.CBC,
    padding: pad.Pkcs7,
  })

  return bytes.toString(enc.Utf8)
}

// const encrypted2 =  aesEncrypt('========Message=======')
// const decrypted2 =  aesDecrypt(encrypted2)
// console.log('AES:',{encrypted2,decrypted2});

/**
 * RSA加密
 * @description 使用公钥加密，私钥解密
 * @param {string} word - 需要加密的参数
 * @param {string} pubKey - 加密公钥
 * @return 16进制字符串
 */
export function rsaEncrypt(word = '非对称加解密', pubKey = serverPublicKey) {
  const encrypt = new JSEncrypt()
  /* 公钥加密 */
  encrypt.setPublicKey(pubKey)// base64编码字符串
  const encrypted = encrypt.encrypt(word) as string // 返回结果可能是false
  // 转为 16进制字符串
  const hex = enc.Hex.stringify(enc.Base64.parse(encrypted)).toUpperCase()
  return hex
}

/**
 * RSA解密
 * @description 使用公钥加密，私钥解密
 * @param {string} encryptedWord - 需要解密的参数
 * @param {string} priKey - 加密密钥（长度必须是 16 的整数倍）
 * @param {string} offset - 偏移量
 * @return utf8 字符串 (解密不出来返回原本字符串)
 */
export function rsaDecrypt(encryptedWord: any, priKey = privateKey, offset = iv) {
  const decrypt = new JSEncrypt()
  /* 私钥解密 */
  decrypt.setPrivateKey(priKey)
  // 转为 base64字符串
  const base64 = enc.Base64.stringify(enc.Hex.parse(encryptedWord))
  const uncrypted = decrypt.decrypt(base64)
  return uncrypted|| encryptedWord;
}
// const en = rsaEncrypt('彩票中奖号码:666',publicKey)
// console.log(en)
// const de = rsaDecrypt('123',privateKey)
// console.log(de) // 123

// const serverEn = rsaEncrypt('彩票中奖号码:666',serverPublicKey)
// console.log(serverEn)
