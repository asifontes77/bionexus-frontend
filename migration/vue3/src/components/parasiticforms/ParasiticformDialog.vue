<template>
  <dialog ref="dialog" class="toro-dialog parasiticform-dialog" @cancel.prevent="close">
    <form class="dialog-shell" @submit.prevent="submit">
      <header class="dialog-header">
        <div>
          <p>{{ mode === "create" ? "Nuevo registro" : "Editar registro" }}</p>
          <h3>{{ mode === "create" ? "Crear forma parasitaria" : `Editar ${current?.description || "forma parasitaria"}` }}</h3>
        </div>
        <ToroDialogCloseButton @click="close" />
      </header>
      <section class="dialog-body parasiticform-dialog-body">
        <label class="toro-field-group">
          <span class="toro-field-label">Descripcion</span>
          <input ref="descriptionInput" v-model="draft.description" class="toro-field" type="text" maxlength="50" autocomplete="off" />
          <small class="toro-field-help">{{ draft.description.length }} de 50 caracteres</small>
        </label>
        <div v-if="errorMessage" class="toro-message toro-message-error" role="alert">{{ errorMessage }}</div>
      </section>
      <footer class="dialog-footer">
        <button type="button" class="toro-action toro-action-secondary" :disabled="saving" @click="close">
          <ToroActionIcon action="cancel" /><span>Cancelar</span>
        </button>
        <button type="submit" class="toro-action toro-action-primary" :disabled="submitDisabled">
          <ToroActionIcon action="save" /><span>{{ saving ? "Guardando..." : mode === "create" ? "Crear" : "Guardar" }}</span>
        </button>
      </footer>
    </form>
  </dialog>
</template>
<script setup>
import { computed, nextTick, reactive, ref } from "vue";
import ToroActionIcon from "@/components/ui/ToroActionIcon.vue";
import ToroDialogCloseButton from "@/components/ui/ToroDialogCloseButton.vue";
const props = defineProps({ saving: { type: Boolean, default: false }, canCreate: { type: Boolean, default: false }, canUpdate: { type: Boolean, default: false } });
const emit = defineEmits(["submit"]);
const dialog = ref(null);
const descriptionInput = ref(null);
const mode = ref("create");
const current = ref(null);
const originalDescription = ref("");
const errorMessage = ref("");
const draft = reactive({ description: "" });
const normalizedDescription = computed(() => draft.description.trim());
const changed = computed(() => mode.value === "create" ? normalizedDescription.value !== "" : normalizedDescription.value !== originalDescription.value);
const submitDisabled = computed(() => props.saving || normalizedDescription.value === "" || normalizedDescription.value.length > 50 || !changed.value || (mode.value === "create" ? !props.canCreate : !props.canUpdate));
function show() { dialog.value?.showModal(); nextTick(() => descriptionInput.value?.focus()); }
function openCreate() { mode.value = "create"; current.value = null; originalDescription.value = ""; draft.description = ""; errorMessage.value = ""; show(); }
function openEdit(record) { mode.value = "edit"; current.value = record; originalDescription.value = record.description; draft.description = record.description; errorMessage.value = ""; show(); }
function close() { if (dialog.value?.open) dialog.value.close(); }
function clearError() { errorMessage.value = ""; }
function setError(message) { errorMessage.value = message; }
function submit() { if (submitDisabled.value) return; emit("submit", { mode: mode.value, record: current.value, description: normalizedDescription.value }); }
defineExpose({ openCreate, openEdit, close, clearError, setError });
</script>
<style scoped>
.parasiticform-dialog { width: min(620px, calc(100vw - 32px)); padding: 0; border: 1px solid var(--toro-color-border-strong); border-radius: var(--toro-radius-md); background: var(--toro-color-surface); color: var(--toro-color-text); box-shadow: var(--toro-shadow-md); }
.parasiticform-dialog::backdrop { background: color-mix(in srgb, var(--toro-color-sidebar-strong) 48%, transparent); backdrop-filter: blur(2px); }
.parasiticform-dialog-body { display: grid; gap: var(--toro-space-3); }
</style>
