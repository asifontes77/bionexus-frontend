import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const view = readFileSync(new URL("./DollarValueView.vue", import.meta.url), "utf8");
const breadcrumb = readFileSync(new URL("../components/layout/AppBreadcrumb.vue", import.meta.url), "utf8");

describe("DollarValueView visual contract", () => {
  it("uses the shared corporate data grid for history", () => {
    expect(view).toContain("BioNexusDataGrid");
    expect(view).toContain('headerName: "Fecha efectiva"');
    expect(view).toContain('headerName: "Valor"');
    expect(view).not.toContain("<table");
  });

  it("uses shared form and action components", () => {
    expect(view).toContain("BioNexusFormField");
    expect(view).toContain("BioNexusActionButton");
  });

  it("links Sistema back to its module", () => {
    expect(breadcrumb).toContain('"Sistema": { name: "configuration-system-module" }');
  });
});
