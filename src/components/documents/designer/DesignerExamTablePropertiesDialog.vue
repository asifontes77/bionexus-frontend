<template>
  <BioNexusDialog ref="dialog" size="fullscreen" dialog-class="exam-visual-dialog" body-class="exam-visual-dialog-body" body-scroll="hidden" :prevent-close="dirty" :kicker="mode==='create'?'Nuevo objeto':'Editar objeto'" :title="mode==='create'?'Agregar tabla de exámenes':'Editar tabla de exámenes'" subtitle="Diseña la tabla directamente sobre una vista previa viva." @before-close="requestClose" @close="reset">
    <section class="exam-visual-shell">
      <nav class="exam-visual-toolbar" aria-label="Herramientas de tabla de exámenes">
        <button type="button" :class="{active:draft.showHeader}" @click="draft.showHeader=!draft.showHeader"><BioNexusIcon name="view_headline" :size="18" />Encabezado</button>
        <button type="button" :class="{active:draft.showBorders}" @click="draft.showBorders=!draft.showBorders"><BioNexusIcon name="border_all" :size="18" />Bordes</button>
        <span class="toolbar-separator"></span>
        <button type="button" @click="addColumn"><BioNexusIcon name="add" :size="18" />Columna</button>
        <button type="button" :disabled="!selectedColumn || draft.columns.length===1" @click="removeSelectedColumn"><BioNexusIcon name="delete" :size="18" />Eliminar</button>
        <button type="button" :disabled="selectedColumnIndex<=0" @click="moveSelectedColumn(-1)"><BioNexusIcon name="arrow_back" :size="18" />Mover izquierda</button>
        <button type="button" :disabled="selectedColumnIndex<0 || selectedColumnIndex===draft.columns.length-1" @click="moveSelectedColumn(1)"><BioNexusIcon name="arrow_forward" :size="18" />Mover derecha</button>
        <span class="toolbar-spacer"></span>
        <span class="table-measure">{{ totalWidth }} px · {{ draft.columns.length }} columnas</span>
      </nav>

      <section class="exam-visual-workspace">
        <aside class="exam-visual-inspector">
          <details v-if="selectedColumn" class="inspector-section" open>
            <summary><span><BioNexusIcon name="view_column" :size="19" /> Columna seleccionada</span><small>{{ selectedColumn.title || 'Sin título' }}</small></summary>
            <div class="inspector-section-body">
              <BioNexusFormField label="Título" field-id="exam-column-title" :help="selectedColumn.title.length + ' de 30 caracteres'"><input id="exam-column-title" v-model.trim="selectedColumn.title" class="bio-nexus-field" maxlength="30" /></BioNexusFormField>
              <BioNexusFormField label="Campo dinámico" field-id="exam-column-field"><BioNexusSearchableSelect id="exam-column-field" v-model="selectedColumn.field" :options="examFieldOptions" placeholder="Selecciona el campo" /></BioNexusFormField>
              <BioNexusFormField label="Alineación" field-id="exam-column-align"><BioNexusSearchableSelect id="exam-column-align" v-model="selectedColumn.align" :options="alignmentOptions" /></BioNexusFormField>
              <BioNexusFormField label="Ancho" field-id="exam-column-width" help="También puedes arrastrar el borde derecho del encabezado."><input id="exam-column-width" v-model.number="selectedColumn.width" class="bio-nexus-field" type="number" min="40" max="500" @change="normalizeSelectedWidth" /></BioNexusFormField>
            </div>
          </details>

          <details class="inspector-section" open>
            <summary><span><BioNexusIcon name="palette" :size="19" /> Presentación</span><small>Apariencia y tipografía</small></summary>
            <div class="inspector-section-body">
              <BioNexusFormField label="Alto de fila" field-id="exam-row-height" help="Entre 20 y 80 px."><input id="exam-row-height" v-model.number="draft.rowHeight" class="bio-nexus-field" type="number" min="20" max="80" /></BioNexusFormField>
              <BioNexusFormField label="Formato a editar" field-id="exam-format-scope"><BioNexusSearchableSelect id="exam-format-scope" v-model="formatScope" :options="formatScopeOptions" /></BioNexusFormField>
              <section class="exam-format-scope">
                <div class="format-grid">
                  <BioNexusFormField label="Tipo de letra" field-id="exam-font-family"><BioNexusSearchableSelect id="exam-font-family" v-model="activeStyle.fontFamily" :options="fontOptions" /></BioNexusFormField>
                  <BioNexusFormField label="Tamaño" field-id="exam-font-size"><BioNexusSearchableSelect id="exam-font-size" v-model="activeStyle.fontSize" :options="fontSizeOptions" /></BioNexusFormField>
                  <BioNexusFormField label="Padding" field-id="exam-padding" help="Entre 0 y 24 px."><input id="exam-padding" v-model.number="activeStyle.padding" class="bio-nexus-field" type="number" min="0" max="24" /></BioNexusFormField>
                  <BioNexusFormField label="Grosor de borde" field-id="exam-style-border-width"><input id="exam-style-border-width" v-model.number="activeStyle.borderWidth" class="bio-nexus-field" type="number" min="0" max="8" /></BioNexusFormField>
                </div>
                <div class="format-button-row">
                  <button type="button" :class="{active:activeStyle.bold}" title="Negrita" @click="activeStyle.bold=!activeStyle.bold"><strong>B</strong></button>
                  <button type="button" :class="{active:activeStyle.italic}" title="Cursiva" @click="activeStyle.italic=!activeStyle.italic"><em>I</em></button>
                  <button type="button" :class="{active:activeStyle.underline}" title="Subrayado" @click="activeStyle.underline=!activeStyle.underline"><u>U</u></button>
                </div>
                <div class="color-grid">
                  <BioNexusFormField label="Color de texto" field-id="exam-style-text"><input id="exam-style-text" v-model="activeStyle.textColor" type="color" /></BioNexusFormField>
                  <BioNexusFormField label="Color de fondo" field-id="exam-style-background"><input id="exam-style-background" v-model="activeStyle.background" type="color" /></BioNexusFormField>
                  <BioNexusFormField label="Color de borde" field-id="exam-style-border"><input id="exam-style-border" v-model="activeStyle.borderColor" type="color" /></BioNexusFormField>
                  <BioNexusFormField v-if="formatScope==='body'" label="Filas alternas" field-id="exam-style-alternate"><input id="exam-style-alternate" v-model="activeStyle.alternateBackground" type="color" /></BioNexusFormField>
                  <BioNexusFormField v-if="formatScope==='totals'" label="Total general" field-id="exam-style-grand"><input id="exam-style-grand" v-model="activeStyle.grandTotalBackground" type="color" /></BioNexusFormField>
                </div>
              </section>
            </div>
          </details>
          <details class="inspector-section">
            <summary><span><BioNexusIcon name="calculate" :size="19" /> Totales</span><small>{{ activeTotals }} activos</small></summary>
            <div class="inspector-section-body totals-section-body">
              <article v-for="(row,index) in draft.totalRows" :key="row.id" class="total-editor-row">
                <label><input v-model="row.enabled" type="checkbox" /> <span>{{ row.label }}</span></label>
                <div class="total-row-actions"><button type="button" :disabled="index===0" @click="moveTotal(index,-1)">↑</button><button type="button" :disabled="index===draft.totalRows.length-1" @click="moveTotal(index,1)">↓</button></div>
                <BioNexusFormField label="Etiqueta" :field-id="'total-label-'+row.id" :help="row.label.length + ' de 30 caracteres'"><input :id="'total-label-'+row.id" v-model.trim="row.label" class="bio-nexus-field" maxlength="30" /></BioNexusFormField>
                <BioNexusFormField label="Importe" :field-id="'total-field-'+row.id"><BioNexusSearchableSelect :id="'total-field-'+row.id" v-model="row.field" :options="totalFieldOptions" /></BioNexusFormField>
                <label class="bold-option"><input v-model="row.bold" type="checkbox" /> Negrita</label>
              </article>
            </div>
          </details>
        </aside>

        <main class="exam-preview-area">
          <header><div><strong>Vista previa de la tabla</strong><span>Selecciona una columna y arrastra sus divisores para cambiar el ancho.</span></div><span>{{ selectedColumn ? 'Columna: '+selectedColumn.title : 'Selecciona una columna' }}</span></header>
          <div class="exam-preview-scroll">
            <section class="exam-preview-paper">
              <table :style="previewTableStyle">
                <colgroup><col v-for="column in draft.columns" :key="column.id" :style="{width:column.width+'px'}" /></colgroup>
                <thead v-if="draft.showHeader"><tr><th v-for="(column,index) in draft.columns" :key="column.id" :class="{selected:index===selectedColumnIndex}" :style="headerCellStyle(column)" @click="selectColumn(index)"><span>{{ column.title }}</span><button type="button" class="column-resizer" :aria-label="'Cambiar ancho de '+column.title" @pointerdown.prevent.stop="beginResize(index,$event)"></button></th></tr></thead>
                <tbody><tr v-for="(row,rowIndex) in sampleRows" :key="rowIndex" :style="{height:draft.rowHeight+'px'}"><td v-for="(column,index) in draft.columns" :key="column.id" :class="{selected:index===selectedColumnIndex}" :style="bodyCellStyle(column,rowIndex)" @click="selectColumn(index)">{{ row[column.field] ?? '' }}</td></tr></tbody>
                <tfoot><tr v-for="row in activeTotalRows" :key="row.id" :class="{grand:row.id==='grandTotal'}" :style="{height:draft.rowHeight+'px'}"><td :colspan="Math.max(1,draft.columns.length-1)" :style="totalLabelStyle(row)">{{ row.label }}</td><td :style="totalValueStyle(row)">{{ sampleSummary[row.field] ?? '' }}</td></tr></tfoot>
              </table>
            </section>
          </div>
          <footer><span>Los datos son de ejemplo. La estructura, los anchos, los estilos y los totales sí representan el resultado final.</span></footer>
        </main>
      </section>
    </section>
    <template #footer><BioNexusActionButton variant="secondary" icon="cancel" @click="requestClose">Cancelar</BioNexusActionButton><BioNexusActionButton variant="primary" :icon="mode==='create'?'create':'save'" :disabled="!dirty" @click="apply">{{ mode==='create' ? 'Agregar' : 'Aplicar' }}</BioNexusActionButton></template>
  </BioNexusDialog>
  <BioNexusConfirmDialog ref="confirmDialog" />
</template>

<script setup>
import { computed, nextTick, ref } from "vue";
import BioNexusActionButton from "@/components/ui/BioNexusActionButton.vue";
import BioNexusConfirmDialog from "@/components/ui/BioNexusConfirmDialog.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
import BioNexusFormField from "@/components/ui/BioNexusFormField.vue";
import BioNexusIcon from "@/components/ui/BioNexusIcon.vue";
import BioNexusSearchableSelect from "@/components/ui/BioNexusSearchableSelect.vue";


const props=defineProps({examFieldOptions:{type:Array,default:()=>[]},totalFieldOptions:{type:Array,default:()=>[]}});
const emit=defineEmits(["apply"]);
const dialog=ref(null),confirmDialog=ref(null),mode=ref("edit"),targetId=ref(null),draft=ref(emptyModel()),original=ref(""),selectedColumnIndex=ref(0),resizeState=ref(null);
const alignmentOptions=Object.freeze([{value:"left",label:"Izquierda"},{value:"center",label:"Centro"},{value:"right",label:"Derecha"}]);
const formatScopeOptions=Object.freeze([{value:"header",label:"Encabezado"},{value:"body",label:"Cuerpo y celdas"},{value:"totals",label:"Totales"}]);
const fontOptions=Object.freeze(["Inter","Arial","Roboto","Courier New","Georgia","Times New Roman"].map(value=>({value,label:value})));
const fontSizeOptions=Object.freeze([8,9,10,11,12,14,16,18,20,24,28,32].map(value=>({value,label:value+" px"})));
const formatScope=ref("header");
const sampleRows=Object.freeze([{quantity:"1",name:"Hematología completa",unitPrice:"25,00",subtotal:"25,00",taxTotal:"4,00",total:"29,00"},{quantity:"1",name:"Glucosa",unitPrice:"12,50",subtotal:"12,50",taxTotal:"1,60",total:"14,10"},{quantity:"1",name:"Examen de orina",unitPrice:"10,00",subtotal:"10,00",taxTotal:"0,00",total:"10,00"}]);
const sampleSummary=Object.freeze({subtotal:"47,50",discount:"0,00",taxes:"5,60",grandTotal:"53,10",total:"53,10"});
const clone=value=>JSON.parse(JSON.stringify(value));
const signature=value=>JSON.stringify(value);
const dirty=computed(()=>signature(draft.value)!==original.value);
const selectedColumn=computed(()=>draft.value.columns[selectedColumnIndex.value]||null);
const activeTotalRows=computed(()=>draft.value.totalRows.filter(row=>row.enabled));
const activeTotals=computed(()=>activeTotalRows.value.length);
const activeStyle=computed(()=>draft.value.styles[formatScope.value]);
const totalWidth=computed(()=>draft.value.columns.reduce((sum,column)=>sum+(Number(column.width)||0),0));
const previewTableStyle=computed(()=>({width:totalWidth.value+'px',borderColor:draft.value.styles.outer.borderColor,background:draft.value.styles.outer.background||'#ffffff'}));
function emptyModel(){return{columns:[],totalRows:[],showHeader:true,showBorders:true,rowHeight:30,styles:{header:{background:"#eaf1f5",textColor:"#263238",fontFamily:"Inter",fontSize:12,bold:true,italic:false,underline:false,padding:6,borderColor:"#78909c",borderWidth:1},body:{background:"#ffffff",alternateBackground:"#f8fbfd",textColor:"#263238",fontFamily:"Inter",fontSize:11,bold:false,italic:false,underline:false,padding:6,borderColor:"#cfd8dc",borderWidth:1},totals:{background:"#ffffff",grandTotalBackground:"#eaf1f5",textColor:"#263238",fontFamily:"Inter",fontSize:11,bold:false,italic:false,underline:false,padding:6,borderColor:"#cfd8dc",borderWidth:1},outer:{background:"#ffffff",borderColor:"#78909c",borderWidth:1}}}}
function normalize(value){const defaults=emptyModel(),model=clone(value||defaults);model.columns=Array.isArray(model.columns)?model.columns.map((column,index)=>({...column,id:column.id||`column-${index}`,title:String(column.title||`Columna ${index+1}`),width:Math.min(500,Math.max(40,Number(column.width)||100)),align:["left","center","right"].includes(column.align)?column.align:"left"})):[];model.totalRows=Array.isArray(model.totalRows)?model.totalRows:[];model.rowHeight=Math.min(80,Math.max(20,Number(model.rowHeight)||30));model.styles={...defaults.styles,...(model.styles||{}),header:{...defaults.styles.header,...(model.styles?.header||{})},body:{...defaults.styles.body,...(model.styles?.body||{})},totals:{...defaults.styles.totals,...(model.styles?.totals||{})},outer:{...defaults.styles.outer,...(model.styles?.outer||{})}};return model}
async function openCreate(value){mode.value="create";targetId.value=null;draft.value=normalize(value);selectedColumnIndex.value=0;original.value=signature(draft.value);dialog.value?.open();await nextTick()}
async function openEdit(value){mode.value="edit";targetId.value=value.id;draft.value=normalize(value);selectedColumnIndex.value=0;original.value=signature(draft.value);dialog.value?.open();await nextTick()}
function selectColumn(index){selectedColumnIndex.value=index}
function normalizeSelectedWidth(){if(selectedColumn.value)selectedColumn.value.width=Math.min(500,Math.max(40,Number(selectedColumn.value.width)||100))}
function addColumn(){const index=draft.value.columns.length+1;draft.value.columns.push({id:`custom-${Date.now()}-${index}`,title:`Columna ${index}`,field:"name",width:120,align:"left"});selectedColumnIndex.value=draft.value.columns.length-1}
function removeSelectedColumn(){if(!selectedColumn.value||draft.value.columns.length===1)return;draft.value.columns.splice(selectedColumnIndex.value,1);selectedColumnIndex.value=Math.min(selectedColumnIndex.value,draft.value.columns.length-1)}
function moveSelectedColumn(delta){const index=selectedColumnIndex.value,target=index+delta;if(index<0||target<0||target>=draft.value.columns.length)return;const [column]=draft.value.columns.splice(index,1);draft.value.columns.splice(target,0,column);selectedColumnIndex.value=target}
function moveTotal(index,delta){const target=index+delta;if(target<0||target>=draft.value.totalRows.length)return;const [row]=draft.value.totalRows.splice(index,1);draft.value.totalRows.splice(target,0,row)}
function beginResize(index,event){selectColumn(index);const column=draft.value.columns[index];resizeState.value={index,startX:event.clientX,startWidth:Number(column.width)||100};globalThis.addEventListener("pointermove",resizeColumn);globalThis.addEventListener("pointerup",endResize,{once:true})}
function resizeColumn(event){const state=resizeState.value;if(!state)return;draft.value.columns[state.index].width=Math.min(500,Math.max(40,Math.round(state.startWidth+event.clientX-state.startX)))}
function endResize(){globalThis.removeEventListener("pointermove",resizeColumn);resizeState.value=null}
function border(){return draft.value.showBorders?`${Math.max(0,Number(draft.value.styles.outer.borderWidth)||1)}px solid ${draft.value.styles.outer.borderColor}`:"0 solid transparent"}function scopeBorder(style){return draft.value.showBorders?`${Math.max(0,Number(style.borderWidth)||0)}px solid ${style.borderColor}`:"0 solid transparent"}
function headerCellStyle(column){const style=draft.value.styles.header;return{height:Math.max(26,draft.value.rowHeight)+'px',background:style.background,color:style.textColor,textAlign:column.align,border:scopeBorder(style),fontFamily:style.fontFamily,fontSize:style.fontSize+'px',fontWeight:style.bold?700:400,fontStyle:style.italic?'italic':'normal',textDecoration:style.underline?'underline':'none',padding:style.padding+'px'}}
function bodyCellStyle(column,rowIndex){const style=draft.value.styles.body;return{height:draft.value.rowHeight+'px',background:rowIndex%2?style.alternateBackground:style.background,color:style.textColor,textAlign:column.align,border:scopeBorder(style),fontFamily:style.fontFamily,fontSize:style.fontSize+'px',fontWeight:style.bold?700:400,fontStyle:style.italic?'italic':'normal',textDecoration:style.underline?'underline':'none',padding:style.padding+'px'}}
function totalLabelStyle(row){const style=draft.value.styles.totals;return{textAlign:"right",fontWeight:row.bold||style.bold?700:400,background:row.id==='grandTotal'?style.grandTotalBackground:style.background,color:style.textColor,border:scopeBorder(style),fontFamily:style.fontFamily,fontSize:style.fontSize+'px',fontStyle:style.italic?'italic':'normal',textDecoration:style.underline?'underline':'none',padding:style.padding+'px'}}
function totalValueStyle(row){return{...totalLabelStyle(row),textAlign:"right"}}
function apply(){if(!dirty.value)return;emit("apply",{mode:mode.value,id:targetId.value,values:clone(draft.value)});original.value=signature(draft.value);dialog.value?.close()}
async function requestClose(){if(dirty.value){const accepted=await confirmDialog.value?.ask({kicker:"Confirmación",title:"Descartar cambios",message:"Hay cambios sin aplicar. ¿Deseas cerrar y descartarlos?",icon:"warning",variant:"danger",confirmIcon:"delete",confirmText:"Sí, cerrar y descartar",cancelText:"Continuar editando"});if(!accepted)return}dialog.value?.close()}
function reset(){endResize();targetId.value=null;original.value="";selectedColumnIndex.value=0}
defineExpose({openCreate,openEdit});
</script>

<style scoped>
:global(.exam-visual-dialog-body){box-sizing:border-box;height:calc(100dvh - 184px);min-height:0;padding:0!important;overflow:hidden!important}
:global(.exam-visual-dialog){height:min(94dvh,980px);max-height:94dvh}
.exam-visual-shell{display:grid;grid-template-rows:auto minmax(0,1fr);height:100%;min-height:0;background:var(--bio-nexus-color-surface-soft)}.exam-visual-toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:4px;padding:7px 10px;border-bottom:1px solid var(--bio-nexus-color-border);background:#fff}.exam-visual-toolbar button{display:inline-flex;align-items:center;gap:5px;min-height:34px;padding:5px 8px;border:1px solid var(--bio-nexus-color-border);border-radius:5px;background:#fff;color:var(--bio-nexus-color-text);cursor:pointer}.exam-visual-toolbar button:hover,.exam-visual-toolbar button.active{border-color:var(--bio-nexus-color-primary);background:var(--bio-nexus-color-info-soft)}.exam-visual-toolbar button:disabled{cursor:not-allowed;opacity:.42}.toolbar-separator{width:1px;height:24px;margin:0 3px;background:var(--bio-nexus-color-border)}.toolbar-spacer{flex:1}.table-measure{color:var(--bio-nexus-color-text-muted);font-size:12px}.exam-visual-workspace{display:grid;grid-template-columns:minmax(330px,380px) minmax(0,1fr);height:100%;min-height:0;overflow:hidden}.exam-visual-inspector{display:block;box-sizing:border-box;height:100%;min-height:0;padding:12px 14px 40px;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;scrollbar-gutter:stable;border-right:1px solid var(--bio-nexus-color-border);background:#fff}.exam-visual-inspector>.inspector-section+ .inspector-section{margin-top:10px}.color-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.color-grid input[type=color]{box-sizing:border-box;width:100%;height:38px;padding:3px;border:1px solid var(--bio-nexus-color-border);border-radius:6px;background:#fff}.total-editor-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:7px;padding:9px 0;border-bottom:1px solid var(--bio-nexus-color-border)}.total-editor-row>label{display:flex;align-items:center;gap:7px}.total-editor-row :deep(.bio-nexus-form-field){grid-column:1/-1}.total-row-actions{display:flex;gap:4px}.total-row-actions button{width:28px;height:28px;border:1px solid var(--bio-nexus-color-border);border-radius:5px;background:#fff}.bold-option{grid-column:1/-1}.exam-preview-area{display:grid;grid-template-rows:auto minmax(0,1fr) auto;min-width:0;min-height:0;padding:16px}.exam-preview-area>header{display:flex;justify-content:space-between;gap:12px;margin-bottom:10px}.exam-preview-area>header div{display:grid;gap:2px}.exam-preview-area>header span,.exam-preview-area>footer{color:var(--bio-nexus-color-text-muted);font-size:12px}.exam-preview-scroll{display:flex;align-items:flex-start;justify-content:center;min-width:0;min-height:0;padding:22px;overflow:auto;border:1px solid var(--bio-nexus-color-border-strong);background:#dfe7ec;scrollbar-gutter:stable}.exam-preview-paper{box-sizing:border-box;min-width:max-content;padding:28px;background:#fff;box-shadow:var(--bio-nexus-shadow-md)}.exam-preview-paper table{border-collapse:collapse;table-layout:fixed;font-family:Inter,Arial,sans-serif;font-size:11px}.exam-preview-paper th,.exam-preview-paper td{box-sizing:border-box;padding:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.exam-preview-paper th{position:relative;cursor:pointer}.exam-preview-paper th.selected,.exam-preview-paper td.selected{box-shadow:inset 0 0 0 2px var(--bio-nexus-color-primary)}.column-resizer{position:absolute;z-index:4;top:0;right:-4px;width:9px;height:100%;padding:0;border:0;background:transparent;cursor:col-resize}.column-resizer:hover{background:color-mix(in srgb,var(--bio-nexus-color-primary) 25%,transparent)}.exam-preview-paper tfoot tr.grand td{font-weight:700}.exam-preview-area>footer{padding-top:8px}.inspector-section{display:block;flex:0 0 auto;min-width:0;height:auto;min-height:0;border:1px solid var(--bio-nexus-color-border);border-radius:9px;background:#fff;overflow:visible}.inspector-section>summary{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;cursor:pointer;background:var(--bio-nexus-color-surface-soft);color:var(--bio-nexus-color-primary);font-weight:700}.inspector-section>summary span{display:flex;align-items:center;gap:7px}.inspector-section>summary small{color:var(--bio-nexus-color-text-muted);font-size:11px;font-weight:400}.inspector-section-body{display:grid;align-content:start;gap:10px;box-sizing:border-box;width:100%;min-width:0;height:auto;min-height:0;padding:12px;overflow:visible}.totals-section-body{padding-bottom:18px}.format-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.format-button-row{display:flex;gap:6px;margin:3px 0}.format-button-row button{width:34px;height:32px;border:1px solid var(--bio-nexus-color-border);border-radius:5px;background:#fff}.format-button-row button.active{border-color:var(--bio-nexus-color-primary);background:var(--bio-nexus-color-info-soft);color:var(--bio-nexus-color-primary)}@media(max-width:1000px){:global(.exam-visual-dialog-body){height:auto;max-height:calc(100dvh - 184px);overflow:auto!important}.exam-visual-workspace{grid-template-columns:1fr;height:auto;overflow:visible}.exam-visual-inspector{height:auto;max-height:none;overflow:visible;border-right:0;border-bottom:1px solid var(--bio-nexus-color-border)}}
</style>
