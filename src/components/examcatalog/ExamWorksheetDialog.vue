<template>
  <dialog ref="dialog" class="worksheet-dialog" @cancel.prevent="requestClose" @click="onBackdropClick">
    <section class="worksheet-shell" @click.stop>
      <header class="worksheet-header bio-nexus-dialog-header">
        <div><p>Configuracion del examen</p><h2>Hoja de trabajo</h2><small>{{ exam?.description }}</small></div>
        <BioNexusDialogCloseButton @click="requestClose" />
      </header>
      <nav class="worksheet-tabs" role="tablist" aria-label="Hoja de trabajo">
        <button type="button" role="tab" :aria-selected="tab === 'editor'" :class="{ active: tab === 'editor' }" @click="tab='editor'">Editor</button>
        <button type="button" role="tab" :aria-selected="tab === 'preview'" :class="{ active: tab === 'preview' }" @click="tab='preview'">Vista previa</button>
      </nav>
      <main class="worksheet-body">
        <section v-show="tab === 'editor'" class="worksheet-editor-panel">
          <div class="worksheet-toolbar" role="toolbar" aria-label="Formato de texto">
            <button type="button" title="Negrita" @click="command('bold')"><strong>B</strong></button>
            <button type="button" title="Cursiva" @click="command('italic')"><em>I</em></button>
            <button type="button" title="Subrayado" @click="command('underline')"><u>U</u></button>
            <button type="button" title="Alinear a la izquierda" @click="command('justifyLeft')"><BioNexusIcon name="format_align_left" :size="19" /></button>
            <button type="button" title="Centrar" @click="command('justifyCenter')"><BioNexusIcon name="format_align_center" :size="19" /></button>
            <button type="button" title="Alinear a la derecha" @click="command('justifyRight')"><BioNexusIcon name="format_align_right" :size="19" /></button>
            <button type="button" title="Lista numerada" @click="command('insertOrderedList')"><BioNexusIcon name="format_list_numbered" :size="19" /></button>
            <button type="button" title="Lista con vinetas" @click="command('insertUnorderedList')"><BioNexusIcon name="format_list_bulleted" :size="19" /></button>
            <button type="button" title="Subindice" @click="command('subscript')">X<sub>2</sub></button>
            <button type="button" title="Superindice" @click="command('superscript')">X<sup>2</sup></button>
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
      </main>
      <footer class="worksheet-footer">
        <button type="button" class="bio-nexus-action bio-nexus-action-secondary" :disabled="saving" @click="requestClose"><BioNexusActionIcon action="cancel" />Cancelar</button>
        <button type="button" class="bio-nexus-action bio-nexus-action-primary" :disabled="saving || !dirty || tooLong || !canUpdate" @click="submit"><BioNexusActionIcon action="save" />{{ saving ? "Guardando..." : "Guardar" }}</button>
      </footer>
    </section>
  </dialog>
</template>
<script setup>
import { computed, nextTick, ref } from "vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import BioNexusDialogCloseButton from "@/components/ui/BioNexusDialogCloseButton.vue";
import BioNexusIcon from "@/components/ui/BioNexusIcon.vue";
const props=defineProps({saving:{type:Boolean,default:false},canUpdate:{type:Boolean,default:false}});const emit=defineEmits(["save"]);const dialog=ref(null),editor=ref(null),exam=ref(null),tab=ref("editor"),draft=ref(""),original=ref(""),errorMessage=ref("");const length=computed(()=>draft.value.length),tooLong=computed(()=>length.value>100000),dirty=computed(()=>draft.value!==original.value);const safePreview=computed(()=>sanitizePreview(draft.value));
function sanitizePreview(html){const documentValue=new DOMParser().parseFromString(String(html||""),"text/html");documentValue.querySelectorAll("script,style,iframe,object,embed,link,meta,form,input,button,textarea,select,video,audio").forEach(node=>node.remove());documentValue.body.querySelectorAll("*").forEach(node=>{for(const attribute of Array.from(node.attributes)){const name=attribute.name.toLowerCase(),value=attribute.value.trim().toLowerCase();if(name.startsWith("on")||name==="srcdoc"||(name==="href"||name==="src")&&(value.startsWith("javascript:")||value.startsWith("data:")))node.removeAttribute(attribute.name)}});return documentValue.body.innerHTML}
async function open(record){exam.value=record;draft.value=typeof record?.work_sheet==="string"?record.work_sheet:"";original.value=draft.value;errorMessage.value="";tab.value="editor";dialog.value?.showModal();await nextTick();if(editor.value){editor.value.innerHTML=draft.value;editor.value.focus()}}
function capture(){draft.value=editor.value?.innerHTML??"";if(tooLong.value)errorMessage.value="La Hoja de trabajo supera el limite permitido.";else errorMessage.value=""}
function command(name,value=null){editor.value?.focus();document.execCommand(name,false,value);capture()}
function onPaste(event){event.preventDefault();const text=event.clipboardData?.getData("text/plain")??"";document.execCommand("insertText",false,text);capture()}
function requestClose(){if(props.saving)return;if(dirty.value&&!globalThis.confirm("Hay cambios sin guardar. Desea descartarlos?"))return;close()}
function close(){if(dialog.value?.open)dialog.value.close();exam.value=null;draft.value="";original.value="";errorMessage.value=""}
function setError(message){errorMessage.value=String(message||"")}
function markSaved(record){exam.value=record;draft.value=typeof record?.work_sheet==="string"?record.work_sheet:"";original.value=draft.value;if(editor.value)editor.value.innerHTML=draft.value}
function submit(){capture();if(!props.canUpdate||!dirty.value||tooLong.value)return;emit("save",{record:exam.value,work_sheet:draft.value})}
function onBackdropClick(event){if(event.target===dialog.value)requestClose()}
defineExpose({open,close,setError,markSaved});
</script>
<style scoped>
.worksheet-dialog{width:min(1040px,calc(100vw - 32px));height:min(790px,calc(100vh - 32px));max-width:none;max-height:none;margin:auto;padding:0;border:0;border-radius:var(--bio-nexus-radius-lg);background:transparent;overflow:hidden;box-shadow:0 24px 70px rgb(15 23 42 / 28%)}.worksheet-dialog::backdrop{background:rgb(15 23 42 / 45%);backdrop-filter:blur(2px)}.worksheet-shell{display:grid;grid-template-rows:auto auto minmax(0,1fr) auto;width:100%;height:100%;overflow:hidden;border:1px solid var(--bio-nexus-color-border-strong);border-radius:var(--bio-nexus-radius-lg);background:var(--bio-nexus-color-surface)}.worksheet-header{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 20px;border-bottom:1px solid var(--bio-nexus-color-border);background:var(--bio-nexus-color-surface)}.worksheet-header p{margin:0;color:var(--bio-nexus-color-accent);font-size:var(--bio-nexus-font-size-xs);font-weight:800;text-transform:uppercase}.worksheet-header h2{margin:2px 0;color:var(--bio-nexus-color-primary-strong)}.worksheet-header small{color:var(--bio-nexus-color-text-muted)}.worksheet-tabs{display:flex;gap:4px;padding:8px 20px 0;border-bottom:1px solid var(--bio-nexus-color-border);background:var(--bio-nexus-color-surface)}.worksheet-tabs button{padding:9px 16px;border:0;border-bottom:3px solid transparent;background:transparent;color:var(--bio-nexus-color-text-muted);font-weight:700;cursor:pointer}.worksheet-tabs button.active{border-color:var(--bio-nexus-color-accent);color:var(--bio-nexus-color-primary-strong)}.worksheet-body{min-height:0;overflow:auto;padding:18px 20px;background:var(--bio-nexus-color-surface-soft)}.worksheet-editor-panel,.worksheet-preview-panel{display:grid;gap:10px;max-width:965px;margin:0 auto}.worksheet-toolbar{display:flex;flex-wrap:wrap;gap:4px;padding:8px;border:1px solid var(--bio-nexus-color-border);border-radius:var(--bio-nexus-radius-md) var(--bio-nexus-radius-md) 0 0;background:var(--bio-nexus-color-surface)}.worksheet-toolbar button{display:grid;place-items:center;min-width:34px;height:32px;padding:0 8px;border:1px solid transparent;border-radius:var(--bio-nexus-radius-sm);background:transparent;color:var(--bio-nexus-color-text);cursor:pointer}.worksheet-toolbar button:hover{border-color:var(--bio-nexus-color-border-strong);background:var(--bio-nexus-color-info-soft)}.worksheet-editor{min-height:410px;padding:20px;border:1px solid var(--bio-nexus-color-border-strong);border-radius:0 0 var(--bio-nexus-radius-md) var(--bio-nexus-radius-md);outline:0;background:#fff;color:#111;font-family:"Courier New",monospace;line-height:1.5}.worksheet-editor:focus{border-color:var(--bio-nexus-color-primary);box-shadow:0 0 0 3px rgb(0 91 150 / 12%)}.worksheet-meta{display:flex;justify-content:space-between;color:var(--bio-nexus-color-text-muted);font-size:var(--bio-nexus-font-size-xs)}.worksheet-preview-title{color:var(--bio-nexus-color-primary-strong);font-weight:800}.worksheet-preview{min-height:460px;padding:24px;border:1px solid var(--bio-nexus-color-border);border-radius:var(--bio-nexus-radius-md);background:#fff;color:#111;font-family:"Courier New",monospace;line-height:1.5}.worksheet-footer{display:flex;justify-content:flex-end;gap:10px;padding:14px 20px;border-top:1px solid var(--bio-nexus-color-border);background:var(--bio-nexus-color-surface)}@media(max-width:700px){.worksheet-dialog{width:calc(100vw - 16px);height:calc(100vh - 16px)}.worksheet-meta{display:grid;gap:3px}}
</style>
