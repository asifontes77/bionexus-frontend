<template>
  <section class="security-page" aria-labelledby="security-title">
    <header class="security-header">
      <div>
        <p class="security-eyebrow">Administración de seguridad</p>
        <h2 id="security-title">Roles y permisos</h2>
        <p>
          Consulta los roles configurados y el catálogo de permisos
          administrado por el backend.
        </p>
      </div>

      <button type="button" :disabled="loading" @click="loadCatalogs">
        {{ loading ? "Actualizando..." : "Actualizar" }}
      </button>
    </header>

    <div v-if="errorMessage" class="security-message security-message-error" role="alert">
      <strong>No fue posible cargar la información.</strong>
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
        <article class="security-panel">
          <div class="security-panel-heading">
            <div>
              <p>Catálogo</p>
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
              @click="selectRole(role)"
            >
              <span class="role-code">{{ role.code }}</span>

              <span class="role-content">
                <strong>{{ role.name }}</strong>
                <small>{{ role.description || "Sin descripción" }}</small>
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

          <dl v-else class="role-detail">
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
            Los metadatos del rol permanecen en modo de consulta. La asignación
            de permisos está disponible únicamente para cuentas autorizadas.
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
  getAuthorizationPermissions,
  getAuthorizationRoles,
  getRolePermissions,
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
    savingPermissions.value
  ) {
    return;
  }

  selectedRole.value = role;
  savePermissionsError.value = "";
  savePermissionsMessage.value = "";
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

async function loadCatalogs() {
  if (loading.value) return;

  loading.value = true;
  errorMessage.value = "";

  try {
    const [loadedRoles, loadedPermissions] = await Promise.all([
      getAuthorizationRoles(),
      getAuthorizationPermissions(),
    ]);

    roles.value = loadedRoles;
    permissions.value = loadedPermissions;

    if (selectedRole.value) {
      selectedRole.value =
        loadedRoles.find((role) => role.id === selectedRole.value.id) ?? null;
    }

    if (!selectedRole.value && loadedRoles.length > 0) {
      selectedRole.value = loadedRoles[0];
    }

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
  border-color: #f4b4ae;
  color: var(--toro-color-danger);
  background: #fff4f2;
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
  background: #e7f1f6;
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
  background: #ecfdf3;
  font-size: var(--toro-font-size-xs);
  font-weight: var(--toro-font-weight-bold);
}

.status-badge-inactive {
  color: var(--toro-color-warning);
  background: #fffaeb;
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
  background: #fffaeb;
}

.assigned-permissions-success {
  border-color: #a6dfc3;
  color: var(--toro-color-success);
  background: #ecfdf3;
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
  background: #edf6fa;
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
  border-color: #f4b4ae;
  color: var(--toro-color-danger);
  background: #fff4f2;
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