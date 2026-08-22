<template>
  <dialog ref="dialog" class="bio-nexus-dialog" :class="dialogClasses" tabindex="-1" @cancel.prevent="requestClose" @click="onBackdropClick" @close="handleNativeClose">
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
  const initialControl = dialog.value.querySelector("[autofocus], input:not([disabled]), select:not([disabled]), textarea:not([disabled])");
  if (initialControl) initialControl.focus({ preventScroll: true });
  else dialog.value.focus({ preventScroll: true });
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
<style>
/* BIO NEXUS DIALOG ENCAPSULATED LAYOUT V1 */
dialog.bio-nexus-dialog {
  box-sizing: border-box;
  margin: auto;
  padding: 0;
  border: 0;
  background: transparent;
  overflow: hidden;
  outline: none;
}

dialog.bio-nexus-dialog:focus,
dialog.bio-nexus-dialog:focus-visible {
  outline: none;
}

dialog.bio-nexus-dialog.bio-nexus-dialog-size-compact {
  width: min(520px, calc(100vw - 32px));
}

dialog.bio-nexus-dialog.bio-nexus-dialog-size-standard {
  width: min(720px, calc(100vw - 32px));
}

dialog.bio-nexus-dialog.bio-nexus-dialog-size-wide {
  width: min(1040px, calc(100vw - 48px));
  height: min(720px, calc(100dvh - 48px));
  max-height: calc(100dvh - 48px);
}

dialog.bio-nexus-dialog.bio-nexus-dialog-size-fullscreen {
  width: calc(100vw - 24px);
  height: calc(100dvh - 24px);
  max-width: none;
  max-height: none;
}

dialog.bio-nexus-dialog > .bio-nexus-dialog-shell {
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr) auto;
  box-sizing: border-box;
  width: 100%;
  min-height: 0;
  max-height: calc(100dvh - 48px);
  overflow: hidden;
  border: 1px solid var(--bio-nexus-color-border-strong);
  border-radius: var(--bio-nexus-radius-md);
  background: var(--bio-nexus-color-surface);
  box-shadow: var(--bio-nexus-shadow-md);
}

dialog.bio-nexus-dialog.bio-nexus-dialog-size-wide > .bio-nexus-dialog-shell,
dialog.bio-nexus-dialog.bio-nexus-dialog-size-fullscreen > .bio-nexus-dialog-shell {
  height: 100%;
}

dialog.bio-nexus-dialog > .bio-nexus-dialog-shell > .bio-nexus-dialog-header {
  min-height: 60px;
  padding: 8px 16px;
  background: var(--bio-nexus-color-surface-soft);
}

dialog.bio-nexus-dialog > .bio-nexus-dialog-shell > .bio-nexus-dialog-header .bio-nexus-dialog-close-button {
  flex: 0 0 38px;
  width: 38px;
  height: 38px;
}

dialog.bio-nexus-dialog > .bio-nexus-dialog-shell > .bio-nexus-dialog-body {
  box-sizing: border-box;
  min-width: 0;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  background: var(--bio-nexus-color-surface);
}

dialog.bio-nexus-dialog > .bio-nexus-dialog-shell > .bio-nexus-dialog-footer {
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  min-height: 54px;
  flex: 0 0 auto;
  overflow: visible;
  background: var(--bio-nexus-color-surface-soft);
}

@media (max-width: 720px) {
  dialog.bio-nexus-dialog.bio-nexus-dialog-size-wide,
  dialog.bio-nexus-dialog.bio-nexus-dialog-size-fullscreen {
    width: calc(100vw - 16px);
    height: calc(100dvh - 16px);
    max-height: calc(100dvh - 16px);
  }
}


/* BIO NEXUS DIALOG SIZE AWARE LAYOUT V3 START */
dialog.bio-nexus-dialog {
  box-sizing: border-box;
  margin: auto;
  padding: 0;
  border: 0;
  background: transparent;
  overflow: hidden;
}

dialog.bio-nexus-dialog > .bio-nexus-dialog-shell {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  min-height: 0;
  overflow: hidden;
}

dialog.bio-nexus-dialog.bio-nexus-dialog-size-compact,
dialog.bio-nexus-dialog.bio-nexus-dialog-size-standard {
  height: auto;
  max-height: calc(100dvh - 48px);
}

dialog.bio-nexus-dialog.bio-nexus-dialog-size-compact > .bio-nexus-dialog-shell,
dialog.bio-nexus-dialog.bio-nexus-dialog-size-standard > .bio-nexus-dialog-shell {
  height: auto;
  max-height: calc(100dvh - 48px);
}

dialog.bio-nexus-dialog.bio-nexus-dialog-size-compact > .bio-nexus-dialog-shell > .bio-nexus-dialog-body,
dialog.bio-nexus-dialog.bio-nexus-dialog-size-standard > .bio-nexus-dialog-shell > .bio-nexus-dialog-body {
  flex: 0 1 auto;
  min-height: 0;
  overflow: visible;
}

dialog.bio-nexus-dialog.bio-nexus-dialog-size-wide {
  width: min(1040px, calc(100vw - 48px));
  height: min(720px, calc(100dvh - 48px));
  max-height: calc(100dvh - 48px);
}

dialog.bio-nexus-dialog.bio-nexus-dialog-size-fullscreen {
  width: calc(100vw - 24px);
  height: calc(100dvh - 24px);
  max-width: none;
  max-height: none;
}

dialog.bio-nexus-dialog.bio-nexus-dialog-size-wide > .bio-nexus-dialog-shell,
dialog.bio-nexus-dialog.bio-nexus-dialog-size-fullscreen > .bio-nexus-dialog-shell {
  height: 100%;
  max-height: 100%;
}

dialog.bio-nexus-dialog.bio-nexus-dialog-size-wide > .bio-nexus-dialog-shell > .bio-nexus-dialog-body,
dialog.bio-nexus-dialog.bio-nexus-dialog-size-fullscreen > .bio-nexus-dialog-shell > .bio-nexus-dialog-body {
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
}

dialog.bio-nexus-dialog > .bio-nexus-dialog-shell > .bio-nexus-dialog-header,
dialog.bio-nexus-dialog > .bio-nexus-dialog-shell > .bio-nexus-dialog-toolbar,
dialog.bio-nexus-dialog > .bio-nexus-dialog-shell > .bio-nexus-dialog-footer {
  flex: 0 0 auto;
}

dialog.bio-nexus-dialog > .bio-nexus-dialog-shell > .bio-nexus-dialog-footer {
  position: relative;
  z-index: 2;
  box-sizing: border-box;
  width: 100%;
  min-height: 54px;
  overflow: visible;
}
/* BIO NEXUS DIALOG SIZE AWARE LAYOUT V3 END */
/* BIO NEXUS DIALOG SMALL CENTERING V4 START */
dialog.bio-nexus-dialog.bio-nexus-dialog-size-compact,
dialog.bio-nexus-dialog.bio-nexus-dialog-size-standard {
  position: fixed;
  inset: 0;
  top: 50%;
  bottom: auto;
  margin: 0 auto;
  height: auto;
  max-height: calc(100dvh - 48px);
  transform: translateY(-50%);
}

dialog.bio-nexus-dialog.bio-nexus-dialog-size-compact > .bio-nexus-dialog-shell,
dialog.bio-nexus-dialog.bio-nexus-dialog-size-standard > .bio-nexus-dialog-shell {
  height: auto;
  max-height: calc(100dvh - 48px);
}

@media (max-height: 520px) {
  dialog.bio-nexus-dialog.bio-nexus-dialog-size-compact,
  dialog.bio-nexus-dialog.bio-nexus-dialog-size-standard {
    top: 24px;
    bottom: 24px;
    max-height: calc(100dvh - 48px);
    transform: none;
  }
}
/* BIO NEXUS DIALOG SMALL CENTERING V4 END */</style>
