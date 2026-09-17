/**
 * 遗留静态 AES（AI 摘要 ?params= 等工具页）。
 * HTTP /encrypt 网关请使用 utils/gateway-crypto.ts，勿混用。
 * CryptoJS 按需引入（aes / enc-* / format-hex / pad-pkcs7）。
 */
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';
import HexFormat from 'crypto-js/format-hex';
import Pkcs7 from 'crypto-js/pad-pkcs7';

const secretKey = '54050000778e380000fe5a120000b4ce';
const iv = 'jiangxia';

/**
 * AES加密
 * @description 使用加密秘钥，对 需要加密的参数 进行加密
 * @param {string} word - 需要加密的参数
 * @param {string} key - 加密密钥（长度必须是 16 的整数倍）
 * @param {string} offset - 偏移量
 * @return 16进制字符串 256位
 */
export function aesEncrypt(word: any, key = secretKey, offset = iv) {
  const wordUTF8 = Utf8.parse(word);
  const keyUTF8 = Utf8.parse(key);
  const offsetUTF8 = Utf8.parse(offset);

  // mode 默认 CBC
  const encrypted = AES.encrypt(wordUTF8, keyUTF8, {
    iv: offsetUTF8,
    padding: Pkcs7,
  });
  return encrypted.toString(HexFormat).toUpperCase();
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
  const keyUTF8 = Utf8.parse(key);
  const offsetUTF8 = Utf8.parse(offset);
  const parsed = HexFormat.parse(encryptedWord);
  const bytes = AES.decrypt(parsed, keyUTF8, {
    iv: offsetUTF8,
    padding: Pkcs7,
  });

  return bytes.toString(Utf8);
}

export default {
  aesEncrypt,
  aesDecrypt,
};
