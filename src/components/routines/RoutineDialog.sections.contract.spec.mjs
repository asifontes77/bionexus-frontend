import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
const dialog=readFileSync(join(process.cwd(),"src/components/routines/RoutineDialog.vue"),"utf8");
const theme=readFileSync(join(process.cwd(),"src/styles/components.css"),"utf8");
describe("Routine dialog shared sections",()=>{
  it("usa dos SectionPanel accent",()=>{
    assert.match(dialog,/title="Información de la rutina"[^>]*icon="assignment"[^>]*variant="accent"/);
    assert.match(dialog,/title="Gestión de exámenes"[^>]*icon="playlist_add_check"[^>]*variant="accent"/);
    assert.equal((dialog.match(/<BioNexusSectionPanel\b/g)||[]).length,2);
  });
  it("preserva campos y validaciones",()=>{
    for(const token of ["routine-description","routine-details","descriptionError","submitDisabled","dirty","syncDirty"])assert.ok(dialog.includes(token),token);
  });
  it("preserva gestión y orden de exámenes",()=>{
    for(const token of ["routine-search","available","draft.exams","openDetail(exam)","add(exam)","remove(index)","move(index","previewDrag","autoScroll"])assert.ok(dialog.includes(token),token);
    assert.ok(theme.includes("SELECCIONADO · ↑ ↓ · ENTER · ESC"));
  });
  it("preserva cierre, footer y permisos",()=>{
    for(const token of ["prevent-close","before-close","requestClose","BioNexusConfirmDialog","canCreate","canUpdate","submit"])assert.ok(dialog.includes(token),token);
  });
  it("centraliza el layout",()=>{
    assert.ok(theme.includes(".routine-section{"));
    assert.ok(theme.includes(".routine-section .bio-nexus-section-panel-body"));
    assert.ok(!dialog.includes("<style"));
    assert.ok(!theme.includes(".available-actions button{"));
    assert.ok(!theme.includes(".routine-moves button{"));
    assert.ok(theme.includes(".selected-row.keyboard-selected .routine-row-copy{padding-right:210px}"));
  });
});
