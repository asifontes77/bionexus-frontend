<template>
  <router-view />
  <SessionLifecycle />
  <BioNexusToastHost />
</template>

<script setup>
import SessionLifecycle from '@/components/session/SessionLifecycle.vue'
import BioNexusToastHost from '@/components/ui/BioNexusToastHost.vue'
</script>
