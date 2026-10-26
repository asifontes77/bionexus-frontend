import { defineStore } from 'pinia'
import { isTokenExpired } from '@/logic/tokenUtils'

const STORAGE_KEY = 'bio-nexus.admin-session'
const empty = () => ({ token: '', user: null, identityType: '' })

export const useAdminSessionStore = defineStore('admin-session', {
  state: empty,
  getters: {
    isAuthenticated: (state) => state.token !== '' && state.identityType === 'platform-owner' && !isTokenExpired(state.token),
  },
  actions: {
    hydrate() {
      try {
        const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
        if (!value.token || value.identityType !== 'platform-owner' || isTokenExpired(value.token)) return this.clear()
        this.token = value.token
        this.user = value.user || null
        this.identityType = value.identityType
      } catch { this.clear() }
    },
    start(response) {
      if (!response?.token || response?.identityType !== 'platform-owner') throw new Error('ADMIN_IDENTITY_REQUIRED')
      this.token = response.token
      this.user = response.user || null
      this.identityType = response.identityType
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: this.token, user: this.user, identityType: this.identityType }))
    },
    clear() {
      this.$reset()
      localStorage.removeItem(STORAGE_KEY)
    },
  },
})
