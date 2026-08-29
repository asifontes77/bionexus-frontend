const FIELDS = Object.freeze([
  'session_timeout_minutes',
  'inactivity_timeout_minutes',
  'countdown_seconds',
  'voucher_format',
  'receipt_format',
  'head_html',
  'body_html',
  'page_html',
  'maximum_rows_report',
  'workshee_format',
  'printer_type',
  'printer_interface'
])

export function normalizeApplicationSettings(value = {}) {
  const source = value && typeof value === 'object' ? value : {}
  return {
    id: Number(source.id) || 1,
    session_timeout_minutes: Number.isInteger(Number(source.session_timeout_minutes)) ? Number(source.session_timeout_minutes) : 30,
    inactivity_timeout_minutes: Number.isInteger(Number(source.inactivity_timeout_minutes)) ? Number(source.inactivity_timeout_minutes) : 20,
    countdown_seconds: Number.isInteger(Number(source.countdown_seconds)) ? Number(source.countdown_seconds) : 120,
    voucher_format: String(source.voucher_format || ''),
    receipt_format: String(source.receipt_format || ''),
    head_html: String(source.head_html || ''),
    body_html: String(source.body_html || ''),
    page_html: String(source.page_html || ''),
    maximum_rows_report: Number.isInteger(Number(source.maximum_rows_report)) ? Number(source.maximum_rows_report) : 38,
    workshee_format: String(source.workshee_format || ''),
    printer_type: String(source.printer_type || ''),
    printer_interface: String(source.printer_interface || '')
  }
}

export function applicationSettingsChanges(value = {}) {
  const source = normalizeApplicationSettings(value)
  const result = {}
  for (const field of FIELDS) result[field] = source[field]
  return result
}

export function validateApplicationSettings(value) {
  const errors = []
  const session = Number(value?.session_timeout_minutes)
  const inactivity = Number(value?.inactivity_timeout_minutes)
  const countdown = Number(value?.countdown_seconds)
  const rows = Number(value?.maximum_rows_report)
  if (!Number.isInteger(session) || session < 5 || session > 1440) errors.push('La duracion de la sesion debe estar entre 5 y 1440 minutos.')
  if (!Number.isInteger(inactivity) || inactivity < 1 || inactivity > 720) errors.push('La inactividad debe estar entre 1 y 720 minutos.')
  if (!Number.isInteger(countdown) || countdown < 0 || countdown > 600) errors.push('La cuenta regresiva debe estar entre 0 y 600 segundos.')
  if (Number.isInteger(session) && Number.isInteger(inactivity) && Number.isInteger(countdown) && (inactivity * 60) + countdown > session * 60) errors.push('La inactividad mas la cuenta regresiva no puede superar la duracion de la sesion.')
  if (!Number.isInteger(rows) || rows < 1 || rows > 500) errors.push('Las filas maximas del reporte deben estar entre 1 y 500.')
  for (const field of ['printer_type', 'printer_interface']) if (String(value?.[field] || '').length > 100) errors.push('La configuracion de impresora admite hasta 100 caracteres.')
  return errors
}
