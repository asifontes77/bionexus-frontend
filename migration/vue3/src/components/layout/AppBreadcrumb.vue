<template>
  <nav class="app-breadcrumb" aria-label="Ruta de navegacion">
    <router-link :to="{ name: 'dashboard' }">TORO</router-link>
    <span aria-hidden="true">/</span>
    <span aria-current="page">{{ currentTitle }}</span>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const currentTitle = computed(() =>
  typeof route.meta.title === 'string' ? route.meta.title : 'Inicio'
)
</script>
