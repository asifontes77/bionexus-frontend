const sensitiveKeys = /password|token|secret|signaturePassword|authorization/i;
function sanitize(value) {
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, sensitiveKeys.test(key) ? "[REDACTED]" : entry]));
}
export const BioNexusLogHelper = {
  debug(message, context = {}) { if (import.meta.env.DEV) console.debug("[BioNexus]", message, sanitize(context)); },
  info(message, context = {}) { console.info("[BioNexus]", message, sanitize(context)); },
  warn(message, context = {}) { console.warn("[BioNexus]", message, sanitize(context)); },
  error(error, context = {}) {
    const normalized = error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : { message: String(error) };
    console.error("[BioNexus]", { timestamp: new Date().toISOString(), ...normalized, context: sanitize(context) });
  },
};
export function installBioNexusGlobalLogging(app) {
  app.config.errorHandler = (error, instance, info) => BioNexusLogHelper.error(error, { source: "vue", info, component: instance?.$options?.name ?? null, route: window.location.pathname });
  window.addEventListener("error", (event) => BioNexusLogHelper.error(event.error ?? event.message, { source: "window.error", file: event.filename, line: event.lineno, column: event.colno }));
  window.addEventListener("unhandledrejection", (event) => BioNexusLogHelper.error(event.reason, { source: "unhandledrejection", route: window.location.pathname }));
}
