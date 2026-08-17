<template>
  <Teleport to="body">
    <section class="bio-nexus-toast-region" aria-label="Notificaciones" aria-live="polite" aria-relevant="additions removals">
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
              :aria-label="toast.paused ? 'Reanudar notificación' : 'Pausar notificación'"
              :title="toast.paused ? 'Reanudar' : 'Pausar'"
              @click="togglePauseStore(toast.id)"
            >
              <BioNexusIcon :name="toast.paused ? 'play_arrow' : 'pause'" :size="18" />
            </button>
            <button
              type="button"
              class="bio-nexus-toast-close"
              aria-label="Cerrar notificación"
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
let ticker = null;
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

onMounted(() => {
  ticker = globalThis.setInterval(() => {
    now.value = Date.now();
  }, 50);
});

onBeforeUnmount(() => {
  if (ticker) globalThis.clearInterval(ticker);
});
</script>
