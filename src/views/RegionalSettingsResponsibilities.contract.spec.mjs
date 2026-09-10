import fs from "node:fs";
import path from "node:path";

const text = fs.readFileSync(
  path.join(process.cwd(), "src/components/application-settings/ApplicationSettingsPanel.vue"),
  "utf8",
);

const sections = [
  ["regional-context-title", "Región"],
  ["regional-date-title", "Fecha y hora"],
  ["regional-local-title", "Moneda local"],
  ["regional-base-title", "Moneda base de precios"],
  ["regional-number-title", "Presentación numérica y financiera"],
];

for (const [id, title] of sections) {
  if (!text.includes(`id="${id}"`) || !text.includes(`>${title}</h4>`)) {
    throw new Error(`REGIONAL_SECTION_MISSING_${id}`);
  }
}

for (const token of [
  "regional-responsibility-list",
  "regional-section-grid-three",
  'aria-labelledby="regional-base-title"',
]) {
  if (!text.includes(token)) throw new Error(`REGIONAL_LAYOUT_MISSING_${token}`);
}

const controlIds = [...text.matchAll(/<(?:input|select)\b[^>]*\sid="(app-[^"]+)"/g)].map(
  (match) => match[1],
);
const duplicateControlIds = controlIds.filter(
  (value, index) => controlIds.indexOf(value) !== index,
);

if (duplicateControlIds.length > 0) {
  throw new Error(`REGIONAL_DUPLICATE_CONTROL_IDS_${[...new Set(duplicateControlIds)].join("_")}`);
}

const requiredControlIds = [
  "app-locale",
  "app-time-zone",
  "app-date-format",
  "app-hour-cycle",
  "app-first-day",
  "app-currency",
  "app-currency-symbol",
  "app-symbol-position",
  "app-price-base",
  "app-base-currency-symbol",
  "app-base-symbol-position",
  "app-financial-primary",
  "app-monetary-decimals",
  "app-decimal-separator",
];

for (const id of requiredControlIds) {
  if (!controlIds.includes(id)) throw new Error(`REGIONAL_CONTROL_MISSING_${id}`);
}

console.log("[OK] Formatos regionales separados por responsabilidad y controles únicos.");
