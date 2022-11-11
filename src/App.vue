<script setup lang="ts">
// TODO：暂时强制修改一下 message样式
import { OMessage as message } from 'onu-ui'
import Header from '@/components/Header.vue'
import { type UserOptions, type Versions, useStore } from '@/composables/store'
import { generate } from '@/utils/uno'
import { Repl } from '../vue-repl/vue-repl.js'
import type { BuiltInParserName } from 'prettier'
import type { Fn } from '@vueuse/core'
import type { OMessageProps } from 'onu-ui'
let loading = ref(true)

// enable experimental features
const sfcOptions: any = {
  script: {
    reactivityTransform: true,
  },
}

const initialUserOptions: UserOptions = {}

const params = new URLSearchParams(location.search)

const initialVersions: Versions = {
  onu: params.get('onu') || 'latest',
  vue: params.get('vue') || 'latest',
}

const store = useStore({
  serializedState: location.hash.slice(1),
  userOptions: initialUserOptions,
  versions: initialVersions,
})

const tipMsg = () => {
  message.info({
    content: 'please wait patiently',
    type: 'info',
  } as OMessageProps)
}

store.init().then(() => {
  loading.value = false
  tipMsg()
})

// eslint-disable-next-line no-console
console.log('Store:', store)

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
    message.info({
      content: 'Loading Prettier...',
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
  <div class="onu-play">
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
      @unocssInject="generate"
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

.onu-play .file.active,
.onu-play button.active {
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
/*uno messsage*/
#message_1 {
  color: #444444;
  background-color: #dedfe0;
  height: 30px;
}
#message_1 .o-icon-base {
  color: #444444 !important;
}

/*uno messsage*/
#message_2 {
  color: #ffffff;
  background-color: #34d399;
  height: 30px;
}
#message_2 .o-icon-base {
  color: #ffffff !important;
}
</style>
