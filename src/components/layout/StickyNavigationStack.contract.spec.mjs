import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(currentDirectory, "../../..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const theme = read("src/styles/theme.css");
const layout = read("src/styles/layout.css");
const views = [
  ["Ingreso de pacientes", read("src/views/PatientAdmissionView.vue")],
  ["Configuración de la aplicación", read("src/views/ApplicationSettingsView.vue")],
  ["Laboratorio", read("src/views/LaboratoryView.vue")]
];

test("define offsets compartidos para breadcrumb y navegaciones sticky", () => {
  assert.match(theme, /--bio-nexus-breadcrumb-sticky-height:\s*40px/);
  assert.match(theme, /--bio-nexus-sticky-navigation-offset:\s*calc\(var\(--bio-nexus-topbar-height\) \+ var\(--bio-nexus-breadcrumb-sticky-height\)\)/);
  assert.match(layout, /min-height:\s*var\(--bio-nexus-breadcrumb-sticky-height\)/);
});

test("apila las navegaciones con tabs debajo del breadcrumb", () => {
  for (const [name, source] of views) {
    assert.match(source, /top:\s*var\(--bio-nexus-sticky-navigation-offset\)/, name);
    assert.doesNotMatch(source, /top:calc\(var\(--bio-nexus-topbar-height\) \+ var\(--bio-nexus-space-[12]\)\)/, name);
  }
});

test("mantiene la jerarquia visual topbar breadcrumb tabs", () => {
  assert.match(layout, /z-index:\s*20/);
  assert.match(layout, /z-index:\s*19/);
  for (const [name, source] of views) assert.match(source, /z-index:\s*(?:18|20)/, name);
});

test("impide que el contenido aparezca entre breadcrumb y tabs", () => {
  assert.match(layout, /Sticky navigation seam guard/);
  assert.match(layout, /\.patient-admission-navigation::before/);
  assert.match(layout, /\.application-settings-navigation::before/);
  assert.match(layout, /(?:\.laboratory-navigation|\.laboratory-tabs)::before/);
  assert.match(layout, /bottom:\s*100%/);
  assert.match(layout, /height:\s*var\(--bio-nexus-space-2\)/);
  assert.match(layout, /background:\s*var\(--bio-nexus-color-background\)/);
});

test("integra Identidad del laboratorio en la pila sticky", () => {
  const identity = read("src/views/LaboratoryIdentityView.vue");
  assert.match(identity, /\.identity-toolbar\{[^}]*position:sticky;[^}]*top:var\(--bio-nexus-sticky-navigation-offset\);/);
  assert.match(identity, /\.identity-logo\{[^}]*top:calc\(var\(--bio-nexus-sticky-navigation-offset\) \+ 82px\);/);
  assert.match(layout, /\.identity-toolbar::before/);
});
