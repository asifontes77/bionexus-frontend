function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asBoolean(value) {
  return value === true || value === 1;
}

function asPositiveInteger(value) {
  return Number.isInteger(value) && value > 0 ? value : null;
}

export function normalizeParasiticform(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const id = asPositiveInteger(value.id);
  const description =
    typeof value.description === "string" ? value.description.trim() : "";

  if (id === null || description === "") {
    return null;
  }

  return {
    id,
    description,
    annulled: asBoolean(value.annulled),
  };
}

export function normalizeParasiticforms(value) {
  return asArray(value)
    .map(normalizeParasiticform)
    .filter((parasiticform) => parasiticform !== null)
    .sort((left, right) => left.description.localeCompare(right.description));
}

export function normalizeParasiticformDescription(description) {
  if (typeof description !== "string") {
    throw new Error("PARASITICFORM_DESCRIPTION_REQUIRED");
  }

  const normalizedDescription = description.trim();

  if (normalizedDescription === "") {
    throw new Error("PARASITICFORM_DESCRIPTION_REQUIRED");
  }

  if (normalizedDescription.length > 50) {
    throw new Error("PARASITICFORM_DESCRIPTION_TOO_LONG");
  }

  return normalizedDescription;
}

export function normalizeParasiticformChanges(changes) {
  if (!changes || typeof changes !== "object" || Array.isArray(changes)) {
    throw new Error("PARASITICFORM_UPDATE_REQUIRED");
  }

  const normalizedChanges = {};

  if (Object.prototype.hasOwnProperty.call(changes, "description")) {
    normalizedChanges.description = normalizeParasiticformDescription(
      changes.description,
    );
  }

  if (Object.prototype.hasOwnProperty.call(changes, "annulled")) {
    if (typeof changes.annulled !== "boolean") {
      throw new Error("PARASITICFORM_ANNULLED_INVALID");
    }

    normalizedChanges.annulled = changes.annulled;
  }

  if (
    !Object.prototype.hasOwnProperty.call(normalizedChanges, "description") &&
    !Object.prototype.hasOwnProperty.call(normalizedChanges, "annulled")
  ) {
    throw new Error("PARASITICFORM_UPDATE_REQUIRED");
  }

  return normalizedChanges;
}
