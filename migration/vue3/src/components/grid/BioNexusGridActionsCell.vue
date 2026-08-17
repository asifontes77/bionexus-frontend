<template>
  <div class="bio-nexus-grid-action-list" role="group" aria-label="Acciones de la fila">
    <button
      v-for="action in visibleActions"
      :key="action.key"
      type="button"
      class="bio-nexus-grid-icon-action"
      :class="'bio-nexus-grid-icon-action-' + (action.variant || 'subtle')"
      :disabled="isDisabled(action)"
      :title="action.tooltip || action.label"
      :aria-label="action.tooltip || action.label"
      @pointerdown.stop
      @mousedown.prevent.stop
      @click.stop="runAction(action)"
    >
      <BioNexusIcon :name="resolveIcon(action)" :size="20" />
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";
import BioNexusIcon from "@/components/ui/BioNexusIcon.vue";

const props = defineProps({
  params: { type: Object, required: true },
});

const actions = computed(() =>
  Array.isArray(props.params?.actions) ? props.params.actions : [],
);
const visibleActions = computed(() =>
  actions.value.filter((action) =>
    typeof action.visible === "function"
      ? action.visible(props.params.data)
      : action.visible !== false,
  ),
);

const iconByKey = Object.freeze({
  activate: "toggle_on",
  authorization: "shield_person",
  change_status: "toggle_on",
  deactivate: "toggle_off",
  detail: "visibility",
  edit: "edit",
  permissions: "shield_person",
  roles: "badge",
  state: "manage_accounts",
  status: "toggle_on",
  update: "edit",
  view: "visibility",
});

function normalizedText(action) {
  return String(action?.key || action?.label || "").trim().toLowerCase();
}

function resolveIcon(action) {
  if (typeof action?.icon === "string" && action.icon.trim() !== "") {
    return action.icon.trim();
  }

  const value = normalizedText(action);
  if (iconByKey[value]) return iconByKey[value];
  if (value.includes("permiso")) return "shield_person";
  if (value.includes("rol")) return "badge";
  if (value.includes("inactivar") || value.includes("desactivar")) return "toggle_off";
  if (value.includes("activar")) return "toggle_on";
  if (value.includes("editar") || value.includes("modificar")) return "edit";
  if (value.includes("ver") || value.includes("detalle")) return "visibility";
  return "more_horiz";
}

function isDisabled(action) {
  return typeof action.disabled === "function"
    ? action.disabled(props.params.data)
    : action.disabled === true;
}

function runAction(action) {
  if (!isDisabled(action) && typeof action.onClick === "function") {
    action.onClick(props.params.data);
  }
}
</script>

<style scoped>
.bio-nexus-grid-action-list {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.bio-nexus-grid-icon-action {
  appearance: none;
  display: inline-grid;
  width: 32px;
  height: 32px;
  min-width: 32px;
  min-height: 32px;
  flex: 0 0 32px;
  place-items: center;
  margin: 0;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: 50%;
  outline: 0;
  background: transparent;
  box-shadow: none;
  color: var(--bio-nexus-color-primary-strong);
  cursor: pointer;
  transition: background-color 140ms ease, color 140ms ease, transform 140ms ease;
}

.bio-nexus-grid-icon-action:hover:not(:disabled) {
  background: var(--bio-nexus-color-selection-soft);
  color: var(--bio-nexus-color-primary);
  transform: translateY(-1px);
}

.bio-nexus-grid-icon-action-accent {
  color: var(--bio-nexus-color-accent-strong);
}

.bio-nexus-grid-icon-action-accent:hover:not(:disabled) {
  background: var(--bio-nexus-color-accent-soft);
  color: var(--bio-nexus-color-accent-strong);
}

.bio-nexus-grid-icon-action:focus {
  outline: 0;
  box-shadow: none;
}

.bio-nexus-grid-icon-action:focus-visible {
  background: var(--bio-nexus-color-selection-soft);
  outline: 2px solid var(--bio-nexus-color-primary);
  outline-offset: 2px;
}

.bio-nexus-grid-icon-action:disabled {
  background: transparent;
  cursor: not-allowed;
  opacity: 0.36;
}
</style>
