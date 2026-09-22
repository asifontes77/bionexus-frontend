<template>
  <div class="bio-nexus-grid-action-list" role="group" aria-label="Acciones de la fila">
    <BioNexusActionButton
      v-for="action in visibleActions"
      :key="action.key"
      icon-only
      shape="circle"
      size="sm"
      :icon="resolveIcon(action)"
      :label="action.tooltip || action.label"
      :variant="action.variant || 'subtle'"
      :disabled="isDisabled(action)"
      @pointerdown.stop
      @mousedown.prevent.stop
      @click.stop="runAction(action, $event)"
    />
  </div>
</template>

<script setup>
import { computed } from "vue";
import BioNexusActionButton from "@/components/ui/BioNexusActionButton.vue";

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
  if (value.includes("desactivar") || value.includes("desactivar")) return "toggle_off";
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

function runAction(action, event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
  if (!isDisabled(action) && typeof action.onClick === "function") {
    action.onClick(props.params.data);
  }
}
</script>

<style scoped>
.bio-nexus-grid-action-list { display:flex; width:100%; align-items:center; justify-content:center; gap:8px; }
</style>
