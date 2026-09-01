import assert from "node:assert/strict";
import fs from "node:fs";
const view=fs.readFileSync(new URL("./ExamOrderingView.vue",import.meta.url),"utf8");
const service=fs.readFileSync(new URL("../services/examCatalogService.js",import.meta.url),"utf8");
const router=fs.readFileSync(new URL("../router/index.js",import.meta.url),"utf8");
assert.match(view,/Guardar orden/);assert.match(view,/Descartar/);assert.match(view,/reorderExamGroups/);assert.match(view,/reorderExams/);assert.match(view,/beforeunload/);assert.match(view,/onBeforeRouteLeave/);assert.doesNotMatch(view,/updateExamGroup\(/);assert.doesNotMatch(view,/updateExam\(/);
assert.match(service,/\/api\/examgroup\/reorder/);assert.match(service,/\/api\/examlists\/reorder/);assert.match(router,/configuration-exams-order/);assert.match(router,/status: "available"/);
console.log("ExamOrderingView contract: OK");
