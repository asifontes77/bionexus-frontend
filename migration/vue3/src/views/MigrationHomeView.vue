<template>
  <section class="dashboard-page" aria-labelledby="dashboard-title">
    <div class="dashboard-hero">
      <div>
        <p class="dashboard-eyebrow">Migracion estructural</p>
        <h2 id="dashboard-title">
          Bienvenido, {{ sessionStore.userName || 'Usuario TORO' }}
        </h2>
        <p>
          La estructura autenticada principal de TORO ya esta preparada para
          recibir los modulos funcionales migrados desde Vue 2.
        </p>
      </div>

      <div class="dashboard-status">
        <span class="dashboard-status-dot" aria-hidden="true"></span>
        Sesion activa
      </div>
    </div>

    <div class="dashboard-metrics" aria-label="Estado de la migracion">
      <article class="dashboard-metric-card">
        <span class="dashboard-metric-label">Aplicacion</span>
        <strong>{{ migrationStore.applicationName }}</strong>
        <span>Shell autenticado</span>
      </article>

      <article class="dashboard-metric-card">
        <span class="dashboard-metric-label">Origen</span>
        <strong>{{ migrationStore.sourceVersion }}</strong>
        <span>Aplicacion existente</span>
      </article>

      <article class="dashboard-metric-card">
        <span class="dashboard-metric-label">Objetivo</span>
        <strong>{{ migrationStore.targetVersion }}</strong>
        <span>Plataforma moderna</span>
      </article>

      <article class="dashboard-metric-card">
        <span class="dashboard-metric-label">Fase</span>
        <strong>{{ migrationStore.phase }}</strong>
        <span>Base de navegacion</span>
      </article>
    </div>

    <div class="dashboard-grid">
      <article class="dashboard-panel">
        <div class="dashboard-panel-heading">
          <div>
            <p class="dashboard-panel-eyebrow">Arquitectura</p>
            <h3>Estructura disponible</h3>
          </div>

          <span class="dashboard-panel-badge">Completado</span>
        </div>

        <ul class="dashboard-checklist">
          <li>
            <span aria-hidden="true">OK</span>
            Layout autenticado central
          </li>
          <li>
            <span aria-hidden="true">OK</span>
            Navegacion lateral responsiva
          </li>
          <li>
            <span aria-hidden="true">OK</span>
            Encabezado con informacion de sesion
          </li>
          <li>
            <span aria-hidden="true">OK</span>
            Breadcrumb basado en Vue Router
          </li>
          <li>
            <span aria-hidden="true">OK</span>
            Cierre de sesion centralizado
          </li>
        </ul>
      </article>

      <article class="dashboard-panel">
        <div class="dashboard-panel-heading">
          <div>
            <p class="dashboard-panel-eyebrow">Siguiente etapa</p>
            <h3>Modulos funcionales</h3>
          </div>

          <span class="dashboard-panel-badge dashboard-panel-badge-pending">
            Pendiente
          </span>
        </div>

        <p class="dashboard-panel-copy">
          El menu deja visibles los dominios previstos, pero permanecen
          deshabilitados hasta migrar sus rutas, servicios y permisos.
        </p>

        <div class="dashboard-module-list">
          <span>Laboratorios</span>
          <span>Licencias</span>
          <span>Usuarios</span>
          <span>Configuracion</span>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { useMigrationStore } from '@/stores/migration'
import { useSessionStore } from '@/stores/session'

const migrationStore = useMigrationStore()
const sessionStore = useSessionStore()
</script>
