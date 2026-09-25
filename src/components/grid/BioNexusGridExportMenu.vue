<template>
  <div class="bio-nexus-grid-export">
    <BioNexusActionButton class="bio-nexus-grid-export-trigger" icon="download" icon-only shape="rounded" size="md" variant="secondary" label="Exportar" :disabled="disabled" @click="openDialog" />
    <BioNexusDialog ref="dialog" size="standard" kicker="Exportación del grid" title="Configurar exportación" @close="handleClosed">
      <section class="bio-nexus-grid-export-dialog-body">
        <BioNexusFormErrors :errors="errorMessage" />
        <BioNexusSectionPanel title="Formato del archivo" icon="download" description="Selecciona el tipo de archivo y, para PDF, la orientación de la página." variant="accent">
          <div class="bio-nexus-grid-export-format-layout">
            <fieldset class="bio-nexus-grid-export-choice-group">
              <legend>Formato</legend>
              <div class="bio-nexus-grid-export-choice-row">
                <label class="bio-nexus-grid-export-choice">
                  <input v-model="format" type="radio" value="excel" />
                  <span>Excel (.xlsx)</span>
                </label>
                <label class="bio-nexus-grid-export-choice">
                  <input v-model="format" type="radio" value="pdf" />
                  <span>PDF</span>
                </label>
              </div>
            </fieldset>
            <fieldset v-if="format === 'pdf'" class="bio-nexus-grid-export-choice-group">
              <legend>Orientación</legend>
              <div class="bio-nexus-grid-export-choice-row">
                <label class="bio-nexus-grid-export-choice">
                  <input v-model="orientation" type="radio" value="portrait" />
                  <span>Vertical</span>
                </label>
                <label class="bio-nexus-grid-export-choice">
                  <input v-model="orientation" type="radio" value="landscape" />
                  <span>Horizontal</span>
                </label>
              </div>
            </fieldset>
          </div>
        </BioNexusSectionPanel>
        <BioNexusSectionPanel title="Columnas incluidas" icon="view_column" description="Selecciona las columnas que aparecerán en el archivo." variant="accent">
          <template #actions>
            <div class="bio-nexus-grid-export-column-actions">
              <button type="button" @click="selectAll">Seleccionar todas</button>
              <button type="button" @click="clearAll">Limpiar</button>
            </div>
          </template>
          <div class="bio-nexus-grid-export-columns">
            <label v-for="column in availableColumns" :key="column.id" class="bio-nexus-grid-export-column">
              <BioNexusCheckbox v-model="selectedColumnIds" :value="column.id" />
              <span>{{ column.label }}</span>
            </label>
          </div>
        </BioNexusSectionPanel>
      </section>
      <template #footer>
        <button type="button" class="bio-nexus-action bio-nexus-action-secondary" @click="closeDialog">
          <BioNexusActionIcon action="cancel" />
          <span>Cancelar</span>
        </button>
        <button type="submit" class="bio-nexus-action bio-nexus-action-primary" :disabled="selectedColumnIds.length === 0" @click.prevent="confirmExport">
          <BioNexusActionIcon action="export" />
          <span>Exportar</span>
        </button>
      </template>
    </BioNexusDialog>
  </div>
</template>
<script setup>
import BioNexusCheckbox from "@/components/ui/BioNexusCheckbox.vue";
import { ref, watch } from "vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import BioNexusActionButton from "@/components/ui/BioNexusActionButton.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
import BioNexusFormErrors from "@/components/ui/BioNexusFormErrors.vue";
import BioNexusSectionPanel from "@/components/ui/BioNexusSectionPanel.vue";
import { useBioNexusToast } from "@/composables/useBioNexusToast.js";

const props = defineProps({
  disabled: { type: Boolean, default: false },
  columnProvider: { type: Function, required: true },
});
const emit = defineEmits(["export"]);
const toast = useBioNexusToast();
const dialog = ref(null);
const format = ref("excel");
const orientation = ref("portrait");
const availableColumns = ref([]);
const selectedColumnIds = ref([]);
const errorMessage = ref("");

function openDialog() {
  if (props.disabled) return;
  const columns = props.columnProvider?.() ?? [];
  availableColumns.value = columns;
  selectedColumnIds.value = columns.map((column) => column.id);
  errorMessage.value = columns.length ? "" : "No hay columnas disponibles para exportar.";
  dialog.value?.open();
}

function closeDialog() {
  dialog.value?.close();
}
function handleClosed() {
  errorMessage.value = "";
}

function selectAll() {
  selectedColumnIds.value = availableColumns.value.map((column) => column.id);
}

function clearAll() {
  selectedColumnIds.value = [];
}


watch([format, orientation, selectedColumnIds], () => {
  errorMessage.value = "";
}, { deep: true });

function confirmExport() {
  errorMessage.value = "";

  if (!selectedColumnIds.value.length) {
    errorMessage.value = "Selecciona al menos una columna.";
    return;
  }


  if (format.value === "pdf") {
    const maximumColumns = orientation.value === "landscape" ? 10 : 6;
    if (selectedColumnIds.value.length > maximumColumns) {
      errorMessage.value = `El PDF en ${orientation.value === "landscape" ? "horizontal" : "vertical"} admite hasta ${maximumColumns} columnas legibles. Reduce la seleccion o cambia la orientacion.`;
      toast.warning(errorMessage.value);
      return;
    }
  }

  emit("export", {
    format: format.value,
    orientation: format.value === "pdf" ? orientation.value : null,
    selectedColumnIds: [...selectedColumnIds.value],
  });
  closeDialog();
}
</script>
<style scoped>
.bio-nexus-grid-export { display: inline-flex; }
.bio-nexus-grid-export-dialog-body { display: grid; gap: var(--bio-nexus-space-4); overflow: visible; }
.bio-nexus-grid-export-format-layout { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--bio-nexus-space-3); align-items: start; }
.bio-nexus-grid-export-choice-group { display: grid; gap: var(--bio-nexus-space-2); min-width: 0; margin: 0; padding: 0; border: 0; }
.bio-nexus-grid-export-choice-group legend { margin-bottom: var(--bio-nexus-space-2); padding: 0; color: var(--bio-nexus-color-text); font-size: var(--bio-nexus-font-size-sm); font-weight: 700; }
.bio-nexus-grid-export-choice-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--bio-nexus-space-2); }
.bio-nexus-grid-export-choice, .bio-nexus-grid-export-column { display: flex; align-items: center; gap: var(--bio-nexus-space-2); min-width: 0; cursor: pointer; }
.bio-nexus-grid-export-choice { min-height: 38px; padding: 7px 10px; border: 1px solid var(--bio-nexus-color-border); border-radius: var(--bio-nexus-radius-sm); background: var(--bio-nexus-color-surface); }
.bio-nexus-grid-export-choice:has(input:checked) { border-color: var(--bio-nexus-color-primary); background: var(--bio-nexus-color-info-soft); box-shadow: inset 0 1px 0 rgb(255 255 255 / 78%), 0 4px 10px rgb(13 36 58 / 8%); }
.bio-nexus-grid-export-choice input, .bio-nexus-grid-export-column input { accent-color: var(--bio-nexus-color-primary); }
.bio-nexus-grid-export-column-actions { display: flex; align-items: center; gap: var(--bio-nexus-space-2); }
.bio-nexus-grid-export-column-actions button { padding: 3px 6px; border: 0; color: var(--bio-nexus-color-primary-strong); background: transparent; font: inherit; font-size: .76rem; font-weight: 700; cursor: pointer; }
.bio-nexus-grid-export-column-actions button:hover, .bio-nexus-grid-export-column-actions button:focus-visible { text-decoration: underline; outline: none; }
.bio-nexus-grid-export-columns { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--bio-nexus-space-2); max-height: min(22vh, 190px); padding-right: 4px; overflow-x: hidden; overflow-y: auto; scrollbar-gutter: stable; }
.bio-nexus-grid-export-column { min-height: 34px; padding: 6px 8px; border: 1px solid transparent; border-radius: var(--bio-nexus-radius-sm); background: var(--bio-nexus-color-surface); }
.bio-nexus-grid-export-column:hover { border-color: var(--bio-nexus-color-border); background: var(--bio-nexus-color-info-soft); }
.bio-nexus-grid-export-column span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
@media (max-width: 700px) { .bio-nexus-grid-export-format-layout, .bio-nexus-grid-export-choice-row, .bio-nexus-grid-export-columns { grid-template-columns: 1fr; } }
</style>
