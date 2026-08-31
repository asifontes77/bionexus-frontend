<template>
  <div class="patient-email-status-cell"><span class="bio-nexus-badge" :class="sent ? 'bio-nexus-badge-success' : 'bio-nexus-badge-warning'">{{ sent ? "Enviado" : "Pendiente" }}</span></div>
</template>
<script setup>
import { computed } from "vue";
const props = defineProps({ params: { type: Object, required: true } });
const sent = computed(() => Boolean(props.params?.value));
</script>
<style scoped>.patient-email-status-cell{display:flex;align-items:center;justify-content:center;width:100%;min-height:100%}.patient-email-status-cell .bio-nexus-badge{min-width:88px;justify-content:center}</style>
