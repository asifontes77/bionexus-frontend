<template>
  <button
    type="button"
    class="dialog-close toro-dialog-close-button"
    aria-label="Cerrar"
    title="Cerrar"
    @mousedown.prevent.stop
    @click.stop="$emit('click')"
  >
    <ToroIcon name="close" :size="20" :weight="500" />
  </button>
</template>

<script setup>
import ToroIcon from "@/components/ui/ToroIcon.vue";

defineEmits(["click"]);
</script>

<style scoped>
.toro-dialog-close-button {
  appearance: none;
}
</style>
