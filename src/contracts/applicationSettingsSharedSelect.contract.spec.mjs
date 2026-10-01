import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
const panel=readFileSync("src/components/application-settings/ApplicationSettingsPanel.vue","utf8"),shared=readFileSync("src/components/ui/BioNexusSearchableSelect.vue","utf8");
describe("Application Settings shared selects",()=>{
  it("usa el componente compartido en sus siete select",()=>{for(const id of["app-locale","app-time-zone","app-date-format","app-hour-cycle","app-first-day","app-financial-primary","app-decimal-separator"]){assert.ok(panel.includes(`<BioNexusSearchableSelect id="${id}"`),id);assert.ok(!panel.includes(`<select id="${id}"`),`native:${id}`)}});
  it("iguala la altura de los inputs de formulario",()=>{for(const token of["height:46px","min-height:46px","padding-block-start:12px","padding-block-end:7px"])assert.ok(shared.includes(token),token)});
  it("teleporta y posiciona el dropdown fuera de contenedores recortados",()=>{for(const token of['<Teleport to="body">','position:"fixed"','z-index:6000','getBoundingClientRect','addEventListener("scroll",onViewportChange,true)','placement.value=openAbove'])assert.ok(shared.includes(token),token)});
  it("preserva teclado y accesibilidad",()=>{for(const token of['role="combobox"','role="listbox"','ArrowDown','ArrowUp','Enter','Escape'])assert.ok(shared.includes(token),token)});
});