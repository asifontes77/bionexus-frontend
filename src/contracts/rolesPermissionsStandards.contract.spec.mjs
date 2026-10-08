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

test("crear y editar usan BioNexusFormErrors antes de BioNexusSectionPanel", () => {
  assert.ok(createDialog.includes('BioNexusFormErrors :errors="createRoleError"'));
  assert.ok(editDialog.includes('BioNexusFormErrors :errors="updateRoleError"'));
  assert.ok(createDialog.includes('import BioNexusFormErrors from "@/components/ui/BioNexusFormErrors.vue";'));
  assert.ok(editDialog.includes('import BioNexusFormErrors from "@/components/ui/BioNexusFormErrors.vue";'));
  assert.ok(createDialog.indexOf("<BioNexusFormErrors") < createDialog.indexOf("<BioNexusSectionPanel"));
  assert.ok(editDialog.indexOf("<BioNexusFormErrors") < editDialog.indexOf("<BioNexusSectionPanel"));
  assert.ok(!createDialog.includes("bio-nexus-message-error"));
  assert.ok(!editDialog.includes("bio-nexus-message-error"));
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
const detailDialog = fs.readFileSync("src/components/security/RoleDetailDialog.vue", "utf8");
const permissionsDialog = fs.readFileSync("src/components/security/RolePermissionsDialog.vue", "utf8");
const catalogDialog = fs.readFileSync("src/components/security/PermissionCatalogDialog.vue", "utf8");
test("detalle permisos y catalogo usan SectionPanel accent con icono y descripcion", () => {
  for (const source of [detailDialog, permissionsDialog, catalogDialog]) {
    assert.ok(source.includes("BioNexusSectionPanel"));
    assert.ok(source.includes('variant="accent"'));
    assert.ok(source.includes('description="'));
    assert.ok(source.includes('icon="'));
  }
});
test("detalle permisos y catalogo usan acciones compartidas", () => {
  for (const source of [detailDialog, permissionsDialog, catalogDialog]) {
    assert.ok(source.includes("BioNexusActionButton"));
    assert.ok(!source.includes("BioNexusActionIcon from"));
  }
});
test("permisos y catalogo conservan busqueda arbol conteos y scroll", () => {
  for (const source of [permissionsDialog, catalogDialog]) {
    assert.ok(source.includes("BioNexusFormField"));
    assert.ok(source.includes("BioNexusPermissionTree"));
    assert.ok(source.includes("overflow-y: auto"));
  }
  assert.ok(permissionsDialog.includes("draftPermissionIds.length"));
  assert.ok(permissionsDialog.includes("El rol administrador debe conservar los permisos esenciales."));
  assert.ok(catalogDialog.includes("catalogPermissionCount"));
});
test("crear y editar separan ayudas dinamicas del siguiente campo", () => {
  for (const source of [createDialog, editDialog]) {
    assert.ok(source.includes(".role-dialog-form { display: grid; grid-template-columns: 1fr; align-content: start; gap: var(--bio-nexus-space-5); min-width: 0; }"));
    assert.ok(source.includes("de 100 caracteres"));
    assert.ok(source.includes("de 250 caracteres"));
  }
});
test("crear y editar separan los campos dentro del cuerpo interno del SectionPanel", () => {
  for (const source of [createDialog, editDialog]) {
    assert.match(source, /class="[^"]*\brole-information-section\b[^"]*"/);
    assert.ok(source.includes(".role-information-section :deep(.bio-nexus-section-panel-body)"));
    assert.ok(source.includes("gap: var(--bio-nexus-space-6)"));
    assert.ok(source.includes("de 100 caracteres"));
    assert.ok(source.includes("de 250 caracteres"));
  }
});
test("el nombre duplicado retornado por Backend usa BioNexusFormErrors", () => {
  assert.ok(view.includes("ROLE_NAME_ALREADY_EXISTS"));
  assert.ok(view.includes("Ya existe un rol con el mismo nombre."));
  assert.ok(view.includes("createRoleError.value = getRoleErrorMessage("));
  assert.ok(view.includes("updateRoleError.value = getRoleErrorMessage("));
  assert.ok(createDialog.includes('BioNexusFormErrors :errors="createRoleError"'));
  assert.ok(editDialog.includes('BioNexusFormErrors :errors="updateRoleError"'));
  assert.ok(createDialog.indexOf("<BioNexusFormErrors") < createDialog.indexOf("<BioNexusSectionPanel"));
  assert.ok(editDialog.indexOf("<BioNexusFormErrors") < editDialog.indexOf("<BioNexusSectionPanel"));
});
test("crear y editar asignan el scroll al cuerpo limitado del dialogo", () => {
  const cases = [
    [createDialog, "role-create-dialog", "role-create-shell", "role-create-dialog-body"],
    [editDialog, "role-edit-dialog", "role-edit-shell", "role-edit-dialog-body"],
  ];
  for (const [source, dialogClass, shellClass, bodyClass] of cases) {
    assert.ok(source.includes(`dialog-class="${dialogClass}" shell-class="${shellClass}" body-class="${bodyClass}"`));
    assert.ok(source.includes(`dialog.bio-nexus-dialog.${dialogClass} > .${shellClass} > .${bodyClass} { flex: 0 1 auto !important; min-height: 0; overflow-x: hidden !important; overflow-y: auto !important; overscroll-behavior: contain; scrollbar-gutter: stable; }`));
    assert.equal(source.includes(".role-dialog-form { display: grid; grid-template-columns: 1fr; align-content: start; gap: var(--bio-nexus-space-5); min-height: 0; overflow-y: auto;"), false);
  }
});
