import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync("src/components/typepayment/TypePaymentDialog.vue", "utf8");

for (const token of [
  "Campos adicionales",
  "addField",
  "removeField",
  "moveField",
  "descriptionError.value||currencyError.value||fieldsError.value",
  ':error="descriptionError"',
  ':error="fieldError(index,\'label\')"'
]) {
  assert.ok(source.includes(token), token);
}

assert.ok(!source.includes(">Quitar</button>"));
assert.ok(source.includes('icon="delete" icon-only shape="circle"'));
console.log("[OK] Dialogo Formas de pago preservado y estandarizado.");
