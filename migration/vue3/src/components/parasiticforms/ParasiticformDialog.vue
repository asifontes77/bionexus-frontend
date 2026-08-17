<template>
  <dialog ref="dialog" class="bio-nexus-dialog parasiticform-dialog" @cancel.prevent="close">
    <form class="dialog-shell" @submit.prevent="submit">
      <header class="dialog-header">
        <div>
          <p>{{ mode === "create" ? "Nuevo registro" : "Editar registro" }}</p>
          <h3>{{ mode === "create" ? "Crear forma parasitaria" : `Editar ${current?.description || "forma parasitaria"}` }}</h3>
        </div>
        <BioNexusDialogCloseButton @click="close" />
      </header>
      <section class="dialog-body parasiticform-dialog-body">
        <BioNexusFormField
          label="Descripcion"
          field-id="parasiticform-description"
          :error="descriptionError"
          :help="draft.description.length + ' de 50 caracteres'"
          required
        >
          <input
            id="parasiticform-description"
            ref="descriptionInput"
            v-model="draft.description"
            class="bio-nexus-field"
            type="text"
            maxlength="50"
            autocomplete="off"
          />
        </BioNexusFormField>
        <div v-if="errorMessage" class="bio-nexus-message bio-nexus-message-error" role="alert">{{ errorMessage }}</div>
      </section>
      <footer class="dialog-footer">
        <button type="button" class="bio-nexus-action bio-nexus-action-secondary" :disabled="saving" @click="close">
          <BioNexusActionIcon action="cancel" /><span>Cancelar</span>
        </button>
        <button type="submit" class="bio-nexus-action bio-nexus-action-primary" :disabled="submitDisabled">
          <BioNexusActionIcon action="save" /><span>{{ saving ? "Guardando..." : mode === "create" ? "Crear" : "Guardar" }}</span>
        </button>
      </footer>
    </form>
  </dialog>
</template>
<script setup>
import { computed, nextTick, reactive, ref } from "vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import BioNexusDialogCloseButton from "@/components/ui/BioNexusDialogCloseButton.vue";
import BioNexusFormField from "@/components/ui/BioNexusFormField.vue";
const props = defineProps({ saving: { type: Boolean, default: false }, canCreate: { type: Boolean, default: false }, canUpdate: { type: Boolean, default: false } });
const emit = defineEmits(["submit"]);
const dialog = ref(null);
const descriptionInput = ref(null);
const mode = ref("create");
const current = ref(null);
const originalDescription = ref("");
const errorMessage = ref("");
const validationAttempted = ref(false);
const draft = reactive({ description: "" });
const normalizedDescription = computed(() => draft.description.trim());
const descriptionError = computed(() =>
  validationAttempted.value && normalizedDescription.value === ""
    ? "El campo Descripcion es requerido."
    : "",
);
const changed = computed(() => mode.value === "create" ? normalizedDescription.value !== "" : normalizedDescription.value !== originalDescription.value);
const submitDisabled = computed(() =>
  props.saving ||
  normalizedDescription.value.length > 50 ||
  (mode.value === "edit" && !changed.value) ||
  (mode.value === "create" ? !props.canCreate : !props.canUpdate),
);
function show() { dialog.value?.showModal(); nextTick(() => descriptionInput.value?.focus()); }
function openCreate() { mode.value = "create"; current.value = null; originalDescription.value = ""; draft.description = ""; errorMessage.value = ""; validationAttempted.value = false; show(); }
function openEdit(record) { mode.value = "edit"; current.value = record; originalDescription.value = record.description; draft.description = record.description; errorMessage.value = ""; validationAttempted.value = false; show(); }
function close() { if (dialog.value?.open) dialog.value.close(); }
function clearError() { errorMessage.value = ""; }
function setError(message) { errorMessage.value = message; }
function submit() {
  validationAttempted.value = true;
  if (descriptionError.value !== "" || submitDisabled.value) return;
  emit("submit", { mode: mode.value, record: current.value, description: normalizedDescription.value });
}
defineExpose({ openCreate, openEdit, close, clearError, setError });
</script>
<style scoped>
.parasiticform-dialog { width: min(620px, calc(100vw - 32px)); padding: 0; border: 1px solid var(--bio-nexus-color-border-strong); border-radius: var(--bio-nexus-radius-md); background: var(--bio-nexus-color-surface); color: var(--bio-nexus-color-text); box-shadow: var(--bio-nexus-shadow-md); }
.parasiticform-dialog::backdrop { background: color-mix(in srgb, var(--bio-nexus-color-sidebar-strong) 48%, transparent); backdrop-filter: blur(2px); }
.parasiticform-dialog-body { display: grid; gap: var(--bio-nexus-space-3); }
</style>
