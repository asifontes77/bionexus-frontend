<template>
  <BioNexusDialog ref="dialog" title="🧪 Registrar laboratorio" subtitle="Crea el laboratorio, su sucursal principal y el administrador inicial." size="wide" :prevent-close="saving" @close="reset">
    <div class="prov-sections">
      <BioNexusFormErrors v-if="generalError" :errors="[generalError]" />

      <BioNexusSectionPanel title="🏢 Laboratorio y sucursal" compact>
        <div class="prov-grid">
          <BioNexusFormField v-for="field in identityFields" :key="field.key" :label="field.label" :field-id="`prov-${field.key}`" :required="field.required" :error="fieldErrors[field.key] || ''" :help="!fieldErrors[field.key] && field.max ? `${form[field.key].length} de ${field.max} caracteres` : ''">
            <input :id="`prov-${field.key}`" v-model.trim="form[field.key]" class="bio-nexus-field" :class="{ 'prov-input-error': Boolean(fieldErrors[field.key]) }" :maxlength="field.max" :aria-invalid="Boolean(fieldErrors[field.key])" @input="clearFieldError(field.key)" />
          </BioNexusFormField>
        </div>
      </BioNexusSectionPanel>

      <BioNexusSectionPanel title="Datos iniciales" compact>
        <div class="prov-package-toolbar">
          <p>Selecciona la información que se copiará al nuevo laboratorio. Puedes continuar sin paquetes.</p>
          <div class="prov-package-actions">
            <BioNexusActionButton label="Seleccionar todos" icon="done_all" variant="secondary" size="sm" :disabled="allPackagesSelected" @click="selectAllPackages" />
            <BioNexusActionButton label="Limpiar" icon="clear_all" variant="secondary" size="sm" :disabled="form.seedPackages.length === 0" @click="clearPackages" />
          </div>
        </div>
        <div class="prov-package-groups" role="group" aria-label="Paquetes de datos iniciales">
          <article v-for="group in seedPackageGroups" :key="group.key" class="prov-package-group" @pointerdown.capture="captureCatalogScroll" :class="{ 'prov-package-group-selected': groupSelectionCount(group) > 0 }">
            <BioNexusCheckbox :model-value="isGroupSelected(group)" :stop-propagation="true" :indeterminate="isGroupIndeterminate(group)" :label="group.label" :help="group.description" @update:model-value="toggleGroup(group, $event)" />
            <div class="prov-package-children">
              <BioNexusCheckbox
                v-for="child in group.children"
                :key="child.key"
                :model-value="isChildSelected(child.key)"
                :stop-propagation="true"
                :label="child.label"
                :help="child.description" @update:model-value="toggleChild(child.key, $event)"
              />
            </div>
          </article>
        </div>
        <p class="prov-package-summary">{{ packageSummary }}</p>
      </BioNexusSectionPanel>
      <BioNexusSectionPanel title="🛡️ Administrador inicial" compact>
        <div class="prov-grid">
          <BioNexusFormField v-for="field in adminFields" :key="field.key" :label="field.label" :field-id="`prov-${field.key}`" :required="field.required" :error="fieldErrors[field.key] || ''" :help="!fieldErrors[field.key] && field.max ? `${form[field.key].length} de ${field.max} caracteres` : ''">
            <input :id="`prov-${field.key}`" v-model="form[field.key]" class="bio-nexus-field" :class="{ 'prov-input-error': Boolean(fieldErrors[field.key]) }" :type="field.type || 'text'" :maxlength="field.max" :aria-invalid="Boolean(fieldErrors[field.key])" @input="clearFieldError(field.key)" />
          </BioNexusFormField>
        </div>
      </BioNexusSectionPanel>
    </div>

    
    <template #footer>
      <BioNexusActionButton label="Cancelar" icon="close" variant="secondary" :disabled="saving" @click="dialog.close()" />
      <BioNexusActionButton label="Registrar laboratorio" icon="add_business" variant="primary" :loading="saving" @click="save" />
    </template>
  </BioNexusDialog>
</template>

<script setup>
import { computed, nextTick, reactive, ref } from 'vue'
import BioNexusDialog from '@/components/ui/BioNexusDialog.vue'
import BioNexusFormField from '@/components/ui/BioNexusFormField.vue'
import BioNexusActionButton from '@/components/ui/BioNexusActionButton.vue'
import BioNexusCheckbox from '@/components/ui/BioNexusCheckbox.vue'
import BioNexusSectionPanel from '@/components/ui/BioNexusSectionPanel.vue'
import BioNexusFormErrors from '@/components/ui/BioNexusFormErrors.vue'
import { createPlatformLaboratory } from '@/services/platformService'

const emit=defineEmits(['created'])
const dialog=ref(null)
const saving=ref(false)
const generalError=ref('')
const fieldErrors=reactive({})
const blank=()=>({rif:'',name:'',businessName:'',address:'',phone:'',email:'',branchCode:'PRINCIPAL',branchName:'Sucursal principal',seedPackages:[],administratorName:'',administratorUsername:'',administratorEmail:'',administratorPassword:'',administratorPasswordConfirmation:''})
const form=reactive(blank())
const identityFields=[{key:'rif',label:'RIF',required:true,max:20,error:'Ingrese el RIF del laboratorio.'},{key:'name',label:'Nombre',required:true,max:50,error:'Ingrese el nombre comercial del laboratorio.'},{key:'businessName',label:'Razón social',required:true,max:100,error:'Ingrese la razón social del laboratorio.'},{key:'address',label:'Dirección',required:true,max:200,error:'Ingrese la dirección principal del laboratorio.'},{key:'phone',label:'Teléfono',max:20},{key:'email',label:'Correo',max:100},{key:'branchCode',label:'Código de sucursal',required:true,max:30,error:'Ingrese el código de la sucursal principal.'},{key:'branchName',label:'Sucursal principal',required:true,max:100,error:'Ingrese el nombre de la sucursal principal.'}]
const adminFields=[{key:'administratorName',label:'Nombre del administrador',required:true,max:100,error:'Ingrese el nombre del administrador inicial.'},{key:'administratorUsername',label:'Usuario',required:true,max:100,error:'Ingrese el usuario del administrador inicial.'},{key:'administratorEmail',label:'Correo del administrador',max:100},{key:'administratorPassword',label:'Contraseña inicial',required:true,max:200,type:'password',error:'Ingrese la contraseña inicial del administrador.'},{key:'administratorPasswordConfirmation',label:'Confirmar contraseña inicial',required:true,max:200,type:'password',error:'Confirme la contraseña inicial del administrador.'}]
const requiredFields=[...identityFields,...adminFields].filter(field=>field.required)
const seedPackageGroups=[{"key":"microbiology","label":"Microbiologia","description":"Selecciona uno o varios elementos.","children":[{"key":"antibiotics","label":"Antibioticos","description":"Disponible para instalar al laboratorio."},{"key":"germs","label":"Germenes","description":"Disponible para instalar al laboratorio."}]},{"key":"parasitology","label":"Parasitologia","description":"Selecciona uno o varios elementos.","children":[{"key":"parasitic-forms","label":"Formas parasitarias","description":"Disponible para instalar al laboratorio."}]},{"key":"samples-and-tax","label":"Muestras e impuestos","description":"Selecciona uno o varios elementos.","children":[{"key":"sample-types","label":"Tipos de muestra","description":"Disponible para instalar al laboratorio."},{"key":"taxes","label":"Impuestos","description":"Disponible para instalar al laboratorio."}]},{"key":"exam-catalog","label":"Catalogo de examenes","description":"Selecciona uno o varios elementos.","children":[{"key":"exam-groups","label":"Grupos","description":"Disponible para instalar al laboratorio."},{"key":"exams","label":"Catalogo de examenes","description":"Disponible para instalar al laboratorio."}]},{"key":"routines-and-worksheets","label":"Rutinas y hojas de trabajo","description":"Selecciona uno o varios elementos.","children":[{"key":"routines","label":"Rutinas","description":"Disponible para instalar al laboratorio."},{"key":"worksheet-groups","label":"Grupos de hojas de trabajo","description":"Disponible para instalar al laboratorio."},{"key":"worksheet-items","label":"Elementos de hojas de trabajo","description":"Disponible para instalar al laboratorio."}]},{"key":"special-tests","label":"Pruebas especiales","description":"Selecciona uno o varios elementos.","children":[{"key":"reference-laboratories","label":"Laboratorios de referencia","description":"Disponible para instalar al laboratorio."},{"key":"special-tests","label":"Pruebas asociadas","description":"Disponible para instalar al laboratorio."}]},{"key":"financial-and-payments","label":"Finanzas y pagos","description":"Selecciona uno o varios elementos.","children":[{"key":"currencies","label":"Monedas","description":"Disponible para instalar al laboratorio."},{"key":"tariffs","label":"Tarifas","description":"Disponible para instalar al laboratorio."},{"key":"banks","label":"Bancos","description":"Disponible para instalar al laboratorio."},{"key":"payment-methods","label":"Formas de pago","description":"Disponible para instalar al laboratorio."}]}]
const atomicPackageKeys=seedPackageGroups.flatMap(group=>group.children.map(child=>child.key))
const allPackagesSelected=computed(()=>Array.isArray(form.seedPackages)&&atomicPackageKeys.every(key=>form.seedPackages.includes(key)))
const packageSummary=computed(()=>!Array.isArray(form.seedPackages)||form.seedPackages.length===0?'No se instalarán catálogos opcionales. La moneda VES se instala automáticamente para la configuración inicial.':`${form.seedPackages.length} de ${atomicPackageKeys.length} catálogos seleccionados.`)

function preserveCatalogScroll(mutator){
  const body=document.querySelector('.prov-dialog .bio-nexus-dialog__body')
  const top=body?.scrollTop??0
  mutator()
  nextTick(()=>{if(body)body.scrollTop=top})
}

function isChildSelected(key){return Array.isArray(form.seedPackages)&&form.seedPackages.includes(key)}
function toggleChild(key,checked){preserveCatalogScroll(()=>{const keys=new Set(Array.isArray(form.seedPackages)?form.seedPackages:[]);if(checked)keys.add(key);else keys.delete(key);form.seedPackages=[...keys];generalError.value=''
  
})}
function childKeys(group){return group.children.map(child=>child.key)}
function groupSelectionCount(group){return childKeys(group).filter(key=>isChildSelected(key)).length}
function isGroupSelected(group){return groupSelectionCount(group)===group.children.length}
function isGroupIndeterminate(group){const count=groupSelectionCount(group);return count>0&&count<group.children.length}
function toggleGroup(group,checked){preserveCatalogScroll(()=>{const keys=new Set(Array.isArray(form.seedPackages)?form.seedPackages:[]);for(const key of childKeys(group)){if(checked)keys.add(key);else keys.delete(key)
  
}form.seedPackages=[...keys];generalError.value=''})}
function selectAllPackages(){form.seedPackages=[...atomicPackageKeys];generalError.value=''}
function clearPackages(){form.seedPackages=[];generalError.value=''}
async function open(){generalError.value='';clearErrors();dialog.value.open()}
function reset(){Object.assign(form,blank());generalError.value='';clearErrors()}
function clearErrors(){for(const key of Object.keys(fieldErrors))delete fieldErrors[key]}
function clearFieldError(key){if(fieldErrors[key])delete fieldErrors[key];if(generalError.value)generalError.value=''}
function isRequiredModule(module){return module.required===true||normalizeModuleKey(module.code)==='security'}
function requiredModuleIds(){return modules.value.filter(isRequiredModule).map(module=>module.id)}
function preserveRequiredModules(ids){return [...new Set([...requiredModuleIds(),...ids])]}
function validate(){clearErrors();for(const field of requiredFields)if(String(form[field.key]??'').trim()==='')fieldErrors[field.key]=field.error;if(form.administratorPassword&&!isStrongPassword(form.administratorPassword))fieldErrors.administratorPassword='La contraseña debe tener mínimo 12 caracteres, mayúscula, minúscula, número y símbolo.';if(form.administratorPasswordConfirmation&&form.administratorPassword!==form.administratorPasswordConfirmation)fieldErrors.administratorPasswordConfirmation='Las contraseñas no coinciden.';const firstKey=Object.keys(fieldErrors)[0];if(firstKey){generalError.value='Revise la información requerida antes de registrar el laboratorio.';requestAnimationFrame(()=>document.getElementById(`prov-${firstKey}`)?.focus?.());return false}return true}
function isStrongPassword(value){return value.length>=12&&/[A-Z]/.test(value)&&/[a-z]/.test(value)&&/[0-9]/.test(value)&&/[^A-Za-z0-9]/.test(value)}
async function save(){generalError.value='';if(!validate())return;saving.value=true;try{const result=await createPlatformLaboratory({...form,seedPackages:[...form.seedPackages]});dialog.value.close();emit('created',result)}catch(error){generalError.value=error?.message||'No fue posible registrar el laboratorio.'}finally{saving.value=false}}
defineExpose({open})
</script>

<style scoped>
.prov-sections{display:grid;gap:16px;padding:16px}.prov-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;align-items:start}.prov-input-error{border-color:var(--bio-nexus-color-danger)!important}.prov-module-toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:12px;color:var(--bio-nexus-color-text-muted)}.prov-module-actions{display:flex;gap:8px;flex-wrap:wrap}.prov-module-groups{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.prov-module-group{border:1px solid var(--bio-nexus-color-border);border-radius:var(--bio-nexus-radius-md);padding:12px;background:var(--bio-nexus-color-surface)}.prov-module-group-header{display:grid;grid-template-columns:auto minmax(0,1fr) auto auto;align-items:center;gap:8px;margin-bottom:10px;color:var(--bio-nexus-color-primary)}.prov-group-icon{font-size:20px;line-height:1}.prov-group-count{color:var(--bio-nexus-color-text-muted);font-size:12px;white-space:nowrap}.prov-module-options{display:grid;gap:8px}
.prov-module-options :deep(.prov-module-checkbox),
.prov-module-options :deep(.prov-module-checkbox label),
.prov-module-options :deep(.prov-module-checkbox span),
.prov-module-options :deep(.prov-module-checkbox__label){font-weight:400}.prov-modules-error{border-color:var(--bio-nexus-color-danger);box-shadow:0 0 0 3px rgb(180 35 24 / 12%)}@media(max-width:720px){.prov-grid,.prov-module-groups{grid-template-columns:1fr}.prov-module-toolbar{align-items:flex-start;flex-direction:column}}


.prov-package-toolbar{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:12px}.prov-package-toolbar p,.prov-package-summary{margin:0;color:var(--bio-nexus-color-text-muted);font-size:12px}.prov-package-actions{display:flex;gap:8px;flex-wrap:wrap}.prov-package-groups{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.prov-package-group{display:grid;gap:10px;padding:12px;border:1px solid var(--bio-nexus-color-border);border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-surface)}.prov-package-group-selected{border-color:var(--bio-nexus-color-primary);background:var(--bio-nexus-color-primary-soft)}.prov-package-children{display:grid;gap:8px;padding-left:28px}.prov-package-option{display:flex;align-items:flex-start;gap:10px;padding:12px;border:1px solid var(--bio-nexus-color-border);border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-surface);cursor:pointer}.prov-package-option-selected{border-color:var(--bio-nexus-color-primary);background:var(--bio-nexus-color-primary-soft)}.prov-package-option input{margin-top:3px;accent-color:var(--bio-nexus-color-primary)}.prov-package-copy{display:grid;gap:3px;min-width:0}.prov-package-copy strong{color:var(--bio-nexus-color-text-primary);font-size:13px;font-weight:600}.prov-package-copy small{color:var(--bio-nexus-color-text-muted);font-size:11px;line-height:1.4}.prov-package-summary{margin-top:10px;font-weight:600}@media(max-width:720px){.prov-package-toolbar{flex-direction:column}.prov-package-groups{grid-template-columns:1fr}}




</style>

