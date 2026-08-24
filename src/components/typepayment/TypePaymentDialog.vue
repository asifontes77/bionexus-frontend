<template>
  <BioNexusDialog ref="dialog" size="standard" :kicker="mode === 'create' ? 'Nuevo registro' : 'Editar registro'" :title="mode === 'create' ? 'Crear tipo de pago' : 'Editar tipo de pago'" @close="handleClosed">
    <section class="type-payment-dialog-body">
      <BioNexusFormField label="Descripción" field-id="type-payment-description" :error="descriptionError" required><input id="type-payment-description" ref="firstInput" v-model="draft.description" class="bio-nexus-field" type="text" maxlength="50" autocomplete="off" /></BioNexusFormField>
      <BioNexusFormField label="Descripción auxiliar 1" field-id="type-payment-description-1"><input id="type-payment-description-1" v-model="draft.description_1" class="bio-nexus-field" type="text" maxlength="50" autocomplete="off" /></BioNexusFormField>
      <BioNexusFormField label="Descripción auxiliar 2" field-id="type-payment-description-2"><input id="type-payment-description-2" v-model="draft.description_2" class="bio-nexus-field" type="text" maxlength="50" autocomplete="off" /></BioNexusFormField>
      <BioNexusCheckbox v-model="draft.only_dollars" class="type-payment-check" label="Disponible solo para pagos en dólares" />
      <div v-if="errorMessage" class="bio-nexus-message bio-nexus-message-error" role="alert">{{ errorMessage }}</div>
    </section>
    <template #footer>
      <button type="button" class="bio-nexus-action bio-nexus-action-secondary" :disabled="saving" @click="close"><BioNexusActionIcon action="cancel" /><span>Cancelar</span></button>
      <button type="button" class="bio-nexus-action bio-nexus-action-primary" :disabled="submitDisabled" @click="submit"><BioNexusActionIcon action="save" /><span>{{ saving ? "Guardando..." : mode === "create" ? "Crear" : "Guardar" }}</span></button>
    </template>
  </BioNexusDialog>
</template>
<script setup>
import BioNexusCheckbox from "@/components/ui/BioNexusCheckbox.vue";
import { computed, nextTick, reactive, ref } from "vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
import BioNexusFormField from "@/components/ui/BioNexusFormField.vue";
const props = defineProps({ saving: { type: Boolean, default: false }, canCreate: { type: Boolean, default: false }, canUpdate: { type: Boolean, default: false } });
const emit = defineEmits(["submit"]); const dialog = ref(null); const firstInput = ref(null); const mode = ref("create"); const current = ref(null); const errorMessage = ref(""); const validationAttempted = ref(false); const draft = reactive({ description: "", description_1: "", description_2: "", only_dollars: false }); const original = ref("");
const values = computed(() => ({ description: draft.description.trim(), description_1: draft.description_1.trim(), description_2: draft.description_2.trim(), only_dollars: Boolean(draft.only_dollars) }));
const signature = computed(() => JSON.stringify(values.value));
const descriptionError = computed(() => validationAttempted.value && String(draft.description ?? "").trim() === "" ? "El campo Descripción es requerido." : "");
const submitDisabled = computed(() => props.saving || signature.value === original.value || (mode.value === "create" ? !props.canCreate : !props.canUpdate));
async function show() { await dialog.value?.open(); nextTick(() => firstInput.value?.focus()); }
function assign(row) { draft.description = row?.description || ""; draft.description_1 = row?.description_1 || ""; draft.description_2 = row?.description_2 || ""; draft.only_dollars = Boolean(row?.only_dollars); original.value = JSON.stringify(values.value); }
function openCreate() { validationAttempted.value = false; mode.value = "create"; current.value = null; assign(null); original.value = ""; errorMessage.value = ""; show(); }
function openEdit(row) { validationAttempted.value = false; mode.value = "edit"; current.value = row; assign(row); errorMessage.value = ""; show(); }
function close() { dialog.value?.close(); }
function handleClosed() { validationAttempted.value = false; }
function clearError() { errorMessage.value = ""; }
function setError(message) { const normalizedMessage = String(message || "").toLocaleLowerCase(); const isRequiredDescriptionMessage = normalizedMessage.includes("descripci") && (normalizedMessage.includes("obligatori") || normalizedMessage.includes("requerid")); errorMessage.value = values.value.description !== "" && isRequiredDescriptionMessage ? "" : String(message || ""); }
function submit() { validationAttempted.value = true; if (descriptionError.value !== "" || submitDisabled.value) return; errorMessage.value = ""; emit("submit", { mode: mode.value, record: current.value, values: values.value }); }
defineExpose({ openCreate, openEdit, close, clearError, setError });
</script>
<style scoped>
.type-payment-dialog-body { display: grid; gap: var(--bio-nexus-space-3); }
.type-payment-check { display: flex; align-items: center; gap: var(--bio-nexus-space-2); color: var(--bio-nexus-color-text-secondary); font-family: var(--bio-nexus-font-family); font-size: var(--bio-nexus-font-size-md); font-weight: var(--bio-nexus-font-weight-regular); }
.type-payment-check input { width: 16px; height: 16px; margin: 0; accent-color: var(--bio-nexus-color-primary); }
</style>
