<template>
  <dialog ref="dialog" class="bio-nexus-dialog" :class="dialogClasses" @cancel.prevent="requestClose" @click="onBackdropClick" @close="handleNativeClose">
    <section class="bio-nexus-dialog-shell">
      <header class="bio-nexus-dialog-header">
        <div class="bio-nexus-dialog-heading">
          <p v-if="kicker" class="bio-nexus-dialog-kicker">{{ kicker }}</p>
          <h2 class="bio-nexus-dialog-title">{{ title }}</h2>
          <small v-if="subtitle" class="bio-nexus-dialog-subtitle">{{ subtitle }}</small>
        </div>
        <div class="bio-nexus-dialog-header-actions">
          <slot name="header-actions" />
          <BioNexusDialogCloseButton @click="requestClose" />
        </div>
      </header>

      <section v-if="$slots.toolbar" class="bio-nexus-dialog-toolbar"><slot name="toolbar" /></section>
      <main class="bio-nexus-dialog-body" :class="{ 'bio-nexus-dialog-body-flush': bodyFlush }"><slot /></main>

      <footer v-if="$slots.footer || $slots['footer-status']" class="bio-nexus-dialog-footer">
        <div v-if="$slots['footer-status']" class="bio-nexus-dialog-footer-status"><slot name="footer-status" /></div>
        <div class="bio-nexus-dialog-footer-actions"><slot name="footer" /></div>
      </footer>
    </section>
  </dialog>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from "vue";
import BioNexusDialogCloseButton from "@/components/ui/BioNexusDialogCloseButton.vue";

const props = defineProps({
  kicker: { type: String, default: "" },
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },
  size: { type: String, default: "standard", validator: (value) => ["compact", "standard", "wide", "fullscreen"].includes(value) },
  bodyFlush: { type: Boolean, default: false },
  closeOnBackdrop: { type: Boolean, default: false },
  preventClose: { type: Boolean, default: false },
});
const emit = defineEmits(["before-close", "close", "opened"]);
const dialog = ref(null);
const previousFocus = ref(null);
const dialogClasses = computed(() => [`bio-nexus-dialog-size-${props.size}`]);

async function open() {
  if (!dialog.value || dialog.value.open) return;
  previousFocus.value = document.activeElement;
  dialog.value.showModal();
  await nextTick();
  dialog.value.querySelector("[autofocus], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])")?.focus({ preventScroll: true });
  emit("opened");
}

function requestClose() {
  if (props.preventClose) { emit("before-close"); return; }
  close();
}

function close(returnValue = "") {
  if (dialog.value?.open) dialog.value.close(returnValue);
}

function handleNativeClose() {
  previousFocus.value?.focus?.({ preventScroll: true });
  previousFocus.value = null;
  emit("close");
}

function onBackdropClick(event) {
  if (props.closeOnBackdrop && event.target === dialog.value) requestClose();
}

onBeforeUnmount(() => close());
defineExpose({ open, close, requestClose, element: dialog });
</script>
