<template>
  <section class="platform-laboratories-view">
    <p v-if="error" class="platform-error" role="alert">{{ error }}</p>
    <BioNexusDataGrid
      v-model:search-model-value="search"
      :row-data="laboratories"
      :column-defs="columnDefs"
      :get-row-id="getRowId"
      search-enabled
      refresh-enabled
      :refreshing="loading"
      empty-text="No existen laboratorios registrados."
      @refresh="load"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import BioNexusDataGrid from "@/components/grid/BioNexusDataGrid.vue";
import { getPlatformLaboratories } from "@/services/platformService";

const laboratories = ref([]);
const loading = ref(false);
const error = ref("");
const search = ref("");
const columnDefs = computed(() => [
  { headerName: "RIF", field: "rif", minWidth: 150 },
  { headerName: "Nombre", field: "name", minWidth: 190, flex: 1 },
  { headerName: "Razón social", field: "businessName", minWidth: 220, flex: 1 },
  { headerName: "Dirección", field: "address", minWidth: 240, flex: 1 },
  { headerName: "Sucursales", field: "branchCount", width: 120, filter: "agNumberColumnFilter" },
  { headerName: "Módulos", field: "moduleCount", width: 110, filter: "agNumberColumnFilter" },
]);
const getRowId = (params) => String(params.data.id);
async function load() {
  loading.value = true;
  error.value = "";
  try {
    laboratories.value = await getPlatformLaboratories();
  } catch {
    error.value = "No fue posible cargar los laboratorios.";
  } finally {
    loading.value = false;
  }
}
onMounted(load);
</script>

<style scoped>
.platform-laboratories-view { display: grid; gap: var(--bio-nexus-space-3); min-width: 0; }
.platform-error { margin: 0; padding: 12px; border-radius: var(--bio-nexus-radius-md); background: var(--bio-nexus-color-danger-soft); color: var(--bio-nexus-color-danger); }
</style>
