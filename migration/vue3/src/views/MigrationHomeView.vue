<template>
  <main class="migration-page">
    <section class="migration-card">
      <div class="migration-toolbar">
        <div>
          <p class="migration-eyebrow">Migracion estructural</p>
          <h1>{{ store.applicationName }} Vue 3</h1>
        </div>
        <button type="button" class="secondary-button" @click="logout">
          Cerrar sesion
        </button>
      </div>

      <p class="session-greeting">
        Sesion activa: <strong>{{ sessionStore.userName || 'Usuario TORO' }}</strong>
      </p>

      <p>
        Shell independiente validando Vue, Vite, Vue Router y Pinia antes de
        migrar los modulos funcionales.
      </p>

      <dl class="migration-grid">
        <div>
          <dt>Origen</dt>
          <dd>{{ store.sourceVersion }}</dd>
        </div>
        <div>
          <dt>Objetivo</dt>
          <dd>{{ store.targetVersion }}</dd>
        </div>
        <div>
          <dt>Fase</dt>
          <dd>{{ store.phase }}</dd>
        </div>
      </dl>
    </section>
  </main>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useMigrationStore } from '@/stores/migration'
import { useSessionStore } from '@/stores/session'

const router = useRouter()
const store = useMigrationStore()
const sessionStore = useSessionStore()

async function logout() {
  sessionStore.clear()
  await router.replace({ name: 'login' })
}
</script>
