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
            <div v-if="filteredUsers.length === 0" class="toro-empty-state user-directory-empty">
        No existen usuarios que coincidan con los filtros.
      </div>

            <BioNexusDataGrid
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
        :search-enabled="true"
        v-model:search-model-value="searchText"
        search-placeholder="Buscar usuario"
        :refresh-enabled="true"
        :refreshing="usersLoading"
        :refresh-disabled="authorizationLoading || savingRoles || savingOverrides"
        @refresh="loadUsers"
      >
        <template #actions>
          <button
            v-if="canCreateUsers"
            type="button"
            class="toro-action toro-action-primary"
            :disabled="usersLoading || authorizationLoading || savingRoles || savingOverrides"
            @click="openCreateUserDialog"
          >
            <BioNexusIcon name="person_add" :size="19" />
            <span>Nuevo usuario</span>
          </button>
        </template>
      </BioNexusDataGrid>

      <BioNexusContextMenu
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

        <UserDetailDialog
      ref="userDetailDialog"
      :authorization="authorization"
      :loading="authorizationLoading"
      :error-message="authorizationError"
    />

        <UserRolesDialog
      ref="userRolesDialog"
      :user="selectedUser"
      :authorization="authorization"
      :roles="roles"
      :draft-role-ids="draftRoleIds"
      :loading="authorizationLoading"
      :error-message="authorizationError"
      :save-error="saveRolesError"
      :save-message="saveRolesMessage"
      :saving="savingRoles"
      :can-assign="canAssignRoles"
      :can-edit="canEditSelectedUser"
      :has-changes="hasRoleChanges"
      :inactive-assigned-count="inactiveAssignedRoles.length"
      @toggle-role="toggleRole"
      @cancel="discardRoleChanges"
      @save="submitUserRolesDialog"
    />

    <UserOverridesDialog
      ref="userOverridesDialog"
      :user="selectedUser"
      :authorization="authorization"
      :permissions="permissions"
      :draft-overrides="draftOverrides"
      :loading="authorizationLoading"
      :error-message="authorizationError"
      :save-error="saveOverridesError"
      :save-message="saveOverridesMessage"
      :saving="savingOverrides"
      :can-assign="canAssignPermissionOverrides"
      :can-edit="canEditSelectedUser"
      :has-changes="hasOverrideChanges"
      :inactive-override-count="inactivePermissionOverrides.length"
      @set-override="setPermissionOverride"
      @cancel="discardOverrideChanges"
      @save="submitUserOverridesDialog"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { nextTick } from "vue";
import BioNexusDataGrid from "@/components/grid/BioNexusDataGrid.vue";
import BioNexusGridToggleCell from "@/components/grid/BioNexusGridToggleCell.vue";
import BioNexusGridActionsCell from "@/components/grid/BioNexusGridActionsCell.vue";
import BioNexusOptionFilter from "@/components/grid/BioNexusOptionFilter.vue";
import BioNexusContextMenu from "@/components/ui/BioNexusContextMenu.vue";
import BioNexusIcon from "@/components/ui/BioNexusIcon.vue";
import UserIdentityDialog from "@/components/security/UserIdentityDialog.vue";
import UserDetailDialog from "@/components/security/UserDetailDialog.vue";
import UserRolesDialog from "@/components/security/UserRolesDialog.vue";
import UserOverridesDialog from "@/components/security/UserOverridesDialog.vue";
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
import { useBioNexusToast } from "@/composables/useBioNexusToast";

const toast = useBioNexusToast();

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
const userContextMenuState = ref({
  open: false,
  x: 0,
  y: 0,
  user: null,
});

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

const filteredUsers = computed(() => {
  const filter = searchText.value.trim().toLowerCase();

  return users.value.filter((user) =>
    filter === "" ||
    [user.name, user.userName, user.email, user.position, user.collegeNumber, user.roles]
      .some((value) => typeof value === "string" && value.toLowerCase().includes(filter)),
  );
});

const canEditSelectedUser = computed(
  () => selectedUser.value !== null && selectedUser.value.hidden !== true,
);

const gridComponents = {
  BioNexusGridActionsCell,
  BioNexusOptionFilter,
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

const cargoFilterOptions = computed(() =>
  Array.from(new Set(users.value.map((user) => user.position || "Sin cargo")))
    .sort((left, right) => left.localeCompare(right, "es"))
    .map((value) => ({ value, label: value })),
);

const roleFilterOptions = computed(() =>
  Array.from(new Set(users.value.map((user) => user.roles || "Sin roles")))
    .sort((left, right) => left.localeCompare(right, "es"))
    .map((value) => ({ value, label: value })),
);

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
    valueGetter: ({ data }) => data?.position || "Sin cargo",
    filterValueGetter: ({ data }) => data?.position || "Sin cargo",
    filter: "BioNexusOptionFilter",
    filterParams: { options: cargoFilterOptions.value },
  },
  {
    field: "roles",
    headerName: "Roles",
    minWidth: 170,
    flex: 0.8,
    valueGetter: ({ data }) => data?.roles || "Sin roles",
    filterValueGetter: ({ data }) => data?.roles || "Sin roles",
    filter: "BioNexusOptionFilter",
    filterParams: { options: roleFilterOptions.value },
  },
  {
    headerName: "Estado",
    minWidth: 125,
    maxWidth: 145,
    flex: 0.6,
    valueGetter: ({ data }) => data?.hidden !== true,
    filter: "BioNexusOptionFilter",
    filterParams: {
      getValue: (data) => data?.hidden !== true,
      options: [
        { value: true, label: "Activo" },
        { value: false, label: "Inactivo" },
      ],
    },
    headerClass: "toro-grid-centered-header",
    cellClass: "toro-grid-status-cell",
    cellRenderer: BioNexusGridToggleCell,
    cellRendererParams: {
      onLabel: "Activo",
      offLabel: "Inactivo",
      ariaLabel: "Estado",
      disabled: false,
      onToggle: (row) => openUserStateDialog(row),
    },
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
    cellRenderer: "BioNexusGridActionsCell",
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
      key: "view", icon: "view",
      label: "Ver autorización",
      action: () => openUserDetailDialog(user),
    },
    {
      key: "edit", icon: "edit",
      label: "Editar datos",
      visible: canUpdateUsers.value,
      action: () => openEditUserDialog(user),
    },
    {
      key: "state", icon: user.hidden ? "activate" : "deactivate",
      label: user.hidden ? "Reactivar usuario" : "Inactivar usuario",
      visible: canUpdateUsers.value,
      action: () => openUserStateDialog(user),
    },
    {
      key: "roles", icon: "roles",
      label: "Editar roles",
      visible: canAssignRoles.value,
      disabled: user.hidden === true,
      action: () => openUserRolesDialog(user),
    },
    {
      key: "permissions", icon: "permissions",
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

    if (draftRoleIds.value.includes(role.id)) {
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

function openCreateUserDialog() {
  userIdentityDialog.value?.openCreate();
}

function openEditUserDialog(user) {
  userIdentityDialog.value?.openEdit(user);
}

function openUserStateDialog(user) {
  userIdentityDialog.value?.openState(user);
}

function handleIdentitySaved({ user, action }) {
  if (!user?.id) return;

  const existingUser = users.value.find((currentUser) => currentUser.id === user.id);
  const normalizedUser = {
    ...(existingUser ?? {}),
    ...user,
    hidden: user.hidden === true,
    roles: user.roles ?? existingUser?.roles ?? "",
    assignedRoles: user.assignedRoles ?? existingUser?.assignedRoles ?? [],
  };

  users.value = existingUser
    ? users.value.map((currentUser) =>
        currentUser.id === normalizedUser.id ? normalizedUser : currentUser,
      )
    : [normalizedUser, ...users.value];

  selectedUser.value = normalizedUser;

  if (authorization.value?.user?.id === normalizedUser.id) {
    authorization.value = {
      ...authorization.value,
      user: {
        ...authorization.value.user,
        ...normalizedUser,
      },
    };
  }

  if (action === "created") {
    searchText.value = "";
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
  userDetailDialog.value?.open();
}

async function openUserRolesDialog(user) {
  if (user?.hidden || savingRoles.value || savingOverrides.value) return;
  if (!(await prepareSelectedUser(user))) return;
  userRolesDialog.value?.open();
}

async function submitUserRolesDialog() {
  await saveRoleChanges();
  if (saveRolesError.value === "") userRolesDialog.value?.close();
}

async function openUserOverridesDialog(user) {
  if (user?.hidden || savingRoles.value || savingOverrides.value) return;
  if (!(await prepareSelectedUser(user))) return;
  userOverridesDialog.value?.open();
}
async function submitUserOverridesDialog() {
  await saveOverrideChanges();
  if (saveOverridesError.value === "") userOverridesDialog.value?.close();
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
.user-authorization-page {
  display: grid;
  min-width: 0;
}

.user-directory-panel {
  overflow: hidden;
  padding: 0;
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

.users-grid :deep(.ag-pinned-right-header),
.users-grid :deep(.ag-pinned-right-cols-container) {
  border-left: 1px solid var(--toro-color-border-strong);
  box-shadow: calc(var(--toro-space-1) * -1) 0 var(--toro-space-3) var(--toro-shadow-panel-soft);
}

@media (max-width: 1050px) {
  .users-grid {
    overflow: visible;
  }
}
</style>
