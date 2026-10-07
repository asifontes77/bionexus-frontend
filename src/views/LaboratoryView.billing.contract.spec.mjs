import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(currentDirectory, "../..");
const source = fs.readFileSync(path.join(root, "src/views/LaboratoryView.vue"), "utf8");
const router = fs.readFileSync(path.join(root, "src/router/index.js"), "utf8");

test("renderiza directamente Factura y Toma de muestra", () => {
  assert.match(source, /<LaboratoryBillingPanel v-if="!isCommunicationsRoute"/);
  assert.match(router, /configuration\/billing\/general/);
});

test("elimina visualmente tabs y paneles duplicados", () => {
  assert.doesNotMatch(source, /<BioNexusTabs|<LaboratoryLogoPanel|<LaboratoryGeneralPanel/);
});

test("preserva Comunicaciones como alternativa independiente", () => {
  assert.match(source, /<LaboratoryEmailPanel v-else-if="isCommunicationsRoute"/);
  assert.match(router, /configuration-laboratory-communications/);
});

test("mantiene carga guardado permiso y descarte", () => {
  assert.match(source, /onMounted\(\(\) => \{[^}]*load\(\)/s);
  assert.match(source, /await updateLaboratory\(/);
  assert.match(source, /laboratory\.update/);
  assert.match(source, /confirmDiscard/);
});

test("usa componentes visuales compartidos en Facturacion", () => {
  const panel = fs.readFileSync(path.join(root, "src/components/laboratory/LaboratoryBillingPanel.vue"), "utf8");
  assert.match(source, /<BioNexusActionButton/);
  assert.match(panel, /<BioNexusSectionPanel/);
  assert.match(panel, /<BioNexusCheckbox/);
  assert.match(panel, /<BioNexusNumericInput/);
  assert.doesNotMatch(panel, /<input[^>]+type="(?:checkbox|number)"/);
});

test("aplica accent iconos reales y enteros", () => {
  const panel = fs.readFileSync(path.join(root, "src/components/laboratory/LaboratoryBillingPanel.vue"), "utf8");
  assert.match(panel, /variant="accent"/);
  assert.match(panel, /:icon="section\.icon"/);
  assert.match(panel, /icon:"receipt_long"/);
  assert.match(panel, /icon:"description"/);
  assert.match(panel, /icon:"science"/);
  assert.equal((panel.match(/:decimals="0"/g) || []).length, 2);
  assert.doesNotMatch(panel, /icon="document"|variant="default"/);
});

test("muestra descripciones breves en las secciones", () => {
  const panel = fs.readFileSync(path.join(root, "src/components/laboratory/LaboratoryBillingPanel.vue"), "utf8");
  assert.match(panel, /:description="section\.description"/);
  assert.match(panel, /Configura la impresión y numeración de las facturas\./);
  assert.match(panel, /Configura la impresión y numeración de los comprobantes\./);
  assert.match(panel, /Configura la impresión y numeración de la toma de muestra\./);
});
