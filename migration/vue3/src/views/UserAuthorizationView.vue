<template>
  <section class="user-authorization-page">
    <div v-if="usersError" class="toro-message toro-message-error" role="alert">
      <strong>No fue posible cargar los usuarios.</strong>
      <span>{{ usersError }}</span>
    </div>

    <div v-if="usersLoading && !usersLoaded" class="toro-empty-state">
      Cargando usuarios y catálogos de autorización...
    </div>

    <section v-else class="toro-panel user-directory-panel">
      <header class="user-directory-toolbar">
        <ToroFormField
          label="Buscar usuario"
          field-id="user-authorization-search"
          help="Busca por nombre, usuario, correo, cargo o rol."
        >
          <input
            id="user-authorization-search"
            v-model="searchText"
            class="toro-field"
            type="search"
            autocomplete="off"
            placeholder="Nombre, usuario, correo, cargo o rol"
          />
        </ToroFormField>

        <ToroFormField label="Estado" field-id="user-authorization-status">
          <select id="user-authorization-status" v-model="userStatusFilter" class="toro-field">
            <option value="all">Todos</option>
            <option value="visible">Activos</option>
            <option value="hidden">Inactivos</option>
          </select>
        </ToroFormField>

        <div class="user-directory-summary" aria-live="polite">
          <span><strong>{{ filteredUsers.length }}</strong> resultados</span>
          <span><strong>{{ visibleUsersCount }}</strong> activos</span>
        </div>

        <div class="user-directory-actions">
          <button
            v-if="canCreateUsers"
            type="button"
            class="toro-action toro-action-primary"
            :disabled="usersLoading || authorizationLoading || savingRoles || savingOverrides"
            @click="openCreateUserDialog"
          >
            <ToroIcon name="person_add" :size="19" />
            Nuevo usuario
          </button>
          <button
            type="button"
            class="toro-action toro-action-primary"
            :disabled="usersLoading || authorizationLoading || savingRoles || savingOverrides"
            @click="loadUsers"
          >
            <ToroIcon name="refresh" :size="19" />
            {{ usersLoading ? "Actualizando..." : "Actualizar" }}
          </button>
        </div>
      </header>

      <div v-if="filteredUsers.length === 0" class="toro-empty-state user-directory-empty">
        No existen usuarios que coincidan con los filtros.
      </div>

      <ToroDataGrid
        v-else
        class="users-grid"
        :row-data="filteredUsers"
        :column-defs="userColumnDefs"
        :components="gridComponents"
        :context="gridContext"
        :get-row-id="getUserRowId"
        :quick-filter-text="searchText"
        :page-size="10"
        :page-size-selector="[10, 20, 50]"
        height="500px"
        empty-text="No existen usuarios que coincidan con los filtros."
        @row-context-menu="openUserContextMenu"
      />

      <ToroContextMenu
        ref="userContextMenu"
        :open="userContextMenuState.open"
        :x="userContextMenuState.x"
        :y="userContextMenuState.y"
        :items="userContextMenuItems"
        @close="closeUserContextMenu"
        @select="runUserContextAction"
      />
    </section>

    <UserIdentityDialog ref="userIdentityDialog" @saved="handleIdentitySaved" />

    <dialog ref="userDetailDialog" class="toro-dialog user-detail-dialog" tabindex="-1">
      <div class="dialog-shell">
        <header class="dialog-header">
          <div>
            <p>Detalle administrativo</p>
            <h3>{{ selectedUser?.name || "Usuario" }}</h3>
          </div>
          <ToroDialogCloseButton @click="closeUserDetailDialog" />
        </header>

        <div class="dialog-body">
          <div v-if="authorizationLoading" class="toro-empty-state">Consultando autorización...</div>
          <div v-else-if="authorizationError" class="toro-message toro-message-error" role="alert">
            {{ authorizationError }}
          </div>
          <div v-else-if="authorization" class="user-detail-content">
            <section class="user-detail-heading">
              <div class="user-avatar-large">{{ getUserInitials(authorization.user) }}</div>
              <div>
                <span class="user-detail-username">@{{ authorization.user.userName || "sin-usuario" }}</span>
                <h4>{{ authorization.user.name || "Sin nombre" }}</h4>
                <p>{{ authorization.user.position || "Sin cargo registrado" }}</p>
              </div>
              <span class="toro-badge" :class="authorization.user.hidden ? 'toro-badge-warning' : 'toro-badge-success'">
                {{ authorization.user.hidden ? "Inactivo" : "Activo" }}
              </span>
            </section>

            <dl class="user-detail-grid">
              <div><dt>Correo</dt><dd>{{ authorization.user.email || "Sin correo" }}</dd></div>
              <div><dt>Teléfono</dt><dd>{{ authorization.user.telephone || "Sin teléfono" }}</dd></div>
              <div><dt>Colegio</dt><dd>{{ authorization.user.collegeNumber || "Sin registro" }}</dd></div>
              <div><dt>Roles asignados</dt><dd>{{ authorization.assignedRoles.length }}</dd></div>
              <div><dt>Permisos heredados</dt><dd>{{ authorization.inheritedPermissions.length }}</dd></div>
              <div><dt>Excepciones</dt><dd>{{ authorization.permissionOverrides.length }}</dd></div>
            </dl>

            <section class="effective-context-card">
              <header>
                <div>
                  <span>Resultado efectivo</span>
                  <h4>Contexto de autorización</h4>
                </div>
              </header>
              <div v-if="authorization.context" class="effective-summary">
                <article><span>Roles efectivos</span><strong>{{ authorization.context.roles.length }}</strong></article>
                <article><span>Permisos efectivos</span><strong>{{ authorization.context.permissions.length }}</strong></article>
                <article><span>Denegados</span><strong>{{ authorization.context.deniedPermissions.length }}</strong></article>
              </div>
              <p v-else class="toro-empty-state">El usuario no dispone de un contexto efectivo activo.</p>
            </section>
          </div>
        </div>

        <footer class="dialog-footer">
          <button type="button" class="toro-action toro-action-secondary" @click="closeUserDetailDialog">
  <ToroActionIcon action="close" />Cerrar</button>
        </footer>
      </div>
    </dialog>

    <dialog ref="userRolesDialog" class="toro-dialog user-assignment-dialog" tabindex="-1">
      <div class="dialog-shell">
        <header class="dialog-header">
          <div>
            <p>Asignación directa</p>
            <h3>Roles de {{ selectedUser?.name || "Usuario" }}</h3>
          </div>
          <ToroDialogCloseButton @click="closeUserRolesDialog" />
        </header>

        <div class="dialog-toolbar">
          <ToroFormField label="Buscar rol" field-id="user-role-search">
            <input id="user-role-search" v-model="roleSearchText" class="toro-field" type="search" autocomplete="off" placeholder="Código, nombre o descripción" />
          </ToroFormField>
          <span><strong>{{ draftRoleIds.length }}</strong> seleccionados</span>
        </div>

        <div class="dialog-body assignment-dialog-body">
          <div v-if="authorizationLoading" class="toro-empty-state">Consultando roles...</div>
          <div v-else-if="authorizationError" class="toro-message toro-message-error" role="alert">{{ authorizationError }}</div>
          <template v-else-if="authorization">
            <div v-if="selectedUser?.hidden" class="toro-message toro-message-warning" role="status">
              Los usuarios inactivos permanecen visibles para consulta, pero no pueden modificarse.
            </div>
            <div v-else-if="!canAssignRoles" class="toro-empty-state">
              La cuenta actual puede consultar los roles, pero no modificarlos.
            </div>
            <div v-if="inactiveAssignedRoles.length > 0" class="toro-message toro-message-warning" role="status">
              Los roles inactivos se conservan para consulta y se retirarán al guardar.
            </div>
            <div v-if="filteredRolesForDialog.length === 0" class="toro-empty-state">No existen roles que coincidan con la búsqueda.</div>
            <div v-else class="role-assignment-list">
              <label
                v-for="role in filteredRolesForDialog"
                :key="role.id"
                class="role-assignment-option"
                :class="{
                  'role-assignment-option-selected': isRoleSelected(role.id),
                  'role-assignment-option-disabled': !role.isActive || selectedUser?.hidden,
                }"
              >
                <input
                  type="checkbox"
                  :checked="isRoleSelected(role.id)"
                  :disabled="!role.isActive || !canEditSelectedUser || !canAssignRoles || savingRoles"
                  @change="toggleRole(role)"
                />
                <span class="role-assignment-copy">
                  <strong>{{ role.name }}</strong>
                  <small>{{ role.code }} · {{ role.description || "Sin descripción" }}</small>
                </span>
                <span class="toro-badge" :class="role.isActive ? 'toro-badge-success' : 'toro-badge-warning'">
                  {{ role.isActive ? "Activo" : "Inactivo" }}
                </span>
              </label>
            </div>
            <div v-if="saveRolesError" class="toro-inline-message toro-message-error" role="alert">{{ saveRolesError }}</div>
            <div v-if="saveRolesMessage" class="toro-inline-message toro-message-success" role="status">{{ saveRolesMessage }}</div>
          </template>
        </div>

        <footer class="dialog-footer">
          <span class="dialog-pending-status">{{ hasRoleChanges ? "Existen cambios pendientes." : "Los roles están sincronizados." }}</span>
          <button type="button" class="toro-action toro-action-secondary" :disabled="savingRoles" @click="closeUserRolesDialog">
  <ToroActionIcon action="cancel" />Cancelar</button>
          <button
            v-if="canAssignRoles"
            type="button"
            class="toro-action toro-action-primary"
            :disabled="!canEditSelectedUser || !hasRoleChanges || savingRoles"
            @click="submitUserRolesDialog"
          >
  <ToroActionIcon action="assignRoles" />
            {{ savingRoles ? "Guardando..." : "Guardar roles" }}
          </button>
        </footer>
      </div>
    </dialog>

    <dialog ref="userOverridesDialog" class="toro-dialog user-overrides-dialog" tabindex="-1">
      <div class="dialog-shell">
        <header class="dialog-header">
          <div>
            <p>Excepciones individuales</p>
            <h3>Permisos de {{ selectedUser?.name || "Usuario" }}</h3>
          </div>
          <ToroDialogCloseButton @click="closeUserOverridesDialog" />
        </header>

        <div class="dialog-toolbar overrides-toolbar">
          <ToroFormField label="Buscar permiso" field-id="user-permission-search">
            <input id="user-permission-search" v-model="permissionSearchText" class="toro-field" type="search" autocomplete="off" placeholder="Módulo, nombre o descripción" />
          </ToroFormField>
          <ToroFormField label="Estado" field-id="user-override-filter">
            <select id="user-override-filter" v-model="overrideStatusFilter" class="toro-field">
              <option value="all">Todos</option>
              <option value="inherited">Sin override</option>
              <option value="allow">Permitir</option>
              <option value="deny">Denegar</option>
            </select>
          </ToroFormField>
          <span><strong>{{ draftOverrides.length }}</strong> excepciones</span>
        </div>

        <div class="dialog-body overrides-dialog-body">
          <div v-if="authorizationLoading" class="toro-empty-state">Consultando permisos...</div>
          <div v-else-if="authorizationError" class="toro-message toro-message-error" role="alert">{{ authorizationError }}</div>
          <template v-else-if="authorization">
            <details class="override-explanation">
              <summary><span>¿Qué cambia una excepción individual?</span><small>Sin override usa los roles; Permitir concede; Denegar bloquea.</small></summary>
              <div class="override-explanation-body">
                <p>Cada permiso parte del resultado heredado de los roles. Una excepción cambia solamente ese permiso para este usuario.</p>
                <dl>
                  <div><dt>Sin override</dt><dd>Conserva el resultado heredado de los roles asignados.</dd></div>
                  <div><dt>Permitir</dt><dd>Concede el permiso directamente, aunque ningún rol activo lo otorgue.</dd></div>
                  <div><dt>Denegar</dt><dd>Bloquea el permiso directamente y prevalece sobre los roles.</dd></div>
                </dl>
              </div>
            </details>
            <div v-if="selectedUser?.hidden" class="toro-message toro-message-warning" role="status">
              Los usuarios inactivos permanecen visibles para consulta, pero no pueden modificarse.
            </div>
            <div v-else-if="!canAssignPermissionOverrides" class="toro-empty-state">
              La cuenta actual puede consultar las excepciones, pero no modificarlas.
            </div>
            <div v-if="inactivePermissionOverrides.length > 0" class="toro-message toro-message-warning" role="status">
              Las excepciones inactivas se conservan para consulta y se retirarán al guardar.
            </div>
            <div v-if="filteredPermissionModules.length === 0" class="toro-empty-state">No existen permisos que coincidan con los filtros.</div>
            <details v-for="module in filteredPermissionModules" :key="module.key" class="override-module-card" open>
              <summary class="override-module-summary">
                <div><span>Módulo</span><h4>{{ module.label }}</h4></div>
                <strong>{{ module.permissions.length }}</strong>
              </summary>
              <div
                v-for="permission in module.permissions"
                :key="permission.id"
                class="override-option"
                :class="{ 'override-option-disabled': !permission.isActive || selectedUser?.hidden }"
              >
                <span class="override-option-copy">
                  <strong>{{ permission.displayName }}</strong>
                  <small>{{ permission.displayDescription }}</small>
                </span>
                <select
                  :value="getPermissionOverrideEffect(permission.id)"
                  :disabled="!permission.isActive || !canEditSelectedUser || !canAssignPermissionOverrides || savingOverrides"
                  @change="setPermissionOverride(permission, $event.target.value)"
                >
                  <option value="">Sin override</option>
                  <option :value="PermissionEffect.Allow">Permitir</option>
                  <option :value="PermissionEffect.Deny">Denegar</option>
                </select>
                <span class="toro-badge" :class="getOverrideBadgeClass(permission.id)">
                  {{ getOverrideLabel(permission.id) }}
                </span>
              </div>
            </details>
            <div v-if="saveOverridesError" class="toro-inline-message toro-message-error" role="alert">{{ saveOverridesError }}</div>
            <div v-if="saveOverridesMessage" class="toro-inline-message toro-message-success" role="status">{{ saveOverridesMessage }}</div>
          </template>
        </div>

        <footer class="dialog-footer">
          <span class="dialog-pending-status">{{ hasOverrideChanges ? "Existen cambios pendientes." : "Las excepciones están sincronizadas." }}</span>
          <button type="button" class="toro-action toro-action-secondary" :disabled="savingOverrides" @click="closeUserOverridesDialog">
  <ToroActionIcon action="cancel" />Cancelar</button>
          <button
            v-if="canAssignPermissionOverrides"
            type="button"
            class="toro-action toro-action-primary"
            :disabled="!canEditSelectedUser || !hasOverrideChanges || savingOverrides"
            @click="submitUserOverridesDialog"
          >
  <ToroActionIcon action="assignPermissions" />
            {{ savingOverrides ? "Guardando..." : "Guardar excepciones" }}
          </button>
        </footer>
      </div>
    </dialog>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { nextTick } from "vue";
import ToroDataGrid from "@/components/grid/ToroDataGrid.vue";
import ToroGridActionsCell from "@/components/grid/ToroGridActionsCell.vue";
import ToroStatusBadgeCell from "@/components/grid/ToroStatusBadgeCell.vue";
import ToroContextMenu from "@/components/ui/ToroContextMenu.vue";
import ToroFormField from "@/components/ui/ToroFormField.vue";
import ToroIcon from "@/components/ui/ToroIcon.vue";
import UserIdentityDialog from "@/components/security/UserIdentityDialog.vue";
import {
    formatPermissionCode,
    getPermissionDisplayName,
    getPermissionModuleLabel,
    groupPermissionsForPresentation,

} from "@/presentation/permissionPresentation";
import {
    getAuthorizationPermissions,
    getAuthorizationRoles,
    getAuthorizationUsers,
    getUserAuthorization,
    replaceUserPermissionOverrides,
    replaceUserRoles,
} from "@/services/authorizationService";
import { PermissionEffect } from "@/models/authorization";
import { useAuthorizationStore } from "@/stores/authorization";
import ToroDialogCloseButton from "@/components/ui/ToroDialogCloseButton.vue";
import { useToroToast } from "@/composables/useToroToast";
import ToroActionIcon from "@/components/ui/ToroActionIcon.vue";

const toast = useToroToast();

const authorizationStore = useAuthorizationStore();
const users = ref([]);
const selectedUser = ref(null);
const authorization = ref(null);
const searchText = ref("");
const usersLoading = ref(false);
const usersLoaded = ref(false);
const usersError = ref("");
const authorizationLoading = ref(false);
const authorizationError = ref("");
let authorizationRequestId = 0;
const roles = ref([]);
const rolesError = ref("");
const savedRoleIds = ref([]);
const draftRoleIds = ref([]);
const savingRoles = ref(false);
const saveRolesError = ref("");
const saveRolesMessage = ref("");
const permissions = ref([]);
const permissionsError = ref("");
const savedOverrides = ref([]);
const draftOverrides = ref([]);
const savingOverrides = ref(false);
const saveOverridesError = ref("");
const saveOverridesMessage = ref("");
const userDetailDialog = ref(null);
const userRolesDialog = ref(null);
const userOverridesDialog = ref(null);
const userIdentityDialog = ref(null);
const userContextMenu = ref(null);
const userStatusFilter = ref("all");
const roleSearchText = ref("");
const permissionSearchText = ref("");
const overrideStatusFilter = ref("all");
const userContextMenuState = ref({
  open: false,
  x: 0,
  y: 0,
  user: null,
});

const visibleUsersCount = computed(
    () => users.value.filter((user) => !user.hidden).length,
);

const canCreateUsers = computed(() =>
  authorizationStore.hasPermission("security.users.create"),
);

const canUpdateUsers = computed(() =>
  authorizationStore.hasPermission("security.users.update"),
);

const canAssignRoles = computed(() =>
    authorizationStore.hasPermission(
        "security.users.assign-roles",
    ),
);

const hasRoleChanges = computed(
    () =>
        normalizeRoleIds(draftRoleIds.value).join(",") !==
        normalizeRoleIds(savedRoleIds.value).join(","),
);

const inactiveAssignedRoles = computed(
    () =>
        authorization.value?.assignedRoles.filter(
            (role) => !role.isActive,
        ) ?? [],
);

const canAssignPermissionOverrides = computed(() =>
    authorizationStore.hasPermission(
        "security.users.assign-permissions",
    ),
);

const hasOverrideChanges = computed(
    () =>
        serializeOverrides(draftOverrides.value) !==
        serializeOverrides(savedOverrides.value),
);

const inactivePermissionOverrides = computed(
    () =>
        authorization.value?.permissionOverrides.filter(
            (override) => !override.permission.isActive,
        ) ?? [],
);

const permissionModules = computed(() =>
    groupPermissionsForPresentation(
        permissions.value,
    ),
);

const filteredUsers = computed(() => {
  const filter = searchText.value.trim().toLowerCase();

  return users.value.filter((user) => {
    const matchesStatus =
      userStatusFilter.value === "all" ||
      (userStatusFilter.value === "visible" && !user.hidden) ||
      (userStatusFilter.value === "hidden" && user.hidden);

    const matchesSearch =
      filter === "" ||
      [
        user.name,
        user.userName,
        user.email,
        user.position,
        user.collegeNumber,
        user.roles,
      ].some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(filter),
      );

    return matchesStatus && matchesSearch;
  });
});

const canEditSelectedUser = computed(
  () => selectedUser.value !== null && selectedUser.value.hidden !== true,
);

const filteredRolesForDialog = computed(() => {
  const search = roleSearchText.value.trim().toLowerCase();
  if (search === "") return roles.value;

  return roles.value.filter((role) =>
    [role.code, role.name, role.description]
      .filter((value) => typeof value === "string")
      .some((value) => value.toLowerCase().includes(search)),
  );
});

const filteredPermissionModules = computed(() => {
  const search = permissionSearchText.value.trim().toLowerCase();

  return permissionModules.value
    .map((module) => ({
      ...module,
      permissions: module.permissions.filter((permission) => {
        const effect = getPermissionOverrideEffect(permission.id);
        const matchesEffect =
          overrideStatusFilter.value === "all" ||
          (overrideStatusFilter.value === "inherited" && effect === "") ||
          effect === overrideStatusFilter.value;
        const matchesSearch =
          search === "" ||
          [
            module.label,
            permission.displayName,
            permission.displayDescription,
          ].some((value) => value.toLowerCase().includes(search));

        return matchesEffect && matchesSearch;
      }),
    }))
    .filter((module) => module.permissions.length > 0);
});

const gridComponents = {
  ToroGridActionsCell,
  ToroStatusBadgeCell,
};

const gridContext = {
  source: "user-authorization",
};

const userActions = computed(() => [
  {
    key: "view",
    label: "Ver",
    icon: "visibility",
    variant: "subtle",
    onClick: openUserDetailDialog,
  },
  {
    key: "edit",
    label: "Editar",
    icon: "edit",
    variant: "subtle",
    visible: () => canUpdateUsers.value,
    onClick: openEditUserDialog,
  },
  {
    key: "state",
    label: "Estado",
    icon: "manage_accounts",
    variant: "subtle",
    visible: () => canUpdateUsers.value,
    onClick: openUserStateDialog,
  },
  {
    key: "roles",
    label: "Roles",
    icon: "badge",
    variant: "subtle",
    visible: () => canAssignRoles.value,
    disabled: (user) => user?.hidden === true,
    onClick: openUserRolesDialog,
  },
  {
    key: "permissions",
    label: "Permisos",
    icon: "shield_person",
    variant: "accent",
    visible: () => canAssignPermissionOverrides.value,
    disabled: (user) => user?.hidden === true,
    onClick: openUserOverridesDialog,
  },
]);

const userColumnDefs = computed(() => [
  {
    field: "userName",
    headerName: "Usuario",
    sort: "asc",
    minWidth: 170,
    flex: 0.9,
    cellClass: "toro-grid-code-cell",
  },
  {
    field: "name",
    headerName: "Nombre",
    minWidth: 220,
    flex: 1.2,
    valueFormatter: ({ value }) => value || "Sin nombre",
    cellClass: "toro-grid-strong-cell",
  },
  {
    field: "email",
    headerName: "Correo",
    minWidth: 230,
    flex: 1.2,
    valueFormatter: ({ value }) => value || "Sin correo",
    cellClass: "toro-grid-muted-cell",
  },
  {
    field: "position",
    headerName: "Cargo",
    minWidth: 180,
    flex: 0.9,
    valueFormatter: ({ value }) => value || "Sin cargo",
  },
  {
    field: "roles",
    headerName: "Roles",
    minWidth: 170,
    flex: 0.8,
    valueFormatter: ({ value }) => value || "Sin roles",
  },
  {
    headerName: "Estado",
    minWidth: 125,
    maxWidth: 145,
    flex: 0.6,
    valueGetter: ({ data }) => (data?.hidden ? "Inactivo" : "Activo"),
    filter: "agTextColumnFilter",
    headerClass: "toro-grid-centered-header",
    cellClass: "toro-grid-status-cell",
    cellRenderer: "ToroStatusBadgeCell",
  },
  {
    colId: "actions",
    headerName: "Acciones",
    width: 215,
    minWidth: 215,
    maxWidth: 215,
    flex: 0,
    sortable: false,
    filter: false,
    resizable: false,
    suppressHeaderMenuButton: true,
    headerClass: "toro-grid-actions-header",
    cellClass: "toro-grid-actions-cell",
    cellRenderer: "ToroGridActionsCell",
    cellRendererParams: {
      actions: userActions.value,
    },
    pinned: "right",
    lockPinned: true,
    suppressMovable: true,
  },
]);

const userContextMenuItems = computed(() => {
  const user = userContextMenuState.value.user;
  if (!user) return [];

  return [
    {
      key: "view",
      label: "Ver autorización",
      action: () => openUserDetailDialog(user),
    },
    {
      key: "edit",
      label: "Editar datos",
      visible: canUpdateUsers.value,
      action: () => openEditUserDialog(user),
    },
    {
      key: "state",
      label: user.hidden ? "Reactivar usuario" : "Inactivar usuario",
      visible: canUpdateUsers.value,
      action: () => openUserStateDialog(user),
    },
    {
      key: "roles",
      label: "Editar roles",
      visible: canAssignRoles.value,
      disabled: user.hidden === true,
      action: () => openUserRolesDialog(user),
    },
    {
      key: "permissions",
      label: "Editar permisos individuales",
      visible: canAssignPermissionOverrides.value,
      disabled: user.hidden === true,
      action: () => openUserOverridesDialog(user),
    },
  ];
});

function getUserRowId(params) {
  return String(params.data.id);
}

function normalizeRoleIds(roleIds) {
    return Array.from(
        new Set(
            roleIds.filter(
                (roleId) =>
                    Number.isInteger(roleId) &&
                    roleId > 0,
            ),
        ),
    ).sort((left, right) => left - right);
}

function isRoleSelected(roleId) {
    return draftRoleIds.value.includes(roleId);
}

function toggleRole(role) {
    if (
        !canAssignRoles.value ||
        !role.isActive ||
        savingRoles.value
    ) {
        return;
    }

    saveRolesError.value = "";
    saveRolesMessage.value = "";

    if (isRoleSelected(role.id)) {
        draftRoleIds.value = draftRoleIds.value.filter(
            (roleId) => roleId !== role.id,
        );

        return;
    }

    draftRoleIds.value = normalizeRoleIds([
        ...draftRoleIds.value,
        role.id,
    ]);
}

function discardRoleChanges() {
    draftRoleIds.value = [
        ...savedRoleIds.value,
    ];

    saveRolesError.value = "";
    saveRolesMessage.value = "";
}

function synchronizeAssignedRoles() {
    const assignedRoles =
        authorization.value?.assignedRoles ?? [];

    savedRoleIds.value = normalizeRoleIds(
        assignedRoles
            .filter((role) => role.isActive)
            .map((role) => role.id),
    );

    draftRoleIds.value = [
        ...savedRoleIds.value,
    ];

    saveRolesError.value = "";
    saveRolesMessage.value = "";
}

function normalizeOverrides(overrides) {
    const normalized = [];
    const permissionIds = new Set();

    for (const override of overrides) {
        if (
            !override ||
            !Number.isInteger(override.permissionId) ||
            override.permissionId <= 0 ||
            (
                override.effect !== PermissionEffect.Allow &&
                override.effect !== PermissionEffect.Deny
            ) ||
            permissionIds.has(override.permissionId)
        ) {
            continue;
        }

        permissionIds.add(override.permissionId);

        normalized.push({
            permissionId: override.permissionId,
            effect: override.effect,
        });
    }

    return normalized.sort(
        (left, right) =>
            left.permissionId - right.permissionId,
    );
}

function serializeOverrides(overrides) {
    return normalizeOverrides(overrides)
        .map(
            (override) =>
                `${override.permissionId}:${override.effect}`,
        )
        .join(",");
}

function getPermissionOverrideEffect(permissionId) {
    return (
        draftOverrides.value.find(
            (override) =>
                override.permissionId === permissionId,
        )?.effect ?? ""
    );
}

function setPermissionOverride(permission, effect) {
    if (
        !canAssignPermissionOverrides.value ||
        !permission.isActive ||
        savingOverrides.value
    ) {
        return;
    }

    saveOverridesError.value = "";
    saveOverridesMessage.value = "";

    const remainingOverrides =
        draftOverrides.value.filter(
            (override) =>
                override.permissionId !== permission.id,
        );

    if (
        effect === PermissionEffect.Allow ||
        effect === PermissionEffect.Deny
    ) {
        remainingOverrides.push({
            permissionId: permission.id,
            effect,
        });
    }

    draftOverrides.value =
        normalizeOverrides(remainingOverrides);
}

function discardOverrideChanges() {
    draftOverrides.value =
        savedOverrides.value.map((override) => ({
            ...override,
        }));

    saveOverridesError.value = "";
    saveOverridesMessage.value = "";
}

function synchronizePermissionOverrides() {
    const currentOverrides =
        authorization.value?.permissionOverrides ?? [];

    savedOverrides.value = normalizeOverrides(
        currentOverrides
            .filter(
                (override) =>
                    override.permission.isActive,
            )
            .map((override) => ({
                permissionId: override.permission.id,
                effect: override.effect,
            })),
    );

    draftOverrides.value =
        savedOverrides.value.map((override) => ({
            ...override,
        }));

    saveOverridesError.value = "";
    saveOverridesMessage.value = "";
}

function getUserInitials(user) {
    const source =
        user?.name?.trim() ||
        user?.userName?.trim() ||
        "U";

    return source
        .split(/\s+/)
        .filter((part) => part !== "")
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
}

function openCreateUserDialog() {
  userIdentityDialog.value?.openCreate();
}

function openEditUserDialog(user) {
  userIdentityDialog.value?.openEdit(user);
}

function openUserStateDialog(user) {
  userIdentityDialog.value?.openState(user);
}

async function handleIdentitySaved({ user }) {
  await loadUsers();
  if (!user?.id) return;
  const refreshed = users.value.find((item) => item.id === user.id);
  if (refreshed) selectedUser.value = refreshed;
}

function showDialog(dialogReference) {
  const dialog = dialogReference.value;
  if (!dialog || dialog.open === true) return;

  dialog.showModal();
  requestAnimationFrame(() => {
    dialog.focus({ preventScroll: true });
  });
}

function closeDialog(dialogReference) {
  if (dialogReference.value?.open === true) {
    dialogReference.value.close();
  }
}

async function prepareSelectedUser(user) {
  if (!user) return false;

  if (selectedUser.value?.id !== user.id || !authorization.value) {
    selectedUser.value = user;
    await loadSelectedUserAuthorization();
  }

  return selectedUser.value?.id === user.id;
}

async function openUserContextMenu({ event, row }) {
  if (!event || !row) return;

  userContextMenuState.value = {
    open: true,
    x: event.clientX,
    y: event.clientY,
    user: row,
  };

  await nextTick();
  userContextMenu.value?.positionMenu?.();
}

function closeUserContextMenu() {
  userContextMenuState.value = {
    open: false,
    x: 0,
    y: 0,
    user: null,
  };
}

async function runUserContextAction(item) {
  const action = item?.action;
  closeUserContextMenu();
  if (typeof action === "function") await action();
}

async function openUserDetailDialog(user) {
  if (!(await prepareSelectedUser(user))) return;
  showDialog(userDetailDialog);
}

function closeUserDetailDialog() {
  closeDialog(userDetailDialog);
}

async function openUserRolesDialog(user) {
  if (user?.hidden || savingRoles.value || savingOverrides.value) return;
  if (!(await prepareSelectedUser(user))) return;
  roleSearchText.value = "";
  showDialog(userRolesDialog);
}

function closeUserRolesDialog() {
  if (savingRoles.value) return;
  discardRoleChanges();
  roleSearchText.value = "";
  closeDialog(userRolesDialog);
}

async function submitUserRolesDialog() {
  await saveRoleChanges();
  if (saveRolesError.value === "") closeDialog(userRolesDialog);
}

async function openUserOverridesDialog(user) {
  if (user?.hidden || savingRoles.value || savingOverrides.value) return;
  if (!(await prepareSelectedUser(user))) return;
  permissionSearchText.value = "";
  overrideStatusFilter.value = "all";
  showDialog(userOverridesDialog);
}

function closeUserOverridesDialog() {
  if (savingOverrides.value) return;
  discardOverrideChanges();
  permissionSearchText.value = "";
  overrideStatusFilter.value = "all";
  closeDialog(userOverridesDialog);
}

async function submitUserOverridesDialog() {
  await saveOverrideChanges();
  if (saveOverridesError.value === "") closeDialog(userOverridesDialog);
}

function getOverrideLabel(permissionId) {
  const effect = getPermissionOverrideEffect(permissionId);
  if (effect === PermissionEffect.Allow) return "Permitir";
  if (effect === PermissionEffect.Deny) return "Denegar";
  return "Según roles";
}

function getOverrideBadgeClass(permissionId) {
  const effect = getPermissionOverrideEffect(permissionId);
  if (effect === PermissionEffect.Allow) return "toro-badge-success";
  if (effect === PermissionEffect.Deny) return "toro-badge-danger";
  return "toro-badge-neutral";
}

async function selectUser(user) {
    if (
        selectedUser.value?.id === user.id ||
        authorizationLoading.value ||
        savingRoles.value ||
        savingOverrides.value
    ) {
        return;
    }

    selectedUser.value = user;
    await loadSelectedUserAuthorization();
}

async function loadSelectedUserAuthorization() {
    const user = selectedUser.value;
    const requestId = ++authorizationRequestId;

    authorization.value = null;
    authorizationError.value = "";
    savedRoleIds.value = [];
    draftRoleIds.value = [];
    saveRolesError.value = "";
    saveRolesMessage.value = "";
    savedOverrides.value = [];
    draftOverrides.value = [];
    saveOverridesError.value = "";
    saveOverridesMessage.value = "";

    if (!user) {
        authorizationLoading.value = false;
        return;
    }

    authorizationLoading.value = true;

    try {
        const loadedAuthorization =
            await getUserAuthorization(user.id);

        if (
            requestId !== authorizationRequestId ||
            selectedUser.value?.id !== user.id
        ) {
            return;
        }

        if (!loadedAuthorization) {
            authorizationError.value =
                "El backend no devolvió una autorización válida.";

            toast.error(authorizationError.value);
            return;
        }

        authorization.value = loadedAuthorization;

        synchronizeAssignedRoles();
        synchronizePermissionOverrides();
    } catch (error) {
        if (
            requestId !== authorizationRequestId ||
            selectedUser.value?.id !== user.id
        ) {
            return;
        }

        authorizationError.value =
            typeof error?.message === "string"
                ? error.message
                : "No fue posible consultar la autorización del usuario.";
        toast.error(authorizationError.value);
    } finally {
        if (requestId === authorizationRequestId) {
            authorizationLoading.value = false;
        }
    }
}

async function saveRoleChanges() {
    const user = selectedUser.value;

    if (
        !user ||
        user.hidden ||
        !canAssignRoles.value ||
        !hasRoleChanges.value ||
        savingRoles.value
    ) {
        return;
    }

    savingRoles.value = true;
    saveRolesError.value = "";
    saveRolesMessage.value = "";

    try {
        const assignedRoles = await replaceUserRoles(user.id, draftRoleIds.value,);
    applyAssignedRolesToUserRow(user.id, assignedRoles);

        await loadSelectedUserAuthorization();

        if (
            authorizationStore.userId === user.id
        ) {
            await authorizationStore.loadContext({
                force: true,
            });
        }

        saveRolesMessage.value =
            "Los roles del usuario fueron actualizados.";

        toast.success(saveRolesMessage.value);
    } catch (error) {
        const backendMessage =
            typeof error?.message === "string"
                ? error.message
                : "";

        const messages = {
            LAST_ADMIN_ROLE_REQUIRED:
                "No es posible retirar el rol administrador porque no existe otro administrador visible.",
            ROLES_NOT_FOUND_OR_INACTIVE:
                "Uno o más roles no existen o están inactivos.",
            USER_NOT_FOUND:
                "El usuario seleccionado ya no existe.",
            USER_ID_INVALID:
                "El identificador del usuario no es válido.",
            ROLE_ID_INVALID:
                "Uno de los identificadores de rol no es válido.",
        };

        saveRolesError.value =
            messages[backendMessage] ||
            backendMessage ||
            "No fue posible guardar los roles del usuario.";
        toast.error(saveRolesError.value);
    } finally {
        savingRoles.value = false;
    }
}

async function saveOverrideChanges() {
    const user = selectedUser.value;

    if (
        !user ||
        user.hidden ||
        !canAssignPermissionOverrides.value ||
        !hasOverrideChanges.value ||
        savingOverrides.value
    ) {
        return;
    }

    savingOverrides.value = true;
    saveOverridesError.value = "";
    saveOverridesMessage.value = "";

    try {
        await replaceUserPermissionOverrides(
            user.id,
            draftOverrides.value,
        );

        await loadSelectedUserAuthorization();

        if (authorizationStore.userId === user.id) {
            await authorizationStore.loadContext({
                force: true,
            });
        }

        saveOverridesMessage.value =
            "Las excepciones del usuario fueron actualizadas.";

        toast.success(saveOverridesMessage.value);
    } catch (error) {
        const backendMessage =
            typeof error?.message === "string"
                ? error.message
                : "";

        const messages = {
            PERMISSIONS_NOT_FOUND_OR_INACTIVE:
                "Uno o más permisos no existen o están inactivos.",
            PERMISSION_OVERRIDE_DUPLICATED:
                "No puede registrarse más de una excepción para el mismo permiso.",
            PERMISSION_EFFECT_INVALID:
                "El efecto seleccionado no es válido.",
            PERMISSION_ID_INVALID:
                "Uno de los identificadores de permiso no es válido.",
            USER_NOT_FOUND:
                "El usuario seleccionado ya no existe.",
            USER_ID_INVALID:
                "El identificador del usuario no es válido.",
        };

        saveOverridesError.value =
            messages[backendMessage] ||
            backendMessage ||
            "No fue posible guardar las excepciones del usuario.";
        toast.error(saveOverridesError.value);
    } finally {
        savingOverrides.value = false;
    }
}

async function loadUsers() {
    if (usersLoading.value) {
        return;
    }

    const selectedUserId = selectedUser.value?.id ?? null;

    usersLoading.value = true;
    usersError.value = "";

    try {
        const [
            loadedUsers,
            loadedRoles,
            loadedPermissions,
        ] = await Promise.all([
            getAuthorizationUsers(),
            getAuthorizationRoles(),
            getAuthorizationPermissions(),
        ]);

        users.value = loadedUsers;
        roles.value = loadedRoles;
        permissions.value = loadedPermissions;
        rolesError.value = "";
        permissionsError.value = "";

        selectedUser.value =
            loadedUsers.find(
                (user) => user.id === selectedUserId,
            ) ??
            loadedUsers[0] ??
            null;

        await loadSelectedUserAuthorization();

        usersLoaded.value = true;
    } catch (error) {
        usersError.value =
            typeof error?.message === "string"
                ? error.message
                : "No fue posible cargar los usuarios.";
        toast.error(usersError.value);

        if (!usersLoaded.value) {
            users.value = [];
            roles.value = [];
            rolesError.value =
                "No fue posible cargar el catálogo de roles.";
            toast.error(rolesError.value);
            permissions.value = [];
            permissionsError.value =
                "No fue posible cargar el catálogo de permisos.";
            toast.error(permissionsError.value);
            savedOverrides.value = [];
            draftOverrides.value = [];
            selectedUser.value = null;
            authorization.value = null;
            savedRoleIds.value = [];
            draftRoleIds.value = [];
            authorizationRequestId += 1;
        }
    } finally {
        usersLoading.value = false;
    }
}

onMounted(loadUsers);

function applyAssignedRolesToUserRow(userId, assignedRoles) {
  const normalizedRoles = Array.isArray(assignedRoles) ? assignedRoles : [];
  const roleCodes = normalizedRoles.map((role) => role.code).join(", ");
  users.value = users.value.map((user) =>
    user.id === userId
      ? { ...user, assignedRoles: normalizedRoles, roles: roleCodes }
      : user,
  );

  if (selectedUser.value?.id === userId) {
    selectedUser.value = users.value.find((user) => user.id === userId) ?? null;
  }
}
</script>

<style scoped>

.user-security-header p {
    margin: 0;
}

.user-security-header button {
    min-height: var(--toro-control-height);
    padding: 0 var(--toro-space-4);
    border: 0;
    border-radius: var(--toro-radius-md);
    color: var(--toro-color-text-inverse);
    background: var(--toro-color-primary);
    cursor: pointer;
    font-weight: var(--toro-font-weight-bold);
}

.user-security-header button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

.user-security-metrics small {
    color: var(--toro-color-text-muted);
}

.user-security-metrics strong {
    color: var(--toro-color-primary-strong);
    font-size: 20px;
}

.user-security-grid {
    display: grid;
    grid-template-columns: minmax(310px, 0.72fr) minmax(480px, 1.28fr);
    gap: var(--toro-space-3);
    align-items: start;
}

.user-security-panel-heading h3 {
    margin: 0;
}

.user-security-panel-heading h3 {
    margin-top: var(--toro-space-1);
    color: var(--toro-color-primary-strong);
}

.user-search {
    display: grid;
    gap: var(--toro-space-2);
    margin-bottom: var(--toro-space-3);
}

.user-list {
    display: grid;
    max-height: 660px;
    gap: var(--toro-space-2);
    overflow-y: auto;
    padding-right: var(--toro-space-1);
}

.user-list-item {
    display: flex;
    width: 100%;
    min-height: 66px;
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

.user-list-avatar {
    display: grid;
    width: 40px;
    height: 40px;
    flex: 0 0 40px;
    place-items: center;
    border-radius: var(--toro-radius-md);
    color: var(--toro-color-primary-strong);
    background: var(--toro-color-info-soft);
    font-size: var(--toro-font-size-sm);
    font-weight: var(--toro-font-weight-heavy);
}

.user-list-copy small {
    color: var(--toro-color-text-muted);
}

.authorization-badge-deny {
    color: var(--toro-color-danger);
    background: var(--toro-color-danger-soft);
}

.user-detail div {
    min-width: 0;
    padding: var(--toro-space-3);
    border: 1px solid var(--toro-color-border);
    border-radius: var(--toro-radius-md);
    background: var(--toro-color-surface-soft);
}

.user-detail dd {
    overflow-wrap: anywhere;
    margin: var(--toro-space-1) 0 0;
    font-weight: var(--toro-font-weight-medium);
}

.authorization-section {
    display: grid;
    gap: var(--toro-space-3);
    margin-top: var(--toro-space-4);
    padding-top: var(--toro-space-4);
    border-top: 1px solid var(--toro-color-border);
}

.authorization-section>header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--toro-space-3);
}

.authorization-section h4,
.authorization-section p {
    margin: 0;
}

.authorization-section h4 {
    margin-top: var(--toro-space-1);
    color: var(--toro-color-primary-strong);
}

.authorization-section header p {
    color: var(--toro-color-accent);
    font-size: var(--toro-font-size-xs);
    font-weight: var(--toro-font-weight-heavy);
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.authorization-section header>span {
    padding: 5px 9px;
    border-radius: 999px;
    color: var(--toro-color-primary-strong);
    background: var(--toro-color-surface-soft);
    font-weight: var(--toro-font-weight-bold);
}

.authorization-list strong {
    overflow-wrap: anywhere;
}

.authorization-list small {
    color: var(--toro-color-text-muted);
}

.role-assignment-option {
    display: flex;
    min-height: var(--toro-table-row-height);
    align-items: center;
    gap: var(--toro-space-3);
    padding: var(--toro-space-3);
    border: 1px solid var(--toro-color-border);
    border-radius: var(--toro-radius-md);
    background: var(--toro-color-surface);
    cursor: pointer;
}

.role-assignment-option-selected {
    border-color: var(--toro-color-primary);
    background: var(--toro-color-selection-soft);
}

.role-assignment-option input {
    width: 16px;
    height: 16px;
    flex: 0 0 16px;
    accent-color: var(--toro-color-primary);
}

.role-assignment-copy strong,
.role-assignment-copy small {
    overflow-wrap: anywhere;
}

.role-assignment-copy small {
    color: var(--toro-color-text-muted);
}

.role-assignment-actions>span {
    color: var(--toro-color-text-muted);
}

.role-assignment-button:disabled {
    cursor: not-allowed;
    opacity: 0.55;
}

.override-module header>span {
    color: var(--toro-color-text-muted);
    font-weight: var(--toro-font-weight-bold);
}

.override-option {
    display: grid;
    min-height: var(--toro-table-row-height);
    grid-template-columns: minmax(0, 1fr) 150px auto;
    align-items: center;
    gap: var(--toro-space-3);
    padding: var(--toro-space-2) var(--toro-space-3);
    border-top: 1px solid var(--toro-color-border);
}

.override-option-disabled {
    opacity: 0.68;
}

.override-option-copy strong {
    overflow-wrap: anywhere;
}

.override-option-copy small {
    color: var(--toro-color-text-muted);
}

.override-option select {
    width: 100%;
    min-height: var(--toro-control-height);
    padding: 0 var(--toro-space-2);
    border: 1px solid var(--toro-color-border-strong);
    border-radius: var(--toro-radius-md);
    color: var(--toro-color-text);
    background: var(--toro-color-surface);
}

.override-option select:disabled {
    cursor: not-allowed;
}

.override-actions>span {
    color: var(--toro-color-text-muted);
}

.override-button:disabled {
    cursor: not-allowed;
    opacity: 0.55;
}

.effective-summary {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--toro-space-2);
}

.effective-summary article {
    display: grid;
    gap: var(--toro-space-1);
    padding: var(--toro-space-3);
    border: 1px solid var(--toro-color-border);
    border-radius: var(--toro-radius-md);
    background: var(--toro-color-surface-soft);
}

.effective-summary span {
    color: var(--toro-color-text-muted);
    font-size: var(--toro-font-size-xs);
}

.effective-summary strong {
    color: var(--toro-color-primary-strong);
    font-size: 18px;
}

.effective-columns {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--toro-space-3);
}

.effective-columns section {
    min-width: 0;
    padding: var(--toro-space-3);
    border: 1px solid var(--toro-color-border);
    border-radius: var(--toro-radius-md);
    background: var(--toro-color-surface-soft);
}

.effective-columns h5 {
    margin: 0 0 var(--toro-space-2);
    color: var(--toro-color-primary-strong);
}

.effective-columns ul {
    display: grid;
    gap: var(--toro-space-1);
    margin: 0;
    padding-left: var(--toro-space-5);
}

.effective-columns li {
    overflow-wrap: anywhere;
}

.effective-columns p {
    margin: 0;
    color: var(--toro-color-text-muted);
}

.user-security-empty-compact {
    padding: var(--toro-space-4);
}

@media (max-width: 1080px) {
    .user-security-metrics {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .user-security-grid {
        grid-template-columns: 1fr;
    }

    .user-list {
        max-height: 420px;
    }
}

@media (max-width: 620px) {

    .user-security-header button {
        width: 100%;
    }

    .user-security-metrics,
    .user-detail,
    .effective-summary,
    .effective-columns {
        grid-template-columns: 1fr;
    }

    .role-assignment-actions>div {
        display: grid;
        grid-template-columns: 1fr 1fr;
    }

    .override-option {
        grid-template-columns: 1fr;
        align-items: stretch;
    }

    .override-actions>div {
        display: grid;
        grid-template-columns: 1fr 1fr;
    }
}

/* TORO user authorization visual management */
.user-authorization-page {
  display: grid;
  min-width: 0;
}

.user-directory-panel {
  overflow: hidden;
  padding: 0;
}

.user-directory-toolbar {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) 180px auto auto;
  align-items: start;
  gap: var(--toro-space-3);
  padding: var(--toro-space-3) var(--toro-space-4);
  border-bottom: 1px solid var(--toro-color-border);
}

.user-directory-summary {
  display: flex;
  margin-top: 7px;
  align-items: center;
  gap: var(--toro-space-3);
  min-height: var(--toro-control-height);
  color: var(--toro-color-text-muted);
  font-size: var(--toro-font-size-sm);
  white-space: nowrap;
}

.user-directory-summary span {
  display: inline-flex;
  align-items: baseline;
  gap: var(--toro-space-1);
}

.user-directory-summary strong {
  color: var(--toro-color-text);
}

.user-directory-actions {
  display: flex;
  margin-top: 7px;
  justify-content: flex-end;
}

.user-directory-empty {
  margin: var(--toro-space-4);
}

.users-grid {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  border: 0;
  border-radius: 0;
}

.user-authorization-page :deep(.toro-grid-code-cell) {
  color: var(--toro-color-primary-strong);
  font-weight: var(--toro-font-weight-bold);
  overflow-wrap: anywhere;
}

.user-authorization-page :deep(.toro-grid-strong-cell) {
  font-weight: var(--toro-font-weight-bold);
}

.user-authorization-page :deep(.toro-grid-muted-cell) {
  color: var(--toro-color-text-muted);
}

.user-authorization-page :deep(.toro-grid-centered-header .ag-header-cell-label),
.user-authorization-page :deep(.toro-grid-actions-header .ag-header-cell-label) {
  justify-content: center;
}

.user-authorization-page :deep(.toro-grid-status-cell),
.user-authorization-page :deep(.toro-grid-actions-cell) {
  justify-content: center;
}

.toro-dialog {
  width: min(720px, calc(100vw - 32px));
  max-width: none;
  max-height: calc(100vh - 32px);
  padding: 0;
  border: 1px solid var(--toro-color-border-strong);
  border-radius: var(--toro-radius-md);
  background: var(--toro-color-surface);
  color: var(--toro-color-text);
  box-shadow: var(--toro-shadow-md);
  overflow: hidden;
}

.toro-dialog::backdrop {
  background: color-mix(in srgb, var(--toro-color-sidebar-strong) 48%, transparent);
  backdrop-filter: blur(2px);
}

.user-assignment-dialog,
.user-overrides-dialog {
  width: min(980px, calc(100vw - 32px));
}

.dialog-shell {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: calc(100vh - 32px);
  overflow: hidden;
}

.user-assignment-dialog .dialog-shell,
.user-overrides-dialog .dialog-shell {
  height: min(760px, calc(100vh - 32px));
}

.dialog-header {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: var(--toro-space-3);
  padding: var(--toro-space-3) var(--toro-space-4);
  border-bottom: 1px solid var(--toro-color-border);
  background: var(--toro-color-surface);
}

.dialog-header p,
.dialog-header h3 {
  margin: 0;
}

.dialog-header p {
  margin-bottom: var(--toro-space-1);
  color: var(--toro-color-accent-strong);
  font-size: var(--toro-font-size-xs);
  font-weight: var(--toro-font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.dialog-close {
  display: grid;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--toro-color-surface-soft);
  color: var(--toro-color-text);
  font: inherit;
  font-size: 24px;
  cursor: pointer;
}

.dialog-toolbar {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) auto;
  flex: 0 0 auto;
  align-items: end;
  gap: var(--toro-space-3);
  padding: var(--toro-space-3) var(--toro-space-4);
  border-bottom: 1px solid var(--toro-color-border);
  background: var(--toro-color-surface-soft);
}

.overrides-toolbar {
  grid-template-columns: minmax(280px, 1fr) 180px auto;
}

.dialog-toolbar > span {
  display: inline-flex;
  align-items: center;
  align-self: end;
  gap: var(--toro-space-1);
  min-height: var(--toro-control-height);
  color: var(--toro-color-text-muted);
  white-space: nowrap;
}

.dialog-body {
  flex: 1 1 auto;
  min-height: 0;
  padding: var(--toro-space-4);
  overflow: auto;
  scrollbar-gutter: stable;
}

.assignment-dialog-body,
.overrides-dialog-body {
  display: grid;
  align-content: start;
  gap: var(--toro-space-3);
}

.dialog-footer {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: flex-end;
  gap: var(--toro-space-2);
  padding: var(--toro-space-3) var(--toro-space-4);
  border-top: 1px solid var(--toro-color-border);
  background: var(--toro-color-surface-soft);
}

.dialog-pending-status {
  margin-right: auto;
  color: var(--toro-color-text-muted);
  font-size: var(--toro-font-size-sm);
}

.user-detail-content {
  display: grid;
  gap: var(--toro-space-4);
}

.user-detail-heading {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--toro-space-3);
  padding-bottom: var(--toro-space-3);
  border-bottom: 1px solid var(--toro-color-border);
}

.user-avatar-large {
  display: grid;
  width: 56px;
  height: 56px;
  place-items: center;
  border-radius: var(--toro-radius-md);
  background: var(--toro-color-info-soft);
  color: var(--toro-color-primary-strong);
  font-weight: var(--toro-font-weight-heavy);
}

.user-detail-heading h4,
.user-detail-heading p {
  margin: 0;
}

.user-detail-heading p,
.user-detail-username {
  color: var(--toro-color-text-muted);
  font-size: var(--toro-font-size-sm);
}

.user-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--toro-space-3);
  margin: 0;
}

.user-detail-grid > div,
.effective-context-card {
  padding: var(--toro-space-3);
  border: 1px solid var(--toro-color-border);
  border-radius: var(--toro-radius-md);
  background: var(--toro-color-surface-soft);
}

.user-detail-grid dt,
.effective-context-card header span {
  color: var(--toro-color-text-muted);
  font-size: var(--toro-font-size-xs);
  font-weight: var(--toro-font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.user-detail-grid dd {
  margin: var(--toro-space-1) 0 0;
  font-weight: var(--toro-font-weight-bold);
  overflow-wrap: anywhere;
}

.effective-context-card {
  display: grid;
  gap: var(--toro-space-3);
}

.effective-context-card h4 {
  margin: var(--toro-space-1) 0 0;
}

.role-assignment-list {
  display: grid;
  gap: var(--toro-space-2);
}

.role-assignment-option {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--toro-space-3);
  min-height: var(--toro-table-row-height);
  padding: var(--toro-space-3);
  border: 1px solid var(--toro-color-border);
  border-radius: var(--toro-radius-md);
  background: var(--toro-color-surface);
  cursor: pointer;
}

.role-assignment-option-selected {
  border-color: var(--toro-color-primary);
  background: var(--toro-color-selection-soft);
}

.role-assignment-option-disabled {
  cursor: default;
  opacity: 0.68;
}

.role-assignment-option input {
  width: 18px;
  height: 18px;
  margin: 0;
  accent-color: var(--toro-color-primary);
}

.role-assignment-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.role-assignment-copy small,
.override-option-copy small {
  color: var(--toro-color-text-muted);
  font-size: var(--toro-font-size-sm);
}

.override-module-card {
  overflow: hidden;
  border: 1px solid var(--toro-color-border);
  border-radius: var(--toro-radius-md);
  background: var(--toro-color-surface);
}

.override-module-card > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--toro-space-3);
  padding: var(--toro-space-2) var(--toro-space-3);
  border-bottom: 1px solid var(--toro-color-border);
  background: var(--toro-color-surface-soft);
}

.override-module-card header span {
  color: var(--toro-color-text-muted);
  font-size: var(--toro-font-size-xs);
  font-weight: var(--toro-font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.override-module-card h4 {
  margin: var(--toro-space-1) 0 0;
}

.override-option {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 160px 100px;
  align-items: center;
  gap: var(--toro-space-3);
  min-height: var(--toro-table-row-height);
  padding: var(--toro-space-2) var(--toro-space-3);
  border-bottom: 1px solid var(--toro-color-border);
}

.override-option:last-child {
  border-bottom: 0;
}

.override-option-disabled {
  opacity: 0.68;
}

.override-option-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.override-option select {
  width: 100%;
  min-height: var(--toro-control-height);
  padding-inline: var(--toro-space-2);
  border: 1px solid var(--toro-color-border-strong);
  border-radius: var(--toro-radius-md);
  background: var(--toro-color-surface);
  color: var(--toro-color-text);
}

@media (max-width: 1050px) {
  .user-directory-toolbar {
    grid-template-columns: minmax(240px, 1fr) 170px;
  }

  .user-directory-summary,
  .user-directory-actions {
    justify-content: flex-start;
  }

  .users-grid {
    overflow: visible;
  }
}

@media (max-width: 720px) {
  .user-directory-toolbar,
  .dialog-toolbar,
  .overrides-toolbar,
  .user-detail-grid {
    grid-template-columns: 1fr;
  }

  .user-assignment-dialog,
  .user-overrides-dialog,
  .user-detail-dialog {
    width: calc(100vw - 16px);
  }

  .user-assignment-dialog .dialog-shell,
  .user-overrides-dialog .dialog-shell {
    height: calc(100vh - 16px);
    max-height: calc(100vh - 16px);
  }

  .user-detail-heading {
    grid-template-columns: 48px minmax(0, 1fr);
  }

  .user-detail-heading > .toro-badge {
    grid-column: 2;
    justify-self: start;
  }

  .override-option {
    grid-template-columns: 1fr;
    align-items: stretch;
  }

  .role-assignment-option {
    grid-template-columns: 24px minmax(0, 1fr);
  }

  .role-assignment-option > .toro-badge {
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

/* TORO pinned actions and override guidance */
.users-grid :deep(.ag-pinned-right-header),
.users-grid :deep(.ag-pinned-right-cols-container) {
  border-left: 1px solid var(--toro-color-border-strong);
  box-shadow: calc(var(--toro-space-1) * -1) 0 var(--toro-space-3) var(--toro-shadow-panel-soft);
}

.override-explanation {
  display: grid;
  gap: var(--toro-space-2);
  padding: var(--toro-space-3);
  border: 1px solid var(--toro-color-border);
  border-radius: var(--toro-radius-md);
  background: var(--toro-color-info-soft);
}

.override-explanation h4,
.override-explanation p,
.override-explanation dl,
.override-explanation dd {
  margin: 0;
}

.override-explanation p,
.override-explanation dd {
  color: var(--toro-color-text-secondary);
  font-size: var(--toro-font-size-sm);
  line-height: 1.45;
}

.override-explanation dl {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--toro-space-2);
}

.override-explanation dl > div {
  padding: var(--toro-space-2);
  border: 1px solid var(--toro-color-border);
  border-radius: var(--toro-radius-sm);
  background: var(--toro-color-surface);
}

.override-explanation dt {
  margin-bottom: var(--toro-space-1);
  color: var(--toro-color-primary-strong);
  font-size: var(--toro-font-size-sm);
  font-weight: var(--toro-font-weight-bold);
}

@media (max-width: 720px) {
  .override-explanation dl {
    grid-template-columns: 1fr;
  }

  .user-directory-summary,
  .user-directory-actions {
    margin-top: 0;
  }
}

.dialog-close-icon { display: block; width: 18px; height: 18px; pointer-events: none; }
.override-explanation { padding: 0; }
.override-explanation > summary { display: flex; align-items: center; justify-content: space-between; gap: var(--toro-space-3); padding: var(--toro-space-3); color: var(--toro-color-primary-strong); font-weight: var(--toro-font-weight-bold); cursor: pointer; list-style: none; }
.override-explanation > summary::-webkit-details-marker, .override-module-summary::-webkit-details-marker { display: none; }
.override-explanation > summary::after, .override-module-summary::after { content: "\2304"; color: var(--toro-color-primary-strong); font-size: var(--toro-font-size-lg); transition: transform 160ms ease; }
.override-explanation[open] > summary::after, .override-module-card[open] > .override-module-summary::after { transform: rotate(180deg); }
.override-explanation > summary small { margin-left: auto; color: var(--toro-color-text-muted); font-size: var(--toro-font-size-sm); font-weight: var(--toro-font-weight-regular); }
.override-explanation-body { display: grid; gap: var(--toro-space-2); padding: 0 var(--toro-space-3) var(--toro-space-3); }
.override-module-card { overflow: visible; }
.override-module-summary { display: grid; grid-template-columns: minmax(0, 1fr) auto 18px; align-items: center; gap: var(--toro-space-3); padding: var(--toro-space-2) var(--toro-space-3); border-bottom: 1px solid var(--toro-color-border); background: var(--toro-color-surface-soft); cursor: pointer; list-style: none; }
.override-module-card:not([open]) > .override-module-summary { border-bottom: 0; }
@media (max-width: 720px) { .override-explanation > summary { align-items: flex-start; flex-direction: column; } .override-explanation > summary small { margin-left: 0; } }
</style>