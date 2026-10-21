<template>
  <RichTextEditorDialog ref="editor" :tokens="tokens" @apply="emit('apply', $event)" />
</template>

<script setup>
import { ref } from "vue";
import RichTextEditorDialog from "../rich-text/RichTextEditorDialog.vue";

const props = defineProps({ tokens: { type: Array, default: () => [] } });
const emit = defineEmits(["apply"]);
const editor = ref(null);
const tokens = props.tokens;

/** Opens the shared rich-text editor with an empty document value. */
function openCreate() {
  return editor.value?.openCreate();
}

/** Opens the shared rich-text editor with an existing document value. */
function openEdit(value) {
  return editor.value?.openEdit(value);
}

defineExpose({ openCreate, openEdit });
</script>
