import { readonly, ref } from "vue";

const DEFAULT_DURATION = 4200;
const MAX_VISIBLE_TOASTS = 5;
const toasts = ref([]);
const timers = new Map();
let nextToastId = 1;

function clearTimer(id) {
  const timer = timers.get(id);
  if (timer) globalThis.clearTimeout(timer);
  timers.delete(id);
}

function remove(id) {
  clearTimer(id);
  toasts.value = toasts.value.filter((toast) => toast.id !== id);
}

function schedule(toast) {
  clearTimer(toast.id);
  if (toast.remaining <= 0) {
    remove(toast.id);
    return;
  }
  toast.startedAt = Date.now();
  timers.set(
    toast.id,
    globalThis.setTimeout(() => remove(toast.id), toast.remaining),
  );
}

function pause(id) {
  const toast = toasts.value.find((item) => item.id === id);
  if (!toast || toast.paused || toast.duration <= 0) return;
  toast.remaining = Math.max(
    0,
    toast.remaining - (Date.now() - toast.startedAt),
  );
  toast.paused = true;
  clearTimer(id);
}

function resume(id) {
  const toast = toasts.value.find((item) => item.id === id);
  if (!toast || !toast.paused || toast.duration <= 0) return;
  toast.paused = false;
  schedule(toast);
}

function togglePause(id) {
  const toast = toasts.value.find((item) => item.id === id);
  if (!toast || toast.duration <= 0) return;
  if (toast.paused) resume(id);
  else pause(id);
}

function show(message, options = {}) {
  const normalizedMessage = typeof message === "string" ? message.trim() : "";
  if (normalizedMessage === "") return null;
  const type = ["success", "info", "warning", "error"].includes(options.type)
    ? options.type
    : "info";
  const duration = Number.isFinite(options.duration)
    ? Math.max(0, options.duration)
    : DEFAULT_DURATION;

  const id = nextToastId++;
  const toast = {
    id,
    message: normalizedMessage,
    type,
    duration,
    remaining: duration,
    startedAt: Date.now(),
    paused: false,
  };
  const removed = toasts.value.slice(MAX_VISIBLE_TOASTS - 1);
  removed.forEach((item) => clearTimer(item.id));
  toasts.value = [
    toast,
    ...toasts.value.slice(0, MAX_VISIBLE_TOASTS - 1),
  ];
  if (duration > 0) schedule(toast);
  return id;
}

function clear() {
  Array.from(timers.keys()).forEach(clearTimer);
  toasts.value = [];
}

export function useToroToast() {
  return {
    toasts: readonly(toasts),
    show,
    success: (message, options = {}) => show(message, { ...options, type: "success" }),
    info: (message, options = {}) => show(message, { ...options, type: "info" }),
    warning: (message, options = {}) => show(message, { ...options, type: "warning" }),
    error: (message, options = {}) => show(message, { ...options, type: "error", duration: options.duration ?? 6500 }),
    pause,
    resume,
    togglePause,
    remove,
    clear,
  };
}
