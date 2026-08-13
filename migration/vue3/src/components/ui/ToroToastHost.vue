<template>
  <Teleport to="body">
    <section class="toro-toast-region" aria-label="Notificaciones" aria-live="polite" aria-relevant="additions removals">
      <TransitionGroup name="toro-toast" tag="div" class="toro-toast-stack">
        <article
          v-for="toast in toasts"
          :key="toast.id"
          class="toro-toast"
          :class="['toro-toast-' + toast.type, { 'toro-toast-paused': toast.paused }]"
          role="status"
        >
          <ToroIcon :name="iconByType[toast.type]" :size="22" :filled="toast.type === 'success'" />
          <p>{{ toast.message }}</p>
          <div class="toro-toast-actions">
            <button
              v-if="toast.duration > 0"
              type="button"
              class="toro-toast-control"
              :aria-label="toast.paused ? 'Reanudar notificación' : 'Pausar notificación'"
              :title="toast.paused ? 'Reanudar' : 'Pausar'"
              @click="togglePauseStore(toast.id)"
            >
              <ToroIcon :name="toast.paused ? 'play_arrow' : 'pause'" :size="18" />
            </button>
            <button
              type="button"
              class="toro-toast-close"
              aria-label="Cerrar notificación"
              title="Cerrar"
              @click="remove(toast.id)"
            >
              <ToroIcon name="close" :size="18" />
            </button>
          </div>
          <span class="toro-toast-progress-track" aria-hidden="true">
            <span class="toro-toast-progress" :style="progressStyle(toast)" />
          </span>
        </article>
      </TransitionGroup>
    </section>
  </Teleport>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import ToroIcon from "@/components/ui/ToroIcon.vue";
import { useToroToast } from "@/composables/useToroToast";

const {
  toasts,
  togglePause: togglePauseStore,
  remove,
} = useToroToast();
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
