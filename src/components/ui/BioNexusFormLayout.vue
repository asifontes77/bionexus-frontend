<template>
  <div class="bio-nexus-form-layout"><slot /></div>
</template>
<style>
.bio-nexus-form-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0;
  min-width: 0;
}

.bio-nexus-form-layout > * + * {
  margin-block-start: var(--bio-nexus-space-4);
}
</style>
