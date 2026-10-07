import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const createDialog = fs.readFileSync("src/components/security/RoleCreateDialog.vue", "utf8");
const editDialog = fs.readFileSync("src/components/security/RoleEditDialog.vue", "utf8");
const view = fs.readFileSync("src/views/RolesPermissionsView.vue", "utf8");

test("crear y editar muestran contadores para los maxlength reales", () => {
  for (const source of [createDialog, editDialog]) {
    assert.ok(source.includes('maxlength="100"'));
    assert.ok(source.includes('de 100 caracteres'));
    assert.ok(source.includes('maxlength="250"'));
    assert.ok(source.includes('de 250 caracteres'));
  }
});

test("crear y editar usan SectionPanel accent con icono y descripcion", () => {
  for (const source of [createDialog, editDialog]) {
    assert.ok(source.includes('icon="admin_panel_settings"'));
    assert.ok(source.includes('variant="accent"'));
    assert.ok(source.includes('description="'));
  }
});

test("crear y editar usan BioNexusActionButton", () => {
  for (const source of [createDialog, editDialog]) {
    assert.ok(source.includes("BioNexusActionButton"));
    assert.ok(source.includes('variant="secondary"'));
    assert.ok(source.includes('variant="primary"'));
    assert.ok(!source.includes("BioNexusActionIcon from"));
  }
});

test("los errores generales aparecen antes de los campos", () => {
  assert.ok(createDialog.indexOf('v-if="createRoleError"') < createDialog.indexOf('field-id="create-role-name"'));
  assert.ok(editDialog.indexOf('v-if="updateRoleError"') < editDialog.indexOf('field-id="edit-role-name"'));
});

test("los errores de Nombre permanecen en BioNexusFormField", () => {
  assert.ok(createDialog.includes(':error="createRoleNameError"'));
  assert.ok(editDialog.includes(':error="updateRoleNameError"'));
});

test("crear y editar usan la misma geometria de 680 px", () => {
  assert.ok(createDialog.includes('width: min(680px, calc(100vw - 32px))'));
  assert.ok(editDialog.includes('width: min(680px, calc(100vw - 32px))'));
});

test("editar preserva la proteccion del administrador", () => {
  assert.ok(editDialog.includes("selectedRole?.code === 'admin'"));
  assert.ok(editDialog.includes("El rol administrador debe permanecer activo."));
});

test("Origen y Estado entregan RowNode al getValue del filtro", () => {
  assert.ok(view.includes('getValue: (node) => node.data?.isSystem ? "Sistema" : "Configurable"'));
  assert.ok(view.includes('getValue: (node) => Boolean(node.data?.isActive)'));
  assert.ok(!view.includes('getValue: (data) => Boolean(data?.isActive)'));
});

test("los cierres emiten close y los formularios usan submit nativo", () => {
  for (const source of [createDialog, editDialog]) {
    assert.ok(source.includes('function handleClosed() { emit("close"); }'));
    assert.ok(source.includes('@submit.prevent="emit(\'submit\')"'));
  }
});
