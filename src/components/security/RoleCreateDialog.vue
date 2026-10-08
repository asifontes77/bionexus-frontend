<template>
  <BioNexusDialog ref="dialog" size="standard" dialog-class="role-create-dialog" shell-class="role-create-shell" body-class="role-create-dialog-body" kicker="Nuevo registro" title="Crear rol" :prevent-close="creatingRole || hasChanges" @before-close="requestClose" @close="handleClosed">
    <form id="role-create-form" class="role-dialog-form" novalidate @submit.prevent="emit('submit')">
            <BioNexusFormErrors :errors="createRoleError" />
      <div v-if="createRoleMessage" class="dialog-field-wide bio-nexus-inline-message bio-nexus-message-success" role="status">{{ createRoleMessage }}</div>
      <BioNexusSectionPanel class="role-information-section dialog-field-wide" title="Información del rol" icon="admin_panel_settings" description="Define el nombre y la descripción que identifican el rol." variant="accent">



      <BioNexusFormField label="Nombre" field-id="create-role-name" :help="`${createRoleForm.name.length} de 100 caracteres`" :error="createRoleNameError" required wide>
        <input id="create-role-name" v-model.trim="createRoleForm.name" class="bio-nexus-field" type="text" maxlength="100" autocomplete="off" placeholder="Nombre visible del rol" :disabled="creatingRole" :aria-invalid="createRoleNameError ? 'true' : undefined" :aria-describedby="createRoleNameError ? 'create-role-name-error' : 'create-role-name-help'" required />
      </BioNexusFormField>

      <BioNexusFormField label="Descripción" field-id="create-role-description" :help="`${createRoleForm.description.length} de 250 caracteres`" wide>
        <textarea id="create-role-description" v-model="createRoleForm.description" class="bio-nexus-field" maxlength="250" rows="4" placeholder="Descripción opcional" :disabled="creatingRole" aria-describedby="create-role-description-help"></textarea>
      </BioNexusFormField>
      </BioNexusSectionPanel>
    </form>

    <template #footer>
      <BioNexusActionButton type="button" variant="secondary" icon="cancel" :disabled="creatingRole" @click="requestClose">Cancelar</BioNexusActionButton>
      <BioNexusActionButton type="submit" form="role-create-form" variant="primary" icon="create" :loading="creatingRole" :disabled="!canCreateRoles || !createRoleForm.name.trim() || Boolean(createRoleNameError)">{{ creatingRole ? "Creando..." : "Crear rol" }}</BioNexusActionButton>
    </template>
  </BioNexusDialog>
  <BioNexusConfirmDialog ref="discardDialog" />
</template>

<script setup>
import { computed, ref } from "vue";
import BioNexusActionButton from "@/components/ui/BioNexusActionButton.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
import BioNexusConfirmDialog from "@/components/ui/BioNexusConfirmDialog.vue";
import BioNexusFormErrors from "@/components/ui/BioNexusFormErrors.vue";
import BioNexusFormField from "@/components/ui/BioNexusFormField.vue";
import BioNexusSectionPanel from "@/components/ui/BioNexusSectionPanel.vue";

const props = defineProps({ creatingRole: Boolean, canCreateRoles: Boolean, createRoleForm: { type: Object, required: true }, createRoleNameError: String, createRoleError: String, createRoleMessage: String });
const emit = defineEmits(["close", "submit"]);
const dialog = ref(null);
const discardDialog = ref(null);
const hasChanges = computed(() => props.createRoleForm.name.trim() !== "" || props.createRoleForm.description.trim() !== "");
function showModal() { dialog.value?.open(); }
function close() { dialog.value?.close(); }
async function requestClose() {
  if (props.creatingRole) return;
  if (hasChanges.value) {
    const accepted = await discardDialog.value?.ask({ kicker: "Confirmacion", title: "Descartar cambios", message: "Hay cambios sin guardar. ¿Deseas salir y descartarlos?", icon: "warning", variant: "danger", confirmIcon: "delete", confirmText: "Si, salir y descartar cambios", cancelText: "Continuar editando" });
    if (!accepted) return;
  }
  dialog.value?.close();
}
function focus(options) { dialog.value?.element?.focus(options); }
function handleClosed() { emit("close"); }
defineExpose({ showModal, close, focus });
</script>

<style scoped>
.role-dialog-form { display: grid; grid-template-columns: 1fr; align-content: start; gap: var(--bio-nexus-space-5); min-width: 0; }
.dialog-field-wide { grid-column: 1 / -1; }
.role-information-section { min-width: 0; }
.role-information-section :deep(.bio-nexus-section-panel-body) { display: grid; align-content: start; gap: var(--bio-nexus-space-6); min-width: 0; }
</style>

<style>
dialog.bio-nexus-dialog.role-create-dialog { width: min(680px, calc(100vw - 32px)) !important; height: auto !important; max-height: calc(100dvh - 48px) !important; }
dialog.bio-nexus-dialog.role-create-dialog > .role-create-shell { height: auto !important; max-height: calc(100dvh - 48px) !important; }
dialog.bio-nexus-dialog.role-create-dialog > .role-create-shell > .role-create-dialog-body { flex: 0 1 auto !important; min-height: 0; overflow-x: hidden !important; overflow-y: auto !important; overscroll-behavior: contain; scrollbar-gutter: stable; }
@media (max-width: 720px) { dialog.bio-nexus-dialog.role-create-dialog { width: calc(100vw - 16px) !important; } }
</style>
