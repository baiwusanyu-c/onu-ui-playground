import { createGenerator } from 'unocss'
import { evaluateUserConfig } from './config'
import defaultConfigRaw from './defaultConfig.ts?raw'
import type { GenerateResult, UserConfig } from 'unocss'

const defaultConfig = ref<UserConfig | undefined>()

async function load() {
  try {
    defaultConfig.value = await evaluateUserConfig(defaultConfigRaw)
  } catch (e) {
    console.error(e)
  }
}
await load()
const uno = createGenerator({}, defaultConfig.value)
const output = shallowRef<GenerateResult>()
const init = ref(false)

export async function generate() {
  output.value = await uno.generate('<div class="h-5"></div>')
  console.log(output.value.css)
  init.value = true
}
