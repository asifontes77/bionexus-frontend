<template>
  <div
    class="bio-nexus-form-field"
    :class="{
      'bio-nexus-form-field-error': hasError,
      'bio-nexus-form-field-disabled': disabled,
      'bio-nexus-form-field-wide': wide,
    }"
  >
    <div class="bio-nexus-form-field-control">
      <span class="bio-nexus-form-field-label">
        {{ label }}
        <span
          v-if="required"
          class="bio-nexus-form-field-required"
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
      class="bio-nexus-form-field-message bio-nexus-form-field-message-error"
      role="alert"
    >
      {{ error }}
    </small>

    <small
      v-else-if="help"
      :id="helpId"
      class="bio-nexus-form-field-message"
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
.bio-nexus-form-field {
  display: grid;
  align-content: start;
  gap: var(--bio-nexus-space-1);
  min-width: 0;
}

.bio-nexus-form-field-wide {
  grid-column: 1 / -1;
}

.bio-nexus-form-field-control {
  position: relative;
  min-width: 0;
  padding-block-start: 7px;
}

.bio-nexus-form-field-label {
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
  color: var(--bio-nexus-color-text-muted);
  background: var(--bio-nexus-color-surface);
  font-size: var(--bio-nexus-font-size-xs);
  font-weight: var(--bio-nexus-font-weight-bold);
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: none;
}

.bio-nexus-form-field-required {
  color: var(--bio-nexus-color-danger, #b42318);
}

.bio-nexus-form-field-control :deep(input.bio-nexus-field),
.bio-nexus-form-field-control :deep(select.bio-nexus-field) {
  width: 100%;
  min-height: 46px;
  margin: 0;
  padding-block-start: 12px;
  padding-block-end: 7px;
}

.bio-nexus-form-field-control :deep(.bio-nexus-field) {
  width: 100%;
  margin: 0;
}

.bio-nexus-form-field-control :deep(textarea.bio-nexus-field) {
  padding-block-start: 18px;
}

.bio-nexus-form-field-error .bio-nexus-form-field-label {
  color: var(--bio-nexus-color-danger, #b42318);
}

.bio-nexus-form-field-error
  .bio-nexus-form-field-control
  :deep(.bio-nexus-field) {
  border-color: var(--bio-nexus-color-danger, #b42318);
  box-shadow: 0 0 0 3px rgb(180 35 24 / 12%);
}

.bio-nexus-form-field-disabled .bio-nexus-form-field-label {
  color: var(--bio-nexus-color-text-muted);
  background: var(--bio-nexus-color-surface-soft);
}

.bio-nexus-form-field-disabled
  .bio-nexus-form-field-control
  :deep(.bio-nexus-field) {
  border-color: var(--bio-nexus-color-border-strong);
  color: var(--bio-nexus-color-text-muted);
  background: var(--bio-nexus-color-surface-soft);
  cursor: not-allowed;
  opacity: 0.72;
}

.bio-nexus-form-field-message {
  display: block;
  padding-inline: 4px;
  color: var(--bio-nexus-color-text-muted);
  font-size: var(--bio-nexus-font-size-xs);
  line-height: 1.35;
}

.bio-nexus-form-field-message-error {
  color: var(--bio-nexus-color-danger, #b42318);
  font-weight: var(--bio-nexus-font-weight-bold);
}
</style>
