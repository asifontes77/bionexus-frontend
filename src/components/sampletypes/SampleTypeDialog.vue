<template>
  <BioNexusDialog
    ref="dialog"
    size="standard"
    :kicker="mode === 'create' ? 'Nuevo registro' : 'Editar registro'"
    :title="mode === 'create' ? 'Crear tipo de muestra' : 'Editar tipo de muestra'"
    :prevent-close="saving || changed"
    @before-close="requestClose"
    @close="handleClosed"
  >
    <BioNexusFormLayout>
      <BioNexusFormErrors :errors="errorMessage" />

      <BioNexusSectionPanel
        title="Información del tipo de muestra"
        icon="science"
        description="Define la descripción que identifica el tipo de muestra."
        variant="accent"
      >
        <BioNexusFormField
          label="Descripción"
          field-id="sample-type-description"
          :error="descriptionError"
          :help="draft.description.length + ' de 50 caracteres'"
          required
        >
          <input
            id="sample-type-description"
            ref="firstInput"
            v-model="draft.description"
            class="bio-nexus-field"
            maxlength="50"
            autocomplete="off"
          >
        </BioNexusFormField>
      </BioNexusSectionPanel>
    </BioNexusFormLayout>

    <template #footer>
      <button type="button" class="bio-nexus-action bio-nexus-action-secondary" :disabled="saving" @click="requestClose">
        <BioNexusActionIcon action="cancel" />
        Cancelar
      </button>
      <button type="button" class="bio-nexus-action bio-nexus-action-primary" :disabled="submitDisabled" @click="submit">
        <BioNexusActionIcon :action="mode === 'create' ? 'create' : 'save'" />
        {{ saving ? 'Guardando...' : mode === 'create' ? 'Crear' : 'Guardar' }}
      </button>
    </template>
  </BioNexusDialog>
  <BioNexusConfirmDialog ref="discardDialog" />
</template>

<script setup>
import { computed, nextTick, reactive, ref } from "vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import BioNexusConfirmDialog from "@/components/ui/BioNexusConfirmDialog.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
import BioNexusFormErrors from "@/components/ui/BioNexusFormErrors.vue";
import BioNexusFormField from "@/components/ui/BioNexusFormField.vue";
import BioNexusFormLayout from "@/components/ui/BioNexusFormLayout.vue";
import BioNexusSectionPanel from "@/components/ui/BioNexusSectionPanel.vue";

const props = defineProps({ saving: Boolean, canCreate: Boolean, canUpdate: Boolean });
const emit = defineEmits(["submit"]);
const dialog = ref(null);
const discardDialog = ref(null);
const firstInput = ref(null);
const mode = ref("create");
const current = ref(null);
const originalDescription = ref("");
const errorMessage = ref("");
const attempted = ref(false);
const draft = reactive({ description: "" });

const normalizedDescription = computed(() => draft.description.trim());
const descriptionError = computed(() => attempted.value && normalizedDescription.value === "" ? "La descripción es obligatoria." : "");
const changed = computed(() => mode.value === "create" ? normalizedDescription.value !== "" : normalizedDescription.value !== originalDescription.value);
const submitDisabled = computed(() => props.saving || normalizedDescription.value === "" || normalizedDescription.value.length > 50 || !changed.value || (mode.value === "create" ? !props.canCreate : !props.canUpdate));

async function show() { dialog.value?.open(); await nextTick(); firstInput.value?.focus(); }
function openCreate() {
  mode.value = "create";
  current.value = null;
  originalDescription.value = "";
  draft.description = "";
  attempted.value = false;
  errorMessage.value = "";
  show();
}
function openEdit(record) {
  mode.value = "edit";
  current.value = record;
  originalDescription.value = String(record?.description || "").trim();
  draft.description = record?.description || "";
  attempted.value = false;
  errorMessage.value = "";
  show();
}
async function requestClose() {
  if (props.saving) return;
  if (changed.value) {
    const confirmed = await discardDialog.value?.ask({
      kicker: "Confirmación",
      title: "Descartar cambios",
      message: "Hay cambios sin guardar. ¿Deseas salir y descartarlos?",
      icon: "warning",
      variant: "danger",
      confirmIcon: "delete",
      confirmText: "Sí, salir y descartar cambios",
      cancelText: "Cancelar",
    });
    if (!confirmed) return;
  }
  dialog.value?.close();
}
function close() { dialog.value?.close(); }
function handleClosed() { attempted.value = false; errorMessage.value = ""; }
function setError(value) { errorMessage.value = String(value || ""); }
function clearError() { errorMessage.value = ""; }
function submit() {
  attempted.value = true;
  if (descriptionError.value || submitDisabled.value) return;
  emit("submit", { mode: mode.value, record: current.value, values: { description: normalizedDescription.value } });
}
defineExpose({ openCreate, openEdit, close, setError, clearError });
</script>
