<template>
  <div class="admin-layout">
    <header class="admin-header">
      <div><strong>Bio Nexus</strong><span>Administración de la plataforma</span></div>
      <button type="button" @click="logout">Cerrar sesión</button>
    </header>
    <main class="admin-content"><router-view /></main>
  </div>
</template>
<script setup>
import { useRouter } from 'vue-router'
import { useAdminSessionStore } from '@/stores/adminSession'
const router = useRouter(); const session = useAdminSessionStore()
async function logout(){ session.clear(); await router.replace({ name: 'admin-login' }) }
</script>
<style scoped>
.admin-layout{min-height:100vh;background:var(--bio-nexus-color-surface-muted)}.admin-header{min-height:64px;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 24px;border-bottom:1px solid var(--bio-nexus-color-border);background:var(--bio-nexus-color-surface)}.admin-header div{display:grid;gap:2px}.admin-header span{color:var(--bio-nexus-color-text-muted);font-size:13px}.admin-content{padding:24px}
</style>
