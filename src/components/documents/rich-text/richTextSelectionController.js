import { ref } from "vue";
import { tokenFromNode } from "./richTextTokenController";

/**
 * Creates the selection and caret controller for a rich-text editor.
 * @param {object} options Controller options.
 * @param {import('vue').Ref<HTMLElement|null>} options.editorRef Editor element reference.
 * @param {(element?: Element|null) => void} options.onSelectionChange Selection synchronization callback.
 * @returns {object} Selection controller API.
 */
export function createRichTextSelectionController({ editorRef, onSelectionChange }) {
  const savedRange = ref(null);
  const selectedAtomicToken = ref(null);
  let selectionFrame = 0;

  function selectionInsideEditor() {
    const selection = globalThis.getSelection?.();
    return Boolean(selection?.rangeCount && editorRef.value?.contains(selection.getRangeAt(0).commonAncestorContainer));
  }

  function rangeSelectsOnlyToken(range, token) {
    if (!range || !token) return false;
    const tokenRange = document.createRange();
    tokenRange.selectNodeContents(token);
    return range.compareBoundaryPoints(Range.START_TO_START, tokenRange) === 0
      && range.compareBoundaryPoints(Range.END_TO_END, tokenRange) === 0;
  }

  function saveSelection() {
    const selection = globalThis.getSelection?.();
    if (!selectionInsideEditor()) return;
    const range = selection.getRangeAt(0);
    const startToken = tokenFromNode(range.startContainer);
    const endToken = tokenFromNode(range.endContainer);
    const sameToken = startToken && startToken === endToken ? startToken : null;
    const atomicToken = sameToken && (range.collapsed || rangeSelectsOnlyToken(range, sameToken)) ? sameToken : null;
    selectedAtomicToken.value = atomicToken;
    savedRange.value = range.cloneRange();
  }

  function restoreSelection() {
    editorRef.value?.focus();
    const selection = globalThis.getSelection?.();
    if (!selection || !savedRange.value) return;
    selection.removeAllRanges();
    selection.addRange(savedRange.value);
  }

  function selectionElement() {
    if (selectedAtomicToken.value?.isConnected) return selectedAtomicToken.value;
    const selection = globalThis.getSelection?.();
    if (!selection?.rangeCount) return editorRef.value;
    const node = selection.focusNode;
    return node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement;
  }

  function selectToken(token) {
    const selection = globalThis.getSelection?.();
    if (!selection || !token) return;
    selectedAtomicToken.value = token;
    const range = document.createRange();
    range.selectNodeContents(token);
    selection.removeAllRanges();
    selection.addRange(range);
    savedRange.value = range.cloneRange();
  }

  function placeCaretAfter(node, insertBreak = false) {
    const editor = editorRef.value;
    const selection = globalThis.getSelection?.();
    if (!editor || !selection || !node?.isConnected) return;
    const range = document.createRange();
    if (insertBreak) {
      const line = document.createElement("div");
      line.append(document.createElement("br"));
      node.after(line);
      range.setStart(line, 0);
    } else {
      range.setStartAfter(node);
    }
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    selectedAtomicToken.value = null;
    savedRange.value = range.cloneRange();
  }

  function handleDocumentSelectionChange() {
    if (!selectionInsideEditor()) return;
    globalThis.cancelAnimationFrame?.(selectionFrame);
    selectionFrame = globalThis.requestAnimationFrame?.(() => {
      saveSelection();
      onSelectionChange?.(selectionElement());
    }) || 0;
  }

  function startSelectionTracking() {
    document.addEventListener("selectionchange", handleDocumentSelectionChange);
  }

  function stopSelectionTracking() {
    document.removeEventListener("selectionchange", handleDocumentSelectionChange);
    globalThis.cancelAnimationFrame?.(selectionFrame);
  }

  return {
    savedRange,
    selectedAtomicToken,
    selectionInsideEditor,
    rangeSelectsOnlyToken,
    saveSelection,
    restoreSelection,
    selectionElement,
    selectToken,
    placeCaretAfter,
    startSelectionTracking,
    stopSelectionTracking
  };
}
