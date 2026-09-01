<template>
  <section class="exam-order-page">
    <div class="exam-order-commandbar" aria-label="Acciones de ordenamiento">
      <p>Arrastra una fila, usa los botones o selecciónala con clic. Muévela con ↑ o ↓, Enter para fijar y Esc para cancelar.</p>
      <div class="exam-order-actions">
        <button class="exam-order-button exam-order-button--secondary" type="button" :disabled="!dirty || saving" @click="discard">Descartar</button>
        <button class="exam-order-button exam-order-button--primary" type="button" :disabled="!dirty || !canUpdate || saving" @click="save">{{ saving ? "Guardando..." : "Guardar orden" }}</button>
      </div>
    </div>
    <p v-if="error" class="exam-order-error">{{ error }}</p>
    <div v-if="loading" class="exam-order-state">Cargando catálogo...</div>
    <div v-else class="exam-order-layout">
      <article class="exam-order-panel"><header><div><small>ORDEN GLOBAL</small><h2>Grupos de exámenes</h2></div><span>{{ groups.length }} grupo(s)</span></header>
        <ol class="exam-order-list" @dragover.prevent="autoScroll($event)">
  <li v-for="(group,index) in groups" :key="group.id" :data-order-key="`group-${group.id}`" draggable="true" :tabindex="0" :aria-selected="keyboardSelection?.type==='group'&&keyboardSelection?.id===group.id" :class="{selected:group.id===selectedGroupId,inactive:group.annulled,dragging:dragState?.type==='group'&&dragState?.id===group.id,'keyboard-selected':keyboardSelection?.type==='group'&&keyboardSelection?.id===group.id}" @focus="selectForKeyboard('group',group.id)" @click="activateKeyboardSelection('group',group.id,$event)" @dragstart="startDrag('group',index,$event)" @dragenter.prevent="previewRow('group',index,$event)" @dragover.prevent="previewRow('group',index,$event)" @drop.prevent="endDrag" @dragend="endDrag">
    <button class="select-row" type="button" @click="selectedGroupId=group.id"><span class="order-number">{{ index + 1 }}</span><span class="drag-icon" aria-hidden="true">⋮⋮</span><span><strong>{{ group.description }}</strong><small>{{ group.annulled ? "Inactivo" : "Activo" }}</small></span></button>
    <div class="move-actions"><button type="button" :disabled="index===0 || saving" aria-label="Subir grupo" @click="move(groups,index,-1)">↑</button><button type="button" :disabled="index===groups.length-1 || saving" aria-label="Bajar grupo" @click="move(groups,index,1)">↓</button></div>
  </li>
</ol>
      </article>
      <article class="exam-order-panel"><header><div><small>ORDEN DEL GRUPO</small><h2>{{ selectedGroup?.description || "Exámenes" }}</h2></div><span>{{ exams.length }} examen(es)</span></header>
        <div v-if="!selectedGroup" class="exam-order-state">Selecciona un grupo.</div><ol v-else class="exam-order-list" @dragover.prevent="autoScroll($event)">
  <li v-for="(exam,index) in exams" :key="exam.id" :data-order-key="`exam-${exam.id}`" draggable="true" :tabindex="0" :aria-selected="keyboardSelection?.type==='exam'&&keyboardSelection?.id===exam.id" :class="{inactive:exam.annulled,dragging:dragState?.type==='exam'&&dragState?.id===exam.id,'keyboard-selected':keyboardSelection?.type==='exam'&&keyboardSelection?.id===exam.id}" @focus="selectForKeyboard('exam',exam.id)" @click="activateKeyboardSelection('exam',exam.id,$event)" @dragstart="startDrag('exam',index,$event)" @dragenter.prevent="previewRow('exam',index,$event)" @dragover.prevent="previewRow('exam',index,$event)" @drop.prevent="endDrag" @dragend="endDrag">
    <div class="select-row static"><span class="order-number">{{ index + 1 }}</span><span class="drag-icon" aria-hidden="true">⋮⋮</span><span><strong>{{ exam.description }}</strong><small>{{ exam.abbreviation }} · {{ exam.annulled ? "Inactivo" : "Activo" }}</small></span></div>
    <div class="move-actions"><button type="button" :disabled="index===0 || saving" aria-label="Subir examen" @click="move(exams,index,-1)">↑</button><button type="button" :disabled="index===exams.length-1 || saving" aria-label="Bajar examen" @click="move(exams,index,1)">↓</button></div>
  </li>
</ol>
      </article>
    </div>
  </section>
</template>
<script setup>
import { computed,onBeforeUnmount,onMounted,ref,watch } from "vue";
import { onBeforeRouteLeave } from "vue-router";
import { useAuthorizationStore } from "@/stores/authorization";
import { useBioNexusToast } from "@/composables/useBioNexusToast";
import { examCatalogError,getExamGroups,getExamsByGroup,reorderExamGroups,reorderExams } from "@/services/examCatalogService";
const auth=useAuthorizationStore(),toast=useBioNexusToast(),groups=ref([]),examsByGroup=ref({}),selectedGroupId=ref(null),loading=ref(true),saving=ref(false),error=ref(""),original=ref(""),dragState=ref(null),dragOver=ref(null),keyboardSelection=ref(null),changeVersion=ref(0);
const selectedGroup=computed(()=>groups.value.find(x=>x.id===selectedGroupId.value)||null),exams=computed(()=>examsByGroup.value[selectedGroupId.value]||[]),snapshot=()=>JSON.stringify({groups:groups.value.map(x=>x.id),exams:Object.fromEntries(groups.value.map(g=>[g.id,(examsByGroup.value[g.id]||[]).map(x=>x.id)]))}),dirty=computed(()=>{changeVersion.value;return !loading.value&&snapshot()!==original.value}),canUpdate=computed(()=>auth.hasPermission("exam-catalog.update"));
function markOrderChanged(){changeVersion.value++}
function move(list,index,delta){const target=index+delta;if(target<0||target>=list.length)return false;const [row]=list.splice(index,1);list.splice(target,0,row);markOrderChanged();return true}
function listFor(type){return type==="group"?groups.value:exams.value}
function selectForKeyboard(type,id){if(keyboardSelection.value?.type===type&&keyboardSelection.value?.id===id)return;const list=listFor(type);keyboardSelection.value={type,id,originalIds:list.map(row=>row.id)};if(type==="group")selectedGroupId.value=id}
function activateKeyboardSelection(type,id,event){event?.preventDefault?.();event?.stopPropagation?.();if(keyboardSelection.value?.type===type&&keyboardSelection.value?.id===id)return;confirmKeyboardMove();selectForKeyboard(type,id);focusSelectedRow(type,id)}
function clearKeyboardSelection(){keyboardSelection.value=null;document.activeElement?.blur?.()}
function confirmKeyboardMove(){clearKeyboardSelection()}
function cancelKeyboardMove(){const selection=keyboardSelection.value;if(!selection)return;const list=listFor(selection.type),byId=new Map(list.map(row=>[row.id,row]));list.splice(0,list.length,...selection.originalIds.map(id=>byId.get(id)).filter(Boolean));markOrderChanged();const type=selection.type,id=selection.id;clearKeyboardSelection();requestAnimationFrame(()=>document.querySelector(`[data-order-key="${type}-${id}"]`)?.scrollIntoView({block:"nearest",inline:"nearest",behavior:"auto"}))}
function focusSelectedRow(type,id){requestAnimationFrame(()=>{const row=document.querySelector(`[data-order-key="${type}-${id}"]`);row?.focus({preventScroll:true});row?.scrollIntoView({block:"nearest",inline:"nearest",behavior:"auto"})})}
function moveSelected(type,delta){if(saving.value||keyboardSelection.value?.type!==type)return;const id=keyboardSelection.value.id,list=listFor(type),index=list.findIndex(row=>row.id===id);if(index<0)return;const target=index+delta;if(target<0||target>=list.length)return;move(list,index,delta);focusSelectedRow(type,id)}
function handleKeyboardMove(event){if(!keyboardSelection.value||event.defaultPrevented||event.altKey||event.ctrlKey||event.metaKey)return;const target=event.target;if(target instanceof HTMLInputElement||target instanceof HTMLTextAreaElement||target instanceof HTMLSelectElement||target?.isContentEditable)return;if(event.key==="ArrowUp"){event.preventDefault();event.stopPropagation();moveSelected(keyboardSelection.value.type,-1)}else if(event.key==="ArrowDown"){event.preventDefault();event.stopPropagation();moveSelected(keyboardSelection.value.type,1)}else if(event.key==="Enter"){event.preventDefault();event.stopPropagation();confirmKeyboardMove()}else if(event.key==="Escape"){event.preventDefault();event.stopPropagation();cancelKeyboardMove()}}
function startDrag(type,index,event){if(saving.value)return;const list=type==="group"?groups.value:exams.value;dragState.value={type,id:list[index]?.id};dragOver.value=null;if(event?.dataTransfer){event.dataTransfer.effectAllowed="move";event.dataTransfer.setData("text/plain",`${type}:${list[index]?.id}`);const image=new Image();image.src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";event.dataTransfer.setDragImage(image,0,0)}}
function currentDragIndex(type){const source=dragState.value;if(!source||source.type!==type)return -1;const list=type==="group"?groups.value:exams.value;return list.findIndex(row=>row.id===source.id)}
function previewRow(type,rowIndex,event){if(dragState.value?.type!==type)return;const list=type==="group"?groups.value:exams.value;const sourceIndex=currentDragIndex(type);if(sourceIndex<0)return;const row=event.currentTarget,rect=row.getBoundingClientRect(),after=event.clientY>=rect.top+rect.height/2;let target=rowIndex+(after?1:0);if(sourceIndex<target)target--;if(target===sourceIndex)return;const [moved]=list.splice(sourceIndex,1);list.splice(target,0,moved);markOrderChanged();dragOver.value={type,id:moved.id};if(type==="group")selectedGroupId.value=moved.id}
function autoScroll(event){if(!dragState.value)return;const list=event.currentTarget;if(!list)return;const rect=list.getBoundingClientRect(),edge=44,step=9;if(event.clientY<rect.top+edge)list.scrollTop-=step;else if(event.clientY>rect.bottom-edge)list.scrollTop+=step}
function endDrag(){dragState.value=null;dragOver.value=null}
async function load(){loading.value=true;error.value="";try{groups.value=await getExamGroups();const entries=await Promise.all(groups.value.map(async g=>[g.id,await getExamsByGroup(g.id)]));examsByGroup.value=Object.fromEntries(entries);selectedGroupId.value=groups.value[0]?.id||null;original.value=snapshot();markOrderChanged()}catch(e){error.value=examCatalogError(e,"No fue posible cargar el orden de exámenes.");toast.error(error.value)}finally{loading.value=false}}
async function save(){if(!dirty.value||!canUpdate.value||saving.value)return;saving.value=true;error.value="";try{const before=JSON.parse(original.value),current=JSON.parse(snapshot());if(JSON.stringify(before.groups)!==JSON.stringify(current.groups))await reorderExamGroups(current.groups);for(const group of groups.value){if(JSON.stringify(before.exams[group.id])!==JSON.stringify(current.exams[group.id]))await reorderExams(group.id,current.exams[group.id])}toast.success("Orden guardado correctamente.");await load()}catch(e){error.value=examCatalogError(e,"No fue posible guardar el orden.");toast.error(error.value);await load()}finally{saving.value=false}}
function discard(){const value=JSON.parse(original.value),byGroup=new Map(groups.value.map(x=>[x.id,x])),examMaps=Object.fromEntries(Object.entries(examsByGroup.value).map(([id,rows])=>[id,new Map(rows.map(x=>[x.id,x]))]));groups.value=value.groups.map(id=>byGroup.get(id)).filter(Boolean);examsByGroup.value=Object.fromEntries(Object.entries(value.exams).map(([id,ids])=>[id,ids.map(x=>examMaps[id]?.get(x)).filter(Boolean)]));markOrderChanged()}
function guard(event){if(dirty.value){event.preventDefault();event.returnValue=""}}onBeforeRouteLeave(()=>!dirty.value||globalThis.confirm("Hay cambios de orden sin guardar. ¿Deseas salir y descartarlos?"));watch(selectedGroupId,()=>{error.value=""});onMounted(()=>{globalThis.addEventListener("beforeunload",guard);globalThis.addEventListener("keydown",handleKeyboardMove,{capture:true});load()});onBeforeUnmount(()=>{globalThis.removeEventListener("beforeunload",guard);globalThis.removeEventListener("keydown",handleKeyboardMove,{capture:true})});
</script>
<style scoped>
.exam-order-page{display:grid;gap:var(--bio-nexus-space-4);min-width:0;color:var(--bio-nexus-color-text);font-family:var(--bio-nexus-font-family,Inter,Roboto,Arial,sans-serif);font-size:13px;font-weight:400}
.exam-order-commandbar{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:58px;padding:10px 14px;border:1px solid var(--bio-nexus-color-border);border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-surface);box-shadow:var(--bio-nexus-shadow-sm)}
.exam-order-commandbar p{margin:0;color:var(--bio-nexus-color-text-secondary);font-size:13px;font-weight:400}
.exam-order-actions{display:flex;align-items:center;gap:8px}
.exam-order-button{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;min-width:112px;height:38px;padding:0 14px;border-radius:var(--bio-nexus-radius-sm);font:600 13px/1 var(--bio-nexus-font-family,Inter,Roboto,Arial,sans-serif);cursor:pointer;transition:background-color .15s ease,border-color .15s ease,color .15s ease,box-shadow .15s ease}
.exam-order-button--primary{border:1px solid var(--bio-nexus-color-primary);background:var(--bio-nexus-color-primary);color:#fff}
.exam-order-button--primary:hover:not(:disabled){background:var(--bio-nexus-color-primary-strong);border-color:var(--bio-nexus-color-primary-strong)}
.exam-order-button--secondary{border:1px solid var(--bio-nexus-color-border-strong);background:var(--bio-nexus-color-surface);color:var(--bio-nexus-color-primary)}
.exam-order-button--secondary:hover:not(:disabled){border-color:var(--bio-nexus-color-primary);background:var(--bio-nexus-color-info-soft)}
.exam-order-button:focus-visible,.move-actions button:focus-visible,.select-row:focus-visible{outline:2px solid var(--bio-nexus-color-primary);outline-offset:2px}
.exam-order-button:disabled{cursor:not-allowed;opacity:.48}
.exam-order-layout{display:grid;grid-template-columns:minmax(300px,.9fr) minmax(380px,1.1fr);gap:16px;align-items:start}
.exam-order-panel{min-width:0;padding:14px;border:1px solid var(--bio-nexus-color-border);border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-surface);box-shadow:var(--bio-nexus-shadow-sm)}
.exam-order-panel>header{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:48px;margin-bottom:10px;padding:0 2px 10px;border-bottom:1px solid var(--bio-nexus-color-border)}
.exam-order-panel h2{margin:2px 0 0;color:var(--bio-nexus-color-text);font-size:17px;font-weight:700;line-height:1.2}
.exam-order-panel header>span{flex:none;color:var(--bio-nexus-color-text-muted);font-size:12px;font-weight:600}
.exam-order-panel small{color:var(--bio-nexus-color-accent);font-size:10px;font-weight:800;letter-spacing:.04em}
.exam-order-list{display:grid;gap:8px;height:clamp(430px,calc(100vh - 330px),680px);min-height:430px;max-height:680px;margin:0;padding:4px 6px 12px 2px;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;scrollbar-gutter:stable;list-style:none}
.exam-order-list li{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;min-height:54px;border:1px solid var(--bio-nexus-color-border);border-radius:var(--bio-nexus-radius-sm);background:var(--bio-nexus-color-surface-soft);cursor:grab;transition:border-color .15s ease,background-color .15s ease,opacity .15s ease,transform .15s ease}
.exam-order-list li:active{cursor:grabbing}.exam-order-list li:focus{outline:none}.exam-order-list li:focus-visible{outline:2px solid var(--bio-nexus-color-primary);outline-offset:2px}
.exam-order-list li.selected{border-color:var(--bio-nexus-color-primary);box-shadow:inset 3px 0 0 var(--bio-nexus-color-accent)}
.exam-order-list li.keyboard-selected{position:relative;z-index:2;scroll-margin-block:24px;cursor:ns-resize;border:2px solid var(--bio-nexus-color-primary);background:var(--bio-nexus-color-info-soft);box-shadow:0 0 0 3px rgba(20,105,170,.16),inset 5px 0 0 var(--bio-nexus-color-accent)}.exam-order-list li.keyboard-selected::after{content:"SELECCIONADO · ↑ ↓ · ENTER · ESC";position:absolute;right:92px;top:5px;color:var(--bio-nexus-color-primary);font-size:9px;font-weight:800;letter-spacing:.04em}.exam-order-list li.keyboard-selected .order-number{border:2px solid var(--bio-nexus-color-primary);background:var(--bio-nexus-color-primary);color:#fff;transform:scale(1.08)}.exam-order-list li.dragging{opacity:.72;transform:scale(.995);border-color:var(--bio-nexus-color-accent);box-shadow:inset 3px 0 0 var(--bio-nexus-color-accent)}
.exam-order-list li.inactive{opacity:.62}
.select-row{box-sizing:border-box;display:flex;align-items:center;gap:10px;min-width:0;min-height:52px;padding:8px 10px;border:0;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
.select-row.static{cursor:grab}
.select-row>span:not(.drag-icon):not(.order-number){display:grid;gap:2px;min-width:0}
.select-row strong{overflow:hidden;color:var(--bio-nexus-color-text);font-size:13px;font-weight:600;line-height:1.2;text-overflow:ellipsis;white-space:nowrap}
.select-row small{overflow:hidden;color:var(--bio-nexus-color-text-muted);font-size:11px;font-weight:500;line-height:1.2;letter-spacing:0;text-overflow:ellipsis;white-space:nowrap}
.order-number{box-sizing:border-box;display:grid;place-items:center;flex:none;width:34px;height:34px;border:1px solid var(--bio-nexus-color-border-strong);border-radius:50%;background:var(--bio-nexus-color-surface);color:var(--bio-nexus-color-text-secondary);font-size:12px;font-weight:700;font-variant-numeric:tabular-nums}
.drag-icon{flex:none;color:var(--bio-nexus-color-primary);font-size:15px;font-weight:700;cursor:grab}
.move-actions{display:flex;gap:5px;padding-right:8px}
.move-actions button{display:grid;place-items:center;width:38px;height:38px;padding:0;border:1px solid var(--bio-nexus-color-border);border-radius:50%;background:var(--bio-nexus-color-surface);color:var(--bio-nexus-color-primary);font:600 17px/1 var(--bio-nexus-font-family,Inter,Roboto,Arial,sans-serif);cursor:pointer}
.move-actions button:hover:not(:disabled){border-color:var(--bio-nexus-color-primary);background:var(--bio-nexus-color-info-soft)}
.move-actions button:disabled{cursor:not-allowed;opacity:.32}
.exam-order-list::-webkit-scrollbar{width:10px}
.exam-order-list::-webkit-scrollbar-thumb{border:2px solid transparent;border-radius:999px;background:var(--bio-nexus-color-border-strong);background-clip:padding-box}
.exam-order-list::-webkit-scrollbar-track{background:transparent}
.exam-order-state{padding:24px;text-align:center;color:var(--bio-nexus-color-text-muted);font-size:13px}
.exam-order-error{margin:0;padding:10px 12px;border:1px solid var(--bio-nexus-color-danger);border-radius:var(--bio-nexus-radius-sm);background:var(--bio-nexus-color-danger-soft);color:var(--bio-nexus-color-danger);font-size:13px}
@media(max-width:900px){.exam-order-layout{grid-template-columns:1fr}.exam-order-commandbar{align-items:stretch;flex-direction:column}.exam-order-actions{justify-content:flex-end}.exam-order-list{height:520px;min-height:420px}}
@media(max-width:560px){.exam-order-actions{display:grid;grid-template-columns:1fr 1fr}.exam-order-button{min-width:0;width:100%}}
</style>
