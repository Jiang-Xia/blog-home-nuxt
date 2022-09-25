import { mkdirSync, writeFileSync } from 'fs'
import { Readable } from 'stream'
import { dirname } from 'path'
import { SitemapStream, streamToPromise } from 'sitemap'
import { defineNuxtModule, createResolver } from '@nuxt/kit'
import { $fetch } from 'ohmyfetch'
export default defineNuxtModule({
  meta: {
    name: 'sitemap',
    version: '0.0.1',
    configKey: 'sitemap',
    compatibility: { nuxt: '^3.0.0', },
  },
  defaults: {
    hostname: 'http://localhost:5050',
  },
  setup (options, nuxt) {
    function generateSitemap (routes, ids: []) {
      let sitemapRoutes = routes.map(route => route.path)
      // console.log({sitemapRoutes,ids})
      const details = ids.map((v: any) => 'detail/' + v)
      sitemapRoutes = sitemapRoutes.concat(details)
      // https://github.com/ekalinin/sitemap.js#generate-a-one-time-sitemap-from-a-list-of-urls
      const stream = new SitemapStream({ hostname: options.hostname, })
      return streamToPromise(Readable.from(sitemapRoutes).pipe(stream)).then(data =>
        data.toString()
      )
    }

    function createSitemapFile (sitemap, filepath) {
      const dirPath = dirname(filepath)
      mkdirSync(dirPath, { recursive: true, })
      writeFileSync(filepath, sitemap)
    }

    const resolver = createResolver(import.meta.url)
    const filePath = resolver.resolve(
      nuxt.options.srcDir,
      'node_modules/.cache/.sitemap/sitemap.xml'
    )

    nuxt.options.nitro.publicAssets = nuxt.options.nitro.publicAssets || []
    nuxt.options.nitro.publicAssets.push({
      baseURL: '/',
      dir: dirname(filePath),
    })

    nuxt.hook('pages:extend', async (pages) => {
      try {
        const res: any = await $fetch('https://jiang-xia.top/x-api/blog-server/article/list', {
          method: 'post',
          body: {
            page: 1,
            pageSize: 500,
          },
        })
        if (res.data.list) {
          const articleIds = res.data.list.map((v: any) => v.id)
          const sitemap = await generateSitemap(pages, articleIds)
          createSitemapFile(sitemap, filePath)
        }
      } catch (error) {
        console.error(error)
      }
    })
  },
})
