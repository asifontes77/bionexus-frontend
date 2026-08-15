function normalizeId(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeTypePaymentDescription(value) {
  return normalizeText(value);
}

export function normalizeTypePayment(value = {}) {
  const source = value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};

  return {
    id: normalizeId(source.id),
    description: normalizeTypePaymentDescription(source.description),
    description_1: normalizeText(source.description_1 ?? source.description1),
    description_2: normalizeText(source.description_2 ?? source.description2),
    only_dollars: Boolean(source.only_dollars ?? source.onlyDollars),
    annulled: Boolean(source.annulled),
  };
}

export function normalizeTypePayments(value) {
  const items = Array.isArray(value)
    ? value
    : Array.isArray(value?.data)
      ? value.data
      : [];

  return items
    .map((item) => normalizeTypePayment(item))
    .filter((item) => item.id > 0);
}

export function normalizeTypePaymentChanges(value = {}) {
  const source = value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
  const changes = {};

  if (Object.prototype.hasOwnProperty.call(source, "description")) {
    changes.description = normalizeTypePaymentDescription(source.description);
  }
  if (Object.prototype.hasOwnProperty.call(source, "description_1")) {
    changes.description_1 = normalizeText(source.description_1);
  }
  if (Object.prototype.hasOwnProperty.call(source, "description_2")) {
    changes.description_2 = normalizeText(source.description_2);
  }
  if (Object.prototype.hasOwnProperty.call(source, "only_dollars")) {
    changes.only_dollars = Boolean(source.only_dollars);
  }
  if (Object.prototype.hasOwnProperty.call(source, "annulled")) {
    changes.annulled = Boolean(source.annulled);
  }

  return changes;
}