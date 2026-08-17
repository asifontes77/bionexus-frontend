<template>
  <div class="toro-grid-export">
    <button
      type="button"
      class="toro-action toro-action-secondary toro-grid-export-trigger"
      :disabled="disabled"
      @click="openDialog"
    >
      <svg class="toro-grid-export-trigger-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 21h14" />
      </svg>
      <span>Exportar</span>
    </button>

    <dialog ref="dialog" class="toro-dialog toro-grid-export-dialog" @cancel.prevent="closeDialog">
      <form class="dialog-shell" @submit.prevent="confirmExport">
        <header class="dialog-header">
          <div>
            <p>Exportacion del grid</p>
            <h3>Configurar exportacion</h3>
          </div>
          <BioNexusDialogCloseButton @click="closeDialog" />
        </header>

        <section class="dialog-body toro-grid-export-dialog-body">
          <section class="toro-grid-export-section" aria-labelledby="export-format-title">
            <h4 id="export-format-title">Formato</h4>
            <div class="toro-grid-export-choice-row">
              <label class="toro-grid-export-choice">
                <input v-model="format" type="radio" value="excel" />
                <span>Excel (.xlsx)</span>
              </label>
              <label class="toro-grid-export-choice">
                <input v-model="format" type="radio" value="pdf" />
                <span>PDF</span>
              </label>
            </div>
          </section>

          <section v-if="format === 'pdf'" class="toro-grid-export-section" aria-labelledby="export-orientation-title">
            <h4 id="export-orientation-title">Orientacion</h4>
            <div class="toro-grid-export-choice-row">
              <label class="toro-grid-export-choice">
                <input v-model="orientation" type="radio" value="portrait" />
                <span>Vertical</span>
              </label>
              <label class="toro-grid-export-choice">
                <input v-model="orientation" type="radio" value="landscape" />
                <span>Horizontal</span>
              </label>
            </div>
          </section>

          <section class="toro-grid-export-section" aria-labelledby="export-columns-title">
            <div class="toro-grid-export-columns-heading">
              <h4 id="export-columns-title">Columnas</h4>
              <div class="toro-grid-export-column-actions">
                <button type="button" @click="selectAll">Seleccionar todas</button>
                <button type="button" @click="clearAll">Limpiar</button>
              </div>
            </div>
            <p class="toro-grid-export-help">Selecciona las columnas que apareceran en el archivo.</p>
            <div class="toro-grid-export-columns">
              <label v-for="column in availableColumns" :key="column.id" class="toro-grid-export-column">
                <input v-model="selectedColumnIds" type="checkbox" :value="column.id" />
                <span>{{ column.label }}</span>
              </label>
            </div>
          </section>

          <p v-if="errorMessage" class="toro-message toro-message-error" role="alert">{{ errorMessage }}</p>
        </section>

        <footer class="dialog-footer">
          <button type="button" class="toro-action toro-action-secondary" @click="closeDialog">
            <BioNexusActionIcon action="cancel" />
            <span>Cancelar</span>
          </button>
          <button type="submit" class="toro-action toro-action-primary" :disabled="selectedColumnIds.length === 0">
            <BioNexusActionIcon action="save" />
            <span>Exportar</span>
          </button>
        </footer>
      </form>
    </dialog>
  </div>
</template>

<script setup>
import { ref } from "vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import BioNexusDialogCloseButton from "@/components/ui/BioNexusDialogCloseButton.vue";

const props = defineProps({
  disabled: { type: Boolean, default: false },
  columnProvider: { type: Function, required: true },
});
const emit = defineEmits(["export"]);
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
  dialog.value?.showModal();
}

function closeDialog() {
  if (dialog.value?.open) dialog.value.close();
}

function selectAll() {
  selectedColumnIds.value = availableColumns.value.map((column) => column.id);
}

function clearAll() {
  selectedColumnIds.value = [];
}

function confirmExport() {
  if (!selectedColumnIds.value.length) {
    errorMessage.value = "Selecciona al menos una columna.";
    return;
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
.toro-grid-export {
  display: inline-flex;
}

.toro-grid-export-trigger {
  min-height: 34px;
  gap: 7px;
  padding: 6px 10px;
  font-size: var(--toro-font-size-sm);
  font-weight: 600;
}

.toro-grid-export-trigger-icon {
  width: 17px;
  height: 17px;
}

.toro-grid-export-dialog {
  width: min(620px, calc(100vw - 32px));
  max-width: 620px;
  padding: 0;
  border: 1px solid var(--toro-color-border-strong);
  border-radius: var(--toro-radius-md);
  background: var(--toro-color-surface);
  color: var(--toro-color-text);
  box-shadow: var(--toro-shadow-md);
}

.toro-grid-export-dialog::backdrop {
  background: rgb(15 23 42 / 38%);
}

.toro-grid-export-dialog .dialog-shell {
  width: 100%;
}

.toro-grid-export-dialog-body {
  display: grid;
  gap: var(--toro-space-3);
  overflow: visible;
}

.toro-grid-export-section {
  display: grid;
  gap: var(--toro-space-2);
  padding: var(--toro-space-3);
  border: 1px solid var(--toro-color-border);
  border-radius: var(--toro-radius-md);
  background: var(--toro-color-surface-soft);
}

.toro-grid-export-section h4 {
  margin: 0;
  color: var(--toro-color-text);
  font-size: var(--toro-font-size-sm);
  font-weight: 700;
}

.toro-grid-export-choice-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--toro-space-2);
}

.toro-grid-export-choice,
.toro-grid-export-column {
  display: flex;
  align-items: center;
  gap: var(--toro-space-2);
  min-width: 0;
  cursor: pointer;
}

.toro-grid-export-choice {
  min-height: 38px;
  padding: 7px 10px;
  border: 1px solid var(--toro-color-border);
  border-radius: var(--toro-radius-sm);
  background: var(--toro-color-surface);
}

.toro-grid-export-choice:has(input:checked) {
  border-color: var(--toro-color-primary);
  background: var(--toro-color-info-soft);
}

.toro-grid-export-choice input,
.toro-grid-export-column input {
  accent-color: var(--toro-color-primary);
}

.toro-grid-export-columns-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--toro-space-3);
}

.toro-grid-export-column-actions {
  display: flex;
  align-items: center;
  gap: var(--toro-space-2);
}

.toro-grid-export-column-actions button {
  padding: 2px 4px;
  border: 0;
  color: var(--toro-color-primary-strong);
  background: transparent;
  font: inherit;
  font-size: .76rem;
  font-weight: 600;
  cursor: pointer;
}

.toro-grid-export-column-actions button:hover,
.toro-grid-export-column-actions button:focus-visible {
  text-decoration: underline;
  outline: none;
}

.toro-grid-export-help {
  margin: 0;
  color: var(--toro-color-text-muted);
  font-size: .78rem;
}

.toro-grid-export-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--toro-space-2);
  max-height: min(30vh, 280px);
  padding-right: 4px;
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-gutter: stable;
}

.toro-grid-export-column {
  min-height: 34px;
  padding: 6px 8px;
  border-radius: var(--toro-radius-sm);
  background: var(--toro-color-surface);
}

.toro-grid-export-column:hover {
  background: var(--toro-color-info-soft);
}

.toro-grid-export-column span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 600px) {
  .toro-grid-export-dialog {
    width: calc(100vw - 16px);
  }

  .toro-grid-export-choice-row,
  .toro-grid-export-columns {
    grid-template-columns: 1fr;
  }

  .toro-grid-export-columns-heading {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>