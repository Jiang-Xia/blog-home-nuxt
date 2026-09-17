/**
 * 加密网关客户端协议类型（与 Nest `utils/gateway-crypto` 对齐）。
 *
 * 数据流（单次 HTTP）：
 * 1. 前端随机 symKey + 请求 iv → AES/SM4 加密 body → RSA/SM2 封成 encKey → HMAC 签名
 * 2. 本地保留 session={ alg, symKeyHex }（响应不再回传 encKey）
 * 3. 后端解开 encKey 得同一 symKey，业务明文处理后用新 iv 封响应
 * 4. 前端用 session.symKeyHex + 响应 payload.iv 验签并解密
 */

/** 网关算法套件：aes=国际，gm=国密 */
export type GatewayAlg = 'aes' | 'gm';

/** 有 body 时的请求信封（POST/PUT/PATCH） */
export type GatewayRequestEnvelope = {
  alg: GatewayAlg;
  /** 非对称封装后的对称 key（Hex 小写） */
  encKey: string;
  /** 随机 IV（Hex 小写，16 字节） */
  iv: string;
  /** 对称密文（Hex 小写） */
  content: string;
  /** 客户端毫秒时间戳 */
  ts: number;
  /** HMAC(对称key, iv&content&ts) Hex 小写 */
  sign: string;
};

/** 响应信封（无 encKey，复用本请求 session 中的对称 key） */
export type GatewayResponseEnvelope = {
  alg: GatewayAlg;
  iv: string;
  content: string;
  ts: number;
  sign: string;
};

/** 本请求会话：仅存对称 key，供解密响应 */
export type GatewaySession = {
  alg: GatewayAlg;
  symKeyHex: string;
};

/**
 * 无 JSON body 时用请求头传密钥材料（GET/DELETE/multipart）。
 * 头名与 Nest 一致（HTTP 头大小写不敏感）。
 */
export const GATEWAY_HEADER = {
  alg: 'X-Gateway-Alg',
  encKey: 'X-Gateway-Enc-Key',
  ts: 'X-Gateway-Ts',
  sign: 'X-Gateway-Sign',
} as const;

/**
 * 客户端套件：公钥封 key / 对称加解密 / HMAC。
 * 与服务端 GatewayCryptoSuite 对偶（服务端是 unwrapKey）。
 */
export interface GatewayCryptoSuite {
  readonly alg: GatewayAlg;
  /** 对称 key 字节长度：aes=32，sm4=16 */
  readonly symKeyBytes: number;
  /** RSA/SM2 加密明文（symKey Hex 或登录密码），输出 Hex 小写 */
  publicEncrypt(plainUtf8: string): string;
  symEncrypt(plainUtf8: string, symKeyHex: string, ivHex: string): string;
  symDecrypt(cipherHex: string, symKeyHex: string, ivHex: string): string;
  hmac(symKeyHex: string, canonical: string): string;
}
