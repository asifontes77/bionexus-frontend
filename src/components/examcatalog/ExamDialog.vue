<template>
  <BioNexusDialog ref="dialog" size="wide" dialog-class="exam-entry-dialog" shell-class="exam-entry-shell" body-class="exam-entry-dialog-body" :kicker="mode === 'create' ? 'Nuevo registro' : 'Editar registro'" :title="mode === 'create' ? 'Crear examen' : 'Editar examen'" @close="handleClosed">
    <section class="exam-body">
      <div class="exam-main-grid">
        <BioNexusFormField label="Descripción" field-id="exam-description" :error="descriptionError" required><input id="exam-description" ref="firstInput" v-model="draft.description" class="bio-nexus-field" maxlength="60" /></BioNexusFormField>
        <BioNexusFormField label="Abreviatura" field-id="exam-abbreviation" :error="abbreviationError" required><input id="exam-abbreviation" v-model="draft.abbreviation" class="bio-nexus-field" maxlength="10" /></BioNexusFormField>
        <BioNexusFormField label="Impuesto" field-id="exam-tax"><select id="exam-tax" v-model.number="draft.tax_id" class="bio-nexus-field"><option v-for="tax in taxes" :key="tax.id" :value="tax.id">{{ tax.description }} ({{ tax.value.toFixed(2) }}%)</option></select></BioNexusFormField>
        <BioNexusCheckbox v-model="draft.special_test" class="exam-check" label="Prueba especial" />
      </div>
      <section class="exam-price-panel"><h4>Tarifas</h4><div class="exam-price-grid"><BioNexusFormField v-for="number in 6" :key="number" :label="'Precio ' + number" :field-id="'exam-cost-' + number"><input :id="'exam-cost-' + number" v-model.number="draft['cost' + number]" class="bio-nexus-field" type="number" min="0" step="0.01" /></BioNexusFormField></div></section>
      <div v-if="errorMessage" class="bio-nexus-message bio-nexus-message-error" role="alert">{{ errorMessage }}</div>
    </section>
    <template #footer>
      <button type="button" class="bio-nexus-action bio-nexus-action-secondary" :disabled="saving" @click="close"><BioNexusActionIcon action="cancel" />Cancelar</button>
      <button type="button" class="bio-nexus-action bio-nexus-action-primary" :disabled="submitDisabled" @click="submit"><BioNexusActionIcon action="save" />{{ saving ? "Guardando..." : mode === "create" ? "Crear" : "Guardar" }}</button>
    </template>
  </BioNexusDialog>
</template>

<script setup>
import BioNexusCheckbox from "@/components/ui/BioNexusCheckbox.vue";
import { computed, nextTick, reactive, ref } from "vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
import BioNexusFormField from "@/components/ui/BioNexusFormField.vue";

const props = defineProps({ saving: { type: Boolean, default: false }, canCreate: { type: Boolean, default: false }, canUpdate: { type: Boolean, default: false }, taxes: { type: Array, default: () => [] }, group: { type: Object, default: null } });
const emit = defineEmits(["submit"]);
const dialog = ref(null), firstInput = ref(null), mode = ref("create"), current = ref(null), errorMessage = ref(""), attempted = ref(false), original = ref("");
const draft = reactive({ description: "", abbreviation: "", tax_id: 1, special_test: false, cost1: 0, cost2: 0, cost3: 0, cost4: 0, cost5: 0, cost6: 0 });
const values = computed(() => ({ group_id: props.group?.id || 0, description: draft.description.trim().toUpperCase(), abbreviation: draft.abbreviation.trim().toUpperCase(), tax_id: Number(draft.tax_id) || 0, special_test: Boolean(draft.special_test), cost1: Number(draft.cost1) || 0, cost2: Number(draft.cost2) || 0, cost3: Number(draft.cost3) || 0, cost4: Number(draft.cost4) || 0, cost5: Number(draft.cost5) || 0, cost6: Number(draft.cost6) || 0 }));
const signature = computed(() => JSON.stringify(values.value));
const descriptionError = computed(() => attempted.value && !values.value.description ? "La descripción es obligatoria." : "");
const abbreviationError = computed(() => attempted.value && !values.value.abbreviation ? "La abreviatura es obligatoria." : "");
const invalidPrice = computed(() => [1, 2, 3, 4, 5, 6].some((number) => !Number.isFinite(Number(draft['cost' + number])) || Number(draft['cost' + number]) < 0));
const submitDisabled = computed(() => props.saving || invalidPrice.value || signature.value === original.value || (mode.value === "create" ? !props.canCreate : !props.canUpdate));

async function show() { await dialog.value?.open(); nextTick(() => firstInput.value?.focus()); }
function assign(row) { draft.description = row?.description || ""; draft.abbreviation = row?.abbreviation || ""; draft.tax_id = row?.tax_id || props.taxes[0]?.id || 1; draft.special_test = Boolean(row?.special_test); for (let number = 1; number <= 6; number += 1) draft['cost' + number] = Number(row?.['cost' + number]) || 0; original.value = JSON.stringify(values.value); }
function openCreate() { mode.value = "create"; current.value = null; assign(null); original.value = ""; attempted.value = false; errorMessage.value = ""; show(); }
function openEdit(row) { mode.value = "edit"; current.value = row; assign(row); attempted.value = false; errorMessage.value = ""; show(); }
function close() { dialog.value?.close(); }
function handleClosed() { attempted.value = false; }
function clearError() { errorMessage.value = ""; }
function setError(message) { errorMessage.value = String(message || ""); }
function submit() { attempted.value = true; if (descriptionError.value || abbreviationError.value || submitDisabled.value) return; emit("submit", { mode: mode.value, record: current.value, values: values.value }); }
defineExpose({ openCreate, openEdit, close, clearError, setError });
</script>

<style scoped>
.exam-body { display: grid; gap: var(--bio-nexus-space-4); }
.exam-main-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: var(--bio-nexus-space-3); align-items: center; }
.exam-price-panel { padding: var(--bio-nexus-space-3); border: 1px solid var(--bio-nexus-color-border); border-radius: var(--bio-nexus-radius-md); }
.exam-price-panel h4 { margin: 0 0 var(--bio-nexus-space-3); color: var(--bio-nexus-color-primary-strong); }
.exam-price-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--bio-nexus-space-3); }
.exam-check { display: flex; grid-column: 1 / -1; align-items: center; gap: var(--bio-nexus-space-2); min-height: 36px; }
@media (max-width: 720px) { .exam-main-grid, .exam-price-grid { grid-template-columns: 1fr; } }
</style>
<style>
/* BIO NEXUS EXAM ENTRY LAYOUT START */
dialog.bio-nexus-dialog.exam-entry-dialog {
  width: min(980px, calc(100vw - 32px)) !important;
  height: auto !important;
  max-height: calc(100dvh - 48px) !important;
}
dialog.bio-nexus-dialog.exam-entry-dialog > .exam-entry-shell {
  height: auto !important;
  max-height: calc(100dvh - 48px) !important;
}
dialog.bio-nexus-dialog.exam-entry-dialog > .exam-entry-shell > .exam-entry-dialog-body {
  flex: 0 1 auto !important;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
}
@media (max-width: 720px) {
  dialog.bio-nexus-dialog.exam-entry-dialog {
    width: calc(100vw - 16px) !important;
  }
}
/* BIO NEXUS EXAM ENTRY LAYOUT END */
</style>
<style>

</style>
<style>

</style>
<style>

</style>
<style>
/* BIO NEXUS EXAM ENTRY CENTER V4 START */
dialog.bio-nexus-dialog.exam-entry-dialog {
  position: fixed !important;
  inset: 50% auto auto 50% !important;
  margin: 0 !important;
  width: min(980px, calc(100vw - 32px)) !important;
  height: auto !important;
  max-height: calc(100dvh - 32px) !important;
  transform: translate(-50%, -50%) !important;
}
dialog.bio-nexus-dialog.exam-entry-dialog > .exam-entry-shell {
  max-height: calc(100dvh - 32px) !important;
}
dialog.bio-nexus-dialog.exam-entry-dialog > .exam-entry-shell > .exam-entry-dialog-body {
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
}
/* BIO NEXUS EXAM ENTRY CENTER V4 END */
</style>
