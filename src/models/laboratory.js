const EMAIL_DEFAULTS = Object.freeze({ isGmail: true, host: '', port: null, secure: false, user: '', pass: '', from: '' });
const QR_DEFAULTS = Object.freeze({ activeQR: false, fn: '', email: '', phone: '', bioanalista: '', codigo: '' });
const BOOLEAN_FIELDS = Object.freeze(['print_invoice', 'print_sample_take', 'print_receipt']);
const INTEGER_FIELDS = Object.freeze(['invoice_number', 'creditnote_number', 'voucher_number', 'rows_description_invoices', 'max_height_logo', 'max_width_logo', 'maximum_rows_report', 'rows_description_receipt', 'receipt_number']);
const UPDATE_FIELDS = Object.freeze(['name', 'business_name', 'address', 'rif', 'phone_1', 'phone_2', 'email', 'logo', 'print_invoice', 'print_sample_take', 'url', 'invoice_number', 'creditnote_number', 'voucher_number', 'mask_phone', 'voucher_format', 'rows_description_invoices', 'max_height_logo', 'max_width_logo', 'settingQR', 'sendEmail', 'head_html', 'body_html', 'page_html', 'maximum_rows_report', 'workshee_format', 'receipt_format', 'rows_description_receipt', 'receipt_number', 'print_receipt']);
function objectOr(value, fallback = {}) { return value && typeof value === 'object' && !Array.isArray(value) ? value : fallback; }
function integerOr(value, fallback = 0) { const number = Number(value); return Number.isInteger(number) && number >= 0 ? number : fallback; }
export function normalizeLaboratory(value) {
  const source = objectOr(value);
  const normalized = { ...source, id: integerOr(source.id, 1), sendEmail: { ...EMAIL_DEFAULTS, ...objectOr(source.sendEmail) }, settingQR: { ...QR_DEFAULTS, ...objectOr(source.settingQR) } };
  BOOLEAN_FIELDS.forEach((field) => { normalized[field] = Boolean(source[field]); });
  INTEGER_FIELDS.forEach((field) => { normalized[field] = integerOr(source[field]); });
  normalized.sendEmail.pass = '';
  delete normalized.license;
  return normalized;
}
export function normalizeLaboratoryChanges(value) {
  const source = objectOr(value);
  const normalized = {};
  UPDATE_FIELDS.forEach((field) => { if (Object.prototype.hasOwnProperty.call(source, field)) normalized[field] = source[field]; });
  BOOLEAN_FIELDS.forEach((field) => { if (Object.prototype.hasOwnProperty.call(normalized, field)) normalized[field] = Boolean(normalized[field]); });
  INTEGER_FIELDS.forEach((field) => { if (Object.prototype.hasOwnProperty.call(normalized, field)) normalized[field] = integerOr(normalized[field]); });
  if (Object.prototype.hasOwnProperty.call(normalized, 'sendEmail')) normalized.sendEmail = { ...EMAIL_DEFAULTS, ...objectOr(normalized.sendEmail), pass: typeof normalized.sendEmail?.pass === 'string' ? normalized.sendEmail.pass : '' };
  if (Object.prototype.hasOwnProperty.call(normalized, 'settingQR')) normalized.settingQR = { ...QR_DEFAULTS, ...objectOr(normalized.settingQR) };
  return normalized;
}
export function validateLaboratoryRequired(value) {
  const required = [['business_name', 'La razÃ³n social es obligatoria.'], ['name', 'El nombre del laboratorio es obligatorio.'], ['address', 'El domicilio es obligatorio.'], ['email', 'El correo es obligatorio.'], ['rif', 'El RIF es obligatorio.'], ['phone_1', 'El telÃ©fono principal es obligatorio.'], ['mask_phone', 'La mÃ¡scara de telÃ©fono es obligatoria.']];
  return required.filter(([field]) => String(value?.[field] ?? '').trim() === '').map(([, message]) => message);
}