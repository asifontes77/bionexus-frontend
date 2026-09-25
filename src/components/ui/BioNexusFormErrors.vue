<template>
  <section v-if="normalizedErrors.length" class="bio-nexus-form-errors" role="alert" aria-live="assertive" aria-atomic="true">
    <ul>
      <li v-for="(message, index) in normalizedErrors" :key="`${index}-${message}`">{{ message }}</li>
    </ul>
  </section>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  errors: { type: [String, Array, Object], default: "" },
});

function collect(value) {
  if (Array.isArray(value)) return value.flatMap(collect);
  if (value && typeof value === "object") return Object.values(value).flatMap(collect);
  const message = String(value ?? "").trim();
  return message ? [message] : [];
}

const normalizedErrors = computed(() => [...new Set(collect(props.errors))]);
</script>
<style scoped>
.bio-nexus-form-errors {
  position: relative;
  padding: var(--bio-nexus-space-3) var(--bio-nexus-space-4);
  border: 1px solid var(--bio-nexus-color-danger, #b42318);
  border-inline-start: 5px solid var(--bio-nexus-color-danger, #b42318);
  border-radius: var(--bio-nexus-radius-md);
  background: linear-gradient(180deg, #fff 0%, var(--bio-nexus-color-danger-soft, #fff1f0) 100%);
  box-shadow:
    0 12px 28px rgb(180 35 24 / 14%),
    0 3px 8px rgb(15 23 42 / 10%),
    inset 0 1px 0 rgb(255 255 255 / 90%);
  color: var(--bio-nexus-color-danger, #b42318);
  font-size: var(--bio-nexus-font-size-sm);
  line-height: 1.45;
}
.bio-nexus-form-errors::before {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0 -1px 0 rgb(180 35 24 / 10%);
  content: "";
  pointer-events: none;
}
.bio-nexus-form-errors ul {
  position: relative;
  display: grid;
  gap: var(--bio-nexus-space-1);
  margin: 0;
  padding-inline-start: 1.25rem;
}
.bio-nexus-form-errors li {
  padding-inline-start: var(--bio-nexus-space-1);
}
.bio-nexus-form-errors li::marker {
  color: var(--bio-nexus-color-danger, #b42318);
  font-size: 1.05em;
}
</style>
