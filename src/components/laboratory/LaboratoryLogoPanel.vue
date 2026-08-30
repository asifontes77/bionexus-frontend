<template>
  <section class="bio-nexus-panel laboratory-panel logo-panel">
    <div class="bio-nexus-panel-heading"><div><p class="bio-nexus-panel-eyebrow">Identidad visual</p><h3>Logo del laboratorio</h3></div></div>
    <div class="logo-layout">
      <div class="logo-preview">
        <img v-if="logoUrl" :src="logoUrl" alt="Logo actual" :style="previewStyle" @error="imageFailed=true">
        <div v-if="!logoUrl || imageFailed" class="logo-empty"><span class="logo-empty-mark">BN</span><span>Vista previa no disponible</span></div>
      </div>
      <div class="logo-controls">
        <BioNexusFormField label="Límite de altura" field-id="logo-height" :error="errors.max_height_logo || ''">
          <div class="range-control"><input v-model.number="model.max_height_logo" class="logo-range" type="range" min="20" max="200" step="5" :disabled="disabled"><output>{{ model.max_height_logo }} px</output></div>
        </BioNexusFormField>
        <BioNexusFormField label="Límite de ancho" field-id="logo-width" :error="errors.max_width_logo || ''">
          <div class="range-control"><input v-model.number="model.max_width_logo" class="logo-range" type="range" min="20" max="200" step="5" :disabled="disabled"><output>{{ model.max_width_logo }} px</output></div>
        </BioNexusFormField>
        <input ref="fileInput" class="file-input" type="file" accept="image/png,image/jpeg,image/webp" @change="selectFile">
        <BioNexusActionButton class="select-image" variant="secondary" :disabled="disabled" @click="fileInput?.click()">Seleccionar imagen</BioNexusActionButton>
        <small>El logo conserva su proporción. Se aplica primero el límite que produzca el tamaño más pequeño.</small><small>PNG, JPEG o WebP. Tamaño máximo: 5 MB.</small>
      </div>
    </div>
  </section>
</template>
<script setup>
import { computed, ref, watch } from 'vue'
import BioNexusActionButton from '@/components/ui/BioNexusActionButton.vue'
import BioNexusFormField from '@/components/ui/BioNexusFormField.vue'
const props=defineProps({model:{type:Object,required:true},errors:{type:Object,default:()=>({})},disabled:{type:Boolean,default:false}})
const emit=defineEmits(['upload'])
const fileInput=ref(null)
const imageFailed=ref(false)
const publicFilesPrefix='http://localhost:8081/api/public'
const logoUrl=computed(()=>props.model.logo?publicFilesPrefix+'/'+String(props.model.logo).split('/').filter(Boolean).map(encodeURIComponent).join('/'):'')
const previewStyle=computed(()=>({maxHeight:String(Number.isFinite(Number(props.model.max_height_logo)) ? Number(props.model.max_height_logo) : 200)+'px',maxWidth:String(Number.isFinite(Number(props.model.max_width_logo)) ? Number(props.model.max_width_logo) : 200)+'px'}))
watch(()=>props.model.logo,()=>{imageFailed.value=false})
function selectFile(event){const file=event.target.files?.[0];if(file)emit('upload',file);event.target.value=''}
</script>
<style scoped>
.logo-panel{min-width:0;overflow:hidden}.logo-layout{display:grid;grid-template-columns:1fr;gap:var(--bio-nexus-space-4);min-width:0}.logo-preview{display:grid;place-items:center;width:100%;min-width:0;min-height:210px;padding:var(--bio-nexus-space-3);border:1px dashed var(--bio-nexus-color-border-strong);border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-surface-soft);overflow:hidden}.logo-preview img{display:block;max-width:100%;object-fit:contain}.logo-empty{display:grid;justify-items:center;gap:8px;color:var(--bio-nexus-color-text-muted);font-size:12px;text-align:center}.logo-empty-mark{display:grid;place-items:center;width:54px;height:54px;border-radius:16px;background:var(--bio-nexus-color-primary-soft);color:var(--bio-nexus-color-primary);font-size:17px;font-weight:900}.logo-controls{display:grid;grid-template-columns:1fr;gap:var(--bio-nexus-space-3);min-width:0}.range-control{display:grid;grid-template-columns:minmax(0,1fr) 58px;align-items:center;gap:10px;min-height:46px;padding:10px 12px 5px;border:1px solid var(--bio-nexus-color-border);border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-surface)}.logo-range{display:block;width:100%;min-width:0;margin:0;accent-color:var(--bio-nexus-color-primary)}.range-control output{color:var(--bio-nexus-color-text-secondary);font-size:12px;font-weight:800;text-align:right}.select-image{width:100%;justify-content:center}.logo-controls small{color:var(--bio-nexus-color-text-muted);font-size:11px;line-height:1.35}.file-input{display:none}
</style>
