function positiveId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeGerm(value = {}) {
  const id = positiveId(value.id);
  const germen = text(value.germen);
  if (id === null || germen === "") return null;
  return { id, germen, annulled: Boolean(value.annulled) };
}

export function normalizeGerms(value) {
  const rows = Array.isArray(value) ? value : Array.isArray(value?.data) ? value.data : [];
  return rows.map(normalizeGerm).filter(Boolean).sort((left, right) => left.germen.localeCompare(right.germen));
}

export function normalizeGermPayload(value = {}) {
  const germen = text(value.germen);
  if (!germen) throw new Error("GERM_GERMEN_REQUIRED");
  if (germen.length > 50) throw new Error("GERM_GERMEN_TOO_LONG");
  return { germen };
}

export function normalizeGermChanges(value = {}) {
  const changes = {};
  if (Object.prototype.hasOwnProperty.call(value, "germen")) changes.germen = normalizeGermPayload(value).germen;
  if (Object.prototype.hasOwnProperty.call(value, "annulled")) {
    if (typeof value.annulled !== "boolean") throw new Error("GERM_ANNULLED_INVALID");
    changes.annulled = value.annulled;
  }
  if (!Object.keys(changes).length) throw new Error("GERM_UPDATE_REQUIRED");
  return changes;
}