import { resolve, dirname } from 'path';
import { defineNuxtModule, addComponentsDir, resolvePath } from '@nuxt/kit';

export default defineNuxtModule({
  meta: {
    name: 'inspria-ui',
    configKey: 'inspria',
    version: '0.0.1',
    compatibility: { nuxt: '^3.0.0' },
  },
  setup() {
    const path = resolve('./lib/ui');
    // console.log('pathpath', path);
    addComponentsDir({
      path,
      prefix: 'In',
      pathPrefix: false,
      global: true,
    });
  },
});
