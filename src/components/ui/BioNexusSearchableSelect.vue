<template>
  <div ref="root" class="bio-search-select" @keydown="onKeydown">
    <button :id="id" ref="trigger" type="button" class="bio-nexus-field bio-search-trigger" role="combobox" :aria-expanded="open" aria-haspopup="listbox" :aria-controls="`${id}-listbox`" :disabled="disabled" @click="toggle">
      <span :class="{ placeholder: !selectedLabel }">{{ selectedLabel || placeholder }}</span>
      <span aria-hidden="true">⌄</span>
    </button>

    <Teleport :to="teleportTarget">
      <section v-if="open" ref="popover" class="bio-search-popover" :class="{ 'bio-search-popover-above': placement === 'above' }" :style="popoverStyle">
        <input ref="searchInput" v-model="query" class="bio-nexus-field bio-search-input" type="search" autocomplete="off" :placeholder="searchPlaceholder" aria-label="Buscar opciones">
        <div :id="`${id}-listbox`" class="bio-search-list" role="listbox">
          <button v-for="(option,index) in filtered" :key="optionKey(option)" type="button" class="bio-search-option" :class="{ active:index===active, selected:isSelected(option), disabled:isDisabled(option) }" role="option" :aria-selected="isSelected(option)" :disabled="isDisabled(option)" @mousemove="active=index" @click="select(option)">{{ optionLabel(option) }}</button>
          <p v-if="filtered.length===0" class="bio-search-empty">{{ emptyText }}</p>
        </div>
      </section>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";

const props=defineProps({id:{type:String,required:true},modelValue:{default:null},options:{type:Array,default:()=>[]},valueKey:{type:String,default:"value"},labelKey:{type:String,default:"label"},disabledKey:{type:String,default:"disabled"},placeholder:{type:String,default:"Seleccione"},searchPlaceholder:{type:String,default:"Buscar..."},emptyText:{type:String,default:"Sin coincidencias"},disabled:{type:Boolean,default:false}});
const emit=defineEmits(["update:modelValue","change"]),root=ref(null),trigger=ref(null),popover=ref(null),searchInput=ref(null),open=ref(false),query=ref(""),active=ref(-1),placement=ref("below"),popoverStyle=ref({}),teleportTarget=ref("body");
const viewportMargin=8,popupGap=6,popupMaxHeight=340;
const normalize=value=>String(value??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase();
const optionValue=option=>option?.[props.valueKey],optionLabel=option=>String(option?.[props.labelKey]??""),optionKey=option=>String(optionValue(option)),isDisabled=option=>Boolean(option?.[props.disabledKey]);
const selected=computed(()=>props.options.find(option=>String(optionValue(option))===String(props.modelValue))),selectedLabel=computed(()=>selected.value?optionLabel(selected.value):"");
const filtered=computed(()=>{const term=normalize(query.value.trim());return term?props.options.filter(option=>normalize(optionLabel(option)).includes(term)):props.options});
const isSelected=option=>String(optionValue(option))===String(props.modelValue);

function updatePosition(){if(!open.value||!trigger.value)return;const rect=trigger.value.getBoundingClientRect(),dialog=teleportTarget.value instanceof HTMLDialogElement?teleportTarget.value:null,bounds=dialog?dialog.getBoundingClientRect():{top:0,left:0,right:globalThis.innerWidth,bottom:globalThis.innerHeight},spaceBelow=bounds.bottom-rect.bottom-viewportMargin,spaceAbove=rect.top-bounds.top-viewportMargin,openAbove=spaceBelow<Math.min(280,popupMaxHeight)&&spaceAbove>spaceBelow,maxHeight=Math.max(120,Math.min(popupMaxHeight,(openAbove?spaceAbove:spaceBelow)-popupGap)),left=Math.max(viewportMargin,rect.left-bounds.left),top=rect.bottom-bounds.top+popupGap,bottom=bounds.bottom-rect.top+popupGap;placement.value=openAbove?"above":"below";popoverStyle.value={position:dialog?"absolute":"fixed",left:`${left}px`,top:openAbove?"auto":`${top}px`,bottom:openAbove?`${bottom}px`:"auto",width:`${rect.width}px`,maxHeight:`${maxHeight}px`}}
async function show(){if(props.disabled)return;const dialog=root.value?.closest?.("dialog[open]")||null,scrollTop=dialog?.scrollTop||0,scrollLeft=dialog?.scrollLeft||0;teleportTarget.value=dialog||document.body;open.value=true;query.value="";active.value=Math.max(0,filtered.value.findIndex(isSelected));await nextTick();updatePosition();searchInput.value?.focus({preventScroll:true});if(dialog){dialog.scrollTop=scrollTop;dialog.scrollLeft=scrollLeft}}
function close(focus=false){open.value=false;query.value="";active.value=-1;if(focus)nextTick(()=>trigger.value?.focus({preventScroll:true}))}
function toggle(){open.value?close():show()}
function select(option){if(isDisabled(option))return;emit("update:modelValue",optionValue(option));emit("change",option);close(true)}
function move(delta){if(!open.value){show();return}const length=filtered.value.length;if(!length)return;let next=active.value;do{next=(next+delta+length)%length}while(isDisabled(filtered.value[next])&&next!==active.value);active.value=next;nextTick(()=>popover.value?.querySelectorAll(".bio-search-option")?.[next]?.scrollIntoView({block:"nearest"}))}
function onKeydown(event){if(event.key==="ArrowDown"){event.preventDefault();move(1)}else if(event.key==="ArrowUp"){event.preventDefault();move(-1)}else if(event.key==="Enter"&&open.value&&active.value>=0){event.preventDefault();select(filtered.value[active.value])}else if(event.key==="Escape"&&open.value){event.preventDefault();close(true)}}
function onDocumentPointer(event){if(open.value&&!root.value?.contains(event.target)&&!popover.value?.contains(event.target))close()}
function onViewportChange(){if(open.value)updatePosition()}
onMounted(()=>{document.addEventListener("pointerdown",onDocumentPointer);globalThis.addEventListener("resize",onViewportChange);globalThis.addEventListener("scroll",onViewportChange,true)});
onBeforeUnmount(()=>{document.removeEventListener("pointerdown",onDocumentPointer);globalThis.removeEventListener("resize",onViewportChange);globalThis.removeEventListener("scroll",onViewportChange,true)});
defineExpose({focus:()=>trigger.value?.focus({preventScroll:true}),open:show,close});
</script>

<style scoped>
.bio-search-select{position:relative;min-width:0;width:100%}.bio-search-trigger{box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;height:46px;min-height:46px;margin:0;padding-block-start:12px;padding-block-end:7px;text-align:left;cursor:pointer}.bio-search-trigger>span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.placeholder{color:var(--bio-nexus-color-text-muted)}.bio-search-popover{z-index:2147483000;display:grid;grid-template-rows:auto minmax(0,1fr);box-sizing:border-box;padding:6px;overflow:hidden;border:1px solid var(--bio-nexus-color-border-strong);border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-surface);box-shadow:0 16px 42px rgb(15 23 42 / 20%)}.bio-search-input{box-sizing:border-box;width:100%;height:40px!important;min-height:40px!important}.bio-search-list{display:grid;min-height:0;max-height:none;overflow:auto;margin-top:5px}.bio-search-option{padding:9px 10px;border:0;border-radius:var(--bio-nexus-radius-sm);background:transparent;color:var(--bio-nexus-color-text);text-align:left;cursor:pointer}.bio-search-option:hover,.bio-search-option.active{background:var(--bio-nexus-color-info-soft)}.bio-search-option.selected{color:var(--bio-nexus-color-primary);font-weight:700}.bio-search-option.disabled{opacity:.5;cursor:not-allowed}.bio-search-empty{margin:0;padding:10px;color:var(--bio-nexus-color-text-muted)}
</style>