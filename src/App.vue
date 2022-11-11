<script setup lang="ts">
import { OMessage as message } from 'onu-ui'
import Header from '@/components/Header.vue'
import { type UserOptions, type Versions, useStore } from '@/composables/store'
import { generate } from '@/utils/uno/uno'
// @ts-ignore
import { Repl } from '../vue-repl/vue-repl.js'
import playConfig from '../playground.config'
import type { BuiltInParserName } from 'prettier'
import type { Fn } from '@vueuse/core'
import type { OMessageProps } from 'onu-ui'

const loading = ref(true)
const sfcOptions: any = {
  script: {
    reactivityTransform: true,
  },
}
const initialUserOptions: UserOptions = {}
const params = new URLSearchParams(location.search)
const initialVersions: Versions = {
  [playConfig.compLibShort]: params.get(playConfig.compLibShort) || 'latest',
  vue: params.get('vue') || 'latest',
}

const store = useStore({
  serializedState: location.hash.slice(1),
  userOptions: initialUserOptions,
  versions: initialVersions,
})

store.init().then(() => {
  loading.value = false
  message({
    content: 'please wait patiently',
    type: 'info',
  } as OMessageProps)
})

const handleKeydown = (evt: KeyboardEvent) => {
  if ((evt.ctrlKey || evt.metaKey) && evt.code === 'KeyS') {
    evt.preventDefault()
    return
  }

  // NOTE: ctrl or alt + shift + f => format code
  if ((evt.altKey || evt.ctrlKey) && evt.shiftKey && evt.code === 'KeyF') {
    evt.preventDefault()
    formatCode()
    return
  }
}

let loadedFormat = false
const formatCode = async () => {
  let close: Fn | undefined
  if (!loadedFormat) {
    message({
      content: 'Loading Prettier...',
      type: 'info',
    } as OMessageProps)
  }

  const [format, parserHtml, parserTypeScript, parserBabel, parserPostcss] =
    await Promise.all([
      import('prettier/standalone').then((r) => r.format),
      import('prettier/parser-html').then((m) => m.default),
      import('prettier/parser-typescript').then((m) => m.default),
      import('prettier/parser-babel').then((m) => m.default),
      import('prettier/parser-postcss').then((m) => m.default),
    ])
  loadedFormat = true
  close?.()

  const file = store.state.activeFile
  let parser: BuiltInParserName
  if (file.filename.endsWith('.vue')) {
    parser = 'vue'
  } else if (file.filename.endsWith('.js')) {
    parser = 'babel'
  } else if (file.filename.endsWith('.ts')) {
    parser = 'typescript'
  } else if (file.filename.endsWith('.json')) {
    parser = 'json'
  } else {
    return
  }
  file.code = format(file.code, {
    parser,
    plugins: [parserHtml, parserTypeScript, parserBabel, parserPostcss],
    semi: false,
    singleQuote: true,
  })
}

useDark()

// persist state
watchEffect(() => history.replaceState({}, '', `#${store.serialize()}`))
</script>

<template>
  <div class="comp-lib-play">
    <Header :store="store" />
    <Repl
      v-if="!loading"
      ref="repl"
      :store="store"
      auto-resize
      :sfc-options="sfcOptions"
      :clear-console="false"
      :show-import-map="store.userOptions.value.showHidden || false"
      @keydown="handleKeydown"
      @unocss-inject="generate"
    />
    <div
      v-if="loading"
      class="loading-wrapper"
      flex
      items-center
      justify-center
      flex-col
    >
      <o-icon w-6 h-6 name="i-carbon-circle-dash" />
      <p text-lg>loading the playground...... 🤣</p>
    </div>
  </div>
</template>

<style>
body {
  font-size: 13px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  margin: 0;
  --base: #444;
  --nav-height: 52px;
  --color-file-active: #06b6d4;
}

.comp-lib-play .file.active,
.comp-lib-play button.active {
  color: var(--color-file-active);
  border-bottom: 3px solid var(--color-file-active);
  cursor: text;
}

.vue-repl {
  height: calc(100vh - var(--nav-height) - 1px);
}

/*loading*/
.loading-wrapper {
  width: 100%;
  min-height: calc(100vh - var(--nav-height) - 1px);
}

.loading-wrapper > .i-carbon-circle-dash {
  width: 3rem;
  height: 3rem;
  animation: loadingCircle 1s infinite linear;
}
@keyframes loadingCircle {
  to {
    transform: rotate(360deg);
  }
}
</style>
