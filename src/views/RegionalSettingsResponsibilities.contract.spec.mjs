import fs from "node:fs";
import path from "node:path";

const text = fs.readFileSync(
  path.join(process.cwd(), "src/components/application-settings/ApplicationSettingsPanel.vue"),
  "utf8",
);

for (const title of [
  "Contexto regional",
  "Fecha y hora",
  "Presentación monetaria",
  "Vista previa",
]) {
  if (!text.includes(`title="${title}"`)) {
    throw new Error(`REGIONAL_SECTION_MISSING_${title}`);
  }
}

for (const token of [
  "BioNexusSectionPanel",
  'variant="accent"',
  "regional-layout",
  "regional-main",
  "preview-panel",
  "fields-grid-three",
]) {
  if (!text.includes(token)) throw new Error(`REGIONAL_LAYOUT_MISSING_${token}`);
}

const controlIds = [
  ...text.matchAll(/<(?:input|select)\b[^>]*\sid="(app-[^"]+)"/g),
  ...text.matchAll(/<BioNexusSearchableSelect\b[^>]*\sid="(app-[^"]+)"/g),
].map((match) => match[1]);
const duplicateControlIds = controlIds.filter(
  (value, index) => controlIds.indexOf(value) !== index,
);
if (duplicateControlIds.length > 0) {
  throw new Error(`REGIONAL_DUPLICATE_CONTROL_IDS_${[...new Set(duplicateControlIds)].join("_")}`);
}

for (const id of [
  "app-locale",
  "app-time-zone",
  "app-date-format",
  "app-hour-cycle",
  "app-first-day",
  "app-local-currency",
  "app-base-currency",
  "app-financial-primary",
  "app-decimal-separator",
]) {
  if (!controlIds.includes(id)) throw new Error(`REGIONAL_CONTROL_MISSING_${id}`);
}

for (const retiredId of [
  "app-currency",
  "app-currency-symbol",
  "app-symbol-position",
  "app-price-base",
  "app-base-currency-symbol",
  "app-base-symbol-position",
  "app-monetary-decimals",
]) {
  if (controlIds.includes(retiredId)) throw new Error(`RETIRED_REGIONAL_CONTROL_PRESENT_${retiredId}`);
}

if (!text.includes("BioNexusSearchableSelect") || !text.includes(':options="financialCurrencyOptions"')) {
  throw new Error("SHARED_FINANCIAL_CURRENCY_SELECT_MISSING");
}

if (!text.includes("Los símbolos, posiciones y decimales se administran únicamente en el catálogo Monedas.")) {
  throw new Error("CURRENCY_CATALOG_RESPONSIBILITY_MISSING");
}

console.log("[OK] Formatos regionales usan SectionPanel, controles unicos y Monedas como fuente monetaria.");