import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'

const source = readFileSync('src/components/platform/PlatformLaboratoryDialog.vue', 'utf8')
const groupMatch = source.match(/const seedPackageGroups=(\[[\s\S]*\])\r?\nconst atomicPackageKeys=/)
assert.ok(groupMatch, 'Debe existir el catalogo granular de paquetes')

const groups = JSON.parse(groupMatch[1])
const keys = groups.flatMap(group => group.children.map(child => child.key))
const approvedKeys = [
  'antibiotics',
  'germs',
  'parasitic-forms',
  'sample-types',
  'taxes',
  'exam-groups',
  'exams',
  'currencies',
  'tariffs',
  'banks',
  'payment-methods',
]
const mandatoryKeys = ['currencies']
const selectableKeys = approvedKeys.filter(key => !mandatoryKeys.includes(key))
const unavailableKeys = [
  'routines',
  'worksheet-groups',
  'worksheet-items',
  'reference-laboratories',
  'special-tests',
]

assert.deepEqual(keys, approvedKeys, 'La UI solo debe presentar las 11 claves aprobadas')
for (const key of unavailableKeys) assert.ok(!keys.includes(key), `No debe ofrecerse: ${key}`)
assert.ok(source.includes("const mandatorySeedPackageKeys=['currencies']"), 'Monedas debe quedar como paquete obligatorio')
assert.ok(source.includes("const selectableSeedPackageKeys=atomicPackageKeys.filter(key=>!mandatorySeedPackageKeys.includes(key))"), 'La seleccion debe excluir las monedas obligatorias')
assert.ok(source.includes('seedPackages:[]'), 'La selección opcional inicial debe estar vacía')
assert.ok(source.includes('Puedes continuar sin paquetes.'), 'Debe informarse que la selección opcional es voluntaria')
assert.ok(source.includes('form.seedPackages=[...selectableSeedPackageKeys]'), 'Seleccionar todos debe incluir solo opciones seleccionables')
assert.ok(source.includes('seedPackages:[...new Set([...selectedPackages,...mandatorySeedPackageKeys])]'), 'El payload debe incluir los paquetes opcionales elegidos y los obligatorios')
assert.ok(source.includes(':disabled="mandatorySeedPackageKeys.includes(child.key)"'), 'La moneda obligatoria no debe poder deseleccionarse')
assert.ok(source.includes('function selectableChildKeys(group){return childKeys(group).filter(key=>selectableSeedPackageKeys.includes(key))}'), 'La selección del grupo debe excluir paquetes obligatorios')
assert.ok(source.includes('`${selectedCount} de ${selectableSeedPackageKeys.length} catálogos opcionales seleccionados.'), 'El resumen debe contar solo opciones seleccionables')

console.log(`Contrato UI de paquetes iniciales: APROBADO (${selectableKeys.length} opcionales, ${mandatoryKeys.length} obligatorio)`)
