<template>
  <section class="sample-types-page">
    <div v-if="loadError" class="bio-nexus-message bio-nexus-message-error" role="alert"><strong>No fue posible cargar los tipos de muestra.</strong><span>{{ loadError }}</span></div>
    <section class="bio-nexus-administrative-directory">
      <BioNexusDataGrid class="sample-types-grid" :row-data="rows" :column-defs="columnDefs" :default-col-def="defaultColDef" :components="gridComponents" :get-row-id="getRowId" :quick-filter-text="searchText" :search-enabled="true" v-model:search-model-value="searchText" search-placeholder="Buscar tipo de muestra" :refresh-enabled="true" :refreshing="loading" :refresh-disabled="saving" :page-size="10" :page-size-selector="[10, 20, 50, 100]" :min-grid-height="300" :max-grid-height="560" empty-text="No existen tipos de muestra que coincidan con la busqueda." @refresh="loadRows" @row-context-menu="openContextMenu">
        <template #actions><button v-if="canCreate" class="bio-nexus-action bio-nexus-action-primary" :disabled="loading || saving" @click="formDialog?.openCreate()"><BioNexusActionIcon action="create" />Nuevo tipo</button></template>
      </BioNexusDataGrid>
      <BioNexusContextMenu
        ref="contextMenu"
        :open="contextState.open"
        :x="contextState.x"
        :y="contextState.y"
        :items="contextItems"
        @close="closeContextMenu"
        @select="runContextAction"
      />
    </section>
    <SampleTypeDialog ref="formDialog" :saving="saving" :can-create="canCreate" :can-update="canUpdate" @submit="saveForm" />
  </section>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import BioNexusDataGrid from '@/components/grid/BioNexusDataGrid.vue'
import BioNexusGridActionsCell from '@/components/grid/BioNexusGridActionsCell.vue'
import BioNexusActionIcon from '@/components/ui/BioNexusActionIcon.vue'
import BioNexusContextMenu from '@/components/ui/BioNexusContextMenu.vue'
import SampleTypeDialog from '@/components/sampletypes/SampleTypeDialog.vue'
import { useBioNexusToast } from '@/composables/useBioNexusToast'
import { createSampleType, getSampleTypes, sampleTypeError, updateSampleType } from '@/services/sampleTypesService'
import { useAuthorizationStore } from '@/stores/authorization'

const authorization = useAuthorizationStore()
const toast = useBioNexusToast()
const rows = ref([])
const loading = ref(false)
const saving = ref(false)
const loadError = ref('')
const searchText = ref('')
const formDialog = ref(null)
const contextMenu = ref(null)
const contextState = ref({ open: false, x: 0, y: 0, row: null })
const canCreate = computed(() => authorization.hasPermission('sample-types.create'))
const canUpdate = computed(() => authorization.hasPermission('sample-types.update'))
const contextItems = computed(() => {
  const row = contextState.value.row
  if (!row || !canUpdate.value) return []
  return [{ key: 'edit', label: 'Editar', icon: 'edit', disabled: saving.value, action: () => formDialog.value?.openEdit(row) }]
})
const defaultColDef = Object.freeze({ sortable: true, filter: true, resizable: true, suppressHeaderMenuButton: true })
const gridComponents = Object.freeze({ BioNexusGridActionsCell })
const columnDefs = computed(() => [
  { field: 'description', headerName: 'Descripcion', minWidth: 280, flex: 1, filter: 'agTextColumnFilter' },
  { colId: 'actions', headerName: 'Acciones', width: 110, minWidth: 110, maxWidth: 110, pinned: 'right', lockPinned: true, suppressMovable: true, sortable: false, filter: false, resizable: false, headerClass: 'bio-nexus-grid-actions-header', cellClass: 'bio-nexus-grid-actions-cell', cellRenderer: BioNexusGridActionsCell, cellRendererParams: { actions: [{ key: 'edit', label: 'Editar', icon: 'edit', visible: () => canUpdate.value, disabled: () => saving.value, onClick: row => formDialog.value?.openEdit(row) }] } }
])
function getRowId({ data }) { return String(data.id) }
async function openContextMenu({ event, row }) {
  if (!event || !row || !canUpdate.value || saving.value) return
  contextState.value = { open: true, x: event.clientX, y: event.clientY, row }
  await nextTick()
  contextMenu.value?.positionMenu?.()
}
function closeContextMenu() { contextState.value = { open: false, x: 0, y: 0, row: null } }
async function runContextAction(item) {
  const action = item?.action
  closeContextMenu()
  if (typeof action === 'function') await action()
}
function replaceRow(saved) { const next = rows.value.map(row => row.id === saved.id ? saved : row); if (!next.some(row => row.id === saved.id)) next.push(saved); rows.value = next.sort((a, b) => a.description.localeCompare(b.description, 'es')) }
async function loadRows() { if (loading.value || saving.value) return; loading.value = true; loadError.value = ''; try { rows.value = await getSampleTypes() } catch (error) { rows.value = []; loadError.value = sampleTypeError(error, 'No fue posible consultar los tipos de muestra.'); toast.error(loadError.value) } finally { loading.value = false } }
async function saveForm(payload) { if (saving.value) return; saving.value = true; formDialog.value?.clearError(); try { const saved = payload.mode === 'create' ? await createSampleType(payload.values) : await updateSampleType(payload.record.id, payload.values); if (!saved) throw new Error('El Backend no devolvio un registro valido.'); replaceRow(saved); formDialog.value?.close(); toast.success(payload.mode === 'create' ? 'Tipo de muestra creado correctamente.' : 'Tipo de muestra actualizado correctamente.') } catch (error) { formDialog.value?.setError(sampleTypeError(error, 'No fue posible guardar el tipo de muestra.')) } finally { saving.value = false } }
onMounted(loadRows)
</script>

<style scoped>
.sample-types-page, .sample-types-grid { min-width: 0; }
.sample-types-grid { width: 100%; }
.sample-types-grid :deep(.bio-nexus-grid-actions-header .ag-header-cell-label), .sample-types-grid :deep(.bio-nexus-grid-actions-cell) { justify-content: center; }
</style>
