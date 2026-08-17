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
        <div v-if="roles.length === 0" class="roles-empty toro-empty-state">
          No existen roles registrados.
        </div>

        <BioNexusDataGrid
          v-else
          class="roles-grid"
          :row-data="visibleRoles"
          :column-defs="roleColumnDefs"
          :components="gridComponents"
          :context="gridContext"
          :get-row-id="getRoleRowId"
          :search-enabled="true"
          v-model:search-model-value="roleSearchText"
          search-placeholder="Buscar rol"
          :refresh-enabled="true"
          :refreshing="loading"
          :refresh-disabled="creatingRole || editingRole"
          :page-size="10"
          :page-size-selector="[10, 20, 50, 100]"
          :min-grid-height="300"
          :max-grid-height="560"
          empty-text="No existen roles que coincidan con los filtros."
          @refresh="loadCatalogs"
          @row-context-menu="openRoleContextMenu"
        >
          <template #actions>
            <button type="button" class="toro-action toro-action-secondary" @click="openPermissionCatalogDialog">
              <BioNexusActionIcon action="catalog" />
              <span>Ver catalogo</span>
            </button>
            <button
              v-if="canCreateRoles"
              type="button"
              class="toro-action toro-action-primary"
              :disabled="loading || creatingRole"
              @click="openCreateRoleDialog"
            >
              <BioNexusActionIcon action="create" />
              <span>Nuevo rol</span>
            </button>
          </template>
        </BioNexusDataGrid>

        <RoleStateDialog ref="roleStateDialog" :saving="editingRole" @confirm="confirmRoleStatus" />

        <BioNexusContextMenu
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

    <RoleCreateDialog ref="createRoleDialog" :creating-role="creatingRole" :can-create-roles="canCreateRoles" :create-role-form="createRoleForm" :create-role-code-error="createRoleCodeError" :create-role-name-error="createRoleNameError" :create-role-error="createRoleError" :create-role-message="createRoleMessage" @close="closeCreateRoleDialog" @submit="submitCreateRoleDialog" />

    <RoleDetailDialog ref="roleDetailDialog" :selected-role="selectedRole" @close="closeRoleDetailDialog" />

    <RoleEditDialog ref="editRoleDialog" :selected-role="selectedRole" :update-role-form="updateRoleForm" :update-role-name-error="updateRoleNameError" :update-role-error="updateRoleError" :update-role-message="updateRoleMessage" :editing-role="editingRole" :can-update-roles="canUpdateRoles" :has-role-metadata-changes="hasRoleMetadataChanges" @close="closeEditRoleDialog" @submit="submitEditRoleDialog" />

    <RolePermissionsDialog ref="rolePermissionsDialog" :selected-role="selectedRole" :permission-search-text="permissionSearchText" :draft-permission-ids="draftPermissionIds" :assigned-permissions-loading="assignedPermissionsLoading" :assigned-permissions-error="assignedPermissionsError" :inactive-assigned-permissions="inactiveAssignedPermissions" :filtered-permission-modules="filteredPermissionModules" :can-assign-permissions="canAssignPermissions" :saving-permissions="savingPermissions" :save-permissions-error="savePermissionsError" :save-permissions-message="savePermissionsMessage" :has-permission-changes="hasPermissionChanges" @update:permission-search-text="permissionSearchText = $event" @toggle-permission="togglePermission" @toggle-module-permissions="toggleModulePermissions" @close="closeRolePermissionsDialog" @submit="submitRolePermissionsDialog" />

    <PermissionCatalogDialog ref="permissionCatalogDialog" :catalog-search-text="catalogSearchText" :filtered-catalog-permissions="filteredCatalogPermissions" @update:catalog-search-text="catalogSearchText = $event" @close="closePermissionCatalogDialog" />
  </section>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from "vue";
import BioNexusDataGrid from "@/components/grid/BioNexusDataGrid.vue";
import BioNexusOptionFilter from "@/components/grid/BioNexusOptionFilter.vue";
import BioNexusGridToggleCell from "@/components/grid/BioNexusGridToggleCell.vue";
import BioNexusGridActionsCell from "@/components/grid/BioNexusGridActionsCell.vue";
import BioNexusContextMenu from "@/components/ui/BioNexusContextMenu.vue";
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
import { useBioNexusToast } from "@/composables/useBioNexusToast";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import RoleStateDialog from "@/components/security/RoleStateDialog.vue";
import RoleCreateDialog from "@/components/security/RoleCreateDialog.vue";
import RoleDetailDialog from "@/components/security/RoleDetailDialog.vue";
import RoleEditDialog from "@/components/security/RoleEditDialog.vue";
import RolePermissionsDialog from "@/components/security/RolePermissionsDialog.vue";
import PermissionCatalogDialog from "@/components/security/PermissionCatalogDialog.vue";

const toast = useBioNexusToast();

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
const visibleRoles = computed(() => {
  const search = roleSearchText.value.trim().toLocaleLowerCase();
  if (search === "") return roles.value;
  return roles.value.filter((role) =>
    [
      role.code,
      role.name,
      role.description,
      role.isSystem ? "Sistema" : "Configurable",
      role.isActive ? "Activo" : "Inactivo",
    ]
      .filter((value) => typeof value === "string")
      .some((value) => value.toLocaleLowerCase().includes(search)),
  );
});
const permissionSearchText = ref("");
const catalogSearchText = ref("");
const roleContextMenu = ref(null);
const roleStateDialog = ref(null);
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

function normalizePermissionModuleLabel(label) {
  return String(label || "").toLocaleLowerCase() === "typepayment"
    ? "Formas de pago"
    : label;
}

const presentedPermissions = computed(() =>
  permissions.value.map((permission) => {
    const presented = presentPermission(permission);
    return {
      ...presented,
      moduleLabel: normalizePermissionModuleLabel(presented.moduleLabel),
    };
  }),
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
  BioNexusGridActionsCell,

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
      key: "view", icon: "view",
      label: "Ver rol",
      action: () => openRoleDetailDialog(role),
    },
    {
      key: "edit", icon: "edit",
      label: "Editar rol",
      visible: canUpdateRoles.value,
      action: () => openEditRoleDialog(role),
    },
    {
      key: "permissions", icon: "permissions",
      label: "Asignar permisos",
      visible: canAssignPermissions.value,
      action: () => openRolePermissionsDialog(role),
    },
    {
      key: "toggle-status", icon: role.isActive ? "deactivate" : "activate",
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
      action: () => openRoleStateDialog(role),
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
    filter: BioNexusOptionFilter,
    filterParams: {
      getValue: (data) => data?.isSystem ? "Sistema" : "Configurable",
      options: [
        { value: "Sistema", label: "Sistema" },
        { value: "Configurable", label: "Configurable" },
      ],
    },
    minWidth: 125,
    maxWidth: 150,
    flex: 0.7,
    valueGetter: ({ data }) => data?.isSystem ? "Sistema" : "Configurable",
    headerClass: "toro-grid-centered-header",
    cellClass: "toro-grid-centered-cell",
    headerTooltip: "Sistema: administrado internamente por TORO. Configurable: creado y administrado desde esta pantalla.",
  },
  {
    headerName: "Estado",
    filter: BioNexusOptionFilter,
    filterParams: {
      getValue: (data) => Boolean(data?.isActive),
      options: [
        { value: true, label: "Activo" },
        { value: false, label: "Inactivo" },
      ],
    },
    minWidth: 135,
    maxWidth: 155,
    flex: 0.65,
    valueGetter: ({ data }) => Boolean(data?.isActive),
    cellClass: "toro-grid-status-cell",
    cellStyle: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      paddingLeft: "6px",
      paddingRight: "6px",
    },
    headerClass: "toro-grid-centered-header",
    cellRenderer: BioNexusGridToggleCell,

  cellRendererParams: { onLabel: "Activo", offLabel: "Inactivo", ariaLabel: "Estado", disabled: false, onToggle: (row) => openRoleStateDialog(row) },
},
  {
    colId: "actions",
    headerName: "Acciones",
    width: 176,
    minWidth: 176,
    maxWidth: 176,
    flex: 0,
    pinned: "right",
    lockPinned: true,
    sortable: false,
    filter: false,
    resizable: false,
    suppressHeaderMenuButton: true,
    headerClass: "toro-grid-actions-header",
    cellClass: "toro-grid-actions-cell",
    cellStyle: roleActionsCellStyle,
    cellRenderer: "BioNexusGridActionsCell",
    cellRendererParams: {
      actions: roleActions.value,
    },
  },
]);

function getRoleRowId(params) {
  return String(params.data.id);
}

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
  groupPermissionsForPresentation(permissions.value).map((module) => ({
    ...module,
    label: normalizePermissionModuleLabel(module.label),
  })),
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
  const target = dialogReference.value;
  if (!target) return;
  if (typeof target.showModal === "function") target.showModal();
  focusOpenedDialog(dialogReference);
}

function closeDialog(dialogReference) {
  const target = dialogReference.value;
  if (typeof target?.close === "function") target.close();
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

function openRoleStateDialog(role) {
  if (!role || !canUpdateRoles.value || editingRole.value) return;
  if (role.code === "admin" && role.isActive === true) {
    errorMessage.value = "El rol administrador debe permanecer activo.";
    toast.error(errorMessage.value);
    return;
  }
  roleStateDialog.value?.open(role);
}

async function confirmRoleStatus(role) {
  roleStateDialog.value?.clearError();
  await toggleRoleStatus(role);
  if (updateRoleError.value !== "") {
    roleStateDialog.value?.setError(updateRoleError.value);
    return;
  }
  roleStateDialog.value?.close();
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
  const target = dialogReference?.value;
  if (!target) return;
  requestAnimationFrame(() => target.focus?.({ preventScroll: true }));
}

</script>

<style scoped>
.roles-admin {
  display: grid;
  min-width: 0;
}

.roles-workspace {
  min-width: 0;
  overflow: hidden;
  padding: 0;
}

.roles-empty {
  margin: var(--toro-space-4);
}

.roles-grid {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  border: 0;
  border-radius: 0;
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

.roles-admin :deep(.toro-grid-centered-cell),
.roles-admin :deep(.toro-grid-status-cell) {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.roles-admin :deep(.toro-grid-centered-header .ag-header-cell-label),
.roles-admin :deep(.toro-grid-actions-header .ag-header-cell-label) {
  justify-content: center;
  width: 100%;
  text-align: center;
}

.roles-admin :deep(.toro-grid-actions-cell) {
  padding-inline: 4px;
}

.roles-admin :deep(.toro-grid-actions-cell .ag-cell-wrapper),
.roles-admin :deep(.toro-grid-actions-cell .ag-cell-value) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-width: 0;
}

.roles-grid :deep(.ag-root-wrapper),
.roles-grid :deep(.ag-root),
.roles-grid :deep(.ag-body),
.roles-grid :deep(.ag-body-viewport),
.roles-grid :deep(.ag-center-cols-viewport) {
  min-width: 0;
  max-width: 100%;
}



@media (max-width: 1100px) {
  .roles-grid { overflow: visible; }
  .roles-grid :deep(.ag-body-viewport),
  .roles-grid :deep(.ag-center-cols-viewport) { overflow-x: auto; }
  .roles-grid :deep(.ag-body-horizontal-scroll) {
    display: flex;
    min-height: var(--ag-scrollbar-size, 14px);
    height: var(--ag-scrollbar-size, 14px);
  }
}
</style>
