<template>
  <BioNexusDialog ref="dialog" size="standard" dialog-class="role-create-dialog" kicker="Nuevo registro" title="Crear rol" @close="handleClosed">
    <form id="role-create-form" class="role-dialog-form" novalidate @submit.prevent="emit('submit')">
      <BioNexusSectionPanel title="Información del rol" icon="admin_panel_settings" description="Define el nombre y la descripción que identifican el rol." variant="accent" class="dialog-field-wide">
      <div v-if="createRoleError" class="dialog-field-wide bio-nexus-inline-message bio-nexus-message-error" role="alert">{{ createRoleError }}</div>
      <div v-if="createRoleMessage" class="dialog-field-wide bio-nexus-inline-message bio-nexus-message-success" role="status">{{ createRoleMessage }}</div>

      <BioNexusFormField label="Nombre" field-id="create-role-name" :help="`${createRoleForm.name.length} de 100 caracteres`" :error="createRoleNameError" required wide>
        <input id="create-role-name" v-model.trim="createRoleForm.name" class="bio-nexus-field" type="text" maxlength="100" autocomplete="off" placeholder="Nombre visible del rol" :disabled="creatingRole" :aria-invalid="createRoleNameError ? 'true' : undefined" :aria-describedby="createRoleNameError ? 'create-role-name-error' : 'create-role-name-help'" required />
      </BioNexusFormField>

      <BioNexusFormField label="Descripción" field-id="create-role-description" :help="`${createRoleForm.description.length} de 250 caracteres`" wide>
        <textarea id="create-role-description" v-model="createRoleForm.description" class="bio-nexus-field" maxlength="250" rows="4" placeholder="Descripción opcional" :disabled="creatingRole" aria-describedby="create-role-description-help"></textarea>
      </BioNexusFormField>
      </BioNexusSectionPanel>
    </form>

    <template #footer>
      <BioNexusActionButton type="button" variant="secondary" icon="cancel" :disabled="creatingRole" @click="close">Cancelar</BioNexusActionButton>
      <BioNexusActionButton type="submit" form="role-create-form" variant="primary" icon="create" :loading="creatingRole" :disabled="!canCreateRoles || !createRoleForm.name.trim() || Boolean(createRoleNameError)">{{ creatingRole ? "Creando..." : "Crear rol" }}</BioNexusActionButton>
    </template>
  </BioNexusDialog>
</template>

<script setup>
import { ref } from "vue";
import BioNexusActionButton from "@/components/ui/BioNexusActionButton.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
import BioNexusFormField from "@/components/ui/BioNexusFormField.vue";
import BioNexusSectionPanel from "@/components/ui/BioNexusSectionPanel.vue";

const props = defineProps({ creatingRole: Boolean, canCreateRoles: Boolean, createRoleForm: { type: Object, required: true }, createRoleNameError: String, createRoleError: String, createRoleMessage: String });
const emit = defineEmits(["close", "submit"]);
const dialog = ref(null);
function showModal() { dialog.value?.open(); }
function close() { dialog.value?.close(); }
function focus(options) { dialog.value?.element?.focus(options); }
function handleClosed() { emit("close"); }
defineExpose({ showModal, close, focus });
</script>

<style scoped>
.role-dialog-form { display: grid; grid-template-columns: 1fr; align-content: start; gap: var(--bio-nexus-space-3); }
.dialog-field-wide { grid-column: 1 / -1; }
</style>

<style>
dialog.bio-nexus-dialog.role-create-dialog { width: min(680px, calc(100vw - 32px)) !important; height: auto !important; max-height: calc(100dvh - 48px) !important; }
@media (max-width: 720px) { dialog.bio-nexus-dialog.role-create-dialog { width: calc(100vw - 16px) !important; } }
</style>
