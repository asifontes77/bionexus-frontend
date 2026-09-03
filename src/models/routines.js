function positiveId(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
}
function text(value) { return typeof value === "string" ? value.trim() : ""; }
export function normalizeRoutineExam(value = {}) {
  const row = { examId: positiveId(value.examId), description: text(value.description) };
  if (Object.prototype.hasOwnProperty.call(value, "active")) row.active = Boolean(value.active);
  return row;
}
export function normalizeRoutine(value = {}) {
  let raw = value.registered_exams;
  if (typeof raw === "string") { try { raw = JSON.parse(raw); } catch { raw = []; } }
  const registered_exams = (Array.isArray(raw) ? raw : []).map(normalizeRoutineExam).filter((item) => item.examId > 0);
  return { id: positiveId(value.id), description: text(value.description), details: text(value.details), registered_exams, examCount: registered_exams.length };
}
export function normalizeRoutines(value) {
  const rows = Array.isArray(value) ? value : Array.isArray(value?.data) ? value.data : [];
  return rows.map(normalizeRoutine).filter((row) => row.id > 0);
}
export function normalizeRoutinePayload(value = {}) {
  return {
    description: text(value.description),
    details: text(value.details),
    registered_exams: (Array.isArray(value.registered_exams) ? value.registered_exams : []).map((item) => {
      const row = { examId: positiveId(item.examId) };
      if (Object.prototype.hasOwnProperty.call(item, "active")) row.active = Boolean(item.active);
      return row;
    }),
  };
}
