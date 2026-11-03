import { adminApiRequest } from '@/api/adminApiClient'
export const getPlatformLaboratories = () => adminApiRequest('/api/platform/laboratories')
export const getPlatformModules = () => adminApiRequest('/api/platform/modules')
export const createPlatformLaboratory = payload => adminApiRequest('/api/platform/laboratories', { method: 'POST', body: payload })
