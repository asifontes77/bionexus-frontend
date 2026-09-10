import { apiRequest } from "@/api/apiClient";
export function searchAdmissionPatients(term,limit=12){const q=encodeURIComponent(String(term||'').trim());return apiRequest(`/api/patients/search?q=${q}&limit=${limit}`)}
export function getAdmissionClients(){return apiRequest("/api/client/all")}
export function getAdmissionSampleTypes(){return apiRequest("/api/Sampletype")}
export function resolveAdmissionTariff(clientId,examCatalogIds=[]){const ids=examCatalogIds.map(Number).filter(Number.isInteger);const query=ids.length?`&examCatalogIds=${ids.join(",")}`:"";return apiRequest(`/api/admission-tariffs/resolve?clientId=${Number(clientId)}${query}`)}
export function patientAdmissionError(error,fallback="No fue posible completar la operación."){return String(error?.data?.message||error?.message||fallback)}
