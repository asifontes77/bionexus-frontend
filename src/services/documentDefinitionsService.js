import { apiRequest } from "@/api/apiClient";

const RESOURCE = "/api/document-definitions";

function positiveInteger(value, fieldName) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) throw new Error(`${fieldName} debe ser un entero positivo.`);
  return parsed;
}

function normalize(item) {
  if (!item) return null;
  return {
    id: Number(item.id), laboratoryId: Number(item.laboratoryId ?? item.laboratory_id),
    documentType: String(item.documentType ?? item.document_type ?? ""), name: String(item.name ?? ""),
    description: item.description == null ? "" : String(item.description),
    isActive: Boolean(item.isActive ?? item.is_active), createdAt: item.createdAt ?? item.created_at ?? null,
    updatedAt: item.updatedAt ?? item.updated_at ?? null,
  };
}

export async function listDocumentDefinitions(laboratoryId) {
  const response = await apiRequest(`${RESOURCE}?laboratoryId=${positiveInteger(laboratoryId, "laboratoryId")}`);
  const payload = response?.data?.items ?? response?.data ?? response?.items ?? response?.result ?? response;
  return (Array.isArray(payload) ? payload : []).map(normalize);
}

export async function getDocumentDefinition(id) {
  const response = await apiRequest(`${RESOURCE}/${positiveInteger(id, "id")}`);
  return normalize(response?.data ?? response);
}

export async function createDocumentDefinition(payload) {
  const response = await apiRequest(RESOURCE, { method: "POST", body: payload });
  return normalize(response?.data ?? response);
}

export async function updateDocumentDefinition(id, payload) {
  const response = await apiRequest(`${RESOURCE}/${positiveInteger(id, "id")}`, { method: "PATCH", body: payload });
  return normalize(response?.data ?? response);
}

export async function activateDocumentDefinition(id) {
  const response = await apiRequest(`${RESOURCE}/${positiveInteger(id, "id")}/activate`, { method: "PATCH" });
  return normalize(response?.data ?? response);
}
export async function duplicateDocumentDefinition(id) {
  const response = await apiRequest(`${RESOURCE}/${positiveInteger(id, "id")}/duplicate`, { method: "POST" });
  return normalize(response?.data ?? response);
}

export async function deleteDocumentDefinition(id) {
  return apiRequest(`${RESOURCE}/${positiveInteger(id, "id")}`, { method: "DELETE" });
}

export async function changeDocumentDefinitionStatus(id, isActive) {
  const response = await apiRequest(`${RESOURCE}/${positiveInteger(id, "id")}/status`, {
    method: "PATCH",
    body: { isActive: Boolean(isActive) },
  });
  return normalize(response?.data ?? response);
}
