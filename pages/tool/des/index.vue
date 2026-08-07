<!--
  对称加密工具：AES/DES/RC4/Rabbit/TripleDES（CryptoJS）与国密 SM4（sm-crypto CDN）
  纯前端加解密，无后端 API
-->
<template>
  <div class="space-y-5">
    <CryptoToolSection label="KEY CONFIG">
      <div class="cyber-glass-card !p-4 md:!p-5">
        <div
          class="crypto-form-grid grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)_auto]"
        >
          <label class="form-control w-full">
            <span class="label-text mb-1.5 block text-xs leading-none text-tech-muted">加密算法</span>
            <select v-model="encryption" class="select select-bordered login-input w-full">
              <option v-for="item in encryptionList" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
          </label>
          <label class="form-control w-full">
            <span class="label-text mb-1.5 block text-xs leading-none text-tech-muted">
              {{ isSm4 ? '秘钥 (32 位 Hex)' : '秘钥' }}
            </span>
            <input
              v-model="secretKey"
              class="input input-bordered login-input w-full"
              :placeholder="isSm4 ? '128 bit 十六进制密钥' : '输入或生成秘钥'"
            >
          </label>
          <label class="form-control w-full">
            <span class="label-text mb-1.5 block text-xs leading-none text-tech-muted">
              {{ isSm4 ? '偏移量 IV（可选，32 位 Hex）' : '偏移量 (IV，可选)' }}
            </span>
            <input
              v-model="offset"
              class="input input-bordered login-input w-full"
              :placeholder="isSm4 ? '空=ECB；填写则 CBC' : '可为空'"
            >
          </label>
          <label class="form-control w-full shrink-0 lg:w-auto">
            <span
              class="label-text mb-1.5 block text-xs leading-none invisible select-none"
              aria-hidden="true"
            >&nbsp;</span>
            <CyberButton variant="primary" class="w-full lg:w-auto" @click="createKey">
              <xia-icon icon="blog-quanxian" /> 生成秘钥
            </CyberButton>
          </label>
        </div>
      </div>
    </CryptoToolSection>

    <CryptoToolSection label="CIPHER">
      <CryptoWorkspace
        v-model:input="plaintext"
        v-model:output="ciphertext"
        input-label="原文"
        output-label="密文"
        input-placeholder="输入待加密的原文..."
        output-placeholder="加密结果将显示在这里..."
      >
        <template #actions>
          <select
            v-model="outputType"
            class="select select-bordered login-input w-full"
            @change="ciphertext = ''"
          >
            <option value="Hex">
              Hex
            </option>
            <option value="Base64">
              Base64
            </option>
          </select>
          <CyberButton variant="secondary" class="w-full" @click="encrypted">
            <xia-icon icon="blog-suoding" /> 加密 →
          </CyberButton>
          <CyberButton variant="secondary" class="w-full" @click="decrypt">
            ← 解密 <xia-icon icon="blog-jiesuo" />
          </CyberButton>
        </template>
      </CryptoWorkspace>
    </CryptoToolSection>

    <CryptoAboutPanel title="对称加密算法介绍">
      <p>
        对称加密算法转换工具，包含 AES、DES、RC4、Rabbit、TripleDES，以及国密
        SM4。加密与解密使用同一密钥；填充为 PKCS7（SM4 为 pkcs#7）。
      </p>
      <p>
        SM4 密钥须为 32 位十六进制（128 bit）。偏移量 IV 可为空：空则使用 ECB，填写则使用 CBC（IV
        同样须为 32 位 Hex）。Hex 密文解密不区分大小写。实现基于
        <a
          class="link link-primary"
          href="https://github.com/JuneAndGreen/sm-crypto"
          target="_blank"
        >sm-crypto</a>。
      </p>
      <p>对称加密的优势：对称加密的速度比公钥加密快很多，在很多场合都需要对称加密</p>
      <h3 class="text-base font-semibold text-tech">
        对称加密与非对称加密的区别
      </h3>
      <p>
        对称加密算法在加密和解密时使用的是同一个秘钥；而非对称加密算法需要两个密钥来进行加密和解密，这两个秘钥是公开密钥（public
        key）和私有密钥（private key）。
      </p>
    </CryptoAboutPanel>
  </div>
</template>

<script setup lang="ts">
import CryptoJS from 'crypto-js';
import { messageDanger } from '~~/utils/toast';
import { loadSm4Script } from '~/utils/script-loader';

definePageMeta({
  keepalive: true,
});

const encryptionList = [
  { value: 'AES', label: 'AES' },
  { value: 'DES', label: 'DES' },
  { value: 'RC4', label: 'RC4' },
  { value: 'Rabbit', label: 'Rabbit' },
  { value: 'TripleDES', label: 'TripleDES' },
  { value: 'SM4', label: 'SM4（国密）' },
];
const encryption = ref('AES');
const secretKey = ref('');
const offset = ref('pianyiliang');
const outputType = ref('Hex');

const plaintext = ref('');
const ciphertext = ref('');

const isSm4 = computed(() => encryption.value === 'SM4');

/** 是否为 16 字节（32 位 hex）串，供 SM4 密钥 / IV 校验 */
function isHex16Bytes(value: string) {
  return /^[0-9a-fA-F]{32}$/.test(value);
}

function getSm4Api() {
  return (window as typeof window & { sm4?: typeof sm4 }).sm4;
}

/** 按需加载 SM4 CDN，失败时提示并返回 false */
async function ensureSm4Ready() {
  if (getSm4Api()?.encrypt) {
    return true;
  }
  try {
    await loadSm4Script();
    if (!getSm4Api()?.encrypt) {
      messageDanger('SM4 脚本未就绪');
      return false;
    }
    return true;
  }
  catch {
    messageDanger('SM4 脚本加载失败');
    return false;
  }
}

/** Hex ↔ Base64，供 SM4 输出格式与 CryptoJS 页面对齐 */
function hexToBase64(hex: string) {
  return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Hex.parse(hex));
}

function base64ToHex(base64: string) {
  return CryptoJS.enc.Hex.stringify(CryptoJS.enc.Base64.parse(base64));
}

/** Hex 密文规范化：去空白/0x、转小写（解密不区分大小写） */
function normalizeHexCipher(value: string) {
  return value.replace(/\s+/g, '').replace(/^0x/i, '').toLowerCase();
}

/**
   * 组装 SM4 选项：IV 空 → ECB；有值 → CBC（须 32 位 hex）
   * @returns 合法选项，校验失败返回 null
   */
function buildSm4Options(): { mode?: string; iv?: string } | null {
  const iv = offset.value.trim();
  if (!iv) {
    return { mode: 'ecb' };
  }
  if (!isHex16Bytes(iv)) {
    messageDanger('SM4 IV 若填写须为 32 位十六进制（128 bit）');
    return null;
  }
  return { mode: 'cbc', iv: iv.toLowerCase() };
}

/** SM4 加密；密钥须 32 位 hex，IV 可选 */
async function encryptWithSm4() {
  if (!(await ensureSm4Ready())) {
    return;
  }
  if (!isHex16Bytes(secretKey.value)) {
    messageDanger('SM4 密钥须为 32 位十六进制（128 bit）');
    return;
  }
  const opts = buildSm4Options();
  if (!opts) {
    return;
  }
  try {
    const hexCipher = getSm4Api().encrypt(
      plaintext.value,
      secretKey.value.toLowerCase(),
      opts,
    ) as string;
    ciphertext.value
      = outputType.value === 'Hex' ? hexCipher.toUpperCase() : hexToBase64(hexCipher);
  }
  catch (err) {
    messageDanger(err instanceof Error ? err.message : 'SM4 加密失败');
  }
}

/** SM4 解密；Hex 密文大小写均可，Base64 先转 hex；IV 与加密时一致 */
async function decryptWithSm4() {
  if (!(await ensureSm4Ready())) {
    return;
  }
  if (!isHex16Bytes(secretKey.value)) {
    messageDanger('SM4 密钥须为 32 位十六进制（128 bit）');
    return;
  }
  const opts = buildSm4Options();
  if (!opts) {
    return;
  }
  try {
    const hexCipher
      = outputType.value === 'Hex'
        ? normalizeHexCipher(ciphertext.value)
        : base64ToHex(ciphertext.value);
    plaintext.value = getSm4Api().decrypt(
      hexCipher,
      secretKey.value.toLowerCase(),
      opts,
    ) as string;
    if (!plaintext.value) {
      messageDanger('解密失败！');
    }
  }
  catch (err) {
    messageDanger(err instanceof Error ? err.message : 'SM4 解密失败');
  }
}

/** CryptoJS 选项：IV 空 → ECB，有值 → CBC */
function buildCryptoJsCipherOpts() {
  const ivText = offset.value.trim();
  if (!ivText) {
    return {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    };
  }
  return {
    iv: CryptoJS.enc.Utf8.parse(ivText),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  };
}

/** CryptoJS 对称算法加密（IV 空用 ECB，否则 CBC + PKCS7） */
function encryptWithCryptoJs() {
  const wordUTF8 = CryptoJS.enc.Utf8.parse(plaintext.value);
  const keyUTF8 = CryptoJS.enc.Utf8.parse(secretKey.value);
  const type = encryption.value;
  // @ts-expect-error: CryptoJS 按算法名动态取模块
  const encrypted = CryptoJS[type].encrypt(wordUTF8, keyUTF8, buildCryptoJsCipherOpts());
  if (outputType.value === 'Hex') {
    ciphertext.value = encrypted.toString(CryptoJS.format.Hex).toUpperCase();
  }
  else {
    ciphertext.value = encrypted.toString();
  }
}

/** CryptoJS 对称算法解密（Hex 不区分大小写；模式与加密侧一致） */
function decryptWithCryptoJs() {
  const keyUTF8 = CryptoJS.enc.Utf8.parse(secretKey.value);
  let encryptedWord;
  if (outputType.value === 'Hex') {
    encryptedWord = CryptoJS.format.Hex.parse(normalizeHexCipher(ciphertext.value));
  }
  else {
    encryptedWord = ciphertext.value;
  }
  const type = encryption.value;
  // @ts-expect-error: CryptoJS 按算法名动态取模块
  const bytes = CryptoJS[type].decrypt(encryptedWord, keyUTF8, buildCryptoJsCipherOpts());
  plaintext.value = bytes.toString(CryptoJS.enc.Utf8);
  if (!plaintext.value) {
    messageDanger('解密失败！');
  }
}

/** 加密：SM4 走 sm-crypto，其余走 CryptoJS */
const encrypted = async () => {
  if (!plaintext.value) {
    messageDanger('请先输入原文');
    return;
  }
  if (!secretKey.value) {
    messageDanger('请先输入密钥');
    return;
  }
  if (isSm4.value) {
    await encryptWithSm4();
    return;
  }
  encryptWithCryptoJs();
};

/** 解密：与加密同一算法分支 */
const decrypt = async () => {
  if (!ciphertext.value) {
    messageDanger('请先输入密文');
    return;
  }
  if (!secretKey.value) {
    messageDanger('请先输入密钥');
    return;
  }
  if (isSm4.value) {
    await decryptWithSm4();
    return;
  }
  decryptWithCryptoJs();
};

/** 生成 16 字节随机密钥；不改动 IV（可为空） */
const createKey = () => {
  const key = CryptoJS.lib.WordArray.random(16);
  secretKey.value = key.toString(CryptoJS.enc.Hex);
};

/** 切到 SM4：校正密钥；非 hex 的 IV 清空为 ECB，不强制生成 */
watch(encryption, (algo) => {
  ciphertext.value = '';
  if (algo !== 'SM4') {
    return;
  }
  if (!isHex16Bytes(secretKey.value)) {
    createKey();
  }
  const iv = offset.value.trim();
  if (iv && !isHex16Bytes(iv)) {
    offset.value = '';
  }
});

onMounted(async () => {
  createKey();
  // 进入页即加载 SM4，避免切到算法后再等 CDN
  await ensureSm4Ready();
});
</script>
