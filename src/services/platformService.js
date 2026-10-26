import { adminApiRequest } from '@/api/adminApiClient'
export const getPlatformLaboratories = () => adminApiRequest('/api/platform/laboratories')
