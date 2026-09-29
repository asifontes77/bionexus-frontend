import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
const source=readFileSync("src/components/ui/BioNexusFormLayout.vue","utf8");
describe("BioNexusFormLayout",()=>{
  it("centraliza el espaciado vertical de formularios",()=>{
    for(const token of ["bio-nexus-form-layout","display: grid","grid-template-columns: minmax(0, 1fr)","gap: 0",".bio-nexus-form-layout > * + *","margin-block-start: var(--bio-nexus-space-4)","<slot />"])assert.ok(source.includes(token),token);
  });
});
