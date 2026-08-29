import { apiRequest } from '@/api/apiClient'

export function loginUser(username, password) {
  return apiRequest('/api/users/session', { auth: false, method: 'POST', body: { user_name: username, password } })
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
