import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const panel = read('src/components/application-settings/ApplicationSettingsPanel.vue');
const model = read('src/models/applicationSettings.js');
const view = read('src/views/ApplicationSettingsView.vue');
const router = read('src/router/index.js');

const fields = ['locale', 'time_zone', 'date_format', 'hour_cycle', 'currency_code', 'currency_symbol', 'currency_symbol_position', 'monetary_decimals', 'first_day_of_week'];
for (const field of fields) {
  if (!model.includes(field) || !panel.includes('model.' + field)) throw new Error('REGIONAL_FIELD_MISSING:' + field);
}

for (const value of ['es-VE', 'America/Caracas', 'dd/MM/yyyy', 'h12', 'VES', 'Bs.', 'before', 'monday']) {
  if (!model.includes(value)) throw new Error('DEFAULT_MISSING:' + value);
}

for (const text of ['Formatos regionales', 'VISTA PREVIA', 'Fecha y hora', 'N\u00famero', 'Moneda', 'Decimal:', 'Miles:']) {
  if (!panel.includes(text)) throw new Error('UI_MISSING:' + text);
}

if (!router.includes('query: { tab: "regional" }') || !router.includes('status: "available"')) throw new Error('ROUTER_NOT_AVAILABLE');
if (!view.includes("key: 'regional'") || !view.includes("'bio-nexus:regional-settings-local'")) throw new Error('VIEW_CONTRACT_MISSING');
console.log('[OK] Contrato regional Frontend aprobado.');