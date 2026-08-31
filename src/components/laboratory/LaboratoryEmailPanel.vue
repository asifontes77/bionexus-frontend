<template>
  <section class="bio-nexus-panel laboratory-panel">
    <div class="bio-nexus-panel-heading">
      <div>
        <p class="bio-nexus-panel-eyebrow">Mensajer&iacute;a</p>
        <h3>Env&iacute;o por correo</h3>
      </div>
      <div class="panel-actions">
        <BioNexusActionButton v-if="dirty" variant="secondary" :disabled="saving || testing" @click="$emit('discard')">Descartar</BioNexusActionButton>
        <BioNexusActionButton v-if="canUpdate" variant="primary" :loading="saving" :disabled="disabled || testing || !dirty || hasErrors" @click="$emit('save')">Guardar cambios</BioNexusActionButton>
        <BioNexusActionButton v-if="canUpdate" variant="secondary" :loading="testing" :disabled="disabled || saving || testing || hasErrors" @click="$emit('test-connection')">Probar conexi&oacute;n</BioNexusActionButton>
      </div>
    </div>
    <div class="email-grid">
      <label class="check mode"><input v-model="model.sendEmail.isGmail" type="checkbox" :disabled="disabled"><span>El correo de env&iacute;o es Gmail</span></label>
      <template v-if="!model.sendEmail.isGmail">
        <BioNexusFormField label="Host" field-id="smtp-host" :error="errors.host"><input v-model.trim="model.sendEmail.host" class="bio-nexus-field" :class="{ 'bio-nexus-field-error': errors.host }" :disabled="disabled" autocomplete="off"></BioNexusFormField>
        <BioNexusFormField label="Puerto" field-id="smtp-port" :error="errors.port"><input v-model.number="model.sendEmail.port" class="bio-nexus-field" :class="{ 'bio-nexus-field-error': errors.port }" type="number" min="1" max="65535" :disabled="disabled"></BioNexusFormField>
        <label class="check"><input v-model="model.sendEmail.secure" type="checkbox" :disabled="disabled"><span>Usar SSL</span></label>
      </template>
      <BioNexusFormField label="Usuario" field-id="smtp-user" :error="errors.user"><input v-model.trim="model.sendEmail.user" class="bio-nexus-field" :class="{ 'bio-nexus-field-error': errors.user }" autocomplete="off" :disabled="disabled"></BioNexusFormField>
      <BioNexusFormField label="Nueva contrase&ntilde;a" field-id="smtp-pass" help="D&eacute;jela vac&iacute;a para conservar la contrase&ntilde;a actual" :error="errors.pass"><input v-model="model.sendEmail.pass" class="bio-nexus-field" :class="{ 'bio-nexus-field-error': errors.pass }" type="password" autocomplete="new-password" :disabled="disabled"></BioNexusFormField>
      <BioNexusFormField label="Remitente (from)" field-id="smtp-from" :error="errors.from"><input v-model.trim="model.sendEmail.from" class="bio-nexus-field" :class="{ 'bio-nexus-field-error': errors.from }" type="email" autocomplete="off" :disabled="disabled"></BioNexusFormField>
    </div>
    <p class="bio-nexus-note">La contrase&ntilde;a SMTP nunca se muestra y solo se reemplaza al escribir una nueva. Probar conexi&oacute;n no guarda cambios ni env&iacute;a correos.</p>
  </section>
</template>
<script setup>
import { computed } from 'vue'
import BioNexusActionButton from '@/components/ui/BioNexusActionButton.vue'
import BioNexusFormField from '@/components/ui/BioNexusFormField.vue'
const props = defineProps({ model: { type: Object, required: true }, errors: { type: Object, default: () => ({}) }, disabled: { type: Boolean, default: false }, testing: { type: Boolean, default: false }, saving: { type: Boolean, default: false }, dirty: { type: Boolean, default: false }, canUpdate: { type: Boolean, default: false } })
defineEmits(['discard', 'save', 'test-connection'])
const hasErrors = computed(() => Object.keys(props.errors).length > 0)
</script>
<style scoped>
.panel-actions{display:flex;align-items:center;justify-content:flex-end;gap:var(--bio-nexus-space-2);flex-wrap:wrap}
.email-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--bio-nexus-space-3)}
.check{display:inline-flex;align-items:center;gap:var(--bio-nexus-space-2);min-height:var(--bio-nexus-control-height);color:var(--bio-nexus-color-text-secondary);font-weight:var(--bio-nexus-font-weight-bold)}
.mode{grid-column:1/-1}
@media(max-width:720px){.email-grid{grid-template-columns:1fr}.bio-nexus-panel-heading{align-items:stretch}.panel-actions{justify-content:flex-start}}
</style>
