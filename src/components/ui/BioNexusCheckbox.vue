<template>
  <label class="bio-nexus-checkbox" :class="{ 'bio-nexus-checkbox-disabled': disabled, 'bio-nexus-checkbox-with-copy': hasCopy }">
    <input ref="input" class="bio-nexus-checkbox-input" type="checkbox" :id="id || undefined" :name="name || undefined" :value="value" :checked="isChecked" :disabled="disabled" :required="required" :aria-label="ariaLabel || undefined" @click="handleClick" @change="handleChange" />
    <span class="bio-nexus-checkbox-control" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M3.25 8.25 6.5 11.5 12.75 4.75" /></svg></span>
    <span v-if="hasCopy" class="bio-nexus-checkbox-copy"><strong v-if="label">{{ label }}</strong><small v-if="help">{{ help }}</small><slot /></span>
  </label>
</template>
<script setup>
import { computed, onMounted, ref, useSlots, watch } from "vue";
const props = defineProps({ modelValue: { type: [Boolean, Array], default: undefined }, checked: { type: Boolean, default: undefined }, value: { type: [String, Number, Boolean, Object], default: true }, indeterminate: { type: Boolean, default: false }, disabled: { type: Boolean, default: false }, required: { type: Boolean, default: false }, id: { type: String, default: "" }, name: { type: String, default: "" }, label: { type: String, default: "" }, help: { type: String, default: "" }, ariaLabel: { type: String, default: "" }, stopPropagation: { type: Boolean, default: false } });
const emit = defineEmits(["update:modelValue", "change", "click"]);
const slots = useSlots();
const input = ref(null);
const hasCopy = computed(() => Boolean(props.label || props.help || slots.default));
const isArrayModel = computed(() => Array.isArray(props.modelValue));
const isChecked = computed(() => { if (isArrayModel.value) return props.modelValue.some((item) => Object.is(item, props.value)); if (typeof props.modelValue === "boolean") return props.modelValue; return Boolean(props.checked); });
function syncIndeterminate() { if (input.value) input.value.indeterminate = Boolean(props.indeterminate); }
function handleClick(event) { if (props.stopPropagation) event.stopPropagation(); emit("click", event); }
function handleChange(event) { const nextChecked = event.target.checked; if (isArrayModel.value) { const next = [...props.modelValue]; const index = next.findIndex((item) => Object.is(item, props.value)); if (nextChecked && index < 0) next.push(props.value); if (!nextChecked && index >= 0) next.splice(index, 1); emit("update:modelValue", next); } else if (typeof props.modelValue === "boolean") emit("update:modelValue", nextChecked); emit("change", event); }
onMounted(syncIndeterminate);
watch(() => props.indeterminate, syncIndeterminate);
</script>
<style scoped>
.bio-nexus-checkbox { display: inline-grid; grid-template-columns: 20px minmax(0, 1fr); align-items: start; column-gap: var(--bio-nexus-space-3); min-width: 0; color: var(--bio-nexus-color-text-secondary); font-family: var(--bio-nexus-font-family); font-size: var(--bio-nexus-font-size-md); cursor: pointer; }
.bio-nexus-checkbox:not(.bio-nexus-checkbox-with-copy) { grid-template-columns: 20px; column-gap: 0; }
.bio-nexus-checkbox-input { position: absolute; width: 1px; height: 1px; margin: 0; opacity: 0; pointer-events: none; }
.bio-nexus-checkbox-control { display: grid; box-sizing: border-box; width: 20px; height: 20px; place-items: center; border: 1px solid var(--bio-nexus-color-border-strong); border-radius: 5px; background: var(--bio-nexus-color-surface); color: transparent; transition: border-color .15s ease, background-color .15s ease, box-shadow .15s ease; }
.bio-nexus-checkbox-control svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 2.25; stroke-linecap: round; stroke-linejoin: round; }
.bio-nexus-checkbox-input:checked + .bio-nexus-checkbox-control, .bio-nexus-checkbox-input:indeterminate + .bio-nexus-checkbox-control { border-color: var(--bio-nexus-color-primary); background: var(--bio-nexus-color-primary); color: #fff; }
.bio-nexus-checkbox-input:indeterminate + .bio-nexus-checkbox-control svg { display: none; }
.bio-nexus-checkbox-input:indeterminate + .bio-nexus-checkbox-control::after { width: 10px; height: 2px; border-radius: 2px; background: #fff; content: ""; }
.bio-nexus-checkbox-input:focus-visible + .bio-nexus-checkbox-control { border-color: var(--bio-nexus-color-primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--bio-nexus-color-primary) 20%, transparent); }
.bio-nexus-checkbox-copy { display: grid; gap: var(--bio-nexus-space-1); min-width: 0; }
.bio-nexus-checkbox-copy strong { color: var(--bio-nexus-color-text); font-weight: var(--bio-nexus-font-weight-bold); line-height: 1.25; }
.bio-nexus-checkbox-copy small { color: var(--bio-nexus-color-text-muted); font-size: var(--bio-nexus-font-size-sm); line-height: 1.35; }
.bio-nexus-checkbox-disabled { cursor: not-allowed; opacity: .62; }
</style>
