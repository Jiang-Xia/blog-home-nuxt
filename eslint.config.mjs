// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt(
  // Your custom configs here
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      'no-empty': 'off',
      'vue/no-multiple-template-root': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'vue/require-v-for-key': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      'no-undef': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      'import/no-mutable-exports': 'off',
      // '@stylistic/js/max-statements-per-line': ['error', { max: 2 }],
    },
  },
)
  .prepend
  // ...Prepend some flat configs in front
  ();
