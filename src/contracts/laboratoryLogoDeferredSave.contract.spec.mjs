import { readFileSync } from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

const identity = readFileSync('src/views/LaboratoryIdentityView.vue', 'utf8')
const panel = readFileSync('src/components/laboratory/LaboratoryLogoPanel.vue', 'utf8')
const legacy = readFileSync('src/views/LaboratoryView.vue', 'utf8')

test('seleccionar logo solo crea vista previa temporal en Identidad', () => {
  assert.match(panel, /emit\('select-logo',file\)/)
  assert.doesNotMatch(panel, /emit\('upload',file\)/)
  assert.match(panel, /props\.previewUrl/)
  assert.match(identity, /@select-logo="selectLogo"/)
  assert.match(identity, /:preview-url="pendingLogoUrl"/)
  assert.match(identity, /URL\.createObjectURL\(file\)/)
})

test('Guardar persiste y Descartar libera la vista previa temporal', () => {
  assert.match(identity, /await uploadLaboratoryLogo\(logoFile,laboratory\.value\.id\)/)
  assert.match(identity, /clearPendingLogo\(\)/)
  assert.match(identity, /URL\.revokeObjectURL/)
  assert.doesNotMatch(identity, /async function uploadLogo\(file\)/)
})

test('la logica temporal no permanece en la vista legacy de Laboratorio', () => {
  assert.doesNotMatch(legacy, /pendingLogoFile/)
  assert.doesNotMatch(legacy, /pendingLogoUrl/)
  assert.doesNotMatch(legacy, /function selectLogo/)
})