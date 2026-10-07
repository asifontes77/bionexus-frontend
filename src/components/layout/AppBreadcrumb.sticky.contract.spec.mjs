import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const cssPath = path.resolve(currentDirectory, "../../styles/layout.css");
const source = fs.readFileSync(cssPath, "utf8");
const marker = source.slice(source.indexOf("/* Global sticky breadcrumb: keep navigation context visible below the authenticated topbar. */"), source.indexOf("/* End global sticky breadcrumb. */") + "/* End global sticky breadcrumb. */".length);

test("mantiene el breadcrumb global visible debajo del topbar", () => {
  assert.ok(marker.includes(".app-breadcrumb"));
  assert.match(marker, /position:\s*sticky/);
  assert.match(marker, /top:\s*var\(--bio-nexus-topbar-height\)/);
});

test("coordina fondo nivel visual y separacion del breadcrumb sticky", () => {
  assert.match(marker, /z-index:\s*19/);
  assert.match(marker, /background:\s*var\(--bio-nexus-color-background\)/);
  assert.match(marker, /box-shadow:/);
});

test("protege el comportamiento responsive del breadcrumb", () => {
  assert.match(marker, /@media\s*\(max-width:\s*720px\)/);
  assert.match(marker, /padding-inline:\s*0/);
});

test("protege una altura compartida para apilar navegaciones", () => {
  assert.match(marker, /min-height:\s*var\(--bio-nexus-breadcrumb-sticky-height\)/);
});
