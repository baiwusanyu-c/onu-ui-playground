<script setup lang="ts">
// TODO：
import { OMessage as message } from 'onu-ui'
import {
  getSupportedOnuVersions,
  getSupportedVueVersions,
} from '../utils/dependency'
import LogoUno from '../assets/logo.svg'
import type { ComputedRef } from 'vue'
import type { ReplStore, VersionKey } from '@/composables/store'
import type { OMessageProps } from 'onu-ui'

const { store } = defineProps<{
  store: ReplStore
}>()

interface Version {
  text: string
  published: ComputedRef<string[]>
  active: string
}

const appDark = useDark({
  selector: 'body',
  attribute: 'arco-theme',
  valueDark: 'dark',
  valueLight: 'light',
  storageKey: 'arco-theme',
})
const replDark = useDark()
const toggleAppTheme = useToggle(appDark)
const toggleReplTheme = useToggle(replDark)

const toggleTheme = () => {
  toggleAppTheme()
  toggleReplTheme()
}

const logoSVG = computed(() => {
  return LogoUno
})

const versions = reactive<Record<VersionKey, Version>>({
  onu: {
    text: 'Onu UI',
    published: getSupportedOnuVersions(),
    active: store.versions.onu,
  },
  vue: {
    text: 'Vue',
    published: getSupportedVueVersions(),
    active: store.versions.vue,
  },
})

async function setVersion(key: VersionKey, v: any) {
  versions[key].active = `loading...`
  await store.setVersion(key, v)
  versions[key].active = v
}

async function copyLink() {
  const loc = document.location
  const link = `${loc.origin}?onu=${store.versions.onu}&vue=${store.versions.vue}${loc.hash}`
  await navigator.clipboard.writeText(link)

  message.success({
    content: 'Sharable URL has been copied to clipboard.',
  } as OMessageProps)
}
</script>

<template>
  <nav class="header-nav" border-b-cyan-500 border-b shadow>
    <div class="left" flex items-center m-2>
      <img class="logo" alt="logo" :src="logoSVG" h-30px />
      <span text-lg font-bold>Onu-UI</span>
      <div ml-12px class="title">Playground</div>
    </div>

    <div flex items-center m-2>
      <div v-for="(v, key) of versions" :key="key" flex items-center>
        <span class="label">{{ v.text }} Version:</span>
        <o-popup
          position="bottom"
          :content-style="{ paddingLeft: 0, paddingRight: 0 }"
        >
          <div
            mx-12px
            px-12px
            text-lg
            cursor-pointer
            text-stone-600
            flex
            items-center
          >
            <span>{{ v.active }}</span>
            <o-icon name="i-carbon-chevron-down" ml-2 />
          </div>
          <template #content>
            <div h-50 class="version-content">
              <p
                v-for="ver of v.published"
                :key="ver"
                cursor-pointer
                px="4"
                h-30px
                leading-loose
                hover="bg-bluegray-100"
                @click="setVersion(key, ver)"
              >
                {{ ver }}
              </p>
            </div>
          </template>
        </o-popup>
      </div>

      <a href="https://staging-cn.vuejs.org/" target="_blank" class="header-a">
        <o-icon class="header-icon" name="i-logos:vue" />
      </a>

      <a href="https://github.com/unocss/unocss" target="_blank" class="header-a">
        <o-icon class="header-icon" name="i-logos:unocss" />
      </a>

      <a href="https://onu.zyob.top/" target="_blank" class="header-a">
        <img class="logo header-icon" alt="logo" :src="logoSVG" h-30px />
      </a>

      <a href="https://github.com/onu-ui/onu-ui" target="_blank" class="header-a">
        <o-icon class="header-icon" o="info" name="i-carbon-logo-github" />
      </a>

      <a @click.prevent="toggleTheme()" class="header-a">
        <o-icon
          v-if="appDark"
          class="header-icon"
          o="info"
          name="i-carbon-moon"
        />
        <o-icon v-else class="header-icon" o="info" name="i-carbon-sun" />
      </a>

      <a @click.prevent="copyLink" class="header-a">
        <o-icon class="header-icon" o="info" name="i-carbon-share" />
      </a>
    </div>
  </nav>
</template>

<style scoped>
.version-content {
  overflow-y: auto;
  width: 200px;
}
.header-nav {
  position: relative;
  z-index: 999;
  display: flex;
  justify-content: space-between;
  height: var(--nav-height);
  padding-left: 10px;
  padding-right: 10px;
}

.header-nav .logo {
  margin: 0 12px;
}

.header-icon {
  width: 20px;
  height: 20px;
  margin: 0 12px;
}

@media (max-width: 720px) {
  .header-nav {
    height: auto;
    flex-wrap: wrap;
    justify-content: center;
  }
  .header-a {
    display: none;
  }
  .logo {
    margin: 12px 0;
  }
}
</style>
