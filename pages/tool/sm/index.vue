<template>
  <div class="p-4">
    <div class="flex justify-between items-center flex-col sm:flex-row">
      <div class="mt-4 card w-full sm:w-2/5 bg-base-100 shadow-xl border border-base-300">
        <div class="card-body">
          <h2 class="card-title">
            私钥(Private Key)
          </h2>
          <textarea
            v-model="privateKey"
            placeholder="Private Key"
            class="min-h-44 text-xs textarea textarea-bordered textarea-lg w-full"
          />
        </div>
      </div>

      <div class="join join-vertical w-28 m-2">
        <select
          v-model="keySize"
          placeholder="公钥长度"
          class="select select-accent select-bordered w-full max-w-xs join-item"
        >
          <option :value="130">
            130位
          </option>
          <option :value="66">
            66位
          </option>
        </select>
        <button class="btn btn-outline btn-accent join-item" @click="createKey">
          生成秘钥
        </button>
      </div>

      <div class="mt-4 card w-full sm:w-2/5 bg-base-100 shadow-xl border border-base-300">
        <div class="card-body">
          <h2 class="card-title">
            公钥(Public Key)
          </h2>
          <textarea
            v-model="publicKey"
            placeholder="Public Key"
            class="min-h-44 text-xs textarea textarea-bordered textarea-lg w-full"
          />
        </div>
      </div>
    </div>

    <div class="flex justify-between items-center flex-col sm:flex-row">
      <div class="mt-4 card w-full sm:w-2/5 bg-base-100 shadow-xl border border-base-300">
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
          v-model="cipherMode"
          placeholder="密文数据顺序"
          class="select select-info select-bordered w-full max-w-xs join-item"
        >
          <option :value="1">
            C1C3C2
          </option>
          <option :value="0">
            C1C2C3
          </option>
        </select>
        <button class="btn btn-outline btn-info join-item" @click="encrypted">
          {{ '加密==>' }}
        </button>
        <button class="btn btn-outline btn-info join-item" @click="decrypt">
          {{ '<==解密' }}
        </button>
      </div>
      <div class="mt-4 card w-full sm:w-2/5 bg-base-100 shadow-xl border border-base-300">
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

    <div class="mt-4 card w-full bg-base-100 shadow-xl border border-base-300">
      <div class="card-body">
        <h2 class="card-title">
          国密SM2加密解密介绍
        </h2>
        <p> 本工具提供在线国密SM2公钥私钥生成，国密SM2加密解密功能。 </p>
        <p>
          SM2算法和RSA算法都是公钥密码算法，SM2算法是一种更先进安全的算法，在我们国家商用密码体系中被用来替换RSA算法。
        </p>
        <p>
          SM2非对称加密的结果由C1,C2,C3三部分组成。其中C1是根据生成的随机数计算出的椭圆曲线点，C2是密文数据，C3是SM3的摘要值。最开始的国密标准的结果是按C1,C2,C3顺序存放的，新标准的是按C1,C3,C2顺序存放的，因此我们这边在做SM2加密时新增了密文数据顺序设置，用以兼容之前的SM2算法加密。
        </p>
        <p>
          <a
            class="link link-success"
            href="https://github.com/JuneAndGreen/sm-crypto"
            target="_blank"
          >开源库:sm-crypto</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { sm2, type CipherMode } from 'sm-crypto';
import { messageDanger } from '~~/utils/toast';

definePageMeta({
  keepalive: true, // nuxt 默认缓存所有页面
});
const keySize = ref(130);
const cipherMode = ref<CipherMode>(1);
const privateKey = ref('');
const publicKey = ref('');
const createKey = () => {
  const keypair = sm2.generateKeyPairHex();
  publicKey.value = keypair.publicKey; // 公钥
  privateKey.value = keypair.privateKey; // 私钥
  if (keySize.value === 66) {
    // 默认生成公钥 130 位太长，可以压缩公钥到 66 位
    const compressedPublicKey = sm2.compressPublicKeyHex(publicKey.value); // compressedPublicKey 和 publicKey 等价
    sm2.comparePublicKeyHex(publicKey.value, compressedPublicKey); // 判断公钥是否等价
    publicKey.value = compressedPublicKey;
  }
};

const plaintext = ref('');
const ciphertext = ref('');
const encrypted = () => {
  if (!plaintext.value) {
    messageDanger('请先输入原文');
    return;
  }
  ciphertext.value = sm2.doEncrypt(plaintext.value, publicKey.value, cipherMode.value);
};
const decrypt = () => {
  if (!ciphertext.value) {
    messageDanger('请先输入密文');
    return;
  }
  plaintext.value = sm2.doDecrypt(ciphertext.value, privateKey.value, cipherMode.value);
  if (!plaintext.value) {
    messageDanger('解密失败！');
  }
};

onMounted(() => {
  createKey();
  // console.log(crypto.rsaEncrypt)
});
</script>
