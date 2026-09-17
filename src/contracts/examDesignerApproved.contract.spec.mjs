import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const root = process.cwd();
const view = readFileSync(join(root, "src/views/ExamCatalogView.vue"), "utf8");
const approvedPath = join(root, "src/components/examcatalog/designer/ExamResultGridDesignerDialog.vue");
const designer = readFileSync(approvedPath, "utf8");

describe("Approved exam result grid designer", () => {
  it("permanece conectado al Catalogo de examenes", () => {
    for (const token of ["ExamResultGridDesignerDialog", "resultGridDesignerDialog", "openResultGridDesigner", "saveResultGridFormat", "grid-designer", "Diseñador matricial"])
      assert.ok(view.includes(token), `Missing approved token: ${token}`);
  });

  it("usa la ubicacion consolidada y no la carpeta experimental", () => {
    assert.ok(existsSync(approvedPath));
    assert.ok(view.includes("@/components/examcatalog/designer/ExamResultGridDesignerDialog.vue"));
    assert.ok(!view.includes("/experimental/"));
  });

  it("presenta el Diseñador como funcionalidad aprobada", () => {
    assert.ok(designer.includes('kicker="Diseño de resultados"'));
    assert.ok(!designer.includes("Laboratorio experimental"));
    assert.ok(!designer.includes("Persistencia temporal"));
  });
});
