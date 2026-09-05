import { apiRequest } from '@/api/apiClient'
import { normalizeWorksheetGroup, normalizeWorksheetGroups, normalizeWorksheetItem } from '@/models/worksheetGroups'
export async function getWorksheetGroups(){return normalizeWorksheetGroups(await apiRequest('/api/groupHt'))}
export async function getWorksheetGroup(id){return normalizeWorksheetGroup(await apiRequest(`/api/groupHt/${id}`))}
export async function createWorksheetGroup(values){return normalizeWorksheetGroup(await apiRequest('/api/groupHt',{method:'POST',body:values}))}
export async function updateWorksheetGroup(id,values){return normalizeWorksheetGroup(await apiRequest(`/api/groupHt/${id}`,{method:'PATCH',body:values}))}
export async function deleteWorksheetGroup(id){return apiRequest(`/api/groupHt/${id}`,{method:'DELETE'})}
export async function createWorksheetItem(values){return normalizeWorksheetItem(await apiRequest('/api/groupHtItems',{method:'POST',body:values}))}
export async function updateWorksheetItem(id,values){return normalizeWorksheetItem(await apiRequest(`/api/groupHtItems/${id}`,{method:'PATCH',body:values}))}
export async function deleteWorksheetItem(id){return apiRequest(`/api/groupHtItems/${id}`,{method:'DELETE'})}
export function worksheetGroupsError(error,fallback){const key=String(error?.message||'');const m={WORKSHEET_GROUP_NOT_FOUND:'El grupo seleccionado ya no existe.',WORKSHEET_GROUP_DESCRIPTION_ALREADY_EXISTS:'Ya existe un grupo con esa descripcion.',WORKSHEET_GROUP_HAS_ITEMS:'No se puede eliminar un grupo que contiene elementos.',WORKSHEET_GROUP_ITEM_NOT_FOUND:'El elemento seleccionado ya no existe.',WORKSHEET_GROUP_ITEM_ALREADY_EXISTS:'El examen ya pertenece a este grupo.',WORKSHEET_GROUP_ITEM_EXAM_NOT_FOUND:'El examen seleccionado ya no existe.',WORKSHEET_GROUP_PERMISSION_REQUIRED:'La cuenta actual no tiene permiso para realizar esta accion.'};return m[key]||key||fallback}
