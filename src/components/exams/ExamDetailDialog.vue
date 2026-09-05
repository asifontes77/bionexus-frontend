<template>
  <BioNexusDialog ref="dialog" size="compact" dialog-class="exam-detail-dialog" kicker="Detalle del examen" title="Información del examen" @close="exam = null">
    <section v-if="exam" class="exam-detail-grid">
      <article class="exam-detail-card exam-detail-card-wide"><span>Descripción</span><strong>{{ exam.description || "Sin descripción" }}</strong></article>
      <article class="exam-detail-card"><span>Abreviatura</span><strong>{{ exam.abbreviation || "Sin abreviatura" }}</strong></article>
      <article class="exam-detail-card"><span>Estado</span><strong class="exam-detail-status" :class="{ 'exam-detail-status-inactive': exam.annulled }">{{ exam.annulled ? "Inactivo" : "Activo" }}</strong></article>
      <article class="exam-detail-card"><span>Tipo</span><strong>{{ exam.special_test ? "Prueba especial" : "Examen de laboratorio" }}</strong></article>
    </section>
    <template #footer><button type="button" class="bio-nexus-action bio-nexus-action-secondary" @click="close"><BioNexusActionIcon action="close" />Cerrar</button></template>
  </BioNexusDialog>
</template>
<script setup>
import { ref } from "vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
const dialog = ref(null);
const exam = ref(null);
function open(value) { exam.value = value || null; if (exam.value) dialog.value?.open(); }
function close() { dialog.value?.close(); }
defineExpose({ open, close });
</script>
<style>
.exam-detail-dialog{width:min(620px,calc(100vw - 32px))!important;max-width:620px!important}.exam-detail-dialog .bio-nexus-dialog-header{min-height:auto!important;padding:14px 20px 12px!important}.exam-detail-dialog .bio-nexus-dialog-body{padding:16px 20px!important}.exam-detail-dialog .bio-nexus-dialog-footer{min-height:auto!important;padding:10px 20px!important}.exam-detail-grid{display:grid;grid-template-columns:2fr 1fr;gap:12px}.exam-detail-card{display:grid;gap:5px;padding:12px 14px;border:1px solid var(--bio-nexus-color-border);border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-surface-soft)}.exam-detail-card span{color:var(--bio-nexus-color-text-muted);font-size:var(--bio-nexus-font-size-xs);font-weight:700;text-transform:uppercase}.exam-detail-card strong{overflow-wrap:anywhere;color:var(--bio-nexus-color-text);font-size:var(--bio-nexus-font-size-sm)}.exam-detail-status{color:var(--bio-nexus-color-success)!important}.exam-detail-status-inactive{color:var(--bio-nexus-color-danger)!important}.exam-detail-dialog .bio-nexus-action{min-height:36px!important;padding:0 12px!important;font-size:var(--bio-nexus-font-size-sm)!important}@media(max-width:620px){.exam-detail-dialog{width:calc(100vw - 24px)!important}.exam-detail-grid{grid-template-columns:1fr}.exam-detail-dialog .bio-nexus-dialog-body{padding:14px 16px!important}}
</style>
