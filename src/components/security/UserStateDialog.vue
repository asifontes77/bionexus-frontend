<template>
  <BioNexusDialog ref="dialog" size="compact" kicker="Estado de la cuenta" :title="target?.hidden ? 'Reactivar usuario' : 'Inactivar usuario'" @close="handleClosed">
    <section class="state-dialog-body">
      <div v-if="errorMessage" class="bio-nexus-message bio-nexus-message-error" role="alert">{{ errorMessage }}</div>
      <p>{{ target?.hidden ? `El usuario ${target?.name || "seleccionado"} recuperara el acceso efectivo segun sus roles y permisos.` : `El usuario ${target?.name || "seleccionado"} quedara visible para consulta, pero no podra iniciar operaciones.` }}</p>
      <div v-if="!target?.hidden" class="bio-nexus-message bio-nexus-message-warning" role="status">El sistema impedira inactivar al ultimo administrador visible.</div>
    </section>
    <template #footer>
      <button type="button" class="bio-nexus-action bio-nexus-action-secondary" :disabled="saving" @click="close"><BioNexusActionIcon action="cancel" />Cancelar</button>
      <button type="button" class="bio-nexus-action" :class="target?.hidden ? 'bio-nexus-action-primary' : 'bio-nexus-action-danger'" :disabled="saving || !target" @click="confirm"><BioNexusIcon :name="target?.hidden ? 'person_check' : 'person_off'" :size="19" />{{ saving ? "Guardando..." : target?.hidden ? "Reactivar" : "Inactivar" }}</button>
    </template>
  </BioNexusDialog>
</template>
<script setup>
import { ref } from "vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
import BioNexusIcon from "@/components/ui/BioNexusIcon.vue";
const props = defineProps({ saving: { type: Boolean, default: false } });
const emit = defineEmits(["confirm"]);
const dialog = ref(null);
const target = ref(null);
const errorMessage = ref("");
function open(user) { target.value = user; errorMessage.value = ""; dialog.value?.open(); }
function close() { dialog.value?.close(); }
function handleClosed() { if (!props.saving) { target.value = null; errorMessage.value = ""; } }
function setError(message) { errorMessage.value = String(message || ""); }
function confirm() { if (target.value && !props.saving) emit("confirm", target.value); }
defineExpose({ open, close, setError });
</script>
<style scoped>
.state-dialog-body { display: grid; gap: var(--bio-nexus-space-3); }
.state-dialog-body > p { margin: 0; color: var(--bio-nexus-color-text-secondary); line-height: 1.55; }
</style>
