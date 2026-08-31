<template>
  <button type="button" class="results-email-row-action" :title="title" :aria-label="title" :disabled="disabled" @click.stop="send">
    <BioNexusActionIcon action="send" :size="18" />
  </button>
</template>
<script setup>
import { computed } from "vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
const props = defineProps({ params: { type: Object, required: true } });
const disabled = computed(() => !props.params?.context?.canSend?.() || props.params?.context?.isBusy?.() || Boolean(props.params?.data?.email_status));
const title = computed(() => props.params?.data?.email_status ? "Resultados enviados" : "Enviar resultados por correo");
function send() { if (!disabled.value) props.params?.context?.prepareSingleSend?.(props.params.data); }
</script>
<style scoped>
.results-email-row-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin: 0 auto;
  padding: 0;
  border: 1px solid var(--bio-nexus-color-border-strong);
  border-radius: var(--bio-nexus-radius-sm);
  background: var(--bio-nexus-color-surface);
  color: var(--bio-nexus-color-primary-strong);
  cursor: pointer;
  transition: border-color 140ms ease, background-color 140ms ease, color 140ms ease;
}
.results-email-row-action:not(:disabled):hover,
.results-email-row-action:not(:disabled):focus-visible {
  border-color: var(--bio-nexus-color-primary);
  background: var(--bio-nexus-color-info-soft);
  color: var(--bio-nexus-color-primary);
  outline: none;
}
.results-email-row-action:focus-visible {
  box-shadow: 0 0 0 3px var(--bio-nexus-color-info-soft);
}
.results-email-row-action:disabled {
  border-color: var(--bio-nexus-color-border);
  background: var(--bio-nexus-color-surface-soft);
  color: var(--bio-nexus-color-text-muted);
  cursor: not-allowed;
  opacity: 0.58;
}
</style>
