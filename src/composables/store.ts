// @ts-ignore
import { computed, ref, shallowRef } from 'vue'
import { atou, utoa } from '@/utils/encode'
import { genImportMap, genVueLink, getSkyPack } from '@/utils/dependency'
import { type ImportMap, mergeImportMap } from '@/utils/import-map'
import { IS_DEV } from '@/constants'
// @ts-ignore
import {
  File,
  type Store,
  type StoreState,
  compileFile,
} from '../../vue-repl/vue-repl.js'
import mainCode from '../template/main.vue?raw'
import welcomeCode from '../template/welcome.vue?raw'
import onuInstallCode from '../template/onu-install.js?raw'

export interface Initial {
  serializedState?: string
  versions?: Versions
  userOptions?: UserOptions
}
export type VersionKey = 'vue' | 'onu'
export type Versions = Record<VersionKey, string>
export interface UserOptions {
  styleSource?: string
  showHidden?: boolean
}
export type SerializeState = Record<string, string> & {
  _o?: UserOptions
}

const MAIN_FILE = 'PlaygroundMain.vue'
const APP_FILE = 'App.vue'
const ONU_INSTALL = 'onu-install.js'
const IMPORT_MAP = 'import-map.json'
export const USER_IMPORT_MAP = 'import_map.json'

export const useStore = (initial: Initial) => {
  const versions = reactive(
    initial.versions || { vue: 'latest', onu: 'latest' }
  )

  const compiler = shallowRef<typeof import('vue/compiler-sfc')>()
  const userOptions = ref<UserOptions>(initial.userOptions || {})
  const hideFile = computed(() => !IS_DEV && !userOptions.value.showHidden)

  const files = initFiles(initial.serializedState || '')
  const state = reactive({
    mainFile: MAIN_FILE,
    files,
    activeFile: files[APP_FILE],
    errors: [],
    vueRuntimeURL: '',
    vueServerRendererURL: '',
  })

  const bultinImportMap = computed<ImportMap>(() => genImportMap(versions))
  const userImportMap = computed<ImportMap>(() => {
    const code = state.files[USER_IMPORT_MAP]?.code.trim()
    if (!code) return {}
    let map: ImportMap = {}
    try {
      map = JSON.parse(code)
    } catch (err) {
      console.error(err)
    }
    return map
  })
  const importMap = computed<ImportMap>(() =>
    mergeImportMap(bultinImportMap.value, userImportMap.value)
  )

  // eslint-disable-next-line no-console
  console.log('Files:', files, 'Options:', userOptions.value)

  const store = reactive({
    state,
    compiler: compiler,
    setActive,
    addFile,
    init,
    deleteFile,
    getImportMap,
    initialShowOutput: false,
    initialOutputMode: 'preview',
  }) as Store

  watch(
    ()=>importMap.value,
    (content) => {
      state.files[IMPORT_MAP] = new File(
        IMPORT_MAP,
        JSON.stringify(content, undefined, 2),
        hideFile
      )
    },
    { immediate: true, deep: true }
  )

  watch(
    () => versions.onu,
    (version) => {
      const file = new File(
        ONU_INSTALL,
        generateOnuInstallCode(version, userOptions.value.styleSource).trim(),
        hideFile
      )
      state.files[ONU_INSTALL] = file
      compileFile(store, file)
    },
    { immediate: true }
  )

  function generateOnuInstallCode(version: string, styleSource?: string) {
    // 组件库样式文件
    const style = styleSource
      ? styleSource.replace('#VERSION#', version)
      : getSkyPack('onu-ui', version, '/dist/style.css')
    return onuInstallCode.replace('#STYLE#', style)
  }

  async function setVueVersion(version: string) {
    const { compilerSfc, runtimeDom } = genVueLink(version)

    compiler.value = await import(/* @vite-ignore */ compilerSfc)
    state.vueRuntimeURL = runtimeDom
    versions.vue = version

    // eslint-disable-next-line no-console
    console.info(`[@vue/repl] Now using Vue version: ${version}`)
  }

  async function init() {
    await setVueVersion(versions.vue)
    watchEffect(() => compileFile(store, state.activeFile))

    // eslint-disable-next-line no-restricted-syntax
    for (const file in state.files) {
      compileFile(store, state.files[file])
    }
  }

  function getFiles() {
    const exported: Record<string, string> = {}
    for (const file of Object.values(state.files)) {
      if (file.hidden) continue
      exported[file.filename] = file.code
    }
    return exported
  }

  function serialize() {
    const state: SerializeState = { ...getFiles() }
    state._o = userOptions.value
    return utoa(JSON.stringify(state))
  }
  function deserialize(text: string): SerializeState {
    const state = JSON.parse(atou(text))
    return state
  }

  function initFiles(serializedState: string) {
    const files: StoreState['files'] = {}
    if (serializedState) {
      const saved = deserialize(serializedState)
      for (const [filename, file] of Object.entries(saved)) {
        if (filename === '_o') continue
        files[filename] = new File(filename, file as string)
      }
      userOptions.value = saved._o || {}
    } else {
      files[APP_FILE] = new File(APP_FILE, welcomeCode)
    }
    files[MAIN_FILE] = new File(MAIN_FILE, mainCode, hideFile)
    if (!files[USER_IMPORT_MAP]) {
      files[USER_IMPORT_MAP] = new File(
        USER_IMPORT_MAP,
        JSON.stringify({ imports: {} }, undefined, 2)
      )
    }
    return files
  }

  function setActive(filename: string) {
    const file = state.files[filename]
    if (file.hidden) return
    state.activeFile = state.files[filename]
  }

  function addFile(fileOrFilename: string | File) {
    const file =
      typeof fileOrFilename === 'string'
        ? new File(fileOrFilename)
        : fileOrFilename
    state.files[file.filename] = file
    setActive(file.filename)
  }

  function deleteFile(filename: string) {
    if (filename === ONU_INSTALL) {
      // Message.warning('You cannot remove it, because Onu Vue requires it.')
      return
    }
    if (confirm(`Are you sure you want to delete ${filename}?`)) {
      if (state.activeFile.filename === filename) {
        setActive(APP_FILE)
      }
      delete state.files[filename]
    }
  }

  function getImportMap() {
    return importMap.value
  }

  async function setVersion(key: VersionKey, version: string) {
    switch (key) {
      case 'onu':
        setOnuVueVersion(version)
        break
      case 'vue':
        await setVueVersion(version)
        break
    }
  }

  function setOnuVueVersion(version: string) {
    versions.onu = version
  }

  return {
    ...store,

    versions,
    userOptions: userOptions,

    init,
    serialize,
    setVersion,
  }
}

export type ReplStore = ReturnType<typeof useStore>
