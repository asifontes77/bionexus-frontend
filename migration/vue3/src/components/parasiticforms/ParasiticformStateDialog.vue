<template>
  <dialog ref="dialog" class="bio-nexus-dialog parasiticform-state-dialog" @cancel.prevent="close">
    <form class="dialog-shell" @submit.prevent="confirm">
      <header class="dialog-header">
        <div><p>Estado del registro</p><h3>{{ target?.annulled ? "Activar forma parasitaria" : "Inactivar forma parasitaria" }}</h3></div>
        <BioNexusDialogCloseButton @click="close" />
      </header>
      <section class="dialog-body parasiticform-state-body">
        <p><strong>{{ target?.description }}</strong></p>
        <p>{{ target?.annulled ? "El registro volvera a estar disponible en los flujos operativos." : "El registro permanecera visible en este catalogo, pero se ocultara en los flujos operativos." }}</p>
        <div v-if="errorMessage" class="bio-nexus-message bio-nexus-message-error" role="alert">{{ errorMessage }}</div>
      </section>
      <footer class="dialog-footer">
        <button type="button" class="bio-nexus-action bio-nexus-action-secondary" :disabled="saving" @click="close"><BioNexusActionIcon action="cancel" /><span>Cancelar</span></button>
        <button type="submit" class="bio-nexus-action bio-nexus-action-primary" :disabled="saving || !target"><BioNexusActionIcon :action="target?.annulled ? 'activate' : 'deactivate'" /><span>{{ saving ? "Guardando..." : target?.annulled ? "Activar" : "Inactivar" }}</span></button>
      </footer>
    </form>
  </dialog>
</template>
<script setup>
import { ref } from "vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import BioNexusDialogCloseButton from "@/components/ui/BioNexusDialogCloseButton.vue";
defineProps({ saving: { type: Boolean, default: false } });
const emit = defineEmits(["confirm"]);
const dialog = ref(null);
const target = ref(null);
const errorMessage = ref("");
function open(record) { target.value = record; errorMessage.value = ""; dialog.value?.showModal(); }
function close() { if (dialog.value?.open) dialog.value.close(); }
function clearError() { errorMessage.value = ""; }
function setError(message) { errorMessage.value = message; }
function confirm() { if (target.value) emit("confirm", target.value); }
defineExpose({ open, close, clearError, setError });
</script>
<style scoped>
.parasiticform-state-dialog { width: min(520px, calc(100vw - 32px)); padding: 0; border: 1px solid var(--toro-color-border-strong); border-radius: var(--toro-radius-md); background: var(--toro-color-surface); color: var(--toro-color-text); font-family: var(--toro-font-family); font-size: var(--toro-font-size-md); font-weight: var(--toro-font-weight-regular); box-shadow: var(--toro-shadow-md); }
.parasiticform-state-dialog::backdrop { background: color-mix(in srgb, var(--toro-color-sidebar-strong) 48%, transparent); backdrop-filter: blur(2px); }
.parasiticform-state-body { display: grid; gap: var(--toro-space-3); color: var(--toro-color-text-secondary); font-family: var(--toro-font-family); font-size: var(--toro-font-size-md); font-weight: var(--toro-font-weight-regular); }
.parasiticform-state-body p { margin: 0; line-height: 1.55; }
.parasiticform-state-body strong { color: var(--toro-color-text); font-weight: var(--toro-font-weight-medium); }
</style>
