<template>
  <BioNexusDialog
    ref="dialog"
    size="fullscreen"
    dialog-class="designer-text-dialog"
    body-class="designer-text-dialog-body"
    body-scroll="hidden"
    :prevent-close="dirty"
    :kicker="mode === 'create' ? 'Nuevo objeto' : 'Editar objeto'"
    :title="mode === 'create' ? 'Agregar texto libre' : 'Editar texto libre'"
    @before-close="requestClose"
    @close="reset"
  >
    <section class="text-designer-workspace">
      <header class="text-format-toolbar" aria-label="Herramientas de formato de texto">
        <BioNexusSearchableSelect
          :model-value="toolbar.fontFamily" @pointerdown="saveSelection" @update:model-value="applyFontFamily"
          class="toolbar-font"
          :options="fontOptions"
          :searchable="false"
          aria-label="Fuente"
        />
        <label class="toolbar-number" title="Tamaño de fuente">
          <span>Tamaño</span>
          <input :value="toolbar.fontSize" @pointerdown="saveSelection" @change="applyFontSize($event.target.value)" type="number" min="8" max="72" aria-label="Tamaño de fuente">
          <small>px</small>
        </label>
        <span class="toolbar-divider" aria-hidden="true"></span>
        <BioNexusActionButton size="sm" icon="format_bold" icon-only shape="rounded" :variant="toolbar.bold ? 'primary' : 'secondary'" label="Negrita" @mousedown.prevent @click="command('bold')" />
        <BioNexusActionButton size="sm" icon="format_italic" icon-only shape="rounded" :variant="toolbar.italic ? 'primary' : 'secondary'" label="Cursiva" @mousedown.prevent @click="command('italic')" />
        <BioNexusActionButton size="sm" icon="format_underlined" icon-only shape="rounded" :variant="toolbar.underline ? 'primary' : 'secondary'" label="Subrayado" @mousedown.prevent @click="command('underline')" />
        <span class="toolbar-divider" aria-hidden="true"></span>
        <BioNexusActionButton size="sm" icon="format_align_left" icon-only shape="rounded" :variant="toolbar.align === 'left' ? 'primary' : 'secondary'" label="Alinear a la izquierda" @mousedown.prevent="saveSelection" @click="command('justifyLeft')" />
        <BioNexusActionButton size="sm" icon="format_align_center" icon-only shape="rounded" :variant="toolbar.align === 'center' ? 'primary' : 'secondary'" label="Centrar" @mousedown.prevent="saveSelection" @click="command('justifyCenter')" />
        <BioNexusActionButton size="sm" icon="format_align_right" icon-only shape="rounded" :variant="toolbar.align === 'right' ? 'primary' : 'secondary'" label="Alinear a la derecha" @mousedown.prevent="saveSelection" @click="command('justifyRight')" />
        <BioNexusActionButton size="sm" icon="format_align_justify" icon-only shape="rounded" :variant="toolbar.align === 'justify' ? 'primary' : 'secondary'" label="Justificar" @mousedown.prevent="saveSelection" @click="command('justifyFull')" />
        <span class="toolbar-divider" aria-hidden="true"></span>
        <div class="toolbar-color-group">
          <label class="toolbar-color" title="Color del texto">
            <BioNexusIcon name="format_color_text" :size="20" />
            <input :value="toolbar.textColor" @pointerdown="saveSelection" @input="applyColor('foreColor',$event.target.value)" type="color" aria-label="Color del texto">
            <i :style="{ backgroundColor: toolbar.textColor }"></i>
          </label>
          <BioNexusActionButton size="sm" icon="close" icon-only shape="rounded" variant="secondary" label="Quitar color del texto" @mousedown.prevent="saveSelection" @click="clearColor('foreColor')" />
        </div>
        <div class="toolbar-color-group">
          <label class="toolbar-color" title="Color de fondo">
            <BioNexusIcon name="format_color_fill" :size="20" />
            <input :value="toolbar.backgroundColor" @pointerdown="saveSelection" @input="applyColor('hiliteColor',$event.target.value)" type="color" aria-label="Color de fondo">
            <i :style="{ backgroundColor: toolbar.backgroundColor }"></i>
          </label>
          <BioNexusActionButton size="sm" icon="close" icon-only shape="rounded" variant="secondary" label="Quitar color de fondo" @mousedown.prevent="saveSelection" @click="clearColor('hiliteColor')" />
        </div>
        <span class="toolbar-divider" aria-hidden="true"></span>
        <label class="toolbar-number compact" title="Interlineado">
          <BioNexusIcon name="format_line_spacing" :size="19" />
          <input :value="toolbar.lineHeight" @pointerdown="saveSelection" @change="applyInlineStyle('lineHeight',$event.target.value)" type="number" min="0.8" max="3" step="0.05" aria-label="Interlineado">
        </label>
        <label class="toolbar-number compact" title="Padding interno">
          <BioNexusIcon name="padding" :size="19" />
          <input v-model.number="draft.padding" type="number" min="0" max="80" aria-label="Padding interno">
          <small>px</small>
        </label>
      </header>



      <BioNexusSectionPanel class="text-editor-panel" title="Contenido" description="Escribe y aplica el formato del texto libre." icon="edit" variant="accent" compact>
        <section class="text-editor-surface">
          <BioNexusFormField
          class="text-editor-field"
          label="Contenido"
          field-id="designer-text-content"
          :help="draft.text.length + ' de máximo 5000 caracteres'"
          wide
        >
          <div
            id="designer-text-content"
            ref="firstInput"
            class="text-content-editor"
            contenteditable="true"
            role="textbox"
            aria-multiline="true"
            spellcheck="true"
            :style="editorStyle"
            aria-label="Contenido del texto libre"
            data-placeholder="Escribe aquí..."
            @input="capture"
            @keydown="handleEditorKeydown"
            @keyup="rememberSelection"
            @mouseup="rememberSelection"
            @click="handleEditorClick"
            @paste="pastePlainText"
          ></div>
          </BioNexusFormField>
        </section>
      </BioNexusSectionPanel>
      <nav class="text-token-toolbar" aria-label="Datos dinámicos disponibles">
        <strong>Insertar dato:</strong>
        <BioNexusActionButton
          v-for="token in tokens"
          :key="token.key"
          size="sm"
          variant="subtle"
          icon="data_object"
          @pointerdown.prevent="preserveTokenInsertionRange"
          @click="insertToken(token.key)"
        >{{ token.label }}</BioNexusActionButton>
      </nav>
    </section>

    <template #footer>
      <BioNexusActionButton variant="secondary" icon="cancel" @click="requestClose">Cancelar</BioNexusActionButton>
      <BioNexusActionButton variant="primary" :icon="mode === 'create' ? 'create' : 'save'" :disabled="!dirty" @click="apply">{{ mode === 'create' ? 'Agregar' : 'Aplicar' }}</BioNexusActionButton>
    </template>
  </BioNexusDialog>
  <BioNexusConfirmDialog ref="discardDialog" />
</template>

<script setup>
import { readRichTextToolbarState } from './richTextFormattingAdapter';
import { createRichTextSelectionController } from './richTextSelectionController';
import { createRichTextTokenController } from './richTextTokenController';
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { richTextPlainText, sanitizeRichTextHtml } from "@/components/documents/designer/richTextContent.js";
import BioNexusActionButton from "@/components/ui/BioNexusActionButton.vue";
import BioNexusConfirmDialog from "@/components/ui/BioNexusConfirmDialog.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
import BioNexusFormField from "@/components/ui/BioNexusFormField.vue";
import BioNexusSectionPanel from "@/components/ui/BioNexusSectionPanel.vue";
import BioNexusIcon from "@/components/ui/BioNexusIcon.vue";
import BioNexusSearchableSelect from "@/components/ui/BioNexusSearchableSelect.vue";

const props = defineProps({ tokens: { type: Array, default: () => [] } });
const emit = defineEmits(["apply"]);
const dialog = ref(null);
const discardDialog = ref(null);
const firstInput = ref(null);
const mode = ref("create");
const targetId = ref(null);
const original = ref("");
const fontOptions = ["Inter", "Arial", "Roboto", "Courier New", "Georgia", "Times New Roman"].map(value => ({ value, label: value }));
const draft = reactive({ text: "", html: "", fontFamily: "Inter", fontSize: 14, textColor: "#263238", backgroundColor: "#ffffff", bold: false, italic: false, underline: false, align: "left", lineHeight: 1.2, paragraphGap: 0, padding: 8 });
const toolbar = reactive({ bold:false,italic:false,underline:false,fontFamily:"Inter",fontSize:14,textColor:"#263238",backgroundColor:"#ffffff",align:"left",lineHeight:1.2 });


const signature = computed(() => JSON.stringify(draft));
const dirty = computed(() => signature.value !== original.value);
const editorStyle = computed(() => ({ fontFamily: draft.fontFamily, fontSize: `${draft.fontSize}px`, color: draft.textColor, backgroundColor: draft.backgroundColor, fontWeight: draft.bold ? "700" : "400", fontStyle: draft.italic ? "italic" : "normal", textDecoration: draft.underline ? "underline" : "none", textAlign: draft.align, lineHeight: String(draft.lineHeight), "--paragraph-gap": `${draft.paragraphGap}px`, padding: `${draft.padding}px` }));

function assign(value = {}) {
  const text = String(value.text ?? "");
  const fallbackHtml = escapeHtml(text).replace(/\n/g, "<br>");
  Object.assign(draft, { text, html: sanitizeRichTextHtml(value.html || fallbackHtml), fontFamily: value.fontFamily || "Inter", fontSize: Number(value.fontSize) || 14, textColor: value.textColor || "#263238", backgroundColor: value.backgroundColor || "#ffffff", bold: Boolean(value.bold), italic: Boolean(value.italic), underline: Boolean(value.underline), align: value.align || "left", lineHeight: Number(value.lineHeight) || 1.2, paragraphGap: Math.max(0, Number(value.paragraphGap) || 0), padding: Number(value.padding) || 8 });
}

async function openCreate() {
  mode.value = "create";
  targetId.value = null;
  assign({ text: "", html: "" });
  original.value = "";
  dialog.value?.open();
  await nextTick();
  initializeEditor();
}
function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[char]); }
function initializeEditor() { if (!firstInput.value) return; firstInput.value.innerHTML = draft.html; normalizeTokenSpans(); firstInput.value.focus(); resizeEditor(); syncToolbar(); }
function resizeEditor() { const editor = firstInput.value; if (!editor) return; editor.style.height = "auto"; const maximum = 320; const next = Math.min(maximum, Math.max(96, editor.scrollHeight)); editor.style.height = next + "px"; editor.style.overflowY = editor.scrollHeight > maximum ? "auto" : "hidden"; }
function capture() { const editor = firstInput.value; if (!editor) return; normalizeTokenSpans(); draft.html = sanitizeRichTextHtml(editor.innerHTML); draft.text = richTextPlainText(draft.html).slice(0, 5000); if (richTextPlainText(draft.html).length > 5000) editor.innerHTML = escapeHtml(draft.text).replace(/\n/g, "<br>"); resizeEditor(); }







function rememberSelection() {
  saveSelection();
  syncToolbar();
}




function syncToolbar(preferredElement = null) {
  const element = preferredElement || selectionElement();
  Object.assign(toolbar, readRichTextToolbarState(element, firstInput.value, draft));
}
const selection = createRichTextSelectionController({ editorRef: firstInput, onSelectionChange: element => syncToolbar(element) });
const { savedRange, selectedAtomicToken, selectionInsideEditor, saveSelection, restoreSelection, selectionElement, selectToken } = selection;
const tokenController = createRichTextTokenController({ editorRef: firstInput, selection, capture, syncToolbar });
const { normalizeTokenSpans, handleEditorClick, preserveTokenInsertionRange, insertToken, handleEditorKeydown } = tokenController;

function command(name, value = null) {
  if (name === "bold") { surroundSelection("fontWeight", toolbar.bold ? "400" : "700"); return; }
  if (name === "italic") { surroundSelection("fontStyle", toolbar.italic ? "normal" : "italic"); return; }
  if (name === "underline") { surroundSelection("textDecorationLine", toolbar.underline ? "none" : "underline"); return; }
  if (name === "foreColor") { surroundSelection("color", String(value || draft.textColor)); return; }
  if (name === "hiliteColor") { surroundSelection("backgroundColor", String(value || draft.backgroundColor)); return; }
  restoreSelection();
  document.execCommand(name, false, value);
  capture();
  saveSelection();
  syncToolbar();
}
function applyFontFamily(value){surroundSelection("fontFamily",String(value||"Inter"))}
function surroundSelection(styleName, styleValue) {
  const token = selectedAtomicToken.value?.isConnected ? selectedAtomicToken.value : null;
  if (token) {
    token.style[styleName] = styleValue;
    selectToken(token);
    capture();
    selectToken(token);
    syncToolbar(token);
    return;
  }
  restoreSelection();
  const selection = globalThis.getSelection?.();
  if (!selection?.rangeCount) return;
  const range = selection.getRangeAt(0);
  if (range.collapsed) return;
  const span = document.createElement("span");
  span.style[styleName] = styleValue;
  try { range.surroundContents(span); }
  catch { const content = range.extractContents(); span.append(content); range.insertNode(span); }
  const nextRange = document.createRange();
  nextRange.selectNodeContents(span);
  selection.removeAllRanges();
  selection.addRange(nextRange);
  savedRange.value = nextRange.cloneRange();
  capture();
  syncToolbar();
}
function applyFontSize(value){surroundSelection("fontSize",Math.max(8,Math.min(72,Number(value)||14))+"px")}
function applyColor(name,value){command(name,value);syncToolbar()}
function clearColor(name){
  surroundSelection(name === "foreColor" ? "color" : "backgroundColor", name === "foreColor" ? "inherit" : "transparent");
  syncToolbar();
}
function applyInlineStyle(property,value){surroundSelection(property,String(Math.max(.8,Math.min(3,Number(value)||1.2))))}
function pastePlainText(event) { event.preventDefault(); document.execCommand("insertText", false, event.clipboardData?.getData("text/plain") ?? ""); capture(); }

async function openEdit(value) {
  mode.value = "edit";
  targetId.value = value.id;
  assign(value);
  original.value = signature.value;
  dialog.value?.open();
  await nextTick();
  initializeEditor();
}






function apply() {
  if (!dirty.value) return;
  emit("apply", { mode: mode.value, id: targetId.value, values: JSON.parse(signature.value) });
  original.value = signature.value;
  dialog.value?.close();
}

async function requestClose() {
  if (dirty.value) {
    const accepted = await discardDialog.value?.ask({ kicker: "Confirmación", title: "Descartar cambios", message: "Hay cambios sin aplicar. ¿Deseas cerrar y descartarlos?", icon: "warning", variant: "danger", confirmIcon: "delete", confirmText: "Sí, cerrar y descartar", cancelText: "Continuar editando" });
    if (!accepted) return;
  }
  dialog.value?.close();
}

function reset() {
  targetId.value = null;
  original.value = "";
}

onMounted(() => selection.startSelectionTracking());
onBeforeUnmount(() => selection.stopSelectionTracking());
defineExpose({ openCreate, openEdit });
</script>

<style scoped>
.text-designer-workspace{display:grid;grid-template-rows:auto minmax(0,1fr) auto;height:100%;min-height:0;overflow:hidden;background:#eef4f7}.text-format-toolbar{display:flex;align-items:center;flex-wrap:wrap;gap:6px;padding:10px 14px;border-bottom:1px solid var(--bio-nexus-color-border);background:#fff}.toolbar-font{width:190px}.toolbar-divider{width:1px;height:30px;margin:0 2px;background:var(--bio-nexus-color-border)}.toolbar-number{display:flex;align-items:center;gap:5px;height:36px;padding:0 8px;border:1px solid var(--bio-nexus-color-border-strong);border-radius:6px;background:#fff}.toolbar-number span{font-size:11px;color:var(--bio-nexus-color-text-muted)}.toolbar-number input{width:52px;border:0;outline:0;background:transparent;color:var(--bio-nexus-color-text);font:600 13px var(--bio-nexus-font-family)}.toolbar-number.compact input{width:44px}.toolbar-number small{color:var(--bio-nexus-color-text-muted);font-size:10px}.toolbar-color-group{display:flex;align-items:center;gap:3px}.toolbar-color-group :deep(.bio-nexus-action-button){width:30px;min-width:30px;height:36px;padding:0}.toolbar-color{position:relative;display:grid;grid-template-columns:24px 30px;align-items:center;gap:2px;height:36px;padding:0 7px;border:1px solid var(--bio-nexus-color-border-strong);border-radius:6px;background:#fff;cursor:pointer}.toolbar-color input{position:absolute;width:1px;height:1px;opacity:0}.toolbar-color i{display:block;width:28px;height:18px;border:1px solid var(--bio-nexus-color-border-strong);border-radius:3px}.text-token-toolbar{display:flex;align-items:center;flex-wrap:wrap;align-content:flex-start;gap:6px;max-height:112px;min-height:48px;padding:8px 14px;overflow:auto;border-bottom:1px solid var(--bio-nexus-color-border);background:#f8fbfd;white-space:normal}.text-token-toolbar strong{position:sticky;left:0;z-index:1;padding-right:8px;background:#f8fbfd;color:var(--bio-nexus-color-text-muted);font-size:11px}.text-editor-panel{align-self:start;min-height:0;margin:12px 16px;overflow:visible}.text-editor-surface{min-height:0;background:#fff}.text-editor-field{display:grid;grid-template-rows:auto auto;min-height:0}.text-editor-field :deep(.bio-nexus-form-field-control){min-height:0;overflow:visible}.text-content-editor{box-sizing:border-box;width:100%;height:auto;min-height:96px;max-height:320px;overflow-y:hidden;white-space:pre-wrap;overflow-wrap:anywhere;outline:0;background:#fff;box-shadow:0 5px 18px rgba(34,59,87,.08)}.rich-token{display:inline;box-decoration-break:clone;-webkit-box-decoration-break:clone}
.text-content-editor:empty::before{content:attr(data-placeholder);color:var(--bio-nexus-color-text-muted);pointer-events:none}
.text-content-editor:focus{border-color:var(--bio-nexus-color-primary);box-shadow:0 0 0 3px rgba(34,94,139,.12),0 5px 18px rgba(34,59,87,.08)}@media(max-width:800px){.toolbar-divider{display:none}.text-editor-surface{margin:10px}.toolbar-font{width:150px}}
.rich-editor p{margin:0 0 var(--paragraph-gap,0)}
.rich-editor p:last-child{margin-bottom:0}
</style>
