module.exports = {
  extends: ['@nuxtjs/eslint-config-typescript'],
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
  rules: {
    indent: [0, 2],
    '@typescript-eslint/no-unused-vars': 'warn',
    'vue/singleline-html-element-content-newline': [
      0,
      {
        // 配合printWidth
        ignoreWhenNoAttributes: true,
        ignoreWhenEmpty: true,
        ignores: ['pre', 'textarea'],
      }
    ],
    'vue/multi-word-component-names': 'off',
    'comma-dangle': [
      'error',
      {
        // comma dangle
        arrays: 'never',
        objects: 'always', // 对象中最后一个属性 总是有分号
        imports: 'never',
        exports: 'never',
        functions: 'never',
      }
    ],
    'vue/no-multiple-template-root': 0,
    'vue/no-unused-vars': 1,
    'vue/require-v-for-key': 0,
    'no-console': 0,
  },
}
