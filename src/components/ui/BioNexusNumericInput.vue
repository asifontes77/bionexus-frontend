<template>
  <input
    :id="id"
    ref="input"
    :value="displayValue"
    class="bio-nexus-field"
    type="text"
    inputmode="numeric"
    autocomplete="off"
    :disabled="disabled"
    :readonly="readonly"
    :aria-invalid="invalid || undefined"
    @keydown="onKeydown"
    @paste.prevent="onPaste"
    @focus="emit('focus')"
    @blur="emit('blur')"
  >
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { formatRegionalNumber } from "@/services/regionalFormatter";
import { useRegionalSettingsStore } from "@/stores/regionalSettings";

const props = defineProps({
  id: { type: String, required: true },
  modelValue: { type: Number, default: null },
  decimals: { type: Number, default: null },
  min: { type: Number, default: null },
  max: { type: Number, default: null },
  disabled: Boolean,
  readonly: Boolean,
  invalid: Boolean,
});
const emit = defineEmits(["update:modelValue", "input", "change", "focus", "blur"]);
const settings = useRegionalSettingsStore();
const input = ref(null);
const minorUnits = ref(toMinorUnits(props.modelValue));
const digits = computed(() => props.decimals === null ? Math.max(0, Number(settings.settings.monetary_decimals) || 0) : Math.max(0, Number(props.decimals) || 0));
const divisor = computed(() => 10 ** digits.value);
const numericValue = computed(() => minorUnits.value / divisor.value);
const displayValue = computed(() => formatRegionalNumber(numericValue.value, settings.settings, { minimumFractionDigits: digits.value, maximumFractionDigits: digits.value }));

watch(() => props.modelValue, value => { const next = toMinorUnits(value); if (next !== minorUnits.value) minorUnits.value = next; });
watch(digits, () => { minorUnits.value = toMinorUnits(props.modelValue); });

function toMinorUnits(value) { const number = Number(value); return Number.isFinite(number) ? Math.max(0, Math.round(number * (10 ** digitsFallback()))) : 0; }
function digitsFallback() { return props.decimals === null ? Math.max(0, Number(settings.settings.monetary_decimals) || 0) : Math.max(0, Number(props.decimals) || 0); }
function publish(next) { const value = Math.max(0, Number(next) || 0) / divisor.value; if (props.max !== null && value > props.max) return; if (props.min !== null && value < props.min && next !== 0) return; minorUnits.value = Math.max(0, Number(next) || 0); emit("update:modelValue", numericValue.value); emit("input", numericValue.value); emit("change", numericValue.value); }
function appendDigits(value) { const digitsOnly = String(value || "").replace(/\D/g, ""); if (!digitsOnly) return; publish(Number(String(minorUnits.value) + digitsOnly)); }
function onKeydown(event) { if (props.disabled || props.readonly) return; if (/^\d$/.test(event.key)) { event.preventDefault(); appendDigits(event.key); return; } if (event.key === "Backspace" || event.key === "Delete") { event.preventDefault(); publish(Math.floor(minorUnits.value / 10)); return; } if (["Tab", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key) || event.ctrlKey || event.metaKey) return; event.preventDefault(); }
function onPaste(event) { if (props.disabled || props.readonly) return; appendDigits(event.clipboardData?.getData("text") || ""); }
defineExpose({ focus: () => input.value?.focus(), select: () => input.value?.select() });
</script>