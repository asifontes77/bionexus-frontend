function positiveId(value) {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

function normalizedText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export function normalizeSampleType(value = {}) {
  const id = positiveId(value.id)
  const description = normalizedText(value.description)
  if (id === null || description === '') return null
  return { id, description }
}

function extractRows(value, depth = 0, visited = new Set()) {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== 'object' || depth > 5 || visited.has(value)) return []
  visited.add(value)
  for (const key of ['data', 'items', 'records', 'result', 'results', 'sampleTypes', 'sampletypes', 'payload', 'response']) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) continue
    const rows = extractRows(value[key], depth + 1, visited)
    if (rows.length || Array.isArray(value[key])) return rows
  }
  for (const nested of Object.values(value)) {
    const rows = extractRows(nested, depth + 1, visited)
    if (rows.length) return rows
  }
  return []
}

export function normalizeSampleTypes(value) {
  return extractRows(value).map(normalizeSampleType).filter(Boolean).sort((left, right) => left.description.localeCompare(right.description, 'es'))
}

export function normalizeSampleTypePayload(value = {}) {
  const description = normalizedText(value.description)
  if (description === '') throw new Error('SAMPLE_TYPE_DESCRIPTION_REQUIRED')
  if (description.length > 50) throw new Error('SAMPLE_TYPE_DESCRIPTION_TOO_LONG')
  return { description }
}