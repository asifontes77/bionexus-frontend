import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe,it } from "node:test";

const view=readFileSync("src/views/DocumentDefinitionsView.vue","utf8");

describe("Document definition delete visibility",()=>{
  it("shows delete in every authorized grid row",()=>{
    assert.ok(view.includes('label:"Eliminar comprobante"'));
    assert.ok(view.includes('visible:()=>canUpdate.value'));
    assert.ok(view.includes('disabled:row=>saving.value||Boolean(row?.isActive)'));
    assert.equal(view.includes('visible:row=>canUpdate.value&&!row?.isActive'),false);
  });
  it("shows but disables delete for active context-menu rows",()=>{
    assert.ok(view.includes('visible:canUpdate.value,disabled:saving.value||row.isActive'));
    assert.equal(view.includes('visible:canUpdate.value&&!row.isActive'),false);
  });
  it("explains why active deletion is disabled and preserves the Backend guard",()=>{
    const message='El comprobante activo no puede eliminarse.';
    assert.ok(view.includes(message));
    assert.ok(view.includes('if(!canUpdate.value||saving.value||!row||row.isActive)return'));
  });
});
