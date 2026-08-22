<template>
  <BioNexusDialog ref="dialog" size="standard" :kicker="mode === 'create' ? 'Nuevo registro' : 'Editar registro'" :title="mode === 'create' ? 'Crear grupo de exámenes' : 'Editar grupo de exámenes'" @close="handleClosed">
    <section class="exam-group-body">
      <BioNexusFormField label="Descripción" field-id="exam-group-description" :error="descriptionError" :help="draft.description.length + ' de 150 caracteres'" required>
        <input id="exam-group-description" ref="firstInput" v-model="draft.description" class="bio-nexus-field" maxlength="150" autocomplete="off" />
      </BioNexusFormField>
      <label class="exam-check"><input v-model="draft.its_exam" type="checkbox" /><span>Es análisis clínico</span></label>
      <div v-if="errorMessage" class="bio-nexus-message bio-nexus-message-error" role="alert">{{ errorMessage }}</div>
    </section>
    <template #footer>
      <button type="button" class="bio-nexus-action bio-nexus-action-secondary" :disabled="saving" @click="close"><BioNexusActionIcon action="cancel" />Cancelar</button>
      <button type="button" class="bio-nexus-action bio-nexus-action-primary" :disabled="submitDisabled" @click="submit"><BioNexusActionIcon action="save" />{{ saving ? "Guardando..." : mode === "create" ? "Crear" : "Guardar" }}</button>
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
const dialog = ref(null), firstInput = ref(null), mode = ref("create"), current = ref(null), errorMessage = ref(""), attempted = ref(false), original = ref("");
const draft = reactive({ description: "", its_exam: true });
const values = computed(() => ({ description: draft.description.trim(), its_exam: Boolean(draft.its_exam) }));
const signature = computed(() => JSON.stringify(values.value));
const descriptionError = computed(() => attempted.value && values.value.description === "" ? "La descripción es obligatoria." : "");
const submitDisabled = computed(() => props.saving || signature.value === original.value || (mode.value === "create" ? !props.canCreate : !props.canUpdate));

async function show() { await dialog.value?.open(); nextTick(() => firstInput.value?.focus()); }
function assign(row) { draft.description = row?.description || ""; draft.its_exam = row?.its_exam ?? true; original.value = JSON.stringify(values.value); }
function openCreate() { mode.value = "create"; current.value = null; assign(null); original.value = ""; attempted.value = false; errorMessage.value = ""; show(); }
function openEdit(row) { mode.value = "edit"; current.value = row; assign(row); attempted.value = false; errorMessage.value = ""; show(); }
function close() { dialog.value?.close(); }
function handleClosed() { attempted.value = false; }
function clearError() { errorMessage.value = ""; }
function setError(message) { errorMessage.value = String(message || ""); }
function submit() { attempted.value = true; if (descriptionError.value || submitDisabled.value) return; emit("submit", { mode: mode.value, record: current.value, values: values.value }); }
defineExpose({ openCreate, openEdit, close, clearError, setError });
</script>

<style scoped>
.exam-group-body { display: grid; gap: var(--bio-nexus-space-3); }
.exam-check { display: flex; align-items: center; gap: var(--bio-nexus-space-2); }
.exam-check input { width: 16px; height: 16px; accent-color: var(--bio-nexus-color-primary); }
</style>
