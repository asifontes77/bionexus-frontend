<template>
  <BioNexusDialog ref="box" :title="mode === 'create' ? 'Nuevo impuesto' : 'Editar impuesto'" kicker="Configuracion" size="compact" @close="reset">
    <form class="tax-form" @submit.prevent="submit">
      <div v-if="error" class="bio-nexus-message bio-nexus-message-error">{{ error }}</div>
      <BioNexusFormField label="Descripcion" field-id="tax-description" required :error="errors.description">
        <input id="tax-description" v-model="form.description" class="bio-nexus-field" maxlength="20" :disabled="saving" autofocus>
      </BioNexusFormField>
      <BioNexusFormField label="Porcentaje" field-id="tax-value" required :error="errors.value">
        <input id="tax-value" v-model.trim="form.value" class="bio-nexus-field" type="text" inputmode="decimal" :placeholder="percentagePlaceholder" :disabled="saving">
      </BioNexusFormField>
      <div class="tax-options">
        <label><input v-model="form.only_dollars" type="checkbox" :disabled="saving"> Solo dolares</label>
        <label><input v-model="form.always_subtotal" type="checkbox" :disabled="saving"> Fijo en subtotal</label>
        <label><input v-model="form.hide" type="checkbox" :disabled="saving"> Ocultar</label>
      </div>
    </form>
    <template #footer>
      <BioNexusActionButton variant="secondary" :disabled="saving" @click="close">Cancelar</BioNexusActionButton>
      <BioNexusActionButton variant="primary" :loading="saving" @click="submit">Guardar</BioNexusActionButton>
    </template>
  </BioNexusDialog>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import BioNexusActionButton from "@/components/ui/BioNexusActionButton.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
import BioNexusFormField from "@/components/ui/BioNexusFormField.vue";
import { formatRegionalNumber, parseRegionalNumber } from "@/services/regionalFormatter";
import { useRegionalSettingsStore } from "@/stores/regionalSettings";

const props = defineProps({ saving: Boolean });
const emit = defineEmits(["submit"]);
const regionalSettings = useRegionalSettingsStore();
const box = ref(null);
const mode = ref("create");
const record = ref(null);
const error = ref("");
const form = reactive({ description: "", value: "0", only_dollars: false, always_subtotal: false, hide: false });
const errors = reactive({ description: "", value: "" });
const percentagePlaceholder = computed(() => { const digits = 2; return "0" + (digits > 0 ? regionalSettings.settings.decimal_separator + "0".repeat(digits) : ""); });

function displayPercentage(value) {
  return formatRegionalNumber(value, regionalSettings.settings, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function reset() {
  mode.value = "create";
  record.value = null;
  error.value = "";
  Object.assign(form, { description: "", value: displayPercentage(0), only_dollars: false, always_subtotal: false, hide: false });
  Object.assign(errors, { description: "", value: "" });
}
function openCreate() { reset(); box.value?.open(); }
function openEdit(value) {
  reset(); mode.value = "edit"; record.value = value;
  Object.assign(form, value, { value: displayPercentage(value?.value) });
  box.value?.open();
}
function submit() {
  if (props.saving) return;
  const numericValue = parseRegionalNumber(form.value, regionalSettings.settings);
  errors.description = form.description.trim() ? "" : "La descripcion es obligatoria.";
  errors.value = numericValue !== null && numericValue >= 0 && numericValue <= 100 ? "" : "Use un porcentaje entre 0 y 100 con separador " + regionalSettings.settings.decimal_separator + ".";
  if (errors.description || errors.value) return;
  emit("submit", { mode: mode.value, record: record.value, values: { ...form, description: form.description.trim(), value: numericValue } });
}
function close() { box.value?.close(); }
function setError(value) { error.value = value; }
function clearError() { error.value = ""; }
defineExpose({ openCreate, openEdit, close, setError, clearError });
</script>

<style scoped>
.tax-form { display: grid; gap: var(--bio-nexus-space-4); padding: var(--bio-nexus-space-4); }
.tax-options { display: grid; gap: var(--bio-nexus-space-2); }
.tax-options label { display: flex; align-items: center; gap: var(--bio-nexus-space-2); min-height: 34px; color: var(--bio-nexus-color-text-secondary); font-weight: var(--bio-nexus-font-weight-bold); }
</style>
