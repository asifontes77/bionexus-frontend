<template>
  <router-view />
  <SessionLifecycle />
  <RequiredPasswordChangeDialog />
  <RegionalSettingsLifecycle />
  <BioNexusToastHost />
</template>

<script setup>
import SessionLifecycle from '@/components/session/SessionLifecycle.vue'
import RequiredPasswordChangeDialog from '@/components/session/RequiredPasswordChangeDialog.vue'
import RegionalSettingsLifecycle from '@/components/regional/RegionalSettingsLifecycle.vue'
import BioNexusToastHost from '@/components/ui/BioNexusToastHost.vue'
</script>
