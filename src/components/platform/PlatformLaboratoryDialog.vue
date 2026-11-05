<template>
  <BioNexusDialog ref="dialog" title="🧪 Registrar laboratorio" subtitle="Crea el laboratorio, su sucursal principal y el administrador inicial." size="wide" :prevent-close="saving || dirty" @before-close="requestClose" @close="handleClosed">
    <div class="prov-sections">
      <BioNexusFormErrors v-if="generalError" :errors="[generalError]" />

      <BioNexusSectionPanel title="🏢 Laboratorio y sucursal" compact>
        <div class="prov-grid">
          <BioNexusFormField v-for="field in identityFields" :key="field.key" :label="field.label" :field-id="`prov-${field.key}`" :required="field.required" :error="fieldErrors[field.key] || ''" :help="!fieldErrors[field.key] && field.key === 'accessSlug' ? 'Solo minúsculas, números y guiones; no se podrá cambiar al ingresar.' : !fieldErrors[field.key] && field.max ? `${form[field.key].length} de ${field.max} caracteres` : ''">
            <input :id="`prov-${field.key}`" v-model.trim="form[field.key]" class="bio-nexus-field" :class="{ 'prov-input-error': Boolean(fieldErrors[field.key]) }" :maxlength="field.max" :aria-invalid="Boolean(fieldErrors[field.key])" :placeholder="field.key === laboratoryPhoneFieldKey ? '(+58) 424 123-4567' : ''" @input="onDynamicFieldInput(field.key, $event)" />
          </BioNexusFormField>
        </div>
      </BioNexusSectionPanel>

      <BioNexusSectionPanel title="Plan y vigencia de la suscripción" compact>
        <p class="prov-validity-note">La suscripción comercial se registra junto con el laboratorio. El Backend crea su instantánea en la misma operación; los paquetes de datos iniciales se administran por separado.</p>
        <div class="prov-grid">
          <BioNexusFormField v-if="form.subscriptionStatus !== 'perpetual_free'" label="Plan comercial" field-id="prov-plan-code" required :error="fieldErrors.planCode || ''" help="Solo se pueden asignar planes activos.">
            <select id="prov-plan-code" v-model="form.planCode" class="bio-nexus-field" :disabled="plansLoading || plans.length === 0" :aria-invalid="Boolean(fieldErrors.planCode)" @change="clearFieldError('planCode')">
              <option value="" disabled>{{ plansLoading ? 'Cargando planes…' : 'Seleccionar plan activo' }}</option>
              <option v-for="plan in activePlans" :key="plan.planId" :value="plan.code">{{ plan.name }} · {{ plan.code }}</option>
            </select>
          </BioNexusFormField>
          <p v-else class="prov-validity-note">La vigencia indefinida no requiere un plan comercial ni días de gracia.</p>
          <BioNexusFormField label="Vigencia" field-id="prov-subscription-status" required :error="fieldErrors.subscriptionStatus || ''">
            <select id="prov-subscription-status" v-model="form.subscriptionStatus" class="bio-nexus-field" @change="clearFieldError('subscriptionStatus')">
              <option value="trial">Prueba (trial)</option>
              <option value="active">Activo (active)</option>
              <option value="perpetual_free">Nunca expira (perpetual_free)</option>
            </select>
          </BioNexusFormField>
          <BioNexusFormField label="Fecha de registro / inicio" field-id="prov-service-starts-at" required :error="fieldErrors.serviceStartsAt || ''">
            <input id="prov-service-starts-at" v-model="form.serviceStartsAt" class="bio-nexus-field" type="date" :aria-invalid="Boolean(fieldErrors.serviceStartsAt)" @input="clearFieldError('serviceStartsAt')" />
          </BioNexusFormField>
          <BioNexusFormField v-if="form.subscriptionStatus !== 'perpetual_free'" label="Fecha de expiración" field-id="prov-service-expires-at" required :help="fieldErrors.serviceExpiresAt ? '' : 'Indica la fecha explícitamente; no se asigna una duración predeterminada.'" :error="fieldErrors.serviceExpiresAt || ''">
            <input id="prov-service-expires-at" v-model="form.serviceExpiresAt" class="bio-nexus-field" type="date" :aria-invalid="Boolean(fieldErrors.serviceExpiresAt)" @input="clearFieldError('serviceExpiresAt')" />
          </BioNexusFormField>
          <BioNexusFormField v-else label="Motivo de vigencia indefinida" field-id="prov-perpetual-free-reason" required :error="fieldErrors.perpetualFreeReason || ''">
            <textarea id="prov-perpetual-free-reason" v-model.trim="form.perpetualFreeReason" class="bio-nexus-field" rows="3" maxlength="500" :aria-invalid="Boolean(fieldErrors.perpetualFreeReason)" @input="clearFieldError('perpetualFreeReason')" />
          </BioNexusFormField>
        </div>
        <p class="prov-validity-note">La vigencia no bloquea el acceso ni la operación durante la estabilización. El modo disponible es Cloud.</p>
      </BioNexusSectionPanel>

      <BioNexusSectionPanel title="Paquetes de datos iniciales (catálogos)" compact>
        <p class="prov-validity-note">Estos paquetes copian catálogos al nuevo laboratorio; no son planes comerciales ni definen la vigencia del servicio.</p>
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
                :disabled="mandatorySeedPackageKeys.includes(child.key)"
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
            <input :id="`prov-${field.key}`" v-model="form[field.key]" class="bio-nexus-field" :class="{ 'prov-input-error': Boolean(fieldErrors[field.key]) }" :type="field.type || 'text'" :maxlength="field.max" :aria-invalid="Boolean(fieldErrors[field.key])" :placeholder="field.key === laboratoryPhoneFieldKey ? '(+58) 424 123-4567' : ''" @input="onDynamicFieldInput(field.key, $event)" />
          </BioNexusFormField>
        </div>
      </BioNexusSectionPanel>
    </div>

    
    <template #footer>
      <BioNexusActionButton label="Cancelar" icon="close" variant="secondary" :disabled="saving" @click="requestClose" />
      <BioNexusActionButton label="Registrar laboratorio" icon="add_business" variant="primary" :loading="saving" :disabled="plansLoading" @click="save" />
    </template>
  </BioNexusDialog>
  <BioNexusConfirmDialog ref="discardDialog" />
</template>

<script setup>
import { computed, nextTick, reactive, ref } from 'vue'
import BioNexusDialog from '@/components/ui/BioNexusDialog.vue'
import BioNexusConfirmDialog from '@/components/ui/BioNexusConfirmDialog.vue'
import BioNexusFormField from '@/components/ui/BioNexusFormField.vue'
import BioNexusActionButton from '@/components/ui/BioNexusActionButton.vue'
import BioNexusCheckbox from '@/components/ui/BioNexusCheckbox.vue'
import BioNexusSectionPanel from '@/components/ui/BioNexusSectionPanel.vue'
import BioNexusFormErrors from '@/components/ui/BioNexusFormErrors.vue'
import { createPlatformLaboratory } from '@/services/platformService'
import { getPlatformPlans } from '@/services/platformBillingService'
import { buildTenantAccessUrls, normalizeAccessSlug } from '@/logic/tenantAccess'

const emit=defineEmits(['created'])
const dialog=ref(null)
const discardDialog=ref(null)
const saving=ref(false)
const original=ref('')
const dirty=ref(false)
const generalError=ref('')
const plans=ref([])
const plansLoading=ref(false)
const fieldErrors=reactive({})
const activePlans=computed(()=>plans.value.filter(plan=>plan.isActive!==false))
const todayLocal=()=>{const date=new Date();return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}
const blank=()=>({rif:'',name:'',accessSlug:'',businessName:'',address:'',phone:'',email:'',branchName:'Sucursal principal',planCode:'',subscriptionStatus:'trial',serviceStartsAt:todayLocal(),serviceExpiresAt:'',perpetualFreeReason:'',seedPackages:[],administratorName:'',administratorUsername:'',administratorEmail:'',administratorPassword:'',administratorPasswordConfirmation:''})
const form=reactive(blank())
const signature=computed(()=>JSON.stringify({...form,seedPackages:[...form.seedPackages]}))
function syncDirty(){dirty.value=signature.value!==original.value}
const identityFields=[{key:'rif',label:'RIF',required:true,max:20,error:'Ingrese el RIF del laboratorio.'},{key:'name',label:'Nombre',required:true,max:50,error:'Ingrese el nombre comercial del laboratorio.'},{key:'accessSlug',label:'Código de acceso (URL)',required:true,max:63,error:'Ingrese el código estable de acceso al laboratorio.'},{key:'businessName',label:'Razón social',required:true,max:100,error:'Ingrese la razón social del laboratorio.'},{key:'address',label:'Dirección',required:true,max:200,error:'Ingrese la dirección principal del laboratorio.'},{key:'phone',label:'Teléfono',max:20},{key:'email',label:'Correo',max:100},{key:'branchName',label:'Sucursal principal',required:true,max:100,error:'Ingrese el nombre de la sucursal principal.'}]
const adminFields=[{key:'administratorName',label:'Nombre del administrador',required:true,max:100,error:'Ingrese el nombre del administrador inicial.'},{key:'administratorUsername',label:'Usuario',required:true,max:100,error:'Ingrese el usuario del administrador inicial.'},{key:'administratorEmail',label:'Correo del administrador',max:100},{key:'administratorPassword',label:'Contraseña inicial',required:true,max:200,type:'password',error:'Ingrese la contraseña inicial del administrador.'},{key:'administratorPasswordConfirmation',label:'Confirmar contraseña inicial',required:true,max:200,type:'password',error:'Confirme la contraseña inicial del administrador.'}]
const requiredFields=[...identityFields,...adminFields].filter(field=>field.required)
const seedPackageGroups=[{"key":"microbiology","label":"Microbiologia","description":"Selecciona uno o varios elementos.","children":[{"key":"antibiotics","label":"Antibioticos","description":"Disponible para instalar al laboratorio."},{"key":"germs","label":"Germenes","description":"Disponible para instalar al laboratorio."}]},{"key":"parasitology","label":"Parasitologia","description":"Selecciona uno o varios elementos.","children":[{"key":"parasitic-forms","label":"Formas parasitarias","description":"Disponible para instalar al laboratorio."}]},{"key":"samples-and-tax","label":"Muestras e impuestos","description":"Selecciona uno o varios elementos.","children":[{"key":"sample-types","label":"Tipos de muestra","description":"Disponible para instalar al laboratorio."},{"key":"taxes","label":"Impuestos","description":"Disponible para instalar al laboratorio."}]},{"key":"exam-catalog","label":"Catalogo de examenes","description":"Selecciona uno o varios elementos.","children":[{"key":"exam-groups","label":"Grupos","description":"Disponible para instalar al laboratorio."},{"key":"exams","label":"Catalogo de examenes","description":"Disponible para instalar al laboratorio."}]},{"key":"financial-and-payments","label":"Finanzas y pagos","description":"Selecciona uno o varios elementos.","children":[{"key":"currencies","label":"Monedas","description":"Incluida siempre para la configuracion inicial."},{"key":"tariffs","label":"Tarifas y precios de examenes","description":"Paquete aprobado de tarifas y precios."},{"key":"banks","label":"Bancos","description":"Disponible para instalar al laboratorio."},{"key":"payment-methods","label":"Formas de pago","description":"Disponible para instalar al laboratorio."}]}]
const atomicPackageKeys=seedPackageGroups.flatMap(group=>group.children.map(child=>child.key))
const mandatorySeedPackageKeys=['currencies']
const selectableSeedPackageKeys=atomicPackageKeys.filter(key=>!mandatorySeedPackageKeys.includes(key))
const allPackagesSelected=computed(()=>Array.isArray(form.seedPackages)&&selectableSeedPackageKeys.every(key=>form.seedPackages.includes(key)))
const packageSummary=computed(()=>{const selectedCount=Array.isArray(form.seedPackages)?form.seedPackages.filter(key=>selectableSeedPackageKeys.includes(key)).length:0;return selectedCount===0?'No se instalarán catálogos opcionales. La moneda VES se instala automáticamente para la configuración inicial.':`${selectedCount} de ${selectableSeedPackageKeys.length} catálogos opcionales seleccionados. La moneda VES se instala automáticamente.`})

function preserveCatalogScroll(mutator){
  const body=document.querySelector('.prov-dialog .bio-nexus-dialog__body')
  const top=body?.scrollTop??0
  mutator()
  nextTick(()=>{if(body)body.scrollTop=top})
}

function isChildSelected(key){return mandatorySeedPackageKeys.includes(key)||(Array.isArray(form.seedPackages)&&form.seedPackages.includes(key))}
function toggleChild(key,checked){if(mandatorySeedPackageKeys.includes(key))return;preserveCatalogScroll(()=>{const keys=new Set(Array.isArray(form.seedPackages)?form.seedPackages.filter(item=>selectableSeedPackageKeys.includes(item)):[]);if(checked)keys.add(key);else keys.delete(key);form.seedPackages=[...keys];generalError.value='';syncDirty()
  
})}
function childKeys(group){return group.children.map(child=>child.key)}
function selectableChildKeys(group){return childKeys(group).filter(key=>selectableSeedPackageKeys.includes(key))}
function groupSelectionCount(group){return selectableChildKeys(group).filter(key=>isChildSelected(key)).length}
function isGroupSelected(group){return groupSelectionCount(group)===selectableChildKeys(group).length}
function isGroupIndeterminate(group){const count=groupSelectionCount(group);return count>0&&count<selectableChildKeys(group).length}
function toggleGroup(group,checked){preserveCatalogScroll(()=>{const keys=new Set(Array.isArray(form.seedPackages)?form.seedPackages.filter(item=>selectableSeedPackageKeys.includes(item)):[]);for(const key of selectableChildKeys(group)){if(checked)keys.add(key);else keys.delete(key)
  
}form.seedPackages=[...keys];generalError.value='';syncDirty()})}
function selectAllPackages(){form.seedPackages=[...selectableSeedPackageKeys];generalError.value='';syncDirty()}
function clearPackages(){form.seedPackages=[];generalError.value='';syncDirty()}
async function open(){generalError.value='';clearErrors();plans.value=[];Object.assign(form,blank());await dialog.value.open();plansLoading.value=true;try{plans.value=await getPlatformPlans()}catch(error){generalError.value=error?.message||'No fue posible consultar los planes comerciales.'}finally{plansLoading.value=false}await nextTick();original.value=signature.value;dirty.value=false}
function handleClosed(){Object.assign(form,blank());generalError.value='';clearErrors();original.value='';dirty.value=false}
function clearErrors(){for(const key of Object.keys(fieldErrors))delete fieldErrors[key]}
function clearFieldError(key){if(fieldErrors[key])delete fieldErrors[key];if(generalError.value)generalError.value='';syncDirty()}
function isRequiredModule(module){return module.required===true||normalizeModuleKey(module.code)==='security'}
function requiredModuleIds(){return modules.value.filter(isRequiredModule).map(module=>module.id)}
function preserveRequiredModules(ids){return [...new Set([...requiredModuleIds(),...ids])]}
function validate(){clearErrors();for(const field of requiredFields)if(String(form[field.key]??'').trim()==='')fieldErrors[field.key]=field.error;if(form.subscriptionStatus!=='perpetual_free'&&!activePlans.value.some(plan=>plan.code===form.planCode))fieldErrors.planCode='Selecciona un plan comercial activo.';if(!form.serviceStartsAt)fieldErrors.serviceStartsAt='Indique la fecha de registro/inicio.';if(form.subscriptionStatus==='perpetual_free'){if(!form.perpetualFreeReason.trim())fieldErrors.perpetualFreeReason='Explique el motivo de la vigencia indefinida.'}else if(!form.serviceExpiresAt)fieldErrors.serviceExpiresAt='Indique una fecha de expiración.';if(form.serviceStartsAt&&form.serviceExpiresAt&&form.serviceExpiresAt<form.serviceStartsAt)fieldErrors.serviceExpiresAt='La fecha de expiración no puede ser anterior a la fecha de inicio.';if(form.accessSlug&&!normalizeAccessSlug(form.accessSlug))fieldErrors.accessSlug='Use de 1 a 63 caracteres: letras, números y guiones internos.';if(form.administratorPassword&&!isStrongPassword(form.administratorPassword))fieldErrors.administratorPassword='La contraseña debe tener mínimo 12 caracteres, mayúscula, minúscula, número y símbolo.';if(form.administratorPasswordConfirmation&&form.administratorPassword!==form.administratorPasswordConfirmation)fieldErrors.administratorPasswordConfirmation='Las contraseñas no coinciden.';const firstKey=Object.keys(fieldErrors)[0];if(firstKey){generalError.value='Revise la información requerida antes de registrar el laboratorio.';requestAnimationFrame(()=>document.getElementById(`prov-${firstKey}`)?.focus?.());return false}return true}
function isStrongPassword(value){return value.length>=12&&/[A-Z]/.test(value)&&/[a-z]/.test(value)&&/[0-9]/.test(value)&&/[^A-Za-z0-9]/.test(value)}
async function save(){generalError.value='';if(plansLoading.value)return;if(!validate())return;saving.value=true;try{const selectedPackages=Array.isArray(form.seedPackages)?form.seedPackages.filter(key=>selectableSeedPackageKeys.includes(key)):[];const serviceStartsAt=new Date(`${form.serviceStartsAt}T00:00:00.000Z`).toISOString();const serviceExpiresAt=form.subscriptionStatus==='perpetual_free'?null:new Date(`${form.serviceExpiresAt}T00:00:00.000Z`).toISOString();const result=await createPlatformLaboratory({...form,planCode:form.subscriptionStatus==='perpetual_free'?'':form.planCode,accessSlug:normalizeAccessSlug(form.accessSlug),serviceStartsAt,serviceExpiresAt,seedPackages:[...new Set([...selectedPackages,...mandatorySeedPackageKeys])]});const createdSlug=normalizeAccessSlug(result?.laboratory?.access_slug)||normalizeAccessSlug(result?.access_slug)||normalizeAccessSlug(form.accessSlug);original.value=signature.value;dirty.value=false;dialog.value.close();emit('created',{...result,accessUrls:buildTenantAccessUrls(createdSlug,result?.access_urls)})}catch(error){generalError.value=error?.message||'No fue posible registrar el laboratorio.'}finally{saving.value=false}}
async function requestClose(){if(saving.value)return;if(dirty.value){const confirmed=await discardDialog.value?.ask({kicker:'Confirmación',title:'Descartar cambios',message:'Hay cambios sin guardar. ¿Deseas salir y descartarlos?',icon:'warning',variant:'danger',confirmIcon:'delete',confirmText:'Sí, salir y descartar cambios',cancelText:'Cancelar'});if(!confirmed)return}dialog.value?.close()}
function close(){requestClose()}
defineExpose({open,close,requestClose})


const laboratoryPhoneFieldKey = 'phone'

const formatLaboratoryPhone = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '')
  const local = digits.startsWith('58') ? digits.slice(2, 12) : digits.slice(0, 10)
  const area = local.slice(0, 3)
  const first = local.slice(3, 6)
  const second = local.slice(6, 10)
  return ['(+58)', area && ` ${area}`, first && ` ${first}`, second && `-${second}`].filter(Boolean).join('')
}

const onDynamicFieldInput = (fieldKey, event) => {
  clearFieldError(fieldKey)
  if (fieldKey !== laboratoryPhoneFieldKey) return
  form[fieldKey] = formatLaboratoryPhone(event.target.value)
}

</script>

<style scoped>
.prov-sections{display:grid;gap:16px;padding:16px}.prov-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;align-items:start}.prov-input-error{border-color:var(--bio-nexus-color-danger)!important}.prov-validity-note{margin:12px 0 0;color:var(--bio-nexus-color-text-muted);font-size:12px}.prov-module-toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:12px;color:var(--bio-nexus-color-text-muted)}.prov-module-actions{display:flex;gap:8px;flex-wrap:wrap}.prov-module-groups{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.prov-module-group{border:1px solid var(--bio-nexus-color-border);border-radius:var(--bio-nexus-radius-md);padding:12px;background:var(--bio-nexus-color-surface)}.prov-module-group-header{display:grid;grid-template-columns:auto minmax(0,1fr) auto auto;align-items:center;gap:8px;margin-bottom:10px;color:var(--bio-nexus-color-primary)}.prov-group-icon{font-size:20px;line-height:1}.prov-group-count{color:var(--bio-nexus-color-text-muted);font-size:12px;white-space:nowrap}.prov-module-options{display:grid;gap:8px}
.prov-module-options :deep(.prov-module-checkbox),
.prov-module-options :deep(.prov-module-checkbox label),
.prov-module-options :deep(.prov-module-checkbox span),
.prov-module-options :deep(.prov-module-checkbox__label){font-weight:400}.prov-modules-error{border-color:var(--bio-nexus-color-danger);box-shadow:0 0 0 3px rgb(180 35 24 / 12%)}@media(max-width:720px){.prov-grid,.prov-module-groups{grid-template-columns:1fr}.prov-module-toolbar{align-items:flex-start;flex-direction:column}}


.prov-package-toolbar{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:12px}.prov-package-toolbar p,.prov-package-summary{margin:0;color:var(--bio-nexus-color-text-muted);font-size:12px}.prov-package-actions{display:flex;gap:8px;flex-wrap:wrap}.prov-package-groups{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.prov-package-group{display:grid;gap:10px;padding:12px;border:1px solid var(--bio-nexus-color-border);border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-surface)}.prov-package-group-selected{border-color:var(--bio-nexus-color-primary);background:var(--bio-nexus-color-primary-soft)}.prov-package-children{display:grid;gap:8px;padding-left:28px}.prov-package-option{display:flex;align-items:flex-start;gap:10px;padding:12px;border:1px solid var(--bio-nexus-color-border);border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-surface);cursor:pointer}.prov-package-option-selected{border-color:var(--bio-nexus-color-primary);background:var(--bio-nexus-color-primary-soft)}.prov-package-option input{margin-top:3px;accent-color:var(--bio-nexus-color-primary)}.prov-package-copy{display:grid;gap:3px;min-width:0}.prov-package-copy strong{color:var(--bio-nexus-color-text-primary);font-size:13px;font-weight:600}.prov-package-copy small{color:var(--bio-nexus-color-text-muted);font-size:11px;line-height:1.4}.prov-package-summary{margin-top:10px;font-weight:600}@media(max-width:720px){.prov-package-toolbar{flex-direction:column}.prov-package-groups{grid-template-columns:1fr}}




</style>
