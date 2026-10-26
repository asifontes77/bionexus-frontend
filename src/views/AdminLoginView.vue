<template>
  <main class="admin-login-page">
    <section class="admin-login-card" aria-labelledby="admin-login-title">
      <div class="admin-login-brand">
        <img class="admin-login-logo" :src="bioNexusLogo" :alt="BIO_NEXUS_BRAND.logoAlt" />
        <span class="admin-login-badge">Acceso exclusivo del propietario</span>
        <p class="admin-login-eyebrow">Administración central de Bio Nexus</p>
        <h1 id="admin-login-title">Acceso del propietario</h1>
        <p class="admin-login-description">
          Gestione laboratorios, sucursales y configuraciones globales de la plataforma.
        </p>
      </div>

      <form class="admin-login-form" novalidate @submit.prevent="submit">
        <div v-if="message" class="bio-nexus-message bio-nexus-message-error admin-login-error" role="alert">
          {{ message }}
        </div>

        <BioNexusFormField
          label="Nombre de usuario"
          field-id="admin-username"
          :error="errors.username"
          :help="`${username.length} de 100 caracteres`"
          required
        >
          <input
            id="admin-username"
            ref="usernameInput"
            v-model.trim="username"
            class="bio-nexus-field"
            name="username"
            type="text"
            maxlength="100"
            autocomplete="username"
            :aria-invalid="Boolean(errors.username)"
            :aria-describedby="errors.username ? 'admin-username-error' : 'admin-username-help'"
            :disabled="loading"
            @input="delete errors.username"
            @keydown.space.prevent
          />
        </BioNexusFormField>

        <BioNexusFormField
          label="Contraseña"
          field-id="admin-password"
          :error="errors.password"
          required
        >
          <input
            id="admin-password"
            v-model="password"
            class="bio-nexus-field"
            name="password"
            type="password"
            maxlength="200"
            autocomplete="current-password"
            :aria-invalid="Boolean(errors.password)"
            :aria-describedby="errors.password ? 'admin-password-error' : undefined"
            :disabled="loading"
            @input="delete errors.password"
          />
        </BioNexusFormField>

        <BioNexusActionButton
          type="submit"
          variant="primary"
          :loading="loading"
          :disabled="loading"
          block
        >
          Ingresar como propietario
        </BioNexusActionButton>
      </form>
    </section>
  </main>
</template>

<script setup>
import { nextTick, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import BioNexusActionButton from '@/components/ui/BioNexusActionButton.vue'
import BioNexusFormField from '@/components/ui/BioNexusFormField.vue'
import bioNexusLogo from '@/assets/bionexus_logo.png'
import { BIO_NEXUS_BRAND } from '@/config/brand'
import { loginPlatformOwner } from '@/services/adminAuthService'
import { useAdminSessionStore } from '@/stores/adminSession'

const router = useRouter()
const session = useAdminSessionStore()
const username = ref('')
const password = ref('')
const loading = ref(false)
const message = ref('')
const errors = reactive({})
const usernameInput = ref(null)

async function submit() {
  delete errors.username; delete errors.password
  if (!username.value) errors.username = 'El nombre de usuario es obligatorio.'
  if (!password.value) errors.password = 'La contraseña es obligatoria.'
  if (errors.username || errors.password || loading.value) return
  loading.value = true; message.value = ''
  try {
    const response = await loginPlatformOwner(username.value.toLowerCase(), password.value)
    session.start(response)
    await router.replace({ name: 'admin-laboratories' })
  } catch {
    password.value = ''
    session.clear()
    message.value = 'Nombre de usuario o contraseña incorrectos.'
  } finally { loading.value = false }
}
onMounted(async () => { session.hydrate(); await nextTick(); usernameInput.value?.focus() })
</script>

<style scoped>
.admin-login-page {
  position: relative;
  isolation: isolate;
  display: grid;
  box-sizing: border-box;
  min-height: 100vh;
  min-height: 100dvh;
  place-items: center;
  padding: 16px;
  overflow: hidden;
  background:
    radial-gradient(circle at 14% 12%, rgb(212 228 242 / 76%) 0, transparent 34%),
    linear-gradient(135deg, #f8fafc 0%, #eef4f8 100%);
}
.admin-login-page::before {
  position: fixed;
  z-index: -1;
  inset: 0;
  background-image: url("../assets/bionexus_logo-only.png");
  background-repeat: repeat-x;
  background-position: left 50%;
  background-size: 310px auto;
  content: "";
  filter: grayscale(1);
  opacity: 0.045;
  pointer-events: none;
}
.admin-login-card {
  position: relative;
  display: grid;
  box-sizing: border-box;
  width: min(440px, 100%);
  max-height: calc(100dvh - 32px);
  gap: 16px;
  padding: 22px 28px 24px;
  overflow-x: hidden;
  overflow-y: auto;
  border: 1px solid rgb(18 61 97 / 16%);
  border-radius: var(--bio-nexus-radius-xl);
  background: var(--bio-nexus-color-surface);
  box-shadow: 0 18px 55px rgb(21 55 87 / 16%);
  scrollbar-width: thin;
}
.admin-login-card::before {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--bio-nexus-color-primary), var(--bio-nexus-color-accent));
  content: "";
}
.admin-login-brand {
  display: grid;
  justify-items: center;
  text-align: center;
}
.admin-login-logo {
  width: min(252px, 76%);
  max-height: 126px;
  object-fit: contain;
}
.admin-login-badge {
  margin: 2px 0 10px;
  padding: 6px 12px;
  border: 1px solid var(--bio-nexus-color-accent-border);
  border-radius: 999px;
  color: var(--bio-nexus-color-accent-strong);
  background: var(--bio-nexus-color-accent-soft);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.admin-login-eyebrow,
.admin-login-description,
.admin-login-card h1 {
  margin: 0;
  text-align: center;
}
.admin-login-eyebrow {
  color: var(--bio-nexus-color-primary);
  font-size: 13px;
  font-weight: 700;
}
.admin-login-card h1 {
  margin-top: 4px;
  font-size: 30px;
  line-height: 1.15;
}
.admin-login-description {
  margin-top: 6px;
  color: var(--bio-nexus-color-text-muted-strong);
  font-size: 14px;
  line-height: 1.45;
}
.admin-login-form {
  display: grid;
  gap: 16px;
}
.admin-login-error { margin: 0; }
@media (min-width: 1500px) {
  .admin-login-page::before { background-size: 340px auto; }
}
@media (max-width: 900px) {
  .admin-login-page::before {
    background-position: left 48%;
    background-size: 250px auto;
    opacity: 0.035;
  }
}
@media (max-width: 620px) {
  .admin-login-page {
    min-height: 100dvh;
    height: auto;
    padding: 10px;
    overflow-y: auto;
  }
  .admin-login-page::before {
    background-repeat: repeat-y;
    background-position: 50% top;
    background-size: min(74vw, 300px) auto;
    opacity: 0.03;
  }
  .admin-login-card {
    max-height: none;
    padding: 18px 20px 20px;
  }
  .admin-login-logo {
    width: min(230px, 82%);
    max-height: 110px;
  }
  .admin-login-card h1 { font-size: 27px; }
}
</style>
