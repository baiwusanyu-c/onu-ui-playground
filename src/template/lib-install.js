import { getCurrentInstance } from 'vue'
import UnoUI from 'onu-ui'
let installed = false
await loadStyle()

export function libInstall() {
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
