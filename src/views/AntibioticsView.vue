<template>
  <section class="antibiotics-page">
    <BioNexusFormErrors :errors="loadError ? ['No fue posible cargar los antibióticos.', loadError] : []" />

    <section class="bio-nexus-administrative-directory antibiotics-directory">
      <div v-if="loading" class="bio-nexus-empty-state">Cargando antibióticos...</div>
      <div v-else-if="rows.length === 0" class="bio-nexus-empty-state">No existen antibióticos registrados.</div>

      <BioNexusDataGrid
        v-else
        class="antibiotics-grid"
        :row-data="gridRows"
        :column-defs="columnDefs"
        :default-col-def="defaultColDef"
        :components="gridComponents"
        :get-row-id="getRowId"
        :quick-filter-text="searchText"
        :search-enabled="true"
        v-model:search-model-value="searchText"
        search-placeholder="Buscar antibiótico"
        :refresh-enabled="true"
        :refreshing="loading"
        :refresh-disabled="saving"
        :page-size="10"
        :page-size-selector="[10, 20, 50, 100]"
        :min-grid-height="300"
        :max-grid-height="560"
        empty-text="No existen antibióticos que coincidan con los filtros."
        @refresh="loadRows"
        @row-context-menu="openContextMenu"
      >
        <template #actions>
          <BioNexusActionButton v-if="canCreate" icon="create" icon-only shape="rounded" size="md" variant="primary" label="Nuevo antibiótico" :disabled="loading || saving" @click="openCreate" />
        </template>
      </BioNexusDataGrid>

      <BioNexusContextMenu ref="contextMenu" :open="contextState.open" :x="contextState.x" :y="contextState.y" :items="contextItems" @select="runContextAction" @close="closeContextMenu" />
    </section>

    <AntibioticDialog ref="formDialog" :saving="saving" :can-create="canCreate" :can-update="canUpdate" @submit="saveForm" />
    <AntibioticStateDialog ref="stateDialog" :saving="saving" @confirm="saveState" />
  </section>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from "vue";
import AntibioticDialog from "@/components/antibiotics/AntibioticDialog.vue";
import AntibioticStateDialog from "@/components/antibiotics/AntibioticStateDialog.vue";
import BioNexusDataGrid from "@/components/grid/BioNexusDataGrid.vue";
import BioNexusGridActionsCell from "@/components/grid/BioNexusGridActionsCell.vue";
import BioNexusGridToggleCell from "@/components/grid/BioNexusGridToggleCell.vue";
import BioNexusOptionFilter from "@/components/grid/BioNexusOptionFilter.vue";
import BioNexusActionButton from "@/components/ui/BioNexusActionButton.vue";
import BioNexusContextMenu from "@/components/ui/BioNexusContextMenu.vue";
import BioNexusFormErrors from "@/components/ui/BioNexusFormErrors.vue";
import { useBioNexusToast } from "@/composables/useBioNexusToast";
import { antibioticError, createAntibiotic, getAntibiotics, updateAntibiotic } from "@/services/antibioticsService";
import { useAuthorizationStore } from "@/stores/authorization";

const authorizationStore = useAuthorizationStore();
const toast = useBioNexusToast();
const rows = ref([]);
const loading = ref(false);
const saving = ref(false);
const loadError = ref("");
const searchText = ref("");
const formDialog = ref(null);
const stateDialog = ref(null);
const contextMenu = ref(null);
const contextState = ref({ open: false, x: 0, y: 0, row: null });

const canCreate = computed(() => authorizationStore.hasPermission("antibiotic.create"));
const canUpdate = computed(() => authorizationStore.hasPermission("antibiotic.update"));
const canChangeStatus = computed(() => authorizationStore.hasPermission("antibiotic.update"));
const gridRows = computed(() => rows.value.map((row) => ({ ...row, isActive: !row.annulled })));
const defaultColDef = Object.freeze({ sortable: true, filter: true, resizable: true, suppressHeaderMenuButton: true });
const gridComponents = Object.freeze({ BioNexusGridActionsCell, BioNexusGridToggleCell });

const columnDefs = computed(() => [
  { field: "description", headerName: "Descripción", minWidth: 280, flex: 1, filter: "agTextColumnFilter" },
  { field: "siglas", headerName: "Siglas", minWidth: 180, flex: 0.45, filter: "agTextColumnFilter" },
  {
    field: "isActive",
    headerName: "Estado",
    width: 160,
    minWidth: 150,
    maxWidth: 180,
    filter: BioNexusOptionFilter,
    filterParams: { options: [{ value: true, label: "Activo" }, { value: false, label: "Desactivado" }] },
    headerClass: "bio-nexus-grid-toggle-header",
    cellClass: "bio-nexus-grid-toggle-cell",
    cellRenderer: BioNexusGridToggleCell,
    cellRendererParams: {
      onLabel: "Activo",
      offLabel: "Desactivado",
      ariaLabel: "Estado",
      disabled: () => !canChangeStatus.value || saving.value,
      onToggle: (row) => openState(row),
    },
  },
  {
    colId: "actions",
    headerName: "Acciones",
    width: 110,
    minWidth: 110,
    maxWidth: 110,
    flex: 0,
    pinned: "right",
    lockPinned: true,
    suppressMovable: true,
    sortable: false,
    filter: false,
    resizable: false,
    suppressHeaderMenuButton: true,
    headerClass: "bio-nexus-grid-actions-header",
    cellClass: "bio-nexus-grid-actions-cell",
    cellRenderer: BioNexusGridActionsCell,
    cellRendererParams: { actions: [{ key: "edit", label: "Editar", icon: "edit", visible: () => canUpdate.value, disabled: () => saving.value, onClick: openEdit }] },
  },
]);

const contextItems = computed(() => {
  const row = contextState.value.row;
  if (!row) return [];
  return [
    { key: "edit", label: "Editar", icon: "edit", visible: canUpdate.value, disabled: saving.value, action: () => openEdit(row) },
    { key: "toggle-status", label: row.annulled ? "Activar" : "Desactivar", icon: row.annulled ? "activate" : "deactivate", variant: row.annulled ? "default" : "danger", visible: canChangeStatus.value, disabled: saving.value, action: () => openState(row) },
  ];
});

function getRowId({ data }) { return String(data.id); }
function openCreate() { if (canCreate.value && !saving.value) formDialog.value?.openCreate(); }
function openEdit(row) { if (canUpdate.value && !saving.value && row) formDialog.value?.openEdit(row); }
function openState(row) { if (canChangeStatus.value && !saving.value && row) stateDialog.value?.open(row); }
function compareAntibiotics(left, right) { return left.description.localeCompare(right.description, "es", { sensitivity: "base" }); }
function replaceRow(saved) {
  const currentIndex = rows.value.findIndex((row) => row.id === saved.id);
  if (currentIndex >= 0) rows.value.splice(currentIndex, 1);
  const insertIndex = rows.value.findIndex((row) => compareAntibiotics(saved, row) < 0);
  rows.value.splice(insertIndex < 0 ? rows.value.length : insertIndex, 0, saved);
}
async function openContextMenu({ event, row }) { if (!event || !row || (!canUpdate.value && !canChangeStatus.value)) return; event.preventDefault(); contextState.value = { open: true, x: event.clientX, y: event.clientY, row }; await nextTick(); contextMenu.value?.positionMenu?.(); }
function closeContextMenu() { contextState.value = { open: false, x: 0, y: 0, row: null }; }
async function runContextAction(item) { const action = item?.action; closeContextMenu(); if (typeof action === "function") await action(); }
async function loadRows() { if (loading.value || saving.value) return; loading.value = true; loadError.value = ""; try { rows.value = await getAntibiotics(); } catch (error) { rows.value = []; loadError.value = antibioticError(error, "No fue posible consultar los antibióticos."); toast.error(loadError.value); } finally { loading.value = false; } }
async function saveForm(payload) { if (saving.value) return; saving.value = true; formDialog.value?.clearError(); try { const saved = payload.mode === "create" ? await createAntibiotic(payload.values) : await updateAntibiotic(payload.record.id, payload.values); if (!saved) throw new Error("El Backend no devolvió un registro válido."); replaceRow(saved); formDialog.value?.markSaved(saved, payload.mode === "create"); toast.success(payload.mode === "create" ? "Antibiótico creado correctamente." : "Antibiótico actualizado correctamente."); } catch (error) { formDialog.value?.setError(antibioticError(error, "No fue posible guardar el antibiótico.")); } finally { saving.value = false; } }
async function saveState(row) { if (saving.value || !canChangeStatus.value) return; saving.value = true; stateDialog.value?.clearError(); try { const saved = await updateAntibiotic(row.id, { annulled: !row.annulled }); if (!saved) throw new Error("El Backend no devolvió un registro válido."); replaceRow(saved); stateDialog.value?.close(); toast.success(saved.annulled ? "Antibiótico desactivado correctamente." : "Antibiótico activado correctamente."); } catch (error) { stateDialog.value?.setError(antibioticError(error, "No fue posible cambiar el estado.")); } finally { saving.value = false; } }
onMounted(loadRows);
</script>


<style scoped>
.antibiotics-page,
.antibiotics-directory,
.antibiotics-grid {
  min-width: 0;
}

.antibiotics-grid {
  width: 100%;
}

.antibiotics-grid :deep(.ag-pinned-right-header),
.antibiotics-grid :deep(.ag-pinned-right-cols-container) {
  border-left: 1px solid var(--bio-nexus-color-border-strong);
  box-shadow: calc(var(--bio-nexus-space-1) * -1) 0 var(--bio-nexus-space-3) var(--bio-nexus-shadow-panel-soft);
}
</style>
