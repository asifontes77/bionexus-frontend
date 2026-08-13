<template>
  <span
    class="material-symbols-rounded toro-icon"
    :style="iconStyle"
    aria-hidden="true"
    focusable="false"
  >{{ name }}</span>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 20 },
  filled: { type: Boolean, default: false },
  weight: { type: Number, default: 500 },
});

const iconStyle = computed(() => ({
  fontSize: typeof props.size === "number" ? String(props.size) + "px" : props.size,
  fontVariationSettings: "'FILL' " + (props.filled ? 1 : 0) + ", 'wght' " + props.weight + ", 'GRAD' 0, 'opsz' 24",
}));
</script>

<style scoped>
.toro-icon {
  display: inline-block;
  flex: 0 0 auto;
  width: 1em;
  min-width: 1em;
  height: 1em;
  overflow: hidden;
  color: currentColor;
  font-family: "Material Symbols Rounded Variable" !important;
  font-style: normal !important;
  font-weight: normal !important;
  font-feature-settings: "liga" 1 !important;
  letter-spacing: normal !important;
  line-height: 1 !important;
  text-align: center;
  text-rendering: optimizeLegibility;
  text-transform: none !important;
  white-space: nowrap;
  direction: ltr;
  -webkit-font-feature-settings: "liga" 1 !important;
  -webkit-font-smoothing: antialiased;
}
</style>
