import fs from "node:fs";
import path from "node:path";

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), "utf8");
const panel = read("src/components/application-settings/ApplicationSettingsPanel.vue");
const view = read("src/views/ApplicationSettingsView.vue");
const router = read("src/router/index.js");
const all = `${panel}\n${view}\n${read("src/models/applicationSettings.js")}\n${read("src/services/applicationSettingsService.js")}`;

for (const token of ["Ã", "�", "├"]) {
  if (all.includes(token)) throw new Error(`CORRUPT:${token.codePointAt(0).toString(16)}`);
}

for (const text of [
  "Contexto regional",
  "Así se mostrará la información",
  "Español (Venezuela)",
  "Presentación monetaria",
  "Moneda local",
  "Moneda base",
  "Visualización financiera principal",
  "Número",
  "Duración y control de la sesión",
]) {
  if (!panel.includes(text)) throw new Error(`MISSING:${text}`);
}

for (const forbidden of ["Símbolo monetario", "Posición del símbolo"]) {
  if (panel.includes(forbidden)) throw new Error(`DUPLICATED_MONETARY_UI:${forbidden}`);
}
for (const tab of ["key:'regional'", "key:'session'", "key:'printer'"]) {
  if (!view.includes(tab)) throw new Error(`TAB:${tab}`);
}
if (!view.includes("BioNexusFormErrors") || !view.includes("BioNexusActionButton")) {
  throw new Error("SHARED_VIEW_COMPONENTS_MISSING");
}
if (!panel.includes("BioNexusSectionPanel") || panel.includes('class="bio-nexus-panel')) {
  throw new Error("SHARED_SECTION_PANEL_CONTRACT_FAILED");
}

const cards = router.split(/\r?\n/).filter((line) => line.includes('routeName: "configuration-application-settings"'));
if (cards.length !== 1) throw new Error(`CARD_COUNT_${cards.length}`);
if (!cards[0].includes('query: { tab: "regional" }')) throw new Error("CARD_TAB");

console.log("[OK] Contrato de reparacion regional actualizado a componentes compartidos.");