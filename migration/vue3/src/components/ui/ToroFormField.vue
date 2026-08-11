<template>
  <div
    class="toro-form-field"
    :class="{
      'toro-form-field-error': hasError,
      'toro-form-field-disabled': disabled,
      'toro-form-field-wide': wide,
    }"
  >
    <div class="toro-form-field-control">
      <span class="toro-form-field-label">
        {{ label }}
        <span
          v-if="required"
          class="toro-form-field-required"
          aria-hidden="true"
        >
          *
        </span>
      </span>

      <slot></slot>
    </div>

    <small
      v-if="error"
      :id="errorId"
      class="toro-form-field-message toro-form-field-message-error"
      role="alert"
    >
      {{ error }}
    </small>

    <small
      v-else-if="help"
      :id="helpId"
      class="toro-form-field-message"
    >
      {{ help }}
    </small>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  fieldId: {
    type: String,
    required: true,
  },
  help: {
    type: String,
    default: "",
  },
  error: {
    type: String,
    default: "",
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  wide: {
    type: Boolean,
    default: false,
  },
});

const hasError = computed(
  () => props.error !== "",
);

const errorId = computed(
  () => `${props.fieldId}-error`,
);

const helpId = computed(
  () => `${props.fieldId}-help`,
);
</script>

<style scoped>
.toro-form-field {
  display: grid;
  align-content: start;
  gap: var(--toro-space-1);
  min-width: 0;
}

.toro-form-field-wide {
  grid-column: 1 / -1;
}

.toro-form-field-control {
  position: relative;
  min-width: 0;
  padding-block-start: 7px;
}

.toro-form-field-label {
  position: absolute;
  z-index: 2;
  inset-block-start: 0;
  inset-inline-start: 12px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  max-width: calc(100% - 24px);
  padding-inline: 5px;
  overflow: hidden;
  color: var(--toro-color-text-muted);
  background: var(--toro-color-surface);
  font-size: var(--toro-font-size-xs);
  font-weight: var(--toro-font-weight-bold);
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: none;
}

.toro-form-field-required {
  color: var(--toro-color-danger, #b42318);
}

.toro-form-field-control :deep(input.toro-field),
.toro-form-field-control :deep(select.toro-field) {
  width: 100%;
  min-height: 46px;
  margin: 0;
  padding-block-start: 12px;
  padding-block-end: 7px;
}

.toro-form-field-control :deep(.toro-field) {
  width: 100%;
  margin: 0;
}

.toro-form-field-control :deep(textarea.toro-field) {
  padding-block-start: 18px;
}

.toro-form-field-error .toro-form-field-label {
  color: var(--toro-color-danger, #b42318);
}

.toro-form-field-error
  .toro-form-field-control
  :deep(.toro-field) {
  border-color: var(--toro-color-danger, #b42318);
  box-shadow: 0 0 0 3px rgb(180 35 24 / 12%);
}

.toro-form-field-disabled .toro-form-field-label {
  color: var(--toro-color-text-muted);
  background: var(--toro-color-surface-soft);
}

.toro-form-field-disabled
  .toro-form-field-control
  :deep(.toro-field) {
  border-color: var(--toro-color-border-strong);
  color: var(--toro-color-text-muted);
  background: var(--toro-color-surface-soft);
  cursor: not-allowed;
  opacity: 0.72;
}

.toro-form-field-message {
  display: block;
  padding-inline: 4px;
  color: var(--toro-color-text-muted);
  font-size: var(--toro-font-size-xs);
  line-height: 1.35;
}

.toro-form-field-message-error {
  color: var(--toro-color-danger, #b42318);
  font-weight: var(--toro-font-weight-bold);
}
</style>
