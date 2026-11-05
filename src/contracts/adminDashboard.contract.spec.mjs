import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const layout = readFileSync('src/layouts/AdminLayout.vue', 'utf8')
const navigation = readFileSync('src/config/adminNavigation.js', 'utf8')
const dashboard = readFileSync('src/views/AdminDashboardView.vue', 'utf8')
const router = readFileSync('src/router/index.js', 'utf8')
const login = readFileSync('src/views/AdminLoginView.vue', 'utf8')
const provisioning = readFileSync('src/components/platform/PlatformLaboratoryDialog.vue', 'utf8')

describe('Dashboard y navegación de administración de plataforma', () => {
  it('muestra la marca y la navegación horizontal con rutas del módulo owner', () => {
    assert.match(layout, /@\/assets\/bionexus_logo\.png/)
    assert.match(layout, /<nav class="admin-navigation" aria-label="Navegación de administración">/)
    for (const item of [
      "label: 'Dashboard'",
      "label: 'Laboratorios'",
      "label: 'Planes'",
      "label: 'Pagos'",
      "routeName: 'admin-plans'",
      "routeName: 'admin-payments'",
    ]) {
      assert.ok(navigation.includes(item), item)
    }
    assert.match(layout, /admin-navigation-link-disabled/)
  })

  it('define dashboard como destino inicial y de autenticación del propietario', () => {
    assert.match(router, /path: "dashboard"[\s\S]*?name: "admin-dashboard"[\s\S]*?component: AdminDashboardView/)
    assert.match(router, /path: "", redirect: \{ name: "admin-dashboard" \}/)
    assert.match(router, /to\.name === "admin-login" && adminSessionStore\.isAuthenticated\) \{\s*return \{ name: "admin-dashboard" \}/)
    assert.match(login, /router\.replace\(\{ name: 'admin-dashboard' \}\)/)
  })

  it('usa solo la consulta existente para mostrar el recuento y deja explícito el carácter futuro de planes/pagos', () => {
    assert.match(dashboard, /getPlatformLaboratories/)
    assert.match(dashboard, /Array\.isArray\(result\)/)
    assert.match(dashboard, /Planes comerciales/)
    assert.match(dashboard, /Pagos/)
    assert.match(dashboard, /admin-plans/)
    assert.match(dashboard, /admin-payments/)
    assert.doesNotMatch(dashboard, /\/api\/platform\/(plans|payments)/)
  })

  it('distingue el selector de plan comercial de los catálogos de datos iniciales', () => {
    assert.match(provisioning, /label="Plan comercial"/)
    assert.match(provisioning, /getPlatformPlans/)
    assert.match(provisioning, /activePlans/)
    assert.match(provisioning, /Paquetes de datos iniciales \(catálogos\)/)
    assert.match(provisioning, /no son planes comerciales ni definen la vigencia/)
    assert.match(provisioning, /form\.seedPackages/)
  })
})
