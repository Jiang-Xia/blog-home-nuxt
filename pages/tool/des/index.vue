<template>
  <div class="p-4">
    <div class="flex justify-between items-center flex-col sm:flex-row">
      <div class="mt-4 card card-compact w-full bg-base-100 shadow-xl border border-base-300">
        <div class="card-body">
          <h2 class="card-title">
            秘钥
          </h2>
          <div class="join flex justify-center :flex-nowrap w-full">
            <select
              v-model="encryption"
              placeholder="加密方式"
              class="select select-accent select-bordered join-item"
            >
              <option
                v-for="item in encryptionList"
                :value="item.value"
              >
                {{ item.label }}
              </option>
            </select>
            <input
              v-model="secretKey"
              class="w-2/5 input input-bordered input-accent join-item"
              placeholder="秘钥"
            >
            <input
              v-model="offset"
              class="w-2/5 input input-bordered input-accent max-w-xs join-item"
              placeholder="偏移量"
            >
            <button
              class="btn btn-outline btn-accent join-item"
              @click="createKey"
            >
              生成秘钥
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-between items-center flex-col sm:flex-row">
      <div
        class="mt-4 card card-compact w-full sm:w-2/5 bg-base-100 shadow-xl border border-base-300"
      >
        <div class="card-body">
          <h2 class="card-title">
            原文
          </h2>
          <textarea
            v-model="plaintext"
            placeholder="原文"
            class="min-h-44 text-xs textarea textarea-bordered textarea-lg w-full"
          />
        </div>
      </div>
      <div class="join join-vertical w-28 m-2">
        <select
          v-model="outputType"
          placeholder="密文输出类型"
          class="select select-info select-bordered w-full max-w-xs join-item"
        >
          <option value="Hex">
            Hex
          </option>
          <option value="Base64">
            Base64
          </option>
        </select>
        <button
          class="btn btn-outline btn-info join-item"
          @click="encrypted"
        >
          {{ '加密==>' }}
        </button>
        <button
          class="btn btn-outline btn-info join-item"
          @click="decrypt"
        >
          {{ '<==解密' }}
        </button>
      </div>
      <div
        class="mt-4 card card-compact w-full sm:w-2/5 bg-base-100 shadow-xl border border-base-300"
      >
        <div class="card-body">
          <h2 class="card-title">
            密文
          </h2>
          <textarea
            v-model="ciphertext"
            placeholder="密文"
            class="min-h-44 text-xs textarea textarea-bordered textarea-lg w-full"
          />
        </div>
      </div>
    </div>

    <div class="mt-4 card card-compact w-full bg-base-100 shadow-xl border border-base-300">
      <div class="card-body">
        <h2 class="card-title">
          对称加密算法介绍
        </h2>
        <p>
          对称加密算法转换工具，包含有AES加密、DES加密、RC4加密、Rabbit加密、TripleDes加密等相关对称加密算法互相转换的工具。
          除了上述的对称加密算法外，还有3DES、Blowfish、IDEA、RC5、RC6等对称加密算法
        </p>
        <p> 对称加密的优势：对称加密的速度比公钥加密快很多，在很多场合都需要对称加密 </p>
        <h3 class="card-title">
          对称加密与非对称加密的区别
        </h3>
        <p>
          对称加密算法在加密和解密时使用的是同一个秘钥；而非对称加密算法需要两个密钥来进行加密和解密，这两个秘钥是公开密钥（public
          key）和私有密钥（private key）。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CryptoJS from 'crypto-js';
import { messageDanger } from '~~/utils/toast';

definePageMeta({
  keepalive: true, // nuxt 默认缓存所有页面
});
const encryptionList = [
  {
    value: 'AES',
    label: 'AES',
  },
  {
    value: 'DES',
    label: 'DES',
  },
  {
    value: 'RC4',
    label: 'RC4',
  },
  {
    value: 'Rabbit',
    label: 'Rabbit',
  },
  {
    value: 'TripleDES',
    label: 'TripleDES',
  },
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
  // 未加密的参数 - 从 UTF-8编码 解析出原始字符串
  const wordUTF8 = CryptoJS.enc.Utf8.parse(plaintext.value);
  // 密钥 - 从 UTF-8编码 解析出原始字符串
  const keyUTF8 = CryptoJS.enc.Utf8.parse(secretKey.value);
  // 偏移量 从 UTF-8编码 解析出原始字符串
  const offsetUTF8 = CryptoJS.enc.Utf8.parse(offset.value);
  const type = encryption.value;
  // @ts-expect-error: 不需要进行ts检测
  const encrypted = CryptoJS[type].encrypt(wordUTF8, keyUTF8, {
    iv: offsetUTF8,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
    // 转成16进制 变成大写不影响解密
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
  // 密钥 - 从 UTF-8编码 解析出原始字符串
  const keyUTF8 = CryptoJS.enc.Utf8.parse(secretKey.value);
  // 偏移量 从 UTF-8编码 解析出原始字符串
  const offsetUTF8 = CryptoJS.enc.Utf8.parse(offset.value);
  let encryptedWord;
  if (outputType.value === 'Hex') {
    // 解析十六进制字符串
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
  // 将秘钥转换为十六进制字符串
  const keyHex = key.toString(CryptoJS.enc.Hex);
  secretKey.value = keyHex;
};

onMounted(() => {
  createKey();
  // console.log(crypto.rsaEncrypt)
});
</script>
