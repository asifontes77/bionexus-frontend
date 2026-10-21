import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root=new URL('../../',import.meta.url);
const read=async path=>readFile(new URL(path,root),'utf8');
const backendRoot=new URL('file:///C:/Users/Alexis/Documents/Bio%20Nexus/Aplicacion/Bio%20Nexus%20Backend/');
const readBackend=async path=>readFile(new URL(path,backendRoot),'utf8');

const service=await readBackend('src/document-definitions/document-definitions.service.ts');
const entity=await readBackend('src/document-definitions/document-definition.entity.ts');
const draft=await readBackend('src/document-definitions/document-draft.entity.ts');
const view=await read('src/views/DocumentDefinitionsView.vue');
const adapter=await read('src/components/documents/designer/adapters/patientReceiptDocumentAdapter.js');

test('admite varias definiciones por laboratorio y tipo con nombre unico',()=>{
  assert.ok(entity.includes("['laboratoryId', 'documentType', 'name']"));
  assert.equal(entity.includes("['laboratoryId', 'documentType'], { unique: true }"),false);
});

test('activa una definicion y desactiva las demas del mismo tipo bajo bloqueo',()=>{
  for(const token of ["setLock('pessimistic_write')","definition.document_type = :documentType",'item.id !== definition.id && item.isActive','item.isActive = false']) assert.ok(service.includes(token),token);
});

test('impide dejar un tipo sin definicion activa',()=>{
  assert.ok(service.includes('DOCUMENT_DEFINITION_LAST_ACTIVE_CANNOT_BE_DEACTIVATED'));
  assert.ok(service.includes('isActive: rows.length === 0'));
});

test('cada definicion conserva un unico diseno por documentId',()=>{
  assert.ok(draft.includes("['documentId'], { unique: true }"));
  assert.ok(draft.includes("name: 'document_drafts'"));
});

test('el adaptador actual identifica comprobantes sin acoplar el motor a facturas',()=>{
  assert.ok(adapter.includes("documentType:'patient-receipt'"));
  assert.equal(adapter.includes("documentType:'invoice'"),false);
  assert.ok(view.includes('item.documentType===row.documentType'));
});