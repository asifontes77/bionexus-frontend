<template>
  <BioNexusDialog ref="dialog" size="standard" dialog-class="role-detail-dialog" kicker="Detalle administrativo" :title="selectedRole?.name || 'Rol'" @close="handleClosed">
    <section v-if="selectedRole" class="role-summary-card">
      <div class="role-summary-heading">
        <div>
          <span class="role-summary-code">{{ selectedRole.code }}</span>
          <h4>{{ selectedRole.name }}</h4>
          <p>{{ selectedRole.isSystem ? "Rol de sistema" : "Rol configurable" }}</p>
        </div>
        <span class="bio-nexus-badge" :class="{ 'bio-nexus-badge-warning': !selectedRole.isActive }">{{ selectedRole.isActive ? "Activo" : "Inactivo" }}</span>
      </div>
      <section class="role-summary-description">
        <span>Descripcion</span>
        <p>{{ selectedRole.description || "Sin descripcion" }}</p>
      </section>
      <dl class="role-summary-metadata role-summary-metadata-single">
        <div><dt>Tipo</dt><dd>{{ selectedRole.isSystem ? "Sistema" : "Configurable" }}</dd></div>
      </dl>
    </section>
    <template #footer>
      <button type="button" class="bio-nexus-action bio-nexus-action-secondary" @click="close"><BioNexusActionIcon action="close" />Cerrar</button>
    </template>
  </BioNexusDialog>
</template>
<script setup>
import { ref } from "vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
const props = defineProps({ selectedRole: { type: Object, default: null } });
const emit = defineEmits(["close"]);
const dialog = ref(null);
function showModal() { dialog.value?.open(); }
function close() { dialog.value?.close(); }
function focus(options) { dialog.value?.element?.focus(options); }
function handleClosed() { emit("close"); }
defineExpose({ showModal, close, focus });
</script>
<style scoped>
.role-summary-card { display: grid; gap: var(--bio-nexus-space-4); }
.role-summary-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--bio-nexus-space-4); padding-bottom: var(--bio-nexus-space-3); border-bottom: 1px solid var(--bio-nexus-color-border); }
.role-summary-heading h4, .role-summary-heading p { margin: 0; }
.role-summary-heading p { margin-top: var(--bio-nexus-space-1); color: var(--bio-nexus-color-text-muted); }
.role-summary-code { color: var(--bio-nexus-color-primary-strong); font-size: var(--bio-nexus-font-size-sm); font-weight: var(--bio-nexus-font-weight-bold); }
.role-summary-description { padding: var(--bio-nexus-space-3); border: 1px solid var(--bio-nexus-color-border); border-radius: var(--bio-nexus-radius-md); background: var(--bio-nexus-color-surface-soft); }
.role-summary-description > span { color: var(--bio-nexus-color-text-muted); font-size: var(--bio-nexus-font-size-xs); font-weight: var(--bio-nexus-font-weight-bold); text-transform: uppercase; }
.role-summary-description p { margin: var(--bio-nexus-space-1) 0 0; color: var(--bio-nexus-color-text-secondary); }
.role-summary-metadata { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--bio-nexus-space-3); margin: 0; }
.role-summary-metadata > div { padding: var(--bio-nexus-space-3); border: 1px solid var(--bio-nexus-color-border); border-radius: var(--bio-nexus-radius-md); background: var(--bio-nexus-color-surface); }
.role-summary-metadata dt { color: var(--bio-nexus-color-text-muted); font-size: var(--bio-nexus-font-size-xs); font-weight: var(--bio-nexus-font-weight-bold); text-transform: uppercase; }
.role-summary-metadata dd { margin: var(--bio-nexus-space-1) 0 0; color: var(--bio-nexus-color-text); font-weight: var(--bio-nexus-font-weight-bold); }
@media (max-width: 720px) { .role-summary-heading { flex-direction: column; } .role-summary-metadata { grid-template-columns: 1fr; } }

.role-summary-metadata-single {
  grid-template-columns: minmax(220px, 360px);
}</style>
<style>
dialog.bio-nexus-dialog.role-detail-dialog { width: min(720px, calc(100vw - 32px)) !important; height: auto !important; max-height: calc(100dvh - 48px) !important; }
@media (max-width: 720px) { dialog.bio-nexus-dialog.role-detail-dialog { width: calc(100vw - 16px) !important; } }
</style>
