<template>
  <dialog ref="identityDialog" class="toro-dialog user-identity-dialog" tabindex="-1">
    <form class="dialog-shell" @submit.prevent="submitIdentity">
      <header class="dialog-header">
        <div>
          <p>{{ isCreateMode ? "Nueva identidad" : "Datos administrativos" }}</p>
          <h3>{{ isCreateMode ? "Nuevo usuario" : `Editar ${currentUser?.name || "usuario"}` }}</h3>
        </div>
        <ToroDialogCloseButton @click="closeIdentityDialog" />
      </header>

      <div class="dialog-body identity-dialog-body">
        <div v-if="formError" class="toro-message toro-message-error" role="alert">{{ formError }}</div>
        <div class="identity-form-grid">
          <ToroFormField label="Nombre completo" field-id="identity-name" :error="errors.name" required>
            <input id="identity-name" v-model.trim="form.name" class="toro-field" type="text" maxlength="100" autocomplete="name" />
          </ToroFormField>
          <ToroFormField label="Nombre de usuario" field-id="identity-user-name" :error="errors.userName" required>
            <input id="identity-user-name" v-model.trim="form.userName" class="toro-field" type="text" maxlength="100" autocomplete="username" />
          </ToroFormField>
          <ToroFormField label="Correo" field-id="identity-email" :error="errors.email" required>
            <input id="identity-email" v-model.trim="form.email" class="toro-field" type="email" maxlength="100" autocomplete="email" />
          </ToroFormField>
          <ToroFormField label="Teléfono" field-id="identity-telephone" :error="errors.telephone">
            <input id="identity-telephone" v-model.trim="form.telephone" class="toro-field" type="tel" maxlength="20" autocomplete="tel" placeholder="+58 0000 000 0000" />
          </ToroFormField>
          <ToroFormField label="Cargo" field-id="identity-position" :error="errors.position">
            <input id="identity-position" v-model.trim="form.position" class="toro-field" type="text" maxlength="50" autocomplete="organization-title" />
          </ToroFormField>
          <ToroFormField label="Número de colegiatura" field-id="identity-college" :error="errors.collegeNumber">
            <input id="identity-college" v-model.trim="form.collegeNumber" class="toro-field" type="text" maxlength="50" />
          </ToroFormField>
          <ToroFormField class="identity-address-field" label="Dirección" field-id="identity-direction" :error="errors.direction">
            <textarea id="identity-direction" v-model.trim="form.direction" class="toro-field identity-textarea" maxlength="100" rows="3" autocomplete="street-address"></textarea>
          </ToroFormField>
        </div>

        <section class="identity-password-section">
          <header>
            <div>
              <span>Acceso</span>
              <h4>{{ isCreateMode ? "Contraseña inicial" : "Cambio opcional de contraseña" }}</h4>
            </div>
            <p v-if="!isCreateMode">Deja ambos campos vacios para conservar la contraseña actual.</p>
          </header>
          <div class="identity-form-grid">
            <ToroFormField label="Contraseña" field-id="identity-password" :error="errors.password" :required="isCreateMode">
              <input id="identity-password" v-model="form.password" class="toro-field" type="password" maxlength="500" :autocomplete="isCreateMode ? 'new-password' : 'off'" />
            </ToroFormField>
            <ToroFormField label="Confirmar contraseña" field-id="identity-password-confirm" :error="errors.passwordConfirm" :required="isCreateMode">
              <input id="identity-password-confirm" v-model="form.passwordConfirm" class="toro-field" type="password" maxlength="500" autocomplete="new-password" />
            </ToroFormField>
          </div>
        </section>

        <div class="toro-message toro-message-info" role="status">
          Los roles y permisos no se editan aqui. Despues de guardar, utiliza las acciones Roles y Permisos del grid.
        </div>
      </div>

      <footer class="dialog-footer">
        <button type="button" class="toro-action toro-action-secondary" :disabled="saving" @click="closeIdentityDialog">
  <ToroActionIcon action="cancel" />Cancelar</button>
        <button type="submit" class="toro-action toro-action-primary" :disabled="saving">
          <ToroIcon :name="isCreateMode ? 'person_add' : 'save'" :size="19" />
          {{ saving ? "Guardando..." : isCreateMode ? "Crear usuario" : "Guardar datos" }}
        </button>
      </footer>
    </form>
  </dialog>

  <UserStateDialog ref="stateDialog" :saving="savingState" @confirm="submitStateChange" />
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import ToroFormField from "@/components/ui/ToroFormField.vue";
import ToroIcon from "@/components/ui/ToroIcon.vue";
import { createUser, updateUser } from "@/services/authorizationService";
import ToroDialogCloseButton from "@/components/ui/ToroDialogCloseButton.vue";
import { useToroToast } from "@/composables/useToroToast";
import ToroActionIcon from "@/components/ui/ToroActionIcon.vue";
import UserStateDialog from "@/components/security/UserStateDialog.vue";

const toast = useToroToast();

const emit = defineEmits(["saved"]);
const identityDialog = ref(null);
const stateDialog = ref(null);
const mode = ref("create");
const currentUser = ref(null);
const stateTarget = ref(null);
const saving = ref(false);
const savingState = ref(false);
const formError = ref("");
const stateError = ref("");
const errors = reactive({});
const form = reactive(createEmptyForm());
const isCreateMode = computed(() => mode.value === "create");

function createEmptyForm() {
  return { name: "", userName: "", email: "", telephone: "", direction: "", position: "", collegeNumber: "", password: "", passwordConfirm: "" };
}
function resetErrors() { for (const key of Object.keys(errors)) delete errors[key]; formError.value = ""; }
function assignForm(values) { Object.assign(form, createEmptyForm(), values); }
function show(dialogReference) {
  const dialog = dialogReference.value;
  if (!dialog || dialog.open === true) return;

  dialog.showModal();
  requestAnimationFrame(() => {
    dialog.focus({ preventScroll: true });
  });
}
function close(dialog) { if (dialog.value?.open === true) dialog.value.close(); }

function openCreate() {
  mode.value = "create"; currentUser.value = null; resetErrors(); assignForm({}); show(identityDialog);
}
function openEdit(user) {
  if (!user) return;
  mode.value = "edit"; currentUser.value = user; resetErrors();
  assignForm({ name: user.name || "", userName: user.userName || "", email: user.email || "", telephone: user.telephone || "", direction: user.direction || "", position: user.position || "", collegeNumber: user.collegeNumber || "" });
  show(identityDialog);
}
function openState(user) { if (!user) return; stateTarget.value = user; stateError.value = ""; stateDialog.value?.open(user); }
function closeIdentityDialog() { if (saving.value) return; close(identityDialog); }

function validate() {
  resetErrors();
  if (!form.name) errors.name = "El nombre es obligatorio.";
  if (!form.userName) errors.userName = "El nombre de usuario es obligatorio.";
  if (!form.email) errors.email = "El correo es obligatorio.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "El correo no es valido.";
  if (form.name.length > 100) errors.name = "Maximo 100 caracteres.";
  if (form.userName.length > 100) errors.userName = "Maximo 100 caracteres.";
  if (form.email.length > 100) errors.email = "Maximo 100 caracteres.";
  if (form.telephone.length > 20) errors.telephone = "Maximo 20 caracteres.";
  if (form.direction.length > 100) errors.direction = "Maximo 100 caracteres.";
  if (form.position.length > 50) errors.position = "Maximo 50 caracteres.";
  if (form.collegeNumber.length > 50) errors.collegeNumber = "Maximo 50 caracteres.";
  if (isCreateMode.value && !form.password) errors.password = "La contraseña inicial es obligatoria.";
  if (form.password && form.password.length < 6) errors.password = "Debe tener al menos 6 caracteres.";
  if (form.password !== form.passwordConfirm) errors.passwordConfirm = "Las contraseñas no coinciden.";
  return Object.keys(errors).length === 0;
}
function buildPayload() {
  const payload = { name: form.name, user_name: form.userName, email: form.email, telephone: form.telephone, direction: form.direction || null, position: form.position || null, college_number: form.collegeNumber || null };
  if (form.password) payload.password = form.password;
  if (isCreateMode.value) payload.hide_user = false;
  return payload;
}
function userMessage(error, fallback) {
  const messages = {
    LAST_ACTIVE_ADMIN_REQUIRED: "No es posible inactivar al ultimo administrador visible.",
    USER_PHYSICAL_DELETE_DISABLED: "La eliminacion fisica de usuarios esta deshabilitada.",
    USER_NOT_FOUND: "El usuario ya no existe.",
  };
  const message = typeof error?.message === "string" ? error.message : "";
  if (messages[message]) return messages[message];
  if (message.includes("Ya existe un usuario")) return message;
  return message || fallback;
}
async function submitIdentity() {
  if (!validate() || saving.value) return;
  saving.value = true; formError.value = "";
  try {
    const action = isCreateMode.value ? "created" : "updated";
    const saved = action === "created" ? await createUser(buildPayload()) : await updateUser(currentUser.value.id, buildPayload());
    toast.success(action === "created" ? "Usuario creado correctamente." : "Usuario actualizado correctamente.");
    close(identityDialog); emit("saved", { user: saved, action });
  } catch (error) {
    formError.value = userMessage(error, "No fue posible guardar el usuario.");
    toast.error(formError.value);
  }
  finally { saving.value = false; }
}
async function submitStateChange(user) {
  if (user) stateTarget.value = user;
  if (!stateTarget.value || savingState.value) return;
  savingState.value = true; stateError.value = "";
  try {
    const saved = await updateUser(stateTarget.value.id, { hide_user: !stateTarget.value.hidden });
    const action = saved.hidden ? "deactivated" : "reactivated";
    if (action === "deactivated") {
      toast.warning("Usuario inactivado correctamente.");
    } else {
      toast.info("Usuario reactivado correctamente.");
    }
    stateDialog.value?.close(); emit("saved", { user: saved, action });
  } catch (error) {
    stateError.value = userMessage(error, "No fue posible cambiar el estado del usuario.");
    stateDialog.value?.setError(stateError.value);
    toast.error(stateError.value);
  }
  finally { savingState.value = false; }
}

defineExpose({ openCreate, openEdit, openState });
</script>

<style scoped>
.toro-dialog {
  box-sizing: border-box;
  position: fixed;
  inset: 0;
  width: min(760px, calc(100vw - 32px)) !important;
  min-width: 0 !important;
  max-width: 760px !important;
  height: fit-content !important;
  max-height: calc(100vh - 32px) !important;
  margin: auto !important;
  padding: 0 !important;
  border: 1px solid var(--toro-color-border-strong) !important;
  border-radius: var(--toro-radius-md) !important;
  background: var(--toro-color-surface) !important;
  color: var(--toro-color-text) !important;
  box-shadow: var(--toro-shadow-md) !important;
  overflow: hidden !important;
}
.dialog-shell {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: calc(100vh - 32px);
  overflow: hidden;
}
.identity-password-section { display: grid; gap: var(--toro-space-3); padding: var(--toro-space-3); border: 1px solid var(--toro-color-border); border-radius: var(--toro-radius-md); background: var(--toro-color-surface-soft); }
.identity-password-section header { display: flex; align-items: start; justify-content: space-between; gap: var(--toro-space-3); }
.identity-password-section h4, .identity-password-section p { margin: 0; }
.identity-password-section header span { color: var(--toro-color-text-muted); font-size: var(--toro-font-size-xs); font-weight: var(--toro-font-weight-bold); text-transform: uppercase; }
.identity-password-section header p { color: var(--toro-color-text-muted); font-size: var(--toro-font-size-sm); }
@media (max-width: 720px) { .toro-dialog { width: calc(100vw - 16px); } .identity-form-grid { grid-template-columns: 1fr; } .identity-address-field { grid-column: auto; } .identity-password-section header { flex-direction: column; } }
</style>
