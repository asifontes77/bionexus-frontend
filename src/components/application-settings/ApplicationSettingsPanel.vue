<template>
  <section class="application-settings-panel">
    <section v-show="activeTab === 'formats'" id="application-settings-panel-formats" role="tabpanel" aria-labelledby="application-settings-tab-formats" class="settings-stack">
      <article class="bio-nexus-panel">
        <div class="bio-nexus-panel-heading"><div><p class="bio-nexus-panel-eyebrow">Documentos</p><h3>Formatos de impresión</h3></div></div>
        <div class="settings-grid">
          <BioNexusFormField label="Formato de factura" field-id="app-voucher" wide><textarea id="app-voucher" v-model="model.voucher_format" class="bio-nexus-field code-field" rows="7" :disabled="disabled" /></BioNexusFormField>
          <BioNexusFormField label="Formato de comprobante" field-id="app-receipt" wide><textarea id="app-receipt" v-model="model.receipt_format" class="bio-nexus-field code-field" rows="7" :disabled="disabled" /></BioNexusFormField>
          <BioNexusFormField label="Formato de hoja de trabajo" field-id="app-worksheet" wide><textarea id="app-worksheet" v-model="model.workshee_format" class="bio-nexus-field code-field" rows="7" :disabled="disabled" /></BioNexusFormField>
        </div>
      </article>
      <article class="bio-nexus-panel">
        <div class="bio-nexus-panel-heading"><div><p class="bio-nexus-panel-eyebrow">Reportes</p><h3>Plantillas HTML</h3></div></div>
        <div class="settings-grid">
          <BioNexusFormField label="Cabecera HTML" field-id="app-head" wide><textarea id="app-head" v-model="model.head_html" class="bio-nexus-field code-field" rows="6" :disabled="disabled" /></BioNexusFormField>
          <BioNexusFormField label="Cuerpo HTML" field-id="app-body" wide><textarea id="app-body" v-model="model.body_html" class="bio-nexus-field code-field" rows="6" :disabled="disabled" /></BioNexusFormField>
          <BioNexusFormField label="Página HTML" field-id="app-page" wide><textarea id="app-page" v-model="model.page_html" class="bio-nexus-field code-field" rows="6" :disabled="disabled" /></BioNexusFormField>
          <BioNexusFormField label="Filas máximas del reporte" field-id="app-rows"><input id="app-rows" v-model.number="model.maximum_rows_report" class="bio-nexus-field" type="number" min="1" max="500" :disabled="disabled" /></BioNexusFormField>
        </div>
      </article>
    </section>

    <section v-show="activeTab === 'session'" id="application-settings-panel-session" role="tabpanel" aria-labelledby="application-settings-tab-session">
      <article class="bio-nexus-panel">
        <div class="bio-nexus-panel-heading"><div><p class="bio-nexus-panel-eyebrow">Seguridad</p><h3>Duración y control de la sesión</h3></div></div>
        <div class="session-grid">
          <BioNexusFormField label="Duración de la sesión" field-id="app-session-timeout" help="Entre 5 y 1440 minutos. Se renueva automáticamente mientras exista actividad."><div class="number-with-unit"><input id="app-session-timeout" v-model.number="model.session_timeout_minutes" class="bio-nexus-field" type="number" min="5" max="1440" :disabled="disabled" /><span>minutos</span></div></BioNexusFormField>
          <BioNexusFormField label="Inactividad" field-id="app-inactivity-timeout" help="Entre 1 y 720 minutos. Al alcanzarse, se muestra el diálogo si la cuenta regresiva es mayor que cero."><div class="number-with-unit"><input id="app-inactivity-timeout" v-model.number="model.inactivity_timeout_minutes" class="bio-nexus-field" type="number" min="1" max="720" :disabled="disabled" /><span>minutos</span></div></BioNexusFormField>
          <BioNexusFormField label="Duración de la cuenta regresiva" field-id="app-countdown" help="Entre 0 y 600 segundos. El valor 0 deshabilita el diálogo de inactividad."><div class="number-with-unit"><input id="app-countdown" v-model.number="model.countdown_seconds" class="bio-nexus-field" type="number" min="0" max="600" :disabled="disabled" /><span>segundos</span></div></BioNexusFormField>
        </div>
        <div class="session-rule" :class="{ 'session-rule-error': !timeoutCombinationValid }">
          <span v-if="timeoutCombinationValid">La inactividad y la cuenta regresiva respetan la duración total de la sesión.</span>
          <span v-else>La inactividad más la cuenta regresiva no puede superar la duración de la sesión.</span>
        </div>
      </article>
    </section>

    <section v-show="activeTab === 'printer'" id="application-settings-panel-printer" role="tabpanel" aria-labelledby="application-settings-tab-printer">
      <article class="bio-nexus-panel">
        <div class="bio-nexus-panel-heading"><div><p class="bio-nexus-panel-eyebrow">Dispositivos</p><h3>Impresora de toma de muestra</h3></div></div>
        <div class="printer-grid">
          <BioNexusFormField label="Impresora tiquera" field-id="app-printer"><input id="app-printer" v-model="model.printer_type" class="bio-nexus-field" maxlength="100" :disabled="disabled" /></BioNexusFormField>
          <BioNexusFormField label="Localización en red" field-id="app-interface" help="Ej. //localhost/pos-80"><input id="app-interface" v-model="model.printer_interface" class="bio-nexus-field" maxlength="100" :disabled="disabled" /></BioNexusFormField>
        </div>
      </article>
    </section>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import BioNexusFormField from '@/components/ui/BioNexusFormField.vue'
const props = defineProps({
  model: { type: Object, required: true },
  activeTab: { type: String, required: true },
  disabled: { type: Boolean, default: false }
})
const timeoutCombinationValid = computed(() => {
  const sessionSeconds = Number(props.model.session_timeout_minutes) * 60
  const inactivitySeconds = Number(props.model.inactivity_timeout_minutes) * 60
  const countdownSeconds = Number(props.model.countdown_seconds)
  return Number.isFinite(sessionSeconds) && Number.isFinite(inactivitySeconds) && Number.isFinite(countdownSeconds) && inactivitySeconds + countdownSeconds <= sessionSeconds
})
</script>

<style scoped>
.application-settings-panel,.settings-stack{display:grid;gap:var(--bio-nexus-space-4)}
.settings-grid,.printer-grid,.session-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--bio-nexus-space-4)}
.session-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
.number-with-unit{position:relative}.number-with-unit input{padding-inline-end:76px}.number-with-unit span{position:absolute;inset-inline-end:12px;inset-block-start:50%;transform:translateY(-50%);color:var(--bio-nexus-color-text-muted);font-size:var(--bio-nexus-font-size-xs);pointer-events:none}
.session-rule{margin-top:var(--bio-nexus-space-4);padding:var(--bio-nexus-space-3);border:1px solid var(--bio-nexus-color-success-border);border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-success-soft);color:var(--bio-nexus-color-success-strong)}
.session-rule-error{border-color:var(--bio-nexus-color-danger-border);background:var(--bio-nexus-color-danger-soft);color:var(--bio-nexus-color-danger)}
.code-field{min-height:130px;resize:vertical;font-family:ui-monospace,SFMono-Regular,Consolas,monospace}
@media(max-width:900px){.session-grid{grid-template-columns:1fr}}@media(max-width:800px){.settings-grid,.printer-grid{grid-template-columns:1fr}}
</style>
