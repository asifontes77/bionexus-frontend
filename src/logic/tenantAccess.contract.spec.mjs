import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  buildTenantAccessUrls,
  buildTenantPath,
  getRouteAccessSlug,
  normalizeAccessSlug,
  resolveHostAccessSlug,
  stripTenantPath
} from './tenantAccess.js'

assert.equal(normalizeAccessSlug(' Bio-Nexus-01 '), 'bio-nexus-01')
assert.equal(normalizeAccessSlug('../other'), '')
assert.equal(normalizeAccessSlug('-invalid'), '')
assert.equal(normalizeAccessSlug('a'.repeat(64)), '')
for (const reserved of ['www', 'api', 'admin']) assert.equal(normalizeAccessSlug(reserved), '')

assert.deepEqual(getRouteAccessSlug('/l/lab-01/login'), { present: true, slug: 'lab-01' })
assert.deepEqual(getRouteAccessSlug('/l/%2Fadmin/login'), { present: true, slug: '' })
assert.deepEqual(getRouteAccessSlug('/login'), { present: false, slug: '' })
assert.equal(buildTenantPath('lab-01', '/dashboard'), '/l/lab-01/dashboard')
assert.equal(buildTenantPath('lab-01', '/login'), '/l/lab-01/login')
assert.equal(stripTenantPath('/l/lab-01/dashboard'), '/dashboard')

assert.equal(resolveHostAccessSlug('lab-01.bionexus.app'), 'lab-01')
assert.equal(resolveHostAccessSlug('bionexus.app'), '')
assert.equal(resolveHostAccessSlug('api.bionexus.app'), '')
assert.equal(resolveHostAccessSlug('lab-01.example.com'), '')
assert.deepEqual(buildTenantAccessUrls('lab-01'), {
  development: 'http://localhost:8081/l/lab-01/login',
  canonical: 'https://lab-01.bionexus.app/login'
})
assert.equal(buildTenantAccessUrls('lab-01', {}, {
  hostname: 'localhost',
  origin: 'http://localhost:8081'
}).development, 'http://localhost:8081/l/lab-01/login')

const authService = readFileSync('src/services/authService.js', 'utf8')
const router = readFileSync('src/router/index.js', 'utf8')
const loginView = readFileSync('src/views/LoginView.vue', 'utf8')
const platformService = readFileSync('src/services/platformService.js', 'utf8')
const platformDialog = readFileSync('src/components/platform/PlatformLaboratoryDialog.vue', 'utf8')
const platformView = readFileSync('src/views/PlatformLaboratoriesView.vue', 'utf8')
const platformDetails = readFileSync('src/components/platform/PlatformLaboratoryDetailsDialog.vue', 'utf8')
assert.match(authService, /body:\s*\{\s*access_slug:\s*accessSlug,\s*user_name:\s*username,\s*password\s*\}/)
assert.match(authService, /\/api\/users\/tenant-context\/\$\{encodeURIComponent\(accessSlug\)\}/)
assert.match(router, /path:\s*"\/l\/:accessSlug\/login"/)
assert.match(router, /path:\s*"\/l\/:accessSlug"/)
assert.match(router, /tenantRoute\.name = `tenant-\$\{route\.name\}`/)
assert.match(loginView, /loginUser\(\s*accessSlug\.value,/)
assert.match(loginView, /Cambiar laboratorio/)
assert.match(platformDialog, /v-for="field in identityFields"/)
assert.match(platformDialog, /key:'accessSlug',label:'Código de acceso \(URL\)'/)
assert.match(platformDialog, /result\?\.laboratory\?\.access_slug/)
assert.doesNotMatch(platformDialog, /branchCode|Código de sucursal/)
assert.match(platformService, /access_slug:\s*accessSlug/)
assert.match(platformService, /delete fields\.branchCode/)
assert.match(platformDialog, /branchName:'Sucursal principal'/)
assert.ok(platformDetails.includes('<strong>Canónico</strong>'))

assert.ok(platformDetails.includes(':href="accessUrls.canonical"'))
assert.match(platformView, /headerName:\s*'Paquetes de catálogo',\s*field:\s*'catalogPackageCount'/)
assert.match(platformView, /headerName:\s*'Módulos',\s*field:\s*'moduleCount'/)

console.log('Tenant access frontend contract approved.')
