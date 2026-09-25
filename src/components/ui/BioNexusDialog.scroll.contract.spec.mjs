import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
const dialog=readFileSync("src/components/ui/BioNexusDialog.vue","utf8");
describe("BioNexusDialog scroll reset",()=>{
  it("referencia el cuerpo desplazable central",()=>{
    assert.ok(dialog.includes('ref="body" class="bio-nexus-dialog-body"'));
    assert.equal((dialog.match(/const body = ref\(null\);/g)||[]).length,1);
  });
  it("reinicia ambos ejes sin desplazar la pagina",()=>{
    assert.ok(dialog.includes('body.value.scrollTop = 0'));
    assert.ok(dialog.includes('body.value.scrollLeft = 0'));
    assert.ok(!dialog.includes('window.scrollTo('));
  });
  it("reinicia antes y despues del render de apertura",()=>{
    const sequence='resetBodyScroll();\n  await nextTick();\n  resetBodyScroll();';
    assert.ok(dialog.includes(sequence));
    assert.ok(dialog.indexOf(sequence)>dialog.indexOf('dialog.value.showModal();'));
  });
  it("mantiene el foco inicial sin alterar el scroll",()=>{
    assert.ok(dialog.includes('initialControl.focus({ preventScroll: true })'));
    assert.ok(dialog.includes('dialog.value.focus({ preventScroll: true })'));
  });
});
