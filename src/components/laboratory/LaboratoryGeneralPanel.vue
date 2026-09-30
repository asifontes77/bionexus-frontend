<template>
  <div class="laboratory-general-sections">
    <BioNexusSectionPanel title="Identificación" icon="business" description="Define los datos institucionales que identifican al laboratorio." variant="accent">
      <div class="form-grid">
        <BioNexusFormField v-for="field in identityFields" :key="field.key" :label="field.label" :field-id="'lab-'+field.key" :required="field.required" :wide="field.wide" :error="errors[field.key] || ''" :help="field.max ? String(model[field.key] || '').length + ' de ' + field.max + ' caracteres' : ''">
          <textarea v-if="field.wide" v-model="model[field.key]" class="bio-nexus-field" rows="3" :maxlength="field.max" :disabled="disabled" />
          <input v-else v-model="model[field.key]" class="bio-nexus-field" :type="field.type || 'text'" :maxlength="field.max" :disabled="disabled" />
        </BioNexusFormField>
      </div>
    </BioNexusSectionPanel>

    <BioNexusSectionPanel title="Contacto" icon="contact_phone" description="Configura los medios de contacto institucionales del laboratorio." variant="accent">
      <div class="form-grid">
        <BioNexusFormField v-for="field in contactFields" :key="field.key" :label="field.label" :field-id="'lab-'+field.key" :required="field.required" :error="errors[field.key] || ''" :help="field.max ? String(model[field.key] || '').length + ' de ' + field.max + ' caracteres' : ''">
          <input v-model="model[field.key]" class="bio-nexus-field" :type="field.type || 'text'" :maxlength="field.max" :disabled="disabled" />
        </BioNexusFormField>
      </div>
    </BioNexusSectionPanel>

    <BioNexusSectionPanel title="Código QR de contacto" icon="qr_code_2" description="Configura los datos de contacto que se usarán para generar el QR institucional." variant="accent">
      <template #actions><BioNexusCheckbox v-model="model.settingQR.activeQR" class="toggle" label="Configurar QR" :disabled="disabled" /></template>
      <p class="qr-note">La inserción del QR en resultados o documentos se habilitará posteriormente desde Documentos y plantillas.</p><p v-if="errors.settingQR" class="section-error" role="alert">{{ errors.settingQR }}</p>
      <div v-if="model.settingQR.activeQR" class="form-grid qr-fields">
        <BioNexusFormField v-for="field in qrFields" :key="field.key" :label="field.label" :field-id="'qr-'+field.key" :error="errors['settingQR.'+field.key] || ''" :help="String(model.settingQR[field.key] || '').length + ' de ' + field.max + ' caracteres'">
          <input v-model="model.settingQR[field.key]" class="bio-nexus-field" :type="field.type || 'text'" :maxlength="field.max" :disabled="disabled">
        </BioNexusFormField>
      </div>
    </BioNexusSectionPanel>
  </div>
</template>
<script setup>
import BioNexusCheckbox from '@/components/ui/BioNexusCheckbox.vue'
import BioNexusFormField from '@/components/ui/BioNexusFormField.vue'
import BioNexusSectionPanel from '@/components/ui/BioNexusSectionPanel.vue'
defineProps({ model: { type: Object, required: true }, errors: { type: Object, default: () => ({}) }, disabled: { type: Boolean, default: false } })
const identityFields=Object.freeze([{key:'business_name',label:'Razón social',max:100,required:true},{key:'name',label:'Nombre comercial',max:50,required:true},{key:'rif',label:'RIF',max:20,required:true},{key:'address',label:'Domicilio',max:200,required:true,wide:true}])
const contactFields=Object.freeze([{key:'email',label:'Correo institucional',max:100,required:true,type:'email'},{key:'url',label:'Sitio web',max:100},{key:'phone_1',label:'Teléfono principal',max:20,required:true},{key:'phone_2',label:'Teléfono alterno',max:20},{key:'mask_phone',label:'Máscara de teléfono',max:20,required:true}])
const qrFields=Object.freeze([{key:'fn',label:'Nombre de contacto',max:100},{key:'email',label:'Correo de contacto',type:'email',max:100},{key:'phone',label:'Teléfono de contacto',max:20},{key:'bioanalista',label:'Bioanalista responsable',max:100},{key:'codigo',label:'Permiso sanitario',max:50}])
</script>
<style scoped>
.laboratory-general-sections{display:grid;gap:var(--bio-nexus-space-4);min-width:0}.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--bio-nexus-space-3);align-items:start}.qr-fields{padding-top:var(--bio-nexus-space-2)}.qr-note{margin:0 0 var(--bio-nexus-space-3);color:var(--bio-nexus-color-text-muted);font-size:var(--bio-nexus-font-size-sm);line-height:1.45}.section-error{margin:0 0 var(--bio-nexus-space-3);color:var(--bio-nexus-color-danger,#b42318);font-size:var(--bio-nexus-font-size-xs);font-weight:var(--bio-nexus-font-weight-bold)}.toggle{min-height:32px}@media(max-width:720px){.form-grid{grid-template-columns:1fr}}
</style>
