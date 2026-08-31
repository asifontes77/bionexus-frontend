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
