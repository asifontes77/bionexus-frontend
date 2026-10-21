export const API_BASE_URL = String(import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "");

export function resolveApiUrl(path) {
  const value = String(path || "").trim();
  if (/^https?:\/\//i.test(value)) return value;
  const normalizedPath = value.startsWith("/") ? value : `/${value}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export function resolveSocketNamespace(namespace) {
  const normalizedNamespace = String(namespace || "").startsWith("/")
    ? String(namespace)
    : `/${String(namespace || "")}`;
  return API_BASE_URL ? `${API_BASE_URL}${normalizedNamespace}` : normalizedNamespace;
}

export function resolvePublicAssetUrl(value, fallbackFolder = "") {
  const source = String(value || "").trim();
  if (!source) return "";
  if (/^(?:https?:|blob:|data:)/i.test(source)) return source;

  const cleanSource = source.replace(/^\/+/, "");
  const cleanFolder = String(fallbackFolder || "").trim().replace(/^\/+|\/+$/g, "");
  const relativePath = cleanSource.startsWith("api/public/")
    ? `/${cleanSource}`
    : `/api/public/${cleanSource.includes("/") || !cleanFolder ? cleanSource : `${cleanFolder}/${cleanSource}`}`;
  const encodedPath = relativePath
    .split("/")
    .map((segment, index) => index === 0 ? "" : encodeURIComponent(decodeURIComponent(segment)))
    .join("/");

  return resolveApiUrl(encodedPath);
}