const SESSION_STORAGE_KEY = 'bio-nexus.session'

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

export async function apiRequest(path, options = {}) {
  const {
    auth = true,
    body,
    headers = {},
    method = 'GET',
    preserveBody = false,
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

    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`)
    }
  }

  const response = await fetch(path, {
    ...requestOptions,
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : sendBodyDirectly ? body : JSON.stringify(body)
  })

  const data = await parseResponse(response)

  if (!response.ok) {
    const message =
      data && typeof data === 'object' && data.message
        ? data.message
        : `HTTP ${response.status}`

    throw new ApiError(message, response.status, data)
  }

  return data
}
