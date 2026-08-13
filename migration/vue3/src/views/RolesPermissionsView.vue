<template>
  <section class="roles-admin" aria-label="Administracion de roles y permisos">
    <div v-if="errorMessage" class="toro-message toro-message-error" role="alert">
      <strong>No fue posible cargar la informacion.</strong>
      <span>{{ errorMessage }}</span>
    </div>

    <div v-if="loading && !loaded" class="toro-message" role="status">
      Cargando roles y permisos...
    </div>

    <template v-else>
      <section class="roles-workspace toro-panel">
        <header class="roles-toolbar">
          <label class="roles-search">
            <span>Buscar rol</span>
            <input v-model="roleSearchText" class="toro-field" type="search" autocomplete="off"
              placeholder="Código, nombre o descripción" />
          </label>

          <label class="roles-status-filter">
            <span>Estado</span>
            <select v-model="roleStatusFilter" class="toro-field">
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </label>

          <div class="roles-toolbar-summary" aria-label="Resumen">
            <span><strong>{{ filteredRoles.length }}</strong> roles</span>
            <span><strong>{{ permissions.length }}</strong> permisos</span>
          </div>

          <div class="roles-toolbar-actions">
            <button type="button" class="toro-action toro-action-secondary" @click="openPermissionCatalogDialog">
  <ToroActionIcon action="catalog" />
              Ver catálogo
            </button>

            <button v-if="canCreateRoles" type="button" class="toro-action toro-action-secondary" :disabled="loading"
              @click="openCreateRoleDialog">
  <ToroActionIcon action="create" />
              Nuevo rol
            </button>

            <button type="button" class="toro-action toro-action-primary"
              :disabled="loading || creatingRole || editingRole" @click="loadCatalogs">
  <ToroActionIcon action="refresh" />
              {{ loading ? "Actualizando..." : "Actualizar" }}
            </button>
          </div>
        </header>

        <div v-if="filteredRoles.length === 0" class="roles-empty toro-empty-state">
          No existen roles que coincidan con los filtros.
        </div>

        <ToroDataGrid v-else class="roles-grid" :row-data="filteredRoles" :column-defs="roleColumnDefs"
          :components="gridComponents" :context="gridContext" :get-row-id="getRoleRowId"
          :quick-filter-text="roleSearchText" :page-size="10" :page-size-selector="[10, 20, 50]" height="430px"
          empty-text="No existen roles que coincidan con los filtros."           @row-context-menu="openRoleContextMenu"
/>
              <ToroContextMenu
          ref="roleContextMenu"
          :open="roleContextMenuState.open"
          :x="roleContextMenuState.x"
          :y="roleContextMenuState.y"
          :items="roleContextMenuItems"
          @close="closeRoleContextMenu"
          @select="runRoleContextAction"
        />
</section>
    </template>

    <dialog ref="createRoleDialog" class="toro-dialog role-dialog" @close="resetCreateRoleForm" tabindex="-1">
      <form class="dialog-shell" novalidate @submit.prevent="submitCreateRoleDialog">
        <header class="dialog-header">
          <div>
            <p>Nuevo registro</p>
            <h3>Crear rol</h3>
          </div>

          <ToroDialogCloseButton @click="closeCreateRoleDialog" />
        </header>

        <div class="dialog-body role-dialog-form">
                    <ToroFormField
            label="Código"
            field-id="create-role-code"
            :error="createRoleCodeError"
            help="Letras minusculas, numeros, puntos, guiones y guiones bajos."
            required
          >
            <input
              id="create-role-code"
              v-model.trim="createRoleForm.code"
              class="toro-field"
              type="text"
              maxlength="60"
              autocomplete="off"
              placeholder="Ejemplo: supervisor"
              :disabled="creatingRole"
              :aria-invalid="createRoleCodeError ? 'true' : undefined"
              :aria-describedby="
                createRoleCodeError
                  ? 'create-role-code-error'
                  : 'create-role-code-help'
              "
              required
            />
          </ToroFormField>

                    <ToroFormField
            label="Nombre"
            field-id="create-role-name"
            :error="createRoleNameError"
            required
          >
            <input
              id="create-role-name"
              v-model.trim="createRoleForm.name"
              class="toro-field"
              type="text"
              maxlength="100"
              autocomplete="off"
              placeholder="Nombre visible del rol"
              :disabled="creatingRole"
              :aria-invalid="createRoleNameError ? 'true' : undefined"
              :aria-describedby="createRoleNameError ? 'create-role-name-error' : undefined"
              required
            />
          </ToroFormField>

                    <ToroFormField
            label="Descripción"
            field-id="create-role-description"
            :help="`${createRoleForm.description.length} de 250 caracteres`"
            wide
          >
            <textarea
              id="create-role-description"
              v-model="createRoleForm.description"
              class="toro-field"
              maxlength="250"
              rows="4"
              placeholder="Descripción opcional"
              :disabled="creatingRole"
              aria-describedby="create-role-description-help"
            ></textarea>
          </ToroFormField>

          <div v-if="createRoleError" class="dialog-field-wide toro-inline-message toro-message-error" role="alert">
            {{ createRoleError }}
          </div>

          <div v-if="createRoleMessage" class="dialog-field-wide toro-inline-message toro-message-success"
            role="status">
            {{ createRoleMessage }}
          </div>
        </div>

        <footer class="dialog-footer">
          <button type="button" class="toro-action toro-action-secondary" :disabled="creatingRole"
            @click="closeCreateRoleDialog">
  <ToroActionIcon action="cancel" />
            Cancelar
          </button>

          <button type="submit" class="toro-action toro-action-primary" :disabled="creatingRole || !canCreateRoles">
  <ToroActionIcon action="create" />
            {{ creatingRole ? "Creando..." : "Crear rol" }}
          </button>
        </footer>
      </form>
    </dialog>

    <dialog ref="roleDetailDialog" class="toro-dialog role-dialog" tabindex="-1">
      <div class="dialog-shell">
        <header class="dialog-header">
          <div>
            <p>Detalle administrativo</p>
            <h3>{{ selectedRole?.name || "Rol" }}</h3>
          </div>

          <ToroDialogCloseButton @click="closeRoleDetailDialog" />
        </header>

        <div v-if="selectedRole" class="dialog-body role-summary-card">
          <div class="role-summary-heading">
            <div>
              <span class="role-summary-code">{{ selectedRole.code }}</span>
              <h4>{{ selectedRole.name }}</h4>
              <p>
                {{ selectedRole.isSystem ? "Rol de sistema" : "Rol configurable" }}
              </p>
            </div>

            <span class="toro-badge" :class="{
              'toro-badge-warning': !selectedRole.isActive,
            }">
              {{ selectedRole.isActive ? "Activo" : "Inactivo" }}
            </span>
          </div>

          <section class="role-summary-description">
            <span>Descripción</span>
            <p>{{ selectedRole.description || "Sin descripción" }}</p>
          </section>

          <dl class="role-summary-metadata">
            <div>
              <dt>Identificador</dt>
              <dd>{{ selectedRole.id }}</dd>
            </div>

            <div>
              <dt>Tipo</dt>
              <dd>{{ selectedRole.isSystem ? "Sistema" : "Configurable" }}</dd>
            </div>
          </dl>
        </div>
        <footer class="dialog-footer">
          <button type="button" class="toro-action toro-action-secondary" @click="closeRoleDetailDialog">
  <ToroActionIcon action="close" />
            Cerrar
          </button>
        </footer>
      </div>
    </dialog>

    <dialog ref="editRoleDialog" class="toro-dialog role-dialog" tabindex="-1">
      <form class="dialog-shell" novalidate @submit.prevent="submitEditRoleDialog">
        <header class="dialog-header">
          <div>
            <p>Editar rol</p>
            <h3>{{ selectedRole?.name || "Rol" }}</h3>
          </div>

          <ToroDialogCloseButton @click="closeEditRoleDialog" />
        </header>

        <div class="dialog-body role-dialog-form">
                    <ToroFormField
            label="Código"
            field-id="edit-role-code"
            help="El código identifica al rol y no puede modificarse."
            disabled
          >
            <input
              id="edit-role-code"
              :value="selectedRole?.code || ''"
              class="toro-field"
              type="text"
              aria-disabled="true"
              aria-describedby="edit-role-code-help"
              disabled
            />
          </ToroFormField>

                    <ToroFormField
            label="Nombre"
            field-id="edit-role-name"
            :error="updateRoleNameError"
            required
          >
            <input
              id="edit-role-name"
              v-model.trim="updateRoleForm.name"
              class="toro-field"
              type="text"
              maxlength="100"
              :disabled="editingRole"
              :aria-invalid="updateRoleNameError ? 'true' : undefined"
              :aria-describedby="updateRoleNameError ? 'edit-role-name-error' : undefined"
              required
            />
          </ToroFormField>

                    <ToroFormField
            label="Descripción"
            field-id="edit-role-description"
            :help="`${updateRoleForm.description.length} de 250 caracteres`"
            wide
          >
            <textarea
              id="edit-role-description"
              v-model="updateRoleForm.description"
              class="toro-field"
              maxlength="250"
              rows="4"
              :disabled="editingRole"
              aria-describedby="edit-role-description-help"
            ></textarea>
          </ToroFormField>

          <label class="dialog-field-wide role-active-option toro-option">
            <input v-model="updateRoleForm.isActive" type="checkbox"
              :disabled="editingRole || selectedRole?.code === 'admin'" />
            <span class="toro-option-copy">
              <strong>Rol activo</strong>
              <small>
                {{
                  selectedRole?.code === "admin"
                    ? "El rol administrador debe permanecer activo."
                    : "Los roles inactivos no pueden asignarse a nuevos usuarios."
                }}
              </small>
            </span>
          </label>

          <div v-if="updateRoleError" class="dialog-field-wide toro-inline-message toro-message-error" role="alert">
            {{ updateRoleError }}
          </div>

          <div v-if="updateRoleMessage" class="dialog-field-wide toro-inline-message toro-message-success"
            role="status">
            {{ updateRoleMessage }}
          </div>
        </div>

        <footer class="dialog-footer">
          <button type="button" class="toro-action toro-action-secondary" :disabled="editingRole"
            @click="closeEditRoleDialog">
  <ToroActionIcon action="cancel" />
            Cancelar
          </button>

          <button type="submit" class="toro-action toro-action-primary" :disabled="editingRole || !canUpdateRoles || !hasRoleMetadataChanges">
  <ToroActionIcon action="save" />
            {{ editingRole ? "Guardando..." : "Guardar" }}
          </button>
        </footer>
      </form>
    </dialog>

    <dialog ref="rolePermissionsDialog" class="toro-dialog permissions-dialog" tabindex="-1">
      <div class="dialog-shell">
        <header class="dialog-header">
          <div>
            <p>Asignación de permisos</p>
            <h3>
              {{ selectedRole?.name || "Rol" }}
              <span v-if="selectedRole?.code" class="role-dialog-code">
                ({{ selectedRole.code }})
              </span>
            </h3>
          </div>

          <ToroDialogCloseButton @click="closeRolePermissionsDialog" />
        </header>

        <div class="permissions-dialog-toolbar role-permissions-toolbar">
          <label>
            <span>Buscar permiso</span>
            <input v-model="permissionSearchText" class="toro-field" type="search" autocomplete="off"
              placeholder="Nombre, descripción o módulo" />
          </label>

          <span>
            <strong>{{ draftPermissionIds.length }}</strong> seleccionados
          </span>
        </div>

        <div class="dialog-body permissions-dialog-body">
          <div v-if="assignedPermissionsLoading" class="toro-message" role="status">
            Consultando permisos asignados...
          </div>

          <div v-else-if="assignedPermissionsError" class="toro-message toro-message-error" role="alert">
            {{ assignedPermissionsError }}
          </div>

          <template v-else>
            <div v-if="selectedRole?.code === 'admin'" class="toro-warning">
              El rol administrador debe conservar los permisos esenciales.
            </div>

            <div v-if="inactiveAssignedPermissions.length > 0" class="toro-warning">
              Los permisos inactivos se conservan para consulta y se retiraran al guardar.
            </div>

            <div v-if="filteredPermissionModules.length === 0" class="toro-empty-state">
              No existen permisos que coincidan con la búsqueda.
            </div>

            <ToroPermissionTree
              class="role-permission-tree"
              :modules="filteredPermissionModules"
              :search-text="permissionSearchText"
              :selected-ids="draftPermissionIds"
              selectable
              :disabled="!canAssignPermissions || savingPermissions"
              @toggle-permission="togglePermission"
              @toggle-module="toggleModulePermissions"
              empty-text="No existen permisos que coincidan con la búsqueda."
            />

            <div v-if="savePermissionsError" class="toro-inline-message toro-message-error" role="alert">
              {{ savePermissionsError }}
            </div>

            <div v-if="savePermissionsMessage" class="toro-inline-message toro-message-success" role="status">
              {{ savePermissionsMessage }}
            </div>
          </template>
        </div>

        <footer class="dialog-footer">
          <span class="dialog-pending-status">
            {{
              hasPermissionChanges
                ? "Existen cambios pendientes."
                : "Las asignaciones están sincronizadas."
            }}
          </span>

          <button type="button" class="toro-action toro-action-secondary" :disabled="savingPermissions"
            @click="closeRolePermissionsDialog">
  <ToroActionIcon action="cancel" />
            Cancelar
          </button>

          <button v-if="canAssignPermissions" type="button" class="toro-action toro-action-primary"
            :disabled="!hasPermissionChanges || savingPermissions" @click="submitRolePermissionsDialog">
  <ToroActionIcon action="assignPermissions" />
            {{ savingPermissions ? "Guardando..." : "Guardar permisos" }}
          </button>
        </footer>
      </div>
    </dialog>

    <dialog ref="permissionCatalogDialog" class="toro-dialog catalog-dialog toro-catalog-layout" tabindex="-1">
      <div class="dialog-shell">
        <header class="dialog-header">
          <div>
            <p>Catálogo global</p>
            <h3>Permisos</h3>
          </div>

          <ToroDialogCloseButton @click="closePermissionCatalogDialog" />
        </header>

        <div class="permissions-dialog-toolbar catalog-permissions-toolbar">
          <label>
            <span>Buscar permiso</span>
            <input v-model="catalogSearchText" class="toro-field" type="search" autocomplete="off"
              placeholder="Nombre, descripción o módulo" />
          </label>

          <span><strong>{{ filteredCatalogPermissions.length }}</strong> permisos</span>
        </div>

        <div class="dialog-body catalog-grid-body">
          <ToroPermissionTree
            class="catalog-tree"
            :permissions="filteredCatalogPermissions"
            :search-text="catalogSearchText"
            empty-text="No existen permisos que coincidan con la búsqueda."
          />
        </div>
        <footer class="dialog-footer">
          <button type="button" class="toro-action toro-action-secondary" @click="closePermissionCatalogDialog">
  <ToroActionIcon action="close" />
            Cerrar
          </button>
        </footer>
      </div>
    </dialog>
  </section>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from "vue";
import ToroDataGrid from "@/components/grid/ToroDataGrid.vue";
import ToroGridActionsCell from "@/components/grid/ToroGridActionsCell.vue";
import ToroStatusBadgeCell from "@/components/grid/ToroStatusBadgeCell.vue";
import ToroPermissionTree from "@/components/tree/ToroPermissionTree.vue";
import ToroActionButton from "@/components/ui/ToroActionButton.vue";
import ToroContextMenu from "@/components/ui/ToroContextMenu.vue";
import ToroFormField from "@/components/ui/ToroFormField.vue";
import {
  groupPermissionsForPresentation,
  presentPermission,

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
import ToroDialogCloseButton from "@/components/ui/ToroDialogCloseButton.vue";
import { useToroToast } from "@/composables/useToroToast";
import ToroActionIcon from "@/components/ui/ToroActionIcon.vue";

const toast = useToroToast();

const authorizationStore = useAuthorizationStore();
const roles = ref([]);
const permissions = ref([]);
const selectedRole = ref(null);
const createRoleDialog = ref(null);
const roleDetailDialog = ref(null);
const editRoleDialog = ref(null);
const rolePermissionsDialog = ref(null);
const permissionCatalogDialog = ref(null);
const roleSearchText = ref("");
const roleStatusFilter = ref("all");
const permissionSearchText = ref("");
const catalogSearchText = ref("");
const roleContextMenu = ref(null);
const roleContextMenuState = ref({
  open: false,
  x: 0,
  y: 0,
  role: null,
});
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
const createRoleValidationAttempted = ref(false);
const createRoleForm = ref({
  code: "",
  name: "",
  description: "",
});

const editingRole = ref(false);
const updateRoleError = ref("");
const updateRoleMessage = ref("");
const editRoleValidationAttempted = ref(false);
const updateRoleForm = ref({
  name: "",
  description: "",
  isActive: true,
});

const filteredRoles = computed(() => {
  const search = roleSearchText.value.trim().toLowerCase();

  return roles.value.filter((role) => {
    const matchesSearch =
      search === "" ||
      [role.code, role.name, role.description]
        .filter((value) => typeof value === "string")
        .some((value) => value.toLowerCase().includes(search));

    const matchesStatus =
      roleStatusFilter.value === "all" ||
      (roleStatusFilter.value === "active" && role.isActive) ||
      (roleStatusFilter.value === "inactive" && !role.isActive);

    return matchesSearch && matchesStatus;
  });
});

const presentedPermissions = computed(() =>
  permissions.value.map((permission) => presentPermission(permission)),
);

const filteredCatalogPermissions = computed(() => {
  const search = catalogSearchText.value.trim().toLowerCase();

  if (search === "") {
    return presentedPermissions.value;
  }

  return presentedPermissions.value.filter((permission) =>
    [
      permission.moduleLabel,
      permission.displayName,
      permission.displayDescription,
    ].some((value) => value.toLowerCase().includes(search)),
  );
});

const gridComponents = {
  ToroGridActionsCell,
  ToroStatusBadgeCell,
};

const roleActionsCellStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  paddingLeft: "4px",
  paddingRight: "4px",
  overflow: "visible",
};

const gridContext = {
  source: "roles",
};

const roleContextMenuItems = computed(() => {
  const role = roleContextMenuState.value.role;

  if (!role) return [];

  return [
    {
      key: "view",
      label: "Ver rol",
      action: () => openRoleDetailDialog(role),
    },
    {
      key: "edit",
      label: "Editar rol",
      visible: canUpdateRoles.value,
      action: () => openEditRoleDialog(role),
    },
    {
      key: "permissions",
      label: "Asignar permisos",
      visible: canAssignPermissions.value,
      action: () => openRolePermissionsDialog(role),
    },
    {
      key: "toggle-status",
      label: role.isActive
        ? "Desactivar rol"
        : "Activar rol",
      visible: canUpdateRoles.value,
      disabled:
        role.code === "admin" &&
        role.isActive === true,
      variant:
        role.isActive
          ? "danger"
          : "default",
      action: () => toggleRoleStatus(role),
    },
  ];
});
const roleActions = computed(() => [
  {
    key: "view",
    label: "Ver",
    variant: "subtle",
    onClick: openRoleDetailDialog,
  },
  {
    key: "edit",
    label: "Editar",
    variant: "subtle",
    visible: () => canUpdateRoles.value,
    onClick: openEditRoleDialog,
  },
  {
    key: "permissions",
    label: "Permisos",
    variant: "accent",
    onClick: openRolePermissionsDialog,
  },
]);

const roleColumnDefs = computed(() => [
  {
    field: "code",
    headerName: "Código",
    sort: "asc",
    minWidth: 135,
    maxWidth: 200,
    flex: 0.75,
    cellClass: "toro-grid-code-cell",
  },
  {
    field: "name",
    headerName: "Nombre",
    minWidth: 220,
    flex: 1.2,
    cellClass: "toro-grid-strong-cell",
  },
  {
    field: "description",
    headerName: "Descripción",
    minWidth: 300,
    flex: 2,
    valueFormatter: ({ value }) => value || "Sin descripción",
    cellClass: "toro-grid-muted-cell",
  },
  {
    headerName: "Origen",
    minWidth: 125,
    maxWidth: 150,
    flex: 0.7,
    valueGetter: ({ data }) => data?.isSystem ? "Sistema" : "Configurable",
    headerClass: "toro-grid-centered-header",
    cellClass: "toro-grid-centered-cell",
    headerTooltip: "Sistema: administrado internamente por TORO. Configurable: creado y administrado desde esta pantalla.",
    filter: "agTextColumnFilter",
  },
  {
    headerName: "Estado",
    minWidth: 135,
    maxWidth: 155,
    flex: 0.65,
    valueGetter: ({ data }) => data?.isActive ? "Activo" : "Inactivo",
    filter: "agTextColumnFilter",
    cellClass: "toro-grid-status-cell",
    cellStyle: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      paddingLeft: "6px",
      paddingRight: "6px",
    },
    headerClass: "toro-grid-centered-header",
    cellRenderer: "ToroStatusBadgeCell",
  },
  {
    colId: "actions",
    headerName: "Acciones",
    minWidth: 255,
    maxWidth: 280,
    flex: 1,
    sortable: false,
    filter: false,
    resizable: false,
    suppressHeaderMenuButton: true,
    headerClass: "toro-grid-actions-header",
    cellClass: "toro-grid-actions-cell",
    cellStyle: roleActionsCellStyle,
    cellRenderer: "ToroGridActionsCell",
    cellRendererParams: {
      actions: roleActions.value,
    },
  },
]);

function getRoleRowId(params) {
  return String(params.data.id);
}

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

const createRoleCodeError = computed(() => {
  if (!createRoleValidationAttempted.value) {
    return "";
  }

  if (createRoleForm.value.code.trim() === "") {
    return "El campo Código es requerido.";
  }

  return "";
});

const createRoleNameError = computed(() => {
  if (!createRoleValidationAttempted.value) {
    return "";
  }

  if (createRoleForm.value.name.trim() === "") {
    return "El campo Nombre es requerido.";
  }

  return "";
});

const hasCreateRoleFieldErrors = computed(
  () =>
    createRoleCodeError.value !== "" ||
    createRoleNameError.value !== "",
);
const canSubmitCreateRole = computed(
  () =>
    canCreateRoles.value &&
    !creatingRole.value &&
    createRoleForm.value.code.trim() !== "" &&
    createRoleForm.value.name.trim() !== "",
);

const updateRoleNameError = computed(() => {
  if (!editRoleValidationAttempted.value) {
    return "";
  }

  if (updateRoleForm.value.name.trim() === "") {
    return "El campo Nombre es requerido.";
  }

  return "";
});
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

const filteredPermissionModules = computed(() => {
  const search = permissionSearchText.value.trim().toLowerCase();

  if (search === "") {
    return permissionModules.value;
  }

  return permissionModules.value
    .map((module) => ({
      ...module,
      permissions: module.permissions.filter((permission) =>
        [
          module.label,
          permission.displayName,
          permission.displayDescription,
        ].some((value) => value.toLowerCase().includes(search)),
      ),
    }))
    .filter((module) => module.permissions.length > 0);
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
      "Ya existe un rol con el código indicado.",
    ROLE_CODE_REQUIRED:
      "El código del rol es obligatorio.",
    ROLE_CODE_INVALID:
      "El código debe comenzar con una letra y solo puede contener letras minúsculas, números, puntos, guiones y guiones bajos.",
    ROLE_CODE_TOO_LONG:
      "El código no puede superar los 60 caracteres.",
    ROLE_NAME_REQUIRED:
      "El campo Nombre es requerido.",
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
  createRoleValidationAttempted.value = false;
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
  editRoleValidationAttempted.value = false;
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

function showDialog(dialogReference) {
  if (dialogReference.value?.open !== true) {
    dialogReference.value?.showModal();
  focusOpenedDialog(dialogReference);
  }
}

function closeDialog(dialogReference) {
  if (dialogReference.value?.open === true) {
    dialogReference.value.close();
  }
}

function openCreateRoleDialog() {
  resetCreateRoleForm();
  showDialog(createRoleDialog);
}

function closeCreateRoleDialog() {
  if (creatingRole.value) return;

  resetCreateRoleForm();
  closeDialog(createRoleDialog);
}

async function submitCreateRoleDialog() {
  createRoleValidationAttempted.value = true;
  createRoleError.value = "";
  createRoleMessage.value = "";

  if (hasCreateRoleFieldErrors.value) {
    return;
  }

  await createRole();

  if (createRoleError.value === "" && createRoleMessage.value !== "") {
    closeDialog(createRoleDialog);
  }
}

async function openRoleContextMenu({
  event,
  row,
}) {
  if (!event || !row) return;

  roleContextMenuState.value = {
    open: true,
    x: event.clientX,
    y: event.clientY,
    role: row,
  };

  await nextTick();
  roleContextMenu.value?.positionMenu?.();
}

function closeRoleContextMenu() {
  roleContextMenuState.value = {
    open: false,
    x: 0,
    y: 0,
    role: null,
  };
}

async function runRoleContextAction(item) {
  const action = item?.action;

  closeRoleContextMenu();

  if (typeof action === "function") {
    await action();
  }
}

async function toggleRoleStatus(role) {
  if (
    !role ||
    !canUpdateRoles.value ||
    editingRole.value
  ) {
    return;
  }

  if (
    role.code === "admin" &&
    role.isActive === true
  ) {
    errorMessage.value =
      "El rol administrador debe permanecer activo.";
    toast.error(errorMessage.value);
    return;
  }

  selectedRole.value = role;
  synchronizeUpdateRoleForm();
  updateRoleForm.value.isActive =
    !role.isActive;

  await updateRole();
}
function openRoleDetailDialog(role) {
  selectedRole.value = role;
  synchronizeUpdateRoleForm();
  showDialog(roleDetailDialog);
}

function closeRoleDetailDialog() {
  closeDialog(roleDetailDialog);
}

function openEditRoleDialog(role) {
  selectedRole.value = role;
  synchronizeUpdateRoleForm();
  showDialog(editRoleDialog);
}

function closeEditRoleDialog() {
  if (editingRole.value) return;

  discardRoleMetadataChanges();
  closeDialog(editRoleDialog);
}

async function submitEditRoleDialog() {
  editRoleValidationAttempted.value = true;
  updateRoleError.value = "";
  updateRoleMessage.value = "";

  if (updateRoleNameError.value !== "") {
    return;
  }

  await updateRole();

  if (updateRoleError.value === "" && updateRoleMessage.value !== "") {
    closeDialog(editRoleDialog);
  }
}

async function openRolePermissionsDialog(role) {
  if (savingPermissions.value || editingRole.value) return;

  selectedRole.value = role;
  synchronizeUpdateRoleForm();
  permissionSearchText.value = "";
  showDialog(rolePermissionsDialog);
  await loadAssignedPermissions();
}

function closeRolePermissionsDialog() {
  if (savingPermissions.value) return;

  discardPermissionChanges();
  permissionSearchText.value = "";
  closeDialog(rolePermissionsDialog);
}

async function submitRolePermissionsDialog() {
  await savePermissionChanges();

  if (savePermissionsError.value === "") {
    closeDialog(rolePermissionsDialog);
  }
}

function openPermissionCatalogDialog() {
  catalogSearchText.value = "";
  showDialog(permissionCatalogDialog);
}

function closePermissionCatalogDialog() {
  catalogSearchText.value = "";
  closeDialog(permissionCatalogDialog);
}

function getActiveModulePermissions(module) {
  return module.permissions.filter((permission) => permission.isActive);
}

function getSelectedModulePermissionCount(module) {
  return getActiveModulePermissions(module).filter((permission) =>
    isPermissionSelected(permission.id),
  ).length;
}

function areAllModulePermissionsSelected(module) {
  const activePermissions = getActiveModulePermissions(module);

  return (
    activePermissions.length > 0 &&
    activePermissions.every((permission) =>
      isPermissionSelected(permission.id),
    )
  );
}

function isModulePartiallySelected(module) {
  const selectedCount = getSelectedModulePermissionCount(module);
  const activeCount = getActiveModulePermissions(module).length;

  return selectedCount > 0 && selectedCount < activeCount;
}

function toggleModulePermissions(module) {
  if (!canAssignPermissions.value || savingPermissions.value) return;

  const activePermissionIds = getActiveModulePermissions(module).map(
    (permission) => permission.id,
  );

  if (activePermissionIds.length === 0) return;

  savePermissionsError.value = "";
  savePermissionsMessage.value = "";

  if (areAllModulePermissionsSelected(module)) {
    draftPermissionIds.value = draftPermissionIds.value.filter(
      (permissionId) => !activePermissionIds.includes(permissionId),
    );

    return;
  }

  draftPermissionIds.value = normalizePermissionIds([
    ...draftPermissionIds.value,
    ...activePermissionIds,
  ]);
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
    toast.error(assignedPermissionsError.value);
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

    toast.success(savePermissionsMessage.value);
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
    toast.error(savePermissionsError.value);
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

    toast.success(createRoleMessage.value);
  } catch (error) {
    createRoleError.value = getRoleErrorMessage(
      error,
      "No fue posible crear el rol.",
    );
    toast.error(createRoleError.value);
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

    toast.error(updateRoleError.value);
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

    toast.success(updateRoleMessage.value);
  } catch (error) {
    updateRoleError.value = getRoleErrorMessage(
      error,
      "No fue posible actualizar el rol.",
    );
    toast.error(updateRoleError.value);
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
    toast.error(errorMessage.value);

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

function focusOpenedDialog(dialogReference) {
  const dialog = dialogReference?.value;
  if (!dialog || dialog.open !== true) return;

  requestAnimationFrame(() => {
    dialog.focus({ preventScroll: true });
  });
}

</script>

<style scoped>
.roles-admin {
  display: grid;
  min-width: 0;
}

.roles-workspace {
  overflow: hidden;
  padding: 0;
}

.roles-toolbar {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) 180px auto auto;
  align-items: end;
  gap: var(--toro-space-3);
  padding: var(--toro-space-3) var(--toro-space-4);
  border-bottom: 1px solid var(--toro-color-border);
}

.roles-search,
.roles-status-filter,
.permissions-dialog-toolbar label {
  display: grid;
  gap: var(--toro-space-1);
  min-width: 0;
  color: var(--toro-color-text-muted);
  font-size: var(--toro-font-size-xs);
  font-weight: var(--toro-font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.roles-toolbar-summary {
  display: flex;
  align-items: center;
  gap: var(--toro-space-3);
  min-height: var(--toro-control-height);
  color: var(--toro-color-text-muted);
  font-size: var(--toro-font-size-sm);
  white-space: nowrap;
}

.roles-toolbar-summary span {
  display: inline-flex;
  align-items: baseline;
  gap: var(--toro-space-1);
}

.roles-toolbar-summary strong {
  color: var(--toro-color-text);
}

.roles-toolbar-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--toro-space-2);
  white-space: nowrap;
}

.roles-empty {
  margin: var(--toro-space-4);
}

.roles-table-wrapper,
.catalog-table-wrapper {
  overflow: auto;
}

.roles-table,
.catalog-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.roles-table th,
.roles-table td,
.catalog-table th,
.catalog-table td {
  padding: var(--toro-space-2) var(--toro-space-3);
  border-bottom: 1px solid var(--toro-color-border);
  text-align: left;
  vertical-align: middle;
}

.roles-table th,
.catalog-table th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--toro-color-surface-soft);
  color: var(--toro-color-text-muted);
  font-size: var(--toro-font-size-xs);
  font-weight: var(--toro-font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.roles-table tbody tr:hover,
.catalog-table tbody tr:hover {
  background: var(--toro-color-info-soft);
}

.roles-table th:nth-child(1) {
  width: 150px;
}

.roles-table th:nth-child(2) {
  width: 22%;
}

.roles-table th:nth-child(3) {
  width: auto;
}

.roles-table th:nth-child(4) {
  width: 130px;
}

.roles-table th:nth-child(5) {
  width: 110px;
}

.roles-table th:nth-child(6) {
  width: 240px;
}

.role-code-cell {
  display: inline-block;
  max-width: 100%;
  color: var(--toro-color-primary-strong);
  font-size: var(--toro-font-size-sm);
  font-weight: var(--toro-font-weight-bold);
  overflow-wrap: anywhere;
}

.role-name-cell {
  display: block;
  line-height: 1.3;
}

.role-description-cell {
  display: -webkit-box;
  color: var(--toro-color-text-muted);
  font-size: var(--toro-font-size-sm);
  line-height: 1.35;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.roles-row-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--toro-space-1);
}

.role-row-action {
  min-height: 32px;
  padding: 0 var(--toro-space-2);
  border: 1px solid transparent;
  border-radius: var(--toro-radius-md);
  background: transparent;
  color: var(--toro-color-primary-strong);
  font: inherit;
  font-size: var(--toro-font-size-sm);
  font-weight: var(--toro-font-weight-bold);
  cursor: pointer;
}

.role-row-action:hover {
  border-color: var(--toro-color-border);
  background: var(--toro-color-surface-soft);
}

.role-row-action-primary {
  color: var(--toro-color-accent-strong);
}

.toro-dialog {
  width: min(680px, calc(100vw - 32px));
  max-width: none;
  max-height: calc(100vh - 32px);
  padding: 0;
  border: 1px solid var(--toro-color-border-strong);
  border-radius: var(--toro-radius-md);
  background: var(--toro-color-surface);
  color: var(--toro-color-text);
  box-shadow: var(--toro-shadow-sm);
  overflow: hidden;
}

.toro-dialog::backdrop {
  background: rgb(13 36 58 / 48%);
  backdrop-filter: blur(2px);
}

.permissions-dialog,
.catalog-dialog {
  width: min(1120px, calc(100vw - 32px));
}

.dialog-shell {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  max-height: calc(100vh - 32px);
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--toro-space-3);
  padding: var(--toro-space-3) var(--toro-space-4);
  border-bottom: 1px solid var(--toro-color-border);
}

.dialog-header p {
  margin: 0 0 var(--toro-space-1);
  color: var(--toro-color-accent-strong);
  font-size: var(--toro-font-size-xs);
  font-weight: var(--toro-font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.dialog-header h3,
.permission-dialog-group h4 {
  margin: 0;
}

.dialog-close {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: var(--toro-color-surface-soft);
  color: var(--toro-color-text);
  font: inherit;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
}

.dialog-body {
  min-height: 0;
  padding: var(--toro-space-4);
  overflow: auto;
}

.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--toro-space-2);
  padding: var(--toro-space-3) var(--toro-space-4);
  border-top: 1px solid var(--toro-color-border);
  background: var(--toro-color-surface-soft);
}

.role-dialog-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--toro-space-3);
}

.role-dialog-form label {
  display: grid;
  align-content: start;
  gap: var(--toro-space-1);
}

.dialog-field-wide {
  grid-column: 1 / -1;
}

.role-dialog-form textarea {
  resize: vertical;
}

.role-active-option {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr);
  align-items: center;
}

.role-active-option input {
  width: 18px;
  height: 18px;
  accent-color: var(--toro-color-primary);
}

.role-detail-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.permissions-dialog-toolbar {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) auto;
  align-items: end;
  gap: var(--toro-space-3);
  padding: var(--toro-space-3) var(--toro-space-4);
  border-bottom: 1px solid var(--toro-color-border);
  background: var(--toro-color-surface-soft);
}

.permissions-dialog-toolbar>span {
  min-height: var(--toro-control-height);
  display: inline-flex;
  align-items: center;
  gap: var(--toro-space-1);
  color: var(--toro-color-text-muted);
  white-space: nowrap;
}

.permissions-dialog-body {
  display: grid;
  align-content: start;
  gap: var(--toro-space-3);
}

.permission-dialog-group {
  padding: 0;
  overflow: hidden;
}

.permission-dialog-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--toro-space-3);
  padding: var(--toro-space-2) var(--toro-space-3);
  background: var(--toro-color-surface-soft);
  border-bottom: 1px solid var(--toro-color-border);
}

.permission-dialog-group-header>div {
  display: flex;
  align-items: baseline;
  gap: var(--toro-space-2);
}

.permission-dialog-group-header span {
  color: var(--toro-color-text-muted);
  font-size: var(--toro-font-size-xs);
}

.permission-group-toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--toro-space-2);
  color: var(--toro-color-primary-strong);
  font-size: var(--toro-font-size-sm);
  font-weight: var(--toro-font-weight-bold);
  cursor: pointer;
  white-space: nowrap;
}

.permission-group-toggle input,
.permission-dialog-row>input {
  width: 18px;
  height: 18px;
  margin: 0;
  accent-color: var(--toro-color-primary);
}

.permission-dialog-row {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--toro-space-3);
  min-height: var(--toro-table-row-height);
  padding: var(--toro-space-2) var(--toro-space-3);
  border-bottom: 1px solid var(--toro-color-border);
  cursor: pointer;
}

.permission-dialog-row:last-child {
  border-bottom: 0;
}

.permission-dialog-row:hover,
.permission-dialog-row-selected {
  background: var(--toro-color-info-soft);
}

.permission-dialog-row-disabled {
  cursor: default;
  opacity: 0.66;
}

.permission-dialog-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.permission-dialog-copy small {
  color: var(--toro-color-text-muted);
  font-size: var(--toro-font-size-sm);
  line-height: 1.35;
}

.dialog-pending-status {
  margin-right: auto;
  color: var(--toro-color-text-muted);
  font-size: var(--toro-font-size-sm);
}

.catalog-table th:nth-child(1) {
  width: 22%;
}

.catalog-table th:nth-child(2) {
  width: 24%;
}

.catalog-table th:nth-child(4) {
  width: 110px;
}

.catalog-table td:nth-child(3) {
  color: var(--toro-color-text-muted);
  font-size: var(--toro-font-size-sm);
}

@media (max-width: 1050px) {
  .roles-toolbar {
    grid-template-columns: minmax(240px, 1fr) 160px;
  }

  .roles-toolbar-summary,
  .roles-toolbar-actions {
    justify-content: flex-start;
  }

  .roles-toolbar-actions {
    flex-wrap: wrap;
  }

  .roles-table {
    min-width: 960px;
  }
}

@media (max-width: 720px) {

  .roles-toolbar,
  .role-dialog-form,
  .permissions-dialog-toolbar {
    grid-template-columns: 1fr;
  }

  .roles-toolbar-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .roles-toolbar-actions .toro-action {
    width: 100%;
  }

  .role-detail-grid {
    grid-template-columns: 1fr;
  }

  .permission-dialog-group-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .permission-dialog-row {
    grid-template-columns: 24px minmax(0, 1fr);
  }

  .permission-dialog-row>.toro-badge {
    grid-column: 2;
    justify-self: start;
  }

  .dialog-footer {
    flex-wrap: wrap;
  }

  .dialog-pending-status {
    flex-basis: 100%;
  }
}

/* AG Grid integration and dialog corrections */

.roles-grid {
  border: 0;
  border-radius: 0;
}

.catalog-grid-body {
  min-height: 0;
  padding: var(--toro-space-3) var(--toro-space-4);
  overflow: hidden;
}

.catalog-grid {
  height: 100%;
  min-height: 0;
}

.catalog-dialog .dialog-shell {
  height: min(760px, calc(100vh - 32px));
}

.permissions-dialog .dialog-shell {
  height: min(820px, calc(100vh - 32px));
}

.permissions-dialog-body {
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
}

.permissions-dialog-toolbar {
  position: relative;
  z-index: 2;
}

.dialog-header {
  position: relative;
  z-index: 3;
  background: var(--toro-color-surface);
}

.dialog-footer {
  position: relative;
  z-index: 3;
}

.role-summary-card {
  display: grid;
  gap: var(--toro-space-4);
  padding: var(--toro-space-4);
}

.role-summary-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--toro-space-4);
  padding-bottom: var(--toro-space-3);
  border-bottom: 1px solid var(--toro-color-border);
}

.role-summary-heading h4 {
  margin: var(--toro-space-1) 0 0;
  font-size: var(--toro-font-size-lg);
}

.role-summary-heading p {
  margin: var(--toro-space-1) 0 0;
  color: var(--toro-color-text-muted);
  font-size: var(--toro-font-size-sm);
}

.role-summary-code {
  color: var(--toro-color-primary-strong);
  font-size: var(--toro-font-size-sm);
  font-weight: var(--toro-font-weight-bold);
  overflow-wrap: anywhere;
}

.role-summary-description {
  padding: var(--toro-space-3);
  border: 1px solid var(--toro-color-border);
  border-radius: var(--toro-radius-md);
  background: var(--toro-color-surface-soft);
}

.role-summary-description>span,
.role-summary-metadata dt {
  color: var(--toro-color-text-muted);
  font-size: var(--toro-font-size-xs);
  font-weight: var(--toro-font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.role-summary-description p {
  margin: var(--toro-space-2) 0 0;
  line-height: 1.5;
}

.role-summary-metadata {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--toro-space-3);
  margin: 0;
}

.role-summary-metadata>div {
  padding: var(--toro-space-3);
  border: 1px solid var(--toro-color-border);
  border-radius: var(--toro-radius-md);
}

.role-summary-metadata dd {
  margin: var(--toro-space-1) 0 0;
  font-weight: var(--toro-font-weight-bold);
}

.roles-admin :deep(.toro-grid-code-cell) {
  color: var(--toro-color-primary-strong);
  font-weight: var(--toro-font-weight-bold);
  overflow-wrap: anywhere;
}

.roles-admin :deep(.toro-grid-strong-cell) {
  font-weight: var(--toro-font-weight-bold);
}

.roles-admin :deep(.toro-grid-muted-cell) {
  color: var(--toro-color-text-muted);
}

.roles-admin :deep(.toro-grid-status-active),
.roles-admin :deep(.toro-grid-status-inactive) {
  justify-content: center;
  width: fit-content;
  height: 28px;
  margin-top: 10px;
  padding: 0 var(--toro-space-2);
  border-radius: 999px;
  font-size: var(--toro-font-size-sm);
  font-weight: var(--toro-font-weight-bold);
}

.roles-admin :deep(.toro-grid-status-active) {
  background: #e5f8ef;
  color: #237b68;
}

.roles-admin :deep(.toro-grid-status-inactive) {
  background: var(--toro-color-accent-soft);
  color: var(--toro-color-accent-strong);
}

@media (max-width: 720px) {
  .role-summary-metadata {
    grid-template-columns: 1fr;
  }

  .role-summary-heading {
    flex-direction: column;
  }
}

.roles-admin :deep(.toro-grid-actions-cell) {
  padding-inline: 4px;
}

.roles-admin :deep(.toro-grid-actions-cell .ag-cell-wrapper),
.roles-admin :deep(.toro-grid-actions-cell .ag-cell-value) {
  width: 100%;
  min-width: 0;
}

.roles-admin :deep(.toro-grid-actions-cell .ag-cell-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.roles-admin :deep(.toro-grid-actions-cell .ag-cell-value) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.roles-admin :deep(.toro-grid-actions-header .ag-header-cell-label) {
  justify-content: center;
  width: 100%;
}

.roles-admin :deep(.toro-grid-actions-header .ag-header-cell-text) {
  text-align: center;
}

/* TORO catalog dialog corrected layout */

.toro-catalog-layout {
  width: min(1180px, calc(100vw - 32px));
  max-width: none;
  height: min(820px, calc(100vh - 32px));
  max-height: calc(100vh - 32px);
  padding: 0;
  overflow: hidden;
}

.toro-catalog-layout .dialog-shell {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  max-height: none;
  margin: 0;
  overflow: hidden;
}

.toro-catalog-layout .dialog-header {
  position: relative;
  z-index: 4;
  flex: 0 0 auto;
  margin: 0;
}

.toro-catalog-layout .permissions-dialog-toolbar {
  position: relative;
  z-index: 3;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: var(--toro-space-3);
  flex: 0 0 auto;
  width: 100%;
  min-height: 0;
  margin: 0;
  padding: var(--toro-space-3) var(--toro-space-4);
  border-bottom: 1px solid var(--toro-color-border);
  background: var(--toro-color-surface-soft);
}

.toro-catalog-layout .permissions-dialog-toolbar > label {
  display: grid;
  gap: var(--toro-space-1);
  min-width: 0;
  margin: 0;
}

.toro-catalog-layout .permissions-dialog-toolbar > label > span {
  color: var(--toro-color-text-muted);
  font-size: var(--toro-font-size-xs);
  font-weight: var(--toro-font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.toro-catalog-layout .permissions-dialog-toolbar .toro-field {
  width: 100%;
}

.toro-catalog-layout .permissions-dialog-toolbar > span {
  align-self: end;
  min-height: var(--toro-control-height);
  display: inline-flex;
  align-items: center;
  gap: var(--toro-space-1);
  margin: 0;
  color: var(--toro-color-text-muted);
  white-space: nowrap;
}

.toro-catalog-layout .catalog-grid-body {
  display: flex;
  flex: 1 1 auto;
  width: 100%;
  min-width: 0;
  min-height: 0;
  margin: 0;
  padding: var(--toro-space-3) var(--toro-space-4);
  overflow: hidden;
  background: var(--toro-color-surface);
}

.toro-catalog-layout .catalog-grid {
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}

.toro-catalog-layout .dialog-footer {
  position: relative;
  z-index: 4;
  display: flex;
  justify-content: flex-end;
  flex: 0 0 auto;
  min-height: 0;
  margin: 0;
  padding: var(--toro-space-3) var(--toro-space-4);
  border-top: 1px solid var(--toro-color-border);
  background: var(--toro-color-surface);
}

@media (max-width: 720px) {
  .toro-catalog-layout {
    width: calc(100vw - 16px);
    height: calc(100vh - 16px);
    max-height: calc(100vh - 16px);
  }

  .toro-catalog-layout .permissions-dialog-toolbar {
    grid-template-columns: 1fr;
    align-items: stretch;
  }

  .toro-catalog-layout .permissions-dialog-toolbar > span {
    align-self: start;
    min-height: 0;
  }

  .toro-catalog-layout .catalog-grid-body {
    padding: var(--toro-space-2);
  }
}

/* TORO permission tree integration */

.role-permission-tree,
.catalog-tree {
  width: 100%;
  min-width: 0;
}

.role-permission-tree {
  padding: var(--toro-space-2);
}

.catalog-tree {
  height: 100%;
  min-height: 0;
  padding: var(--toro-space-2);
  overflow: auto;
}

.toro-catalog-layout .catalog-grid-body {
  padding: var(--toro-space-2) var(--toro-space-3);
}

.permissions-dialog-body {
  min-height: 0;
  overflow: auto;
}

/* TORO final direct visual adjustments */

.dialog-header :deep(.dialog-icon-close) {
  width: 36px;
  min-width: 36px;
  height: 36px;
  min-height: 36px;
  padding: 0;
  border-radius: 50%;
  font-size: 22px;
  line-height: 1;
}

.role-permissions-toolbar,
.catalog-permissions-toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: var(--toro-space-3);
  width: 100%;
  margin: 0;
  padding: var(--toro-space-3) var(--toro-space-4);
  border-top: 0;
  border-bottom: 1px solid var(--toro-color-border);
  background: var(--toro-color-surface-soft);
  box-shadow: none;
}

.role-permissions-toolbar > label,
.catalog-permissions-toolbar > label {
  display: grid;
  gap: var(--toro-space-1);
  min-width: 0;
  margin: 0;
}

.role-permissions-toolbar .toro-field,
.catalog-permissions-toolbar .toro-field {
  width: 100%;
  margin: 0;
  border-color: var(--toro-color-border-strong);
  background: var(--toro-color-surface);
  box-shadow: none;
}

.role-permissions-toolbar > span,
.catalog-permissions-toolbar > span {
  display: inline-flex;
  align-items: center;
  align-self: end;
  min-height: var(--toro-control-height);
  margin: 0;
  color: var(--toro-color-text-muted);
  white-space: nowrap;
}

.toro-grid-status-cell {
  padding-inline: 6px;
}

.toro-grid-status-cell .ag-cell-wrapper,
.toro-grid-status-cell .ag-cell-value {
  width: 100%;
  min-width: 0;
}

@media (max-width: 720px) {
  .role-permissions-toolbar,
  .catalog-permissions-toolbar {
    grid-template-columns: 1fr;
  }

  .role-permissions-toolbar > span,
  .catalog-permissions-toolbar > span {
    min-height: 0;
  }
}

/* TORO compact permission dialog layout */

.permissions-dialog,
.toro-catalog-layout {
  width: min(980px, calc(100vw - 32px));
  max-width: 980px;
}

.permissions-dialog .dialog-shell,
.toro-catalog-layout .dialog-shell {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: min(760px, calc(100vh - 32px));
  min-height: 0;
  max-height: calc(100vh - 32px);
  overflow: hidden;
}

.permissions-dialog .dialog-header,
.toro-catalog-layout .dialog-header,
.role-permissions-toolbar,
.catalog-permissions-toolbar,
.permissions-dialog .dialog-footer,
.toro-catalog-layout .dialog-footer {
  flex: 0 0 auto;
}

.role-permissions-toolbar,
.catalog-permissions-toolbar {
  position: relative;
  z-index: 3;
  width: 100%;
  min-height: 0;
  margin: 0;
  padding: var(--toro-space-3) var(--toro-space-4);
  overflow: visible;
  border-top: 0;
  border-bottom: 1px solid var(--toro-color-border);
  background: var(--toro-color-surface-soft);
}

.role-permissions-toolbar > label,
.catalog-permissions-toolbar > label {
  position: relative;
  z-index: 1;
  width: 100%;
  min-width: 0;
  margin: 0;
  padding: 0;
  background: transparent;
}

.role-permissions-toolbar .toro-field,
.catalog-permissions-toolbar .toro-field {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  margin: 0;
  background: var(--toro-color-surface);
}

.permissions-dialog-body,
.toro-catalog-layout .catalog-grid-body {
  display: block;
  flex: 1 1 auto;
  width: 100%;
  min-width: 0;
  min-height: 0;
  margin: 0;
  padding: var(--toro-space-2) var(--toro-space-3);
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-gutter: stable;
  overscroll-behavior: contain;
  background: var(--toro-color-surface);
}

.role-permission-tree,
.catalog-tree {
  display: block;
  width: 100%;
  max-width: none !important;
  height: auto;
  min-height: 0;
  padding: var(--toro-space-1);
  overflow: visible !important;
}

.role-permission-tree :deep(.toro-permission-tree),
.catalog-tree :deep(.toro-permission-tree) {
  width: 100%;
  max-width: none !important;
  height: auto;
  overflow: visible !important;
}

@media (max-width: 720px) {
  .permissions-dialog,
  .toro-catalog-layout {
    width: calc(100vw - 16px);
    max-width: none;
  }

  .permissions-dialog .dialog-shell,
  .toro-catalog-layout .dialog-shell {
    height: calc(100vh - 16px);
    max-height: calc(100vh - 16px);
  }
}

/* TORO role assignment code */

.permissions-dialog .dialog-header h3 {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: var(--toro-space-2);
}

.role-dialog-code {
  color: var(--toro-color-text-muted);
  font-size: var(--toro-font-size-sm);
  font-weight: var(--toro-font-weight-regular);
}

/* TORO dialog close icon and field validation */

.dialog-header :deep(.dialog-icon-close) {
  width: 36px;
  min-width: 36px;
  height: 36px;
  min-height: 36px;
  padding: 0;
  border-radius: 50%;
}

.dialog-header :deep(.dialog-icon-close .toro-action-button-label) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  overflow: visible;
}

.dialog-close-icon {
  display: block;
  width: 18px;
  height: 18px;
  pointer-events: none;
}

.toro-field-invalid {
  border-color: var(--toro-color-danger, #b42318);
  box-shadow: 0 0 0 3px rgb(180 35 24 / 12%);
}

.toro-field-error {
  display: block;
  margin-block-start: var(--toro-space-1);
  color: var(--toro-color-danger, #b42318);
  font-size: var(--toro-font-size-xs);
  font-weight: var(--toro-font-weight-bold);
  line-height: 1.35;
}

/* TORO final field validation and disabled appearance */

.role-dialog-form .toro-field:disabled,
.role-dialog-form .toro-field-disabled {
  border-color: var(--toro-color-border-strong);
  color: var(--toro-color-text-muted);
  background: var(--toro-color-surface-soft);
  box-shadow: inset 0 0 0 1px var(--toro-color-border);
  cursor: not-allowed;
  opacity: 0.72;
}

.role-dialog-form .toro-field-invalid {
  border-color: var(--toro-color-danger, #b42318);
  box-shadow: 0 0 0 3px rgb(180 35 24 / 12%);
}

.role-dialog-form .toro-field-error {
  display: block;
  margin-block-start: var(--toro-space-1);
  color: var(--toro-color-danger, #b42318);
  font-size: var(--toro-font-size-xs);
  font-weight: var(--toro-font-weight-bold);
  line-height: 1.35;
}

/* TORO centered grid columns */

.roles-grid :deep(.toro-grid-centered-cell) {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.roles-grid :deep(.toro-grid-centered-header .ag-header-cell-label) {
  justify-content: center;
  text-align: center;
}

/* TORO roles grid horizontal overflow control */

.roles-grid {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}

.roles-grid :deep(.ag-root-wrapper),
.roles-grid :deep(.ag-root),
.roles-grid :deep(.ag-body),
.roles-grid :deep(.ag-body-viewport),
.roles-grid :deep(.ag-center-cols-viewport) {
  min-width: 0;
  max-width: 100%;
}

.roles-grid :deep(.ag-body-viewport),
.roles-grid :deep(.ag-center-cols-viewport) {
  overflow-x: hidden;
}

.roles-grid :deep(.ag-body-horizontal-scroll) {
  display: none;
  min-height: 0;
  height: 0;
}

@media (max-width: 1100px) {
  .roles-grid {
    overflow: visible;
  }

  .roles-grid :deep(.ag-body-viewport),
  .roles-grid :deep(.ag-center-cols-viewport) {
    overflow-x: auto;
  }

  .roles-grid :deep(.ag-body-horizontal-scroll) {
    display: flex;
    min-height: var(--ag-scrollbar-size, 14px);
    height: var(--ag-scrollbar-size, 14px);
  }
}
</style>
