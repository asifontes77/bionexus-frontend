<template>
  <header class="bio-nexus-admin-page-header" :aria-labelledby="titleId">
    <div class="bio-nexus-admin-page-icon" aria-hidden="true">
      <BioNexusIcon :name="icon" :size="28" />
    </div>
    <div class="bio-nexus-admin-page-header-copy">
      <p v-if="eyebrow" class="bio-nexus-admin-page-eyebrow">{{ eyebrow }}</p>
      <h1 :id="titleId">{{ title }}</h1>
      <p v-if="description" class="bio-nexus-admin-page-description">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="bio-nexus-admin-page-header-actions"><slot name="actions" /></div>
  </header>
</template>
<script setup>
import BioNexusIcon from '@/components/ui/BioNexusIcon.vue'

defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  titleId: { type: String, required: true },
  icon: { type: String, required: true },
})
</script>
<style scoped>
.bio-nexus-admin-page-header {
  position: relative;
  font-family: var(--bio-nexus-font-family);
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr) auto;
  align-items: center;
  gap: 15px;
  min-width: 0;
  padding: 16px 20px;
  overflow: hidden;
  border: 1px solid var(--bio-nexus-color-border-strong);
  border-radius: var(--bio-nexus-radius-lg);
  background: linear-gradient(110deg, var(--bio-nexus-color-surface) 0%, var(--bio-nexus-color-accent-soft) 100%);
  box-shadow: var(--bio-nexus-shadow-sm);
}
.bio-nexus-admin-page-header::before {
  position: absolute;
  top: 0;
  right: 22px;
  left: 22px;
  height: 3px;
  border-radius: 0 0 999px 999px;
  background: linear-gradient(90deg, var(--bio-nexus-color-primary), var(--bio-nexus-color-accent));
  content: '';
}
.bio-nexus-admin-page-icon {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border: 1px solid var(--bio-nexus-color-accent-border);
  border-radius: var(--bio-nexus-radius-lg);
  color: var(--bio-nexus-color-primary-strong);
  background: var(--bio-nexus-color-surface);
  box-shadow: var(--bio-nexus-shadow-sm);
}
.bio-nexus-admin-page-header-copy {
  display: grid;
  gap: 3px;
  min-width: 0;
}
.bio-nexus-admin-page-header h1 {
  margin: 0;
  color: var(--bio-nexus-color-text);
  font-size: var(--bio-nexus-font-size-display);
  line-height: 1.12;
  font-weight: var(--bio-nexus-font-weight-heavy);
}
.bio-nexus-admin-page-eyebrow,
.bio-nexus-admin-page-description { margin: 0; }
.bio-nexus-admin-page-eyebrow {
  color: var(--bio-nexus-color-primary-strong);
  font-size: var(--bio-nexus-font-size-xs);
  font-weight: var(--bio-nexus-font-weight-bold);
  letter-spacing: .08em;
  text-transform: uppercase;
}
.bio-nexus-admin-page-description {
  max-width: 820px;
  color: var(--bio-nexus-color-text-muted-strong);
  font-size: var(--bio-nexus-font-size-lg);
  line-height: 1.45;
}
.bio-nexus-admin-page-header-actions {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: var(--bio-nexus-space-2);
  min-width: min(340px, 30vw);
  flex-wrap: wrap;
}
@media (max-width: 820px) {
  .bio-nexus-admin-page-header { grid-template-columns: 44px minmax(0, 1fr); padding: 15px 16px; border-radius: var(--bio-nexus-radius-lg); }
  .bio-nexus-admin-page-header-actions { grid-column: 1 / -1; width: 100%; min-width: 0; justify-content: flex-start; padding-top: 4px; }
}
@media (max-width: 520px) {
  .bio-nexus-admin-page-header { grid-template-columns: 38px minmax(0, 1fr); gap: 11px; padding: 13px 13px; border-radius: var(--bio-nexus-radius-lg); }
  .bio-nexus-admin-page-header::before { right: 14px; left: 14px; }
  .bio-nexus-admin-page-icon { width: 38px; height: 38px; border-radius: var(--bio-nexus-radius-md); }
  .bio-nexus-admin-page-description { font-size: var(--bio-nexus-font-size-md); }
}
</style>
