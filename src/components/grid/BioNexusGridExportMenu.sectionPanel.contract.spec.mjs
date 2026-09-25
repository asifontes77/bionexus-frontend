import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
const menu=readFileSync("src/components/grid/BioNexusGridExportMenu.vue","utf8");
describe("Grid export SectionPanel",()=>{
  it("usa dos paneles accent compartidos",()=>{
    assert.equal((menu.match(/<BioNexusSectionPanel\b/g)||[]).length,2);
    assert.ok(menu.includes('title="Formato del archivo"'));
    assert.ok(menu.includes('title="Columnas incluidas"'));
    assert.equal((menu.match(/variant="accent"/g)||[]).length,2);
  });
  it("mantiene formato, orientacion y columnas",()=>{
    for(const token of ['value="excel"','value="pdf"','value="portrait"','value="landscape"','v-for="column in availableColumns"','v-model="selectedColumnIds"']) assert.ok(menu.includes(token),token);
  });
  it("ubica el error general arriba mediante el componente compartido",()=>{
    assert.ok(menu.includes('<BioNexusFormErrors :errors="errorMessage" />'));
    assert.ok(menu.indexOf('BioNexusFormErrors')<menu.indexOf('title="Formato del archivo"'));
    assert.ok(!menu.includes('<p v-if="errorMessage" class="bio-nexus-message'));
  });
  it("conserva acciones y limites PDF",()=>{
    for(const token of ['@click="selectAll"','@click="clearAll"','@click.prevent="confirmExport"','maximumColumns = orientation.value === "landscape" ? 10 : 6','emit("export"']) assert.ok(menu.includes(token),token);
  });
  it("mantiene completo el dialogo sin ocultar columnas detras del footer",()=>{
    assert.ok(menu.includes("max-height: min(22vh, 190px)"));
    assert.ok(menu.includes("overflow-y: auto"));
    assert.ok(menu.includes("scrollbar-gutter: stable"));
    assert.ok(!menu.includes("max-height: min(30vh, 280px)"));
  });  it("conserva diseno compacto y responsive",()=>{
    assert.ok(menu.includes('grid-template-columns: repeat(2, minmax(0, 1fr))'));
    assert.ok(menu.includes('@media (max-width: 700px)'));
    assert.ok(menu.includes('grid-template-columns: 1fr'));
  });
});
