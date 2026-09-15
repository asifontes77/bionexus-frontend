import { readFileSync } from "node:fs";
import { join } from "node:path";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

const dialog = readFileSync(join(process.cwd(), "src/components/worksheetgroups/WorksheetGroupDialog.vue"), "utf8");

describe("WorksheetGroupDialog create and edit button contract", () => {
  it("mantiene Crear habilitado al abrir si el usuario tiene permiso", () => {
    assert.ok(dialog.includes("mode.value==='create'?!props.canCreate"));
    assert.ok(!dialog.includes("props.saving||signature.value===original.value||(mode.value==='create'"));
  });

  it("mantiene Guardar deshabilitado al editar hasta detectar cambios", () => {
    assert.ok(dialog.includes("signature.value===original.value||!props.canUpdate&&!props.canManageItems"));
  });

  it("muestra la validacion de descripcion debajo del campo al intentar guardar", () => {
    assert.ok(dialog.includes(':error="descriptionError"'));
    assert.ok(dialog.includes("attempted.value&&!values.value.description"));
  });
});
