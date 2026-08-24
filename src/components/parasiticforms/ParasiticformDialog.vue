<template>
  <BioNexusDialog ref="dialog" size="standard" :kicker="mode === 'create' ? 'Nuevo registro' : 'Editar registro'" :title="mode === 'create' ? 'Crear forma parasitaria' : `Editar ${current?.description || 'forma parasitaria'}`" @close="handleClosed">
    <section class="parasiticform-dialog-body">
      <BioNexusFormField label="Descripción" field-id="parasiticform-description" :error="descriptionError" :help="draft.description.length + ' de 50 caracteres'" required>
        <input id="parasiticform-description" ref="descriptionInput" v-model="draft.description" class="bio-nexus-field" type="text" maxlength="50" autocomplete="off" />
      </BioNexusFormField>
      <div v-if="errorMessage" class="bio-nexus-message bio-nexus-message-error" role="alert">{{ errorMessage }}</div>
    </section>
    <template #footer>
      <button type="button" class="bio-nexus-action bio-nexus-action-secondary" :disabled="saving" @click="close"><BioNexusActionIcon action="cancel" /><span>Cancelar</span></button>
      <button type="button" class="bio-nexus-action bio-nexus-action-primary" :disabled="submitDisabled" @click="submit"><BioNexusActionIcon action="save" /><span>{{ saving ? "Guardando..." : mode === "create" ? "Crear" : "Guardar" }}</span></button>
    </template>
  </BioNexusDialog>
</template>
<script setup>
import { computed, nextTick, reactive, ref } from "vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
import BioNexusFormField from "@/components/ui/BioNexusFormField.vue";
const props = defineProps({ saving: { type: Boolean, default: false }, canCreate: { type: Boolean, default: false }, canUpdate: { type: Boolean, default: false } });
const emit = defineEmits(["submit"]);
const dialog = ref(null); const descriptionInput = ref(null); const mode = ref("create"); const current = ref(null); const originalDescription = ref(""); const errorMessage = ref(""); const validationAttempted = ref(false); const draft = reactive({ description: "" });
const normalizedDescription = computed(() => draft.description.trim());
const descriptionError = computed(() => validationAttempted.value && normalizedDescription.value === "" ? "El campo Descripción es requerido." : "");
const changed = computed(() => mode.value === "create" ? normalizedDescription.value !== "" : normalizedDescription.value !== originalDescription.value);
const submitDisabled = computed(() => props.saving || normalizedDescription.value.length > 50 || (mode.value === "edit" && !changed.value) || (mode.value === "create" ? !props.canCreate : !props.canUpdate));
async function show() { await dialog.value?.open(); nextTick(() => descriptionInput.value?.focus()); }
function openCreate() { mode.value = "create"; current.value = null; originalDescription.value = ""; draft.description = ""; errorMessage.value = ""; validationAttempted.value = false; show(); }
function openEdit(record) { mode.value = "edit"; current.value = record; originalDescription.value = record.description; draft.description = record.description; errorMessage.value = ""; validationAttempted.value = false; show(); }
function close() { dialog.value?.close(); }
function handleClosed() { validationAttempted.value = false; }
function clearError() { errorMessage.value = ""; }
function setError(message) { errorMessage.value = message; }
function submit() { validationAttempted.value = true; if (descriptionError.value !== "" || submitDisabled.value) return; emit("submit", { mode: mode.value, record: current.value, description: normalizedDescription.value }); }
defineExpose({ openCreate, openEdit, close, clearError, setError });
</script>
<style scoped>
.parasiticform-dialog-body { display: grid; gap: var(--bio-nexus-space-3); }
</style>
