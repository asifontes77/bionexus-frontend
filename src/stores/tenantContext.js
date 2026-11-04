import { defineStore } from 'pinia'
import { getTenantContext } from '@/services/authService'
import { normalizeAccessSlug } from '@/logic/tenantAccess'

const STORAGE_KEY = 'bio-nexus.tenant-context'

function emptyContext() {
  return { accessSlug: '', laboratoryName: '', loading: false, error: '', loadedSlug: '' }
}

export const useTenantContextStore = defineStore('tenant-context', {
  state: emptyContext,
  actions: {
    hydrate() {
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
        this.accessSlug = normalizeAccessSlug(stored.access_slug)
        this.laboratoryName = typeof stored.laboratory_name === 'string' ? stored.laboratory_name : ''
      } catch {
        this.clear()
      }
    },
    async load(accessSlug) {
      const slug = normalizeAccessSlug(accessSlug)
      if (!slug) throw new Error('TENANT_CONTEXT_UNAVAILABLE')
      if (this.loadedSlug === slug) return this

      this.loading = true
      this.error = ''
      try {
        const context = await getTenantContext(slug)
        const responseSlug = normalizeAccessSlug(context?.access_slug)
        const laboratoryName = typeof context?.laboratory_name === 'string' ? context.laboratory_name.trim() : ''
        if (responseSlug !== slug || !laboratoryName) throw new Error('TENANT_CONTEXT_UNAVAILABLE')

        this.accessSlug = slug
        this.laboratoryName = laboratoryName
        this.loadedSlug = slug
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          access_slug: slug,
          laboratory_name: laboratoryName
        }))
        return this
      } catch (error) {
        this.accessSlug = ''
        this.laboratoryName = ''
        this.error = 'TENANT_CONTEXT_UNAVAILABLE'
        this.loadedSlug = ''
        localStorage.removeItem(STORAGE_KEY)
        throw error
      } finally {
        this.loading = false
      }
    },
    clear() {
      this.$reset()
      localStorage.removeItem(STORAGE_KEY)
    }
  }
})
