import path from 'node:path'
import { defineConfig } from 'vite'
import Unocss from 'unocss/vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import pkg from './package.json'

const pathSrc = path.resolve(__dirname, 'src')

export default defineConfig(async ({ mode }) => {
  return {
    resolve: {
      alias: {
        '@': pathSrc,
      },
    },
    server: {
      https: false,
      host: true,
    },
    plugins: [
      vue(),
      AutoImport({
        imports: ['vue', '@vueuse/core'],
        dts: path.resolve(pathSrc, 'auto-imports.d.ts'),
      }),
      Unocss(),
    ],
    build: {
      target: 'esnext',
      emptyOutDir: true,
      rollupOptions: {
        external: [
          '@iconify/utils/lib/loader/fs',
          '@iconify/utils/lib/loader/install-pkg',
          '@iconify/utils/lib/loader/node-loader',
          '@iconify/utils/lib/loader/node-loaders',
        ],
      },
    },
  }
})
