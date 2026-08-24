<template>
  <BioNexusDialog ref="dialog" size="standard" dialog-class="role-create-dialog" kicker="Nuevo registro" title="Crear rol" @close="handleClosed">
    <form id="role-create-form" class="role-dialog-form" novalidate @submit.prevent="emit('submit')">
      <BioNexusFormField label="Codigo" field-id="create-role-code" :error="createRoleCodeError" help="Letras minusculas, numeros, puntos, guiones y guiones bajos." required><input id="create-role-code" v-model.trim="createRoleForm.code" class="bio-nexus-field" type="text" maxlength="60" autocomplete="off" placeholder="Ejemplo: supervisor" :disabled="creatingRole" :aria-invalid="createRoleCodeError ? 'true' : undefined" required /></BioNexusFormField>
      <BioNexusFormField label="Nombre" field-id="create-role-name" :error="createRoleNameError" required><input id="create-role-name" v-model.trim="createRoleForm.name" class="bio-nexus-field" type="text" maxlength="100" autocomplete="off" placeholder="Nombre visible del rol" :disabled="creatingRole" :aria-invalid="createRoleNameError ? 'true' : undefined" required /></BioNexusFormField>
      <BioNexusFormField class="dialog-field-wide" label="Descripcion" field-id="create-role-description" :help="`${createRoleForm.description.length} de 250 caracteres`" wide><textarea id="create-role-description" v-model="createRoleForm.description" class="bio-nexus-field" maxlength="250" rows="4" placeholder="Descripcion opcional" :disabled="creatingRole"></textarea></BioNexusFormField>
      <div v-if="createRoleError" class="dialog-field-wide bio-nexus-inline-message bio-nexus-message-error" role="alert">{{ createRoleError }}</div>
      <div v-if="createRoleMessage" class="dialog-field-wide bio-nexus-inline-message bio-nexus-message-success" role="status">{{ createRoleMessage }}</div>
    </form>
    <template #footer>
      <button type="button" class="bio-nexus-action bio-nexus-action-secondary" :disabled="creatingRole" @click="close"><BioNexusActionIcon action="cancel" />Cancelar</button>
      <button type="submit" form="role-create-form" class="bio-nexus-action bio-nexus-action-primary" :disabled="creatingRole || !canCreateRoles"><BioNexusActionIcon action="create" />{{ creatingRole ? "Creando..." : "Crear rol" }}</button>
    </template>
  </BioNexusDialog>
</template>
<script setup>
import { ref } from "vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
import BioNexusFormField from "@/components/ui/BioNexusFormField.vue";
const props = defineProps({ creatingRole: Boolean, canCreateRoles: Boolean, createRoleForm: { type: Object, required: true }, createRoleCodeError: String, createRoleNameError: String, createRoleError: String, createRoleMessage: String });
const emit = defineEmits(["close", "submit"]);
const dialog = ref(null);
function showModal() { dialog.value?.open(); }
function close() { dialog.value?.close(); }
function focus(options) { dialog.value?.element?.focus(options); }
function handleClosed() { emit("close"); }
defineExpose({ showModal, close, focus });
</script>
<style scoped>
.role-dialog-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--bio-nexus-space-3); }
.dialog-field-wide { grid-column: 1 / -1; }
@media (max-width: 720px) { .role-dialog-form { grid-template-columns: 1fr; } .dialog-field-wide { grid-column: auto; } }
</style>
<style>
dialog.bio-nexus-dialog.role-create-dialog { width: min(680px, calc(100vw - 32px)) !important; height: auto !important; max-height: calc(100dvh - 48px) !important; }
@media (max-width: 720px) { dialog.bio-nexus-dialog.role-create-dialog { width: calc(100vw - 16px) !important; } }
</style>
