<template>
  <dialog ref="dialog" class="exam-detail-dialog" @cancel.prevent="close" @click="onBackdropClick">
    <section class="exam-detail-shell" @click.stop>
      <header class="exam-detail-header">
        <div><p>Detalle del catalogo</p><h2>Ver examen</h2></div>
        <button type="button" aria-label="Cerrar" title="Cerrar" @click="close"><BioNexusIcon name="close" :size="21" /></button>
      </header>
      <main v-if="exam" class="exam-detail-body">
        <section class="exam-detail-summary">
          <article class="wide"><span>Descripcion</span><strong>{{ exam.description || "Sin descripcion" }}</strong></article>
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
          <h3>Configuracion del resultado</h3>
          <div class="exam-config-grid">
            <article><span>Hoja de trabajo</span><strong :class="hasWorksheet ? 'configured' : 'pending'">{{ hasWorksheet ? "Configurada" : "No configurada" }}</strong></article>
            <article><span>Formato de resultado</span><strong :class="hasResultFormat ? 'configured' : 'pending'">{{ hasResultFormat ? "Configurado" : "No configurado" }}</strong></article>
          </div>
        </section>
      </main>
      <footer class="exam-detail-footer"><button type="button" class="bio-nexus-action bio-nexus-action-secondary" @click="close">Cerrar</button></footer>
    </section>
  </dialog>
</template>
<script setup>
import { computed, nextTick, ref } from "vue";
import BioNexusIcon from "@/components/ui/BioNexusIcon.vue";
const props = defineProps({ taxes: { type: Array, default: () => [] } });
const dialog = ref(null); const exam = ref(null); const group = ref(null);
const tax = computed(() => props.taxes.find((item) => Number(item.id) === Number(exam.value?.tax_id)) ?? null);
const taxLabel = computed(() => tax.value ? `${tax.value.description} - ${Number(tax.value.value || 0).toFixed(2)} %` : "Impuesto no disponible");
const hasWorksheet = computed(() => typeof exam.value?.work_sheet === "string" && exam.value.work_sheet.trim() !== "");
const hasResultFormat = computed(() => { const value = exam.value?.format_vue ?? exam.value?.format; if (value === null || value === undefined || value === "") return false; if (typeof value === "string") { try { return Boolean(JSON.parse(value)); } catch { return value.trim() !== ""; } } return typeof value === "object"; });
function money(value) { return Number(value || 0).toFixed(2); }
async function show(record, selectedGroup) { exam.value = record; group.value = selectedGroup; dialog.value?.showModal(); await nextTick(); dialog.value?.querySelector(".exam-detail-header button")?.focus(); }
function close() { if (dialog.value?.open) dialog.value.close(); exam.value = null; group.value = null; }
function onBackdropClick(event) { if (event.target === dialog.value) close(); }
defineExpose({ show, close });
</script>
<style scoped>
.exam-detail-dialog{width:min(780px,calc(100vw - 32px));max-width:none;max-height:calc(100vh - 48px);padding:0;border:0;border-radius:var(--bio-nexus-radius-lg);background:transparent;overflow:hidden;box-shadow:0 24px 70px rgb(15 23 42 / 28%)}.exam-detail-dialog::backdrop{background:rgb(15 23 42 / 42%);backdrop-filter:blur(2px)}.exam-detail-shell{display:grid;grid-template-rows:auto minmax(0,1fr) auto;max-height:calc(100vh - 48px);overflow:hidden;border:1px solid var(--bio-nexus-color-border);border-radius:var(--bio-nexus-radius-lg);background:var(--bio-nexus-color-surface)}.exam-detail-header{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 22px;border-bottom:1px solid var(--bio-nexus-color-border);background:var(--bio-nexus-color-surface)}.exam-detail-header p{margin:0;color:var(--bio-nexus-color-accent);font-size:var(--bio-nexus-font-size-xs);font-weight:800;text-transform:uppercase}.exam-detail-header h2{margin:3px 0 0;color:var(--bio-nexus-color-primary-strong);font-size:var(--bio-nexus-font-size-xl)}.exam-detail-header button{display:grid;place-items:center;width:36px;height:36px;border:0;border-radius:50%;background:transparent;color:var(--bio-nexus-color-text-muted);cursor:pointer}.exam-detail-body{min-height:0;overflow-y:auto;overscroll-behavior:contain;display:grid;align-content:start;gap:18px;padding:20px 22px}.exam-detail-summary{display:grid;grid-template-columns:2fr 1fr;gap:12px}.exam-detail-summary article,.exam-price-grid article,.exam-config-grid article{display:grid;gap:5px;padding:12px 14px;border:1px solid var(--bio-nexus-color-border);border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-surface-soft)}.exam-detail-summary span,.exam-price-grid span,.exam-config-grid span{color:var(--bio-nexus-color-text-muted);font-size:var(--bio-nexus-font-size-xs);font-weight:700;text-transform:uppercase}.exam-detail-summary strong,.exam-price-grid strong,.exam-config-grid strong{overflow-wrap:anywhere;color:var(--bio-nexus-color-text);font-size:var(--bio-nexus-font-size-sm)}strong.active,strong.configured{color:var(--bio-nexus-color-success)}strong.inactive{color:var(--bio-nexus-color-danger)}strong.pending{color:var(--bio-nexus-color-text-muted)}.exam-detail-section h3{margin:0 0 10px;color:var(--bio-nexus-color-primary-strong);font-size:var(--bio-nexus-font-size-md)}.exam-price-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.exam-price-grid strong{text-align:right;font-variant-numeric:tabular-nums}.exam-config-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.exam-detail-footer{display:flex;justify-content:flex-end;padding:14px 22px;border-top:1px solid var(--bio-nexus-color-border);background:var(--bio-nexus-color-surface)}@media(max-width:680px){.exam-detail-summary,.exam-price-grid,.exam-config-grid{grid-template-columns:1fr}}
</style>
