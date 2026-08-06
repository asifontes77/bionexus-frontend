<template>
  <main class="migration-page">
    <section class="migration-card">
      <p class="migration-eyebrow">Migracion estructural</p>
      <h1>{{ store.applicationName }} Vue 3</h1>
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
import { useMigrationStore } from '@/stores/migration'

const store = useMigrationStore()
</script>
