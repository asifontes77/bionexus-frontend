<template>
  <BioNexusDialog ref="box" size="wide" kicker="Catálogo de exámenes" title="Agregar exámenes">
    <section class="scope-body">
      <p class="scope-help">Agrega exámenes por grupo o búscalos en todo el catálogo. Los exámenes ya incluidos permanecen ocultos.</p>

      <div class="scope-actions">
        <button type="button" class="bio-nexus-action bio-nexus-action-secondary" :disabled="loading" @click="confirmAll">Agregar todos los exámenes</button>
        <button type="button" class="bio-nexus-action bio-nexus-action-secondary" :disabled="!groupId || loading" @click="confirmGroup">Agregar grupo completo</button>
      </div>

      <div class="scope-filters">
        <BioNexusFormField label="Grupo" field-id="adjust-scope-group">
          <BioNexusLiveSearchSelect v-model="groupId" :options="groups" placeholder="Selecciona un grupo" search-placeholder="Buscar grupo" @change="selectGroup" />
        </BioNexusFormField>
        <BioNexusFormField label="Buscar en todo el catálogo" field-id="adjust-global-search">
          <div class="global-search-control">
            <input id="adjust-global-search" v-model.trim="globalSearch" class="global-search-input" type="search" placeholder="Nombre o abreviatura del examen" autocomplete="off" @keydown.enter.prevent="searchGlobal">
            <button type="button" class="bio-nexus-action bio-nexus-action-primary global-search-button" :disabled="globalSearch.trim().length < 2 || loading" @click="searchGlobal">Buscar</button>
          </div>
        </BioNexusFormField>
      </div>

      <div class="scope-mode" role="status">
        <strong>{{ sourceTitle }}</strong>
        <button v-if="mode === 'global'" type="button" class="scope-clear" @click="clearGlobal">Volver al grupo</button>
      </div>

      <BioNexusDataGrid
        :row-data="available"
        :column-defs="columns"
        :get-row-id="getId"
        :row-selection="selection"
        :search-enabled="true"
        v-model:search-model-value="gridSearch"
        search-placeholder="Filtrar resultados"
        :export-options="false"
        :page-size="10"
        :page-size-selector="[10,20,50,100]"
        :min-grid-height="330"
        :max-grid-height="500"
        :empty-text="emptyText"
        @grid-ready="ready"
      >
        <template #stats><span>{{ selected.length }} seleccionado(s)</span></template>
        <template #actions><button type="button" class="bio-nexus-action bio-nexus-action-primary" :disabled="selected.length === 0" @click="confirmSelected">Agregar seleccionados</button></template>
      </BioNexusDataGrid>

      <div v-if="error" class="bio-nexus-message bio-nexus-message-error">{{ error }}</div>
      <ExamPriceAdjustmentConfirmDialog ref="confirmDialog" @confirm="runConfirmed" />
    </section>
    <template #footer><button type="button" class="bio-nexus-action bio-nexus-action-secondary" @click="close">Cerrar</button></template>
  </BioNexusDialog>
</template>

<script setup>
import { computed, ref } from "vue";
import BioNexusDataGrid from "@/components/grid/BioNexusDataGrid.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
import BioNexusFormField from "@/components/ui/BioNexusFormField.vue";
import BioNexusLiveSearchSelect from "@/components/ui/BioNexusLiveSearchSelect.vue";
import ExamPriceAdjustmentConfirmDialog from "@/components/examcatalog/ExamPriceAdjustmentConfirmDialog.vue";
import { getExam, getExamsByGroup, searchExamCatalog } from "@/services/examCatalogService";
import { useBioNexusToast } from "@/composables/useBioNexusToast";

const props = defineProps({ groups: { type: Array, default: () => [] }, excludedIds: { type: Array, default: () => [] } });
const emit = defineEmits(["add"]);
const toast = useBioNexusToast();
const box = ref(null), confirmDialog = ref(null), groupId = ref(0), cache = ref(new Map()), loading = ref(false), gridSearch = ref(""), globalSearch = ref(""), globalRows = ref([]), mode = ref("group"), api = ref(null), selected = ref([]), error = ref(""), pending = ref("");
const excluded = computed(() => new Set(props.excludedIds.map(Number)));
const current = computed(() => cache.value.get(groupId.value) || []);
const sourceRows = computed(() => mode.value === "global" ? globalRows.value : current.value);
const available = computed(() => sourceRows.value.filter(row => !excluded.value.has(Number(row.id)) && !row.annulled).map(row => ({ ...row, group_description: row.group_description || props.groups.find(group => group.id === row.group_id)?.description || "" })));
const sourceTitle = computed(() => mode.value === "global" ? `Resultados globales: ${available.value.length}` : groupId.value ? `Exámenes del grupo: ${available.value.length}` : "Selecciona un grupo o realiza una búsqueda global");

const emptyText = computed(() => mode.value === "global" ? "No existen exámenes globales disponibles para agregar." : "Selecciona un grupo o usa la búsqueda global.");
const columns = Object.freeze([{ field: "group_description", headerName: "Grupo", minWidth: 240, flex: 1 }, { field: "description", headerName: "Examen", minWidth: 340, flex: 1.6, checkboxSelection: true, headerCheckboxSelection: true }, { field: "abbreviation", headerName: "Abreviatura", minWidth: 170, flex: .7 }]);
const selection = Object.freeze({ mode: "multiRow", checkboxes: true, headerCheckbox: true, selectAll: "filtered" });

function getId({ data }) { return String(data.id); }
function ready(event) { api.value = event.api; event.api.addEventListener("selectionChanged", () => selected.value = event.api.getSelectedRows() || []); event.api.sizeColumnsToFit?.(); }
async function selectGroup(group) { groupId.value = Number(group?.id || 0); mode.value = "group"; gridSearch.value = ""; selected.value = []; api.value?.deselectAll?.(); await loadGroup(); }
async function loadGroup() { if (!groupId.value || cache.value.has(groupId.value)) return; loading.value = true; error.value = ""; try { const rows = await getExamsByGroup(groupId.value); cache.value = new Map(cache.value).set(groupId.value, rows); } catch (exception) { error.value = String(exception?.message || "No fue posible cargar el grupo."); } finally { loading.value = false; } }
async function searchGlobal() { const term = globalSearch.value.trim(); if (term.length < 2 || loading.value) return; loading.value = true; error.value = ""; try { const rows = await searchExamCatalog(term, 30); globalRows.value = rows; mode.value = "global"; gridSearch.value = ""; selected.value = []; api.value?.deselectAll?.(); if (!available.value.length) toast.info("No se encontraron exámenes nuevos para agregar."); } catch (exception) { globalRows.value = []; error.value = String(exception?.message || "No fue posible realizar la búsqueda global."); } finally { loading.value = false; } }
function clearGlobal() { mode.value = "group"; globalRows.value = []; globalSearch.value = ""; gridSearch.value = ""; selected.value = []; api.value?.deselectAll?.(); }
function ask(type, title, message, label) { pending.value = type; confirmDialog.value?.open({ title, message, label, showInactiveOption: true }); }
function confirmGroup() { const group = props.groups.find(item => item.id === groupId.value); ask("group", "Agregar grupo completo", "¿Está seguro de agregar los exámenes de este grupo?", group?.description || "Grupo seleccionado"); }
function confirmAll() { ask("all", "Agregar todo el catálogo", "¿Está seguro de agregar los exámenes del laboratorio?", `${props.groups.length} grupo(s) disponibles`); }
function confirmSelected() { ask("selected", "Agregar seleccionados", "¿Está seguro de agregar los exámenes seleccionados?", `${selected.value.length} examen(es) seleccionado(s)`); }
async function runConfirmed(options) { const includeInactive = Boolean(options?.includeInactive); if (pending.value === "group") await addGroup(includeInactive); else if (pending.value === "all") await addAll(includeInactive); else if (pending.value === "selected") await addSelected(includeInactive); pending.value = ""; }
function eligible(rows, includeInactive) { return (rows || []).filter(row => !excluded.value.has(Number(row.id)) && (includeInactive || !row.annulled)); }
async function addGroup(includeInactive) { await loadGroup(); publish(eligible(current.value, includeInactive)); }
async function addSelected(includeInactive) { const selectedRows = eligible(selected.value, includeInactive); const fullRows = []; loading.value = true; error.value = ""; try { for (const row of selectedRows) fullRows.push(mode.value === "global" ? await getExam(row.id) : row); publish(fullRows); api.value?.deselectAll?.(); selected.value = []; } catch (exception) { error.value = String(exception?.message || "No fue posible cargar los exámenes seleccionados."); } finally { loading.value = false; } }
async function addAll(includeInactive) { loading.value = true; error.value = ""; try { const rows = []; for (const group of props.groups) { let items = cache.value.get(group.id); if (!items) { items = await getExamsByGroup(group.id); cache.value = new Map(cache.value).set(group.id, items); } rows.push(...eligible(items, includeInactive)); } publish(rows); } catch (exception) { error.value = String(exception?.message || "No fue posible cargar todo el catálogo."); } finally { loading.value = false; } }
function publish(rows) { const unique = [...new Map((rows || []).map(row => [row.id, row])).values()]; if (!unique.length) { toast.info("No hay exámenes nuevos para agregar."); return; } emit("add", unique); toast.success(`${unique.length} examen(es) agregado(s) a la lista.`); }
function open() { groupId.value = 0; mode.value = "group"; globalRows.value = []; globalSearch.value = ""; gridSearch.value = ""; selected.value = []; error.value = ""; box.value?.open(); }
function close() { box.value?.close(); }
defineExpose({ open });
</script>

<style scoped>
.scope-body{display:grid;gap:12px;width:100%;min-width:0}
.scope-help{margin:0;padding:10px 12px;border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-info-soft);color:var(--bio-nexus-color-text-secondary)}
.scope-actions{display:flex;gap:10px;flex-wrap:wrap}
.scope-filters{display:grid;grid-template-columns:minmax(280px,.8fr) minmax(360px,1.2fr);gap:14px;align-items:start}
.scope-filters :deep(.bio-nexus-form-field){margin:0;min-width:0}
.scope-filters :deep(.bio-nexus-form-field-control){min-width:0}
.global-search-control{display:grid;grid-template-columns:minmax(0,1fr) 108px;gap:8px;align-items:start;min-width:0}
.global-search-input{all:unset;box-sizing:border-box;display:block;width:100%;height:38px;min-height:38px;max-height:38px;padding:0 12px;border:1px solid var(--bio-nexus-color-border-strong);border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-surface);color:var(--bio-nexus-color-text-primary);font:inherit;line-height:1.2}
.global-search-input::placeholder{color:var(--bio-nexus-color-text-muted);opacity:1}
.global-search-input:focus{border-color:var(--bio-nexus-color-primary);box-shadow:0 0 0 3px var(--bio-nexus-color-focus-ring);outline:0}
.global-search-input::-webkit-search-cancel-button{cursor:pointer}
.global-search-button{box-sizing:border-box;height:38px;min-height:38px;max-height:38px;margin:0;padding:0 14px;align-self:start}
.scope-mode{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:34px;color:var(--bio-nexus-color-primary-strong)}
.scope-clear{padding:4px 8px;border:0;background:transparent;color:var(--bio-nexus-color-primary);font-weight:700;cursor:pointer}
.scope-body :deep(.bio-nexus-data-grid),.scope-body :deep(.ag-root-wrapper){width:100%;min-width:0}
@media(max-width:820px){.scope-filters{grid-template-columns:1fr}.global-search-control{grid-template-columns:1fr}.global-search-button{width:100%}}
</style>
