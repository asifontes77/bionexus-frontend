<template>
  <nav class="bio-nexus-tabs" :aria-label="ariaLabel" role="tablist">
    <button
      v-for="tab in tabs"
      :id="`${idPrefix}-tab-${tab.key}`"
      :key="tab.key"
      type="button"
      role="tab"
      :aria-controls="`${idPrefix}-panel-${tab.key}`"
      :aria-selected="modelValue === tab.key"
      :tabindex="modelValue === tab.key ? 0 : -1"
      :class="{ 'bio-nexus-tab-active': modelValue === tab.key }"
      @click="select(tab.key)"
      @keydown.left.prevent="move(tab.key, -1)"
      @keydown.right.prevent="move(tab.key, 1)"
      @keydown.home.prevent="select(tabs[0]?.key)"
      @keydown.end.prevent="select(tabs[tabs.length - 1]?.key)"
    >
      {{ tab.label }}
    </button>
  </nav>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: String, required: true },
  tabs: {
    type: Array,
    required: true,
    validator: (value) => value.length > 0 && value.every((tab) => typeof tab?.key === 'string' && typeof tab?.label === 'string')
  },
  ariaLabel: { type: String, default: 'Secciones' },
  idPrefix: { type: String, default: 'bio-nexus' }
})

const emit = defineEmits(['update:modelValue'])

function select(key) {
  if (typeof key === 'string' && props.tabs.some((tab) => tab.key === key)) emit('update:modelValue', key)
}

function move(currentKey, direction) {
  const index = props.tabs.findIndex((tab) => tab.key === currentKey)
  if (index < 0) return
  const nextIndex = (index + direction + props.tabs.length) % props.tabs.length
  select(props.tabs[nextIndex].key)
}
</script>

<style scoped>
.bio-nexus-tabs {
  display: flex;
  gap: var(--bio-nexus-space-1);
  overflow-x: auto;
  padding: var(--bio-nexus-space-1);
  border: 1px solid var(--bio-nexus-color-border);
  border-radius: var(--bio-nexus-radius-md);
  background: var(--bio-nexus-color-surface);
}

.bio-nexus-tabs button {
  min-height: var(--bio-nexus-control-height);
  padding: 0 var(--bio-nexus-space-4);
  border: 0;
  border-radius: var(--bio-nexus-radius-sm);
  background: transparent;
  color: var(--bio-nexus-color-text-secondary);
  font: inherit;
  font-weight: var(--bio-nexus-font-weight-bold);
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 120ms ease, color 120ms ease, box-shadow 120ms ease;
}

.bio-nexus-tabs button:hover {
  background: var(--bio-nexus-color-surface-soft);
  color: var(--bio-nexus-color-primary-strong);
}

.bio-nexus-tabs button:focus-visible {
  outline: 2px solid var(--bio-nexus-color-primary);
  outline-offset: 2px;
}

.bio-nexus-tabs button.bio-nexus-tab-active {
  background: var(--bio-nexus-color-selection-soft);
  color: var(--bio-nexus-color-primary-strong);
  box-shadow: inset 0 -3px 0 var(--bio-nexus-color-accent);
}
</style>
