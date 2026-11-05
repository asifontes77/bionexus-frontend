<template>
  <section class="admin-dashboard" aria-labelledby="admin-dashboard-title">
    <header class="admin-dashboard-intro">
      <p class="admin-dashboard-eyebrow">ADMINISTRACIÓN DE PLATAFORMA</p>
      <h1 id="admin-dashboard-title">Dashboard</h1>
      <p>Un resumen central para administrar Bio Nexus y ampliar sus herramientas.</p>
    </header>

    <p v-if="error" class="admin-dashboard-error" role="alert">{{ error }}</p>

    <div class="admin-dashboard-grid">
      <article class="admin-dashboard-card admin-dashboard-summary">
        <div class="admin-dashboard-card-heading">
          <span class="material-symbols-rounded" aria-hidden="true">domain</span>
          <p>Laboratorios registrados</p>
        </div>
        <strong v-if="loading" class="admin-dashboard-value" role="status">Cargando…</strong>
        <strong v-else-if="!error" class="admin-dashboard-value">{{ laboratoriesCount }}</strong>
        <p class="admin-dashboard-card-description">Laboratorios provisionados en la plataforma.</p>
        <RouterLink class="admin-dashboard-action" :to="{ name: 'admin-laboratories' }">
          Administrar laboratorios
          <span class="material-symbols-rounded" aria-hidden="true">arrow_forward</span>
        </RouterLink>
      </article>

      <article class="admin-dashboard-card admin-dashboard-module">
        <p class="admin-dashboard-module-label">Planes comerciales</p>
        <h2>Planes</h2>
        <p>Configura precios, periodicidad, días de gracia y beneficios disponibles.</p>
        <RouterLink class="admin-dashboard-action" :to="{ name: 'admin-plans' }">
          Administrar planes
          <span class="material-symbols-rounded" aria-hidden="true">arrow_forward</span>
        </RouterLink>
      </article>

      <article class="admin-dashboard-card admin-dashboard-module">
        <p class="admin-dashboard-module-label">Registro manual</p>
        <h2>Pagos</h2>
        <p>Registra pagos por laboratorio y consulta comprobantes privados.</p>
        <RouterLink class="admin-dashboard-action" :to="{ name: 'admin-payments' }">
          Gestionar pagos
          <span class="material-symbols-rounded" aria-hidden="true">arrow_forward</span>
        </RouterLink>
      </article>
    </div>

    <section class="admin-dashboard-foundation" aria-labelledby="admin-dashboard-foundation-title">
      <div>
        <p class="admin-dashboard-eyebrow">ESPACIO MODULAR</p>
        <h2 id="admin-dashboard-foundation-title">Una base para crecer</h2>
      </div>
      <p>Este dashboard está preparado para incorporar nuevas vistas y métricas de administración sin mezclar los catálogos iniciales del laboratorio con sus planes comerciales.</p>
    </section>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { getPlatformLaboratories } from '@/services/platformService'

const laboratories = ref([])
const loading = ref(false)
const error = ref('')
const laboratoriesCount = computed(() => laboratories.value.length.toLocaleString('es'))

async function loadLaboratories() {
  loading.value = true
  error.value = ''
  try {
    const result = await getPlatformLaboratories()
    if (!Array.isArray(result)) {
      throw new Error('El servidor devolvió una lista de laboratorios no válida.')
    }
    laboratories.value = result
  } catch (cause) {
    laboratories.value = []
    error.value = cause?.message || 'No fue posible cargar el resumen de laboratorios.'
  } finally {
    loading.value = false
  }
}

onMounted(loadLaboratories)
</script>

<style scoped>
.admin-dashboard { display: grid; gap: 24px; }
.admin-dashboard-intro { display: grid; gap: 8px; }
.admin-dashboard-eyebrow { margin: 0; color: var(--bio-nexus-color-primary-strong); font-size: 11px; font-weight: 800; letter-spacing: .1em; }
.admin-dashboard-intro h1, .admin-dashboard-foundation h2, .admin-dashboard-module h2 { margin: 0; color: var(--bio-nexus-color-text-primary); }
.admin-dashboard-intro h1 { font-size: clamp(28px, 4vw, 36px); line-height: 1.15; }
.admin-dashboard-intro > p:last-child, .admin-dashboard-foundation > p { max-width: 720px; margin: 0; color: var(--bio-nexus-color-text-muted-strong); line-height: 1.6; }
.admin-dashboard-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.admin-dashboard-card, .admin-dashboard-foundation { min-width: 0; padding: 20px; border: 1px solid var(--bio-nexus-color-border); border-radius: var(--bio-nexus-radius-lg); background: var(--bio-nexus-color-surface); box-shadow: 0 8px 24px rgb(21 55 87 / 5%); }
.admin-dashboard-summary { display: grid; align-content: start; gap: 12px; border-top: 3px solid var(--bio-nexus-color-primary); }
.admin-dashboard-card-heading { display: flex; align-items: center; gap: 9px; color: var(--bio-nexus-color-primary-strong); }
.admin-dashboard-card-heading .material-symbols-rounded { font-size: 22px; }
.admin-dashboard-card-heading p, .admin-dashboard-card-description, .admin-dashboard-module p { margin: 0; }
.admin-dashboard-card-heading p { font-size: 14px; font-weight: 700; }
.admin-dashboard-value { min-height: 46px; color: var(--bio-nexus-color-text-primary); font-size: 36px; line-height: 1.2; }
.admin-dashboard-card-description, .admin-dashboard-module > p:not(.admin-dashboard-module-label) { color: var(--bio-nexus-color-text-muted); font-size: 13px; line-height: 1.5; }
.admin-dashboard-action { display: inline-flex; align-items: center; gap: 5px; width: fit-content; margin-top: 4px; color: var(--bio-nexus-color-primary-strong); font-size: 13px; font-weight: 700; text-decoration: none; }
.admin-dashboard-action:hover { text-decoration: underline; }
.admin-dashboard-action:focus-visible { outline: 2px solid var(--bio-nexus-color-primary); outline-offset: 3px; }
.admin-dashboard-action .material-symbols-rounded { font-size: 18px; }
.admin-dashboard-module { display: flex; flex-direction: column; align-items: flex-start; gap: 10px; }
.admin-dashboard-module-label { color: var(--bio-nexus-color-primary-strong); font-size: 11px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
.admin-dashboard-module h2 { font-size: 20px; }
.admin-dashboard-foundation { display: flex; align-items: center; justify-content: space-between; gap: 24px; }
.admin-dashboard-foundation > div { display: grid; flex: 0 0 auto; gap: 8px; }
.admin-dashboard-foundation h2 { font-size: 19px; }
.admin-dashboard-error { margin: 0; padding: 12px 14px; border-radius: var(--bio-nexus-radius-md); color: var(--bio-nexus-color-danger); background: var(--bio-nexus-color-danger-soft); overflow-wrap: anywhere; }
@media (max-width: 860px) {
  .admin-dashboard-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .admin-dashboard-summary { grid-column: 1 / -1; }
}
@media (max-width: 560px) {
  .admin-dashboard-grid { grid-template-columns: 1fr; }
  .admin-dashboard-summary { grid-column: auto; }
  .admin-dashboard-foundation { align-items: flex-start; flex-direction: column; gap: 12px; }
}
</style>
