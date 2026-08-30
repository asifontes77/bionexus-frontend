<template>
  <section class="bio-nexus-panel laboratory-panel">
    <div class="bio-nexus-panel-heading"><div><p class="bio-nexus-panel-eyebrow">Datos institucionales</p><h3>Información general</h3></div></div>
    <div class="identity-section"><h4 class="bio-nexus-section-title">Identificación</h4><div class="form-grid">
      <BioNexusFormField v-for="field in identityFields" :key="field.key" :label="field.label" :field-id="'lab-'+field.key" :required="field.required" :wide="field.wide" :error="errors[field.key] || ''">
        <textarea v-if="field.wide" v-model="model[field.key]" class="bio-nexus-field" rows="3" :maxlength="field.max" :disabled="disabled" />
        <input v-else v-model="model[field.key]" class="bio-nexus-field" :type="field.type || 'text'" :maxlength="field.max" :disabled="disabled" />
      </BioNexusFormField>
    </div></div>
    <div class="identity-section"><h4 class="bio-nexus-section-title">Contacto</h4><div class="form-grid">
      <BioNexusFormField v-for="field in contactFields" :key="field.key" :label="field.label" :field-id="'lab-'+field.key" :required="field.required" :error="errors[field.key] || ''">
        <input v-model="model[field.key]" class="bio-nexus-field" :type="field.type || 'text'" :maxlength="field.max" :disabled="disabled" />
      </BioNexusFormField>
    </div></div>
    <div class="bio-nexus-section qr"><div class="bio-nexus-section-heading"><h4 class="bio-nexus-section-title">Código QR de contacto</h4><label class="toggle"><input v-model="model.settingQR.activeQR" type="checkbox" :disabled="disabled"><span>Activar QR</span></label></div>
      <p v-if="errors.settingQR" class="section-error" role="alert">{{ errors.settingQR }}</p>
      <div v-if="model.settingQR.activeQR" class="form-grid qr-fields"><BioNexusFormField v-for="field in qrFields" :key="field.key" :label="field.label" :field-id="'qr-'+field.key" :error="errors['settingQR.'+field.key] || ''"><input v-model="model.settingQR[field.key]" class="bio-nexus-field" :type="field.type || 'text'" :maxlength="field.max" :disabled="disabled"></BioNexusFormField></div>
    </div>
  </section>
</template>
<script setup>
import BioNexusFormField from '@/components/ui/BioNexusFormField.vue'
defineProps({ model: { type: Object, required: true }, errors: { type: Object, default: () => ({}) }, disabled: { type: Boolean, default: false } })
const identityFields=Object.freeze([{key:'business_name',label:'Razón social',max:100,required:true},{key:'name',label:'Nombre comercial',max:50,required:true},{key:'rif',label:'RIF',max:20,required:true},{key:'address',label:'Domicilio',max:200,required:true,wide:true}])
const contactFields=Object.freeze([{key:'email',label:'Correo institucional',max:100,required:true,type:'email'},{key:'url',label:'Sitio web',max:100},{key:'phone_1',label:'Teléfono principal',max:20,required:true},{key:'phone_2',label:'Teléfono alterno',max:20},{key:'mask_phone',label:'Máscara de teléfono',max:20,required:true}])
const qrFields=Object.freeze([{key:'fn',label:'Nombre de contacto',max:100},{key:'email',label:'Correo de contacto',type:'email',max:100},{key:'phone',label:'Teléfono de contacto',max:20},{key:'bioanalista',label:'Bioanalista responsable',max:100},{key:'codigo',label:'Permiso sanitario',max:50}])
</script>
<style scoped>.identity-section+.identity-section,.qr{margin-top:var(--bio-nexus-space-4)}.identity-section>.bio-nexus-section-title{margin-bottom:var(--bio-nexus-space-3)}.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--bio-nexus-space-3)}.qr-fields{padding:var(--bio-nexus-space-4)}.toggle{display:inline-flex;align-items:center;gap:var(--bio-nexus-space-2);color:var(--bio-nexus-color-text-secondary);font-weight:var(--bio-nexus-font-weight-bold)}.section-error{margin:var(--bio-nexus-space-2) var(--bio-nexus-space-4) 0;color:var(--bio-nexus-color-danger,#b42318);font-size:var(--bio-nexus-font-size-xs);font-weight:var(--bio-nexus-font-weight-bold)}@media(max-width:720px){.form-grid{grid-template-columns:1fr}}</style>
