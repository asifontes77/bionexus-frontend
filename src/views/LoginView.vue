<template>
  <main class="login-page">
    <section class="login-card" aria-labelledby="login-title">
      <div class="login-brand">
        <img
          class="login-brand-logo"
          :src="bioNexusLogo"
          :alt="BIO_NEXUS_BRAND.logoAlt"
        />
        <p class="login-brand-descriptor">{{ BIO_NEXUS_BRAND.descriptor }}</p>
        <h1 id="login-title">
          {{ licenseRequired ? "Registrar licencia" : "Iniciar sesion" }}
        </h1>
        <p>
          {{
            licenseRequired
              ? "Ingrese la licencia del laboratorio para continuar."
              : "Ingrese sus credenciales para continuar."
          }}
        </p>
      </div>

      <form
        v-if="!licenseRequired"
        class="login-form"
        novalidate
        @submit.prevent="submitLogin"
      >
        <BioNexusFormField label="Nombre de usuario" field-id="username" :error="errors.username" required>
          <input
            id="username"
            ref="usernameInput"
            v-model.trim="username"
            class="bio-nexus-field"
            name="username"
            type="text"
            autocomplete="username"
            maxlength="100"
            :aria-invalid="Boolean(errors.username)"
            :aria-describedby="errors.username ? 'username-error' : undefined"
            :disabled="loading"
            @input="delete errors.username"
            @keydown.space.prevent
          />
        </BioNexusFormField>

        <BioNexusFormField label="Contraseña" field-id="password" :error="errors.password" required>
          <input
            id="password"
            v-model="password"
            class="bio-nexus-field"
            name="password"
            type="password"
            autocomplete="current-password"
            :aria-invalid="Boolean(errors.password)"
            :aria-describedby="errors.password ? 'password-error' : undefined"
            :disabled="loading"
            @input="delete errors.password"
          />
        </BioNexusFormField>

        <p v-if="message" class="login-message" role="alert">
          {{ message }}
        </p>

        <button type="submit" :disabled="loading || !canSubmitLogin">
          {{ loading ? "Iniciando..." : "Iniciar sesion" }}
        </button>
      </form>

      <form v-else class="login-form" novalidate @submit.prevent="submitLicense">
        <label for="license">Licencia</label>
        <input
          id="license"
          v-model.trim="license"
          name="license"
          type="text"
          autocomplete="off"
          required
          :disabled="loading"
        />

        <p v-if="message" class="login-message" role="alert">
          {{ message }}
        </p>

        <p v-if="licenseRegistered" class="login-success" role="status">
          Licencia registrada. Inicie sesion nuevamente.
        </p>

        <button type="submit" :disabled="loading || !canSubmitLicense">
          {{ loading ? "Registrando..." : "Registrar licencia" }}
        </button>

        <button
          type="button"
          class="secondary-button"
          :disabled="loading"
          @click="returnToLogin"
        >
          Volver al inicio de sesion
        </button>
      </form>
    </section>
  </main>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from "vue";
import BioNexusFormField from "@/components/ui/BioNexusFormField.vue";
import bioNexusLogo from "@/assets/bionexus_logo.png";
import { BIO_NEXUS_BRAND } from "@/config/brand";
import { useRoute, useRouter } from "vue-router";
import { ApiError } from "@/api/apiClient";
import { loginUser } from "@/services/authService";
import { updateLaboratoryLicense } from "@/services/laboratoryService";
import { useAuthorizationStore } from "@/stores/authorization";
import { useSessionStore } from "@/stores/session";

const route = useRoute();
const router = useRouter();
const sessionStore = useSessionStore();
const authorizationStore = useAuthorizationStore();

const username = ref("");
const password = ref("");
const license = ref("");
const loading = ref(false);
const message = ref("");
const errors = reactive({});
const usernameInput = ref(null);
const licenseRequired = ref(false);
const licenseRegistered = ref(false);

const canSubmitLogin = computed(
  () => username.value !== "" && password.value !== ""
);

const canSubmitLicense = computed(() => license.value !== "");

function validateLogin() {
  delete errors.username; delete errors.password;
  if (!username.value) errors.username = "El nombre de usuario es obligatorio.";
  if (!password.value) errors.password = "La contraseña es obligatoria.";
  return !errors.username && !errors.password;
}

async function submitLogin() {
  if (loading.value || !validateLogin()) return;

  loading.value = true;
  message.value = "";
  licenseRegistered.value = false;

  try {
    const response = await loginUser(
      username.value.toLowerCase(),
      password.value
    );

    if (response?.response === "INVALID_LICENSE_KEY") {
      licenseRequired.value = true;
      password.value = "";
      message.value = "La licencia del sistema no es valida.";
      return;
    }

    sessionStore.start(response);
    authorizationStore.clear();
    await authorizationStore.loadContext({
      force: true
    });

    const requestedRedirect = typeof route.query.redirect === "string" ? route.query.redirect : "/";
    const redirect = requestedRedirect.startsWith("/") && !requestedRedirect.startsWith("//") ? requestedRedirect : "/";

    await router.replace(redirect);
  } catch (error) {
    password.value = "";
    authorizationStore.clear();
    sessionStore.clear();

    if (
      error instanceof ApiError &&
      error.status === 403 &&
      error.data?.message === "INVALID_LICENSE_KEY"
    ) {
      licenseRequired.value = true;
      password.value = "";
      message.value = "La licencia del sistema no es valida.";
    } else if (
      error instanceof ApiError &&
      (error.status === 401 || error.status === 404)
    ) {
      message.value = "Nombre de usuario o contraseña incorrectos.";
    } else if (
      error instanceof ApiError &&
      error.status === 408
    ) {
      message.value = "El Backend no respondio a tiempo. Reinicie Bio Nexus y vuelva a intentar.";
    } else {
      message.value = "No fue posible iniciar sesion.";
    }
  } finally {
    loading.value = false;
  }
}

async function submitLicense() {
  if (!canSubmitLicense.value || loading.value) return;

  loading.value = true;
  message.value = "";
  licenseRegistered.value = false;

  try {
    await updateLaboratoryLicense(license.value);
    license.value = "";
    licenseRegistered.value = true;
  } catch {
    message.value = "No fue posible registrar la licencia.";
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  if (route.query.reason === "session-expired") {
    message.value = "La sesión finalizó por inactividad. Ingresa nuevamente para continuar.";
    const query = { ...route.query };
    delete query.reason;
    await router.replace({ name: "login", query });
  }
  await nextTick();
  usernameInput.value?.focus();
});

function returnToLogin() {
  licenseRequired.value = false;
  licenseRegistered.value = false;
  license.value = "";
  message.value = "";
}
</script>
