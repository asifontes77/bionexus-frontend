import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const source = readFileSync(join(process.cwd(), "src/components/routines/RoutineDialog.vue"), "utf8");
const theme = readFileSync(join(process.cwd(), "src/styles/components.css"), "utf8");

describe("Routine dialog current standards", () => {
  it("usa dos SectionPanel accent", () => {
    assert.match(source,/title="Información de la rutina"[^>]*icon="assignment"[^>]*variant="accent"/);
    assert.match(source,/title="Gestión de exámenes"[^>]*icon="playlist_add_check"[^>]*variant="accent"/);
    assert.equal((source.match(/<BioNexusSectionPanel\b/g)||[]).length,2);
  });
  it("preserva campos, errores y contadores", () => {
    for(const token of ["routine-description","routine-details","descriptionError","submitDisabled","dirty","BioNexusFormErrors",`draft.description.length + ' de 50 caracteres'`,`draft.details.length + ' de 200 caracteres'`]) assert.ok(source.includes(token),token);
  });
  it("preserva gestion, orden y guia visual", () => {
    for(const token of ["routine-search","available","draft.exams","openDetail(exam)","add(exam)","remove(index)","move(index","previewDrag","autoScroll","ArrowUp","ArrowDown","Enter","Escape","overflow-y:auto","SELECCIONADO · ↑ ↓ · ENTER · ESC","padding-right:210px","selected-row.keyboard-selected::after"]) assert.ok(source.includes(token),token);
  });
  it("desplaza solamente la lista interna cuando es necesario", () => {
    assert.ok(source.includes('ref="selectedList"'));
    assert.ok(source.includes('selectedList.value'));
    assert.ok(source.includes('list.scrollTop'));
    const reveal=source.slice(source.indexOf('function revealRow(id)'),source.indexOf('function focusRow(id'));
    assert.doesNotMatch(reveal,/scrollIntoView/);
  });
  it("no selecciona automaticamente el examen agregado", () => {
    const addBlock=source.slice(source.indexOf("async function add(exam)"),source.indexOf("function remove(index)"));
    assert.match(addBlock,/revealRow\(exam\.id\)/);
    assert.match(addBlock,/keyboardId\.value=null/);
    assert.match(addBlock,/keyboardOriginal\.value=\[\]/);
    assert.doesNotMatch(addBlock,/selectKeyboard|focusRow/);
  });
  it("preserva cierre, footer y permisos", () => {
    for(const token of ["prevent-close","before-close","requestClose","BioNexusConfirmDialog","canCreate","canUpdate","submit"]) assert.ok(source.includes(token),token);
  });
  it("mantiene CSS propio y theme limpio", () => {
    assert.ok(source.includes("<style scoped>"));
    assert.doesNotMatch(theme,/BIO NEXUS ROUTINES ADMIN|\.routine-entry-dialog|\.routines-page/);
    assert.doesNotMatch(source,/class="bio-nexus-message bio-nexus-message-error"/);
  });
});
