<template>
  <main class="login-page">
    <section class="login-card" aria-labelledby="login-title">
      <div class="login-brand">
        <p class="migration-eyebrow">TORO</p>
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
        @submit.prevent="submitLogin"
      >
        <label for="username">Nombre de usuario</label>
        <input
          id="username"
          v-model.trim="username"
          name="username"
          type="text"
          autocomplete="username"
          required
          :disabled="loading"
          @keydown.space.prevent
        />

        <label for="password">Contraseña</label>
        <input
          id="password"
          v-model="password"
          name="password"
          type="password"
          autocomplete="current-password"
          required
          :disabled="loading"
        />

        <p v-if="message" class="login-message" role="alert">
          {{ message }}
        </p>

        <button type="submit" :disabled="loading || !canSubmitLogin">
          {{ loading ? "Iniciando..." : "Iniciar sesion" }}
        </button>
      </form>

      <form v-else class="login-form" @submit.prevent="submitLicense">
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
import { computed, ref } from "vue";
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
const licenseRequired = ref(false);
const licenseRegistered = ref(false);

const canSubmitLogin = computed(
  () => username.value !== "" && password.value !== ""
);

const canSubmitLicense = computed(() => license.value !== "");

async function submitLogin() {
  if (!canSubmitLogin.value || loading.value) return;

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

    const redirect =
      typeof route.query.redirect === "string" ? route.query.redirect : "/";

    await router.replace(redirect);
  } catch (error) {
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

function returnToLogin() {
  licenseRequired.value = false;
  licenseRegistered.value = false;
  license.value = "";
  message.value = "";
}
</script>
