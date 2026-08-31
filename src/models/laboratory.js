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
export function validateLaboratoryIdentity(value) {
  const source = objectOr(value);
  const errors = {};
  const required = [['business_name', 'La razÃ³n social es obligatoria.'], ['name', 'El nombre del laboratorio es obligatorio.'], ['address', 'El domicilio es obligatorio.'], ['email', 'El correo es obligatorio.'], ['rif', 'El RIF es obligatorio.'], ['phone_1', 'El telÃ©fono principal es obligatorio.'], ['mask_phone', 'La mÃ¡scara de telÃ©fono es obligatoria.']];
  required.forEach(([field, message]) => { if (String(source[field] ?? '').trim() === '') errors[field] = message; });
  const email = String(source.email ?? '').trim();
  const url = String(source.url ?? '').trim();
  const rif = String(source.rif ?? '').trim();
  const phone1 = String(source.phone_1 ?? '').trim();
  const phone2 = String(source.phone_2 ?? '').trim();
  const mask = String(source.mask_phone ?? '').trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Ingrese un correo vÃ¡lido.';
  if (url && !/^https?:\/\/[^\s]+$/i.test(url)) errors.url = 'Ingrese una URL completa que comience con http:// o https://.';
  if (rif && !/^[VEJG]-?\d{7,9}-?\d$/i.test(rif)) errors.rif = 'Ingrese un RIF vÃ¡lido, por ejemplo J-12345678-9.';
  if (phone1 && !/^[+\d][\d\s()-]{5,19}$/.test(phone1)) errors.phone_1 = 'Ingrese un telÃ©fono vÃ¡lido.';
  if (phone2 && !/^[+\d][\d\s()-]{5,19}$/.test(phone2)) errors.phone_2 = 'Ingrese un telÃ©fono vÃ¡lido.';
  if (mask && !mask.includes('#')) errors.mask_phone = 'La mÃ¡scara debe contener marcadores #.';
  if (Object.prototype.hasOwnProperty.call(source, 'max_height_logo')) {
    const height = Number(source.max_height_logo);
    if (!Number.isInteger(height) || height < 20 || height > 200) errors.max_height_logo = 'La altura debe estar entre 20 y 200 px.';
  }
  if (Object.prototype.hasOwnProperty.call(source, 'max_width_logo')) {
    const width = Number(source.max_width_logo);
    if (!Number.isInteger(width) || width < 20 || width > 200) errors.max_width_logo = 'El ancho debe estar entre 20 y 200 px.';
  }
  if (Object.prototype.hasOwnProperty.call(source, 'settingQR')) {
    const qr = objectOr(source.settingQR);
    const allowedQr = ['activeQR', 'fn', 'email', 'phone', 'bioanalista', 'codigo'];
    if (Object.keys(qr).some(field => !allowedQr.includes(field))) errors.settingQR = 'La configuraciÃ³n QR contiene campos no permitidos.';
    if (Object.prototype.hasOwnProperty.call(qr, 'activeQR') && typeof qr.activeQR !== 'boolean') errors['settingQR.activeQR'] = 'El estado del QR no es vÃ¡lido.';
    const maximums = { fn: 100, email: 100, phone: 20, bioanalista: 100, codigo: 50 };
    Object.entries(maximums).forEach(([field, maximum]) => {
      if (Object.prototype.hasOwnProperty.call(qr, field) && (typeof qr[field] !== 'string' || qr[field].length > maximum)) errors['settingQR.' + field] = 'El valor no puede superar ' + maximum + ' caracteres.';
    });
    if (qr.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(qr.email.trim())) errors['settingQR.email'] = 'Ingrese un correo de contacto vÃ¡lido.';
    if (qr.phone && !/^[+\d][\d\s()-]{5,19}$/.test(qr.phone.trim())) errors['settingQR.phone'] = 'Ingrese un telÃ©fono de contacto vÃ¡lido.';
  }
  return errors;
}
export function validateLaboratoryRequired(value) { return Object.values(validateLaboratoryIdentity(value)); }
