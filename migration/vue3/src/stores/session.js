import { defineStore } from 'pinia'
import { isTokenExpired } from '@/logic/tokenUtils'

const STORAGE_KEY = 'bio-nexus.session'

function emptySession() {
  return {
    token: '',
    user: null,
    signedInAt: ''
  }
}

function normalizeUser(response) {
  const user = response.user || {}

  return {
    id: user.id ?? null,
    name: user.name ?? '',
    roles: user.roles ?? '',
    college: user.college_number ?? '',
    position: user.position ?? '',
    photo:
      response.url_photo === 'undefined' || response.url_photo === null
        ? ''
        : response.url_photo ?? user.photo ?? '',
    telephone: user.telephone ?? '',
    email: user.email ?? ''
  }
}

export const useSessionStore = defineStore('session', {
  state: () => emptySession(),

  getters: {
    isAuthenticated: (state) =>
      state.token !== '' && !isTokenExpired(state.token),

    userId: (state) => state.user?.id ?? null,

    userName: (state) => state.user?.name ?? ''
  },

  actions: {
    hydrate() {
      try {
        const storedSession = localStorage.getItem(STORAGE_KEY)

        if (!storedSession) return

        const session = JSON.parse(storedSession)

        if (!session.token || isTokenExpired(session.token)) {
          this.clear()
          return
        }

        this.token = session.token
        this.user = session.user ?? null
        this.signedInAt = session.signedInAt ?? ''
      } catch {
        this.clear()
      }
    },

    start(response) {
      if (!response?.token || !response?.user) {
        throw new Error('La respuesta de autenticacion es invalida.')
      }

      this.token = response.token
      this.user = normalizeUser(response)
      this.signedInAt = new Date().toISOString()
      this.persist()
    },

    persist() {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          token: this.token,
          user: this.user,
          signedInAt: this.signedInAt
        })
      )
    },

    clear() {
      this.$reset()
      localStorage.removeItem(STORAGE_KEY)
    }
  }
})
