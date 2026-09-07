<template>
  <div class="bio-nexus-regional-date-input" :class="{ 'is-disabled': disabled }">
    <input
      :id="id"
      v-model="displayValue"
      class="bio-nexus-field bio-nexus-regional-date-input-text"
      type="text"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :aria-invalid="invalid"
      inputmode="numeric"
      autocomplete="off"
      @blur="commitDisplayValue"
      @keydown.enter.prevent="commitDisplayValue"
    />
    <button type="button" class="bio-nexus-regional-date-input-button" :disabled="disabled" aria-label="Seleccionar fecha" @click="openPicker">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </svg>
    </button>
    <input ref="picker" class="bio-nexus-regional-date-input-picker" type="date" :value="modelValue" :min="min" :max="max" :disabled="disabled" tabindex="-1" aria-hidden="true" @change="handlePickerChange" />
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { formatRegionalFunctionalDate } from "@/services/regionalFormatter";
import { useRegionalSettingsStore } from "@/stores/regionalSettings";

const props = defineProps({
  id: { type: String, required: true },
  modelValue: { type: String, default: "" },
  min: { type: String, default: "" },
  max: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue", "invalid"]);
const regionalSettings = useRegionalSettingsStore();
const picker = ref(null);
const displayValue = ref("");
const invalid = ref(false);
const placeholder = computed(() => ({ "yyyy-MM-dd": "AAAA-MM-DD", "dd-MM-yyyy": "DD-MM-AAAA" }[regionalSettings.settings.date_format] || "DD/MM/AAAA"));

function format(value) {
  return value ? formatRegionalFunctionalDate(value, regionalSettings.settings) : "";
}
function parse(value) {
  const text = String(value || "").trim();
  const pattern = regionalSettings.settings.date_format;
  const expression = pattern === "yyyy-MM-dd" ? /^(\d{4})-(\d{2})-(\d{2})$/ : pattern === "dd-MM-yyyy" ? /^(\d{2})-(\d{2})-(\d{4})$/ : /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = text.match(expression);
  if (!match) return "";
  const year = pattern === "yyyy-MM-dd" ? match[1] : match[3];
  const month = match[2];
  const day = pattern === "yyyy-MM-dd" ? match[3] : match[1];
  const iso = `${year}-${month}-${day}`;
  const candidate = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(candidate.getTime()) || candidate.toISOString().slice(0, 10) !== iso) return "";
  if (props.min && iso < props.min) return "";
  if (props.max && iso > props.max) return "";
  return iso;
}
function commitDisplayValue() {
  if (!displayValue.value && !props.required) {
    invalid.value = false;
    emit("update:modelValue", "");
    return;
  }
  const iso = parse(displayValue.value);
  invalid.value = !iso;
  emit("invalid", invalid.value);
  if (iso) emit("update:modelValue", iso);
  else displayValue.value = format(props.modelValue);
}
function handlePickerChange(event) {
  invalid.value = false;
  emit("invalid", false);
  emit("update:modelValue", event.target.value || "");
}
function openPicker() {
  if (props.disabled) return;
  if (typeof picker.value?.showPicker === "function") picker.value.showPicker();
  else picker.value?.click();
}
watch(() => [props.modelValue, regionalSettings.settings.date_format], () => { displayValue.value = format(props.modelValue); invalid.value = false; }, { immediate: true });
</script>

<style scoped>
.bio-nexus-regional-date-input { position: relative; width: 100%; }
.bio-nexus-regional-date-input-text { padding-inline-end: 44px; }
.bio-nexus-regional-date-input-button { position: absolute; z-index: 2; inset-block: 1px; inset-inline-end: 1px; display: grid; width: 42px; place-items: center; border: 0; border-radius: 0 var(--bio-nexus-radius-sm) var(--bio-nexus-radius-sm) 0; color: var(--bio-nexus-color-text); background: transparent; cursor: pointer; }
.bio-nexus-regional-date-input-button:hover:not(:disabled), .bio-nexus-regional-date-input-button:focus-visible { color: var(--bio-nexus-color-primary-strong); background: var(--bio-nexus-color-info-soft); outline: none; }
.bio-nexus-regional-date-input-button:disabled { cursor: not-allowed; opacity: .55; }
.bio-nexus-regional-date-input-button svg { width: 19px; height: 19px; }
.bio-nexus-regional-date-input-picker { position: absolute; width: 1px; height: 1px; inset-inline-end: 20px; inset-block-end: 4px; opacity: 0; pointer-events: none; }
.bio-nexus-regional-date-input-text[aria-invalid="true"] { border-color: var(--bio-nexus-color-danger, #b42318); box-shadow: 0 0 0 3px rgb(180 35 24 / 12%); }
</style>
