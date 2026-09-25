<template>
  <BioNexusDialog
    ref="dialog"
    size="standard"
    dialog-class="antibiotic-entry-dialog"
    :prevent-close="saving || dirty"
    @before-close="requestClose"
    :kicker="mode === 'create' ? 'Nuevo registro' : 'Editar registro'"
    :title="mode === 'create' ? 'Crear antibiótico' : 'Editar antibiótico'"
    @close="reset"
  >
    <BioNexusFormErrors :errors="errorMessage" />
    <BioNexusSectionPanel
      class="antibiotic-section"
      title="Información del antibiótico"
      icon="medication"
      description="Define la descripción y las siglas que identifican el antibiótico."
      variant="accent"
    >
        <BioNexusFormField label="Descripción" field-id="antibiotic-description" :error="descriptionError" :help="draft.description.length + ' de 50 caracteres'" required>
          <input id="antibiotic-description" ref="firstInput" v-model="draft.description" class="bio-nexus-field" @input="syncDirty" maxlength="50" autocomplete="off">
        </BioNexusFormField>
        <BioNexusFormField label="Siglas" field-id="antibiotic-initials" :help="draft.siglas.length + ' de 10 caracteres. Opcional'">
          <input id="antibiotic-initials" v-model="draft.siglas" class="bio-nexus-field" @input="syncDirty" maxlength="10" autocomplete="off">
        </BioNexusFormField>
    </BioNexusSectionPanel>

    <template #footer>
      <BioNexusActionButton variant="secondary" icon="cancel" :disabled="saving" @click="requestClose">Cancelar</BioNexusActionButton>
      <BioNexusActionButton variant="primary" :icon="mode === 'create' ? 'create' : 'save'" :loading="saving" :disabled="submitDisabled" @click="submit">{{ mode === 'create' ? 'Crear' : 'Guardar' }}</BioNexusActionButton>
    </template>
  </BioNexusDialog>
  <BioNexusConfirmDialog ref="discardDialog" />
</template>

<script setup>
import { computed, nextTick, reactive, ref } from "vue";
import BioNexusActionButton from "@/components/ui/BioNexusActionButton.vue";
import BioNexusConfirmDialog from "@/components/ui/BioNexusConfirmDialog.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
import BioNexusFormField from "@/components/ui/BioNexusFormField.vue";
import BioNexusFormErrors from "@/components/ui/BioNexusFormErrors.vue";
import BioNexusSectionPanel from "@/components/ui/BioNexusSectionPanel.vue";

const props = defineProps({ saving: Boolean, canCreate: Boolean, canUpdate: Boolean });
const emit = defineEmits(["submit"]);
const dialog = ref(null);
const discardDialog = ref(null);
const firstInput = ref(null);
const mode = ref("create");
const current = ref(null);
const attempted = ref(false);
const errorMessage = ref("");
const original = ref("");
const dirty = ref(false);
const initializing = ref(false);
const draft = reactive({ description: "", siglas: "" });
const values = computed(() => ({ description: draft.description.trim().toUpperCase(), siglas: draft.siglas.trim().toUpperCase() }));
const descriptionError = computed(() => attempted.value && !values.value.description ? "La descripción es obligatoria." : "");
const submitDisabled = computed(() => initializing.value || props.saving || (mode.value === "create" ? (!props.canCreate || !values.value.description) : (!props.canUpdate || !dirty.value)));

function snapshot() { return JSON.stringify(values.value); }
function syncDirty() { dirty.value = !initializing.value && snapshot() !== original.value; }
function assign(row) { draft.description = row?.description || ""; draft.siglas = row?.siglas || ""; }
async function show() { await dialog.value?.open(); await nextTick(); original.value = snapshot(); dirty.value = false; initializing.value = false; firstInput.value?.focus(); }
async function openCreate() { initializing.value = true; mode.value = "create"; current.value = null; assign(null); attempted.value = false; errorMessage.value = ""; await show(); }
async function openEdit(row) { initializing.value = true; mode.value = "edit"; current.value = row; assign(row); attempted.value = false; errorMessage.value = ""; await show(); }
function submit() { attempted.value = true; if (descriptionError.value || submitDisabled.value) return; emit("submit", { mode: mode.value, record: current.value, values: values.value }); }
async function requestClose() { if (props.saving) return; if (dirty.value) { const confirmed = await discardDialog.value?.ask({ kicker: "Confirmación", title: "Descartar cambios", message: "Hay cambios sin guardar. ¿Deseas salir y descartarlos?", icon: "warning", variant: "danger", confirmIcon: "delete", confirmText: "Sí, salir y descartar cambios", cancelText: "Cancelar" }); if (!confirmed) return; } dialog.value?.close(); }
function close() { dialog.value?.close(); }
function reset() { attempted.value = false; dirty.value = false; }
function setError(value) { errorMessage.value = String(value || ""); }
function clearError() { errorMessage.value = ""; }
defineExpose({ openCreate, openEdit, close, setError, clearError });
</script>
