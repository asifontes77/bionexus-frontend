<template>
  <v-app id="app">
    <v-main>
      <component :is="layout" />
    </v-main>
  </v-app>
</template>

<script>
import BlankLayout from '@/layouts/BlankLayout.vue'
import SuiteLayout from '@/layouts/SuiteLayout.vue'
const layouts = {
  BlankLayout,
  SuiteLayout
}
export default {
  name: 'App',
  computed: {
    layout() {
      return layouts[this.$route.meta.layout || 'SuiteLayout']
    },
  },
};
</script>
<style>
body {
  margin: 0 !important;
  overflow: hidden;
}
p {
    margin-bottom: 0 !important;
}
::-webkit-scrollbar {
  -webkit-appearance: none;
}
::-webkit-scrollbar:vertical {
  width: 12px;
  background-color: var(--v-gray100-base);
}
::-webkit-scrollbar-button:increment, ::-webkit-scrollbar-button {
  display: none;
}
::-webkit-scrollbar:horizontal {
  height: 12px;
  background-color: var(--v-gray100-base);
}
::-webkit-scrollbar-thumb {
  background-color: var(--v-gray300-base);
  border-radius: 20px;
  border: 2px solid var(--v-gray-base);
}
::-webkit-scrollbar-track {
  border-radius: 10px;
}
.rotate-item {
  animation: girar 2s infinite;
}
@keyframes girar {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.v-data-table > .v-data-table__wrapper tbody tr.v-data-table__expanded__content {
    box-shadow: none !important;
}
.canceled-row {
  background: #eeeeee !important;
}
.change-font .v-badge__badge {
  padding-top: 6px;
  font-size: 10px !important;
}
.narrow .v-list-item {
  padding: 0 8px;
}
.v-data-table-header th.multi-line-header {
  white-space: normal;
  word-break: break-word; /* Asegura que las palabras largas también se dividan */
}
.vue-toast-notification, .v-toast__item .v-toast__text {
  font-family: 'Arial', sans-serif; /* Cambia a la fuente que prefieras */
  font-size: 13px;
}
</style>
