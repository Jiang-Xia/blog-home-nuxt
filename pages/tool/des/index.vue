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
            <span class="label-text mb-1.5 block text-xs leading-none text-tech-muted">秘钥</span>
            <input
              v-model="secretKey"
              class="input input-bordered login-input w-full"
              placeholder="输入或生成秘钥"
            >
          </label>
          <label class="form-control w-full">
            <span class="label-text mb-1.5 block text-xs leading-none text-tech-muted">偏移量 (IV)</span>
            <input
              v-model="offset"
              class="input input-bordered login-input w-full"
              placeholder="偏移量"
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
        对称加密算法转换工具，包含有AES加密、DES加密、RC4加密、Rabbit加密、TripleDes加密等相关对称加密算法互相转换的工具。
        除了上述的对称加密算法外，还有3DES、Blowfish、IDEA、RC5、RC6等对称加密算法
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

definePageMeta({
  keepalive: true,
});
const encryptionList = [
  { value: 'AES', label: 'AES' },
  { value: 'DES', label: 'DES' },
  { value: 'RC4', label: 'RC4' },
  { value: 'Rabbit', label: 'Rabbit' },
  { value: 'TripleDES', label: 'TripleDES' },
];
const encryption = ref('AES');
const secretKey = ref('');
const offset = ref('pianyiliang');
const outputType = ref('Hex');

const plaintext = ref('');
const ciphertext = ref('');
const encrypted = () => {
  if (!plaintext.value) {
    messageDanger('请先输入原文');
    return;
  }
  if (!secretKey.value) {
    messageDanger('请先输入密钥');
    return;
  }
  const wordUTF8 = CryptoJS.enc.Utf8.parse(plaintext.value);
  const keyUTF8 = CryptoJS.enc.Utf8.parse(secretKey.value);
  const offsetUTF8 = CryptoJS.enc.Utf8.parse(offset.value);
  const type = encryption.value;
  // @ts-expect-error: 不需要进行ts检测
  const encrypted = CryptoJS[type].encrypt(wordUTF8, keyUTF8, {
    iv: offsetUTF8,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  if (outputType.value === 'Hex') {
    ciphertext.value = encrypted.toString(CryptoJS.format.Hex).toUpperCase();
  }
  else {
    ciphertext.value = encrypted.toString();
  }
};
const decrypt = () => {
  if (!ciphertext.value) {
    messageDanger('请先输入密文');
    return;
  }
  if (!secretKey.value) {
    messageDanger('请先输入密钥');
    return;
  }
  const keyUTF8 = CryptoJS.enc.Utf8.parse(secretKey.value);
  const offsetUTF8 = CryptoJS.enc.Utf8.parse(offset.value);
  let encryptedWord;
  if (outputType.value === 'Hex') {
    encryptedWord = CryptoJS.format.Hex.parse(ciphertext.value);
  }
  else {
    encryptedWord = ciphertext.value;
  }
  const type = encryption.value;
  // @ts-expect-error: 不需要进行ts检测
  const bytes = CryptoJS[type].decrypt(encryptedWord, keyUTF8, {
    iv: offsetUTF8,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  plaintext.value = bytes.toString(CryptoJS.enc.Utf8);
  if (!plaintext.value) {
    messageDanger('解密失败！');
  }
};

const createKey = () => {
  const key = CryptoJS.lib.WordArray.random(16);
  secretKey.value = key.toString(CryptoJS.enc.Hex);
};

onMounted(() => {
  createKey();
});
</script>
