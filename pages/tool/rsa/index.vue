<template>
  <div class="space-y-5">
    <CryptoKeyPairPanel v-model:private-key="privateKey" v-model:public-key="publicKey">
      <template #toolbar>
        <label class="form-control w-full max-w-[10rem]">
          <span class="label-text mb-1.5 block text-xs leading-none text-tech-muted">密钥长度</span>
          <select v-model="keySize" class="select select-bordered login-input w-full">
            <option value="512"> 512 bit </option>
            <option value="1024"> 1024 bit </option>
            <option value="2048"> 2048 bit </option>
            <option value="4096"> 4096 bit </option>
          </select>
        </label>
        <div class="form-control shrink-0">
          <span
            class="label-text mb-1.5 block text-xs leading-none invisible select-none"
            aria-hidden="true"
          >&nbsp;</span>
          <CyberButton variant="primary" class="w-full sm:w-auto" @click="createKey">
            <xia-icon icon="blog-quanxian" /> 生成秘钥
          </CyberButton>
        </div>
      </template>
    </CryptoKeyPairPanel>

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
          <select v-model="outputType" class="select select-bordered login-input w-full">
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

    <CryptoAboutPanel title="RSA 算法介绍">
      <p>
        RSA是一种公钥密码算法，它的名字由三位开发者，即Ron Rivest、Adi Shamir和Leonard
        Adleman的姓氏的首字母组成的。
      </p>
      <p>
        非对称加密算法中，有两个密钥：公钥和私钥。它们是一对，如果用公钥进行加密，只有用对应的私钥才能解密；如果用私钥进行加密，只有用对应的公钥才能解密。
      </p>
      <p>
        非对称加密算法实现机密信息的交换过程为：甲方生成一对密钥并将其中一个作为公钥向其他方公开；得到该公钥的乙方使用该密钥对机密信息进行加密后发送给甲方；甲方再用自己的另一个专用密钥对加密后的信息进行解密。
      </p>
    </CryptoAboutPanel>
  </div>
</template>

<script setup lang="ts">
import { rsaEncrypt, rsaDecrypt } from '~~/utils/jsencrypt';
import { messageDanger } from '~~/utils/toast';
import { loadRsaScript } from '~/utils/script-loader';

definePageMeta({
  keepalive: true,
});
const keySize = ref('1024');
const outputType = ref('Hex');
const privateKey = ref('');
const publicKey = ref('');
const createKey = () => {
  const encryptor = new window.JSEncrypt({ default_key_size: keySize.value });
  publicKey.value = encryptor.getPublicKey();
  privateKey.value = encryptor.getPrivateKey();
};

const plaintext = ref('');
const ciphertext = ref('');
const encrypted = () => {
  if (!plaintext.value) {
    messageDanger('请先输入原文');
    return;
  }
  ciphertext.value = rsaEncrypt(plaintext.value, publicKey.value, outputType.value);
};
const decrypt = () => {
  if (!ciphertext.value) {
    messageDanger('请先输入密文');
    return;
  }
  plaintext.value = rsaDecrypt(ciphertext.value, privateKey.value, outputType.value);
  if (!plaintext.value) {
    messageDanger('解密失败！');
  }
};

const transitionDone = waitForPageTransition();

onMounted(async () => {
  try {
    await loadRsaScript();
    await transitionDone;
    createKey();
  }
  catch {
    messageDanger('RSA 脚本加载失败');
  }
});
</script>
