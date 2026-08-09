<template>
  <section class="security-page toro-page" aria-labelledby="security-title">
    <header class="security-header toro-page-header">
      <div>
        <p class="security-eyebrow toro-page-eyebrow">Administración de seguridad</p>
        <h2 id="security-title">Roles y permisos</h2>
        <p>
          Consulta los roles configurados y el catálogo de permisos
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
      <div class="security-panel-heading toro-panel-heading">
        <div>
          <p>Nuevo registro</p>
          <h3>Crear rol configurable</h3>
        </div>

        <span>Creación de roles</span>
      </div>

      <form class="role-form" @submit.prevent="createRole">
        <label>
          <span>Código</span>
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
            Debe comenzar con una letra. Puede contener letras minúsculas,
            números, puntos, guiones y guiones bajos.
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
          <span>Descripción</span>
          <textarea
            v-model="createRoleForm.description"
            maxlength="250"
            rows="3"
            placeholder="Descripción opcional"
            :disabled="creatingRole"
          ></textarea>

          <small>
            {{ createRoleForm.description.length }} de 250 caracteres
          </small>
        </label>

        <div
          v-if="createRoleError"
          class="role-form-message role-form-message-error role-form-wide toro-inline-message toro-message-error"
          role="alert"
        >
          {{ createRoleError }}
        </div>

        <div
          v-if="createRoleMessage"
          class="role-form-message role-form-message-success role-form-wide toro-inline-message toro-message-success"
          role="status"
        >
          {{ createRoleMessage }}
        </div>

        <div class="role-form-actions role-form-wide toro-form-actions">
          <button
            type="button"
            class="permission-action permission-action-secondary toro-action toro-action-secondary"
            :disabled="creatingRole"
            @click="resetCreateRoleForm"
          >
            Limpiar
          </button>

          <button
            type="submit"
            class="permission-action permission-action-primary toro-action toro-action-primary"
            :disabled="!canSubmitCreateRole"
          >
            {{ creatingRole ? "Creando..." : "Crear rol" }}
          </button>
        </div>
      </form>
    </article>

    <div v-if="errorMessage" class="security-message security-message-error toro-message toro-message-error" role="alert">
      <strong>No fue posible cargar la información.</strong>
      <span>{{ errorMessage }}</span>
    </div>

    <div v-if="loading && !loaded" class="security-message toro-message" role="status">
      Cargando roles y permisos...
    </div>

    <template v-else>
      <div class="security-metrics toro-metrics">
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
          <span>Módulos</span>
          <strong>{{ permissionModules.length }}</strong>
          <small>Áreas con permisos</small>
        </article>

        <article>
          <span>Rol seleccionado</span>
          <strong>{{ selectedRole?.code || "Ninguno" }}</strong>
          <small>{{ selectedRole?.name || "Seleccione un rol" }}</small>
        </article>
      </div>

      <div class="security-grid">
        <article class="security-panel toro-panel">
          <div class="security-panel-heading toro-panel-heading">
            <div>
              <p>Catálogo</p>
              <h3>Roles</h3>
            </div>

            <span>{{ roles.length }}</span>
          </div>

          <div v-if="roles.length === 0" class="security-empty toro-empty-state">
            No existen roles disponibles.
          </div>

          <div v-else class="role-list toro-field-group">
            <button
              v-for="role in roles"
              :key="role.id"
              type="button"
              class="role-item toro-list-item"
              :class="{ 'role-item-selected': selectedRole?.id === role.id }"
              :disabled="savingPermissions || creatingRole || editingRole"
              @click="selectRole(role)"
            >
              <span class="role-code">{{ role.code }}</span>

              <span class="role-content">
                <strong>{{ role.name }}</strong>
                <small>{{ role.description || "Sin descripción" }}</small>
              </span>

              <span
                class="status-badge toro-badge"
                :class="{ 'toro-badge-warning': !role.isActive }"
              >
                {{ role.isActive ? "Activo" : "Inactivo" }}
              </span>
            </button>
          </div>
        </article>

        <article class="security-panel toro-panel">
          <div class="security-panel-heading toro-panel-heading">
            <div>
              <p>Detalle</p>
              <h3>Rol seleccionado</h3>
            </div>
          </div>

          <div v-if="!selectedRole" class="security-empty toro-empty-state">
            Seleccione un rol para consultar sus datos.
          </div>

          <template v-else>
            <form
              v-if="canUpdateRoles"
              class="role-metadata-form toro-form"
              @submit.prevent="updateRole"
            >
              <div class="role-detail toro-detail">
                <div>
                  <dt>Identificador</dt>
                  <dd>{{ selectedRole.id }}</dd>
                </div>

                <div>
                  <dt>Código inmutable</dt>
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
                <span>Descripción</span>
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
                class="role-form-message role-form-message-error toro-inline-message toro-message-error"
                role="alert"
              >
                {{ updateRoleError }}
              </div>

              <div
                v-if="updateRoleMessage"
                class="role-form-message role-form-message-success toro-inline-message toro-message-success"
                role="status"
              >
                {{ updateRoleMessage }}
              </div>

              <div class="role-form-actions toro-form-actions">
                <button
                  type="button"
                  class="permission-action permission-action-secondary toro-action toro-action-secondary"
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
                  class="permission-action permission-action-primary toro-action toro-action-primary"
                  :disabled="!canSubmitRoleUpdate"
                >
                  {{ editingRole ? "Guardando..." : "Guardar datos" }}
                </button>
              </div>
            </form>

            <dl v-else class="role-detail toro-detail">
              <div>
                <dt>Identificador</dt>
                <dd>{{ selectedRole.id }}</dd>
              </div>

              <div>
                <dt>Código</dt>
                <dd>{{ selectedRole.code }}</dd>
              </div>

              <div>
                <dt>Nombre</dt>
                <dd>{{ selectedRole.name }}</dd>
              </div>

              <div>
                <dt>Descripción</dt>
                <dd>{{ selectedRole.description || "Sin descripción" }}</dd>
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
                serán retirados en el próximo guardado.
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
                  :key="module.key"
                  class="permission-editor-module"
                >
                  <header>
                    <h5>{{ module.label }}</h5>
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
                      <strong>{{ permission.displayName }}</strong>
                      <small>{{ permission.displayDescription }}</small>
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
                      : "Las asignaciones están sincronizadas."
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
            La creación, edición y asignación de permisos se habilitan de forma
            independiente según los permisos efectivos de la cuenta actual.
          </p>
        </article>
      </div>

      <article class="security-panel">
        <div class="security-panel-heading">
          <div>
            <p>Catálogo global</p>
            <h3>Permisos</h3>
          </div>

          <span>{{ permissions.length }}</span>
        </div>

        <div v-if="permissions.length === 0" class="security-empty">
          No existen permisos disponibles.
        </div>

        <div v-else class="permission-modules">
          <section v-for="module in permissionModules" :key="module.key">
            <header>
              <h4>{{ module.label }}</h4>
              <span>{{ module.permissions.length }}</span>
            </header>

            <div class="permission-list">
              <article
                v-for="permission in module.permissions"
                :key="permission.id"
                class="permission-item"
              >
                <div>
                  <strong>{{ permission.displayName }}</strong>
                  <span>{{ permission.displayDescription }}</span>
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
  groupPermissionsForPresentation,
} from "@/presentation/permissionPresentation";
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

const permissionModules = computed(() =>
  groupPermissionsForPresentation(
    permissions.value,
  ),
);

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
      "Ya existe un rol con el código indicado.",
    ROLE_CODE_REQUIRED:
      "El código del rol es obligatorio.",
    ROLE_CODE_INVALID:
      "El código debe comenzar con una letra y solo puede contener letras minúsculas, números, puntos, guiones y guiones bajos.",
    ROLE_CODE_TOO_LONG:
      "El código no puede superar los 60 caracteres.",
    ROLE_NAME_REQUIRED:
      "El nombre del rol es obligatorio.",
    ROLE_NAME_TOO_LONG:
      "El nombre no puede superar los 100 caracteres.",
    ROLE_DESCRIPTION_TOO_LONG:
      "La descripción no puede superar los 250 caracteres.",
    ROLE_ACTIVE_STATE_INVALID:
      "El estado activo del rol no es válido.",
    ROLE_NOT_FOUND:
      "El rol seleccionado ya no existe.",
    ROLE_CODE_IMMUTABLE:
      "El código del rol no puede modificarse.",
    ROLE_SYSTEM_FLAG_IMMUTABLE:
      "La condición de rol de sistema no puede modificarse.",
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
        "Uno o más permisos no existen o están inactivos.",
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
        : "Ocurrió un error inesperado.";

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

.security-header p {
  margin: 0;
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

.security-metrics small {
  color: var(--toro-color-text-muted);
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

.security-panel-heading h3 {
  margin: 0;
}

.security-panel-heading h3 {
  margin-top: var(--toro-space-1);
  color: var(--toro-color-primary-strong);
  font-size: var(--toro-font-size-lg);
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

.role-content small {
  color: var(--toro-color-text-muted);
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

.role-form-wide {
  grid-column: 1 / -1;
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

.role-detail div {
  min-width: 0;
  padding: var(--toro-space-3);
  border: 1px solid var(--toro-color-border);
  border-radius: var(--toro-radius-md);
  background: var(--toro-color-surface-soft);
}

.role-detail dd {
  overflow-wrap: anywhere;
  margin: var(--toro-space-1) 0 0;
  font-weight: var(--toro-font-weight-medium);
}

.permission-editor {
  display: grid;
  gap: var(--toro-space-3);
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

.permission-option input {
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
  accent-color: var(--toro-color-primary);
}

.permission-option-copy strong {
  overflow-wrap: anywhere;
}

.permission-option-copy small {
  color: var(--toro-color-text-muted);
}

.permission-editor-actions > span {
  color: var(--toro-color-text-muted);
}

.permission-action:disabled {
  cursor: not-allowed;
  opacity: 0.55;
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

.assigned-permissions-list strong {
  overflow-wrap: anywhere;
}

.assigned-permissions-list small {
  color: var(--toro-color-text-muted);
}

.permission-modules header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--toro-space-3);
  background: var(--toro-color-surface-soft);
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

.permission-item strong {
  overflow-wrap: anywhere;
  color: var(--toro-color-text);
}

.permission-item span:not(.status-badge) {
  color: var(--toro-color-text-muted);
  font-size: var(--toro-font-size-sm);
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

  .security-metrics,
  .role-detail {
    grid-template-columns: 1fr;
  }

  .security-header button {
    width: 100%;
  }

  .permission-editor-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .permission-editor-actions > div {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
</style>
