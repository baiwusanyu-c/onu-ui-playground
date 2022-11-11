import type { Versions } from '@/composables/store'
import type { ImportMap } from '@/utils/import-map'

export const getSkyPack = (
  pkg: string,
  version: string | undefined = '',
  path = ''
) => {
  version = version ? `@${version}` : ''
  return `https://cdn.skypack.dev/${pkg}${version}${path}`
}

export const genJsdelivrLink = (
  pkg: string,
  version: string | undefined,
  path = ''
) => {
  version = version ? `@${version}` : ''
  return `https://cdn.jsdelivr.net/npm/${pkg}${version}${path}`
}

export const genVueLink = (version: string) => {
  const compilerSfc = getSkyPack(
    '@vue/compiler-sfc',
    version,
    '/dist/compiler-sfc.esm-browser.js'
  )
  const runtimeDom = getSkyPack(
    '@vue/runtime-dom',
    version,
    '/dist/runtime-dom.esm-browser.js'
  )
  return {
    compilerSfc,
    runtimeDom,
  }
}

export const genImportMap = ({
  vue,
  onu,
}: Partial<Versions> = {}): ImportMap => {
  interface Dependency {
    pkg?: string
    version?: string
    path?: string
    source?: 'skyPack' | 'jsdelivr'
  }
  // 指定组件库依赖路径，用于去cdn加载 onu-ui
  const deps: Record<string, Dependency> = {
    vue: {
      pkg: '@vue/runtime-dom',
      version: vue,
      path: '/dist/runtime-dom.esm-browser.js',
      source: 'jsdelivr',
    },
    '@vue/shared': {
      version: vue,
      path: '/dist/shared.esm-bundler.js',
      source: 'jsdelivr',
    },
    'onu-ui': {
      pkg: 'onu-ui',
      version: onu,
      path: '/dist/onu-ui.js',
      source: 'jsdelivr',
    },

    /* '@iconify-json/carbon': {
      pkg: '@iconify-json/carbon',
      path: '/carbon/index.js',
      source: 'jsdelivr',
    },*/
    /* 'ohmyfetch': {
      pkg: 'ohmyfetch',
      path: '/dist/index.mjs',
      source: 'jsdelivr',
    },*/
    /* '@unocss/preset-icons': {
      pkg: '@unocss/preset-icons',
      path: '/dist/browser.mjs',
      source: 'jsdelivr',
    },*/

    /* '@unocss/core': {
      pkg: '@unocss/core',
      path: '/dist/index.mjs',
      source: 'jsdelivr',
    },*/
    /*'@unocss/runtime': {
      pkg: '@unocss/runtime',
      path: '/uno.global.js',
      source: 'jsdelivr',
    },*/
    /*
    '@onu-ui/components': {
      pkg: '@onu-ui/components',
      version: onu,
      path: '/dist/components.js',
      source: 'jsdelivr',
    },
    '@onu-ui/utils': {
      pkg: '@onu-ui/utils',
      version: onu,
      path: '/dist/index.js',
      source: 'jsdelivr',
    },
    '@onu-ui/preset': {
      pkg: '@onu-ui/preset',
      version: onu,
      path: '/dist/index.js',
      source: 'jsdelivr',
    },*/
  }

  const onuDesignWebVueDeps: Record<string, Dependency> = {
    /* '@iconify-json/carbon': {
      pkg: '@iconify-json/carbon',
      path: '/carbon/index.js',
      source: 'skyPack',
    },
    '@unocss/preset-icons': {
      pkg: '@unocss/preset-icons',
      path: '/preset-icons/dist/index.js',
      source: 'skyPack',
    },
    'unocss': {
      pkg: 'unocss',
      path: 'dist/index.mjs',
      source: 'skyPack',
    },*/
    /*'resize-observer-polyfill': {
      pkg: 'resize-observer-polyfill',
      source: 'skyPack',
    },
    'compute-scroll-into-view': {
      pkg: 'compute-scroll-into-view',
      source: 'skyPack',
    },
    'scroll-into-view-if-needed': {
      pkg: 'scroll-into-view-if-needed',
      source: 'skyPack',
    },
    'b-tween': {
      pkg: 'b-tween',
      source: 'skyPack',
    },
    'b-validate': {
      pkg: 'b-validate',
      source: 'skyPack',
    },
    'number-precision': {
      pkg: 'number-precision',
      source: 'skyPack',
    },
    dayjs: {
      pkg: 'dayjs',
      source: 'skyPack',
    },
    'dayjs/plugin/customParseFormat': {
      pkg: 'dayjs',
      path: '/plugin/customParseFormat.js',
      source: 'skyPack',
    },
    'dayjs/plugin/isBetween': {
      pkg: 'dayjs',
      path: '/plugin/isBetween.js',
      source: 'skyPack',
    },
    'dayjs/plugin/weekOfYear': {
      pkg: 'dayjs',
      path: '/plugin/weekOfYear.js',
      source: 'skyPack',
    },
    'dayjs/plugin/advancedFormat': {
      pkg: 'dayjs',
      path: '/plugin/advancedFormat.js',
      source: 'skyPack',
    },
    'dayjs/plugin/weekYear': {
      pkg: 'dayjs',
      path: '/plugin/weekYear.js',
      source: 'skyPack',
    },
    'dayjs/plugin/quarterOfYear': {
      pkg: 'dayjs',
      path: '/plugin/quarterOfYear.js',
      source: 'skyPack',
    },
    'dayjs/locale/zh-cn': {
      pkg: 'dayjs',
      path: '/locale/zh-cn.js',
      source: 'skyPack',
    },*/
  }

  return {
    imports: Object.fromEntries(
      Object.entries({ ...deps, ...onuDesignWebVueDeps }).map(([key, dep]) => [
        key,
        (dep.source === 'skyPack' ? getSkyPack : genJsdelivrLink)(
          dep.pkg ?? key,
          dep.version,
          dep.path
        ),
      ])
    ),
  }
}
