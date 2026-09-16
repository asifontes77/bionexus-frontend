<template>
  <BioNexusStateDialog ref="dialog" :saving="saving" @confirm="row => emit('confirm', row)" />
</template>
<script setup>
import { ref } from 'vue'
import BioNexusStateDialog from '@/components/ui/BioNexusStateDialog.vue'
defineProps({ saving: Boolean })
const emit = defineEmits(['confirm'])
const dialog = ref(null)
const configuration = {
  kicker: 'Estado del tipo de muestra',
  isInactive: row => row?.annulled === true,
  activateTitle: 'Activar tipo de muestra',
  deactivateTitle: 'Inactivar tipo de muestra',
  activateMessage: 'El tipo de muestra volvera a estar disponible para nuevas selecciones.',
  deactivateMessage: 'El registro permanecera visible en este catalogo, pero no estara disponible para nuevas selecciones.',
  label: row => row?.description || 'Tipo de muestra seleccionado',
  dangerOnDeactivate: true,
}
defineExpose({
  open: row => dialog.value?.open(row, configuration),
  close: () => dialog.value?.close(),
  setError: value => dialog.value?.setError(value),
  clearError: () => dialog.value?.clearError(),
})
</script>
