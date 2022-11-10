import { getCurrentInstance } from 'vue'
import UnoUI from 'onu-ui'
let installed = false
await loadStyle()
await loadUncssRuntime()
await loadUncssIconPreset()
export function onuInstall() {
  if (installed) return
  const instance = getCurrentInstance()
  // 安装组件库到vue
  instance.appContext.app.use(UnoUI)
  installed = true
}

export function loadStyle() {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = '#STYLE#'
    link.addEventListener('load', resolve)
    link.addEventListener('error', reject)
    document.body.append(link)
  })
}

export function loadUncssRuntime() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@unocss/runtime/full.global.js'
    script.addEventListener('load', resolve)
    script.addEventListener('error', reject)
    document.body.append(script)
  })
}

export function loadUncssIconPreset() {
  /*window.__unocss = {
    presets: [
      presetIcons({
        cdn: 'https://esm.sh/'
      })
    ],
  }*/
}
