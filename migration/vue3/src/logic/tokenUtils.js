function decodeBase64Url(value) {
  const normalized = value
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(value.length / 4) * 4, '=')

  return atob(normalized)
}

export function parseJwt(token) {
  if (typeof token !== 'string') return null

  const parts = token.split('.')

  if (parts.length !== 3) return null

  try {
    return JSON.parse(decodeBase64Url(parts[1]))
  } catch {
    return null
  }
}

export function isTokenExpired(token, now = Date.now()) {
  const payload = parseJwt(token)

  if (!payload || typeof payload.exp !== 'number') return true

  return now >= payload.exp * 1000
}
