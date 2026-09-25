import assert from "node:assert/strict";
import fs from "node:fs";
const view=fs.readFileSync(new URL("./ExamOrderingView.vue",import.meta.url),"utf8");
const service=fs.readFileSync(new URL("../services/examCatalogService.js",import.meta.url),"utf8");
const router=fs.readFileSync(new URL("../router/index.js",import.meta.url),"utf8");
assert.match(view,/Guardar orden/);assert.match(view,/exam-order-commandbar/);assert.match(view,/draggable="true"/);assert.match(view,/startDrag/);assert.doesNotMatch(view,/Soltar en posición/);assert.match(view,/currentDragIndex/);assert.doesNotMatch(view,/Soltar al final/);assert.match(view,/autoScroll/);assert.match(view,/overflow-y:auto/);assert.match(view,/height:clamp\(430px/);assert.match(view,/edge=44,step=9/);assert.match(view,/order-number/);assert.doesNotMatch(view,/material-symbols-rounded/);assert.doesNotMatch(view,/<h1>Ordenar exámenes<\/h1>/);assert.doesNotMatch(view,/>CATÁLOGOS<\/p>/);assert.match(view,/font-family:var\(--bio-nexus-font-family/);assert.match(view,/Descartar/);assert.match(view,/reorderExamGroups/);assert.match(view,/reorderExams/);assert.match(view,/beforeunload/);assert.match(view,/onBeforeRouteLeave/);assert.doesNotMatch(view,/updateExamGroup\(/);assert.doesNotMatch(view,/updateExam\(/);
assert.match(service,/\/api\/examgroup\/reorder/);assert.match(service,/\/api\/examlists\/reorder/);assert.match(router,/configuration-exams-order/);assert.match(router,/status: "available"/);
console.log("ExamOrderingView contract: OK");

assert.doesNotMatch(view,/SOLtar en posici/);
assert.match(view,/previewRow/);
assert.match(view,/setDragImage/);
assert.doesNotMatch(view,/drop-zone/);
assert.doesNotMatch(view,/previewAt/);
assert.equal((view.match(/class="exam-order-list"/g)||[]).length,2);
assert.equal((view.match(/v-for="\(group,index\) in groups"/g)||[]).length,1);
assert.equal((view.match(/v-for="\(exam,index\) in exams"/g)||[]).length,1);



assert.match(view,/moveSelected/);
assert.match(view,/keyboardSelection/);
assert.match(view,/keyboard-selected/);
assert.match(view,/data-order-key/);
assert.match(view,/clearKeyboardSelection/);

assert.match(view,/scrollIntoView/);
assert.match(view,/block:"nearest"/);
assert.match(view,/behavior:"auto"/);
assert.match(view,/preventScroll:true/);
assert.match(view,/activateKeyboardSelection/);
assert.match(view,/function selectForKeyboard\(type,id\)\{if\(keyboardSelection.value/);
assert.match(view,/behavior:"auto"/);



assert.match(view,/originalIds:list.map/);
assert.match(view,/confirmKeyboardMove/);
assert.match(view,/cancelKeyboardMove/);
assert.match(view,/list.splice\(0,list.length/);

assert.match(view,/handleKeyboardMove/);
assert.match(view,/addEventListener\("keydown",handleKeyboardMove,\{capture:true\}\)/);
assert.match(view,/event.preventDefault\(\)/);
assert.match(view,/event.stopPropagation\(\)/);
assert.match(view,/target instanceof HTMLInputElement/);
assert.match(view,/activateKeyboardSelection/);
assert.match(view,/SELECCIONADO/);
assert.match(view,/function handleKeyboardMove/);
assert.match(view,/event.key==="Enter"/);
assert.match(view,/event.key==="Escape"/);

assert.match(view,/changeVersion=ref\(0\)/);
assert.match(view,/function markOrderChanged/);
assert.match(view,/changeVersion.value/);
assert.match(view,/useAuthorizationStore/);
assert.match(view,/auth.hasPermission\("exam-catalog.update"\)/);
assert.doesNotMatch(view,/useSessionStore/);
assert.doesNotMatch(view,/Cambios pendientes/);
assert.match(view,/:disabled="!dirty \|\| !canUpdate \|\| saving"/);
assert.match(view,/font-size:8px/);
assert.match(view,/padding-right:215px/);
assert.match(view,/@media\(max-width:1250px\)/);
assert.match(view,/keyboard-selected::after\{display:none\}/);

assert.match(view,/BioNexusFormErrors/);
assert.ok(view.includes('<BioNexusFormErrors :errors="error" />'));
assert.doesNotMatch(view,/class="exam-order-error"/);
assert.doesNotMatch(view,/\.exam-order-error\{/);

assert.match(view,/original\.value=snapshot\(\);clearKeyboardSelection\(\);toast\.success\("Orden guardado correctamente\."\)/);
const saveFunction=view.match(/async function save\(\)\{.*?\}\nfunction discard/s)?.[0]||"";
assert.ok(saveFunction,"ORDER_SAVE_FUNCTION_NOT_FOUND");
const successfulSave=saveFunction.split('}catch(e){')[0];
const failedSave=saveFunction.split('}catch(e){')[1]||"";
assert.doesNotMatch(successfulSave,/await load\(\)/,"ORDER_SAVE_SUCCESS_WITHOUT_RELOAD");
assert.match(failedSave,/await load\(\)/,"ORDER_SAVE_FAILURE_RELOAD_REQUIRED");
