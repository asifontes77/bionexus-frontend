import { apiRequest } from "@/api/apiClient";

function requireDocumentId(documentId) {
  const value = Number(documentId);
  if (!Number.isInteger(value) || value <= 0) throw new Error("El identificador del comprobante no es valido.");
  return value;
}

export async function getDocumentDesign(documentId) {
  const id = requireDocumentId(documentId);
  return apiRequest(`/api/document-definitions/${id}/design`);
}

export async function saveDocumentDesign(documentId, payload) {
  const id = requireDocumentId(documentId);
  return apiRequest(`/api/document-definitions/${id}/design`, { method: "PATCH", body: payload });
}
