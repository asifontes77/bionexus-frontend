<template>
  <button
    type="button"
    class="toro-grid-toggle"
    :class="{ 'is-on': value, 'is-disabled': disabled }"
    :disabled="disabled"
    :aria-pressed="value"
    :aria-label="ariaLabel"
    @click.stop="requestToggle"
    @keydown.enter.stop.prevent="requestToggle"
    @keydown.space.stop.prevent="requestToggle"
  >
    <span class="toro-grid-toggle__track" aria-hidden="true">
      <span class="toro-grid-toggle__knob"></span>
    </span>
    <span class="toro-grid-toggle__label">{{ value ? onLabel : offLabel }}</span>
  </button>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  params: { type: Object, required: true },
});

const value = computed(() => Boolean(props.params?.value));
const onLabel = computed(() => String(props.params?.onLabel ?? "Activo"));
const offLabel = computed(() => String(props.params?.offLabel ?? "Inactivo"));
const disabled = computed(() => {
  const option = props.params?.disabled;
  return typeof option === "function" ? Boolean(option(props.params?.data)) : Boolean(option);
});
const ariaLabel = computed(() => {
  const prefix = String(props.params?.ariaLabel ?? props.params?.colDef?.headerName ?? "Estado");
  return prefix + ": " + (value.value ? onLabel.value : offLabel.value);
});

function requestToggle(event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
  if (disabled.value) return;
  props.params?.onToggle?.(props.params?.data, !value.value);
}
</script>

<style>
.toro-grid-toggle {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  padding: 2px 3px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #536b7d;
  cursor: pointer;
  font: inherit;
  user-select: none;
}
.toro-grid-toggle:hover:not(:disabled) {
  background: rgb(38 120 159 / 6%);
}
.toro-grid-toggle:focus-visible {
  outline: 2px solid rgb(38 120 159 / 42%);
  outline-offset: 2px;
}
.toro-grid-toggle:disabled {
  cursor: default;
  opacity: 0.72;
}
.toro-grid-toggle__track {
  display: inline-flex;
  align-items: center;
  width: 25px;
  height: 14px;
  padding: 2px;
  border: 1px solid #b8cad7;
  border-radius: 999px;
  background: linear-gradient(180deg, #f8fbfd 0%, #eaf1f5 100%);
  box-shadow: inset 0 1px 2px rgb(27 66 94 / 10%);
  transition: border-color 150ms ease, background 150ms ease, box-shadow 150ms ease;
}
.is-on .toro-grid-toggle__track {
  border-color: #218479;
  background: linear-gradient(180deg, #3b9c90 0%, #247d73 100%);
  box-shadow: inset 0 1px 1px rgb(255 255 255 / 16%), 0 1px 2px rgb(25 95 85 / 18%);
}
.toro-grid-toggle__knob {
  width: 8px;
  height: 8px;
  border: 1px solid rgb(35 77 104 / 10%);
  border-radius: 50%;
  background: linear-gradient(180deg, #ffffff 0%, #f0f5f7 100%);
  box-shadow: 0 1px 2px rgb(15 42 61 / 22%);
  transform: translateX(0);
  transition: transform 150ms ease;
}
.is-on .toro-grid-toggle__knob {
  transform: translateX(11px);
}
.toro-grid-toggle__label {
  padding: 2px 6px;
  border: 1px solid #d6e1e8;
  border-radius: 999px;
  background: linear-gradient(180deg, #ffffff 0%, #f1f5f8 100%);
  box-shadow: 0 1px 2px rgb(15 42 61 / 7%);
  color: #536b7d;
  font-size: 0.63rem;
  font-weight: 800;
  line-height: 1.15;
  white-space: nowrap;
}
.is-on .toro-grid-toggle__label {
  border-color: #bee7db;
  background: linear-gradient(180deg, #f1fcf8 0%, #e0f5ec 100%);
  box-shadow: 0 1px 2px rgb(20 111 98 / 9%);
  color: #146f62;
}
.toro-grid-toggle-header .ag-header-cell-label {
  justify-content: center;
}
.toro-grid-toggle-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}
</style>
