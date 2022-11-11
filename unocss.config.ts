import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import { presetOnu } from 'onu-ui'

export default defineConfig({
  presets: [
    presetUno({
      attributifyPseudo: true,
    }),
    presetAttributify(),
    presetIcons(),
    presetTypography(),
    presetOnu(),
  ],
  transformers: [transformerVariantGroup(), transformerDirectives()],
})
