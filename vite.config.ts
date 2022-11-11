import path from 'node:path'
import { defineConfig } from 'vite'
import Unocss from 'unocss/vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Inspect from 'vite-plugin-inspect'
import Mkcert from 'vite-plugin-mkcert'
import basicSsl from '@vitejs/plugin-basic-ssl'
import pkg from './package.json'

const pathSrc = path.resolve(__dirname, 'src')

export default defineConfig(async ({ mode }) => {
  return {
    resolve: {
      alias: {
        '@': pathSrc,
      },
    },
    define: {
      'import.meta.env.APP_VERSION': JSON.stringify(pkg.version),
    },
    server: {
      https: false,
      host: true,
    },
    plugins: [
      vue({
        reactivityTransform: true,
      }),
      AutoImport({
        imports: ['vue', '@vueuse/core'],
        dts: path.resolve(pathSrc, 'auto-imports.d.ts'),
      }),
      Unocss(),
      mode === 'production' ? Mkcert() : undefined,
      Inspect(),
      basicSsl(),
    ],
  }
})
