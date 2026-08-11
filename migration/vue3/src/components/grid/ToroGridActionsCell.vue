<template>
  <div class="toro-grid-actions">
    <span v-for="(action, actionIndex) in visibleActions" :key="action.key" class="toro-grid-action-item"
      :style="{ marginLeft: actionIndex === 0 ? '0' : '6px' }">
      <ToroActionButton :label="action.label" :variant="action.variant || 'subtle'" size="sm"
        :disabled="isActionDisabled(action)" @click.stop="executeAction(action)" />
    </span>
  </div>
</template>

<script setup>
import { computed } from "vue";

import ToroActionButton from "@/components/ui/ToroActionButton.vue";

const props = defineProps({
  params: {
    type: Object,
    required: true,
  },
});

const visibleActions = computed(() => {
  const configuredActions =
    props.params.actions ||
    props.params.colDef?.cellRendererParams?.actions ||
    [];

  return configuredActions.filter((action) => {
    if (typeof action.visible === "function") {
      return action.visible(props.params.data);
    }

    return action.visible !== false;
  });
});

function isActionDisabled(action) {
  if (typeof action.disabled === "function") {
    return action.disabled(props.params.data);
  }

  return action.disabled === true;
}

function executeAction(action) {
  if (isActionDisabled(action)) {
    return;
  }

  action.onClick?.(
    props.params.data,
    props.params,
  );
}
</script>

<style scoped>
.toro-grid-actions {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: auto;
  min-width: 0;
  min-height: 100%;
  padding-inline: 6px;
  box-sizing: border-box;
  white-space: nowrap;
}

.toro-grid-action-item {
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
}
</style>
