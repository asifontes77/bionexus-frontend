<template>
    <BioNexusDialog ref="dialog" size="compact" kicker="Estado del rol" :title="target?.isActive ? 'Inactivar rol' : 'Activar rol'" @close="handleClosed">
    <section class="role-state-body">
        <div class="bio-nexus-message bio-nexus-message-warning" role="status">
          {{ target?.isActive
            ? "El rol quedara inactivo y no podra asignarse a nuevos usuarios."
            : "El rol volvera a estar disponible para las asignaciones permitidas." }}
        </div>
        <p v-if="errorMessage" class="bio-nexus-message bio-nexus-message-danger" role="alert">{{ errorMessage }}</p>
          </section>
    <template #footer>
        <button type="button" class="bio-nexus-action bio-nexus-action-secondary" :disabled="saving" @click="close">
          <BioNexusActionIcon action="cancel" />
          <span>Cancelar</span>
        </button>
        <button type="submit" class="bio-nexus-action" :class="target?.isActive ? 'bio-nexus-action-danger' : 'bio-nexus-action-primary'" :disabled="saving || !target">
          <BioNexusActionIcon :action="target?.isActive ? 'deactivate' : 'activate'" />
          <span>{{ saving ? "Guardando..." : target?.isActive ? "Inactivar" : "Activar" }}</span>
        </button>
          </template>
  </BioNexusDialog>
</template>

<script setup>
import { ref } from "vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";

const props = defineProps({ saving: { type: Boolean, default: false } });
const emit = defineEmits(["confirm"]);
const dialog = ref(null);
const target = ref(null);
const errorMessage = ref("");

function open(role) { target.value = role; errorMessage.value = ""; dialog.value?.open(); }
function close() { dialog.value?.close(); }
function handleClosed() { target.value = null; errorMessage.value = ""; }
function setError(message) { errorMessage.value = String(message ?? ""); }
function clearError() { errorMessage.value = ""; }
function confirm() { if (target.value && !props.saving) emit("confirm", target.value); }

defineExpose({ open, close, setError, clearError });
</script>

<style scoped>
.role-state-body {
  color: var(--bio-nexus-color-text-secondary);
  font-family: var(--bio-nexus-font-family);
  font-size: var(--bio-nexus-font-size-md);
  font-weight: var(--bio-nexus-font-weight-regular);
}
</style>
