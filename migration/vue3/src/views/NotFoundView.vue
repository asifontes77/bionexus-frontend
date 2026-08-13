<template>
  <main class="migration-page">
    <section class="migration-card">
      <p class="migration-eyebrow">TORO 404</p>
      <h1>Ruta no encontrada</h1>
      <p>La dirección solicitada no pertenece a la aplicacion.</p>
      <router-link :to="{ name: 'dashboard' }">
        Volver al inicio
      </router-link>
    </section>
  </main>
</template>
