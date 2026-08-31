import { apiRequest } from "@/api/apiClient";

export function getPatientResultsEmailCandidates(date) {
  return apiRequest(`/api/patients/results-email?date=${encodeURIComponent(date)}`);
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
