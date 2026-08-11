<template>
  <button
    :type="type"
    class="toro-action-button"
    :class="[
      `toro-action-button-${variant}`,
      `toro-action-button-${size}`,
      {
        'toro-action-button-block': block,
      },
    ]"
    :disabled="disabled || loading"
    :aria-busy="loading ? 'true' : undefined"
  >
    <span
      v-if="$slots.leading"
      class="toro-action-button-icon"
      aria-hidden="true"
    >
      <slot name="leading"></slot>
    </span>

    <span class="toro-action-button-label">
      <slot>{{ label }}</slot>
    </span>

    <span
      v-if="loading"
      class="toro-action-button-spinner"
      aria-hidden="true"
    ></span>

    <span
      v-else-if="$slots.trailing"
      class="toro-action-button-icon"
      aria-hidden="true"
    >
      <slot name="trailing"></slot>
    </span>
  </button>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "button",
    validator: (value) =>
      ["button", "submit", "reset"].includes(value),
  },
  variant: {
    type: String,
    default: "secondary",
    validator: (value) =>
      [
        "primary",
        "secondary",
        "subtle",
        "accent",
        "danger",
      ].includes(value),
  },
  size: {
    type: String,
    default: "md",
    validator: (value) =>
      ["sm", "md"].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  block: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.toro-action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--toro-space-2);
  min-width: 0;
  border: 1px solid transparent;
  border-radius: var(--toro-radius-md);
  font: inherit;
  font-weight: var(--toro-font-weight-bold);
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color 120ms ease,
    border-color 120ms ease,
    color 120ms ease,
    box-shadow 120ms ease;
}

.toro-action-button:focus-visible {
  outline: 3px solid var(--toro-color-accent-soft);
  outline-offset: 2px;
}

.toro-action-button:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.toro-action-button-sm {
  min-height: 32px;
  padding: 0 var(--toro-space-2);
  font-size: var(--toro-font-size-sm);
}

.toro-action-button-md {
  min-height: var(--toro-control-height);
  padding: 0 var(--toro-space-3);
  font-size: var(--toro-font-size-sm);
}

.toro-action-button-block {
  width: 100%;
}

.toro-action-button-primary {
  border-color: var(--toro-color-primary);
  background: var(--toro-color-primary);
  color: var(--toro-color-text-inverse);
}

.toro-action-button-primary:not(:disabled):hover {
  border-color: var(--toro-color-primary-strong);
  background: var(--toro-color-primary-strong);
}

.toro-action-button-secondary {
  border-color: var(--toro-color-border-strong);
  background: var(--toro-color-surface);
  color: var(--toro-color-primary-strong);
}

.toro-action-button-secondary:not(:disabled):hover {
  border-color: var(--toro-color-primary);
  background: var(--toro-color-info-soft);
}

.toro-action-button-subtle {
  border-color: var(--toro-color-border);
  background: var(--toro-color-surface-soft);
  color: var(--toro-color-primary-strong);
}

.toro-action-button-subtle:not(:disabled):hover {
  border-color: var(--toro-color-primary);
  background: var(--toro-color-info-soft);
}

.toro-action-button-accent {
  border-color: var(--toro-color-accent-border);
  background: var(--toro-color-accent-soft);
  color: var(--toro-color-accent-strong);
}

.toro-action-button-accent:not(:disabled):hover {
  border-color: var(--toro-color-accent);
  background: var(--toro-color-accent);
  color: var(--toro-color-text-inverse);
}

.toro-action-button-danger {
  border-color: var(--toro-color-border);
  background: var(--toro-color-surface);
  color: var(--toro-color-accent-strong);
}

.toro-action-button-danger:not(:disabled):hover {
  border-color: var(--toro-color-accent);
  background: var(--toro-color-accent-soft);
}

.toro-action-button-icon {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
}

.toro-action-button-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toro-action-button-spinner {
  width: 14px;
  height: 14px;
  flex: 0 0 auto;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: toro-action-button-spin 700ms linear infinite;
}

@keyframes toro-action-button-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
