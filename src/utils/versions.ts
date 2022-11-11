import { compare } from 'compare-versions'
import playConfig from '../../playground.config'
import type { MaybeRef } from '@vueuse/core'
import type { Ref } from 'vue'

export const getVersions = (pkg: MaybeRef<string>) => {
  const url = computed(() => `${playConfig.versionUrl}${unref(pkg)}`)
  return useFetch(url, {
    initialData: [],
    afterFetch: (ctx) => ((ctx.data = ctx.data.versions), ctx),
    refetch: true,
  }).json<string[]>().data as Ref<string[]>
}

export const getSupportVersions = (pkg: string, minVersion: string) => {
  const versions = getVersions(pkg)
  return computed(() => {
    const canUserVersions = versions.value.filter((version) =>
      compare(version, minVersion, '>=')
    )
    if (canUserVersions.length > 0) {
      canUserVersions.unshift('latest')
    }
    return canUserVersions
  })
}
