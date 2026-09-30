<template>
  <BioNexusSectionPanel title="Envío por correo" icon="mail" description="Configura el proveedor y las credenciales utilizadas para la entrega electrónica de resultados." variant="accent">
    <template #actions>
      <div class="panel-actions">
        <BioNexusActionButton v-if="dirty" icon="undo" variant="secondary" :disabled="saving || testing" @click="$emit('discard')">Descartar</BioNexusActionButton>
        <BioNexusActionButton v-if="canUpdate" icon="save" variant="primary" :loading="saving" :disabled="disabled || testing || !dirty || hasErrors" @click="$emit('save')">Guardar cambios</BioNexusActionButton>
        <BioNexusActionButton v-if="canUpdate" icon="wifi_tethering" variant="secondary" :loading="testing" :disabled="disabled || saving || testing || hasErrors" @click="$emit('test-connection')">Probar conexión</BioNexusActionButton>
      </div>
    </template>
    <div class="email-grid">
      <BioNexusCheckbox v-model="model.sendEmail.isGmail" class="mode" label="El correo de envío es Gmail" help="Desactiva esta opción para configurar un servidor SMTP propio." :disabled="disabled" />
      <template v-if="!model.sendEmail.isGmail">
        <BioNexusFormField label="Host" field-id="smtp-host" :error="errors.host" :help="String(model.sendEmail.host || '').length + ' de 255 caracteres'"><input v-model.trim="model.sendEmail.host" class="bio-nexus-field" :class="{ 'bio-nexus-field-error': errors.host }" maxlength="255" :disabled="disabled" autocomplete="off"></BioNexusFormField>
        <BioNexusFormField label="Puerto" field-id="smtp-port" :error="errors.port"><input v-model.number="model.sendEmail.port" class="bio-nexus-field" :class="{ 'bio-nexus-field-error': errors.port }" type="number" min="1" max="65535" :disabled="disabled"></BioNexusFormField>
        <BioNexusCheckbox v-model="model.sendEmail.secure" label="Usar SSL" help="Activa una conexión segura con el servidor SMTP." :disabled="disabled" />
      </template>
      <BioNexusFormField label="Usuario" field-id="smtp-user" :error="errors.user" :help="String(model.sendEmail.user || '').length + ' de 254 caracteres'"><input v-model.trim="model.sendEmail.user" class="bio-nexus-field" :class="{ 'bio-nexus-field-error': errors.user }" maxlength="254" autocomplete="off" :disabled="disabled"></BioNexusFormField>
      <BioNexusFormField label="Nueva contraseña" field-id="smtp-pass" :help="'Déjela vacía para conservar la contraseña actual · ' + String(model.sendEmail.pass || '').length + ' de 255 caracteres'" :error="errors.pass"><input v-model="model.sendEmail.pass" class="bio-nexus-field" :class="{ 'bio-nexus-field-error': errors.pass }" type="password" maxlength="255" autocomplete="new-password" :disabled="disabled"></BioNexusFormField>
      <BioNexusFormField label="Remitente (from)" field-id="smtp-from" :error="errors.from" :help="String(model.sendEmail.from || '').length + ' de 254 caracteres'"><input v-model.trim="model.sendEmail.from" class="bio-nexus-field" :class="{ 'bio-nexus-field-error': errors.from }" type="email" maxlength="254" autocomplete="off" :disabled="disabled"></BioNexusFormField>
    </div>
    <p class="bio-nexus-note">La contraseña SMTP nunca se muestra y solo se reemplaza al escribir una nueva. Probar conexión no guarda cambios ni envía correos.</p>
  </BioNexusSectionPanel>
</template>
<script setup>
import { computed } from 'vue'
import BioNexusActionButton from '@/components/ui/BioNexusActionButton.vue'
import BioNexusCheckbox from '@/components/ui/BioNexusCheckbox.vue'
import BioNexusFormField from '@/components/ui/BioNexusFormField.vue'
import BioNexusSectionPanel from '@/components/ui/BioNexusSectionPanel.vue'
const props = defineProps({ model: { type: Object, required: true }, errors: { type: Object, default: () => ({}) }, disabled: { type: Boolean, default: false }, testing: { type: Boolean, default: false }, saving: { type: Boolean, default: false }, dirty: { type: Boolean, default: false }, canUpdate: { type: Boolean, default: false } })
defineEmits(['discard', 'save', 'test-connection'])
const hasErrors = computed(() => Object.keys(props.errors).length > 0)
</script>
<style scoped>
.panel-actions{display:flex;align-items:center;justify-content:flex-end;gap:var(--bio-nexus-space-2);flex-wrap:wrap}.email-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--bio-nexus-space-3);align-items:start}.mode{grid-column:1/-1}.bio-nexus-note{margin:var(--bio-nexus-space-3) 0 0;color:var(--bio-nexus-color-text-muted);font-size:var(--bio-nexus-font-size-sm);line-height:1.45}@media(max-width:900px){.panel-actions{justify-content:flex-start}}@media(max-width:720px){.email-grid{grid-template-columns:1fr}}
</style>
