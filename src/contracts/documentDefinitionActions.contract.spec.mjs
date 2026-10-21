import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const view=readFileSync("src/views/DocumentDefinitionsView.vue","utf8");
const service=readFileSync("src/services/documentDefinitionsService.js","utf8");

describe("Document definition actions",()=>{
  it("exposes duplicate and delete requests",()=>{
    for(const token of ["duplicateDocumentDefinition","/duplicate",'method: "POST"',"deleteDocumentDefinition",'method: "DELETE"']) assert.ok(service.includes(token),token);
  });
  it("shows duplicate and keeps delete visible for every authorized row",()=>{
    for(const token of ['key:"duplicate"','label:"Duplicar comprobante"','canCreate.value','key:"delete"','label:"Eliminar comprobante"','visible:()=>canUpdate.value']) assert.ok(view.includes(token),token);
  });
  it("uses the shared confirmation and opens the duplicated design",()=>{
    for(const token of ['<BioNexusConfirmDialog ref="deleteDialog" />','deleteDialog.value?.ask','Esta acción no se puede deshacer.','editDesign(copy)','Comprobante duplicado como']) assert.ok(view.includes(token),token);
  });
  it("disables active deletion in the grid and context menu",()=>{
    assert.ok(view.includes('disabled:row=>saving.value||Boolean(row?.isActive)'));
    assert.ok(view.includes('visible:canUpdate.value,disabled:saving.value||row.isActive'));
    assert.ok(view.includes('El comprobante activo no puede eliminarse.'));
    assert.ok(view.includes('if(!canUpdate.value||saving.value||!row||row.isActive)return'));
  });
});
