<template>
  <BioNexusDialog ref="dialog" size="wide" kicker="Detalle del catálogo" title="Ver examen" :subtitle="exam?.description || ''" close-on-backdrop @close="handleClosed">
<section v-if="exam" class="exam-detail-content">
        <section class="exam-detail-summary">
          <article class="wide"><span>Descripción</span><strong>{{ exam.description || "Sin descripcion" }}</strong></article>
          <article><span>Abreviatura</span><strong>{{ exam.abbreviation || "Sin abreviatura" }}</strong></article>
          <article class="wide"><span>Grupo</span><strong>{{ group?.description || "Sin grupo" }}</strong></article>
          <article><span>Estado</span><strong :class="exam.annulled ? 'inactive' : 'active'">{{ exam.annulled ? "Inactivo" : "Activo" }}</strong></article>
          <article><span>Prueba especial</span><strong>{{ exam.special_test ? "Si" : "No" }}</strong></article>
          <article><span>Tipo de impuesto</span><strong>{{ taxLabel }}</strong></article>
        </section>
        <section class="exam-detail-section">
          <h3>Tarifas</h3>
          <div class="exam-price-grid"><article v-for="index in 6" :key="index"><span>Precio {{ index }}</span><strong>{{ money(exam[`cost${index}`]) }}</strong></article></div>
        </section>
        <section class="exam-detail-section">
          <h3>Configuración del resultado</h3>
          <div class="exam-config-grid">
            <article><span>Hoja de trabajo</span><strong :class="hasWorksheet ? 'configured' : 'pending'">{{ hasWorksheet ? "Configurada" : "No configurada" }}</strong></article>
            <article><span>Formato de resultado</span><strong :class="hasResultFormat ? 'configured' : 'pending'">{{ hasResultFormat ? "Configurado" : "No configurado" }}</strong></article>
          </div>
        </section>
      </section>
    <template #footer><button type="button" class="bio-nexus-action bio-nexus-action-secondary" @click="close">Cerrar</button></template>
  </BioNexusDialog>
</template>
<script setup>
import { computed, nextTick, ref } from "vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
const props = defineProps({ taxes: { type: Array, default: () => [] } });
const dialog = ref(null); const exam = ref(null); const group = ref(null);
const tax = computed(() => props.taxes.find((item) => Number(item.id) === Number(exam.value?.tax_id)) ?? null);
const taxLabel = computed(() => tax.value ? `${tax.value.description} - ${Number(tax.value.value || 0).toFixed(2)} %` : "Impuesto no disponible");
const hasWorksheet = computed(() => typeof exam.value?.work_sheet === "string" && exam.value.work_sheet.trim() !== "");
const hasResultFormat = computed(() => { const value = exam.value?.format_grid; if (value === null || value === undefined || value === "") return false; if (typeof value === "string") { try { return Boolean(JSON.parse(value)); } catch { return value.trim() !== ""; } } return typeof value === "object"; });
function money(value) { return Number(value || 0).toFixed(2); }
async function show(record, selectedGroup) { exam.value = record; group.value = selectedGroup; dialog.value?.open(); await nextTick();  }
function handleClosed() { exam.value = null; group.value = null; }
function close() { dialog.value?.close(); exam.value = null; group.value = null; }
function onBackdropClick(event) { if (event.target === dialog.value) close(); }
defineExpose({ show, close });
</script>
<style scoped>.exam-detail-content{display:grid;align-content:start;gap:18px}
.exam-detail-summary{display:grid;grid-template-columns:2fr 1fr;gap:12px}.exam-detail-summary article,.exam-price-grid article,.exam-config-grid article{display:grid;gap:5px;padding:12px 14px;border:1px solid var(--bio-nexus-color-border);border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-surface-soft)}.exam-detail-summary span,.exam-price-grid span,.exam-config-grid span{color:var(--bio-nexus-color-text-muted);font-size:var(--bio-nexus-font-size-xs);font-weight:700;text-transform:uppercase}.exam-detail-summary strong,.exam-price-grid strong,.exam-config-grid strong{overflow-wrap:anywhere;color:var(--bio-nexus-color-text);font-size:var(--bio-nexus-font-size-sm)}strong.active,strong.configured{color:var(--bio-nexus-color-success)}strong.inactive{color:var(--bio-nexus-color-danger)}strong.pending{color:var(--bio-nexus-color-text-muted)}.exam-detail-section h3{margin:0 0 10px;color:var(--bio-nexus-color-primary-strong);font-size:var(--bio-nexus-font-size-md)}.exam-price-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.exam-price-grid strong{text-align:right;font-variant-numeric:tabular-nums}.exam-config-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}@media(max-width:680px){.exam-detail-summary,.exam-price-grid,.exam-config-grid{grid-template-columns:1fr}}
</style>
