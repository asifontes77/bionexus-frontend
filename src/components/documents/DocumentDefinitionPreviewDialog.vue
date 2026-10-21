<template>
  <BioNexusDialog ref="dialog" size="fullscreen" body-class="receipt-preview-dialog-body" kicker="Vista previa" :title="title" @close="reset">
    <BioNexusFormErrors :errors="errorMessage" />
    <div class="receipt-preview-toolbar" role="toolbar" aria-label="Controles de vista previa">
      <BioNexusActionButton size="sm" icon="zoom_out" icon-only shape="circle" variant="secondary" label="Alejar" :disabled="loading || zoom <= MIN_ZOOM" @click="changeZoom(-ZOOM_STEP)" />
      <button type="button" class="receipt-preview-zoom-value" :disabled="loading" title="Restablecer al 100 %" @click="setZoom(1)">{{ Math.round(zoom * 100) }}%</button>
      <BioNexusActionButton size="sm" icon="zoom_in" icon-only shape="circle" variant="secondary" label="Acercar" :disabled="loading || zoom >= MAX_ZOOM" @click="changeZoom(ZOOM_STEP)" />
      <span class="receipt-preview-rail-divider" aria-hidden="true"></span>
      <BioNexusActionButton size="sm" icon="fit_screen" icon-only shape="circle" variant="secondary" label="Ajustar página" :disabled="loading || !previewHtml" @click="fitPage" />
      <BioNexusActionButton size="sm" icon="width" icon-only shape="circle" variant="secondary" label="Ajustar ancho" :disabled="loading || !previewHtml" @click="fitWidth" />
    </div>
    <div v-if="loading" class="bio-nexus-message">Preparando vista previa...</div>
    <section v-else ref="viewport" class="receipt-preview-viewport">
      <BioNexusDocumentPreview v-if="previewHtml" :document-json="previewDocumentJson" :laboratory="laboratory" :zoom="zoom" title="Vista previa del comprobante" />
      <div v-else class="bio-nexus-message">El comprobante no tiene un diseño guardado.</div>
    </section>
    <template #footer>
      <BioNexusActionButton variant="secondary" icon="close" @click="close">Cerrar</BioNexusActionButton>
    </template>
  </BioNexusDialog>
</template>
<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from "vue";
import BioNexusActionButton from "@/components/ui/BioNexusActionButton.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
import BioNexusFormErrors from "@/components/ui/BioNexusFormErrors.vue";
import BioNexusDocumentPreview from "@/components/documents/BioNexusDocumentPreview.vue";
import { getDocumentDesign } from "@/services/documentDesignService.js";
import { getLaboratory } from "@/services/laboratoryService";
import { laboratoryDocumentContext, laboratoryLogoUrl, resolveDocumentTokens } from "@/components/documents/designer/documentPreviewContext.js";
const MIN_ZOOM=.25,MAX_ZOOM=4,ZOOM_STEP=.1;
const dialog=ref(null),viewport=ref(null),loading=ref(false),errorMessage=ref(""),previewHtml=ref(""),previewDocumentJson=ref(null),title=ref("Vista previa del comprobante"),zoom=ref(1),zoomMode=ref("page"),pageWidth=ref(816),pageHeight=ref(1056),laboratory=ref(null);
let resizeObserver;
const stageStyle=computed(()=>({width:(pageWidth.value*zoom.value)+"px",height:(pageHeight.value*zoom.value)+"px"}));
const frameStyle=computed(()=>({width:pageWidth.value+"px",height:pageHeight.value+"px",transform:"scale("+zoom.value+")",transformOrigin:"top left"}));
const escapeHtml=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
function clampZoom(value){return Math.max(MIN_ZOOM,Math.min(MAX_ZOOM,Math.round(value*100)/100))}
function applyZoom(value,mode="manual"){zoomMode.value=mode;zoom.value=clampZoom(value);nextTick(()=>{if(viewport.value){viewport.value.scrollLeft=Math.max(0,(viewport.value.scrollWidth-viewport.value.clientWidth)/2);viewport.value.scrollTop=0}})}
function setZoom(value){applyZoom(value,"manual")}
function changeZoom(delta){applyZoom(zoom.value+delta,"manual")}
function viewportSpace(){if(!viewport.value)return{width:0,height:0};const style=getComputedStyle(viewport.value),paddingX=parseFloat(style.paddingLeft||0)+parseFloat(style.paddingRight||0),paddingY=parseFloat(style.paddingTop||0)+parseFloat(style.paddingBottom||0);return{width:Math.max(100,viewport.value.clientWidth-paddingX-8),height:Math.max(100,viewport.value.clientHeight-paddingY-8)}}
function fitPage(){const space=viewportSpace();if(!space.width||!space.height)return;applyZoom(Math.min(space.width/pageWidth.value,space.height/pageHeight.value),"page")}
function fitWidth(){const space=viewportSpace();if(!space.width)return;applyZoom(space.width/pageWidth.value,"width")}
function recalculateActiveZoom(){if(zoomMode.value==="page")fitPage();else if(zoomMode.value==="width")fitWidth()}
function elementHtml(element,offsetX=0,offsetY=0){const x=Number(element.x||0)+offsetX,y=Number(element.y||0)+offsetY,width=Math.max(1,Number(element.width||1)),height=Math.max(1,Number(element.height||1)),base=`position:absolute;left:${x}px;top:${y}px;width:${width}px;height:${height}px;box-sizing:border-box;`;if(element.type==="group")return(element.children||[]).map(child=>elementHtml(child,x,y)).join("");if(element.type==="rich-text")return `<div class="rich-text-content" style="${base}padding:${Number(element.padding||0)}px;font-size:${Number(element.fontSize||14)}px;line-height:${Number(element.lineHeight||1.2)};--paragraph-gap:${Math.max(0,Number(element.paragraphGap)||0)}px;white-space:pre-wrap;overflow:hidden">${escapeHtml(resolveDocumentTokens(element.text||"",laboratoryDocumentContext(laboratory.value)))}</div>`;if(element.type==="separator")return `<div style="${base}height:0;border-top:${Math.max(1,Number(element.borderWidth||1))}px ${element.lineStyle==='dashed'?'dashed':element.lineStyle==='dotted'?'dotted':'solid'} ${escapeHtml(element.strokeColor||'#34495e')};opacity:${Number(element.opacity??100)/100}"></div>`;if(element.type==="rectangle")return `<div style="${base}background:${escapeHtml(element.fillColor||'#eaf1f5')};opacity:${Number(element.opacity??100)/100};border:${Number(element.borderWidth||0)}px ${element.lineStyle==='dashed'?'dashed':element.lineStyle==='dotted'?'dotted':'solid'} ${escapeHtml(element.strokeColor||'#78909c')};border-radius:${Number(element.cornerRadius||0)}px"></div>`;if(element.type==="image"&&element.src)return `<img alt="${escapeHtml(element.alt||'')}" src="${escapeHtml(element.src)}" style="${base}object-fit:${element.fit==='cover'?'cover':element.fit==='stretch'?'fill':'contain'};opacity:${Number(element.opacity??100)/100}" />`;if(element.type==="logo"){const logo=laboratoryLogoUrl(laboratory.value);return logo?`<img alt="Logo del laboratorio" src="${escapeHtml(logo)}" style="${base}object-fit:contain" />`:`<div style="${base}display:grid;place-items:center;border:1px dashed #9fb8c6;color:#526a7a;font-weight:700">Logo no configurado</div>`;}if(element.type==="qr")return `<div style="${base}display:grid;place-items:center;border:1px solid #34495e;font-size:28px">QR</div>`;if(element.type==="exam-table"){const columns=element.columns||[],rows=[{code:'HEM-001',name:'Hematología completa',quantity:'1',unitPrice:'25,00',taxRate:'16,00',taxTotal:'4,00',total:'29,00'},{code:'QUI-010',name:'Glucosa',quantity:'1',unitPrice:'12,50',taxRate:'0,00',taxTotal:'0,00',total:'12,50'}],head=element.showHeader===false?'':`<thead><tr>${columns.map(column=>`<th>${escapeHtml(column.title)}</th>`).join('')}</tr></thead>`,body=`<tbody>${rows.map(row=>`<tr>${columns.map(column=>`<td style="text-align:${column.align||'left'}">${escapeHtml(row[column.field]||'')}</td>`).join('')}</tr>`).join('')}</tbody>`;return `<table style="${base}height:auto;border-collapse:collapse;font-size:11px">${head}${body}</table>`}return''}
function buildHtml(documentJson){if(!documentJson)return"";const page=documentJson.page||{};pageWidth.value=Math.max(1,Number(page.width||816));pageHeight.value=Math.max(1,Number(page.height||1056));const elements=Array.isArray(documentJson.elements)?documentJson.elements:[];return `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;width:${pageWidth.value}px;height:${pageHeight.value}px;background:#fff;font-family:Inter,Arial,sans-serif;overflow:hidden}.page{position:relative;width:${pageWidth.value}px;height:${pageHeight.value}px;background:#fff;overflow:hidden}table th,table td{border:${elements.some(item=>item.type==='exam-table'&&item.showBorders===false)?0:1}px solid #cfd8dc;padding:6px}table th{background:#eaf1f5}</style></head><body><div class="page">${elements.map(item=>elementHtml(item)).join('')}</div></body></html>`}
async function open(definition){title.value=`Vista previa · ${definition?.name||'Comprobante'}`;loading.value=true;errorMessage.value="";previewHtml.value="";zoom.value=1;zoomMode.value="page";dialog.value?.open();try{const [draft,laboratoryValue]=await Promise.all([getDocumentDesign(definition.id),getLaboratory()]);laboratory.value=laboratoryValue;previewDocumentJson.value=draft?.documentJson || null;previewHtml.value=previewDocumentJson.value?"READY":"";pageWidth.value=Math.max(1,Number(previewDocumentJson.value?.page?.width||816));pageHeight.value=Math.max(1,Number(previewDocumentJson.value?.page?.height||1056));await nextTick();resizeObserver?.disconnect();if(viewport.value){resizeObserver=new ResizeObserver(recalculateActiveZoom);resizeObserver.observe(viewport.value)}fitPage()}catch(error){errorMessage.value=error?.message||"No fue posible preparar la vista previa."}finally{loading.value=false}}
function close(){dialog.value?.close()}
function reset(){resizeObserver?.disconnect();resizeObserver=undefined;loading.value=false;errorMessage.value="";previewHtml.value="";previewDocumentJson.value=null;laboratory.value=null;zoom.value=1;zoomMode.value="page"}
onBeforeUnmount(()=>resizeObserver?.disconnect());
defineExpose({open,close});
</script>
<style scoped>
.receipt-preview-toolbar{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:6px;padding:8px 10px;border-bottom:1px solid var(--bio-nexus-color-border);background:var(--bio-nexus-color-surface)}.receipt-preview-zoom-value{min-width:62px;height:34px;border:1px solid var(--bio-nexus-color-border-strong);border-radius:var(--bio-nexus-radius-sm);background:#fff;color:var(--bio-nexus-color-text);font:600 12px var(--bio-nexus-font-family,Inter,Arial,sans-serif);cursor:pointer}.receipt-preview-viewport{box-sizing:border-box;height:100%;min-height:600px;padding:24px;overflow:auto;background:#e7eef3}.receipt-preview-stage{position:relative;margin:0 auto}.receipt-preview-frame{position:absolute;inset:0;display:block;border:0;background:#fff;box-shadow:0 8px 28px rgba(34,59,87,.2)}
</style>

<style scoped>
/* receipt-preview-left-rail */

:global(.receipt-preview-dialog-body){
  position:relative;
  display:grid;
  grid-template-columns:54px minmax(0,1fr);
  grid-template-rows:minmax(0,1fr);
  min-height:0;
  padding:0;
  overflow:hidden;
}
.receipt-preview-toolbar{
  grid-column:1;
  grid-row:1;
  position:relative;
  z-index:3;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:flex-start;
  flex-wrap:nowrap;
  gap:8px;
  min-width:0;
  padding:12px 8px;
  overflow-x:hidden;
  overflow-y:auto;
  border-right:1px solid var(--bio-nexus-color-border);
  border-bottom:0;
  background:var(--bio-nexus-color-surface);
  box-shadow:4px 0 14px rgb(34 59 87 / 8%);
}
.receipt-preview-zoom-value{
  box-sizing:border-box;
  width:40px;
  min-width:40px;
  height:30px;
  padding:0 2px;
  font-size:10px;
}
.receipt-preview-rail-divider{
  display:block;
  width:28px;
  height:1px;
  margin:2px 0;
  background:var(--bio-nexus-color-border);
}
.receipt-preview-viewport{
  grid-column:2;
  grid-row:1;
  box-sizing:border-box;
  width:auto;
  min-width:0;
  height:100%;
  min-height:0;
  padding:18px;
  overflow:auto;
}
:global(.receipt-preview-dialog-body>.bio-nexus-message){grid-column:1/-1;grid-row:1}
@media(max-width:580px){
  :global(.receipt-preview-dialog-body){grid-template-columns:46px minmax(0,1fr)}
  .receipt-preview-toolbar{gap:6px;padding:9px 5px}
  .receipt-preview-zoom-value{width:34px;min-width:34px;font-size:9px}
  .receipt-preview-viewport{padding:12px}
}

.rich-text-content p{margin:0 0 var(--paragraph-gap,0)}
.rich-text-content p:last-child{margin-bottom:0}
</style>
