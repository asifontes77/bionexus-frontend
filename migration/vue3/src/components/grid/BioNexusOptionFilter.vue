<template>
  <div class="bio-nexus-option-filter">
    <div class="bio-nexus-option-filter-control">
      <select ref="select" v-model="selectedValue" class="bio-nexus-option-filter-select" aria-label="Filtrar opciones" @change="applySelection">
        <option value="">Elige uno</option>
        <option v-for="option in options" :key="option.key" :value="option.key">{{ option.label }}</option>
      </select>
      <button v-if="selectedValue !== ''" type="button" class="bio-nexus-option-filter-clear" aria-label="Limpiar filtro" title="Limpiar filtro" @click.stop="clearSelection"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg></button>
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
.bio-nexus-option-filter {
  box-sizing: border-box;
  width: 176px;
  min-width: 176px;
  padding: 6px;
  background: var(--bio-nexus-color-surface);
  color: var(--bio-nexus-color-text-secondary);
  font-family: var(--bio-nexus-font-family);
}

.bio-nexus-option-filter-control {
  position: relative;
  width: 100%;
}

.bio-nexus-option-filter-control::after {
  position: absolute;
  top: 50%;
  right: 11px;
  width: 0;
  height: 0;
  border-inline: 5px solid transparent;
  border-top: 6px solid var(--bio-nexus-color-primary-strong);
  content: "";
  pointer-events: none;
  transform: translateY(-20%);
}

.bio-nexus-option-filter-select {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: 34px;
  margin: 0;
  padding: 6px 52px 6px 10px;
  appearance: none;
  border: 1px solid var(--bio-nexus-color-border-strong);
  border-radius: var(--bio-nexus-radius-md);
  background: var(--bio-nexus-color-surface);
  color: var(--bio-nexus-color-text-secondary);
  font-family: var(--bio-nexus-font-family);
  font-size: var(--bio-nexus-font-size-md);
  font-style: normal;
  font-weight: var(--bio-nexus-font-weight-regular);
  line-height: 1.2;
  cursor: pointer;
}

.bio-nexus-option-filter-select:hover {
  border-color: var(--bio-nexus-color-primary);
  background: var(--bio-nexus-color-surface-soft);
}

.bio-nexus-option-filter-select:focus {
  border-color: var(--bio-nexus-color-primary);
  box-shadow: 0 0 0 3px var(--bio-nexus-color-info-soft);
  outline: 0;
}

.bio-nexus-option-filter-select option {
  color: var(--bio-nexus-color-text-secondary);
  background: var(--bio-nexus-color-surface);
  font-family: var(--bio-nexus-font-family);
  font-size: var(--bio-nexus-font-size-md);
  font-weight: var(--bio-nexus-font-weight-regular);
}

.bio-nexus-option-filter-clear {
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
  color: var(--bio-nexus-color-text-muted);
  font-family: var(--bio-nexus-font-family);
  font-size: 0;
  font-weight: var(--bio-nexus-font-weight-medium);
  line-height: 1;
  cursor: pointer;
  transform: translateY(-50%);
}

.bio-nexus-option-filter-clear svg {
  width: 14px;
  height: 14px;
}

.bio-nexus-option-filter-clear:hover,
.bio-nexus-option-filter-clear:focus-visible {
  background: var(--bio-nexus-color-info-soft);
  color: var(--bio-nexus-color-primary-strong);
  outline: 0;
}

/* Compact the AG Grid wrappers that contain this custom filter. */
.ag-popup-child:has(.bio-nexus-option-filter),
.ag-filter:has(.bio-nexus-option-filter),
.ag-filter-wrapper:has(.bio-nexus-option-filter),
.ag-filter-body-wrapper:has(.bio-nexus-option-filter) {
  box-sizing: border-box;
  width: 190px !important;
  min-width: 190px !important;
  max-width: 190px !important;
}

.ag-filter-wrapper:has(.bio-nexus-option-filter),
.ag-filter-body-wrapper:has(.bio-nexus-option-filter) {
  gap: 0 !important;
  padding: 0 !important;
}
</style>
