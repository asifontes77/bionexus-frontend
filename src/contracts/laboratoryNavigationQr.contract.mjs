import fs from 'node:fs';import assert from 'node:assert/strict';
const breadcrumb=fs.readFileSync('src/components/layout/AppBreadcrumb.vue','utf8');
const panel=fs.readFileSync('src/components/laboratory/LaboratoryGeneralPanel.vue','utf8');
const router=fs.readFileSync('src/router/index.js','utf8');
for(const token of ['"Bio Nexus": { name: "dashboard" }','"Configuración": { name: "dashboard" }','"Laboratorio": { name: "configuration-laboratory-module" }'])assert.ok(breadcrumb.includes(token),'BREADCRUMB_'+token);
for(const token of ['name: "dashboard"','name: "configuration-laboratory-module"','name: "configuration-laboratory"'])assert.ok(router.includes(token),'ROUTE_'+token);
for(const text of ['Configurar QR','Configura los datos de contacto que se usarán para generar el QR institucional.','La inserción del QR en resultados o documentos se habilitará posteriormente desde Documentos y plantillas.'])assert.ok(panel.includes(text),'QR_'+text);
assert.ok(!panel.includes('<span>Activar QR</span>'));
console.log('[OK] Breadcrumb navegable y alcance actual del QR documentado.');