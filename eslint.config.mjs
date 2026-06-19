// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt(
  // Your custom configs here
  {
    languageOptions: {
      globals: {
        pdfjsLib: 'readonly',
        PDFLib: 'readonly',
        SmoothSignature: 'readonly',
        JSZip: 'readonly',
        html2pdf: 'readonly',
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'no-console': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      'no-empty': 'off',
      'vue/no-multiple-template-root': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'vue/require-v-for-key': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      'no-undef': 'warn',
      '@typescript-eslint/ban-ts-comment': 'off',
      'import/no-mutable-exports': 'off',
      // '@stylistic/js/max-statements-per-line': ['error', { max: 2 }],
      'vue/max-attributes-per-line': [
        'error',
        {
          singleline: {
            max: 4,
          },
          multiline: {
            max: 3,
          },
        },
      ],
    },
  },
)
  .prepend
  // ...Prepend some flat configs in front
  ();
