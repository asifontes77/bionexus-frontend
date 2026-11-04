import { adminApiRequest } from '@/api/adminApiClient'
export const getPlatformLaboratories = () => adminApiRequest('/api/platform/laboratories')
export const getPlatformModules = () => adminApiRequest('/api/platform/modules')
export const createPlatformLaboratory = payload => {
  const { accessSlug, ...fields } = payload
  delete fields.branchCode
  return adminApiRequest('/api/platform/laboratories', {
    method: 'POST',
    body: { ...fields, access_slug: accessSlug }
  })
}
