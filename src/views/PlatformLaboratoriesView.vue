<template>
  <section class="platform-laboratories-view" aria-labelledby="admin-laboratories-title">
    <BioNexusAdminPageHeader title-id="admin-laboratories-title" eyebrow="Administración de plataforma" title="Laboratorios" description="Consulta y administra los laboratorios provisionados, sus suscripciones, paquetes y sucursales." icon="domain" />
    <div class="admin-laboratories-surface">
      <p v-if="error" class="platform-error" role="alert">{{ error }}</p>
      <BioNexusDataGrid
      v-model:search-model-value="search"
      :row-data="laboratories"
      :column-defs="columnDefs"
      :default-col-def="defaultColDef"
      :components="gridComponents"
      :get-row-id="getRowId"
      search-enabled
      search-placeholder="Buscar laboratorio"
      refresh-enabled
      :refreshing="loading"
      empty-text="No existen laboratorios registrados."
      @refresh="load"
    >
      <template #actions>
        <BioNexusActionButton label="Registrar laboratorio" icon="add" variant="primary" :disabled="loading" @click="provisioningDialog?.open()" />
      </template>
      </BioNexusDataGrid>
    </div>
    <PlatformLaboratoryDialog ref="provisioningDialog" @created="handleCreated" />
    <PlatformLaboratoryDetailsDialog ref="detailsDialog" @updated="handleUpdated" />
    <PlatformLaboratorySubscriptionDialog ref="subscriptionDialog" @updated="handleSubscriptionUpdated" />
    <PlatformLaboratoryPackagesDialog ref="packagesDialog" @changed="handlePackagesChanged" />
    <PlatformLaboratoryBranchesDialog ref="branchesDialog" @changed="handleBranchesChanged" />
    <PlatformLaboratoryDeleteDialog ref="deleteDialog" @deleted="handleDeleted" />
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import BioNexusDataGrid from '@/components/grid/BioNexusDataGrid.vue'
import BioNexusGridActionsCell from '@/components/grid/BioNexusGridActionsCell.vue'
import BioNexusActionButton from '@/components/ui/BioNexusActionButton.vue'
import BioNexusAdminPageHeader from '@/components/ui/BioNexusAdminPageHeader.vue'
import PlatformLaboratoryDialog from '@/components/platform/PlatformLaboratoryDialog.vue'
import PlatformLaboratoryDetailsDialog from '@/components/platform/PlatformLaboratoryDetailsDialog.vue'
import PlatformLaboratorySubscriptionDialog from '@/components/platform/PlatformLaboratorySubscriptionDialog.vue'
import PlatformLaboratoryPackagesDialog from '@/components/platform/PlatformLaboratoryPackagesDialog.vue'
import PlatformLaboratoryBranchesDialog from '@/components/platform/PlatformLaboratoryBranchesDialog.vue'
import PlatformLaboratoryDeleteDialog from '@/components/platform/PlatformLaboratoryDeleteDialog.vue'
import { useBioNexusToast } from '@/composables/useBioNexusToast'
import { getPlatformLaboratories } from '@/services/platformService'

const toast = useBioNexusToast()
const laboratories = ref([])
const loading = ref(false)
const error = ref('')
const search = ref('')
const provisioningDialog = ref(null)
const detailsDialog = ref(null)
const subscriptionDialog = ref(null)
const packagesDialog = ref(null)
const branchesDialog = ref(null)
const deleteDialog = ref(null)

const gridComponents = Object.freeze({ BioNexusGridActionsCell })
const actions = [
  { key: 'view', label: 'Ver configuración', icon: 'visibility', onClick: openDetails },
  { key: 'edit', label: 'Editar laboratorio', icon: 'edit', onClick: row => detailsDialog.value?.open(row.id, true) },
  { key: 'subscription', label: 'Gestionar suscripción', icon: 'credit_card', onClick: row => subscriptionDialog.value?.open(row) },
  { key: 'packages', label: 'Gestionar paquetes instalados', icon: 'inventory_2', onClick: row => packagesDialog.value?.open(row) },
  { key: 'branches', label: 'Gestionar sucursales', icon: 'account_tree', onClick: row => branchesDialog.value?.open(row) },
  { key: 'delete', label: 'Eliminar definitivamente', icon: 'delete_forever', variant: 'danger', onClick: row => deleteDialog.value?.open(row) },
]
const defaultColDef = Object.freeze({ sortable: true, filter: true, resizable: true, suppressHeaderMenuButton: true })
const columnDefs = computed(() => [
  { headerName: 'RIF', field: 'rif', minWidth: 150 },
  { headerName: 'Nombre', field: 'name', minWidth: 190, flex: 1 },
  { headerName: 'Razón social', field: 'businessName', minWidth: 220, flex: 1 },
  { headerName: 'Dirección', field: 'address', minWidth: 240, flex: 1 },
  { headerName: 'Sucursales', field: 'branchCount', width: 120, filter: 'agNumberColumnFilter' },
  { headerName: 'Paquetes de catálogo', field: 'catalogPackageCount', width: 180, filter: 'agNumberColumnFilter' },
  { headerName: 'Módulos', field: 'moduleCount', width: 110, filter: 'agNumberColumnFilter' },
  {
    colId: 'actions',
    headerName: 'Acciones',
    width: 270,
    minWidth: 270,
    maxWidth: 270,
    flex: 0,
    suppressSizeToFit: true,
    pinned: 'right',
    lockPinned: true,
    suppressMovable: true,
    sortable: false,
    filter: false,
    resizable: false,
    suppressHeaderMenuButton: true,
    headerClass: 'bio-nexus-grid-actions-header',
    cellClass: 'bio-nexus-grid-actions-cell',
    cellRenderer: BioNexusGridActionsCell,
    cellRendererParams: { actions },
  },
])

function getRowId(params) {
  return String(params.data.id)
}

async function load() {
  if (loading.value) return
  loading.value = true
  error.value = ''
  try {
    laboratories.value = await getPlatformLaboratories()
  } catch (cause) {
    error.value = cause?.message || 'No fue posible cargar los laboratorios.'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

function openDetails(row) {
  detailsDialog.value?.open(row.id, false)
}

async function handleCreated(result) {
  await load()
  toast.success('Laboratorio creado correctamente.')
  const laboratoryId = result?.laboratory?.id || result?.id
  if (laboratoryId) await detailsDialog.value?.open(laboratoryId, false)
}

async function handleUpdated() {
  await load()
  toast.success('Configuración del laboratorio actualizada.')
}

async function handleSubscriptionUpdated() {
  await load()
  toast.success('Suscripción actualizada correctamente.')
}

async function handlePackagesChanged() {
  await load()
  toast.success('Paquetes instalados actualizados.')
}

async function handleBranchesChanged() {
  await load()
  toast.success('Sucursales actualizadas.')
}

async function handleDeleted(laboratoryId) {
  laboratories.value = laboratories.value.filter(row => row.id !== laboratoryId)
  await load()
  toast.success('Laboratorio eliminado.')
}

onMounted(load)
</script>

<style scoped>
.platform-laboratories-view {
  display: grid;
  gap: var(--bio-nexus-space-5);
  min-width: 0;
  font-family: var(--bio-nexus-font-family);
  color: var(--bio-nexus-color-text);
}

.admin-laboratories-surface {
  min-width: 0;
  padding: var(--bio-nexus-space-5);
  border: 1px solid var(--bio-nexus-color-border);
  border-radius: var(--bio-nexus-radius-lg);
  background: var(--bio-nexus-color-surface);
  box-shadow: var(--bio-nexus-shadow-sm);
}

.platform-error {
  margin: 0 0 var(--bio-nexus-space-4);
  padding: var(--bio-nexus-space-3);
  border: 1px solid var(--bio-nexus-color-danger-border);
  border-radius: var(--bio-nexus-radius-md);
  color: var(--bio-nexus-color-danger);
  background: var(--bio-nexus-color-danger-soft);
  font-size: var(--bio-nexus-font-size-md);
}

.platform-laboratories-view :deep(.bio-nexus-grid-actions-cell),
.platform-laboratories-view :deep(.bio-nexus-grid-actions-header .ag-header-cell-label) {
  justify-content: center;
}
.platform-laboratories-view :deep(.bio-nexus-grid-action-list) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 246px;
  white-space: nowrap;
}

.platform-laboratories-view :deep(.bio-nexus-data-grid) {
  min-width: 0;
  border-radius: var(--bio-nexus-radius-lg);
}

.platform-laboratories-view :deep(.bio-nexus-action-button),
.platform-laboratories-view :deep(.bio-nexus-action-icon) {
  font-family: var(--bio-nexus-font-family);
}

@media (max-width: 760px) {
  .admin-laboratories-surface {
    padding: var(--bio-nexus-space-3);
  }
}
</style>
