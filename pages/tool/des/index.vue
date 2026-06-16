<template>
  <div class="space-y-4">
    <CyberToolCard title="秘钥设置" class="w-full">
      <div class="flex w-full flex-wrap items-center gap-2">
        <select v-model="encryption" class="select select-bordered login-input max-w-44">
          <option v-for="item in encryptionList" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </select>
        <input
          v-model="secretKey"
          class="input input-bordered login-input min-w-0 flex-1"
          placeholder="秘钥"
        >
        <input
          v-model="offset"
          class="input input-bordered login-input max-w-44"
          placeholder="偏移量"
        >
        <CyberButton variant="primary" class="shrink-0" @click="createKey">
          <xia-icon icon="blog-quanxian" /> 生成秘钥
        </CyberButton>
      </div>
    </CyberToolCard>

    <div class="flex flex-col items-stretch gap-3 sm:flex-row sm:items-start">
      <CyberToolCard title="原文" width-class="w-full sm:flex-1">
        <textarea
          v-model="plaintext"
          placeholder="原文"
          class="textarea textarea-bordered login-input min-h-44 w-full"
        />
      </CyberToolCard>

      <div class="flex w-full flex-col gap-2 sm:w-36 sm:shrink-0">
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
          <xia-icon icon="blog-suoding" /> 加密原文
        </CyberButton>
        <CyberButton variant="secondary" class="w-full" @click="decrypt">
          <xia-icon icon="blog-jiesuo" /> 解密密文
        </CyberButton>
      </div>

      <CyberToolCard title="密文" width-class="w-full sm:flex-1">
        <textarea
          v-model="ciphertext"
          placeholder="密文"
          class="textarea textarea-bordered login-input min-h-44 w-full"
        />
      </CyberToolCard>
    </div>

    <CyberToolCard title="对称加密算法介绍">
      <div class="space-y-3 text-sm leading-relaxed text-tech-muted">
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
      </div>
    </CyberToolCard>
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
