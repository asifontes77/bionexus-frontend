<template>
  <BioNexusDialog ref="dialog" size="wide" dialog-class="special-test-dialog" shell-class="special-test-shell" body-class="special-test-dialog-body" :prevent-close="saving || dirty" :kicker="mode === 'create' ? 'Nuevo registro' : 'Editar registro'" :title="mode === 'create' ? 'Crear laboratorio de referencia' : 'Editar laboratorio de referencia'" @before-close="requestClose" @close="handleClosed">
    <section class="special-test-body">
      <BioNexusFormErrors :errors="errorMessage" />
      <BioNexusSectionPanel class="special-test-section" title="Información del laboratorio" icon="business" description="Define la identificación y los datos de contacto del laboratorio de referencia." variant="accent">
        <div class="special-test-fields">
        <BioNexusFormField label="Nombre" field-id="st-description" :error="nameError" :help="draft.description.length + ' de 60 caracteres'" required><input id="st-description" ref="firstInput" v-model="draft.description" class="bio-nexus-field" maxlength="60" @input="handleNameInput"></BioNexusFormField>
        <BioNexusFormField label="Descripción" field-id="st-details" :help="draft.details.length + ' de 200 caracteres'"><textarea id="st-details" v-model="draft.details" class="bio-nexus-field" maxlength="200" rows="2" @input="syncDirty"></textarea></BioNexusFormField>
        <BioNexusFormField label="Correo electrónico" field-id="st-email" :help="draft.email.length + ' de 100 caracteres'"><input id="st-email" v-model="draft.email" class="bio-nexus-field" maxlength="100" @input="syncDirty"></BioNexusFormField>
        <BioNexusFormField class="wide" label="Dirección" field-id="st-address" :help="draft.address.length + ' de 255 caracteres'" wide><input id="st-address" v-model="draft.address" class="bio-nexus-field" maxlength="255" @input="syncDirty"></BioNexusFormField>
        <BioNexusFormField label="Teléfono principal" field-id="st-phone1" :help="draft.phone_1.length + ' de 30 caracteres'"><input id="st-phone1" v-model="draft.phone_1" class="bio-nexus-field" maxlength="30" @input="syncDirty"></BioNexusFormField>
        <BioNexusFormField label="Teléfono alterno" field-id="st-phone2" :help="draft.phone_2.length + ' de 30 caracteres'"><input id="st-phone2" v-model="draft.phone_2" class="bio-nexus-field" maxlength="30" @input="syncDirty"></BioNexusFormField>
      </div>
      </BioNexusSectionPanel>

      <BioNexusSectionPanel class="special-test-section" title="Gestión de exámenes" icon="playlist_add_check" description="Agrega los exámenes enviados al laboratorio y conserva las asociaciones existentes." variant="accent">
      <div class="special-test-picker">
        <section class="special-test-panel">
          <BioNexusFormField label="Buscar examen" field-id="st-search"><input id="st-search" v-model="search" class="bio-nexus-field" type="search" autocomplete="off"></BioNexusFormField>
          <div class="special-test-list available-list">
            <article v-for="exam in available" :key="exam.id" class="special-test-row available-row">
              <span class="catalog-mark" aria-hidden="true">+</span>
              <span class="special-test-row-copy"><strong>{{ exam.description }}</strong><small>{{ exam.abbreviation }}</small></span>
              <div class="available-actions"><BioNexusActionButton size="sm" variant="secondary" icon="visibility" icon-only shape="circle" label="Detalle" @click="openDetail(exam)" /><BioNexusActionButton size="sm" variant="primary" icon="add" icon-only shape="circle" label="Agregar" :disabled="!canItemCreate" @click="add(exam)" /></div>
            </article>
            <p v-if="!available.length" class="special-test-empty">No hay exámenes disponibles.</p>
      </div>
      </section>
        <section class="special-test-panel selected-panel">
                  <header><strong>Exámenes seleccionados *</strong><span>{{ draft.items.length }}</span></header>
                  <p v-if="examError" class="special-test-validation">{{ examError }}</p>
                  <div class="special-test-list selected-list">
                    <article v-for="(item, index) in draft.items" :key="item.exam_list_Id" class="special-test-row selected-row">
                      <span class="order-number">{{ index + 1 }}</span>
                      <span class="special-test-row-copy"><strong>{{ item.description }}</strong><small>{{ item.abbreviation || 'Examen de catálogo' }}</small></span>
                      <BioNexusActionButton size="sm" variant="danger" icon="delete" icon-only shape="circle" label="Quitar" :disabled="!canItemDelete" @click="remove(index)" />
                    </article>
                    <p v-if="!draft.items.length" class="special-test-empty">No hay exámenes seleccionados.</p>
                  </div>
                </section>
      </div>
      </BioNexusSectionPanel>
    </section>


    <template #footer><BioNexusActionButton variant="secondary" icon="cancel" :disabled="saving" @click="requestClose">Cancelar</BioNexusActionButton><BioNexusActionButton variant="primary" :icon="mode === 'create' ? 'create' : 'save'" :loading="saving" :disabled="submitDisabled" @click="submit">{{ mode === 'create' ? 'Crear' : 'Guardar' }}</BioNexusActionButton></template>
  </BioNexusDialog>
  <ExamDetailDialog ref="detailDialog" />
  <BioNexusConfirmDialog ref="discardDialog" />
</template>

<script setup>
import { computed, nextTick, reactive, ref } from "vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
import BioNexusFormField from "@/components/ui/BioNexusFormField.vue";
import BioNexusFormErrors from "@/components/ui/BioNexusFormErrors.vue";
import BioNexusActionButton from "@/components/ui/BioNexusActionButton.vue";
import BioNexusConfirmDialog from "@/components/ui/BioNexusConfirmDialog.vue";
import BioNexusSectionPanel from "@/components/ui/BioNexusSectionPanel.vue";
import ExamDetailDialog from "@/components/exams/ExamDetailDialog.vue";

const props = defineProps({ saving: Boolean, canCreate: Boolean, canUpdate: Boolean, canItemCreate: Boolean, canItemDelete: Boolean, exams: { type: Array, default: () => [] } });
const emit = defineEmits(["submit"]);
const dialog = ref(null), detailDialog = ref(null), discardDialog = ref(null), firstInput = ref(null), mode = ref("create"), current = ref(null), search = ref(""), attempted = ref(false), errorMessage = ref(""), original = ref(""), dirty = ref(false), initializing = ref(false);
const draft = reactive({ description: "", details: "", address: "", phone_1: "", phone_2: "", email: "", items: [] });

const values = computed(() => ({ description: draft.description.trim(), details: draft.details.trim(), address: draft.address.trim(), phone_1: draft.phone_1.trim(), phone_2: draft.phone_2.trim(), email: draft.email.trim().toLowerCase() }));
const itemIds = computed(() => draft.items.map(item => item.exam_list_Id));
const snapshot = () => JSON.stringify({ values: values.value, itemIds: itemIds.value });
const nameError = computed(() => attempted.value && !values.value.description ? "El nombre es obligatorio." : "");
const examError = computed(() => attempted.value && draft.items.length === 0 ? "Selecciona al menos un examen." : "");
const isValid = computed(() => Boolean(values.value.description) && draft.items.length > 0);
const canEditLab = computed(() => mode.value === "create" ? props.canCreate : props.canUpdate);
const canEditItems = computed(() => props.canItemCreate || props.canItemDelete);
const submitDisabled = computed(() => initializing.value || props.saving || !isValid.value || !dirty.value || (!canEditLab.value && !canEditItems.value));
const available = computed(() => { const query = search.value.trim().toLowerCase(), used = new Set(itemIds.value); return props.exams.filter(exam => !exam.annulled && !used.has(exam.id) && (!query || (String(exam.description || "") + " " + String(exam.abbreviation || "")).toLowerCase().includes(query))); });

function assign(row) { draft.description = row?.description || ""; draft.details = row?.details || ""; draft.address = row?.address || ""; draft.phone_1 = row?.phone_1 || ""; draft.phone_2 = row?.phone_2 || ""; draft.email = row?.email || ""; draft.items = (row?.specialTestItems || []).map(item => { const exam = props.exams.find(source => source.id === item.exam_list_Id); return { ...item, description: item.description || exam?.description || `Examen ${item.exam_list_Id}`, abbreviation: exam?.abbreviation || "" }; }); }
function clearGeneralError() { errorMessage.value = ""; }
function syncDirty() { clearGeneralError(); dirty.value = !initializing.value && snapshot() !== original.value; }
function handleNameInput() { syncDirty(); }
async function show() { await dialog.value?.open(); await nextTick(); original.value = snapshot(); dirty.value = false; initializing.value = false; firstInput.value?.focus(); }
async function openCreate() { initializing.value = true; mode.value = "create"; current.value = null; assign(null); attempted.value = false; errorMessage.value = ""; search.value = ""; await show(); }
async function openEdit(row) { initializing.value = true; mode.value = "edit"; current.value = row; assign(row); attempted.value = false; errorMessage.value = ""; search.value = ""; await show(); }
function openDetail(exam) { detailDialog.value?.open(exam); }
function add(exam) { draft.items.push({ id: 0, specialTestLabId: current.value?.id || 0, exam_list_Id: exam.id, description: exam.description, abbreviation: exam.abbreviation }); syncDirty(); }
function remove(index) { draft.items.splice(index, 1); syncDirty(); }
function submit() { attempted.value = true; if (nameError.value || examError.value || submitDisabled.value) return; const originalRecord = current.value || {}; const originalValues = { description: String(originalRecord.description || "").trim(), address: String(originalRecord.address || "").trim(), phone_1: String(originalRecord.phone_1 || "").trim(), phone_2: String(originalRecord.phone_2 || "").trim(), email: String(originalRecord.email || "").trim().toLowerCase(), details: String(originalRecord.details || "").trim() }; emit("submit", { mode: mode.value, record: current.value, values: values.value, items: draft.items, labChanged: mode.value === "create" || JSON.stringify(values.value) !== JSON.stringify(originalValues) }); }
async function requestClose() { if (props.saving) return; if (dirty.value) { const confirmed = await discardDialog.value?.ask({ kicker: "Confirmación", title: "Descartar cambios", message: "Hay cambios sin guardar. ¿Deseas salir y descartarlos?", icon: "warning", variant: "danger", confirmIcon: "delete", confirmText: "Sí, salir y descartar cambios", cancelText: "Cancelar" }); if (!confirmed) return; } dialog.value?.close(); }
function close() { requestClose(); }
function handleClosed() { attempted.value = false; dirty.value = false; errorMessage.value = ""; }
function setError(value) { errorMessage.value = String(value || ""); }
function clearError() { errorMessage.value = ""; }
defineExpose({ openCreate, openEdit, close, setError, clearError });
</script>

<style scoped>
:deep(.special-test-dialog) .bio-nexus-action-primary:disabled{border-color:var(--bio-nexus-color-border)!important;background:var(--bio-nexus-color-surface-soft)!important;color:var(--bio-nexus-color-text-muted)!important;box-shadow:none!important;cursor:not-allowed!important;opacity:.58!important;pointer-events:none}.special-test-body{display:grid;gap:var(--bio-nexus-space-4);font-family:var(--bio-nexus-font-family,Inter,Roboto,Arial,sans-serif);font-size:13px}.special-test-section{min-width:0}.special-test-section :deep(.bio-nexus-section-panel-body){display:grid;gap:var(--bio-nexus-space-3)}.special-test-fields,.special-test-picker{display:grid;grid-template-columns:minmax(340px,.95fr) minmax(460px,1.25fr);gap:12px}.wide{grid-column:1/-1}.special-test-panel{display:grid;grid-template-rows:auto minmax(0,1fr);gap:7px;min-height:0;padding:10px;border:1px solid var(--bio-nexus-color-border);border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-surface)}.special-test-panel header{display:flex;align-items:center;justify-content:space-between;min-height:38px;padding-inline:2px}.special-test-panel header strong{font-size:15px}.special-test-panel header span{color:var(--bio-nexus-color-text-muted);font-size:12px;font-weight:700}.special-test-list{display:grid;align-content:start;gap:6px;height:clamp(340px,48vh,500px);padding:2px 5px 8px 1px;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;scrollbar-gutter:stable}.special-test-row{box-sizing:border-box;display:flex;align-items:center;gap:8px;width:100%;min-height:46px;padding:5px 8px;border:1px solid var(--bio-nexus-color-border);border-radius:var(--bio-nexus-radius-sm);background:var(--bio-nexus-color-surface-soft)}.catalog-mark,.order-number{box-sizing:border-box;display:grid;place-items:center;flex:0 0 32px;width:32px;height:32px;border:1px solid var(--bio-nexus-color-border-strong);border-radius:50%;background:var(--bio-nexus-color-surface);color:var(--bio-nexus-color-text-secondary);font-size:12px;font-weight:700}.catalog-mark{color:var(--bio-nexus-color-primary);font-size:18px}.special-test-row-copy{display:grid;gap:1px;min-width:0;flex:1}.special-test-row-copy strong,.special-test-row-copy small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.special-test-row-copy strong{font-size:13px;font-weight:600}.special-test-row-copy small{color:var(--bio-nexus-color-text-muted);font-size:11px;font-weight:500}.available-actions{display:flex;align-items:center;gap:4px}.special-test-validation{margin:0;color:var(--bio-nexus-color-danger);font-size:12px;font-weight:600}.special-test-empty{margin:0;padding:18px;color:var(--bio-nexus-color-text-muted);text-align:center}.special-test-list::-webkit-scrollbar{width:9px}.special-test-list::-webkit-scrollbar-thumb{border:2px solid transparent;border-radius:999px;background:var(--bio-nexus-color-border-strong);background-clip:padding-box}@media(max-width:900px){.special-test-section{min-width:0}.special-test-section :deep(.bio-nexus-section-panel-body){display:grid;gap:var(--bio-nexus-space-3)}.special-test-fields,.special-test-picker{grid-template-columns:1fr}.special-test-list{height:360px}.wide{grid-column:auto}}
</style>

<style>
dialog.bio-nexus-dialog.special-test-dialog{width:min(1320px,calc(100vw - 32px))!important;height:min(820px,calc(100dvh - 32px))!important;max-height:calc(100dvh - 32px)!important}dialog.bio-nexus-dialog.special-test-dialog>.special-test-shell{height:100%!important;max-height:100%!important}dialog.bio-nexus-dialog.special-test-dialog>.special-test-shell>.special-test-dialog-body{min-height:0;overflow-x:hidden;overflow-y:auto;padding:12px 16px!important}@media(max-width:900px){dialog.bio-nexus-dialog.special-test-dialog{width:calc(100vw - 16px)!important;height:calc(100dvh - 16px)!important}}
</style>
<style scoped>
/* special-test-compact-priority-v1 */
.special-test-fields {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px 10px;
  align-items: start;
}
.special-test-fields > :nth-child(1),
.special-test-fields > :nth-child(2) {
  grid-column: span 2;
}
.special-test-fields > :nth-child(3),
.special-test-fields > :nth-child(4),
.special-test-fields > :nth-child(5),
.special-test-fields > :nth-child(6) {
  grid-column: span 1;
}
.special-test-fields .wide {
  grid-column: span 1;
}
.special-test-fields :deep(.bio-nexus-field) {
  min-height: 42px;
  height: 42px;
  padding-block: 7px;
}
.special-test-fields :deep(textarea.bio-nexus-field) {
  min-height: 58px;
  height: 58px;
  resize: vertical;
}
.special-test-picker {
  margin-top: 2px;
}
.special-test-list {
  height: clamp(330px, 48vh, 480px);
}
@media (max-width: 1100px) {
  .special-test-fields {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .special-test-fields > :nth-child(n) {
    grid-column: span 1;
  }
  .special-test-fields > :nth-child(4) {
    grid-column: 1 / -1;
  }
}
@media (max-width: 760px) {
  .special-test-fields {
    grid-template-columns: 1fr;
  }
  .special-test-fields > :nth-child(n) {
    grid-column: 1;
  }
  .special-test-list {
    height: 320px;
  }
}
</style>
