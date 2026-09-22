<template>
  <button
    :type="type"
    class="bio-nexus-action-button"
    :class="[
      `bio-nexus-action-button-${variant}`,
      `bio-nexus-action-button-${size}`,
      `bio-nexus-action-button-${shape}`,
      {
        'bio-nexus-action-button-block': block,
        'bio-nexus-action-button-icon-only': iconOnly,
      },
    ]"
    :disabled="disabled || loading"
    :title="iconOnly ? accessibleLabel : undefined"
    :aria-label="iconOnly ? accessibleLabel : undefined"
    :aria-busy="loading ? 'true' : undefined"
    @pointerup="releasePointerFocus"
  >
    <span v-if="loading" class="bio-nexus-action-button-spinner" aria-hidden="true"></span>
    <span v-else-if="icon || $slots.leading" class="bio-nexus-action-button-icon" aria-hidden="true">
      <BioNexusActionIcon v-if="icon" :action="icon" :size="iconSize" />
      <slot v-else name="leading"></slot>
    </span>
    <span v-if="!iconOnly" class="bio-nexus-action-button-label"><slot>{{ label }}</slot></span>
    <span v-if="!loading && !iconOnly && $slots.trailing" class="bio-nexus-action-button-icon" aria-hidden="true"><slot name="trailing"></slot></span>
  </button>
</template>

<script setup>
import { computed } from "vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
const props = defineProps({
  label: { type: String, default: "" },
  icon: { type: String, default: "" },
  iconOnly: { type: Boolean, default: false },
  type: { type: String, default: "button", validator: value => ["button", "submit", "reset"].includes(value) },
  variant: { type: String, default: "secondary", validator: value => ["primary", "secondary", "subtle", "accent", "danger"].includes(value) },
  size: { type: String, default: "md", validator: value => ["sm", "md"].includes(value) },
  shape: { type: String, default: "rounded", validator: value => ["rounded", "circle"].includes(value) },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
});
const iconSize = computed(() => props.size === "sm" ? 17 : 19);
const accessibleLabel = computed(() => props.label || "Accion");

function releasePointerFocus(event) {
  event.currentTarget?.blur?.();
}
</script>

<style scoped>
.bio-nexus-action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--bio-nexus-space-2);
  min-width: 0;
  border: 1px solid transparent;
  border-radius: var(--bio-nexus-radius-md);
  font: inherit;
  font-weight: var(--bio-nexus-font-weight-bold);
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color 120ms ease,
    border-color 120ms ease,
    color 120ms ease,
    box-shadow 120ms ease;
}

.bio-nexus-action-button:focus:not(:focus-visible) { outline: none; }
.bio-nexus-action-button:focus-visible {
  outline: 2px solid var(--bio-nexus-color-primary);
  outline-offset: 2px;
}

.bio-nexus-action-button:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.bio-nexus-action-button-sm {
  min-height: 32px;
  padding: 0 var(--bio-nexus-space-2);
  font-size: var(--bio-nexus-font-size-sm);
}

.bio-nexus-action-button-md {
  min-height: var(--bio-nexus-control-height);
  padding: 0 var(--bio-nexus-space-3);
  font-size: var(--bio-nexus-font-size-sm);
}

.bio-nexus-action-button-block {
  width: 100%;
}

.bio-nexus-action-button-primary {
  border-color: var(--bio-nexus-color-primary);
  background: var(--bio-nexus-color-primary);
  color: var(--bio-nexus-color-text-inverse);
}

.bio-nexus-action-button-primary:not(:disabled):hover {
  border-color: var(--bio-nexus-color-primary-strong);
  background: var(--bio-nexus-color-primary-strong);
}

.bio-nexus-action-button-secondary {
  border-color: var(--bio-nexus-color-border-strong);
  background: var(--bio-nexus-color-surface);
  color: var(--bio-nexus-color-primary-strong);
}

.bio-nexus-action-button-secondary:not(:disabled):hover {
  border-color: var(--bio-nexus-color-primary);
  background: var(--bio-nexus-color-info-soft);
}

.bio-nexus-action-button-subtle {
  border-color: var(--bio-nexus-color-border);
  background: var(--bio-nexus-color-surface-soft);
  color: var(--bio-nexus-color-primary-strong);
}

.bio-nexus-action-button-subtle:not(:disabled):hover {
  border-color: var(--bio-nexus-color-primary);
  background: var(--bio-nexus-color-info-soft);
}

.bio-nexus-action-button-accent {
  border-color: var(--bio-nexus-color-accent-border);
  background: var(--bio-nexus-color-accent-soft);
  color: var(--bio-nexus-color-accent-strong);
}

.bio-nexus-action-button-accent:not(:disabled):hover {
  border-color: var(--bio-nexus-color-accent);
  background: var(--bio-nexus-color-accent);
  color: var(--bio-nexus-color-text-inverse);
}

.bio-nexus-action-button-danger {
  border-color: var(--bio-nexus-color-border);
  background: var(--bio-nexus-color-surface);
  color: var(--bio-nexus-color-accent-strong);
}

.bio-nexus-action-button-danger:not(:disabled):hover {
  border-color: var(--bio-nexus-color-accent);
  background: var(--bio-nexus-color-accent-soft);
}

.bio-nexus-action-button-icon {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
}

.bio-nexus-action-button-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bio-nexus-action-button-spinner {
  width: 14px;
  height: 14px;
  flex: 0 0 auto;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: bio-nexus-action-button-spin 700ms linear infinite;
}

@keyframes bio-nexus-action-button-spin {
  to {
    transform: rotate(360deg);
  }
}

/* Bio Nexus BUTTON DEPTH CONTRACT START */
.bio-nexus-action-button {
  position: relative;
  border-bottom-color: color-mix(in srgb, currentColor 28%, var(--bio-nexus-color-border-strong));
  box-shadow: 0 2px 0 rgb(13 55 82 / 14%), 0 4px 10px rgb(13 55 82 / 10%);
  transform: translateY(0);
}
.bio-nexus-action-button-primary { background: var(--bio-nexus-color-primary); }
.bio-nexus-action-button-secondary { background: linear-gradient(180deg, #fff, var(--bio-nexus-color-surface-soft)); }
.bio-nexus-action-button:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 3px 0 rgb(13 55 82 / 16%), 0 7px 16px rgb(13 55 82 / 15%); }
.bio-nexus-action-button:not(:disabled):active { transform: translateY(1px); box-shadow: 0 1px 0 rgb(13 55 82 / 14%), 0 2px 5px rgb(13 55 82 / 10%); }
.bio-nexus-action-button:disabled { box-shadow: none; transform: none; filter: grayscale(.22) saturate(.72); }
/* Bio Nexus BUTTON DEPTH CONTRACT END */
.bio-nexus-action-button-circle { border-radius: 50%; }
.bio-nexus-action-button-icon-only { box-sizing: border-box; flex: 0 0 auto; padding: 0; }
.bio-nexus-action-button-icon-only.bio-nexus-action-button-md { width: 44px; min-width: 44px; height: 44px; }
.bio-nexus-action-button-icon-only.bio-nexus-action-button-sm { width: 32px; min-width: 32px; height: 32px; }
.bio-nexus-action-button-danger { border-color: var(--bio-nexus-color-danger); background: linear-gradient(180deg, color-mix(in srgb, var(--bio-nexus-color-danger) 82%, white), var(--bio-nexus-color-danger)); color: #fff; }
.bio-nexus-action-button-danger:not(:disabled):hover { border-color: color-mix(in srgb, var(--bio-nexus-color-danger) 82%, black); background: linear-gradient(180deg, var(--bio-nexus-color-danger), color-mix(in srgb, var(--bio-nexus-color-danger) 82%, black)); color: #fff; }
</style>
