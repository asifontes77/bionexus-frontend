const FIELDS = Object.freeze([
  'session_timeout_minutes', 'inactivity_timeout_minutes', 'countdown_seconds',
  'locale', 'time_zone', 'date_format', 'hour_cycle', 'currency_code', 'currency_symbol',
  'currency_symbol_position', 'financial_primary_currency', 'base_currency_symbol', 'base_currency_symbol_position', 'monetary_decimals', 'first_day_of_week', 'decimal_separator',
  'voucher_format', 'receipt_format', 'head_html', 'body_html', 'page_html',
  'maximum_rows_report', 'workshee_format', 'printer_type', 'printer_interface'
])
const REGIONAL_OPTIONS = Object.freeze({ locale: ['es-VE'], time_zone: ['America/Caracas'], date_format: ['dd/MM/yyyy', 'dd-MM-yyyy', 'yyyy-MM-dd'], hour_cycle: ['h12', 'h23'], currency_code: ['VES'], currency_symbol_position: ['before', 'after'], financial_primary_currency: ['VES', 'USD'], base_currency_symbol_position: ['before', 'after'], first_day_of_week: ['monday', 'sunday'], decimal_separator: [',', '.'] })
export function normalizeApplicationSettings(value = {}) {
  const source = value && typeof value === 'object' ? value : {}
  return {
    id: Number(source.id) || 1,
    session_timeout_minutes: Number.isInteger(Number(source.session_timeout_minutes)) ? Number(source.session_timeout_minutes) : 30,
    inactivity_timeout_minutes: Number.isInteger(Number(source.inactivity_timeout_minutes)) ? Number(source.inactivity_timeout_minutes) : 20,
    countdown_seconds: Number.isInteger(Number(source.countdown_seconds)) ? Number(source.countdown_seconds) : 120,
    locale: String(source.locale || 'es-VE'), time_zone: String(source.time_zone || 'America/Caracas'), date_format: String(source.date_format || 'dd/MM/yyyy'), hour_cycle: String(source.hour_cycle || 'h12'), currency_code: String(source.currency_code || 'VES'), currency_symbol: String(source.currency_symbol || 'Bs.'), currency_symbol_position: String(source.currency_symbol_position || 'before'), financial_primary_currency: source.financial_primary_currency === 'USD' ? 'USD' : 'VES', base_currency_symbol: String(source.base_currency_symbol || 'USD'), base_currency_symbol_position: source.base_currency_symbol_position === 'after' ? 'after' : 'before', monetary_decimals: Number.isInteger(Number(source.monetary_decimals)) ? Number(source.monetary_decimals) : 2, first_day_of_week: String(source.first_day_of_week || 'monday'), decimal_separator: source.decimal_separator === '.' ? '.' : ',',
    voucher_format: String(source.voucher_format || ''), receipt_format: String(source.receipt_format || ''), head_html: String(source.head_html || ''), body_html: String(source.body_html || ''), page_html: String(source.page_html || ''), maximum_rows_report: Number.isInteger(Number(source.maximum_rows_report)) ? Number(source.maximum_rows_report) : 38, workshee_format: String(source.workshee_format || ''), printer_type: String(source.printer_type || ''), printer_interface: String(source.printer_interface || '')
  }
}
export function applicationSettingsChanges(value = {}) { const source = normalizeApplicationSettings(value); const result = {}; for (const field of FIELDS) result[field] = source[field]; return result }
export function validateApplicationSettings(value) {
  const errors = [], session=Number(value?.session_timeout_minutes), inactivity=Number(value?.inactivity_timeout_minutes), countdown=Number(value?.countdown_seconds), rows=Number(value?.maximum_rows_report), decimals=Number(value?.monetary_decimals)
  if(!Number.isInteger(session)||session<5||session>1440)errors.push('La duración de la sesión debe estar entre 5 y 1440 minutos.')
  if(!Number.isInteger(inactivity)||inactivity<1||inactivity>720)errors.push('La inactividad debe estar entre 1 y 720 minutos.')
  if(!Number.isInteger(countdown)||countdown<0||countdown>600)errors.push('La cuenta regresiva debe estar entre 0 y 600 segundos.')
  if(Number.isInteger(session)&&Number.isInteger(inactivity)&&Number.isInteger(countdown)&&(inactivity*60)+countdown>session*60)errors.push('La inactividad más la cuenta regresiva no puede superar la duración de la sesión.')
  if(!Number.isInteger(rows)||rows<1||rows>500)errors.push('Las filas máximas del reporte deben estar entre 1 y 500.')
  for(const [field,allowed] of Object.entries(REGIONAL_OPTIONS))if(!allowed.includes(String(value?.[field]||'')))errors.push('La configuración regional contiene una opción no permitida.')
  for(const field of ['currency_symbol','base_currency_symbol'])if(String(value?.[field]||'').trim()===''||String(value?.[field]||'').length>12)errors.push('Cada símbolo monetario debe contener entre 1 y 12 caracteres.')
  if(!Number.isInteger(decimals)||decimals<0||decimals>4)errors.push('Los decimales monetarios deben estar entre 0 y 4.')
  for(const field of ['printer_type','printer_interface'])if(String(value?.[field]||'').length>100)errors.push('La configuración de impresora admite hasta 100 caracteres.')
  return errors
}
