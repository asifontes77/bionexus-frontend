<template>
  <nav class="app-breadcrumb" aria-label="Ruta de navegación">
    <router-link :to="{ name: 'dashboard' }">Bio Nexus</router-link>
    <template v-for="(item, index) in items" :key="item.label + '-' + index">
      <span aria-hidden="true">/</span>
      <router-link v-if="item.routeName && index < items.length - 1" :to="{ name: item.routeName }">{{ item.label }}</router-link>
      <span v-else :aria-current="index === items.length - 1 ? 'page' : undefined">{{ item.label }}</span>
    </template>
  </nav>
</template>
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const moduleRoutes = Object.freeze({
  'Catálogos': 'configuration-catalogs',
  'Laboratorio': 'configuration-laboratory-module',
  'Atención al paciente': 'configuration-patient-care',
  'Toma de muestras': 'configuration-sampling',
  'Facturación': 'configuration-billing-module',
  'Documentos y plantillas': 'configuration-documents',
  'Sistema': 'configuration-system-module',
  'Seguridad': 'configuration-security-module'
})
const routeHierarchy = Object.freeze({
  'configuration-catalogs': ['Configuración', 'Catálogos'],
  'configuration-exams': ['Configuración', 'Catálogos', 'Lista de exámenes'],
  'configuration-parasiticforms': ['Configuración', 'Catálogos', 'Formas parasitarias'],
  'configuration-antibiotics': ['Configuración', 'Catálogos', 'Antibióticos'],
  'type-payments': ['Configuración', 'Catálogos', 'Formas de pago'],
  'configuration-laboratory-module': ['Configuración', 'Laboratorio'],
  'configuration-laboratory-communications': ['Configuración', 'Laboratorio', 'Comunicaciones'],
  'configuration-billing-general': ['Configuración', 'Facturación', 'General'],
  'configuration-patient-care': ['Configuración', 'Atención al paciente'],
  'configuration-sampling': ['Configuración', 'Toma de muestras'],
  'configuration-billing-module': ['Configuración', 'Facturación'],
  'configuration-taxes': ['Configuración', 'Facturación', 'Impuestos'],
  'configuration-documents': ['Configuración', 'Documentos y plantillas'],
  'configuration-system-module': ['Configuración', 'Sistema'],
  'configuration-security-module': ['Configuración', 'Seguridad'],
  'security-roles': ['Configuración', 'Seguridad', 'Roles y permisos'],
  'security-users': ['Configuración', 'Seguridad', 'Usuarios y autorización']
})
function dynamicHierarchy() {
  if (route.name === 'configuration-laboratory') {
    if (route.query.tab === 'email') return ['Configuración', 'Laboratorio', 'Comunicaciones']
    if (route.query.tab === 'billing') return ['Configuración', 'Facturación', 'General']
    return ['Configuración', 'Laboratorio', 'Identidad']
  }
  if (route.name === 'configuration-application-settings') {
    if (route.query.tab === 'session') return ['Configuración', 'Sistema', 'Sesión y seguridad']
    if (route.query.tab === 'formats') return ['Configuración', 'Sistema', 'Formatos regionales']
    if (route.query.tab === 'printer') return ['Configuración', 'Sistema', 'Impresora']
    return ['Configuración', 'Sistema']
  }
  return null
}
const items = computed(() => {
  const labels = dynamicHierarchy() || routeHierarchy[String(route.name || '')] ||
    (Array.isArray(route.meta.breadcrumb) && route.meta.breadcrumb.length ? route.meta.breadcrumb : [String(route.meta.title || 'Inicio')])
  return labels.map(label => ({ label, routeName: moduleRoutes[label] || null }))
})
</script>
