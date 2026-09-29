<template>
  <BioNexusDialog
    ref="dialog"
    size="standard"
    :kicker="mode === 'create' ? 'Nuevo registro' : 'Editar registro'"
    :title="mode === 'create' ? 'Crear germen' : 'Editar germen'"
    :prevent-close="saving || dirty"
    @before-close="requestClose"
    @close="reset"
  >
    <BioNexusFormLayout>
      <BioNexusFormErrors :errors="errorMessage" />

            <BioNexusSectionPanel
        title="Información del germen"
        icon="microbiology"
        description="Define el nombre que identifica al microorganismo."
        variant="accent"
      >
        <BioNexusFormField
          label="Nombre"
          field-id="germ-name"
          :error="nameError"
          :help="draft.germen.length+' de 50 caracteres'"
          required
        >
          <input
            id="germ-name"
            ref="firstInput"
            v-model="draft.germen"
            class="bio-nexus-field"
            maxlength="50"
            autocomplete="off"
            @input="syncDirty"
          >
        </BioNexusFormField>
      </BioNexusSectionPanel>
    </BioNexusFormLayout>

    <template #footer>
      <button
        type="button"
        class="bio-nexus-action bio-nexus-action-secondary"
        :disabled="saving"
        @click="requestClose"
      >
        <BioNexusActionIcon action="cancel" />
        Cancelar
      </button>
      <button
        type="button"
        class="bio-nexus-action bio-nexus-action-primary"
        :disabled="submitDisabled"
        @click="submit"
      >
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
const errorMessage = ref("");
const attempted = ref(false);
const original = ref("");
const dirty = ref(false);
const initializing = ref(false);
const draft = reactive({ germen: "" });

const value = computed(() => draft.germen.trim());
const nameError = computed(() => attempted.value && !value.value ? "El nombre es obligatorio." : "");
const submitDisabled = computed(() => initializing.value || props.saving || (mode.value === "create" ? (!props.canCreate || !value.value) : (!props.canUpdate || !dirty.value)));

function signature() { return value.value; }
function syncDirty() { dirty.value = !initializing.value && signature() !== original.value; }
async function show() {
  dialog.value?.open();
  await nextTick();
  original.value = signature();
  dirty.value = false;
  initializing.value = false;
  firstInput.value?.focus();
}
async function openCreate() {
  initializing.value = true;
  mode.value = "create";
  current.value = null;
  draft.germen = "";
  attempted.value = false;
  errorMessage.value = "";
  await show();
}
async function openEdit(row) {
  initializing.value = true;
  mode.value = "edit";
  current.value = row;
  draft.germen = row?.germen || "";
  attempted.value = false;
  errorMessage.value = "";
  await show();
}
function submit() {
  attempted.value = true;
  if (nameError.value || submitDisabled.value) return;
  emit("submit", { mode: mode.value, record: current.value, values: { germen: value.value } });
}
async function requestClose() {
  if (props.saving) return;
  if (dirty.value) {
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
function reset() { attempted.value = false; dirty.value = false; }
function setError(value) { errorMessage.value = String(value || ""); }
function clearError() { errorMessage.value = ""; }

defineExpose({ openCreate, openEdit, close, setError, clearError });
</script>
