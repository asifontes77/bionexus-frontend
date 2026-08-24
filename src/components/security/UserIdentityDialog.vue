<template>
  <BioNexusDialog
    ref="identityDialog"
    size="wide"
    dialog-class="user-identity-dialog"
    shell-class="user-identity-shell"
    body-class="user-identity-dialog-body"
    :prevent-close="saving"
    :kicker="isCreateMode ? 'Nueva identidad' : 'Datos administrativos'"
    :title="isCreateMode ? 'Nuevo usuario' : `Editar ${currentUser?.name || 'usuario'}`"
    @close="handleIdentityClosed"
  >
    <form id="user-identity-form" class="user-identity-form" @submit.prevent="submitIdentity">
<div v-if="formError" class="bio-nexus-message bio-nexus-message-error" role="alert">{{ formError }}</div>
        <div class="identity-form-grid">
          <BioNexusFormField label="Nombre completo" field-id="identity-name" :error="errors.name" required><input id="identity-name" v-model.trim="form.name" class="bio-nexus-field" maxlength="100" autocomplete="name" /></BioNexusFormField>
          <BioNexusFormField label="Nombre de usuario" field-id="identity-user-name" :error="errors.userName" required><input id="identity-user-name" v-model.trim="form.userName" class="bio-nexus-field" maxlength="100" autocomplete="username" /></BioNexusFormField>
          <BioNexusFormField label="Correo" field-id="identity-email" :error="errors.email" required><input id="identity-email" v-model.trim="form.email" class="bio-nexus-field" type="email" maxlength="100" autocomplete="email" @blur="validateRemoteEmail" /></BioNexusFormField>
          <BioNexusFormField label="Telefono" field-id="identity-telephone" :error="errors.telephone"><input id="identity-telephone" v-model.trim="form.telephone" class="bio-nexus-field" maxlength="20" autocomplete="tel" /></BioNexusFormField>
          <BioNexusFormField label="Cargo" field-id="identity-position" :error="errors.position"><input id="identity-position" v-model.trim="form.position" class="bio-nexus-field" maxlength="50" /></BioNexusFormField>
          <BioNexusFormField label="Numero de colegiatura" field-id="identity-college" :error="errors.collegeNumber"><input id="identity-college" v-model.trim="form.collegeNumber" class="bio-nexus-field" maxlength="50" /></BioNexusFormField>
          <BioNexusFormField class="identity-address-field" label="Direccion" field-id="identity-direction" :error="errors.direction"><textarea id="identity-direction" v-model.trim="form.direction" class="bio-nexus-field identity-textarea" maxlength="100" rows="3"></textarea></BioNexusFormField>
        </div>
        <section class="identity-password-section">
          <header class="identity-section-heading"><div><span>Acceso</span><h4>{{ isCreateMode ? "Contrasena inicial" : "Cambio opcional de contrasena" }}</h4></div><p v-if="!isCreateMode" class="identity-section-help">Deja ambos campos vacios para conservar la contrasena actual.</p></header>
          <div class="identity-form-grid">
            <BioNexusFormField label="Contrasena" field-id="identity-password" :error="errors.password" :required="isCreateMode"><input id="identity-password" v-model="form.password" class="bio-nexus-field" type="password" maxlength="500" /></BioNexusFormField>
            <BioNexusFormField label="Confirmar contrasena" field-id="identity-password-confirm" :error="errors.passwordConfirm" :required="isCreateMode"><input id="identity-password-confirm" v-model="form.passwordConfirm" class="bio-nexus-field" type="password" maxlength="500" /></BioNexusFormField>
          </div>
        </section>
        <section class="identity-media-section">
          <article class="identity-media-card">
            <header><div><span>Perfil</span><h4>Fotografia</h4></div></header>
            <div class="media-preview photo-preview"><img v-if="photoPreview" :src="photoPreview" alt="Vista previa de fotografia" /><BioNexusIcon v-else name="person" :size="44" /></div>
            <input ref="photoInput" class="visually-hidden" type="file" accept="image/png,image/jpeg,image/webp" @change="selectPhoto" />
            <button type="button" class="bio-nexus-action bio-nexus-action-secondary" @click="photoInput?.click()"><BioNexusIcon name="upload" :size="18" />Seleccionar fotografia</button>
          </article>
          <article class="identity-media-card">
            <header><div><span>Validacion profesional</span><h4>Firma digital</h4></div></header>
            <div class="media-preview signature-preview"><img v-if="signaturePreview" :src="signaturePreview" alt="Vista previa de firma" /><BioNexusIcon v-else name="draw" :size="44" /></div>
            <input ref="signatureInput" class="visually-hidden" type="file" accept="image/png,image/jpeg,image/webp" @change="selectSignature" />
            <button type="button" class="bio-nexus-action bio-nexus-action-secondary" @click="signatureInput?.click()"><BioNexusIcon name="upload" :size="18" />Seleccionar firma</button>
          </article>
        </section>
        <section class="identity-password-section">
          <header class="identity-section-heading"><div><span>Firma</span><h4>Cambio opcional de clave de firma</h4></div><p v-if="!isCreateMode" class="identity-section-help">Deja ambos campos vacios para conservar la clave de firma actual.</p></header>
          <div class="identity-form-grid">
            <BioNexusFormField label="Nueva clave de firma" field-id="identity-signature-password" :error="errors.signaturePassword"><input id="identity-signature-password" v-model="form.signaturePassword" class="bio-nexus-field" type="password" maxlength="500" /></BioNexusFormField>
            <BioNexusFormField label="Confirmar nueva clave" field-id="identity-signature-confirm" :error="errors.signaturePasswordConfirm"><input id="identity-signature-confirm" v-model="form.signaturePasswordConfirm" class="bio-nexus-field" type="password" maxlength="500" /></BioNexusFormField>
          </div>
</section>
        <div class="bio-nexus-message bio-nexus-message-info" role="status">Los roles y permisos se administran desde las acciones del grid.</div>
    </form>
    <template #footer>
<button type="button" class="bio-nexus-action bio-nexus-action-secondary" :disabled="saving" @click="closeIdentityDialog"><BioNexusActionIcon action="cancel" />Cancelar</button>
        <button type="submit" form="user-identity-form" class="bio-nexus-action bio-nexus-action-primary" :disabled="saving || validatingEmail"><BioNexusIcon :name="isCreateMode ? 'person_add' : 'save'" :size="19" />{{ saving ? "Guardando..." : isCreateMode ? "Crear usuario" : "Guardar datos" }}</button>
    </template>
  </BioNexusDialog>
  <UserStateDialog ref="stateDialog" :saving="savingState" @confirm="submitStateChange" />
</template>
<script setup>
import { computed, nextTick, reactive, ref } from "vue";
import BioNexusFormField from "@/components/ui/BioNexusFormField.vue";
import BioNexusIcon from "@/components/ui/BioNexusIcon.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import UserStateDialog from "@/components/security/UserStateDialog.vue";
import { createUser, updateUser, uploadUserAsset, verifyUserEmail } from "@/services/authorizationService";
import { useBioNexusToast } from "@/composables/useBioNexusToast";
const toast = useBioNexusToast();
const emit = defineEmits(["saved"]);
const identityDialog = ref(null); const stateDialog = ref(null); const photoInput = ref(null); const signatureInput = ref(null);
const mode = ref("create"); const currentUser = ref(null); const stateTarget = ref(null);
const saving = ref(false); const savingState = ref(false); const validatingEmail = ref(false);
const formError = ref(""); const stateError = ref(""); const errors = reactive({});
const photoFile = ref(null); const signatureFile = ref(null); const photoPreview = ref(""); const signaturePreview = ref("");
const form = reactive(createEmptyForm()); const isCreateMode = computed(() => mode.value === "create");
function createEmptyForm() { return { name: "", userName: "", email: "", telephone: "", direction: "", position: "", collegeNumber: "", password: "", passwordConfirm: "", signaturePassword: "", signaturePasswordConfirm: "" }; }
function resetErrors() { for (const key of Object.keys(errors)) delete errors[key]; formError.value = ""; }
function clearMedia() { photoFile.value = null; signatureFile.value = null; photoPreview.value = ""; signaturePreview.value = ""; }
function assetUrl(value) { return value ? `/api/public/images/${value.split("/").map(encodeURIComponent).join("/")}` : ""; }
function assignForm(values) { Object.assign(form, createEmptyForm(), values); }
function show(dialogReference) { dialogReference.value?.open(); }
function close(dialog) { dialog.value?.close(); }
function openCreate() { mode.value = "create"; currentUser.value = null; resetErrors(); clearMedia(); assignForm({}); show(identityDialog); }
function openEdit(user) { if (!user) return; mode.value = "edit"; currentUser.value = user; resetErrors(); clearMedia(); assignForm({ name: user.name || "", userName: user.userName || "", email: user.email || "", telephone: user.telephone || "", direction: user.direction || "", position: user.position || "", collegeNumber: user.collegeNumber || "" }); photoPreview.value = assetUrl(user.photo); signaturePreview.value = assetUrl(user.signature); show(identityDialog); }
function openState(user) { if (!user) return; stateTarget.value = user; stateError.value = ""; stateDialog.value?.open(user); }
function closeIdentityDialog() { if (!saving.value) close(identityDialog); }
function selectImage(event, targetFile, targetPreview) { const file = event.target.files?.[0] || null; if (!file) return; if (!file.type.startsWith("image/")) { toast.error("El archivo seleccionado no es una imagen valida."); return; } if (file.size > 5 * 1024 * 1024) { toast.error("La imagen no puede superar 5 MB."); return; } targetFile.value = file; targetPreview.value = URL.createObjectURL(file); }
function selectPhoto(event) { selectImage(event, photoFile, photoPreview); }
function selectSignature(event) { selectImage(event, signatureFile, signaturePreview); }
async function validateRemoteEmail() { if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) return false; validatingEmail.value = true; try { const duplicate = await verifyUserEmail(form.email, currentUser.value?.id ?? null); if (duplicate) { errors.email = "Ya existe un usuario con ese correo electronico."; return false; } delete errors.email; return true; } catch (error) { formError.value = error?.message || "No fue posible validar el correo."; return false; } finally { validatingEmail.value = false; } }
function validate() { resetErrors(); if (!form.name) errors.name = "El nombre es obligatorio."; if (!form.userName) errors.userName = "El nombre de usuario es obligatorio."; if (!form.email) errors.email = "El correo es obligatorio."; else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = "El correo no es valido."; if (form.password && form.password.length < 6) errors.password = "Debe tener al menos 6 caracteres."; if (isCreateMode.value && !form.password) errors.password = "La contrasena inicial es obligatoria."; if (form.password !== form.passwordConfirm) errors.passwordConfirm = "Las contrasenas no coinciden."; if (form.signaturePassword && form.signaturePassword.length < 6) errors.signaturePassword = "Debe tener al menos 6 caracteres."; if (form.signaturePassword !== form.signaturePasswordConfirm) errors.signaturePasswordConfirm = "Las claves no coinciden."; return Object.keys(errors).length === 0; }
function buildPayload() { const payload = { name: form.name, user_name: form.userName, email: form.email, telephone: form.telephone, direction: form.direction || null, position: form.position || null, college_number: form.collegeNumber || null }; if (form.password) payload.password = form.password; if (form.signaturePassword) payload.passwordSignature = form.signaturePassword; if (isCreateMode.value) payload.hide_user = false; return payload; }
async function submitIdentity() { if (!validate() || saving.value) return; if (!(await validateRemoteEmail())) return; saving.value = true; formError.value = ""; try { const payload = buildPayload(); if (photoFile.value) payload.url_photo = await uploadUserAsset(photoFile.value, "photos"); if (signatureFile.value) payload.url_signature = await uploadUserAsset(signatureFile.value, "signatures"); const action = isCreateMode.value ? "created" : "updated"; const saved = action === "created" ? await createUser(payload) : await updateUser(currentUser.value.id, payload); close(identityDialog); emit("saved", { user: saved, action }); await nextTick(); toast.success(action === "created" ? "Usuario creado correctamente." : "Usuario actualizado correctamente."); } catch (error) { formError.value = error?.message || "No fue posible guardar el usuario."; toast.error(formError.value); } finally { saving.value = false; } }
async function submitStateChange(user) { if (user) stateTarget.value = user; if (!stateTarget.value || savingState.value) return; savingState.value = true; try { const saved = await updateUser(stateTarget.value.id, { hide_user: !stateTarget.value.hidden }); const action = saved.hidden ? "deactivated" : "reactivated"; toast.info(action === "deactivated" ? "Usuario inactivado correctamente." : "Usuario reactivado correctamente."); stateDialog.value?.close(); emit("saved", { user: saved, action }); } catch (error) { stateDialog.value?.setError(error?.message || "No fue posible cambiar el estado."); toast.error(error?.message || "No fue posible cambiar el estado."); } finally { savingState.value = false; } }
function handleIdentityClosed() { if (!saving.value) resetErrors(); }
defineExpose({ openCreate, openEdit, openState });
</script>
<style scoped>
.identity-password-section, .identity-media-card { display: grid; gap: var(--bio-nexus-space-3); padding: var(--bio-nexus-space-3); border: 1px solid var(--bio-nexus-color-border); border-radius: var(--bio-nexus-radius-md); background: var(--bio-nexus-color-surface-soft); }
.identity-password-section header, .identity-media-card header { display: flex; justify-content: space-between; gap: var(--bio-nexus-space-3); }
.identity-password-section h4, .identity-password-section p, .identity-media-card h4 { margin: 0; }
.identity-password-section header span, .identity-media-card header span { color: var(--bio-nexus-color-text-muted); font-size: var(--bio-nexus-font-size-xs); font-weight: var(--bio-nexus-font-weight-bold); text-transform: uppercase; }
.identity-media-section { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--bio-nexus-space-3); }
.media-preview { display: grid; min-height: 128px; place-items: center; overflow: hidden; border: 1px dashed var(--bio-nexus-color-border-strong); border-radius: var(--bio-nexus-radius-md); background: var(--bio-nexus-color-surface); color: var(--bio-nexus-color-text-muted); }
.media-preview img { display: block; max-width: 100%; max-height: 150px; object-fit: contain; }
.photo-preview img { width: 128px; height: 128px; border-radius: 50%; object-fit: cover; }
.visually-hidden { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
@media (max-width: 720px) { .identity-form-grid, .identity-media-section { grid-template-columns: 1fr; } .identity-address-field { grid-column: auto; } }

.user-identity-form { display: block; min-width: 0; }
.identity-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--bio-nexus-space-3); }
.identity-address-field { grid-column: 1 / -1; }
@media (max-width: 720px) { .identity-form-grid, .identity-media-section { grid-template-columns: 1fr; } .identity-address-field { grid-column: auto; } }

/* BIO NEXUS IDENTITY SECTION HELP START */
.identity-section-heading {
  display: grid !important;
  grid-template-columns: 1fr !important;
  gap: var(--bio-nexus-space-1) !important;
}
.identity-section-help {
  margin: 0 !important;
  max-width: 100%;
  color: var(--bio-nexus-color-text-muted);
  font-size: var(--bio-nexus-font-size-sm);
  line-height: 1.4;
}
/* BIO NEXUS IDENTITY SECTION HELP END */</style>
<style>
dialog.bio-nexus-dialog.user-identity-dialog { width: min(820px, calc(100vw - 32px)) !important; max-width: 820px !important; }
dialog.bio-nexus-dialog.user-identity-dialog > .user-identity-shell { height: min(760px, calc(100dvh - 32px)); max-height: calc(100dvh - 32px); }
dialog.bio-nexus-dialog.user-identity-dialog > .user-identity-shell > .user-identity-dialog-body { flex: 1 1 0; min-height: 0; overflow-x: hidden; overflow-y: auto; }
@media (max-width: 720px) { dialog.bio-nexus-dialog.user-identity-dialog { width: calc(100vw - 16px) !important; max-width: none !important; } }
</style>
