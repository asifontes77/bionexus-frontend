import { apiRequest } from "@/api/apiClient";
import { normalizeRoutine, normalizeRoutines, normalizeRoutinePayload } from "@/models/routines";
export async function getRoutines() { return normalizeRoutines(await apiRequest("/api/routines")); }
export async function createRoutine(values) { return normalizeRoutine(await apiRequest("/api/routines", { method: "POST", body: normalizeRoutinePayload(values) })); }
export async function updateRoutine(routineId, values) {
  if (!Number.isInteger(routineId) || routineId <= 0) throw new Error("ROUTINE_ID_INVALID");
  return normalizeRoutine(await apiRequest(`/api/routines/${routineId}`, { method: "PATCH", body: normalizeRoutinePayload(values) }));
}
export async function deleteRoutine(routineId) {
  if (!Number.isInteger(routineId) || routineId <= 0) throw new Error("ROUTINE_ID_INVALID");
  return apiRequest(`/api/routines/${routineId}`, { method: "DELETE" });
}
export function routineError(error, fallback) {
  const code = String(error?.message || "");
  const messages = {
    ROUTINE_NOT_FOUND: "La rutina seleccionada ya no existe.",
    ROUTINE_DESCRIPTION_REQUIRED: "La descripción es obligatoria.",
    ROUTINE_TEXT_TOO_LONG: "Uno de los textos supera el límite permitido.",
    ROUTINE_EXAMS_ARRAY_REQUIRED: "Debes seleccionar los exámenes de la rutina.",
    ROUTINE_EXAMS_COUNT_INVALID: "Selecciona al menos un examen.",
    ROUTINE_EXAM_DUPLICATED: "Un examen está repetido en la rutina.",
    ROUTINE_EXAMS_NOT_FOUND: "Uno o más exámenes ya no están disponibles.",
  };
  return messages[code] || code || fallback;
}
