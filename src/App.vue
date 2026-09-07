<template>
  <router-view />
  <SessionLifecycle />
  <RegionalSettingsLifecycle />
  <BioNexusToastHost />
</template>

<script setup>
import SessionLifecycle from '@/components/session/SessionLifecycle.vue'
import RegionalSettingsLifecycle from '@/components/regional/RegionalSettingsLifecycle.vue'
import BioNexusToastHost from '@/components/ui/BioNexusToastHost.vue'
</script>
