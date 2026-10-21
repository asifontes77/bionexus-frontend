import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe,it } from "node:test";

const view=readFileSync("src/views/DocumentDefinitionsView.vue","utf8");

describe("Document definition activation grid",()=>{
  it("synchronizes the activated definition and its siblings",()=>{
    for(const token of ['function synchronizeDefinitionState(saved,targetState)','item.id===saved.id','isActive:targetState','targetState&&item.laboratoryId===saved.laboratoryId','item.documentType===saved.documentType','isActive:false']) assert.ok(view.includes(token),token);
  });
  it("uses local synchronization in the state handler",()=>{
    const start=view.indexOf('async function confirmStateChange(row)');
    const end=view.indexOf('onMounted(load)',start);
    const flow=view.slice(start,end);
    assert.ok(flow.includes('synchronizeDefinitionState(saved,targetState)'));
    assert.equal(flow.includes('if(saved)replaceRow(saved)'),false);
    assert.equal(flow.includes('await load()'),false);
  });
  it("keeps the load concurrency guard intact",()=>{
    assert.ok(view.includes('async function load(){if(loading.value||saving.value)return;'));
  });
});
