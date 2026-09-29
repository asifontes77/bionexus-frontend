import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, it } from "node:test";
const read=p=>fs.readFileSync(p,"utf8");
const files=[
 "src/components/antibiotics/AntibioticDialog.vue",
 "src/components/examcatalog/ExamDialog.vue",
 "src/components/grid/BioNexusGridExportMenu.vue",
 "src/views/ExamOrderingView.vue",
 "src/views/TariffsView.vue"
];
describe("espaciado global de errores generales",()=>{
 it("centraliza el gap en BioNexusFormLayout",()=>{const s=read("src/components/ui/BioNexusFormLayout.vue");assert.ok(s.includes("gap: 0"));assert.ok(s.includes(".bio-nexus-form-layout > * + *"));assert.ok(s.includes("margin-block-start: var(--bio-nexus-space-4)"));});
 it("todos los consumidores con error y SectionPanel usan el layout global",()=>{for(const file of files){const s=read(file);assert.ok(s.includes("<BioNexusFormLayout"),file);assert.ok(s.indexOf("BioNexusFormErrors")<s.indexOf("BioNexusSectionPanel"),file);}});
 it("Tarifas aplica el layout dentro del form",()=>{const s=read("src/views/TariffsView.vue");assert.match(s,/<form[^>]*>[\s\S]*?<BioNexusFormLayout>[\s\S]*?<BioNexusFormErrors/);});
 it("Rutinas conserva el patron visual aprobado sin modificacion estructural",()=>{const s=read("src/components/routines/RoutineDialog.vue").replace(/\s+/g,"");assert.match(s,/\.routine-body\{display:grid;gap:/);});
});
