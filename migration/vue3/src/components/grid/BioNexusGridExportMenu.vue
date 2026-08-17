<template>
  <div class="bio-nexus-grid-export">
    <button
      type="button"
      class="bio-nexus-action bio-nexus-action-secondary bio-nexus-grid-export-trigger"
      :disabled="disabled"
      @click="openDialog"
    >
      <svg class="bio-nexus-grid-export-trigger-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 21h14" />
      </svg>
      <span>Exportar</span>
    </button>

    <dialog ref="dialog" class="bio-nexus-dialog bio-nexus-grid-export-dialog" @cancel.prevent="closeDialog">
      <form class="dialog-shell" @submit.prevent="confirmExport">
        <header class="dialog-header">
          <div>
            <p>Exportacion del grid</p>
            <h3>Configurar exportacion</h3>
          </div>
          <BioNexusDialogCloseButton @click="closeDialog" />
        </header>

        <section class="dialog-body bio-nexus-grid-export-dialog-body">
          <section class="bio-nexus-grid-export-section" aria-labelledby="export-format-title">
            <h4 id="export-format-title">Formato</h4>
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
          </section>

          <section v-if="format === 'pdf'" class="bio-nexus-grid-export-section" aria-labelledby="export-orientation-title">
            <h4 id="export-orientation-title">Orientacion</h4>
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
          </section>

          <section class="bio-nexus-grid-export-section" aria-labelledby="export-columns-title">
            <div class="bio-nexus-grid-export-columns-heading">
              <h4 id="export-columns-title">Columnas</h4>
              <div class="bio-nexus-grid-export-column-actions">
                <button type="button" @click="selectAll">Seleccionar todas</button>
                <button type="button" @click="clearAll">Limpiar</button>
              </div>
            </div>
            <p class="bio-nexus-grid-export-help">Selecciona las columnas que apareceran en el archivo.</p>
            <div class="bio-nexus-grid-export-columns">
              <label v-for="column in availableColumns" :key="column.id" class="bio-nexus-grid-export-column">
                <input v-model="selectedColumnIds" type="checkbox" :value="column.id" />
                <span>{{ column.label }}</span>
              </label>
            </div>
          </section>

          <p v-if="errorMessage" class="bio-nexus-message bio-nexus-message-error" role="alert">{{ errorMessage }}</p>
        </section>

        <footer class="dialog-footer">
          <button type="button" class="bio-nexus-action bio-nexus-action-secondary" @click="closeDialog">
            <BioNexusActionIcon action="cancel" />
            <span>Cancelar</span>
          </button>
          <button type="submit" class="bio-nexus-action bio-nexus-action-primary" :disabled="selectedColumnIds.length === 0">
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
.bio-nexus-grid-export {
  display: inline-flex;
}

.bio-nexus-grid-export-trigger {
  min-height: 34px;
  gap: 7px;
  padding: 6px 10px;
  font-size: var(--bio-nexus-font-size-sm);
  font-weight: 600;
}

.bio-nexus-grid-export-trigger-icon {
  width: 17px;
  height: 17px;
}

.bio-nexus-grid-export-dialog {
  width: min(620px, calc(100vw - 32px));
  max-width: 620px;
  padding: 0;
  border: 1px solid var(--bio-nexus-color-border-strong);
  border-radius: var(--bio-nexus-radius-md);
  background: var(--bio-nexus-color-surface);
  color: var(--bio-nexus-color-text);
  box-shadow: var(--bio-nexus-shadow-md);
}

.bio-nexus-grid-export-dialog::backdrop {
  background: rgb(15 23 42 / 38%);
}

.bio-nexus-grid-export-dialog .dialog-shell {
  width: 100%;
}

.bio-nexus-grid-export-dialog-body {
  display: grid;
  gap: var(--bio-nexus-space-3);
  overflow: visible;
}

.bio-nexus-grid-export-section {
  display: grid;
  gap: var(--bio-nexus-space-2);
  padding: var(--bio-nexus-space-3);
  border: 1px solid var(--bio-nexus-color-border);
  border-radius: var(--bio-nexus-radius-md);
  background: var(--bio-nexus-color-surface-soft);
}

.bio-nexus-grid-export-section h4 {
  margin: 0;
  color: var(--bio-nexus-color-text);
  font-size: var(--bio-nexus-font-size-sm);
  font-weight: 700;
}

.bio-nexus-grid-export-choice-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--bio-nexus-space-2);
}

.bio-nexus-grid-export-choice,
.bio-nexus-grid-export-column {
  display: flex;
  align-items: center;
  gap: var(--bio-nexus-space-2);
  min-width: 0;
  cursor: pointer;
}

.bio-nexus-grid-export-choice {
  min-height: 38px;
  padding: 7px 10px;
  border: 1px solid var(--bio-nexus-color-border);
  border-radius: var(--bio-nexus-radius-sm);
  background: var(--bio-nexus-color-surface);
}

.bio-nexus-grid-export-choice:has(input:checked) {
  border-color: var(--bio-nexus-color-primary);
  background: var(--bio-nexus-color-info-soft);
}

.bio-nexus-grid-export-choice input,
.bio-nexus-grid-export-column input {
  accent-color: var(--bio-nexus-color-primary);
}

.bio-nexus-grid-export-columns-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--bio-nexus-space-3);
}

.bio-nexus-grid-export-column-actions {
  display: flex;
  align-items: center;
  gap: var(--bio-nexus-space-2);
}

.bio-nexus-grid-export-column-actions button {
  padding: 2px 4px;
  border: 0;
  color: var(--bio-nexus-color-primary-strong);
  background: transparent;
  font: inherit;
  font-size: .76rem;
  font-weight: 600;
  cursor: pointer;
}

.bio-nexus-grid-export-column-actions button:hover,
.bio-nexus-grid-export-column-actions button:focus-visible {
  text-decoration: underline;
  outline: none;
}

.bio-nexus-grid-export-help {
  margin: 0;
  color: var(--bio-nexus-color-text-muted);
  font-size: .78rem;
}

.bio-nexus-grid-export-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--bio-nexus-space-2);
  max-height: min(30vh, 280px);
  padding-right: 4px;
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-gutter: stable;
}

.bio-nexus-grid-export-column {
  min-height: 34px;
  padding: 6px 8px;
  border-radius: var(--bio-nexus-radius-sm);
  background: var(--bio-nexus-color-surface);
}

.bio-nexus-grid-export-column:hover {
  background: var(--bio-nexus-color-info-soft);
}

.bio-nexus-grid-export-column span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 600px) {
  .bio-nexus-grid-export-dialog {
    width: calc(100vw - 16px);
  }

  .bio-nexus-grid-export-choice-row,
  .bio-nexus-grid-export-columns {
    grid-template-columns: 1fr;
  }

  .bio-nexus-grid-export-columns-heading {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>