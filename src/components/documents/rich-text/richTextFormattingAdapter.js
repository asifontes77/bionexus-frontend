/**
 * Builds the formatting inheritance chain from the selected element to the editor.
 * @param {Element|null} element Selected DOM element.
 * @param {HTMLElement|null} editor Rich-text editor root.
 * @returns {Element[]} Formatting inheritance chain.
 */
export function formattingChain(element, editor) {
  const chain = [];
  let current = element;
  while (current && current !== editor) {
    if (current.nodeType === Node.ELEMENT_NODE) chain.push(current);
    current = current.parentElement;
  }
  if (editor) chain.push(editor);
  return chain;
}

function firstExplicitValue(chain, reader) {
  for (const item of chain) {
    const value = reader(item);
    if (value !== null && value !== undefined && String(value).trim() !== "") return value;
  }
  return null;
}

function firstComputedValue(chain, reader, accept = value => String(value || "").trim() !== "") {
  for (const item of chain) {
    const value = reader(getComputedStyle(item));
    if (accept(value)) return value;
  }
  return null;
}

function isVisibleColor(value) {
  const normalized = String(value || "").replace(/\s+/g, "").toLowerCase();
  return normalized !== "" && normalized !== "transparent" && normalized !== "rgba(0,0,0,0)";
}

/**
 * Converts a CSS RGB color to hexadecimal while preserving a controlled fallback.
 * @param {string|null|undefined} value CSS color.
 * @param {string} fallback Fallback hexadecimal color.
 * @returns {string} Hexadecimal color.
 */
export function rgbToHex(value, fallback) {
  const source = String(value || "").trim().toLowerCase();
  if (!isVisibleColor(source)) return fallback;
  if (/^#[0-9a-f]{6}$/i.test(source)) return source;
  const match = source.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/);
  if (!match || match[4] !== undefined && Number(match[4]) === 0) return fallback;
  return "#" + match.slice(1, 4).map(item => Number(item).toString(16).padStart(2, "0")).join("");
}

/**
 * Returns whether underline is explicitly or effectively active in the formatting chain.
 * @param {Element[]} chain Formatting inheritance chain.
 * @returns {boolean} True when underline is active.
 */
export function hasUnderline(chain) {
  return chain.some(item => {
    if (item.tagName === "U") return true;
    const inline = String(item.style?.textDecorationLine || item.style?.textDecoration || "").toLowerCase();
    const computed = getComputedStyle(item);
    const effective = String(computed.textDecorationLine || computed.textDecoration || "").toLowerCase();
    return inline.includes("underline") || effective.includes("underline");
  });
}

/**
 * Reads toolbar state from explicit wrappers before falling back to computed styles.
 * @param {Element|null} element Selected element.
 * @param {HTMLElement|null} editor Editor root.
 * @param {object} fallback Default object formatting.
 * @returns {object} Toolbar state.
 */
export function readRichTextToolbarState(element, editor, fallback) {
  const chain = formattingChain(element, editor);
  const style = element ? getComputedStyle(element) : null;
  const explicitWeight = firstExplicitValue(chain, item => item.style?.fontWeight);
  const weight = String(explicitWeight || firstComputedValue(chain, value => value.fontWeight) || "").toLowerCase();
  const explicitStyle = firstExplicitValue(chain, item => item.style?.fontStyle);
  const fontStyle = String(explicitStyle || firstComputedValue(chain, value => value.fontStyle) || "").toLowerCase();
  const family = firstExplicitValue(chain, item => item.style?.fontFamily || item.getAttribute?.("face"))
    || firstComputedValue(chain, value => value.fontFamily);
  const sizeValue = firstExplicitValue(chain, item => item.style?.fontSize)
    || firstComputedValue(chain, value => value.fontSize);
  const textColor = firstExplicitValue(chain, item => item.style?.color || item.getAttribute?.("color"))
    || firstComputedValue(chain, value => value.color, isVisibleColor);
  const backgroundColor = firstExplicitValue(chain, item => isVisibleColor(item.style?.backgroundColor) ? item.style.backgroundColor : null)
    || firstComputedValue(chain, value => value.backgroundColor, isVisibleColor);
  const size = Math.max(1, parseFloat(sizeValue) || fallback.fontSize);

  return {
    bold: chain.some(item => ["B", "STRONG"].includes(item.tagName)) || weight === "bold" || Number(weight) >= 600,
    italic: chain.some(item => ["I", "EM"].includes(item.tagName)) || fontStyle === "italic",
    underline: hasUnderline(chain),
    fontFamily: String(family || fallback.fontFamily).replace(/["']/g, "").split(",")[0].trim(),
    fontSize: Math.round(parseFloat(sizeValue) || fallback.fontSize),
    textColor: rgbToHex(textColor || style?.color, fallback.textColor),
    backgroundColor: rgbToHex(backgroundColor, fallback.backgroundColor),
    align: style?.textAlign || fallback.align,
    lineHeight: Number(((parseFloat(style?.lineHeight) / size) || fallback.lineHeight).toFixed(2))
  };
}
