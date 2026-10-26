import { adminApiRequest } from '@/api/adminApiClient'
export const loginPlatformOwner = (username, password) => adminApiRequest('/api/platform/session', { method: 'POST', body: { username, password } })
