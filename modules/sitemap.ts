import { mkdirSync, writeFileSync } from 'fs';
import { Readable } from 'stream';
import { dirname } from 'path';
import { SitemapStream, streamToPromise } from 'sitemap';
import { defineNuxtModule, createResolver } from '@nuxt/kit';
import { ofetch } from 'ofetch';

export default defineNuxtModule({
  meta: {
    name: 'sitemap',
    version: '0.0.1',
    configKey: 'sitemap',
    compatibility: { nuxt: '^4.0.0' },
  },
  defaults: {
    hostname: 'http://localhost:5050',
  },
  setup(options, nuxt) {
    function generateSitemap(routes: any, articleIds: string[]) {
      const routePaths = routes
        .map((route: any) => route.path)
        .filter((path: string) => !path.includes(':'));
      const details = articleIds.map((id: string) => `/detail/${id}`);
      const sitemapEntries = [...routePaths, ...details].map(url => ({ url }));
      const stream = new SitemapStream({ hostname: options.hostname });
      return streamToPromise(Readable.from(sitemapEntries).pipe(stream)).then(data =>
        data.toString(),
      );
    }

    function createSitemapFile(sitemap: string, filepath: string) {
      const dirPath = dirname(filepath);
      mkdirSync(dirPath, { recursive: true });
      writeFileSync(filepath, sitemap);
    }

    const resolver = createResolver(import.meta.url);
    const filePath = resolver.resolve(
      nuxt.options.srcDir,
      'node_modules/.cache/.sitemap/sitemap.xml',
    );

    nuxt.options.nitro.publicAssets = nuxt.options.nitro.publicAssets || [];
    nuxt.options.nitro.publicAssets.push({
      baseURL: '/',
      dir: dirname(filePath),
    });

    nuxt.hook('pages:extend', async (pages) => {
      // 开发环境不用生产xml
      if (process.env.NODE_ENV === 'development') {
        return;
      }
      try {
        const res: any = await ofetch('https://jiang-xia.top/x-blog/api/v1/article/list', {
          method: 'post',
          body: {
            page: 1,
            pageSize: 500,
            category: '',
            tags: [],
            title: '',
            description: '',
            content: '',
            client: true,
            sort: 'DESC',
          },
        });
        const articleIds = res.data.list.map((v: any) => v.id);
        console.log('准备生成sitemap，文章数为', articleIds.length, '篇');
        const sitemap: string = await generateSitemap(pages, articleIds);
        createSitemapFile(sitemap, filePath);
      }
      catch (error) {
        console.error(error);
      }
    });
  },
});
