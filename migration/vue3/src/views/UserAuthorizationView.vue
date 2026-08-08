<template>
    <section class="user-security-page toro-page" aria-labelledby="user-security-title">
        <header class="user-security-header toro-page-header">
            <div>
                <p class="user-security-eyebrow toro-page-eyebrow">Administración de seguridad</p>
                <h2 id="user-security-title">Usuarios y autorización</h2>
                <p>
                    Consulta los roles, permisos heredados, excepciones y contexto efectivo
                    de cada usuario.
                </p>
            </div>

            <button type="button" :disabled="usersLoading || authorizationLoading" @click="loadUsers">
                {{ usersLoading ? "Actualizando..." : "Actualizar" }}
            </button>
        </header>

        <div v-if="usersError" class="user-security-message user-security-message-error toro-message toro-message-error" role="alert">
            <strong>No fue posible cargar los usuarios.</strong>
            <span>{{ usersError }}</span>
        </div>

        <div v-if="usersLoading && !usersLoaded" class="user-security-message toro-message" role="status">
            Cargando usuarios...
        </div>

        <template v-else>
            <div class="user-security-metrics toro-metrics">
                <article>
                    <span>Usuarios</span>
                    <strong>{{ users.length }}</strong>
                    <small>{{ visibleUsersCount }} visibles</small>
                </article>

                <article>
                    <span>Resultados</span>
                    <strong>{{ filteredUsers.length }}</strong>
                    <small>Coincidencias actuales</small>
                </article>

                <article>
                    <span>Roles asignados</span>
                    <strong>{{ authorization?.assignedRoles.length || 0 }}</strong>
                    <small>Usuario seleccionado</small>
                </article>

                <article>
                    <span>Permisos efectivos</span>
                    <strong>{{ authorization?.context?.permissions.length || 0 }}</strong>
                    <small>Después de aplicar excepciones</small>
                </article>
            </div>

            <div class="user-security-grid">
                <article class="user-security-panel toro-panel">
                    <div class="user-security-panel-heading toro-panel-heading">
                        <div>
                            <p>Directorio seguro</p>
                            <h3>Usuarios</h3>
                        </div>

                        <span>{{ filteredUsers.length }}</span>
                    </div>

                    <label class="user-search">
                        <span>Buscar usuario</span>

                        <input v-model="searchText" type="search" autocomplete="off"
                            placeholder="Nombre, usuario, correo o cargo" />
                    </label>

                    <div v-if="filteredUsers.length === 0" class="user-security-empty toro-empty-state">
                        No existen usuarios que coincidan con la búsqueda.
                    </div>

                    <div v-else class="user-list">
                        <button v-for="user in filteredUsers" :key="user.id" type="button" class="user-list-item"
                            :class="{
                                'user-list-item-selected':
                                    selectedUser?.id === user.id,
                                'user-list-item-hidden':
                                    user.hidden,
                            }" :disabled="authorizationLoading ||
                                savingRoles ||
                                savingOverrides
                                " @click="selectUser(user)">
                            <span class="user-list-avatar">
                                {{ getUserInitials(user) }}
                            </span>

                            <span class="user-list-copy toro-option-copy">
                                <strong>{{ user.name || "Usuario sin nombre" }}</strong>
                                <small>@{{ user.userName || "sin-usuario" }}</small>
                                <small>{{ user.position || "Sin cargo registrado" }}</small>
                            </span>

                            <span class="user-status toro-badge" :class="{ 'toro-badge-warning': user.hidden }">
                                {{ user.hidden ? "Oculto" : "Visible" }}
                            </span>
                        </button>
                    </div>
                </article>

                <article class="user-security-panel toro-panel">
                    <div class="user-security-panel-heading toro-panel-heading">
                        <div>
                            <p>Detalle administrativo</p>
                            <h3>Autorización del usuario</h3>
                        </div>

                        <span v-if="selectedUser">
                            #{{ selectedUser.id }}
                        </span>
                    </div>

                    <div v-if="!selectedUser" class="user-security-empty toro-empty-state">
                        Seleccione un usuario para consultar su autorización.
                    </div>

                    <div v-else-if="authorizationLoading" class="user-security-empty toro-empty-state" role="status">
                        Consultando autorización...
                    </div>

                    <div v-else-if="authorizationError" class="user-security-message user-security-message-error toro-message toro-message-error"
                        role="alert">
                        {{ authorizationError }}
                    </div>

                    <template v-else-if="authorization">
                        <dl class="user-detail toro-detail">
                            <div>
                                <dt>Nombre</dt>
                                <dd>{{ authorization.user.name || "Sin nombre" }}</dd>
                            </div>

                            <div>
                                <dt>Usuario</dt>
                                <dd>
                                    {{ authorization.user.userName || "Sin usuario" }}
                                </dd>
                            </div>

                            <div>
                                <dt>Correo</dt>
                                <dd>{{ authorization.user.email || "Sin correo" }}</dd>
                            </div>

                            <div>
                                <dt>Cargo</dt>
                                <dd>{{ authorization.user.position || "Sin cargo" }}</dd>
                            </div>

                            <div>
                                <dt>Colegio</dt>
                                <dd>
                                    {{ authorization.user.collegeNumber || "Sin registro" }}
                                </dd>
                            </div>

                            <div>
                                <dt>Estado</dt>
                                <dd>
                                    {{ authorization.user.hidden ? "Oculto" : "Visible" }}
                                </dd>
                            </div>
                        </dl>

                        <section class="authorization-section">
                            <header>
                                <div>
                                    <p>Asignación directa</p>
                                    <h4>Roles</h4>
                                </div>

                                <span>{{ authorization.assignedRoles.length }}</span>
                            </header>

                            <div v-if="inactiveAssignedRoles.length > 0" class="role-assignment-warning toro-warning">
                                El usuario conserva roles inactivos para fines de consulta. Los roles
                                inactivos no pueden seleccionarse nuevamente y serán retirados en el
                                próximo guardado.
                            </div>

                            <div v-if="rolesError" class="role-assignment-message role-assignment-error toro-inline-message toro-message-error" role="alert">
                                {{ rolesError }}
                            </div>

                            <div v-if="!canAssignRoles" class="user-security-empty user-security-empty-compact toro-empty-state">
                                La cuenta actual puede consultar los roles asignados, pero no modificarlos.
                            </div>

                            <div v-if="roles.length === 0" class="user-security-empty user-security-empty-compact toro-empty-state">
                                No existen roles disponibles.
                            </div>

                            <div v-else class="role-assignment-list">
                                <label v-for="role in roles" :key="role.id" class="role-assignment-option" :class="{
                                    'toro-option-selected':
                                        isRoleSelected(role.id),
                                    'toro-option-disabled':
                                        !role.isActive ||
                                        !canAssignRoles,
                                }">
                                    <input type="checkbox" :checked="isRoleSelected(role.id)" :disabled="!role.isActive ||
                                        !canAssignRoles ||
                                        savingRoles
                                        " @change="toggleRole(role)" />

                                    <span class="role-assignment-copy toro-option-copy">
                                        <strong>{{ role.code }}</strong>
                                        <small>{{ role.name }}</small>
                                        <small>{{ role.description || "Sin descripción" }}</small>
                                    </span>

                                    <span class="authorization-badge toro-badge" :class="{
                                        'toro-badge-warning': !role.isActive,
                                    }">
                                        {{ role.isActive ? "Activo" : "Inactivo" }}
                                    </span>
                                </label>
                            </div>

                            <div v-if="saveRolesError" class="role-assignment-message role-assignment-error toro-inline-message toro-message-error"
                                role="alert">
                                {{ saveRolesError }}
                            </div>

                            <div v-if="saveRolesMessage" class="role-assignment-message role-assignment-success toro-inline-message toro-message-success"
                                role="status">
                                {{ saveRolesMessage }}
                            </div>

                            <div v-if="canAssignRoles" class="role-assignment-actions toro-form-actions">
                                <span>
                                    {{
                                        hasRoleChanges
                                            ? "Existen cambios pendientes."
                                            : "Los roles están sincronizados."
                                    }}
                                </span>

                                <div>
                                    <button type="button"
                                        class="role-assignment-button role-assignment-button-secondary toro-action toro-action-secondary" :disabled="!hasRoleChanges ||
                                            savingRoles
                                            " @click="discardRoleChanges">
                                        Descartar
                                    </button>

                                    <button type="button" class="role-assignment-button role-assignment-button-primary toro-action toro-action-primary"
                                        :disabled="!hasRoleChanges ||
                                            savingRoles
                                            " @click="saveRoleChanges">
                                        {{ savingRoles ? "Guardando..." : "Guardar roles" }}
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section class="authorization-section">
                            <header>
                                <div>
                                    <p>Herencia</p>
                                    <h4>Permisos heredados</h4>
                                </div>

                                <span>{{ authorization.inheritedPermissions.length }}</span>
                            </header>

                            <div v-if="authorization.inheritedPermissions.length === 0"
                                class="user-security-empty user-security-empty-compact toro-empty-state">
                                No existen permisos heredados desde roles activos.
                            </div>

                            <ul v-else class="authorization-list toro-list">
                                <li v-for="permission in authorization.inheritedPermissions" :key="permission.id">
                                    <span>
                                        <strong>{{ permission.code }}</strong>
                                        <small>{{ permission.module || "general" }}</small>
                                    </span>

                                    <span class="authorization-badge toro-badge" :class="{
                                        'toro-badge-warning': !permission.isActive,
                                    }">
                                        {{ permission.isActive ? "Activo" : "Inactivo" }}
                                    </span>
                                </li>
                            </ul>
                        </section>

                        <section class="authorization-section">
                            <header>
                                <div>
                                    <p>Excepciones individuales</p>
                                    <h4>Overrides</h4>
                                </div>

                                <span>
                                    {{ authorization.permissionOverrides.length }}
                                </span>
                            </header>

                            <div v-if="inactivePermissionOverrides.length > 0" class="override-warning toro-warning">
                                El usuario conserva excepciones sobre permisos inactivos para
                                fines de consulta. Estas excepciones no pueden seleccionarse
                                nuevamente y serán retiradas en el próximo guardado.
                            </div>

                            <div v-if="permissionsError" class="override-message override-message-error toro-inline-message toro-message-error" role="alert">
                                {{ permissionsError }}
                            </div>

                            <div v-if="!canAssignPermissionOverrides"
                                class="user-security-empty user-security-empty-compact toro-empty-state">
                                La cuenta actual puede consultar las excepciones, pero no
                                modificarlas.
                            </div>

                            <div v-if="permissions.length === 0"
                                class="user-security-empty user-security-empty-compact toro-empty-state">
                                No existen permisos disponibles.
                            </div>

                            <div v-else class="override-modules toro-form">
                                <section v-for="module in permissionModules" :key="module.name" class="override-module toro-section">
                                    <header>
                                        <h5>{{ module.name }}</h5>
                                        <span>{{ module.permissions.length }}</span>
                                    </header>

                                    <div v-for="permission in module.permissions" :key="permission.id"
                                        class="override-option" :class="{
                                            'override-option-disabled':
                                                !permission.isActive ||
                                                !canAssignPermissionOverrides,
                                        }">
                                        <span class="override-option-copy">
                                            <strong>{{ permission.code }}</strong>
                                            <small>{{ permission.name }}</small>
                                        </span>

                                        <select :value="getPermissionOverrideEffect(
                                            permission.id,
                                        )
                                            " :disabled="!permission.isActive ||
                                                !canAssignPermissionOverrides ||
                                                savingOverrides
                                                " @change="
                                                    setPermissionOverride(
                                                        permission,
                                                        $event.target.value,
                                                    )
                                                    ">
                                            <option value="">Sin override</option>
                                            <option :value="PermissionEffect.Allow">
                                                Permitir
                                            </option>
                                            <option :value="PermissionEffect.Deny">
                                                Denegar
                                            </option>
                                        </select>

                                        <span class="authorization-badge toro-badge" :class="{
                                            'authorization-badge-deny':
                                                getPermissionOverrideEffect(
                                                    permission.id,
                                                ) === PermissionEffect.Deny,
                                        }">
                                            {{
                                                getPermissionOverrideEffect(
                                                    permission.id,
                                                ) === PermissionEffect.Allow
                                                    ? "Permitir"
                                                    : getPermissionOverrideEffect(
                                                        permission.id,
                                                    ) === PermissionEffect.Deny
                                                        ? "Denegar"
                                                        : "Heredado"
                                            }}
                                        </span>
                                    </div>
                                </section>
                            </div>

                            <div v-if="saveOverridesError" class="override-message override-message-error toro-inline-message toro-message-error" role="alert">
                                {{ saveOverridesError }}
                            </div>

                            <div v-if="saveOverridesMessage" class="override-message override-message-success toro-inline-message toro-message-success"
                                role="status">
                                {{ saveOverridesMessage }}
                            </div>

                            <div v-if="canAssignPermissionOverrides" class="override-actions toro-form-actions">
                                <span>
                                    {{
                                        hasOverrideChanges
                                            ? "Existen cambios pendientes."
                                            : "Las excepciones están sincronizadas."
                                    }}
                                </span>

                                <div>
                                    <button type="button" class="override-button override-button-secondary toro-action toro-action-secondary" :disabled="!hasOverrideChanges ||
                                        savingOverrides
                                        " @click="discardOverrideChanges">
                                        Descartar
                                    </button>

                                    <button type="button" class="override-button override-button-primary toro-action toro-action-primary" :disabled="!hasOverrideChanges ||
                                        savingOverrides
                                        " @click="saveOverrideChanges">
                                        {{
                                            savingOverrides
                                                ? "Guardando..."
                                                : "Guardar excepciones"
                                        }}
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section class="authorization-section">
                            <header>
                                <div>
                                    <p>Resultado efectivo</p>
                                    <h4>Contexto de autorización</h4>
                                </div>

                                <span>
                                    {{ authorization.context?.permissions.length || 0 }}
                                </span>
                            </header>

                            <div v-if="!authorization.context" class="user-security-empty user-security-empty-compact toro-empty-state">
                                El usuario no dispone de un contexto efectivo activo.
                            </div>

                            <template v-else>
                                <div class="effective-summary">
                                    <article>
                                        <span>Roles efectivos</span>
                                        <strong>{{ authorization.context.roles.length }}</strong>
                                    </article>

                                    <article>
                                        <span>Permisos efectivos</span>
                                        <strong>
                                            {{ authorization.context.permissions.length }}
                                        </strong>
                                    </article>

                                    <article>
                                        <span>Permisos denegados</span>
                                        <strong>
                                            {{ authorization.context.deniedPermissions.length }}
                                        </strong>
                                    </article>
                                </div>

                                <div class="effective-columns">
                                    <section>
                                        <h5>Permitidos</h5>

                                        <ul v-if="authorization.context.permissions.length > 0">
                                            <li v-for="permission in authorization.context.permissions"
                                                :key="permission">
                                                {{ permission }}
                                            </li>
                                        </ul>

                                        <p v-else>Sin permisos efectivos.</p>
                                    </section>

                                    <section>
                                        <h5>Denegados</h5>

                                        <ul v-if="
                                            authorization.context.deniedPermissions.length > 0
                                        ">
                                            <li v-for="permission in authorization.context
                                                .deniedPermissions" :key="permission">
                                                {{ permission }}
                                            </li>
                                        </ul>

                                        <p v-else>Sin denegaciones explícitas.</p>
                                    </section>
                                </div>
                            </template>
                        </section>

                        <p class="user-security-note">
                            La asignación de roles y las excepciones individuales están
                            disponibles únicamente para cuentas autorizadas. El backend
                            continúa siendo la autoridad del contexto efectivo.
                        </p>
                    </template>
                </article>
            </div>
        </template>
    </section>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
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

const visibleUsersCount = computed(
    () => users.value.filter((user) => !user.hidden).length,
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

const permissionModules = computed(() => {
    const modules = new Map();

    for (const permission of permissions.value) {
        const moduleName =
            permission.module || "general";

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
        .sort((left, right) =>
            left.name.localeCompare(right.name),
        );
});

const filteredUsers = computed(() => {
    const filter = searchText.value.trim().toLowerCase();

    if (filter === "") {
        return users.value;
    }

    return users.value.filter((user) =>
        [
            user.name,
            user.userName,
            user.email,
            user.position,
            user.collegeNumber,
        ].some(
            (value) =>
                typeof value === "string" &&
                value.toLowerCase().includes(filter),
        ),
    );
});

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
        await replaceUserRoles(
            user.id,
            draftRoleIds.value,
        );

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
    } finally {
        savingRoles.value = false;
    }
}

async function saveOverrideChanges() {
    const user = selectedUser.value;

    if (
        !user ||
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

        if (!usersLoaded.value) {
            users.value = [];
            roles.value = [];
            rolesError.value =
                "No fue posible cargar el catálogo de roles.";
            permissions.value = [];
            permissionsError.value =
                "No fue posible cargar el catálogo de permisos.";
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
</script>

<style scoped>
.user-security-page {
    display: grid;
    gap: var(--toro-space-4);
}

.user-security-header {
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

.user-security-header h2,
.user-security-header p {
    margin: 0;
}

.user-security-header h2 {
    color: var(--toro-color-primary-strong);
    font-size: var(--toro-font-size-display);
}

.user-security-header p:not(.user-security-eyebrow) {
    max-width: 720px;
    margin-top: var(--toro-space-2);
    color: var(--toro-color-text-secondary);
    line-height: 1.5;
}

.user-security-eyebrow {
    margin-bottom: var(--toro-space-1) !important;
    color: var(--toro-color-accent);
    font-size: var(--toro-font-size-xs);
    font-weight: var(--toro-font-weight-heavy);
    letter-spacing: 0.1em;
    text-transform: uppercase;
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

.user-security-message {
    display: grid;
    gap: var(--toro-space-1);
    padding: var(--toro-space-4);
    border: 1px solid var(--toro-color-border);
    border-radius: var(--toro-radius-md);
    color: var(--toro-color-text-secondary);
    background: var(--toro-color-surface);
}

.user-security-message-error {
    border-color: var(--toro-color-danger-border);
    color: var(--toro-color-danger);
    background: var(--toro-color-danger-soft);
}

.user-security-metrics {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--toro-space-3);
}

.user-security-metrics article {
    display: grid;
    gap: var(--toro-space-1);
    padding: var(--toro-panel-padding);
    border: 1px solid var(--toro-color-border);
    border-radius: var(--toro-radius-md);
    background: var(--toro-color-surface);
    box-shadow: var(--toro-shadow-sm);
}

.user-security-metrics span,
.user-security-metrics small {
    color: var(--toro-color-text-muted);
}

.user-security-metrics span {
    font-size: var(--toro-font-size-xs);
    font-weight: var(--toro-font-weight-heavy);
    letter-spacing: 0.08em;
    text-transform: uppercase;
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

.user-security-panel {
    min-width: 0;
    padding: var(--toro-panel-padding);
    border: 1px solid var(--toro-color-border);
    border-radius: var(--toro-radius-md);
    background: var(--toro-color-surface);
    box-shadow: var(--toro-shadow-sm);
}

.user-security-panel-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--toro-space-3);
    margin-bottom: var(--toro-space-4);
}

.user-security-panel-heading h3,
.user-security-panel-heading p {
    margin: 0;
}

.user-security-panel-heading h3 {
    margin-top: var(--toro-space-1);
    color: var(--toro-color-primary-strong);
}

.user-security-panel-heading p {
    color: var(--toro-color-accent);
    font-size: var(--toro-font-size-xs);
    font-weight: var(--toro-font-weight-heavy);
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.user-security-panel-heading>span {
    padding: 5px 9px;
    border-radius: 999px;
    color: var(--toro-color-primary-strong);
    background: var(--toro-color-surface-soft);
    font-weight: var(--toro-font-weight-bold);
}

.user-search {
    display: grid;
    gap: var(--toro-space-2);
    margin-bottom: var(--toro-space-3);
}

.user-search span {
    color: var(--toro-color-text-secondary);
    font-size: var(--toro-font-size-sm);
    font-weight: var(--toro-font-weight-bold);
}

.user-search input {
    width: 100%;
    min-height: var(--toro-control-height);
    padding: 0 var(--toro-space-3);
    border: 1px solid var(--toro-color-border-strong);
    border-radius: var(--toro-radius-md);
    color: var(--toro-color-text);
    background: var(--toro-color-surface);
}

.user-search input:focus {
    border-color: var(--toro-color-primary);
    outline: var(--toro-focus-ring);
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

.user-list-item:hover,
.user-list-item-selected {
    border-color: var(--toro-color-primary);
    background: var(--toro-color-surface-soft);
}

.user-list-item-selected {
    box-shadow: inset 3px 0 0 var(--toro-color-accent);
}

.user-list-item-hidden {
    opacity: 0.72;
}

.user-list-item:disabled {
    cursor: wait;
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

.user-list-copy {
    display: grid;
    min-width: 0;
    flex: 1;
    gap: 2px;
}

.user-list-copy strong,
.user-list-copy small {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.user-list-copy small {
    color: var(--toro-color-text-muted);
}

.user-status,
.authorization-badge {
    flex: 0 0 auto;
    padding: 5px 8px;
    border-radius: 999px;
    color: var(--toro-color-success);
    background: var(--toro-color-success-soft);
    font-size: var(--toro-font-size-xs);
    font-weight: var(--toro-font-weight-bold);
}

.user-status-hidden,
.authorization-badge-inactive {
    color: var(--toro-color-warning);
    background: var(--toro-color-warning-soft);
}

.authorization-badge-deny {
    color: var(--toro-color-danger);
    background: var(--toro-color-danger-soft);
}

.user-detail {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--toro-space-3);
    margin: 0;
}

.user-detail div {
    min-width: 0;
    padding: var(--toro-space-3);
    border: 1px solid var(--toro-color-border);
    border-radius: var(--toro-radius-md);
    background: var(--toro-color-surface-soft);
}

.user-detail dt {
    color: var(--toro-color-text-muted);
    font-size: var(--toro-font-size-xs);
    font-weight: var(--toro-font-weight-heavy);
    text-transform: uppercase;
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

.authorization-list {
    display: grid;
    gap: var(--toro-space-2);
    margin: 0;
    padding: 0;
    list-style: none;
}

.authorization-list li {
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

.authorization-list li>span:first-child {
    display: grid;
    min-width: 0;
    gap: 2px;
}

.authorization-list strong {
    overflow-wrap: anywhere;
}

.authorization-list small {
    color: var(--toro-color-text-muted);
}

.role-assignment-list {
    display: grid;
    gap: var(--toro-space-2);
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

.role-assignment-option-disabled {
    cursor: not-allowed;
    opacity: 0.68;
}

.role-assignment-option input {
    width: 16px;
    height: 16px;
    flex: 0 0 16px;
    accent-color: var(--toro-color-primary);
}

.role-assignment-copy {
    display: grid;
    min-width: 0;
    flex: 1;
    gap: 2px;
}

.role-assignment-copy strong,
.role-assignment-copy small {
    overflow-wrap: anywhere;
}

.role-assignment-copy small {
    color: var(--toro-color-text-muted);
}

.role-assignment-warning {
    padding: var(--toro-space-3);
    border-left: 3px solid var(--toro-color-warning);
    color: var(--toro-color-warning);
    background: var(--toro-color-warning-soft);
}

.role-assignment-message {
    padding: var(--toro-space-3);
    border: 1px solid var(--toro-color-border);
    border-radius: var(--toro-radius-md);
}

.role-assignment-error {
    border-color: var(--toro-color-danger-border);
    color: var(--toro-color-danger);
    background: var(--toro-color-danger-soft);
}

.role-assignment-success {
    border-color: var(--toro-color-success-border);
    color: var(--toro-color-success);
    background: var(--toro-color-success-soft);
}

.role-assignment-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--toro-space-3);
    padding-top: var(--toro-space-3);
    border-top: 1px solid var(--toro-color-border);
}

.role-assignment-actions>span {
    color: var(--toro-color-text-muted);
}

.role-assignment-actions>div {
    display: flex;
    gap: var(--toro-space-2);
}

.role-assignment-button {
    min-height: var(--toro-control-height);
    padding: 0 var(--toro-space-4);
    border-radius: var(--toro-radius-md);
    cursor: pointer;
    font-weight: var(--toro-font-weight-bold);
}

.role-assignment-button:disabled {
    cursor: not-allowed;
    opacity: 0.55;
}

.role-assignment-button-secondary {
    border: 1px solid var(--toro-color-border-strong);
    color: var(--toro-color-primary-strong);
    background: var(--toro-color-surface);
}

.role-assignment-button-primary {
    border: 1px solid var(--toro-color-primary);
    color: var(--toro-color-text-inverse);
    background: var(--toro-color-primary);
}

.override-modules {
    display: grid;
    gap: var(--toro-space-3);
}

.override-module {
    overflow: hidden;
    border: 1px solid var(--toro-color-border);
    border-radius: var(--toro-radius-md);
}

.override-module>header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--toro-space-2) var(--toro-space-3);
    background: var(--toro-color-surface-soft);
}

.override-module h5 {
    margin: 0;
    color: var(--toro-color-primary-strong);
    text-transform: capitalize;
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

.override-option-copy {
    display: grid;
    min-width: 0;
    gap: 2px;
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

.override-option select:focus {
    border-color: var(--toro-color-primary);
    outline: var(--toro-focus-ring);
}

.override-option select:disabled {
    cursor: not-allowed;
}

.override-warning {
    padding: var(--toro-space-3);
    border-left: 3px solid var(--toro-color-warning);
    color: var(--toro-color-warning);
    background: var(--toro-color-warning-soft);
}

.override-message {
    padding: var(--toro-space-3);
    border: 1px solid var(--toro-color-border);
    border-radius: var(--toro-radius-md);
}

.override-message-error {
    border-color: var(--toro-color-danger-border);
    color: var(--toro-color-danger);
    background: var(--toro-color-danger-soft);
}

.override-message-success {
    border-color: var(--toro-color-success-border);
    color: var(--toro-color-success);
    background: var(--toro-color-success-soft);
}

.override-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--toro-space-3);
    padding-top: var(--toro-space-3);
    border-top: 1px solid var(--toro-color-border);
}

.override-actions>span {
    color: var(--toro-color-text-muted);
}

.override-actions>div {
    display: flex;
    gap: var(--toro-space-2);
}

.override-button {
    min-height: var(--toro-control-height);
    padding: 0 var(--toro-space-4);
    border-radius: var(--toro-radius-md);
    cursor: pointer;
    font-weight: var(--toro-font-weight-bold);
}

.override-button:disabled {
    cursor: not-allowed;
    opacity: 0.55;
}

.override-button-secondary {
    border: 1px solid var(--toro-color-border-strong);
    color: var(--toro-color-primary-strong);
    background: var(--toro-color-surface);
}

.override-button-primary {
    border: 1px solid var(--toro-color-primary);
    color: var(--toro-color-text-inverse);
    background: var(--toro-color-primary);
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

.user-security-empty {
    padding: var(--toro-space-6);
    border: 1px dashed var(--toro-color-border-strong);
    border-radius: var(--toro-radius-md);
    color: var(--toro-color-text-muted);
    text-align: center;
}

.user-security-empty-compact {
    padding: var(--toro-space-4);
}

.user-security-note {
    margin: var(--toro-space-4) 0 0;
    padding: var(--toro-space-3);
    border-left: 3px solid var(--toro-color-accent);
    color: var(--toro-color-text-secondary);
    background: var(--toro-color-accent-soft);
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
    .user-security-header {
        align-items: flex-start;
        flex-direction: column;
    }

    .user-security-header button {
        width: 100%;
    }

    .user-security-metrics,
    .user-detail,
    .effective-summary,
    .effective-columns {
        grid-template-columns: 1fr;
    }

    .user-list-item {
        align-items: flex-start;
    }

    .role-assignment-option {
        align-items: flex-start;
    }

    .role-assignment-actions {
        align-items: stretch;
        flex-direction: column;
    }

    .role-assignment-actions>div {
        display: grid;
        grid-template-columns: 1fr 1fr;
    }

    .role-assignment-button {
        width: 100%;
    }

    .override-option {
        grid-template-columns: 1fr;
        align-items: stretch;
    }

    .override-actions {
        align-items: stretch;
        flex-direction: column;
    }

    .override-actions>div {
        display: grid;
        grid-template-columns: 1fr 1fr;
    }

    .override-button {
        width: 100%;
    }
}
</style>