<template>
  <BioNexusDialog ref="dialog" size="wide" kicker="Configuración del examen" title="Hoja de trabajo" :subtitle="exam?.description || ''" :prevent-close="dirty" @before-close="requestClose" @close="handleClosed">
    <template #toolbar><BioNexusTabs v-model="tab" :tabs="worksheetTabs" aria-label="Hoja de trabajo" id-prefix="exam-worksheet" /></template>
    <section class="worksheet-content">
        <section v-show="tab === 'editor'" class="worksheet-editor-panel">
          <div class="worksheet-toolbar" role="toolbar" aria-label="Formato de texto">
            <BioNexusSearchableSelect v-model="blockType" class="worksheet-toolbar-select" :options="blockTypeOptions" :disabled="saving" aria-label="Tipo de parrafo" placeholder="Parrafo" search-placeholder="Buscar tipo..." empty-text="Sin tipos coincidentes" @update:model-value="setBlockType" />
            <BioNexusSearchableSelect v-model="lineHeight" class="worksheet-toolbar-select" :options="lineHeightOptions" :disabled="saving" aria-label="Interlineado" placeholder="Normal" search-placeholder="Buscar interlineado..." empty-text="Sin opciones coincidentes" @update:model-value="setLineHeight" />
            <button type="button" title="Tachado" @click="command('strikeThrough')"><s>S</s></button>
            <button type="button" title="Negrita" @click="command('bold')"><strong>B</strong></button>
            <button type="button" title="Cursiva" @click="command('italic')"><em>I</em></button>
            <button type="button" title="Subrayado" @click="command('underline')"><u>U</u></button>
            <button type="button" title="Alinear a la izquierda" @click="command('justifyLeft')"><BioNexusIcon name="format_align_left" :size="19" /></button>
            <button type="button" title="Centrar" @click="command('justifyCenter')"><BioNexusIcon name="format_align_center" :size="19" /></button>
            <button type="button" title="Alinear a la derecha" @click="command('justifyRight')"><BioNexusIcon name="format_align_right" :size="19" /></button>
            <button type="button" title="Lista numerada" @click="command('insertOrderedList')"><BioNexusIcon name="format_list_numbered" :size="19" /></button>
            <button type="button" title="Lista con vinetas" @click="command('insertUnorderedList')"><BioNexusIcon name="format_list_bulleted" :size="19" /></button>
            <button type="button" title="Subindice" @click="command('subscript')"><span class="worksheet-script-icon worksheet-script-icon-sub" aria-hidden="true"><span>X</span><span>2</span></span><span class="bio-nexus-visually-hidden">Subíndice</span></button>
            <button type="button" title="Superindice" @click="command('superscript')"><span class="worksheet-script-icon worksheet-script-icon-sup" aria-hidden="true"><span>X</span><span>2</span></span><span class="bio-nexus-visually-hidden">Superíndice</span></button>
            <button type="button" title="Limpiar formato" @click="command('removeFormat')"><BioNexusIcon name="format_clear" :size="19" /></button>
          </div>
          <div ref="editor" class="worksheet-editor" contenteditable="true" role="textbox" aria-multiline="true" spellcheck="true" @input="capture" @paste="onPaste"></div>
          <div class="worksheet-meta"><span>{{ length }} / 100000 caracteres</span><span>Fuente operativa: Courier New</span></div>
        </section>
        <section v-show="tab === 'preview'" class="worksheet-preview-panel">
          <div class="worksheet-preview-title">Vista previa segura</div>
          <div class="worksheet-preview" v-html="safePreview"></div>
        </section>
        <div v-if="errorMessage" class="bio-nexus-message bio-nexus-message-error" role="alert">{{ errorMessage }}</div>
      </section>
    <template #footer><BioNexusActionButton type="button" variant="secondary" icon="cancel" :disabled="saving" @click="requestClose">Cancelar</BioNexusActionButton>
        <BioNexusActionButton type="button" variant="primary" icon="save" :loading="saving" :disabled="!dirty || tooLong || !canUpdate" @click="submit">{{ saving ? "Guardando..." : "Guardar" }}</BioNexusActionButton></template>
  </BioNexusDialog>
  <BioNexusConfirmDialog ref="confirmDialog" />
</template>
<script setup>
import { computed, nextTick, ref } from "vue";
import BioNexusActionButton from "@/components/ui/BioNexusActionButton.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
import BioNexusConfirmDialog from "@/components/ui/BioNexusConfirmDialog.vue";
import BioNexusIcon from "@/components/ui/BioNexusIcon.vue";
import BioNexusSearchableSelect from "@/components/ui/BioNexusSearchableSelect.vue";
import BioNexusTabs from "@/components/ui/BioNexusTabs.vue";
const props=defineProps({saving:{type:Boolean,default:false},canUpdate:{type:Boolean,default:false}});const worksheetTabs=Object.freeze([{key:"editor",label:"Editor"},{key:"preview",label:"Vista previa"}]);const emit=defineEmits(["save"]);const dialog=ref(null),confirmDialog=ref(null),editor=ref(null),exam=ref(null),tab=ref("editor"),draft=ref(""),original=ref(""),errorMessage=ref(""),blockType=ref("p"),lineHeight=ref("1.2");const blockTypeOptions=[{value:"p",label:"Parrafo"},{value:"h3",label:"Titulo"},{value:"h4",label:"Subtitulo"}];const lineHeightOptions=[{value:"1",label:"Compacto"},{value:"1.2",label:"Normal"},{value:"1.5",label:"1.5 lineas"},{value:"2",label:"Doble"}];const length=computed(()=>draft.value.length),tooLong=computed(()=>length.value>100000),dirty=computed(()=>draft.value!==original.value);const safePreview=computed(()=>sanitizePreview(draft.value));
function sanitizePreview(html){const documentValue=new DOMParser().parseFromString(String(html||""),"text/html");documentValue.querySelectorAll("script,style,iframe,object,embed,link,meta,form,input,button,textarea,select,video,audio").forEach(node=>node.remove());documentValue.body.querySelectorAll("*").forEach(node=>{for(const attribute of Array.from(node.attributes)){const name=attribute.name.toLowerCase(),value=attribute.value.trim().toLowerCase();if(name.startsWith("on")||name==="srcdoc"||(name==="href"||name==="src")&&(value.startsWith("javascript:")||value.startsWith("data:")))node.removeAttribute(attribute.name)}});return documentValue.body.innerHTML}
async function open(record){exam.value=record;draft.value=typeof record?.work_sheet==="string"?record.work_sheet:"";original.value=draft.value;errorMessage.value="";tab.value="editor";dialog.value?.open();await nextTick();if(editor.value){editor.value.innerHTML=draft.value;editor.value.focus()}}
function capture(){draft.value=editor.value?.innerHTML??"";if(tooLong.value)errorMessage.value="La Hoja de trabajo supera el limite permitido.";else errorMessage.value=""}
function command(name,value=null){editor.value?.focus();document.execCommand(name,false,value);capture()}function setBlockType(value){editor.value?.focus();document.execCommand("formatBlock",false,value);capture()}function setLineHeight(value){editor.value?.focus();const selection=globalThis.getSelection?.();let node=selection?.anchorNode??null;if(node?.nodeType===Node.TEXT_NODE)node=node.parentElement;const block=node?.closest?.("p,div,h3,h4,li")??editor.value;if(block)block.style.lineHeight=value;capture()}
function onPaste(event){event.preventDefault();const text=event.clipboardData?.getData("text/plain")??"";document.execCommand("insertText",false,text);capture()}
async function requestClose(){if(props.saving)return;if(dirty.value){const accepted=await confirmDialog.value?.ask({title:"Descartar cambios",message:"Hay cambios sin guardar. ¿Deseas salir y descartarlos?",confirmText: "Sí, salir y descartar cambios",confirmIcon:"delete",variant:"danger"});if(!accepted)return}close()}
function handleClosed(){exam.value=null;draft.value="";original.value="";errorMessage.value=""}
function close(){dialog.value?.close();exam.value=null;draft.value="";original.value="";errorMessage.value=""}
function setError(message){errorMessage.value=String(message||"")}
function markSaved(record){exam.value=record;draft.value=typeof record?.work_sheet==="string"?record.work_sheet:"";original.value=draft.value;if(editor.value)editor.value.innerHTML=draft.value}
function submit(){capture();if(!props.canUpdate||!dirty.value||tooLong.value)return;emit("save",{record:exam.value,work_sheet:draft.value})}
function onBackdropClick(event){if(event.target===dialog.value)requestClose()}
defineExpose({open,close,setError,markSaved});
</script>
<style scoped>.worksheet-content{min-height:0;padding:18px 20px;background:var(--bio-nexus-color-surface-soft)}
.worksheet-editor-panel,.worksheet-preview-panel{display:grid;gap:10px;max-width:965px;margin:0 auto}.worksheet-toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:6px 8px;border:1px solid var(--bio-nexus-color-border);border-radius:var(--bio-nexus-radius-md) var(--bio-nexus-radius-md) 0 0;background:var(--bio-nexus-color-surface)}.worksheet-toolbar-select{flex:0 0 154px!important;width:154px!important;min-width:0!important;max-width:154px!important;height:34px!important;padding:0!important;border:0!important;background:transparent!important;color:var(--bio-nexus-color-text);align-self:center}.worksheet-toolbar>button{display:grid;place-items:center;min-width:34px;height:32px;padding:0 8px;border:1px solid transparent;border-radius:var(--bio-nexus-radius-sm);background:transparent;color:var(--bio-nexus-color-text);cursor:pointer}.worksheet-toolbar>button:hover{border-color:var(--bio-nexus-color-border-strong);background:var(--bio-nexus-color-info-soft)}.worksheet-editor{min-height:410px;padding:20px;border:1px solid var(--bio-nexus-color-border-strong);border-radius:0 0 var(--bio-nexus-radius-md) var(--bio-nexus-radius-md);outline:0;background:#fff;color:#111;font-family:"Courier New",monospace;line-height:1.5}.worksheet-editor :is(p,div,h3,h4,ul,ol){margin-block:0 4px}.worksheet-editor :is(p,div,h3,h4,ul,ol):last-child{margin-bottom:0}.worksheet-editor ul,.worksheet-editor ol{padding-inline-start:24px}.worksheet-editor:focus{border-color:var(--bio-nexus-color-primary);box-shadow:0 0 0 3px rgb(0 91 150 / 12%)}.worksheet-meta{display:flex;justify-content:space-between;color:var(--bio-nexus-color-text-muted);font-size:var(--bio-nexus-font-size-xs)}.worksheet-preview-title{color:var(--bio-nexus-color-primary-strong);font-weight:800}.worksheet-preview{min-height:460px;padding:24px;border:1px solid var(--bio-nexus-color-border);border-radius:var(--bio-nexus-radius-md);background:#fff;color:#111;font-family:"Courier New",monospace;line-height:1.5}.worksheet-preview :is(p,div,h3,h4,ul,ol){margin-block:0 4px}.worksheet-preview :is(p,div,h3,h4,ul,ol):last-child{margin-bottom:0}@media(max-width:700px){.worksheet-meta{display:grid;gap:3px}}

.worksheet-script-icon {
  position: relative;
  display: inline-block;
  width: 20px;
  height: 22px;
  color: currentColor;
  font-family: var(--bio-nexus-font-family);
  font-size: 18px;
  font-weight: 500;
  line-height: 22px;
  text-align: left;
}

.worksheet-script-icon > span:last-child {
  position: absolute;
  right: 0;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
}

.worksheet-script-icon-sub > span:last-child { bottom: 1px; }
.worksheet-script-icon-sup > span:last-child { top: 1px; }

.bio-nexus-visually-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}.worksheet-toolbar-select :deep(.bio-search-trigger){width:100%!important;min-width:0!important;height:34px!important;min-height:34px!important;padding:0 10px!important;border-radius:var(--bio-nexus-radius-sm)!important;font-size:var(--bio-nexus-font-size-sm)!important;line-height:1!important}.worksheet-toolbar-select :deep(.bio-search-trigger>span:first-child){overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
</style>
