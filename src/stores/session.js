import { defineStore } from 'pinia'
import { isTokenExpired, parseJwt } from '@/logic/tokenUtils'

const STORAGE_KEY = 'bio-nexus.session'

function emptySession() {
  return { token: '', user: null, signedInAt: '', renewedAt: '' }
}

function normalizeUser(response) {
  const user = response.user || {}
  return {
    id: user.id ?? null,
    name: user.name ?? '',
    roles: user.roles ?? '',
    college: user.college_number ?? '',
    position: user.position ?? '',
    photo: response.url_photo === 'undefined' || response.url_photo === null ? '' : response.url_photo ?? user.photo ?? '',
    telephone: user.telephone ?? '',
    email: user.email ?? ''
  }
}

export const useSessionStore = defineStore('session', {
  state: () => emptySession(),
  getters: {
    isAuthenticated: (state) => state.token !== '' && !isTokenExpired(state.token),
    userId: (state) => state.user?.id ?? null,
    userName: (state) => state.user?.name ?? '',
    expiresAt: (state) => {
      const payload = parseJwt(state.token)
      return typeof payload?.exp === 'number' ? payload.exp * 1000 : 0
    }
  },
  actions: {
    hydrate() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (!stored) return
        const session = JSON.parse(stored)
        if (!session.token || isTokenExpired(session.token)) { this.clear(); return }
        this.token = session.token
        this.user = session.user ?? null
        this.signedInAt = session.signedInAt ?? ''
        this.renewedAt = session.renewedAt ?? this.signedInAt
      } catch { this.clear() }
    },
    start(response) {
      if (!response?.token || !response?.user) throw new Error('La respuesta de autenticacion es invalida.')
      this.token = response.token
      this.user = normalizeUser(response)
      this.signedInAt = new Date().toISOString()
      this.renewedAt = this.signedInAt
      this.persist()
    },
    applyRenewal(response) {
      if (!response?.token) throw new Error('La respuesta de renovacion es invalida.')
      this.token = response.token
      if (response.user) this.user = normalizeUser(response)
      this.renewedAt = new Date().toISOString()
      this.persist()
    },
    persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: this.token, user: this.user, signedInAt: this.signedInAt, renewedAt: this.renewedAt }))
    },
    clear() {
      this.$reset()
      localStorage.removeItem(STORAGE_KEY)
    }
  }
})
