<template>
  <section class="security-page" aria-labelledby="security-title">
    <header class="security-header">
      <div>
        <p class="security-eyebrow">AdministraciÃ³n de seguridad</p>
        <h2 id="security-title">Roles y permisos</h2>
        <p>
          Consulta los roles configurados y el catÃ¡logo de permisos
          administrado por el backend.
        </p>
      </div>

      <div class="security-header-actions">
        <button
          v-if="canCreateRoles"
          type="button"
          class="security-header-create"
          :disabled="creatingRole || loading"
          @click="resetCreateRoleForm"
        >
          Nuevo rol
        </button>

        <button
          type="button"
          :disabled="loading || creatingRole || editingRole"
          @click="loadCatalogs"
        >
          {{ loading ? "Actualizando..." : "Actualizar" }}
        </button>
      </div>
    </header>

    <article v-if="canCreateRoles" class="role-form-panel">
      <div class="security-panel-heading">
        <div>
          <p>Nuevo registro</p>
          <h3>Crear rol configurable</h3>
        </div>

        <span>security.roles.create</span>
      </div>

      <form class="role-form" @submit.prevent="createRole">
        <label>
          <span>CÃ³digo</span>
          <input
            v-model.trim="createRoleForm.code"
            type="text"
            maxlength="60"
            autocomplete="off"
            placeholder="Ejemplo: supervisor"
            :disabled="creatingRole"
            required
          />

          <small>
            Debe comenzar con una letra. Puede contener letras minÃºsculas,
            nÃºmeros, puntos, guiones y guiones bajos.
          </small>
        </label>

        <label>
          <span>Nombre</span>
          <input
            v-model.trim="createRoleForm.name"
            type="text"
            maxlength="100"
            autocomplete="off"
            placeholder="Nombre visible del rol"
            :disabled="creatingRole"
            required
          />
        </label>

        <label class="role-form-wide">
          <span>DescripciÃ³n</span>
          <textarea
            v-model="createRoleForm.description"
            maxlength="250"
            rows="3"
            placeholder="DescripciÃ³n opcional"
            :disabled="creatingRole"
          ></textarea>

          <small>
            {{ createRoleForm.description.length }} de 250 caracteres
          </small>
        </label>

        <div
          v-if="createRoleError"
          class="role-form-message role-form-message-error role-form-wide"
          role="alert"
        >
          {{ createRoleError }}
        </div>

        <div
          v-if="createRoleMessage"
          class="role-form-message role-form-message-success role-form-wide"
          role="status"
        >
          {{ createRoleMessage }}
        </div>

        <div class="role-form-actions role-form-wide">
          <button
            type="button"
            class="permission-action permission-action-secondary"
            :disabled="creatingRole"
            @click="resetCreateRoleForm"
          >
            Limpiar
          </button>

          <button
            type="submit"
            class="permission-action permission-action-primary"
            :disabled="!canSubmitCreateRole"
          >
            {{ creatingRole ? "Creando..." : "Crear rol" }}
          </button>
        </div>
      </form>
    </article>

    <div v-if="errorMessage" class="security-message security-message-error" role="alert">
      <strong>No fue posible cargar la informaciÃ³n.</strong>
      <span>{{ errorMessage }}</span>
    </div>

    <div v-if="loading && !loaded" class="security-message" role="status">
      Cargando roles y permisos...
    </div>

    <template v-else>
      <div class="security-metrics">
        <article>
          <span>Roles</span>
          <strong>{{ roles.length }}</strong>
          <small>{{ activeRolesCount }} activos</small>
        </article>

        <article>
          <span>Permisos</span>
          <strong>{{ permissions.length }}</strong>
          <small>{{ activePermissionsCount }} activos</small>
        </article>

        <article>
          <span>MÃ³dulos</span>
          <strong>{{ permissionModules.length }}</strong>
          <small>Ãreas con permisos</small>
        </article>

        <article>
          <span>Rol seleccionado</span>
          <strong>{{ selectedRole?.code || "Ninguno" }}</strong>
          <small>{{ selectedRole?.name || "Seleccione un rol" }}</small>
        </article>
      </div>

      <div class="security-grid">
        <article class="security-panel">
          <div class="security-panel-heading">
            <div>
              <p>CatÃ¡logo</p>
              <h3>Roles</h3>
            </div>

            <span>{{ roles.length }}</span>
          </div>

          <div v-if="roles.length === 0" class="security-empty">
            No existen roles disponibles.
          </div>

          <div v-else class="role-list">
            <button
              v-for="role in roles"
              :key="role.id"
              type="button"
              class="role-item"
              :class="{ 'role-item-selected': selectedRole?.id === role.id }"
              :disabled="savingPermissions || creatingRole || editingRole"
              @click="selectRole(role)"
            >
              <span class="role-code">{{ role.code }}</span>

              <span class="role-content">
                <strong>{{ role.name }}</strong>
                <small>{{ role.description || "Sin descripciÃ³n" }}</small>
              </span>

              <span
                class="status-badge"
                :class="{ 'status-badge-inactive': !role.isActive }"
              >
                {{ role.isActive ? "Activo" : "Inactivo" }}
              </span>
            </button>
          </div>
        </article>

        <article class="security-panel">
          <div class="security-panel-heading">
            <div>
              <p>Detalle</p>
              <h3>Rol seleccionado</h3>
            </div>
          </div>

          <div v-if="!selectedRole" class="security-empty">
            Seleccione un rol para consultar sus datos.
          </div>

          <template v-else>
            <form
              v-if="canUpdateRoles"
              class="role-metadata-form"
              @submit.prevent="updateRole"
            >
              <div class="role-detail">
                <div>
                  <dt>Identificador</dt>
                  <dd>{{ selectedRole.id }}</dd>
                </div>

                <div>
                  <dt>CÃ³digo inmutable</dt>
                  <dd>{{ selectedRole.code }}</dd>
                </div>

                <div>
                  <dt>Tipo</dt>
                  <dd>
                    {{ selectedRole.isSystem ? "Sistema" : "Configurable" }}
                  </dd>
                </div>

                <div>
                  <dt>Estado actual</dt>
                  <dd>
                    {{ selectedRole.isActive ? "Activo" : "Inactivo" }}
                  </dd>
                </div>
              </div>

              <label>
                <span>Nombre</span>
                <input
                  v-model="updateRoleForm.name"
                  type="text"
                  maxlength="100"
                  autocomplete="off"
                  :disabled="editingRole"
                  required
                />
              </label>

              <label>
                <span>DescripciÃ³n</span>
                <textarea
                  v-model="updateRoleForm.description"
                  maxlength="250"
                  rows="3"
                  :disabled="editingRole"
                ></textarea>

                <small>
                  {{ updateRoleForm.description.length }} de 250 caracteres
                </small>
              </label>

              <label
                class="role-active-option"
                :class="{
                  'role-active-option-disabled':
                    selectedRole.code === 'admin',
                }"
              >
                <input
                  v-model="updateRoleForm.isActive"
                  type="checkbox"
                  :disabled="
                    editingRole ||
                    selectedRole.code === 'admin'
                  "
                />

                <span>
                  <strong>Rol activo</strong>
                  <small>
                    {{
                      selectedRole.code === "admin"
                        ? "El rol administrador debe permanecer activo."
                        : "Los roles inactivos no pueden asignarse a nuevos usuarios."
                    }}
                  </small>
                </span>
              </label>

              <div
                v-if="updateRoleError"
                class="role-form-message role-form-message-error"
                role="alert"
              >
                {{ updateRoleError }}
              </div>

              <div
                v-if="updateRoleMessage"
                class="role-form-message role-form-message-success"
                role="status"
              >
                {{ updateRoleMessage }}
              </div>

              <div class="role-form-actions">
                <button
                  type="button"
                  class="permission-action permission-action-secondary"
                  :disabled="
                    !hasRoleMetadataChanges ||
                    editingRole
                  "
                  @click="discardRoleMetadataChanges"
                >
                  Descartar
                </button>

                <button
                  type="submit"
                  class="permission-action permission-action-primary"
                  :disabled="!canSubmitRoleUpdate"
                >
                  {{ editingRole ? "Guardando..." : "Guardar datos" }}
                </button>
              </div>
            </form>

            <dl v-else class="role-detail">
              <div>
                <dt>Identificador</dt>
                <dd>{{ selectedRole.id }}</dd>
              </div>

              <div>
                <dt>CÃ³digo</dt>
                <dd>{{ selectedRole.code }}</dd>
              </div>

              <div>
                <dt>Nombre</dt>
                <dd>{{ selectedRole.name }}</dd>
              </div>

              <div>
                <dt>DescripciÃ³n</dt>
                <dd>{{ selectedRole.description || "Sin descripciÃ³n" }}</dd>
              </div>

              <div>
                <dt>Tipo</dt>
                <dd>{{ selectedRole.isSystem ? "Sistema" : "Configurable" }}</dd>
              </div>

              <div>
                <dt>Estado</dt>
                <dd>{{ selectedRole.isActive ? "Activo" : "Inactivo" }}</dd>
              </div>
            </dl>
          </template>

          <section v-if="selectedRole" class="assigned-permissions">
            <header>
              <div>
                <p>Asignaciones actuales</p>
                <h4>Permisos del rol</h4>
              </div>

              <span>{{ assignedPermissions.length }}</span>
            </header>

            <div
              v-if="assignedPermissionsLoading"
              class="assigned-permissions-status"
              role="status"
            >
              Consultando permisos asignados...
            </div>

            <div
              v-else-if="assignedPermissionsError"
              class="assigned-permissions-status assigned-permissions-error"
              role="alert"
            >
              {{ assignedPermissionsError }}
            </div>

            <template v-else>
              <div
                v-if="selectedRole.code === 'admin'"
                class="assigned-permissions-warning"
              >
                El rol administrador debe conservar los permisos esenciales
                definidos por el backend.
              </div>

              <div
                v-if="inactiveAssignedPermissions.length > 0"
                class="assigned-permissions-warning"
              >
                Este rol conserva permisos inactivos para fines de consulta.
                Los permisos inactivos no pueden seleccionarse nuevamente y
                serÃ¡n retirados en el prÃ³ximo guardado.
              </div>

              <div
                v-if="!canAssignPermissions"
                class="assigned-permissions-status"
              >
                La cuenta actual puede consultar las asignaciones, pero no
                modificarlas.
              </div>

              <div v-if="permissions.length === 0" class="assigned-permissions-status">
                No existen permisos disponibles.
              </div>

              <div v-else class="permission-editor">
                <section
                  v-for="module in permissionModules"
                  :key="module.name"
                  class="permission-editor-module"
                >
                  <header>
                    <h5>{{ module.name }}</h5>
                    <span>{{ module.permissions.length }}</span>
                  </header>

                  <label
                    v-for="permission in module.permissions"
                    :key="permission.id"
                    class="permission-option"
                    :class="{
                      'permission-option-selected':
                        isPermissionSelected(permission.id),
                      'permission-option-disabled':
                        !permission.isActive ||
                        !canAssignPermissions,
                    }"
                  >
                    <input
                      type="checkbox"
                      :checked="isPermissionSelected(permission.id)"
                      :disabled="
                        !permission.isActive ||
                        !canAssignPermissions ||
                        savingPermissions
                      "
                      @change="togglePermission(permission)"
                    />

                    <span class="permission-option-copy">
                      <strong>{{ permission.code }}</strong>
                      <small>{{ permission.name }}</small>
                    </span>

                    <span
                      class="status-badge"
                      :class="{
                        'status-badge-inactive': !permission.isActive,
                      }"
                    >
                      {{ permission.isActive ? "Activo" : "Inactivo" }}
                    </span>
                  </label>
                </section>
              </div>

              <div
                v-if="savePermissionsError"
                class="assigned-permissions-status assigned-permissions-error"
                role="alert"
              >
                {{ savePermissionsError }}
              </div>

              <div
                v-if="savePermissionsMessage"
                class="assigned-permissions-status assigned-permissions-success"
                role="status"
              >
                {{ savePermissionsMessage }}
              </div>

              <div
                v-if="canAssignPermissions"
                class="permission-editor-actions"
              >
                <span>
                  {{
                    hasPermissionChanges
                      ? "Existen cambios pendientes."
                      : "Las asignaciones estÃ¡n sincronizadas."
                  }}
                </span>

                <div>
                  <button
                    type="button"
                    class="permission-action permission-action-secondary"
                    :disabled="
                      !hasPermissionChanges ||
                      savingPermissions
                    "
                    @click="discardPermissionChanges"
                  >
                    Descartar
                  </button>

                  <button
                    type="button"
                    class="permission-action permission-action-primary"
                    :disabled="
                      !hasPermissionChanges ||
                      savingPermissions
                    "
                    @click="savePermissionChanges"
                  >
                    {{ savingPermissions ? "Guardando..." : "Guardar" }}
                  </button>
                </div>
              </div>
            </template>
          </section>

          <p class="security-note">
            La creaciÃ³n, ediciÃ³n y asignaciÃ³n de permisos se habilitan de forma
            independiente segÃºn los permisos efectivos de la cuenta actual.
          </p>
        </article>
      </div>

      <article class="security-panel">
        <div class="security-panel-heading">
          <div>
            <p>CatÃ¡logo global</p>
            <h3>Permisos</h3>
          </div>

          <span>{{ permissions.length }}</span>
        </div>

        <div v-if="permissions.length === 0" class="security-empty">
          No existen permisos disponibles.
        </div>

        <div v-else class="permission-modules">
          <section v-for="module in permissionModules" :key="module.name">
            <header>
              <h4>{{ module.name }}</h4>
              <span>{{ module.permissions.length }}</span>
            </header>

            <div class="permission-list">
              <article
                v-for="permission in module.permissions"
                :key="permission.id"
                class="permission-item"
              >
                <div>
                  <strong>{{ permission.code }}</strong>
                  <span>{{ permission.name }}</span>
                </div>

                <span
                  class="status-badge"
                  :class="{ 'status-badge-inactive': !permission.isActive }"
                >
                  {{ permission.isActive ? "Activo" : "Inactivo" }}
                </span>
              </article>
            </div>
          </section>
        </div>
      </article>
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import {
  createAuthorizationRole,
  getAuthorizationPermissions,
  getAuthorizationRoles,
  getRolePermissions,
  replaceRolePermissions,
  updateAuthorizationRole,
} from "@/services/authorizationService";

import { useAuthorizationStore } from "@/stores/authorization";

const authorizationStore = useAuthorizationStore();
const roles = ref([]);
const permissions = ref([]);
const selectedRole = ref(null);
const assignedPermissions = ref([]);
const assignedPermissionsLoading = ref(false);
const assignedPermissionsError = ref("");
let assignedPermissionsRequestId = 0;
const savedPermissionIds = ref([]);
const draftPermissionIds = ref([]);
const savingPermissions = ref(false);
const savePermissionsError = ref("");
const savePermissionsMessage = ref("");
const loading = ref(false);
const loaded = ref(false);
const errorMessage = ref("");
const creatingRole = ref(false);
const createRoleError = ref("");
const createRoleMessage = ref("");
const createRoleForm = ref({
  code: "",
  name: "",
  description: "",
});

const editingRole = ref(false);
const updateRoleError = ref("");
const updateRoleMessage = ref("");
const updateRoleForm = ref({
  name: "",
  description: "",
  isActive: true,
});

const activeRolesCount = computed(
  () => roles.value.filter((role) => role.isActive).length,
);

const activePermissionsCount = computed(
  () => permissions.value.filter((permission) => permission.isActive).length,
);

const canAssignPermissions = computed(() =>
  authorizationStore.hasPermission(
    "security.roles.assign-permissions",
  ),
);

const canCreateRoles = computed(() =>
  authorizationStore.hasPermission(
    "security.roles.create",
  ),
);

const canUpdateRoles = computed(() =>
  authorizationStore.hasPermission(
    "security.roles.update",
  ),
);

const hasPermissionChanges = computed(
  () =>
    normalizePermissionIds(draftPermissionIds.value).join(",") !==
    normalizePermissionIds(savedPermissionIds.value).join(","),
);

const inactiveAssignedPermissions = computed(() =>
  assignedPermissions.value.filter(
    (permission) => !permission.isActive,
  ),
);

const canSubmitCreateRole = computed(
  () =>
    canCreateRoles.value &&
    !creatingRole.value &&
    createRoleForm.value.code.trim() !== "" &&
    createRoleForm.value.name.trim() !== "",
);

const hasRoleMetadataChanges = computed(() => {
  const role = selectedRole.value;

  if (!role) {
    return false;
  }

  return (
    updateRoleForm.value.name.trim() !== role.name ||
    normalizeOptionalText(
      updateRoleForm.value.description,
    ) !== normalizeOptionalText(role.description) ||
    updateRoleForm.value.isActive !== role.isActive
  );
});

const canSubmitRoleUpdate = computed(
  () =>
    canUpdateRoles.value &&
    selectedRole.value !== null &&
    !editingRole.value &&
    updateRoleForm.value.name.trim() !== "" &&
    hasRoleMetadataChanges.value,
);

const permissionModules = computed(() => {
  const modules = new Map();

  for (const permission of permissions.value) {
    const moduleName = permission.module || "general";

    if (!modules.has(moduleName)) {
      modules.set(moduleName, []);
    }

    modules.get(moduleName).push(permission);
  }

  return Array.from(modules.entries())
    .map(([name, modulePermissions]) => ({
      name,
      permissions: modulePermissions,
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
});

function normalizeOptionalText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function getRoleErrorMessage(error, fallbackMessage) {
  const backendMessage =
    typeof error?.message === "string"
      ? error.message
      : "";

  const messages = {
    ROLE_CODE_ALREADY_EXISTS:
      "Ya existe un rol con el cÃ³digo indicado.",
    ROLE_CODE_REQUIRED:
      "El cÃ³digo del rol es obligatorio.",
    ROLE_CODE_INVALID:
      "El cÃ³digo debe comenzar con una letra y solo puede contener letras minÃºsculas, nÃºmeros, puntos, guiones y guiones bajos.",
    ROLE_CODE_TOO_LONG:
      "El cÃ³digo no puede superar los 60 caracteres.",
    ROLE_NAME_REQUIRED:
      "El nombre del rol es obligatorio.",
    ROLE_NAME_TOO_LONG:
      "El nombre no puede superar los 100 caracteres.",
    ROLE_DESCRIPTION_TOO_LONG:
      "La descripciÃ³n no puede superar los 250 caracteres.",
    ROLE_ACTIVE_STATE_INVALID:
      "El estado activo del rol no es vÃ¡lido.",
    ROLE_NOT_FOUND:
      "El rol seleccionado ya no existe.",
    ROLE_CODE_IMMUTABLE:
      "El cÃ³digo del rol no puede modificarse.",
    ROLE_SYSTEM_FLAG_IMMUTABLE:
      "La condiciÃ³n de rol de sistema no puede modificarse.",
    ADMIN_ROLE_MUST_REMAIN_ACTIVE:
      "El rol administrador debe permanecer activo.",
  };

  return (
    messages[backendMessage] ||
    backendMessage ||
    fallbackMessage
  );
}

function resetCreateRoleForm() {
  createRoleForm.value = {
    code: "",
    name: "",
    description: "",
  };

  createRoleError.value = "";
  createRoleMessage.value = "";
}

function synchronizeUpdateRoleForm() {
  const role = selectedRole.value;

  updateRoleForm.value = {
    name: role?.name ?? "",
    description: role?.description ?? "",
    isActive: role?.isActive === true,
  };

  updateRoleError.value = "";
  updateRoleMessage.value = "";
}

function discardRoleMetadataChanges() {
  synchronizeUpdateRoleForm();
}

function normalizePermissionIds(permissionIds) {
  return Array.from(
    new Set(
      permissionIds.filter(
        (permissionId) =>
          Number.isInteger(permissionId) &&
          permissionId > 0,
      ),
    ),
  ).sort((left, right) => left - right);
}

function isPermissionSelected(permissionId) {
  return draftPermissionIds.value.includes(permissionId);
}

function togglePermission(permission) {
  if (
    !canAssignPermissions.value ||
    !permission.isActive ||
    savingPermissions.value
  ) {
    return;
  }

  savePermissionsError.value = "";
  savePermissionsMessage.value = "";

  if (isPermissionSelected(permission.id)) {
    draftPermissionIds.value =
      draftPermissionIds.value.filter(
        (permissionId) => permissionId !== permission.id,
      );

    return;
  }

  draftPermissionIds.value = normalizePermissionIds([
    ...draftPermissionIds.value,
    permission.id,
  ]);
}

function discardPermissionChanges() {
  draftPermissionIds.value = [
    ...savedPermissionIds.value,
  ];

  savePermissionsError.value = "";
  savePermissionsMessage.value = "";
}

async function selectRole(role) {
  if (
    selectedRole.value?.id === role.id ||
    savingPermissions.value ||
    editingRole.value
  ) {
    return;
  }

  selectedRole.value = role;
  savePermissionsError.value = "";
  savePermissionsMessage.value = "";
  synchronizeUpdateRoleForm();
  await loadAssignedPermissions();
}

async function loadAssignedPermissions() {
  const role = selectedRole.value;
  const requestId = ++assignedPermissionsRequestId;

  assignedPermissions.value = [];
  assignedPermissionsError.value = "";
  savedPermissionIds.value = [];
  draftPermissionIds.value = [];
  savePermissionsError.value = "";
  savePermissionsMessage.value = "";

  if (!role) {
    assignedPermissionsLoading.value = false;
    return;
  }

  assignedPermissionsLoading.value = true;

  try {
    const loadedPermissions = await getRolePermissions(role.id);

    if (
      requestId !== assignedPermissionsRequestId ||
      selectedRole.value?.id !== role.id
    ) {
      return;
    }

    assignedPermissions.value = loadedPermissions;
    savedPermissionIds.value = normalizePermissionIds(
      loadedPermissions
        .filter((permission) => permission.isActive)
        .map((permission) => permission.id),
    );

    draftPermissionIds.value = [
      ...savedPermissionIds.value,
    ];

  } catch (error) {
    if (
      requestId !== assignedPermissionsRequestId ||
      selectedRole.value?.id !== role.id
    ) {
      return;
    }

    assignedPermissionsError.value =
      typeof error?.message === "string"
        ? error.message
        : "No fue posible consultar los permisos asignados.";
  } finally {
    if (requestId === assignedPermissionsRequestId) {
      assignedPermissionsLoading.value = false;
    }
  }
}

async function savePermissionChanges() {
  const role = selectedRole.value;

  if (
    !role ||
    !canAssignPermissions.value ||
    !hasPermissionChanges.value ||
    savingPermissions.value
  ) {
    return;
  }

  savingPermissions.value = true;
  savePermissionsError.value = "";
  savePermissionsMessage.value = "";

  try {
    await replaceRolePermissions(
      role.id,
      draftPermissionIds.value,
    );

    await loadAssignedPermissions();

    try {
      await authorizationStore.loadContext({
        force: true,
      });
    } catch {
      authorizationStore.clear();
    }

    savePermissionsMessage.value =
      "Los permisos del rol fueron actualizados.";
  } catch (error) {
    const backendMessage =
      typeof error?.message === "string"
        ? error.message
        : "";

    const messages = {
      ADMIN_ESSENTIAL_PERMISSIONS_REQUIRED:
        "El rol administrador debe conservar todos los permisos esenciales.",
      PERMISSIONS_NOT_FOUND_OR_INACTIVE:
        "Uno o mÃ¡s permisos no existen o estÃ¡n inactivos.",
      ROLE_NOT_FOUND:
        "El rol seleccionado ya no existe.",
    };

    savePermissionsError.value =
      messages[backendMessage] ||
      backendMessage ||
      "No fue posible guardar los permisos del rol.";
  } finally {
    savingPermissions.value = false;
  }
}

async function createRole() {
  if (!canSubmitCreateRole.value) {
    return;
  }

  creatingRole.value = true;
  createRoleError.value = "";
  createRoleMessage.value = "";

  try {
    const createdRole = await createAuthorizationRole({
      code: createRoleForm.value.code,
      name: createRoleForm.value.name,
      description:
        normalizeOptionalText(
          createRoleForm.value.description,
        ) || null,
    });

    resetCreateRoleForm();

    if (createdRole?.id) {
      selectedRole.value = createdRole;
    }

    await loadCatalogs({
      selectedRoleId: createdRole?.id ?? null,
    });

    createRoleMessage.value =
      "El rol fue creado correctamente.";
  } catch (error) {
    createRoleError.value = getRoleErrorMessage(
      error,
      "No fue posible crear el rol.",
    );
  } finally {
    creatingRole.value = false;
  }
}

async function updateRole() {
  const role = selectedRole.value;

  if (
    !role ||
    !canSubmitRoleUpdate.value
  ) {
    return;
  }

  if (
    role.code === "admin" &&
    updateRoleForm.value.isActive === false
  ) {
    updateRoleError.value =
      "El rol administrador debe permanecer activo.";

    return;
  }

  editingRole.value = true;
  updateRoleError.value = "";
  updateRoleMessage.value = "";

  try {
    const updatedRole = await updateAuthorizationRole(
      role.id,
      {
        name: updateRoleForm.value.name,
        description:
          normalizeOptionalText(
            updateRoleForm.value.description,
          ) || null,
        isActive: updateRoleForm.value.isActive,
      },
    );

    if (updatedRole) {
      selectedRole.value = updatedRole;
    }

    await loadCatalogs({
      selectedRoleId: role.id,
    });

    updateRoleMessage.value =
      "Los datos del rol fueron actualizados.";
  } catch (error) {
    updateRoleError.value = getRoleErrorMessage(
      error,
      "No fue posible actualizar el rol.",
    );
  } finally {
    editingRole.value = false;
  }
}

async function loadCatalogs(options = {}) {
  if (loading.value) return;

  loading.value = true;
  errorMessage.value = "";

  const requestedRoleId =
    Number.isInteger(options.selectedRoleId) &&
    options.selectedRoleId > 0
      ? options.selectedRoleId
      : selectedRole.value?.id ?? null;

  try {
    const [loadedRoles, loadedPermissions] = await Promise.all([
      getAuthorizationRoles(),
      getAuthorizationPermissions(),
    ]);

    roles.value = loadedRoles;
    permissions.value = loadedPermissions;

    if (requestedRoleId) {
      selectedRole.value =
        loadedRoles.find(
          (role) => role.id === requestedRoleId,
        ) ?? null;
    }

    if (!selectedRole.value && loadedRoles.length > 0) {
      selectedRole.value = loadedRoles[0];
    }

    synchronizeUpdateRoleForm();

    await loadAssignedPermissions();

    loaded.value = true;
  } catch (error) {
    errorMessage.value =
      typeof error?.message === "string"
        ? error.message
        : "OcurriÃ³ un error inesperado.";

    if (!loaded.value) {
      roles.value = [];
      permissions.value = [];
      selectedRole.value = null;
      assignedPermissions.value = [];
      assignedPermissionsError.value = "";
      assignedPermissionsRequestId += 1;
    }
  } finally {
    loading.value = false;
  }
}

onMounted(loadCatalogs);
</script>

<style scoped>
.security-page {
  display: grid;
  gap: var(--toro-space-4);
}

.security-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--toro-space-5);
  padding: var(--toro-space-5);
  border: 1px solid var(--toro-color-border);
  border-radius: var(--toro-radius-lg);
  background: var(--toro-color-surface);
  box-shadow: var(--toro-shadow-sm);
}

.security-header h2,
.security-header p {
  margin: 0;
}

.security-header h2 {
  color: var(--toro-color-primary-strong);
  font-size: var(--toro-font-size-display);
}

.security-header p:not(.security-eyebrow) {
  max-width: 720px;
  margin-top: var(--toro-space-2);
  color: var(--toro-color-text-secondary);
  line-height: 1.5;
}

.security-eyebrow {
  margin-bottom: var(--toro-space-1) !important;
  color: var(--toro-color-accent);
  font-size: var(--toro-font-size-xs);
  font-weight: var(--toro-font-weight-heavy);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.security-header button {
  min-height: var(--toro-control-height);
  padding: 0 var(--toro-space-4);
  border: 0;
  border-radius: var(--toro-radius-md);
  color: var(--toro-color-text-inverse);
  background: var(--toro-color-primary);
  cursor: pointer;
  font-weight: var(--toro-font-weight-bold);
}

.security-header button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.security-header-actions {
  display: flex;
  flex: 0 0 auto;
  gap: var(--toro-space-2);
}

.security-header .security-header-create {
  border: 1px solid var(--toro-color-accent);
  color: var(--toro-color-accent-strong);
  background: var(--toro-color-accent-soft);
}

.security-message {
  display: grid;
  gap: var(--toro-space-1);
  padding: var(--toro-space-4);
  border: 1px solid var(--toro-color-border);
  border-radius: var(--toro-radius-md);
  color: var(--toro-color-text-secondary);
  background: var(--toro-color-surface);
}

.security-message-error {
  border-color: var(--toro-color-danger-border);
  color: var(--toro-color-danger);
  background: var(--toro-color-danger-soft);
}

.security-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--toro-space-3);
}

.security-metrics article {
  display: grid;
  gap: var(--toro-space-1);
  padding: var(--toro-panel-padding);
  border: 1px solid var(--toro-color-border);
  border-radius: var(--toro-radius-md);
  background: var(--toro-color-surface);
  box-shadow: var(--toro-shadow-sm);
}

.security-metrics span,
.security-metrics small {
  color: var(--toro-color-text-muted);
}

.security-metrics span {
  font-size: var(--toro-font-size-xs);
  font-weight: var(--toro-font-weight-heavy);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.security-metrics strong {
  overflow: hidden;
  color: var(--toro-color-primary-strong);
  font-size: 20px;
  text-overflow: ellipsis;
}

.security-grid {
  display: grid;
  grid-template-columns: minmax(320px, 0.9fr) minmax(320px, 1.1fr);
  gap: var(--toro-space-3);
}

.security-panel {
  min-width: 0;
  padding: var(--toro-panel-padding);
  border: 1px solid var(--toro-color-border);
  border-radius: var(--toro-radius-md);
  background: var(--toro-color-surface);
  box-shadow: var(--toro-shadow-sm);
}

.security-panel-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--toro-space-3);
  margin-bottom: var(--toro-space-4);
}

.security-panel-heading h3,
.security-panel-heading p {
  margin: 0;
}

.security-panel-heading h3 {
  margin-top: var(--toro-space-1);
  color: var(--toro-color-primary-strong);
  font-size: var(--toro-font-size-lg);
}

.security-panel-heading p {
  color: var(--toro-color-accent);
  font-size: var(--toro-font-size-xs);
  font-weight: var(--toro-font-weight-heavy);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.security-panel-heading > span {
  padding: 5px 9px;
  border-radius: 999px;
  color: var(--toro-color-primary-strong);
  background: var(--toro-color-surface-soft);
  font-weight: var(--toro-font-weight-bold);
}

.role-list {
  display: grid;
  gap: var(--toro-space-2);
}

.role-item {
  display: flex;
  width: 100%;
  min-height: 58px;
  align-items: center;
  gap: var(--toro-space-3);
  padding: var(--toro-space-3);
  border: 1px solid var(--toro-color-border);
  border-radius: var(--toro-radius-md);
  color: var(--toro-color-text);
  background: var(--toro-color-surface);
  cursor: pointer;
  text-align: left;
}

.role-item:hover,
.role-item-selected {
  border-color: var(--toro-color-primary);
  background: var(--toro-color-surface-soft);
}

.role-item-selected {
  box-shadow: inset 3px 0 0 var(--toro-color-accent);
}

.role-code {
  display: grid;
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  place-items: center;
  border-radius: var(--toro-radius-md);
  color: var(--toro-color-primary-strong);
  background: var(--toro-color-info-soft);
  font-size: var(--toro-font-size-xs);
  font-weight: var(--toro-font-weight-heavy);
  text-transform: uppercase;
}

.role-content {
  display: grid;
  min-width: 0;
  flex: 1;
  gap: 3px;
}

.role-content strong,
.role-content small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.role-content small {
  color: var(--toro-color-text-muted);
}

.status-badge {
  flex: 0 0 auto;
  padding: 5px 8px;
  border-radius: 999px;
  color: var(--toro-color-success);
  background: var(--toro-color-success-soft);
  font-size: var(--toro-font-size-xs);
  font-weight: var(--toro-font-weight-bold);
}

.status-badge-inactive {
  color: var(--toro-color-warning);
  background: var(--toro-color-warning-soft);
}

.role-form-panel {
  padding: var(--toro-panel-padding);
  border: 1px solid var(--toro-color-accent-border);
  border-radius: var(--toro-radius-md);
  background: var(--toro-color-surface);
  box-shadow: var(--toro-shadow-sm);
}

.role-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--toro-space-3);
}

.role-form label,
.role-metadata-form > label {
  display: grid;
  gap: var(--toro-space-2);
}

.role-form label > span,
.role-metadata-form > label > span {
  color: var(--toro-color-text-secondary);
  font-size: var(--toro-font-size-sm);
  font-weight: var(--toro-font-weight-bold);
}

.role-form input,
.role-form textarea,
.role-metadata-form input,
.role-metadata-form textarea {
  width: 100%;
  border: 1px solid var(--toro-color-border-strong);
  border-radius: var(--toro-radius-md);
  color: var(--toro-color-text);
  background: var(--toro-color-surface);
}

.role-form input,
.role-metadata-form input {
  min-height: var(--toro-control-height);
  padding: 0 var(--toro-space-3);
}

.role-form textarea,
.role-metadata-form textarea {
  min-height: 78px;
  padding: var(--toro-space-3);
  resize: vertical;
}

.role-form input:focus,
.role-form textarea:focus,
.role-metadata-form input:focus,
.role-metadata-form textarea:focus {
  border-color: var(--toro-color-primary);
  outline: var(--toro-focus-ring);
}

.role-form small,
.role-metadata-form small {
  color: var(--toro-color-text-muted);
  font-size: var(--toro-font-size-xs);
}

.role-form-wide {
  grid-column: 1 / -1;
}

.role-metadata-form {
  display: grid;
  gap: var(--toro-space-3);
}

.role-form-message {
  padding: var(--toro-space-3);
  border: 1px solid var(--toro-color-border);
  border-radius: var(--toro-radius-md);
}

.role-form-message-error {
  border-color: var(--toro-color-danger-border);
  color: var(--toro-color-danger);
  background: var(--toro-color-danger-soft);
}

.role-form-message-success {
  border-color: var(--toro-color-success-border);
  color: var(--toro-color-success);
  background: var(--toro-color-success-soft);
}

.role-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--toro-space-2);
  padding-top: var(--toro-space-2);
}

.role-active-option {
  display: flex !important;
  align-items: flex-start;
  gap: var(--toro-space-3) !important;
  padding: var(--toro-space-3);
  border: 1px solid var(--toro-color-border);
  border-radius: var(--toro-radius-md);
  background: var(--toro-color-surface-soft);
  cursor: pointer;
}

.role-active-option input {
  width: 16px;
  height: 16px;
  min-height: 0;
  flex: 0 0 16px;
  margin-top: 2px;
  padding: 0;
  accent-color: var(--toro-color-primary);
}

.role-active-option > span {
  display: grid;
  gap: 3px;
}

.role-active-option-disabled {
  cursor: not-allowed;
  opacity: 0.72;
}

.role-item:disabled {
  cursor: wait;
}

.role-detail {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--toro-space-3);
  margin: 0;
}

.role-detail div {
  min-width: 0;
  padding: var(--toro-space-3);
  border: 1px solid var(--toro-color-border);
  border-radius: var(--toro-radius-md);
  background: var(--toro-color-surface-soft);
}

.role-detail dt {
  color: var(--toro-color-text-muted);
  font-size: var(--toro-font-size-xs);
  font-weight: var(--toro-font-weight-heavy);
  text-transform: uppercase;
}

.role-detail dd {
  overflow-wrap: anywhere;
  margin: var(--toro-space-1) 0 0;
  font-weight: var(--toro-font-weight-medium);
}

.assigned-permissions-warning {
  padding: var(--toro-space-3);
  border-left: 3px solid var(--toro-color-warning);
  color: var(--toro-color-warning);
  background: var(--toro-color-warning-soft);
}

.assigned-permissions-success {
  border-color: var(--toro-color-success-border);
  color: var(--toro-color-success);
  background: var(--toro-color-success-soft);
}

.permission-editor {
  display: grid;
  gap: var(--toro-space-3);
}

.permission-editor-module {
  overflow: hidden;
  border: 1px solid var(--toro-color-border);
  border-radius: var(--toro-radius-md);
}

.permission-editor-module > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--toro-space-2) var(--toro-space-3);
  background: var(--toro-color-surface-soft);
}

.permission-editor-module h5 {
  margin: 0;
  color: var(--toro-color-primary-strong);
  text-transform: capitalize;
}

.permission-option {
  display: flex;
  min-height: var(--toro-table-row-height);
  align-items: center;
  gap: var(--toro-space-3);
  padding: var(--toro-space-2) var(--toro-space-3);
  border-top: 1px solid var(--toro-color-border);
  cursor: pointer;
}

.permission-option-selected {
  background: var(--toro-color-selection-soft);
}

.permission-option-disabled {
  cursor: not-allowed;
  opacity: 0.68;
}

.permission-option input {
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
  accent-color: var(--toro-color-primary);
}

.permission-option-copy {
  display: grid;
  min-width: 0;
  flex: 1;
  gap: 2px;
}

.permission-option-copy strong {
  overflow-wrap: anywhere;
}

.permission-option-copy small {
  color: var(--toro-color-text-muted);
}

.permission-editor-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--toro-space-3);
  padding-top: var(--toro-space-3);
  border-top: 1px solid var(--toro-color-border);
}

.permission-editor-actions > span {
  color: var(--toro-color-text-muted);
}

.permission-editor-actions > div {
  display: flex;
  gap: var(--toro-space-2);
}

.permission-action {
  min-height: var(--toro-control-height);
  padding: 0 var(--toro-space-4);
  border-radius: var(--toro-radius-md);
  cursor: pointer;
  font-weight: var(--toro-font-weight-bold);
}

.permission-action:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.permission-action-secondary {
  border: 1px solid var(--toro-color-border-strong);
  color: var(--toro-color-primary-strong);
  background: var(--toro-color-surface);
}

.permission-action-primary {
  border: 1px solid var(--toro-color-primary);
  color: var(--toro-color-text-inverse);
  background: var(--toro-color-primary);
}

.security-note {
  margin: var(--toro-space-4) 0 0;
  padding: var(--toro-space-3);
  border-left: 3px solid var(--toro-color-accent);
  color: var(--toro-color-text-secondary);
  background: var(--toro-color-accent-soft);
}

.assigned-permissions {
  display: grid;
  gap: var(--toro-space-3);
  margin-top: var(--toro-space-4);
  padding-top: var(--toro-space-4);
  border-top: 1px solid var(--toro-color-border);
}

.assigned-permissions header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--toro-space-3);
}

.assigned-permissions h4,
.assigned-permissions p {
  margin: 0;
}

.assigned-permissions h4 {
  margin-top: var(--toro-space-1);
  color: var(--toro-color-primary-strong);
}

.assigned-permissions p {
  color: var(--toro-color-accent);
  font-size: var(--toro-font-size-xs);
  font-weight: var(--toro-font-weight-heavy);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.assigned-permissions header > span {
  padding: 5px 9px;
  border-radius: 999px;
  color: var(--toro-color-primary-strong);
  background: var(--toro-color-surface-soft);
  font-weight: var(--toro-font-weight-bold);
}

.assigned-permissions-status {
  padding: var(--toro-space-3);
  border: 1px dashed var(--toro-color-border-strong);
  border-radius: var(--toro-radius-md);
  color: var(--toro-color-text-muted);
  text-align: center;
}

.assigned-permissions-error {
  border-color: var(--toro-color-danger-border);
  color: var(--toro-color-danger);
  background: var(--toro-color-danger-soft);
}

.assigned-permissions-list {
  display: grid;
  gap: var(--toro-space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.assigned-permissions-list li {
  display: flex;
  min-height: var(--toro-table-row-height);
  align-items: center;
  justify-content: space-between;
  gap: var(--toro-space-3);
  padding: var(--toro-space-2) var(--toro-space-3);
  border: 1px solid var(--toro-color-border);
  border-radius: var(--toro-radius-md);
  background: var(--toro-color-surface-soft);
}

.assigned-permissions-list li > span:first-child {
  display: grid;
  min-width: 0;
  gap: 2px;
}

.assigned-permissions-list strong {
  overflow-wrap: anywhere;
}

.assigned-permissions-list small {
  color: var(--toro-color-text-muted);
}

.permission-modules {
  display: grid;
  gap: var(--toro-space-3);
}

.permission-modules section {
  overflow: hidden;
  border: 1px solid var(--toro-color-border);
  border-radius: var(--toro-radius-md);
}

.permission-modules header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--toro-space-3);
  background: var(--toro-color-surface-soft);
}

.permission-modules h4 {
  margin: 0;
  color: var(--toro-color-primary-strong);
  text-transform: capitalize;
}

.permission-list {
  display: grid;
}

.permission-item {
  display: flex;
  min-height: var(--toro-table-row-height);
  align-items: center;
  justify-content: space-between;
  gap: var(--toro-space-3);
  padding: var(--toro-space-2) var(--toro-space-3);
  border-top: 1px solid var(--toro-color-border);
}

.permission-item > div {
  display: grid;
  min-width: 0;
  gap: 2px;
}

.permission-item strong {
  overflow-wrap: anywhere;
  color: var(--toro-color-text);
}

.permission-item span:not(.status-badge) {
  color: var(--toro-color-text-muted);
  font-size: var(--toro-font-size-sm);
}

.security-empty {
  padding: var(--toro-space-6);
  border: 1px dashed var(--toro-color-border-strong);
  border-radius: var(--toro-radius-md);
  color: var(--toro-color-text-muted);
  text-align: center;
}

@media (max-width: 1000px) {
  .security-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .security-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {

  .security-header-actions {
    display: grid;
    width: 100%;
    grid-template-columns: 1fr;
  }

  .role-form {
    grid-template-columns: 1fr;
  }

  .role-form-wide {
    grid-column: auto;
  }

  .role-form-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .role-form-actions .permission-action {
    width: 100%;
  }

  .security-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .security-metrics,
  .role-detail {
    grid-template-columns: 1fr;
  }

  .security-header button {
    width: 100%;
  }

  .role-item {
    align-items: flex-start;
  }

  .permission-editor-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .permission-editor-actions > div {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .permission-action {
    width: 100%;
  }
}
</style>
