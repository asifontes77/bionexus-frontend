<template>
  <BioNexusDialog ref="dialog" size="standard" dialog-class="document-definition-entry-dialog" :prevent-close="saving || dirty" :kicker="mode === 'create' ? 'Nuevo registro' : 'Editar registro'" :title="mode === 'create' ? 'Crear comprobante' : 'Editar comprobante'" @before-close="requestClose" @close="reset">
    <section class="document-definition-form-content">
      <BioNexusFormErrors :errors="generalError" />
      <BioNexusSectionPanel title="Información del comprobante" icon="description" description="Define la identificación funcional del comprobante. El diseño se administra en el editor visual." variant="accent">
        <div class="document-definition-form">
          <BioNexusFormField label="Nombre" field-id="document-name" :error="errors.name" :help="draft.name.length + ' de 120 caracteres'" required>
            <input id="document-name" ref="firstInput" v-model="draft.name" class="bio-nexus-field" maxlength="120" autocomplete="off" @input="syncDirty">
          </BioNexusFormField>
          <BioNexusFormField label="Tipo documental" field-id="document-type" :error="errors.documentType" help="Identifica el uso funcional del comprobante." required>
            <BioNexusSearchableSelect id="document-type" v-model="draft.documentType" :options="typeOptions" :disabled="mode === 'edit'" placeholder="Seleccione un tipo" @change="syncDirty" />
          </BioNexusFormField>
          <BioNexusFormField label="Descripción" field-id="document-description" :error="errors.description" :help="draft.description.length + ' de 250 caracteres'" wide>
            <textarea id="document-description" v-model="draft.description" class="bio-nexus-field" maxlength="250" rows="3" @input="syncDirty"></textarea>
          </BioNexusFormField>
        </div>
      </BioNexusSectionPanel>
    </section>
    <template #footer>
      <BioNexusActionButton variant="secondary" icon="cancel" :disabled="saving" @click="requestClose">Cancelar</BioNexusActionButton>
      <BioNexusActionButton variant="primary" :icon="mode === 'create' ? 'create' : 'save'" :loading="saving" :disabled="submitDisabled" @click="submit">{{ mode === 'create' ? 'Crear y diseñar' : 'Guardar cambios' }}</BioNexusActionButton>
    </template>
  </BioNexusDialog>
  <BioNexusConfirmDialog ref="discardDialog" />
</template>
<script setup>
import { computed, nextTick, reactive, ref } from "vue";
import BioNexusActionButton from "@/components/ui/BioNexusActionButton.vue";
import BioNexusConfirmDialog from "@/components/ui/BioNexusConfirmDialog.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
import BioNexusFormErrors from "@/components/ui/BioNexusFormErrors.vue";
import BioNexusFormField from "@/components/ui/BioNexusFormField.vue";
import BioNexusSearchableSelect from "@/components/ui/BioNexusSearchableSelect.vue";
import BioNexusSectionPanel from "@/components/ui/BioNexusSectionPanel.vue";
const props = defineProps({ saving:Boolean, canCreate:Boolean, canUpdate:Boolean });
const emit = defineEmits(["submit"]);
const dialog=ref(null),discardDialog=ref(null),firstInput=ref(null),mode=ref("create"),current=ref(null),attempted=ref(false),generalError=ref(""),original=ref(""),dirty=ref(false),initializing=ref(false);
const draft=reactive({name:"",documentType:"patient-receipt",description:""});
const typeOptions=Object.freeze([{value:"patient-receipt",label:"Comprobante del paciente"}]);
const values=computed(()=>({name:String(draft.name||"").trim(),documentType:String(draft.documentType||"").trim(),description:String(draft.description||"").trim()}));
const errors=computed(()=>attempted.value?{name:values.value.name?"":"El nombre es obligatorio.",documentType:values.value.documentType?"":"El tipo documental es obligatorio.",description:values.value.description.length<=250?"":"La descripción no puede superar 250 caracteres."}:{name:"",documentType:"",description:""});
const submitDisabled=computed(()=>initializing.value||props.saving||(mode.value==="create"?(!props.canCreate||!values.value.name||!values.value.documentType):(!props.canUpdate||!dirty.value)));
function signature(){return JSON.stringify(values.value)}
function assign(row){draft.name=row?.name||"";draft.documentType=row?.documentType||"patient-receipt";draft.description=row?.description||""}
function syncDirty(){generalError.value="";dirty.value=!initializing.value&&signature()!==original.value}
async function show(){await dialog.value?.open();await nextTick();original.value=signature();dirty.value=false;initializing.value=false;firstInput.value?.focus()}
async function openCreate(){initializing.value=true;mode.value="create";current.value=null;assign(null);attempted.value=false;generalError.value="";await show()}
async function openEdit(row){initializing.value=true;mode.value="edit";current.value=row;assign(row);attempted.value=false;generalError.value="";await show()}
function submit(){attempted.value=true;if(Object.values(errors.value).some(Boolean)||submitDisabled.value)return;emit("submit",{mode:mode.value,record:current.value,values:{...values.value,description:values.value.description||null}})}
async function requestClose(){if(props.saving)return;if(dirty.value){const confirmed=await discardDialog.value?.ask({kicker:"Confirmación",title:"Descartar cambios",message:"Hay cambios sin guardar. ¿Deseas salir y descartarlos?",icon:"warning",variant:"danger",confirmIcon:"delete",confirmText:"Sí, salir y descartar cambios",cancelText:"Cancelar"});if(!confirmed)return}dialog.value?.close()}
function close(){dialog.value?.close()}
function reset(){attempted.value=false;dirty.value=false;generalError.value=""}
function setError(value){generalError.value=String(value||"")}
function clearError(){generalError.value=""}
function markSaved(row,closeAfterSave=true){current.value=row||current.value;assign(row);attempted.value=false;generalError.value="";original.value=signature();dirty.value=false;if(closeAfterSave)dialog.value?.close()}
defineExpose({openCreate,openEdit,close,setError,clearError,markSaved});
</script>
<style scoped>
.document-definition-form-content{display:grid;gap:var(--bio-nexus-space-4)}.document-definition-form{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:var(--bio-nexus-space-4);align-items:start;font:400 13px var(--bio-nexus-font-family,Inter,Roboto,Arial,sans-serif)}:deep(.document-definition-entry-dialog .bio-nexus-dialog-body){display:grid;gap:var(--bio-nexus-space-4);padding:var(--bio-nexus-space-4)}:deep(.document-definition-entry-dialog .bio-nexus-section-panel-body){padding:var(--bio-nexus-space-4)}@media(max-width:620px){.document-definition-form{grid-template-columns:1fr}}
</style>
