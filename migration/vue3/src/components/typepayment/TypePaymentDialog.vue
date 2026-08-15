<template>
  <dialog ref="dialog" class="toro-dialog type-payment-dialog" @cancel.prevent="close">
    <form class="dialog-shell" @submit.prevent="submit">
      <header class="dialog-header">
        <div><p>{{ mode === "create" ? "Nuevo registro" : "Editar registro" }}</p><h3>{{ mode === "create" ? "Crear tipo de pago" : "Editar tipo de pago" }}</h3></div>
        <ToroDialogCloseButton @click="close" />
      </header>
      <section class="dialog-body type-payment-dialog-body">
        <label class="toro-field-group"><span class="toro-field-label">Descripcion</span><input ref="firstInput" v-model="draft.description" class="toro-field" maxlength="50" /></label>
        <label class="toro-field-group"><span class="toro-field-label">Descripcion auxiliar 1</span><input v-model="draft.description_1" class="toro-field" maxlength="50" /></label>
        <label class="toro-field-group"><span class="toro-field-label">Descripcion auxiliar 2</span><input v-model="draft.description_2" class="toro-field" maxlength="50" /></label>
        <label class="type-payment-check"><input v-model="draft.only_dollars" type="checkbox" /><span>Disponible solo para pagos en dolares</span></label>
        <div v-if="errorMessage" class="toro-message toro-message-error" role="alert">{{ errorMessage }}</div>
      </section>
      <footer class="dialog-footer">
        <button type="button" class="toro-action toro-action-secondary" :disabled="saving" @click="close"><ToroActionIcon action="cancel" /><span>Cancelar</span></button>
        <button type="submit" class="toro-action toro-action-primary" :disabled="submitDisabled"><ToroActionIcon action="save" /><span>{{ saving ? "Guardando..." : mode === "create" ? "Crear" : "Guardar" }}</span></button>
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
const dialog = ref(null); const firstInput = ref(null); const mode = ref("create"); const current = ref(null); const errorMessage = ref("");
const draft = reactive({ description: "", description_1: "", description_2: "", only_dollars: false });
const original = ref("");
const values = computed(() => ({ description: draft.description.trim(), description_1: draft.description_1.trim(), description_2: draft.description_2.trim(), only_dollars: Boolean(draft.only_dollars) }));
const signature = computed(() => JSON.stringify(values.value));
const submitDisabled = computed(() => props.saving || values.value.description === "" || signature.value === original.value || (mode.value === "create" ? !props.canCreate : !props.canUpdate));
function show() { dialog.value?.showModal(); nextTick(() => firstInput.value?.focus()); }
function assign(row) { draft.description = row?.description || ""; draft.description_1 = row?.description_1 || ""; draft.description_2 = row?.description_2 || ""; draft.only_dollars = Boolean(row?.only_dollars); original.value = JSON.stringify(values.value); }
function openCreate() { mode.value = "create"; current.value = null; assign(null); original.value = ""; errorMessage.value = ""; show(); }
function openEdit(row) { mode.value = "edit"; current.value = row; assign(row); errorMessage.value = ""; show(); }
function close() { if (dialog.value?.open) dialog.value.close(); }
function clearError() { errorMessage.value = ""; }
function setError(message) { errorMessage.value = message; }
function submit() { if (!submitDisabled.value) emit("submit", { mode: mode.value, record: current.value, values: values.value }); }
defineExpose({ openCreate, openEdit, close, clearError, setError });
</script>
<style scoped>
.type-payment-dialog { width: min(680px, calc(100vw - 32px)); padding: 0; border: 1px solid var(--toro-color-border-strong); border-radius: var(--toro-radius-md); background: var(--toro-color-surface); color: var(--toro-color-text); box-shadow: var(--toro-shadow-md); }
.type-payment-dialog::backdrop { background: rgb(13 36 58 / 48%); backdrop-filter: blur(2px); }
.type-payment-dialog-body { display: grid; gap: var(--toro-space-3); }
.type-payment-check { display: flex; align-items: center; gap: var(--toro-space-2); }
</style>
