import { resolveApiUrl } from '@/api/apiUrl'

const STORAGE_KEY = 'bio-nexus.admin-session'

function getToken() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return typeof value.token === 'string' ? value.token : ''
  } catch { return '' }
}

export async function adminApiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {})
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
  if (isFormData) headers.delete('Content-Type')
  else if (options.body !== undefined) headers.set('Content-Type', 'application/json;charset=UTF-8')
  const response = await fetch(resolveApiUrl(path), {
    ...options,
    headers,
    body: options.body === undefined || isFormData ? options.body : JSON.stringify(options.body),
  })
  const data = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) throw Object.assign(new Error(data?.message || `HTTP ${response.status}`), { status: response.status, data })
  return data
}

export async function adminApiDownload(path) {
  const headers = new Headers()
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const response = await fetch(resolveApiUrl(path), { headers })
  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw Object.assign(new Error(data?.message || `HTTP ${response.status}`), { status: response.status, data })
  }
  return response.blob()
}
