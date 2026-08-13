<template>
  <ToroIcon :name="iconName" :size="size" aria-hidden="true" />
</template>

<script setup>
import { computed } from "vue";
import ToroIcon from "@/components/ui/ToroIcon.vue";

const props = defineProps({
  action: { type: String, required: true },
  size: { type: Number, default: 19 },
});

const actionIcons = Object.freeze({
  save: "save",
  create: "add",
  createUser: "person_add",
  cancel: "close",
  close: "close",
  refresh: "refresh",
  edit: "edit",
  activate: "person_check",
  deactivate: "person_off",
  assignRoles: "manage_accounts",
  assignPermissions: "badge",
  catalog: "category",
  discard: "undo",
  search: "search",
  clear: "filter_alt_off",
});
const iconName = computed(() => actionIcons[props.action] || "bolt");
</script>
