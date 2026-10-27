import { defineStore } from 'pinia'
import { isTokenExpired, parseJwt } from '@/logic/tokenUtils'
import { renewPlatformOwnerSession } from '@/services/adminAuthService'

const STORAGE_KEY = 'bio-nexus.admin-session'
const empty = () => ({ token: '', user: null, identityType: '', signedInAt: '', renewedAt: '' })

export const useAdminSessionStore = defineStore('admin-session', {
  state: empty,
  getters: {
    isAuthenticated: (state) =>
      state.token !== '' && state.identityType === 'platform-owner' && !isTokenExpired(state.token),
    expiresAt: (state) => {
      const payload = parseJwt(state.token)
      return typeof payload?.exp === 'number' ? payload.exp * 1000 : 0
    }
  },
  actions: {
    hydrate() {
      try {
        const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
        if (!value.token || value.identityType !== 'platform-owner' || isTokenExpired(value.token)) {
          this.clear()
          return
        }
        this.token = value.token
        this.user = value.user || null
        this.identityType = value.identityType
        this.signedInAt = value.signedInAt || ''
        this.renewedAt = value.renewedAt || this.signedInAt
      } catch {
        this.clear()
      }
    },
    start(response) {
      if (!response?.token || response?.identityType !== 'platform-owner') {
        throw new Error('ADMIN_IDENTITY_REQUIRED')
      }
      this.token = response.token
      this.user = response.user || null
      this.identityType = response.identityType
      this.signedInAt = new Date().toISOString()
      this.renewedAt = this.signedInAt
      this.persist()
    },
    applyRenewal(response) {
      if (!response?.token || response?.identityType !== 'platform-owner') {
        throw new Error('ADMIN_RENEWAL_INVALID')
      }
      this.token = response.token
      this.user = response.user || this.user
      this.identityType = response.identityType
      this.renewedAt = new Date().toISOString()
      this.persist()
    },
    async renew() {
      const response = await renewPlatformOwnerSession()
      this.applyRenewal(response)
      return response
    },
    persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        token: this.token,
        user: this.user,
        identityType: this.identityType,
        signedInAt: this.signedInAt,
        renewedAt: this.renewedAt
      }))
    },
    clear() {
      this.$reset()
      localStorage.removeItem(STORAGE_KEY)
    }
  }
})
