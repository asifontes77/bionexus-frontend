<template>
  <main class="login-page">
    <section class="login-card" aria-labelledby="login-title">
      <div class="login-brand">
        <p class="migration-eyebrow">TORO</p>
        <h1 id="login-title">Iniciar sesion</h1>
        <p>Ingrese sus credenciales para continuar.</p>
      </div>

      <form class="login-form" @submit.prevent="submit">
        <label for="username">Nombre de usuario</label>
        <input
          id="username"
          v-model.trim="username"
          name="username"
          type="text"
          autocomplete="username"
          required
          :disabled="loading"
          @keydown.space.prevent
        >

        <label for="password">Contrasena</label>
        <input
          id="password"
          v-model="password"
          name="password"
          type="password"
          autocomplete="current-password"
          required
          :disabled="loading"
        >

        <p v-if="message" class="login-message" role="alert">
          {{ message }}
        </p>

        <button type="submit" :disabled="loading || !canSubmit">
          {{ loading ? 'Iniciando...' : 'Iniciar sesion' }}
        </button>
      </form>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiError } from '@/api/apiClient'
import { loginUser } from '@/services/authService'
import { useSessionStore } from '@/stores/session'

const route = useRoute()
const router = useRouter()
const sessionStore = useSessionStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const message = ref('')

const canSubmit = computed(() =>
  username.value !== '' && password.value !== ''
)

async function submit() {
  if (!canSubmit.value || loading.value) return

  loading.value = true
  message.value = ''

  try {
    const response = await loginUser(
      username.value.toLowerCase(),
      password.value
    )

    if (response?.response === 'INVALID_LICENSE_KEY') {
      message.value = 'La licencia del sistema no es valida.'
      return
    }

    sessionStore.start(response)

    const redirect =
      typeof route.query.redirect === 'string'
        ? route.query.redirect
        : '/'

    await router.replace(redirect)
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      message.value = 'Nombre de usuario o contrasena incorrectos.'
    } else {
      message.value = 'No fue posible iniciar sesion.'
    }
  } finally {
    loading.value = false
  }
}
</script>
