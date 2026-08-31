<template>
  <section class="bio-nexus-panel laboratory-panel">
    <div class="bio-nexus-panel-heading">
      <div><p class="bio-nexus-panel-eyebrow">MensajerÃ­a</p><h3>EnvÃ­o por correo</h3></div>
      <BioNexusActionButton v-if="canTest" variant="secondary" :loading="testing" :disabled="disabled || testing || hasErrors" @click="$emit('test-connection')">Probar conexiÃ³n</BioNexusActionButton>
    </div>
    <div class="email-grid">
      <label class="check mode"><input v-model="model.sendEmail.isGmail" type="checkbox" :disabled="disabled"><span>El correo de envÃ­o es Gmail</span></label>
      <template v-if="!model.sendEmail.isGmail">
        <BioNexusFormField label="Host" field-id="smtp-host" :error="errors.host"><input v-model.trim="model.sendEmail.host" class="bio-nexus-field" :class="{ 'bio-nexus-field-error': errors.host }" :disabled="disabled" autocomplete="off"></BioNexusFormField>
        <BioNexusFormField label="Puerto" field-id="smtp-port" :error="errors.port"><input v-model.number="model.sendEmail.port" class="bio-nexus-field" :class="{ 'bio-nexus-field-error': errors.port }" type="number" min="1" max="65535" :disabled="disabled"></BioNexusFormField>
        <label class="check"><input v-model="model.sendEmail.secure" type="checkbox" :disabled="disabled"><span>Usar SSL</span></label>
      </template>
      <BioNexusFormField label="Usuario" field-id="smtp-user" :error="errors.user"><input v-model.trim="model.sendEmail.user" class="bio-nexus-field" :class="{ 'bio-nexus-field-error': errors.user }" autocomplete="off" :disabled="disabled"></BioNexusFormField>
      <BioNexusFormField label="Nueva contraseÃ±a" field-id="smtp-pass" help="DÃ©jela vacÃ­a para conservar la contraseÃ±a actual" :error="errors.pass"><input v-model="model.sendEmail.pass" class="bio-nexus-field" :class="{ 'bio-nexus-field-error': errors.pass }" type="password" autocomplete="new-password" :disabled="disabled"></BioNexusFormField>
      <BioNexusFormField label="Remitente (from)" field-id="smtp-from" :error="errors.from"><input v-model.trim="model.sendEmail.from" class="bio-nexus-field" :class="{ 'bio-nexus-field-error': errors.from }" type="email" autocomplete="off" :disabled="disabled"></BioNexusFormField>
    </div>
    <p class="bio-nexus-note">La contraseÃ±a SMTP nunca se muestra y solo se reemplaza al escribir una nueva. Probar conexiÃ³n no guarda cambios ni envÃ­a correos.</p>
  </section>
</template>
<script setup>
import { computed } from 'vue'
import BioNexusActionButton from '@/components/ui/BioNexusActionButton.vue'
import BioNexusFormField from '@/components/ui/BioNexusFormField.vue'
const props = defineProps({ model: { type: Object, required: true }, errors: { type: Object, default: () => ({}) }, disabled: { type: Boolean, default: false }, testing: { type: Boolean, default: false }, canTest: { type: Boolean, default: false } })
defineEmits(['test-connection'])
const hasErrors = computed(() => Object.keys(props.errors).length > 0)
</script>
<style scoped>
.email-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--bio-nexus-space-3)}
.check{display:inline-flex;align-items:center;gap:var(--bio-nexus-space-2);min-height:var(--bio-nexus-control-height);color:var(--bio-nexus-color-text-secondary);font-weight:var(--bio-nexus-font-weight-bold)}
.mode{grid-column:1/-1}
@media(max-width:720px){.email-grid{grid-template-columns:1fr}}
</style>
