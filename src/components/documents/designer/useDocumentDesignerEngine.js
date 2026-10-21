import { computed, ref } from "vue";
import { getDocumentDesign, saveDocumentDesign } from "@/services/documentDesignService.js";

export function useDocumentDesignerEngine(options) {
  const documentId = Number(options.documentId);
  const documentType = String(options.documentType || "").trim();
  const serializeDocument = options.serializeDocument;
  const restoreDocument = options.restoreDocument;

  if (!Number.isInteger(documentId) || documentId <= 0) throw new Error("El identificador del documento no es valido.");
  if (!documentType) throw new Error("El tipo documental es obligatorio.");
  if (typeof serializeDocument !== "function") throw new Error("serializeDocument es obligatorio.");
  if (typeof restoreDocument !== "function") throw new Error("restoreDocument es obligatorio.");

  const history = ref([]);
  const historyIndex = ref(-1);
  const savedDocument = ref("");
  const preview = ref(Boolean(options.initialPreview));
  const zoom = ref(Number(options.initialZoom) || 0.75);
  const busy = ref(false);

  const documentSnapshot = computed(() => JSON.stringify(serializeDocument()));
  const dirty = computed(() => documentSnapshot.value !== savedDocument.value);
  const canUndo = computed(() => historyIndex.value > 0);
  const canRedo = computed(() => historyIndex.value >= 0 && historyIndex.value < history.value.length - 1);

  function pushHistory() {
    const snapshot = documentSnapshot.value;
    if (history.value[historyIndex.value] === snapshot) return;
    history.value = history.value.slice(0, historyIndex.value + 1);
    history.value.push(snapshot);
    historyIndex.value = history.value.length - 1;
  }

  function undo() {
    if (!canUndo.value) return;
    historyIndex.value--;
    restoreDocument(history.value[historyIndex.value]);
  }

  function redo() {
    if (!canRedo.value) return;
    historyIndex.value++;
    restoreDocument(history.value[historyIndex.value]);
  }

  function markSaved() {
    savedDocument.value = documentSnapshot.value;
  }

  async function loadDocument() {
    return getDocumentDesign(documentId);
  }

  async function saveDocument(schemaVersion) {
    if (!dirty.value || busy.value) return false;
    busy.value = true;
    try {
      pushHistory();
      await saveDocumentDesign(documentId, { schemaVersion, documentJson: JSON.parse(documentSnapshot.value) });
      markSaved();
      return true;
    } finally {
      busy.value = false;
    }
  }

  return { history, historyIndex, savedDocument, preview, zoom, busy, documentSnapshot, dirty, canUndo, canRedo, pushHistory, undo, redo, markSaved, loadDocument, saveDocument };
}