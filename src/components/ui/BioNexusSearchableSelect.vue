<template>
  <div ref="root" class="bio-search-select" @keydown="onKeydown">
    <button :id="id" ref="trigger" type="button" class="bio-nexus-field bio-search-trigger" role="combobox" :aria-expanded="open" aria-haspopup="listbox" :aria-controls="`${id}-listbox`" :disabled="disabled" @click="toggle">
      <span :class="{ placeholder: !selectedLabel }">{{ selectedLabel || placeholder }}</span><span aria-hidden="true">⌄</span>
    </button>
    <section v-if="open" class="bio-search-popover">
      <input ref="searchInput" v-model="query" class="bio-nexus-field bio-search-input" type="search" autocomplete="off" :placeholder="searchPlaceholder" aria-label="Buscar opciones" />
      <div :id="`${id}-listbox`" class="bio-search-list" role="listbox">
        <button v-for="(option,index) in filtered" :key="optionKey(option)" type="button" class="bio-search-option" :class="{ active:index===active, selected:isSelected(option), disabled:isDisabled(option) }" role="option" :aria-selected="isSelected(option)" :disabled="isDisabled(option)" @mousemove="active=index" @click="select(option)">{{ optionLabel(option) }}</button>
        <p v-if="filtered.length===0" class="bio-search-empty">{{ emptyText }}</p>
      </div>
    </section>
  </div>
</template>
<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
const props=defineProps({id:{type:String,required:true},modelValue:{default:null},options:{type:Array,default:()=>[]},valueKey:{type:String,default:"value"},labelKey:{type:String,default:"label"},disabledKey:{type:String,default:"disabled"},placeholder:{type:String,default:"Seleccione"},searchPlaceholder:{type:String,default:"Buscar..."},emptyText:{type:String,default:"Sin coincidencias"},disabled:{type:Boolean,default:false}});
const emit=defineEmits(["update:modelValue","change"]),root=ref(null),trigger=ref(null),searchInput=ref(null),open=ref(false),query=ref(""),active=ref(-1);
const normalize=value=>String(value??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase();
const optionValue=option=>option?.[props.valueKey],optionLabel=option=>String(option?.[props.labelKey]??""),optionKey=option=>String(optionValue(option)),isDisabled=option=>Boolean(option?.[props.disabledKey]);
const selected=computed(()=>props.options.find(option=>String(optionValue(option))===String(props.modelValue))),selectedLabel=computed(()=>selected.value?optionLabel(selected.value):"");
const filtered=computed(()=>{const term=normalize(query.value.trim());return term?props.options.filter(option=>normalize(optionLabel(option)).includes(term)):props.options});
const isSelected=option=>String(optionValue(option))===String(props.modelValue);
async function show(){if(props.disabled)return;open.value=true;query.value="";active.value=Math.max(0,filtered.value.findIndex(isSelected));await nextTick();searchInput.value?.focus()}
function close(focus=false){open.value=false;query.value="";active.value=-1;if(focus)nextTick(()=>trigger.value?.focus())}
function toggle(){open.value?close():show()}
function select(option){if(isDisabled(option))return;emit("update:modelValue",optionValue(option));emit("change",option);close(true)}
function move(delta){if(!open.value){show();return}const length=filtered.value.length;if(!length)return;let next=active.value;do{next=(next+delta+length)%length}while(isDisabled(filtered.value[next])&&next!==active.value);active.value=next;nextTick(()=>root.value?.querySelectorAll(".bio-search-option")?.[next]?.scrollIntoView({block:"nearest"}))}
function onKeydown(event){if(event.key==="ArrowDown"){event.preventDefault();move(1)}else if(event.key==="ArrowUp"){event.preventDefault();move(-1)}else if(event.key==="Enter"&&open.value&&active.value>=0){event.preventDefault();select(filtered.value[active.value])}else if(event.key==="Escape"&&open.value){event.preventDefault();close(true)}}
function onDocumentPointer(event){if(open.value&&!root.value?.contains(event.target))close()}
onMounted(()=>document.addEventListener("pointerdown",onDocumentPointer));onBeforeUnmount(()=>document.removeEventListener("pointerdown",onDocumentPointer));
</script>
<style scoped>
.bio-search-select{position:relative;min-width:0}.bio-search-trigger{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;text-align:left;cursor:pointer}.placeholder{color:var(--bio-nexus-color-text-muted)}.bio-search-popover{position:absolute;z-index:80;top:calc(100% + 6px);left:0;right:0;padding:6px;border:1px solid var(--bio-nexus-color-border-strong);border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-surface);box-shadow:0 16px 42px rgb(15 23 42 / 20%)}.bio-search-input{height:40px!important}.bio-search-list{display:grid;max-height:280px;overflow:auto;margin-top:5px}.bio-search-option{padding:9px 10px;border:0;border-radius:var(--bio-nexus-radius-sm);background:transparent;color:var(--bio-nexus-color-text);text-align:left;cursor:pointer}.bio-search-option:hover,.bio-search-option.active{background:var(--bio-nexus-color-info-soft)}.bio-search-option.selected{color:var(--bio-nexus-color-primary);font-weight:700}.bio-search-option.disabled{opacity:.5;cursor:not-allowed}.bio-search-empty{margin:0;padding:10px;color:var(--bio-nexus-color-text-muted)}
</style>