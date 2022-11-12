import { computed, ref, shallowRef } from 'vue'
import { atou, utoa } from '@/utils/encode'
import { genCDNLink, genImportMap } from '@/utils/dependency'
import { type ImportMap, mergeImportMap } from '@/utils/import-map'
import {
  APP_FILE,
  IMPORT_MAP,
  IS_DEV,
  LIB_INSTALL,
  MAIN_FILE,
  USER_IMPORT_MAP,
} from '@/constants'
import { setVersion, setVueVersion } from '@/utils/versions'
import playConfig from '../../playground.config'
import {
  File,
  type Store,
  type StoreState,
  compileFile,
  // @ts-ignore
} from '../../vue-repl/vue-repl.js'
import mainCode from '../template/main.vue?raw'
import welcomeCode from '../template/welcome.vue?raw'
import libInstallCode from '../template/lib-install.js?raw'

export interface Initial {
  serializedState?: string
  versions?: Versions
  userOptions?: UserOptions
}
export type VersionKey = 'vue' | typeof playConfig.compLibShort
export type Versions = Record<VersionKey, string>
export interface UserOptions {
  styleSource?: string
  showHidden?: boolean
}
export type SerializeState = Record<string, string> & {
  _o?: UserOptions
}

export const useStore = (initial: Initial) => {
  const versions = reactive(
    initial.versions || { vue: 'latest', [playConfig.compLibShort]: 'latest' }
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

  const builtImportMap = computed<ImportMap>(() => genImportMap(versions))
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
    mergeImportMap(builtImportMap.value, userImportMap.value)
  )

  const store = reactive({
    state,
    compiler,
    setActive,
    addFile,
    init,
    deleteFile,
    getImportMap,
    initialShowOutput: false,
    initialOutputMode: 'preview',
  }) as Store

  watch(
    () => importMap.value,
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
    () => versions[playConfig.compLibShort],
    (version) => {
      const file = new File(
        LIB_INSTALL,
        generateLibInstallCode(version, userOptions.value.styleSource).trim(),
        hideFile
      )
      state.files[LIB_INSTALL] = file
      compileFile(store, file)
    },
    { immediate: true }
  )

  function generateLibInstallCode(version: string, styleSource?: string) {
    // 组件库样式文件
    const style = styleSource
      ? styleSource.replace('#VERSION#', version)
      : genCDNLink(
          playConfig.compLibName,
          version,
          playConfig.coreDeps[playConfig.compLibName].cssPath,
          playConfig.cdnUrl.skypack
        )
    return libInstallCode.replace('#STYLE#', style)
  }

  async function init() {
    await setVueVersion(versions.vue, compiler, state, versions)
    watchEffect(() => compileFile(store, state.activeFile))
    Object.keys(state.files).forEach((file) => {
      compileFile(store, state.files[file])
    })
  }

  function serialize() {
    const state: SerializeState = { ...getFiles() }
    state._o = userOptions.value
    return utoa(JSON.stringify(state))
  }

  function deserialize(text: string): SerializeState {
    return JSON.parse(atou(text))
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

  function getFiles() {
    const exported: Record<string, string> = {}
    for (const file of Object.values(state.files)) {
      const fileInfo = file as {
        filename: string
        hidden: boolean
        code: string
      }
      if (fileInfo.hidden) continue
      exported[fileInfo.filename] = fileInfo.code
    }
    return exported
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
    if (filename === LIB_INSTALL) {
      return
    }
    if (confirm(`Are you sure you want to delete ${filename}?`)) {
      if (state.activeFile.filename === filename) {
        setActive(APP_FILE)
      }
      delete state.files[filename]
    }
  }

  function setActive(filename: string) {
    const file = state.files[filename]
    if (file.hidden) return
    state.activeFile = state.files[filename]
  }

  function getImportMap() {
    return importMap.value
  }

  return {
    ...store,
    versions,
    userOptions,
    init,
    serialize,
    setVersion,
    compiler,
    state,
  }
}

export type ReplStore = ReturnType<typeof useStore>
