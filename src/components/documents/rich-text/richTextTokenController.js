/** Returns the atomic rich-text token containing a DOM node. */
export function tokenFromNode(node) {
  const element = node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement;
  return element?.closest?.("[data-rich-token]") || null;
}

/**
 * Creates token behavior for a rich-text editor.
 * @param {object} options Controller options.
 * @returns {object} Token controller API.
 */
export function createRichTextTokenController({ editorRef, selection, capture, syncToolbar }) {
  function normalizeTokenSpans() {
    const editor = editorRef.value;
    if (!editor) return;
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      if (tokenFromNode(node)) continue;
      const value = node.nodeValue || "";
      const pattern = /\{\{[a-zA-Z0-9_.-]+\}\}/g;
      if (!pattern.test(value)) continue;
      pattern.lastIndex = 0;
      const fragment = document.createDocumentFragment();
      let offset = 0;
      for (const match of value.matchAll(pattern)) {
        if (match.index > offset) fragment.append(document.createTextNode(value.slice(offset, match.index)));
        const token = document.createElement("span");
        token.dataset.richToken = match[0].slice(2, -2);
        token.className = "rich-token";
        token.textContent = match[0];
        fragment.append(token);
        offset = match.index + match[0].length;
      }
      if (offset < value.length) fragment.append(document.createTextNode(value.slice(offset)));
      node.replaceWith(fragment);
    }
  }

  function tokenFormattingElement(token, eventTarget = null) {
    const target = eventTarget?.nodeType === Node.ELEMENT_NODE ? eventTarget : eventTarget?.parentElement;
    if (target && token.contains(target) && target !== token) return target;
    const formatted = [...token.querySelectorAll("font,span,b,strong,i,em,u")];
    return formatted.at(-1) || token;
  }

  function handleEditorClick(event) {
    const token = event.target.closest?.("[data-rich-token]") || null;
    if (token) {
      const formattingElement = tokenFormattingElement(token, event.target);
      selection.selectToken(token);
      syncToolbar(formattingElement);
      return;
    }
    selection.selectedAtomicToken.value = null;
    selection.saveSelection();
    syncToolbar();
  }

  function rangeBelongsToEditor(range) {
    const editor = editorRef.value;
    if (!editor || !range) return false;
    const container = range.commonAncestorContainer;
    const element = container?.nodeType === Node.ELEMENT_NODE ? container : container?.parentElement;
    return Boolean(element && (element === editor || editor.contains(element)));
  }

  function preserveTokenInsertionRange() {
    if (selection.selectionInsideEditor()) selection.saveSelection();
  }

  function insertToken(key) {
    const editor = editorRef.value;
    const browserSelection = globalThis.getSelection?.();
    if (!editor || !browserSelection) return;
    const preservedRange = selection.savedRange.value?.cloneRange?.() || null;
    const range = rangeBelongsToEditor(preservedRange) ? preservedRange : document.createRange();
    if (!rangeBelongsToEditor(preservedRange)) {
      range.selectNodeContents(editor);
      range.collapse(false);
    }
    editor.focus();
    browserSelection.removeAllRanges();
    browserSelection.addRange(range);
    range.deleteContents();
    const token = document.createElement("span");
    token.dataset.richToken = key;
    token.className = "rich-token";
    token.textContent = "{{" + key + "}}";
    range.insertNode(token);
    selection.selectToken(token);
    capture();
  }

  function handleEditorKeydown(event) {
    if (event.key !== "Enter") return;
    const browserSelection = globalThis.getSelection?.();
    const range = selection.selectionInsideEditor() ? browserSelection.getRangeAt(0) : null;
    const startToken = range ? tokenFromNode(range.startContainer) : null;
    const endToken = range ? tokenFromNode(range.endContainer) : null;
    const token = selection.selectedAtomicToken.value?.isConnected
      ? selection.selectedAtomicToken.value
      : startToken && startToken === endToken && selection.rangeSelectsOnlyToken(range, startToken)
        ? startToken
        : null;
    if (!token) return;
    event.preventDefault();
    event.stopPropagation();
    selection.placeCaretAfter(token, true);
    capture();
    syncToolbar();
  }

  return {
    normalizeTokenSpans,
    tokenFormattingElement,
    handleEditorClick,
    rangeBelongsToEditor,
    preserveTokenInsertionRange,
    insertToken,
    handleEditorKeydown
  };
}
