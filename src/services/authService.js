import { apiRequest } from '@/api/apiClient'

export function loginUser(accessSlug, username, password) {
  return apiRequest('/api/users/session', { auth: false, method: 'POST', body: { access_slug: accessSlug, user_name: username, password } })
}

export function getTenantContext(accessSlug) {
  return apiRequest(`/api/users/tenant-context/${encodeURIComponent(accessSlug)}`, { auth: false })
}

export function renewSession() {
  return apiRequest('/api/users/session/renew', { method: 'POST' })
}

export function getSessionPolicy() {
  return apiRequest('/api/application-settings/session/1')
}

export function getUserById(userId) {
  return apiRequest(`/api/users/${userId}`)
}

export function changeRequiredPassword(body) {
  return apiRequest('/api/users/session/change-required-password', { method: 'POST', body })
}
