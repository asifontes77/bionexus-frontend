<template>
  <BioNexusDialog ref="dialog" size="wide" kicker="Detalle del catálogo" title="Ver examen" :subtitle="exam?.description || ''" @close="handleClosed">
<section v-if="exam" class="exam-detail-content">
        <BioNexusSectionPanel title="Información del examen" icon="science" description="Consulta la identificación, clasificación y estado del examen." variant="accent">
          <div class="exam-detail-summary">
            <article class="wide"><span>Descripción</span><strong>{{ exam.description || "Sin descripcion" }}</strong></article>
            <article><span>Abreviatura</span><strong>{{ exam.abbreviation || "Sin abreviatura" }}</strong></article>
            <article class="wide"><span>Grupo</span><strong>{{ group?.description || "Sin grupo" }}</strong></article>
            <article><span>Estado</span><strong :class="exam.annulled ? 'inactive' : 'active'">{{ exam.annulled ? "Desactivado" : "Activo" }}</strong></article>
            <article><span>Prueba especial</span><strong>{{ exam.special_test ? "Si" : "No" }}</strong></article>
            <article><span>Tipo de impuesto</span><strong>{{ taxLabel }}</strong></article>
          </div>
        </BioNexusSectionPanel>
        <BioNexusSectionPanel title="Tarifas" icon="price_change" description="Consulta el precio del examen para cada tarifa disponible." variant="accent">
          <div class="exam-price-grid"><article v-for="tariff in tariffFields" :key="tariff.id"><span>{{ tariff.name }} ({{ baseCurrencySymbol }})</span><strong>{{ money(exam[`cost${tariff.position}`]) }}</strong></article></div>
        </BioNexusSectionPanel>
        <BioNexusSectionPanel title="Configuración del resultado" icon="settings" description="Verifica la disponibilidad de la hoja de trabajo y del formato de resultado." variant="accent">
          <div class="exam-config-grid">
            <article><span>Hoja de trabajo</span><strong :class="hasWorksheet ? 'configured' : 'pending'">{{ hasWorksheet ? "Configurada" : "No configurada" }}</strong></article>
            <article><span>Formato de resultado</span><strong :class="hasResultFormat ? 'configured' : 'pending'">{{ hasResultFormat ? "Configurado" : "No configurado" }}</strong></article>
          </div>
        </BioNexusSectionPanel>
      </section>
    <template #footer><BioNexusActionButton variant="secondary" icon="close" @click="close">Cerrar</BioNexusActionButton></template>
  </BioNexusDialog>
</template>
<script setup>
import { formatRegionalNumber, formatUsdPrice } from "@/services/regionalFormatter";
import { useRegionalSettingsStore } from "@/stores/regionalSettings";
import { computed, nextTick, ref } from "vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
import BioNexusActionButton from "@/components/ui/BioNexusActionButton.vue";
import BioNexusSectionPanel from "@/components/ui/BioNexusSectionPanel.vue";
const props = defineProps({ taxes: { type: Array, default: () => [] }, tariffs: { type: Array, default: () => [] } });
const dialog = ref(null); const exam = ref(null); const group = ref(null);
const regionalSettings = useRegionalSettingsStore();
const baseCurrencySymbol = computed(() => String(regionalSettings.settings.base_currency_symbol || 'USD').trim() || 'USD');
const tariffFields = computed(() => props.tariffs.filter(t => Number(t.position) >= 1 && Number(t.position) <= 6).sort((a,b) => Number(a.position) - Number(b.position)));
const tax = computed(() => props.taxes.find((item) => Number(item.id) === Number(exam.value?.tax_id)) ?? null);
const taxLabel = computed(() => { const digits = Number(regionalSettings.settings.monetary_decimals) || 0; return tax.value ? tax.value.description + " - " + formatRegionalNumber(tax.value.value || 0, regionalSettings.settings, { minimumFractionDigits: digits, maximumFractionDigits: digits }) + " %" : "Impuesto no disponible"; });
const hasWorksheet = computed(() => typeof exam.value?.work_sheet === "string" && exam.value.work_sheet.trim() !== "");
const hasResultFormat = computed(() => { const value = exam.value?.format_grid; if (value === null || value === undefined || value === "") return false; if (typeof value === "string") { try { return Boolean(JSON.parse(value)); } catch { return value.trim() !== ""; } } return typeof value === "object"; });
function money(value) { return formatUsdPrice(value, regionalSettings.settings); }
async function show(record, selectedGroup) { exam.value = record; group.value = selectedGroup; dialog.value?.open(); await nextTick();  }
function handleClosed() { exam.value = null; group.value = null; }
function close() { dialog.value?.close(); exam.value = null; group.value = null; }

defineExpose({ show, close });
</script>
