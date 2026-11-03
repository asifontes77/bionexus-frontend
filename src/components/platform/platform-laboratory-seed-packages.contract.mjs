import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
const source=readFileSync('src/components/platform/PlatformLaboratoryDialog.vue','utf8')
const keys=['microbiology','parasitology','samples-and-tax','exam-catalog','routines-and-worksheets','special-tests','financial-and-payments']
for(const key of keys) assert.ok(source.includes(`"key":"${key}"`),`Falta paquete: ${key}`)
assert.ok(source.includes('seedPackages:[]'),'La selección inicial debe estar vacía')
assert.ok(source.includes('Puedes continuar sin paquetes.'),'Debe informarse que la selección es opcional')
assert.ok(source.includes('seedPackages:[...form.seedPackages]'),'El payload debe enviar una copia independiente')
console.log('Contrato UI de paquetes iniciales: APROBADO')
