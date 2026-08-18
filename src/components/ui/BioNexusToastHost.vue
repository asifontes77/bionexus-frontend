<template>
  <Teleport :to="teleportTarget">
    <section data-bio-nexus-toast-host class="bio-nexus-toast-region bio-nexus-toast-top-layer" aria-label="Notificaciones" aria-live="polite" aria-relevant="additions removals">
      <TransitionGroup name="bio-nexus-toast" tag="div" class="bio-nexus-toast-stack">
        <article
          v-for="toast in toasts"
          :key="toast.id"
          class="bio-nexus-toast"
          :class="['bio-nexus-toast-' + toast.type, { 'bio-nexus-toast-paused': toast.paused }]"
          role="status"
        >
          <BioNexusIcon :name="iconByType[toast.type]" :size="22" :filled="toast.type === 'success'" />
          <p>{{ toast.message }}</p>
          <div class="bio-nexus-toast-actions">
            <button
              v-if="toast.duration > 0"
              type="button"
              class="bio-nexus-toast-control"
              :aria-label="toast.paused ? 'Reanudar notificaciÃ³n' : 'Pausar notificaciÃ³n'"
              :title="toast.paused ? 'Reanudar' : 'Pausar'"
              @click="togglePauseStore(toast.id)"
            >
              <BioNexusIcon :name="toast.paused ? 'play_arrow' : 'pause'" :size="18" />
            </button>
            <button
              type="button"
              class="bio-nexus-toast-close"
              aria-label="Cerrar notificaciÃ³n"
              title="Cerrar"
              @click="remove(toast.id)"
            >
              <BioNexusIcon name="close" :size="18" />
            </button>
          </div>
          <span class="bio-nexus-toast-progress-track" aria-hidden="true">
            <span class="bio-nexus-toast-progress" :style="progressStyle(toast)" />
          </span>
        </article>
      </TransitionGroup>
    </section>
  </Teleport>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import BioNexusIcon from "@/components/ui/BioNexusIcon.vue";
import { useBioNexusToast } from "@/composables/useBioNexusToast";

const {
  toasts,
  togglePause: togglePauseStore,
  remove,
} = useBioNexusToast();

const now = ref(Date.now());
const teleportTarget = ref("body");
let ticker = null;
let dialogObserver = null;

const iconByType = Object.freeze({
  success: "check_circle",
  info: "info",
  warning: "warning",
  error: "error",
});

function progressStyle(toast) {
  if (toast.duration <= 0) return { transform: "scaleX(1)" };
  const remaining = toast.paused
    ? toast.remaining
    : Math.max(0, toast.remaining - (now.value - toast.startedAt));
  const ratio = Math.max(0, Math.min(1, remaining / toast.duration));
  return { transform: "scaleX(" + ratio + ")" };
}

function updateTeleportTarget() {
  const openDialogs = Array.from(document.querySelectorAll("dialog[open]"));
  teleportTarget.value = openDialogs.at(-1) ?? document.body;
}

onMounted(() => {
  ticker = globalThis.setInterval(() => {
    now.value = Date.now();
  }, 50);

  dialogObserver = new MutationObserver(updateTeleportTarget);
  dialogObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ["open"],
    childList: true,
    subtree: true,
  });
  updateTeleportTarget();
});

onBeforeUnmount(() => {
  if (ticker) globalThis.clearInterval(ticker);
  dialogObserver?.disconnect();
});
</script>

<style>
.bio-nexus-toast-top-layer {
  position: fixed;
  z-index: 2147483000 !important;
  pointer-events: none;
}
.bio-nexus-toast-top-layer > * { pointer-events: auto; }
dialog[open] > .bio-nexus-toast-top-layer {
  inset-block-start: var(--bio-nexus-space-4);
  inset-inline-end: var(--bio-nexus-space-4);
}
</style>
