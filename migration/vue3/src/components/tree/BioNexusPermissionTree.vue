<template>
  <div class="bio-nexus-permission-tree">
    <div
      v-if="treeItems.length === 0"
      class="permission-tree-empty"
    >
      {{ emptyText }}
    </div>

    <Vue3TreeVue
      v-else
      :items="treeItems"
      :is-checkable="false"
      :hide-guide-lines="false"
    >
      <template #item-name="slotValue">
        <div
          class="permission-tree-copy"
          :class="{
            'permission-tree-copy-module':
              getItemType(slotValue) === 'module',
          }"
        >
          <div
            v-if="getItemType(slotValue) === 'module'"
            class="permission-tree-module-heading"
          >
            <input
              v-if="selectable"
              type="checkbox"
              class="permission-tree-module-checkbox"
              :checked="isModuleSelected(slotValue)"
              :indeterminate="isModulePartial(slotValue)"
              :disabled="
                disabled ||
                getActivePermissions(slotValue).length === 0
              "
              :aria-label="
                `Seleccionar todos los permisos de ${getItemName(slotValue)}`
              "
              @click.stop
              @change="toggleModule(slotValue)"
            />

            <strong>{{ getItemName(slotValue) }}</strong>

            <span class="permission-tree-count">
              {{ getModuleSummary(slotValue) }}
            </span>
          </div>

          <div
            v-else
            class="permission-tree-permission-heading"
            :class="{
              'permission-tree-permission-heading-action':
                hasPermissionActionSlot,
            }"
          >
            <span class="permission-tree-permission-copy">
              <strong>{{ getItemName(slotValue) }}</strong>
              <small>{{ getDescription(slotValue) }}</small>
            </span>
            <slot
              v-if="hasPermissionActionSlot"
              name="permission-action"
              :permission="getPermission(slotValue)"
              :active="getPermissionActive(slotValue)"
            />
          </div>
        </div>
      </template>

      <template #item-append="slotValue">
        <div
          v-if="
            getItemType(slotValue) === 'module'
          "
          class="permission-tree-module-actions"
        >
          <span class="permission-tree-count">
            {{ getModuleSummary(slotValue) }}
          </span>

          <label
            v-if="selectable"
            class="permission-tree-select-all"
          >
            <input
              type="checkbox"
              :checked="isModuleSelected(slotValue)"
              :indeterminate="isModulePartial(slotValue)"
              :disabled="
                disabled ||
                getActivePermissions(slotValue).length === 0
              "
              @click.stop
              @change="toggleModule(slotValue)"
            />

            <span>Seleccionar todo</span>
          </label>
        </div>

        <template v-else-if="!hasPermissionActionSlot">
            <span
              class="permission-tree-badge"
            :title="
              getPermissionActive(slotValue)
                ? selectable
                  ? 'Permiso activo y disponible para asignar'
                  : 'Permiso activo'
                : 'Permiso inactivo'
            "
            :class="{
              'permission-tree-badge-inactive':
                !getPermissionActive(slotValue),
            }"
          >
            {{
              getPermissionActive(slotValue)
                ? selectable
                  ? "Disponible"
                  : "Activo"
                : "Inactivo"
            }}
            </span>
        </template>
      </template>

      <template
        v-if="selectable"
        #item-prepend-icon="slotValue"
      >
        <input
          v-if="
            getItemType(slotValue) === 'permission'
          "
          type="checkbox"
          class="permission-tree-checkbox"
          :checked="
            isPermissionSelected(
              getPermissionId(slotValue),
            )
          "
          :disabled="
            disabled ||
            !getPermissionActive(slotValue)
          "
          @click.stop
          @change="togglePermission(slotValue)"
        />
      </template>
    </Vue3TreeVue>
  </div>
</template>

<script setup>
import { computed, useSlots } from "vue";
import Vue3TreeVue from "vue3-tree-vue";
import "vue3-tree-vue/dist/style.css";

const props = defineProps({
  permissions: {
    type: Array,
    default: () => [],
  },
  modules: {
    type: Array,
    default: () => [],
  },
  searchText: {
    type: String,
    default: "",
  },
  selectedIds: {
    type: Array,
    default: () => [],
  },
  selectable: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  emptyText: {
    type: String,
    default:
      "No existen permisos que coincidan con la búsqueda.",
  },
});

const slots = useSlots();
const hasPermissionActionSlot = computed(
  () => typeof slots["permission-action"] === "function",
);
const emit = defineEmits([
  "toggle-permission",
  "toggle-module",
]);

const selectedIdSet = computed(
  () =>
    new Set(
      props.selectedIds.map(
        (permissionId) =>
          String(permissionId),
      ),
    ),
);

const normalizedModules = computed(() => {
  const source =
    props.modules.length > 0
      ? props.modules
      : groupPermissions(
          props.permissions,
        );

  const searchValue =
    normalizeValue(
      props.searchText,
    );

  return source
    .map((moduleItem) => {
      const permissions =
        Array.isArray(
          moduleItem.permissions,
        )
          ? moduleItem.permissions
          : [];

      const label =
        moduleItem.label ||
        moduleItem.moduleLabel ||
        moduleItem.name ||
        "Otros";

      const moduleMatches =
        normalizeValue(label).includes(
          searchValue,
        );

      const visiblePermissions =
        searchValue === "" ||
        moduleMatches
          ? permissions
          : permissions.filter(
              (permission) =>
                [
                  permission.displayName,
                  permission.displayDescription,
                  permission.moduleLabel,
                ].some((value) =>
                  normalizeValue(value).includes(
                    searchValue,
                  ),
                ),
            );

      if (
        searchValue !== "" &&
        !moduleMatches &&
        visiblePermissions.length === 0
      ) {
        return null;
      }

      return {
        key:
          moduleItem.key ||
          moduleItem.moduleKey ||
          label,
        label,
        permissions:
          visiblePermissions,
      };
    })
    .filter(Boolean)
    .sort((left, right) =>
      left.label.localeCompare(
        right.label,
        "es-VE",
      ),
    );
});

const treeItems = computed(() =>
  normalizedModules.value.map(
    (moduleItem) => ({
      id:
        "module:" +
        String(moduleItem.key),
      name: moduleItem.label,
      expanded: true,
      meta: {
        type: "module",
        module: moduleItem,
      },
      children:
        moduleItem.permissions
          .slice()
          .sort((left, right) =>
            left.displayName.localeCompare(
              right.displayName,
              "es-VE",
            ),
          )
          .map((permission) => ({
            id:
              "permission:" +
              String(permission.id),
            name:
              permission.displayName,
            meta: {
              type: "permission",
              permission,
              description:
                permission.displayDescription,
            },
          })),
    }),
  ),
);

function groupPermissions(permissions) {
  const grouped = new Map();

  for (const permission of permissions) {
    const key =
      permission.moduleKey ||
      permission.module ||
      permission.moduleLabel ||
      "otros";

    const label =
      permission.moduleLabel ||
      permission.module ||
      "Otros";

    if (!grouped.has(key)) {
      grouped.set(key, {
        key,
        label,
        permissions: [],
      });
    }

    grouped
      .get(key)
      .permissions
      .push(permission);
  }

  return Array.from(grouped.values());
}

function normalizeValue(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLocaleLowerCase("es-VE");
}

function unwrapItem(slotValue) {
  return (
    slotValue?.item ||
    slotValue?.treeItem ||
    slotValue?.data ||
    slotValue ||
    {}
  );
}

function getItemType(slotValue) {
  return (
    unwrapItem(slotValue).meta?.type ||
    ""
  );
}

function getItemName(slotValue) {
  return unwrapItem(slotValue).name || "";
}

function getPermission(slotValue) {
  return (
    unwrapItem(slotValue).meta?.permission ||
    null
  );
}

function getModule(slotValue) {
  return (
    unwrapItem(slotValue).meta?.module ||
    null
  );
}

function getDescription(slotValue) {
  return (
    unwrapItem(slotValue).meta
      ?.description ||
    ""
  );
}

function getPermissionId(slotValue) {
  return getPermission(slotValue)?.id || "";
}

function getPermissionActive(slotValue) {
  return (
    getPermission(slotValue)
      ?.isActive === true
  );
}

function isPermissionSelected(permissionId) {
  return selectedIdSet.value.has(
    String(permissionId),
  );
}

function getActivePermissions(slotValue) {
  return (
    getModule(slotValue)
      ?.permissions.filter(
        (permission) =>
          permission.isActive,
      ) ||
    []
  );
}

function getSelectedCount(slotValue) {
  return getActivePermissions(
    slotValue,
  ).filter((permission) =>
    isPermissionSelected(
      permission.id,
    ),
  ).length;
}

function isModuleSelected(slotValue) {
  const activePermissions =
    getActivePermissions(slotValue);

  return (
    activePermissions.length > 0 &&
    getSelectedCount(slotValue) ===
      activePermissions.length
  );
}

function isModulePartial(slotValue) {
  const selectedCount =
    getSelectedCount(slotValue);

  return (
    selectedCount > 0 &&
    selectedCount <
      getActivePermissions(slotValue).length
  );
}

function getModuleSummary(slotValue) {
  const moduleItem =
    getModule(slotValue);

  if (!moduleItem) {
    return "";
  }

  if (!props.selectable) {
    return (
      moduleItem.permissions.length +
      " permisos"
    );
  }

  return (
    getSelectedCount(slotValue) +
    " de " +
    getActivePermissions(slotValue).length +
    " seleccionados"
  );
}

function togglePermission(slotValue) {
  const permission =
    getPermission(slotValue);

  if (
    permission?.isActive &&
    !props.disabled
  ) {
    emit(
      "toggle-permission",
      permission,
    );
  }
}

function toggleModule(slotValue) {
  const moduleItem =
    getModule(slotValue);

  if (
    moduleItem &&
    !props.disabled
  ) {
    emit(
      "toggle-module",
      moduleItem,
    );
  }
}
</script>

<style scoped>
.bio-nexus-permission-tree {
  width: 100%;
  min-width: 0;
  color: var(--toro-color-text);
  font-family: inherit;
  font-size: var(--toro-font-size-sm);
}

.bio-nexus-permission-tree :deep(.tree-item),
.bio-nexus-permission-tree :deep(.tree-item-node) {
  min-height: 30px;
}

.bio-nexus-permission-tree :deep(.tree-item-children) {
  margin-block: 1px;
}

.permission-tree-copy {
  display: grid;
  gap: 1px;
  min-width: 0;
  padding-block: 2px;
}

.permission-tree-copy strong {
  overflow: hidden;
  font-size: var(--toro-font-size-sm);
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.permission-tree-copy small {
  overflow: hidden;
  color: var(--toro-color-text-muted);
  font-size: var(--toro-font-size-xs);
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.permission-tree-copy-module strong {
  color: var(--toro-color-primary-strong);
  font-weight: var(--toro-font-weight-bold);
}

.permission-tree-module-actions {
  display: inline-flex;
  align-items: center;
  gap: var(--toro-space-2);
  padding-inline-end: var(--toro-space-2);
}

.permission-tree-count {
  display: inline-flex;
  align-items: center;
  min-height: 20px;
  padding-inline: 8px;
  border-radius: 999px;
  color: var(--toro-color-primary-strong);
  background: var(--toro-color-info-soft);
  font-size: var(--toro-font-size-xs);
  font-weight: var(--toro-font-weight-bold);
  white-space: nowrap;
}

.permission-tree-select-all {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--toro-color-text-muted);
  font-size: var(--toro-font-size-xs);
  font-weight: var(--toro-font-weight-bold);
  white-space: nowrap;
}

.permission-tree-checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--toro-color-primary);
}

.permission-tree-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 68px;
  min-height: 22px;
  margin-inline: 8px;
  padding-inline: 9px;
  border-radius: 999px;
  color: var(--toro-color-success-strong);
  background: var(--toro-color-success-soft);
  font-size: var(--toro-font-size-xs);
  font-weight: var(--toro-font-weight-bold);
  white-space: nowrap;
}

.permission-tree-badge-inactive {
  color: var(--toro-color-warning-strong);
  background: var(--toro-color-warning-soft);
}

.permission-tree-empty {
  display: grid;
  place-items: center;
  min-height: 180px;
  color: var(--toro-color-text-muted);
  font-size: var(--toro-font-size-sm);
}

/* TORO final direct aligned tree rows */

.bio-nexus-permission-tree {
  width: 100%;
  max-width: 920px;
}

.bio-nexus-permission-tree :deep(.tree-item),
.bio-nexus-permission-tree :deep(.tree-item-node) {
  position: relative;
  width: 100%;
  min-width: 0;
}

.bio-nexus-permission-tree :deep(.tree-item:has(.permission-tree-badge)),
.bio-nexus-permission-tree :deep(.tree-item-node:has(.permission-tree-badge)) {
  padding-inline-end: 104px;
}

.bio-nexus-permission-tree :deep(.tree-item:has(.permission-tree-module-actions)),
.bio-nexus-permission-tree :deep(.tree-item-node:has(.permission-tree-module-actions)) {
  padding-inline-end: 268px;
}

.permission-tree-copy {
  width: 100%;
  min-width: 0;
  max-width: none;
}

.permission-tree-badge {
  position: absolute;
  inset-inline-end: 12px;
  top: 50%;
  width: 82px;
  min-width: 82px;
  margin: 0;
  transform: translateY(-50%);
}

.permission-tree-module-actions {
  position: absolute;
  inset-inline-end: 10px;
  top: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  width: 250px;
  max-width: 250px;
  padding-inline: 6px;
  transform: translateY(-50%);
}

.permission-tree-select-all {
  justify-content: flex-end;
}

@media (max-width: 720px) {
  .bio-nexus-permission-tree {
    max-width: 100%;
  }

  .bio-nexus-permission-tree :deep(.tree-item:has(.permission-tree-module-actions)),
  .bio-nexus-permission-tree :deep(.tree-item-node:has(.permission-tree-module-actions)) {
    padding-inline-end: 12px;
  }

  .permission-tree-module-actions {
    position: static;
    width: auto;
    max-width: none;
    margin-block-start: 4px;
    transform: none;
  }

  .permission-tree-copy small {
    white-space: normal;
  }
  .permission-tree-permission-heading-action {
    grid-template-columns: 1fr;
    align-items: stretch;
  }
  .permission-tree-permission-copy strong,
  .permission-tree-permission-copy small {
    white-space: normal;
  }
}

/* TORO compact module heading */

.permission-tree-module-heading {
  display: inline-flex;
  align-items: center;
  gap: var(--toro-space-2);
  width: fit-content;
  max-width: 100%;
  min-height: 28px;
}

.permission-tree-module-heading strong {
  flex: 0 1 auto;
  max-width: 420px;
}

.permission-tree-module-heading .permission-tree-count {
  flex: 0 0 auto;
  margin-inline-start: var(--toro-space-1);
}

.permission-tree-module-checkbox {
  flex: 0 0 auto;
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: var(--toro-color-primary);
  cursor: pointer;
}

.permission-tree-module-checkbox:disabled {
  cursor: not-allowed;
}

.permission-tree-permission-heading {
  display: grid;
  gap: 1px;
  width: 100%;
  min-width: 0;
}
.permission-tree-permission-heading-action {
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--toro-space-3);
}
.permission-tree-permission-copy {
  display: grid;
  gap: 1px;
  min-width: 0;
}
.permission-tree-permission-copy strong,
.permission-tree-permission-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.permission-tree-module-actions {
  display: none !important;
}

@media (max-width: 720px) {
  .permission-tree-module-heading {
    flex-wrap: wrap;
  }

  .permission-tree-module-heading strong {
    max-width: 100%;
  }
}
</style>
