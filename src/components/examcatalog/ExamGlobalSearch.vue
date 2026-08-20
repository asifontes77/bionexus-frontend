<template>
  <section class="exam-global-search" @keydown.esc="closeResults">
    <label class="exam-global-search-label" for="exam-global-search">Buscar en todo el catalogo</label>
    <div class="exam-global-search-control">
      <BioNexusIcon class="exam-global-search-icon" name="search" :size="19" />
      <input id="exam-global-search" ref="input" :value="modelValue" class="bio-nexus-field" type="search" autocomplete="off" placeholder="Escribe al menos 2 caracteres" @input="onInput" @focus="reopen" />
      <span v-if="loading" class="exam-global-search-loading">Buscando...</span>
      <button v-else-if="modelValue" type="button" class="exam-global-search-clear" aria-label="Limpiar busqueda" @click="clear">x</button>
    </div>
    <p class="exam-global-search-help">Busca por descripcion o abreviatura, sin seleccionar un grupo.</p>
    <div v-if="open" class="exam-global-results" role="listbox">
      <button v-for="result in results" :key="result.id" type="button" role="option" @click="select(result)">
        <span><strong>{{ result.description }}</strong><small>{{ result.abbreviation || 'Sin abreviatura' }} - {{ result.group_description }}</small></span>
        <em :class="{ inactive: result.annulled || result.group_annulled }">{{ result.annulled || result.group_annulled ? 'Inactivo' : 'Activo' }}</em>
      </button>
      <div v-if="!loading && results.length === 0" class="exam-global-empty">No se encontraron examenes.</div>
    </div>
    <p v-if="errorMessage" class="exam-global-error">{{ errorMessage }}</p>
  </section>
</template>
<script setup>
import { nextTick, onBeforeUnmount, ref } from "vue";
import BioNexusIcon from "@/components/ui/BioNexusIcon.vue";
import { examCatalogError, searchExamCatalog } from "@/services/examCatalogService";
const props=defineProps({modelValue:{type:String,default:""}});const emit=defineEmits(["update:modelValue","select"]);const input=ref(null),results=ref([]),loading=ref(false),open=ref(false),errorMessage=ref("");let timer=null,requestId=0;
function onInput(event){const value=event.target.value;emit("update:modelValue",value);errorMessage.value="";if(timer)globalThis.clearTimeout(timer);const term=value.trim();if(term.length<2){results.value=[];open.value=false;return}timer=globalThis.setTimeout(()=>search(term),280)}
async function search(term){const id=++requestId;loading.value=true;try{const loaded=await searchExamCatalog(term,20);if(id!==requestId)return;results.value=loaded;open.value=true}catch(error){if(id!==requestId)return;results.value=[];open.value=false;errorMessage.value=examCatalogError(error,"No fue posible buscar en el catalogo.")}finally{if(id===requestId)loading.value=false}}
function select(result){emit("select",result);open.value=false}function closeResults(){open.value=false}function reopen(){if(results.value.length>0&&props.modelValue.trim().length>=2)open.value=true}function clear(){emit("update:modelValue","");results.value=[];open.value=false;errorMessage.value="";nextTick(()=>input.value?.focus())}onBeforeUnmount(()=>{if(timer)globalThis.clearTimeout(timer);requestId+=1});defineExpose({clear});
</script>
<style scoped>
.exam-global-search{position:relative;isolation:isolate;margin:0 0 var(--bio-nexus-space-4);padding:18px 24px 16px;border:1px solid var(--bio-nexus-color-border);border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-surface);box-shadow:var(--bio-nexus-shadow-sm);overflow:visible}.exam-global-search-label{display:block;margin:0 0 8px 16px;color:var(--bio-nexus-color-text-muted);font-family:var(--bio-nexus-font-family);font-size:var(--bio-nexus-font-size-sm);font-weight:700;line-height:1.2}.exam-global-search-control{position:relative;display:block;width:100%;box-sizing:border-box}.exam-global-search-control input{box-sizing:border-box;width:100%;min-width:0;height:56px;padding-left:64px!important;padding-right:96px!important}.exam-global-search-icon{position:absolute;left:24px;top:50%;z-index:2;color:var(--bio-nexus-color-primary);pointer-events:none;transform:translateY(-50%)}.exam-global-search-loading{position:absolute;right:20px;top:50%;color:var(--bio-nexus-color-text-muted);font-size:var(--bio-nexus-font-size-sm);transform:translateY(-50%)}.exam-global-search-clear{position:absolute;right:16px;top:50%;display:grid;place-items:center;width:28px;height:28px;border:0;border-radius:50%;background:transparent;color:var(--bio-nexus-color-text-muted);font-size:18px;cursor:pointer;transform:translateY(-50%)}.exam-global-search-clear:hover{background:var(--bio-nexus-color-info-soft);color:var(--bio-nexus-color-primary-strong)}.exam-global-search-help{margin:8px 0 0;color:var(--bio-nexus-color-text-muted);font-size:var(--bio-nexus-font-size-sm)}.exam-global-results{position:absolute;left:24px;right:24px;top:calc(100% - 12px);z-index:30;display:grid;max-height:340px;overflow:auto;padding:6px;border:1px solid var(--bio-nexus-color-border-strong);border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-surface);box-shadow:0 16px 42px rgb(15 23 42 / 20%)}.exam-global-results button{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:10px;border:0;border-radius:var(--bio-nexus-radius-sm);background:transparent;color:var(--bio-nexus-color-text);text-align:left;cursor:pointer}.exam-global-results button:hover,.exam-global-results button:focus-visible{background:var(--bio-nexus-color-info-soft);outline:0}.exam-global-results span{display:grid}.exam-global-results small{color:var(--bio-nexus-color-text-muted)}.exam-global-results em{font-size:var(--bio-nexus-font-size-xs);font-style:normal;color:var(--bio-nexus-color-success)}.exam-global-results em.inactive{color:var(--bio-nexus-color-danger)}.exam-global-empty,.exam-global-error{padding:10px;color:var(--bio-nexus-color-text-muted)}.exam-global-error{margin:6px 0 0;color:var(--bio-nexus-color-danger)}
</style>
