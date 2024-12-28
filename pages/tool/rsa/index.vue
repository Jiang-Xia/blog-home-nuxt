<template>
  <div class="p-4">
    <div class="flex justify-between items-center flex-col sm:flex-row">
      <div
        class="mt-4 card card-compact w-full sm:w-2/5 bg-base-100 shadow-xl border border-base-300"
      >
        <div class="card-body">
          <h2 class="card-title">私钥(Private Key)</h2>
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
          placeholder="密文输出类型"
          class="select select-accent select-bordered w-full max-w-xs join-item"
        >
          <option value="512">512 bit</option>
          <option value="1024">1024 bit</option>
          <option value="2048">2048 bit</option>
          <option value="4096">4096 bit</option>
        </select>
        <button class="btn btn-outline btn-accent join-item" @click="createKey">生成秘钥</button>
      </div>

      <div
        class="mt-4 card card-compact w-full sm:w-2/5 bg-base-100 shadow-xl border border-base-300"
      >
        <div class="card-body">
          <h2 class="card-title">公钥(Public Key)</h2>
          <textarea
            v-model="publicKey"
            placeholder="Public Key"
            class="min-h-44 text-xs textarea textarea-bordered textarea-lg w-full"
          />
        </div>
      </div>
    </div>

    <div class="flex justify-between items-center flex-col sm:flex-row">
      <div
        class="mt-4 card card-compact w-full sm:w-2/5 bg-base-100 shadow-xl border border-base-300"
      >
        <div class="card-body">
          <h2 class="card-title">原文</h2>
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
          <option value="Hex">Hex</option>
          <option value="Base64">Base64</option>
        </select>
        <button class="btn btn-outline btn-info join-item" @click="encrypted">
          {{ '加密==>' }}
        </button>
        <button class="btn btn-outline btn-info join-item" @click="decrypt">{{ '<==解密' }}</button>
      </div>
      <div
        class="mt-4 card card-compact w-full sm:w-2/5 bg-base-100 shadow-xl border border-base-300"
      >
        <div class="card-body">
          <h2 class="card-title">密文</h2>
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
        <h2 class="card-title">RSA算法介绍</h2>
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
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { publicKey as pubkey, privateKey as priKey } from '~~/config/ssh'
  import { rsaEncrypt, rsaDecrypt } from '~~/utils/jsencrypt'
  import { messageDanger } from '~~/utils/toast'

  definePageMeta({
    keepalive: true, // nuxt 默认缓存所有页面
  })
  const keySize = ref('1024')
  const outputType = ref('Hex')
  const privateKey = ref('')
  const publicKey = ref('')
  const createKey = () => {
    const encryptor = new window.JSEncrypt({ default_key_size: keySize.value, })
    publicKey.value = encryptor.getPublicKey()
    privateKey.value = encryptor.getPrivateKey()
  }

  const plaintext = ref('')
  const ciphertext = ref('')
  const encrypted = () => {
    if (!plaintext.value) {
      messageDanger('请先输入原文')
      return
    }
    ciphertext.value = rsaEncrypt(plaintext.value, pubkey, outputType.value)
  }
  const decrypt = () => {
    if (!ciphertext.value) {
      messageDanger('请先输入密文')
      return
    }
    plaintext.value = rsaDecrypt(ciphertext.value, priKey, outputType.value)
    if (!plaintext.value) {
      messageDanger('解密失败！')
    }
  }

  onMounted(() => {
    createKey()
    // console.log(crypto.rsaEncrypt)
  })
</script>
