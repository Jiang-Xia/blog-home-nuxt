<template>
  <div class="space-y-4">
    <div class="flex flex-col items-stretch gap-3 sm:flex-row sm:items-start">
      <CyberToolCard title="私钥 (Private Key)" width-class="w-full sm:flex-1">
        <textarea
          v-model="privateKey"
          placeholder="Private Key"
          class="textarea textarea-bordered login-input min-h-44 w-full"
        />
      </CyberToolCard>

      <div class="flex w-full flex-col gap-2 sm:w-36 sm:shrink-0">
        <select v-model="keySize" class="select select-bordered login-input w-full">
          <option :value="130">
            130位
          </option>
          <option :value="66">
            66位
          </option>
        </select>
        <CyberButton variant="primary" class="w-full" @click="createKey">
          <xia-icon icon="blog-quanxian" /> 生成秘钥
        </CyberButton>
      </div>

      <CyberToolCard title="公钥 (Public Key)" width-class="w-full sm:flex-1">
        <textarea
          v-model="publicKey"
          placeholder="Public Key"
          class="textarea textarea-bordered login-input min-h-44 w-full"
        />
      </CyberToolCard>
    </div>

    <div class="flex flex-col items-stretch gap-3 sm:flex-row sm:items-start">
      <CyberToolCard title="原文" width-class="w-full sm:flex-1">
        <textarea
          v-model="plaintext"
          placeholder="原文"
          class="textarea textarea-bordered login-input min-h-44 w-full"
        />
      </CyberToolCard>

      <div class="flex w-full flex-col gap-2 sm:w-36 sm:shrink-0">
        <select v-model="cipherMode" class="select select-bordered login-input w-full">
          <option :value="1">
            C1C3C2
          </option>
          <option :value="0">
            C1C2C3
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

    <CyberToolCard title="国密 SM2 加密解密介绍">
      <div class="space-y-3 text-sm leading-relaxed text-tech-muted">
        <p>本工具提供在线国密SM2公钥私钥生成，国密SM2加密解密功能。</p>
        <p>
          SM2算法和RSA算法都是公钥密码算法，SM2算法是一种更先进安全的算法，在我们国家商用密码体系中被用来替换RSA算法。
        </p>
        <p>
          SM2非对称加密的结果由C1,C2,C3三部分组成。其中C1是根据生成的随机数计算出的椭圆曲线点，C2是密文数据，C3是SM3的摘要值。最开始的国密标准的结果是按C1,C2,C3顺序存放的，新标准的是按C1,C3,C2顺序存放的，因此我们这边在做SM2加密时新增了密文数据顺序设置，用以兼容之前的SM2算法加密。
        </p>
        <p>
          <a
            class="link link-primary"
            href="https://github.com/JuneAndGreen/sm-crypto"
            target="_blank"
          >开源库: sm-crypto</a>
        </p>
      </div>
    </CyberToolCard>
  </div>
</template>

<script setup lang="ts">
import { messageDanger } from '~~/utils/toast';
import { loadSm2Script } from '~/utils/script-loader';

definePageMeta({
  keepalive: true,
});

function getSm2Api() {
  return (window as typeof window & { sm2?: any }).sm2;
}

const keySize = ref(130);
const cipherMode = ref<number>(1);
const privateKey = ref('');
const publicKey = ref('');
const createKey = () => {
  const sm2Api = getSm2Api();
  if (!sm2Api?.generateKeyPairHex) {
    messageDanger('SM2 脚本未就绪');
    return;
  }
  const keypair = sm2Api.generateKeyPairHex();
  publicKey.value = keypair.publicKey;
  privateKey.value = keypair.privateKey;
  if (keySize.value === 66) {
    const compressedPublicKey = sm2Api.compressPublicKeyHex(publicKey.value);
    sm2Api.comparePublicKeyHex(publicKey.value, compressedPublicKey);
    publicKey.value = compressedPublicKey;
  }
};

const plaintext = ref('');
const ciphertext = ref('');
const encrypted = () => {
  const sm2Api = getSm2Api();
  if (!sm2Api?.doEncrypt) {
    messageDanger('SM2 脚本未就绪');
    return;
  }
  if (!plaintext.value) {
    messageDanger('请先输入原文');
    return;
  }
  ciphertext.value = sm2Api.doEncrypt(plaintext.value, publicKey.value, cipherMode.value);
};
const decrypt = () => {
  const sm2Api = getSm2Api();
  if (!sm2Api?.doDecrypt) {
    messageDanger('SM2 脚本未就绪');
    return;
  }
  if (!ciphertext.value) {
    messageDanger('请先输入密文');
    return;
  }
  plaintext.value = sm2Api.doDecrypt(ciphertext.value, privateKey.value, cipherMode.value);
  if (!plaintext.value) {
    messageDanger('解密失败！');
  }
};

const transitionDone = waitForPageTransition();

onMounted(async () => {
  try {
    await loadSm2Script();
    await transitionDone;
    createKey();
  }
  catch {
    messageDanger('SM2 脚本加载失败');
  }
});
</script>
