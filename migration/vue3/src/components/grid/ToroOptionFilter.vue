<template>
  <div class="toro-option-filter">
    <div class="toro-option-filter-control">
      <select ref="select" v-model="selectedValue" class="toro-option-filter-select" aria-label="Filtrar opciones" @change="applySelection">
        <option value="">Elige uno</option>
        <option v-for="option in options" :key="option.key" :value="option.key">{{ option.label }}</option>
      </select>
      <button v-if="selectedValue !== ''" type="button" class="toro-option-filter-clear" aria-label="Limpiar filtro" title="Limpiar filtro" @click.stop="clearSelection"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg></button>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref } from "vue";

const props = defineProps({ params: { type: Object, required: true } });
const select = ref(null);
const selectedValue = ref("");
const options = computed(() => (props.params.options || []).map((option, index) => ({
  key: String(index),
  label: String(option.label),
  value: option.value,
})));

function selectedOption() { return options.value.find((option) => option.key === selectedValue.value) || null; }
function getCellValue(filterParams) {
  if (typeof props.params.getValue === "function") return props.params.getValue(filterParams.node);
  return filterParams.data?.[props.params.colDef.field];
}
function isFilterActive() { return selectedValue.value !== ""; }
function doesFilterPass(filterParams) {
  const option = selectedOption();
  if (!option) return true;
  return Object.is(getCellValue(filterParams), option.value);
}
function getModel() {
  const option = selectedOption();
  return option ? { value: option.value } : null;
}
function setModel(model) {
  const option = options.value.find((item) => Object.is(item.value, model?.value));
  selectedValue.value = option?.key || "";
}
function applySelection() {
  props.params.filterChangedCallback();
  nextTick(() => props.params.hidePopup?.());
}
function clearSelection() {
  selectedValue.value = "";
  props.params.filterChangedCallback();
  nextTick(() => props.params.hidePopup?.());
}
function afterGuiAttached() { nextTick(() => select.value?.focus()); }

defineExpose({ isFilterActive, doesFilterPass, getModel, setModel, afterGuiAttached });
</script>

<style>
/* Global by design: AG Grid mounts filter GUIs inside its popup container. */
.toro-option-filter {
  box-sizing: border-box;
  width: 176px;
  min-width: 176px;
  padding: 6px;
  background: var(--toro-color-surface);
  color: var(--toro-color-text-secondary);
  font-family: var(--toro-font-family);
}

.toro-option-filter-control {
  position: relative;
  width: 100%;
}

.toro-option-filter-control::after {
  position: absolute;
  top: 50%;
  right: 11px;
  width: 0;
  height: 0;
  border-inline: 5px solid transparent;
  border-top: 6px solid var(--toro-color-primary-strong);
  content: "";
  pointer-events: none;
  transform: translateY(-20%);
}

.toro-option-filter-select {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: 34px;
  margin: 0;
  padding: 6px 52px 6px 10px;
  appearance: none;
  border: 1px solid var(--toro-color-border-strong);
  border-radius: var(--toro-radius-md);
  background: var(--toro-color-surface);
  color: var(--toro-color-text-secondary);
  font-family: var(--toro-font-family);
  font-size: var(--toro-font-size-md);
  font-style: normal;
  font-weight: var(--toro-font-weight-regular);
  line-height: 1.2;
  cursor: pointer;
}

.toro-option-filter-select:hover {
  border-color: var(--toro-color-primary);
  background: var(--toro-color-surface-soft);
}

.toro-option-filter-select:focus {
  border-color: var(--toro-color-primary);
  box-shadow: 0 0 0 3px var(--toro-color-info-soft);
  outline: 0;
}

.toro-option-filter-select option {
  color: var(--toro-color-text-secondary);
  background: var(--toro-color-surface);
  font-family: var(--toro-font-family);
  font-size: var(--toro-font-size-md);
  font-weight: var(--toro-font-weight-regular);
}

.toro-option-filter-clear {
  position: absolute;
  top: 50%;
  right: 28px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--toro-color-text-muted);
  font-family: var(--toro-font-family);
  font-size: 0;
  font-weight: var(--toro-font-weight-medium);
  line-height: 1;
  cursor: pointer;
  transform: translateY(-50%);
}

.toro-option-filter-clear svg {
  width: 14px;
  height: 14px;
}

.toro-option-filter-clear:hover,
.toro-option-filter-clear:focus-visible {
  background: var(--toro-color-info-soft);
  color: var(--toro-color-primary-strong);
  outline: 0;
}

/* Compact the AG Grid wrappers that contain this custom filter. */
.ag-popup-child:has(.toro-option-filter),
.ag-filter:has(.toro-option-filter),
.ag-filter-wrapper:has(.toro-option-filter),
.ag-filter-body-wrapper:has(.toro-option-filter) {
  box-sizing: border-box;
  width: 190px !important;
  min-width: 190px !important;
  max-width: 190px !important;
}

.ag-filter-wrapper:has(.toro-option-filter),
.ag-filter-body-wrapper:has(.toro-option-filter) {
  gap: 0 !important;
  padding: 0 !important;
}
</style>
