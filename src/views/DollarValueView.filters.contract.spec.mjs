import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("./DollarValueView.vue", import.meta.url), "utf8");

test("Fuente y Forma reutilizan BioNexusOptionFilter", () => {
  assert.match(source, /import BioNexusOptionFilter from "@\/components\/grid\/BioNexusOptionFilter\.vue";/);
  assert.match(source, /headerName:"Fuente"[\s\S]*?filter:BioNexusOptionFilter[\s\S]*?headerName:"Forma"[\s\S]*?filter:BioNexusOptionFilter/);
});

test("Fuente filtra el valor presentado y distingue publicaciones manuales", () => {
  assert.match(source, /getValue:node=>node\.data\?\.updateMethod==="MANUAL"\?"MANUAL":node\.data\?\.source\|\|"UNKNOWN"/);
  for (const option of ["BCV", "DOLAR_API", "MANUAL", "OTHER", "UNKNOWN"]) assert.match(source, new RegExp(`value:"${option}"`));
  assert.match(source, /value:"MANUAL",label:"Publicación manual"/);
});

test("Forma ofrece las opciones cerradas del historial", () => {
  assert.match(source, /headerName:"Forma"[\s\S]*?options:\[\{value:"AUTOMATIC",label:"Automática"\},\{value:"MANUAL",label:"Manual"\},\{value:"UNKNOWN",label:"No identificada"\}\]/);
});

test("Los filtros no cambian fechas, valor ni busqueda general", () => {
  assert.match(source, /headerName:"Actualizado el"[\s\S]*?filter:"agDateColumnFilter"/);
  assert.match(source, /headerName:"Valor"[\s\S]*?filter:"agNumberColumnFilter"/);
  assert.match(source, /search-placeholder="Buscar en el historial"/);
});
