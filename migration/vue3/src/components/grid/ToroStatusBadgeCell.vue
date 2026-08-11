<template>
  <div class="toro-status-cell">
    <span
      class="toro-badge toro-status-badge"
      :class="{
        'toro-badge-warning': !isActive,
      }"
    >
      {{ isActive ? "Activo" : "Inactivo" }}
    </span>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  params: {
    type: Object,
    required: true,
  },
});

const isActive = computed(
  () => props.params?.data?.isActive === true,
);
</script>

<style scoped>
.toro-status-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-width: 0;
  min-height: 100%;
  padding-inline: 8px;
  box-sizing: border-box;
}

.toro-status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: min(100%, 106px);
  min-width: 76px;
  min-height: 28px;
  margin-inline: 2px;
  padding-inline: 12px;
  line-height: 1;
  white-space: nowrap;
}</style>
