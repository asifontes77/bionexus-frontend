const ACCESS_SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/
const RESERVED_SUBDOMAINS = new Set(['www', 'api', 'admin'])

export function normalizeAccessSlug(value) {
  const slug = typeof value === 'string' ? value.trim().toLowerCase() : ''
  return ACCESS_SLUG_PATTERN.test(slug) && !RESERVED_SUBDOMAINS.has(slug) ? slug : ''
}

export function getTenantBaseDomain() {
  const configured = typeof import.meta.env === 'object'
    ? import.meta.env.VITE_TENANT_BASE_DOMAIN
    : ''
  const domain = String(configured || 'bionexus.app').trim().toLowerCase().replace(/^\.+|\.+$/g, '')
  return domain || 'bionexus.app'
}

export function resolveHostAccessSlug(hostname = globalThis.location?.hostname, baseDomain = getTenantBaseDomain()) {
  const host = String(hostname || '').trim().toLowerCase().replace(/\.$/, '')
  const domain = String(baseDomain || '').trim().toLowerCase().replace(/^\.+|\.+$/g, '')
  if (!host || !domain || host === domain || !host.endsWith(`.${domain}`)) return ''

  const subdomain = host.slice(0, -(domain.length + 1))
  if (subdomain.includes('.') || RESERVED_SUBDOMAINS.has(subdomain)) return ''
  return normalizeAccessSlug(subdomain)
}

export function getRouteAccessSlug(path) {
  const match = String(path || '').match(/^\/l\/([^/?#]+)(?:\/|$)/i)
  if (!match) return { present: false, slug: '' }

  try {
    return { present: true, slug: normalizeAccessSlug(decodeURIComponent(match[1])) }
  } catch {
    return { present: true, slug: '' }
  }
}

export function buildTenantPath(accessSlug, path = '/') {
  const slug = normalizeAccessSlug(accessSlug)
  if (!slug) return '/login'
  const normalizedPath = String(path || '/').startsWith('/') ? String(path || '/') : `/${path}`
  return `/l/${encodeURIComponent(slug)}${normalizedPath === '/' ? '' : normalizedPath}`
}

export function stripTenantPath(path) {
  const value = String(path || '/')
  const match = value.match(/^\/l\/[^/?#]*(.*)$/i)
  return match ? match[1] || '/' : value
}

export function getTenantPortalUrl(location = globalThis.location) {
  const baseDomain = getTenantBaseDomain()
  const hostname = String(location?.hostname || '').toLowerCase()
  if (resolveHostAccessSlug(hostname, baseDomain)) {
    return `${location.protocol}//${baseDomain}${location.port ? `:${location.port}` : ''}/login`
  }
  return '/login?portal=1'
}

function isHttpUrl(value) {
  if (typeof value !== 'string' || value.trim() === '') return ''
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : ''
  } catch {
    return ''
  }
}

export function buildTenantAccessUrls(accessSlug, providedUrls = {}, location = globalThis.location) {
  const slug = normalizeAccessSlug(accessSlug)
  if (!slug) return { development: '', canonical: '' }
  const urls = providedUrls && typeof providedUrls === 'object' ? providedUrls : {}
  const devPort = typeof import.meta.env === 'object' && import.meta.env.VITE_TENANT_DEV_PORT
    ? String(import.meta.env.VITE_TENANT_DEV_PORT)
    : '8081'
  const baseDomain = getTenantBaseDomain()
  const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(String(location?.hostname || '').toLowerCase())
  const developmentFallback = `${isLocalHost ? location.origin : `http://localhost:${devPort}`}${buildTenantPath(slug, '/login')}`

  return {
    development: isHttpUrl(urls.development || urls.local || urls.development_url)
      || developmentFallback,
    canonical: isHttpUrl(urls.canonical || urls.canonical_url)
      || `https://${slug}.${baseDomain}/login`
  }
}
