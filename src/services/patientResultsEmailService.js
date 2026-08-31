import { apiRequest } from "@/api/apiClient";

export function getPatientResultsEmailCandidates(dateFrom, dateTo) {
  const query = new URLSearchParams({ dateFrom, dateTo });
  return apiRequest(`/api/patients/results-email?${query.toString()}`);
}

export function getValidatedPatientResults(id) {
  return apiRequest(`/api/patients/validresult/${Number(id)}`);
}

export function getPatientResultLaboratory() {
  return apiRequest("/api/laboratory/1");
}

export function getPatientResultApprover(id) {
  return apiRequest(`/api/users/${Number(id)}`);
}

export function sendPatientResultsEmail(id, resultHtml) {
  return apiRequest(`/api/patients/${Number(id)}/results-email`, {
    method: "POST",
    body: { resultHtml },
    timeoutMs: 60000,
  });
}
