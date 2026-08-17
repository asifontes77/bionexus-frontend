<template>
  <button
    type="button"
    class="dialog-close bio-nexus-dialog-close-button"
    aria-label="Cerrar"
    title="Cerrar"
    @mousedown.prevent.stop
    @click.stop="$emit('click')"
  >
    <BioNexusIcon name="close" :size="20" :weight="500" />
  </button>
</template>

<script setup>
import BioNexusIcon from "@/components/ui/BioNexusIcon.vue";

defineEmits(["click"]);
</script>

<style scoped>
.bio-nexus-dialog-close-button {
  appearance: none;
}
</style>
