import { getSessionPolicySocketId } from '@/services/sessionPolicySocket'

const DEFAULT_REQUEST_TIMEOUT_MS = 15000
const SESSION_STORAGE_KEY = 'bio-nexus.session'
const RENEW_PATH = '/api/users/session/renew'
let unauthorizedRenewalPromise = null

function getStoredToken() {
  try {
    const storedSession = localStorage.getItem(SESSION_STORAGE_KEY)

    if (!storedSession) return ''

    const session = JSON.parse(storedSession)
    return typeof session.token === 'string' ? session.token : ''
  } catch {
    return ''
  }
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || ''

  if (response.status === 204) return null

  if (contentType.includes('application/json')) {
    return response.json()
  }

  return response.text()
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

async function renewStoredSession() {
  if (unauthorizedRenewalPromise) return unauthorizedRenewalPromise
  const token = getStoredToken()
  if (!token) return null
  unauthorizedRenewalPromise = fetch(RENEW_PATH, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    .then(async (response) => {
      const data = await parseResponse(response)
      if (!response.ok || !data?.token) return null
      const stored = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) || '{}')
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ ...stored, token: data.token, user: data.user ?? stored.user ?? null, renewedAt: new Date().toISOString() }))
      globalThis.dispatchEvent?.(new CustomEvent('bio-nexus:session-renewed', { detail: data }))
      return data.token
    })
    .catch(() => null)
    .finally(() => { unauthorizedRenewalPromise = null })
  return unauthorizedRenewalPromise
}

export async function apiRequest(path, options = {}) {
  const {
    auth = true,
    body,
    headers = {},
    method = 'GET',
    preserveBody = false,
    timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
    signal: externalSignal,
    retryAfterRenewal = true,
    ...requestOptions
  } = options

  const requestHeaders = new Headers(headers)
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
  const sendBodyDirectly = preserveBody || isFormData

  if (body !== undefined && !sendBodyDirectly && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json;charset=UTF-8')
  }

  if (auth) {
    const token = getStoredToken()
    if (token) requestHeaders.set('Authorization', `Bearer ${token}`)
    const socketId = getSessionPolicySocketId()
    if (socketId) requestHeaders.set('X-Bio-Nexus-Socket-Id', socketId)
  }

  const normalizedTimeoutMs = Number.isFinite(Number(timeoutMs))
    ? Math.max(1000, Number(timeoutMs))
    : DEFAULT_REQUEST_TIMEOUT_MS
  const controller = new AbortController()
  const abortFromExternalSignal = () => controller.abort(externalSignal?.reason)

  if (externalSignal) {
    if (externalSignal.aborted) abortFromExternalSignal()
    else externalSignal.addEventListener('abort', abortFromExternalSignal, { once: true })
  }

  const timeout = globalThis.setTimeout(
    () => controller.abort('BIO_NEXUS_REQUEST_TIMEOUT'),
    normalizedTimeoutMs
  )

  let response
  try {
    response = await fetch(path, {
      ...requestOptions,
      signal: controller.signal,
      method,
      headers: requestHeaders,
      body: body === undefined ? undefined : sendBodyDirectly ? body : JSON.stringify(body)
    })
  } catch (error) {
    if (controller.signal.aborted && !externalSignal?.aborted) {
      throw new ApiError('BIO_NEXUS_REQUEST_TIMEOUT', 408, {
        message: 'BIO_NEXUS_REQUEST_TIMEOUT'
      })
    }
    throw error
  } finally {
    globalThis.clearTimeout(timeout)
    externalSignal?.removeEventListener?.('abort', abortFromExternalSignal)
  }

  const data = await parseResponse(response)
  if (!response.ok) {
    if (auth && response.status === 401) {
      if (retryAfterRenewal && path !== RENEW_PATH) {
        const renewedToken = await renewStoredSession()
        if (renewedToken) return apiRequest(path, { ...options, retryAfterRenewal: false })
      }
      globalThis.dispatchEvent?.(new CustomEvent('bio-nexus:unauthorized', { detail: { path } }))
    }
    const message =
      data && typeof data === 'object' && data.message
        ? data.message
        : `HTTP ${response.status}`
    throw new ApiError(message, response.status, data)
  }
  return data
}
