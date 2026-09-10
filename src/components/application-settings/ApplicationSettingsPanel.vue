<template>
  <section class="application-settings-panel">
    <section v-show="activeTab === 'regional'" id="application-settings-panel-regional" role="tabpanel" aria-labelledby="application-settings-tab-regional" class="regional-layout">
      <article class="bio-nexus-panel regional-settings-panel">
        <div class="bio-nexus-panel-heading"><div><p class="bio-nexus-panel-eyebrow">PRESENTACIÓN GENERAL</p><h3>Formatos regionales</h3><span class="panel-description">Configura cada aspecto de presentación en su bloque correspondiente.</span></div></div>
        <div class="regional-responsibility-list">
          <section class="regional-section" aria-labelledby="regional-context-title">
            <div class="regional-section-heading"><span class="regional-section-icon"><BioNexusIcon name="language" :size="20" :weight="500" /></span><div><h4 id="regional-context-title">Región</h4><p>Idioma y zona horaria usados como contexto general.</p></div></div>
            <div class="regional-section-grid">
              <BioNexusFormField label="Idioma y región" field-id="app-locale"><select id="app-locale" v-model="model.locale" class="bio-nexus-field" :disabled="disabled"><option value="es-VE">Español (Venezuela)</option></select></BioNexusFormField>
              <BioNexusFormField label="Zona horaria" field-id="app-time-zone"><select id="app-time-zone" v-model="model.time_zone" class="bio-nexus-field" :disabled="disabled"><option value="America/Caracas">America/Caracas</option></select></BioNexusFormField>
            </div>
          </section>
          <section class="regional-section" aria-labelledby="regional-date-title">
            <div class="regional-section-heading"><span class="regional-section-icon"><BioNexusIcon name="calendar_month" :size="20" :weight="500" /></span><div><h4 id="regional-date-title">Fecha y hora</h4><p>Define el orden de las fechas, el ciclo horario y el inicio de semana.</p></div></div>
            <div class="regional-section-grid regional-section-grid-three">
              <BioNexusFormField label="Formato de fecha" field-id="app-date-format"><select id="app-date-format" v-model="model.date_format" class="bio-nexus-field" :disabled="disabled"><option value="dd/MM/yyyy">DD/MM/AAAA</option><option value="dd-MM-yyyy">DD-MM-AAAA</option><option value="yyyy-MM-dd">AAAA-MM-DD</option></select></BioNexusFormField>
              <BioNexusFormField label="Formato de hora" field-id="app-hour-cycle"><select id="app-hour-cycle" v-model="model.hour_cycle" class="bio-nexus-field" :disabled="disabled"><option value="h12">12 horas</option><option value="h23">24 horas</option></select></BioNexusFormField>
              <BioNexusFormField label="Primer día de la semana" field-id="app-first-day"><select id="app-first-day" v-model="model.first_day_of_week" class="bio-nexus-field" :disabled="disabled"><option value="monday">Lunes</option><option value="sunday">Domingo</option></select></BioNexusFormField>
            </div>
          </section>
          <section class="regional-section" aria-labelledby="regional-local-title">
            <div class="regional-section-heading"><span class="regional-section-icon"><BioNexusIcon name="payments" :size="20" :weight="500" /></span><div><h4 id="regional-local-title">Moneda local</h4><p>Configura la moneda operativa y la ubicación de su símbolo.</p></div></div>
            <div class="regional-section-grid regional-section-grid-three">
              <BioNexusFormField label="Moneda local" field-id="app-currency"><select id="app-currency" v-model="model.currency_code" class="bio-nexus-field" :disabled="disabled"><option value="VES">Bolívar venezolano (VES)</option></select></BioNexusFormField>
              <BioNexusFormField label="Símbolo monetario local" field-id="app-currency-symbol"><input id="app-currency-symbol" v-model.trim="model.currency_symbol" class="bio-nexus-field" maxlength="12" :disabled="disabled"></BioNexusFormField>
              <BioNexusFormField label="Posición del símbolo local" field-id="app-symbol-position"><select id="app-symbol-position" v-model="model.currency_symbol_position" class="bio-nexus-field" :disabled="disabled"><option value="before">Antes del monto</option><option value="after">Después del monto</option></select></BioNexusFormField>
            </div>
          </section>
          <section class="regional-section" aria-labelledby="regional-base-title">
            <div class="regional-section-heading"><span class="regional-section-icon"><BioNexusIcon name="price_change" :size="20" :weight="500" /></span><div><h4 id="regional-base-title">Moneda base de precios</h4><p>Personaliza cómo se presenta el dólar sin alterar la moneda interna de las tarifas.</p></div></div>
            <div class="regional-section-grid regional-section-grid-three">
              <BioNexusFormField label="Moneda base" field-id="app-price-base"><input id="app-price-base" value="Dólar estadounidense (USD)" class="bio-nexus-field calculated-field" readonly aria-readonly="true" tabindex="-1" /></BioNexusFormField>
              <BioNexusFormField label="Símbolo monetario base" field-id="app-base-currency-symbol"><input id="app-base-currency-symbol" v-model.trim="model.base_currency_symbol" class="bio-nexus-field" maxlength="12" :disabled="disabled"></BioNexusFormField>
              <BioNexusFormField label="Posición del símbolo base" field-id="app-base-symbol-position"><select id="app-base-symbol-position" v-model="model.base_currency_symbol_position" class="bio-nexus-field" :disabled="disabled"><option value="before">Antes del monto</option><option value="after">Después del monto</option></select></BioNexusFormField>
            </div>
          </section>
          <section class="regional-section" aria-labelledby="regional-number-title">
            <div class="regional-section-heading"><span class="regional-section-icon"><BioNexusIcon name="123" :size="20" :weight="500" /></span><div><h4 id="regional-number-title">Presentación numérica y financiera</h4><p>Define la moneda destacada, la precisión y el separador decimal.</p></div></div>
            <div class="regional-section-grid regional-section-grid-three">
              <BioNexusFormField label="Visualización financiera principal" field-id="app-financial-primary"><select id="app-financial-primary" v-model="model.financial_primary_currency" class="bio-nexus-field" :disabled="disabled"><option value="VES">Bolívar venezolano (VES)</option><option value="USD">Dólar estadounidense (USD)</option></select></BioNexusFormField>
              <BioNexusFormField label="Decimales monetarios" field-id="app-monetary-decimals"><input id="app-monetary-decimals" v-model.number="model.monetary_decimals" class="bio-nexus-field" type="number" min="0" max="4" :disabled="disabled"></BioNexusFormField>
              <BioNexusFormField label="Separador decimal" field-id="app-decimal-separator"><select id="app-decimal-separator" v-model="model.decimal_separator" class="bio-nexus-field" :disabled="disabled"><option value=",">Coma (1.234,56)</option><option value=".">Punto (1,234.56)</option></select></BioNexusFormField>
            </div>
          </section>
        </div>
      </article>
      <article class="bio-nexus-panel regional-preview-panel">
        <div class="bio-nexus-panel-heading"><div><p class="bio-nexus-panel-eyebrow">VISTA PREVIA</p><h3>Así se mostrará la información</h3><span class="panel-description">Los separadores se derivan automáticamente del idioma y la región.</span></div></div>
        <div class="preview-list">
          <div><span>Fecha</span><strong>{{ previewDate }}</strong></div>
          <div><span>Fecha y hora</span><strong>{{ previewDateTime }}</strong></div>
          <div><span>Número</span><strong>{{ previewNumber }}</strong></div>
          <div><span>Precio base</span><strong>{{ previewUsd }}</strong></div><div><span>Equivalente local</span><strong>{{ previewCurrency }}</strong></div><div><span>Presentación financiera</span><strong>{{ previewDual.primary }}</strong><small>{{ previewDual.secondary }}</small></div>
        </div>
        <div class="separator-summary"><span><b>Decimal:</b> {{ decimalSeparator }}</span><span><b>Miles:</b> {{ groupSeparator }}</span><span><b>Semana inicia:</b> {{ firstDayLabel }}</span></div>
      </article>
    </section>
    <section v-show="activeTab === 'session'" id="application-settings-panel-session" role="tabpanel" aria-labelledby="application-settings-tab-session"><article class="bio-nexus-panel"><div class="bio-nexus-panel-heading"><div><p class="bio-nexus-panel-eyebrow">SEGURIDAD</p><h3>Duración y control de la sesión</h3></div></div><div class="session-grid"><BioNexusFormField label="Duración de la sesión" field-id="app-session-timeout" help="Entre 5 y 1440 minutos. Se renueva automáticamente mientras exista actividad."><div class="number-with-unit"><input id="app-session-timeout" v-model.number="model.session_timeout_minutes" class="bio-nexus-field" type="number" min="5" max="1440" :disabled="disabled"><span>minutos</span></div></BioNexusFormField><BioNexusFormField label="Inactividad" field-id="app-inactivity-timeout" help="Entre 1 y 720 minutos."><div class="number-with-unit"><input id="app-inactivity-timeout" v-model.number="model.inactivity_timeout_minutes" class="bio-nexus-field" type="number" min="1" max="720" :disabled="disabled"><span>minutos</span></div></BioNexusFormField><BioNexusFormField label="Duración de la cuenta regresiva" field-id="app-countdown" help="Entre 0 y 600 segundos. El valor 0 deshabilita el diálogo."><div class="number-with-unit"><input id="app-countdown" v-model.number="model.countdown_seconds" class="bio-nexus-field" type="number" min="0" max="600" :disabled="disabled"><span>segundos</span></div></BioNexusFormField></div><div class="session-rule" :class="{ 'session-rule-error': !timeoutCombinationValid }"><span v-if="timeoutCombinationValid">La inactividad y la cuenta regresiva respetan la duración total de la sesión.</span><span v-else>La inactividad más la cuenta regresiva no puede superar la duración de la sesión.</span></div></article></section>
    <section v-show="activeTab === 'printer'" id="application-settings-panel-printer" role="tabpanel" aria-labelledby="application-settings-tab-printer"><article class="bio-nexus-panel"><div class="bio-nexus-panel-heading"><div><p class="bio-nexus-panel-eyebrow">DISPOSITIVOS</p><h3>Impresora de toma de muestra</h3></div></div><div class="printer-grid"><BioNexusFormField label="Impresora tiquera" field-id="app-printer"><input id="app-printer" v-model="model.printer_type" class="bio-nexus-field" maxlength="100" :disabled="disabled"></BioNexusFormField><BioNexusFormField label="Localización en red" field-id="app-interface" help="Ej. //localhost/pos-80"><input id="app-interface" v-model="model.printer_interface" class="bio-nexus-field" maxlength="100" :disabled="disabled"></BioNexusFormField></div></article></section>
  </section>
</template>
<script setup>
import { computed } from 'vue'
import BioNexusFormField from '@/components/ui/BioNexusFormField.vue'
import BioNexusIcon from '@/components/ui/BioNexusIcon.vue'
import { formatDualMoney, formatRegionalMoney, formatRegionalNumber, formatUsdPrice } from '@/services/regionalFormatter'
const props=defineProps({model:{type:Object,required:true},activeTab:{type:String,required:true},disabled:{type:Boolean,default:false}})
const sampleDate=new Date(2026,8,6,20,15,0)
const timeoutCombinationValid=computed(()=>{const sessionSeconds=Number(props.model.session_timeout_minutes)*60,inactivitySeconds=Number(props.model.inactivity_timeout_minutes)*60,countdownSeconds=Number(props.model.countdown_seconds);return Number.isFinite(sessionSeconds)&&Number.isFinite(inactivitySeconds)&&Number.isFinite(countdownSeconds)&&inactivitySeconds+countdownSeconds<=sessionSeconds})
const dateParts=computed(()=>{const parts={day:'06',month:'09',year:'2026'};if(props.model.date_format==='yyyy-MM-dd')return parts.year+'-'+parts.month+'-'+parts.day;if(props.model.date_format==='dd-MM-yyyy')return parts.day+'-'+parts.month+'-'+parts.year;return parts.day+'/'+parts.month+'/'+parts.year})
const previewDate=computed(()=>dateParts.value)
const timeText=computed(()=>props.model.hour_cycle==='h23'?'20:15':'08:15 p. m.')
const previewDateTime=computed(()=>dateParts.value+', '+timeText.value)
const previewNumber=computed(()=>formatRegionalNumber(1234567.89,props.model,{minimumFractionDigits:2,maximumFractionDigits:2}))
const decimalSeparator=computed(()=>props.model.decimal_separator==='.'?'.':',')
const groupSeparator=computed(()=>props.model.decimal_separator==='.'?',':'.')
const previewUsd=computed(()=>formatUsdPrice(10,props.model))
const previewCurrency=computed(()=>formatRegionalMoney(8375.60,props.model))
const previewDual=computed(()=>formatDualMoney(10,837.56,props.model,props.model.financial_primary_currency))
const firstDayLabel=computed(()=>props.model.first_day_of_week==='sunday'?'Domingo':'Lunes')
</script>
<style scoped>
.application-settings-panel{display:grid;gap:var(--bio-nexus-space-4)}.regional-layout{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(300px,.75fr);gap:var(--bio-nexus-space-4);align-items:start}.regional-responsibility-list{display:grid;gap:var(--bio-nexus-space-4)}.regional-section{display:grid;gap:var(--bio-nexus-space-3);padding:var(--bio-nexus-space-4);border:1px solid var(--bio-nexus-color-border);border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-surface-soft)}.regional-section-heading{display:flex;align-items:flex-start;gap:var(--bio-nexus-space-3)}.regional-section-icon{display:grid;flex:0 0 36px;width:36px;height:36px;place-items:center;border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-primary-soft);color:var(--bio-nexus-color-primary-strong)}.regional-section-heading h4{margin:0;color:var(--bio-nexus-color-text-primary);font-size:var(--bio-nexus-font-size-md)}.regional-section-heading p{margin:4px 0 0;color:var(--bio-nexus-color-text-secondary);font-size:var(--bio-nexus-font-size-sm)}.regional-section-grid,.printer-grid,.session-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--bio-nexus-space-3)}.regional-section-grid-three{grid-template-columns:repeat(3,minmax(0,1fr))}.session-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.panel-description{display:block;margin-top:var(--bio-nexus-space-1);color:var(--bio-nexus-color-text-secondary);font-size:var(--bio-nexus-font-size-sm)}.regional-preview-panel{position:sticky;top:calc(var(--bio-nexus-topbar-height) + 78px)}.preview-list{display:grid;gap:var(--bio-nexus-space-2)}.preview-list>div{display:grid;gap:4px;padding:var(--bio-nexus-space-3);border:1px solid var(--bio-nexus-color-border);border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-surface-soft)}.preview-list span{color:var(--bio-nexus-color-text-muted);font-size:var(--bio-nexus-font-size-xs);font-weight:var(--bio-nexus-font-weight-bold);text-transform:uppercase}.preview-list strong{color:var(--bio-nexus-color-primary-strong);font-size:1.15rem;font-variant-numeric:tabular-nums}.separator-summary{display:flex;flex-wrap:wrap;gap:var(--bio-nexus-space-3);margin-top:var(--bio-nexus-space-3);padding-top:var(--bio-nexus-space-3);border-top:1px solid var(--bio-nexus-color-border);color:var(--bio-nexus-color-text-secondary);font-size:var(--bio-nexus-font-size-sm)}.calculated-field{background:var(--bio-nexus-color-surface-soft);color:var(--bio-nexus-color-text-secondary);cursor:not-allowed}.preview-list small{color:var(--bio-nexus-color-text-secondary);font-size:var(--bio-nexus-font-size-sm)}.number-with-unit{position:relative}.number-with-unit input{padding-inline-end:76px}.number-with-unit span{position:absolute;inset-inline-end:12px;inset-block-start:50%;transform:translateY(-50%);color:var(--bio-nexus-color-text-muted);font-size:var(--bio-nexus-font-size-xs);pointer-events:none}.session-rule{margin-top:var(--bio-nexus-space-4);padding:var(--bio-nexus-space-3);border:1px solid var(--bio-nexus-color-success-border);border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-success-soft);color:var(--bio-nexus-color-success-strong)}.session-rule-error{border-color:var(--bio-nexus-color-danger-border);background:var(--bio-nexus-color-danger-soft);color:var(--bio-nexus-color-danger)}@media(max-width:1050px){.regional-layout{grid-template-columns:1fr}.regional-preview-panel{position:static}}@media(max-width:1100px){.regional-section-grid-three{grid-template-columns:1fr}}@media(max-width:900px){.session-grid{grid-template-columns:1fr}}@media(max-width:800px){.regional-section-grid,.printer-grid{grid-template-columns:1fr}.regional-section{padding:var(--bio-nexus-space-3)}}
</style>
