const state = {
  observer: null,
  installed: false,
  locked: false,
  scrollX: 0,
  scrollY: 0,
  bodyStyles: null,
  htmlStyles: null,
};

function openModalDialogs() {
  return Array.from(document.querySelectorAll("dialog[open]")).filter((dialog) => {
    try { return dialog.matches(":modal"); } catch { return true; }
  });
}

function lockPageScroll() {
  if (state.locked) return;
  const html = document.documentElement;
  const body = document.body;
  state.scrollX = window.scrollX;
  state.scrollY = window.scrollY;
  state.htmlStyles = { overflow: html.style.overflow, scrollbarGutter: html.style.scrollbarGutter };
  state.bodyStyles = { position: body.style.position, inset: body.style.inset, width: body.style.width, overflow: body.style.overflow, paddingRight: body.style.paddingRight };
  const scrollbarWidth = Math.max(0, window.innerWidth - html.clientWidth);
  html.classList.add("bio-nexus-modal-open");
  html.style.overflow = "hidden";
  html.style.scrollbarGutter = "stable";
  body.classList.add("bio-nexus-modal-open");
  body.style.position = "fixed";
  body.style.inset = `-${state.scrollY}px 0 0 -${state.scrollX}px`;
  body.style.width = "100%";
  body.style.overflow = "hidden";
  if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
  state.locked = true;
}

function unlockPageScroll() {
  if (!state.locked) return;
  const html = document.documentElement;
  const body = document.body;
  html.classList.remove("bio-nexus-modal-open");
  body.classList.remove("bio-nexus-modal-open");
  Object.assign(html.style, state.htmlStyles ?? {});
  Object.assign(body.style, state.bodyStyles ?? {});
  state.locked = false;
  window.scrollTo({ left: state.scrollX, top: state.scrollY, behavior: "instant" });
}

function synchronizeModalState() {
  if (openModalDialogs().length > 0) lockPageScroll();
  else unlockPageScroll();
}

export function installBioNexusDialogManager() {
  if (state.installed || typeof document === "undefined") return;
  state.installed = true;
  state.observer = new MutationObserver(synchronizeModalState);
  state.observer.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["open"] });
  document.addEventListener("close", synchronizeModalState, true);
  document.addEventListener("cancel", () => queueMicrotask(synchronizeModalState), true);
  window.addEventListener("pagehide", unlockPageScroll, { once: true });
  synchronizeModalState();
}
