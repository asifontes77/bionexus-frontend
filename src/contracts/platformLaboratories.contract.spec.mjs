import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const view = readFileSync('src/views/PlatformLaboratoriesView.vue', 'utf8')
const createDialog = readFileSync('src/components/platform/PlatformLaboratoryDialog.vue', 'utf8')
const detailsDialog = readFileSync('src/components/platform/PlatformLaboratoryDetailsDialog.vue', 'utf8')
const packagesDialog = readFileSync('src/components/platform/PlatformLaboratoryPackagesDialog.vue', 'utf8')
const branchesDialog = readFileSync('src/components/platform/PlatformLaboratoryBranchesDialog.vue', 'utf8')
const deleteDialog = readFileSync('src/components/platform/PlatformLaboratoryDeleteDialog.vue', 'utf8')
const service = readFileSync('src/services/platformService.js', 'utf8')

describe('Administración de laboratorios de plataforma', () => {
  it('mantiene la columna de acciones fija a la derecha y accesible', () => {
    assert.match(view, /pinned:\s*'right'/)
    for (const action of ['Ver configuración', 'Editar laboratorio', 'Gestionar paquetes instalados', 'Gestionar sucursales', 'Eliminar definitivamente']) {
      assert.ok(view.includes(action), action)
    }
    assert.match(view, /BioNexusGridActionsCell/)
  })

  it('requiere datos de vigencia explícitos y permite nunca expira', () => {
    assert.match(createDialog, /value="trial"/)
    assert.match(createDialog, /value="active"/)
    assert.match(createDialog, /value="perpetual_free"/)
    assert.match(createDialog, /serviceExpiresAt/)
    assert.match(createDialog, /perpetualFreeReason/)
    assert.match(createDialog, /serviceExpiresAt=form\.subscriptionStatus==='perpetual_free'\?null:/)
    assert.match(service, /service_expires_at:\s*serviceExpiresAt/)
    assert.match(service, /perpetual_free_reason/)
    assert.doesNotMatch(createDialog, /trialDays|trial_days/)
  })

  it('muestra modo y estado devueltos por API y deriva los enlaces de acceso', () => {
    assert.match(detailsDialog, /laboratory\.service_mode/)
    assert.match(detailsDialog, /data\?\.subscription_status/)
    assert.match(detailsDialog, /form\.subscription_status/)
    assert.match(detailsDialog, /buildTenantAccessUrls/)
    assert.match(detailsDialog, /service_mode/)
    assert.match(detailsDialog, /perpetual_free_granted_at/)
  })

  it('cablea gestión de paquetes y sucursales a las operaciones de plataforma', () => {
    assert.match(packagesDialog, /installPlatformLaboratoryPackage/)
    assert.match(packagesDialog, /removePlatformLaboratoryPackage/)
    assert.match(branchesDialog, /createPlatformLaboratoryBranch/)
    assert.match(branchesDialog, /removePlatformLaboratoryBranch/)
    assert.match(branchesDialog, /isMain/)
  })

  it('solicita contraseña y comunica conflictos seguros de eliminación', () => {
    assert.match(deleteDialog, /autocomplete="current-password"/)
    assert.match(deleteDialog, /PLATFORM_LABORATORY_DELETION_BLOCKED/)
    assert.match(deleteDialog, /PLATFORM_LABORATORY_DELETION_SCHEMA_UNSAFE/)
    assert.match(deleteDialog, /No se borró ningún dato/)
    assert.match(service, /body:\s*\{\s*password\s*\}/)
  })

  it('define las rutas de detalle, edición, paquetes, sucursales y borrado del owner', () => {
    for (const route of ['/packages', '/branches']) assert.ok(service.includes(route), route)
    for (const method of ["method: 'PATCH'", "method: 'POST'", "method: 'DELETE'"]) assert.ok(service.includes(method), method)
    assert.match(service, /\/api\/platform\/laboratories\/\$\{encodeURIComponent\(laboratoryId\)\}/)
  })
})
