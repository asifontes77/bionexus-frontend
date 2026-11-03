<template>
  <BioNexusDialog ref="dialog" title="Cambiar contraseña temporal" subtitle="Por seguridad, define una contraseña personal antes de continuar." size="sm" :prevent-close="true">
    <div class="required-password-form">
      <BioNexusFormErrors v-if="generalError" :errors="[generalError]" />
      <BioNexusFormField label="Contraseña temporal" field-id="required-current-password" :error="errors.currentPassword || ''" required>
        <input id="required-current-password" ref="currentInput" v-model="form.currentPassword" class="bio-nexus-field" type="password" maxlength="200" autocomplete="current-password" @input="clear('currentPassword')" />
      </BioNexusFormField>
      <BioNexusFormField label="Nueva contraseña" field-id="required-new-password" :error="errors.newPassword || ''" required>
        <input id="required-new-password" v-model="form.newPassword" class="bio-nexus-field" type="password" maxlength="200" autocomplete="new-password" @input="clear('newPassword')" />
      </BioNexusFormField>
      <BioNexusFormField label="Confirmar nueva contraseña" field-id="required-new-password-confirmation" :error="errors.newPasswordConfirmation || ''" required>
        <input id="required-new-password-confirmation" v-model="form.newPasswordConfirmation" class="bio-nexus-field" type="password" maxlength="200" autocomplete="new-password" @input="clear('newPasswordConfirmation')" />
      </BioNexusFormField>
    </div>
    <template #footer><BioNexusActionButton label="Cambiar contraseña y continuar" icon="lock_reset" variant="primary" :loading="saving" :disabled="saving" @click="submit" /></template>
  </BioNexusDialog>
</template>
<script setup>
import { nextTick, reactive, ref, watch } from 'vue'
import BioNexusDialog from '@/components/ui/BioNexusDialog.vue'
import BioNexusFormField from '@/components/ui/BioNexusFormField.vue'
import BioNexusFormErrors from '@/components/ui/BioNexusFormErrors.vue'
import BioNexusActionButton from '@/components/ui/BioNexusActionButton.vue'
import { changeRequiredPassword } from '@/services/authService'
import { useSessionStore } from '@/stores/session'
import { useAuthorizationStore } from '@/stores/authorization'
const session=useSessionStore(),authorization=useAuthorizationStore(),dialog=ref(null),currentInput=ref(null),saving=ref(false),generalError=ref(''),errors=reactive({}),form=reactive({currentPassword:'',newPassword:'',newPasswordConfirmation:''})
function strong(value){return value.length>=12&&/[A-Z]/.test(value)&&/[a-z]/.test(value)&&/[0-9]/.test(value)&&/[^A-Za-z0-9]/.test(value)}
function clear(key){delete errors[key];generalError.value=''}
function validate(){for(const key of Object.keys(errors))delete errors[key];if(!form.currentPassword)errors.currentPassword='Ingrese la contraseña temporal.';if(!form.newPassword)errors.newPassword='Ingrese la nueva contraseña.';else if(!strong(form.newPassword))errors.newPassword='La contraseña debe tener mínimo 12 caracteres, mayúscula, minúscula, número y símbolo.';else if(form.newPassword===form.currentPassword)errors.newPassword='La nueva contraseña debe ser diferente de la temporal.';if(!form.newPasswordConfirmation)errors.newPasswordConfirmation='Confirme la nueva contraseña.';else if(form.newPassword!==form.newPasswordConfirmation)errors.newPasswordConfirmation='Las contraseñas no coinciden.';return Object.keys(errors).length===0}
async function submit(){if(saving.value||!validate())return;saving.value=true;generalError.value='';try{const response=await changeRequiredPassword({...form});session.applyRenewal(response);await authorization.loadContext({force:true});dialog.value?.close();Object.assign(form,{currentPassword:'',newPassword:'',newPasswordConfirmation:''})}catch(error){const code=error?.data?.message||error?.message;const messages={CURRENT_PASSWORD_INVALID:'La contraseña temporal no es correcta.',PASSWORD_REUSE_NOT_ALLOWED:'La nueva contraseña debe ser diferente de la temporal.',PASSWORD_CONFIRMATION_MISMATCH:'Las contraseñas no coinciden.',PASSWORD_POLICY_INVALID:'La nueva contraseña no cumple la política de seguridad.'};generalError.value=messages[code]||'No fue posible cambiar la contraseña.'}finally{saving.value=false}}
watch(()=>session.mustChangePassword,async required=>{if(required){dialog.value?.open();await nextTick();currentInput.value?.focus()}},{immediate:true})
</script>
<style scoped>.required-password-form{display:grid;gap:14px;padding:16px}</style>
