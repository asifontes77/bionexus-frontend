<template>
  <main ref="designerRoot" class="pilot-page receipt-designer-page" :class="{'preview-mode':preview}">
    <header class="pilot-toolbar receipt-designer-toolbar">
      <div class="toolbar-group">
        <BioNexusSearchableSelect id="page-size" v-model="pagePreset" class="page-select" :options="pageOptions" placeholder="Tamaño de página" @update:model-value="applyPagePreset" />
        <BioNexusSearchableSelect id="page-orientation" v-model="orientation" class="orientation-select" :options="orientationOptions" placeholder="Orientación" @update:model-value="applyPagePreset(pagePreset)" />
      </div>
      <div class="toolbar-group zoom-group">
        <BioNexusActionButton size="sm" icon-only shape="circle" icon="remove" label="Alejar" @click="changeZoom(-.05)" />
        <button class="zoom-value" type="button" title="Restablecer a 100%" @click="setZoom(1)">{{ Math.round(zoom*100) }}%</button>
        <BioNexusActionButton size="sm" icon-only shape="circle" icon="add" label="Acercar" @click="changeZoom(.05)" />
        <BioNexusActionButton size="sm" variant="subtle" icon-only shape="circle" icon="fit_screen" label="Ajustar página" title="Ajustar página" @click="fitPage" />
        <BioNexusActionButton size="sm" variant="subtle" icon-only shape="circle" icon="width" label="Ajustar ancho" title="Ajustar ancho" @click="fitWidth" />
        <BioNexusActionButton size="sm" variant="accent" icon-only shape="circle" icon="dashboard_customize" label="Plantillas" title="Plantillas" @click="openTemplateGallery" />
      </div>
      <div class="toolbar-group document-actions">
        <BioNexusActionButton size="sm" variant="subtle" icon-only shape="circle" icon="undo" label="Deshacer" title="Deshacer (Ctrl+Z)" :disabled="!canUndo" @click="undo" />
        <BioNexusActionButton size="sm" variant="subtle" icon-only shape="circle" icon="redo" label="Rehacer" title="Rehacer (Ctrl+Y)" :disabled="!canRedo" @click="redo" />
        <BioNexusActionButton size="sm" variant="subtle" icon-only shape="circle" icon="delete_sweep" label="Limpiar comprobante" title="Limpiar comprobante" :disabled="extraElements.length===0" @click="clearDocument" />
        <BioNexusActionButton size="sm" variant="subtle" icon-only shape="circle" icon="visibility" :label="preview ? 'Editar' : 'Vista previa'" :title="preview ? 'Volver a editar' : 'Vista previa'" @click="togglePreview" />
        <BioNexusActionButton size="sm" variant="subtle" icon-only shape="circle" icon="fullscreen" label="Pantalla completa" title="Pantalla completa" @click="toggleFullscreen" />
        <BioNexusActionButton size="sm" variant="primary" icon-only shape="circle" icon="save" label="Guardar comprobante" title="Guardar comprobante" :loading="versionBusy" :disabled="versionBusy || !dirty || !canSaveDraft" @click="saveDraft" />
      </div>
    </header>

    <section class="pilot-workspace receipt-designer-workspace">
      <nav v-if="preview" class="editor-preview-toolbar" role="toolbar" aria-label="Controles de vista previa del editor">
        <BioNexusActionButton size="sm" icon="zoom_out" icon-only shape="circle" variant="secondary" label="Alejar" :disabled="zoom<=MIN_ZOOM" @click="changeZoom(-PREVIEW_ZOOM_STEP)" />
        <button type="button" class="editor-preview-zoom-value" title="Restablecer al 100 %" @click="setZoom(1)">{{ Math.round(zoom*100) }}%</button>
        <BioNexusActionButton size="sm" icon="zoom_in" icon-only shape="circle" variant="secondary" label="Acercar" :disabled="zoom>=MAX_ZOOM" @click="changeZoom(PREVIEW_ZOOM_STEP)" />
        <span class="editor-preview-rail-divider" aria-hidden="true"></span>
        <BioNexusActionButton size="sm" icon="fit_screen" icon-only shape="circle" variant="secondary" label="Ajustar página" @click="fitPage" />
        <BioNexusActionButton size="sm" icon="width" icon-only shape="circle" variant="secondary" label="Ajustar ancho" @click="fitWidth" />
        <span class="editor-preview-rail-divider" aria-hidden="true"></span>
        <BioNexusActionButton size="sm" icon="edit" icon-only shape="circle" variant="secondary" label="Volver a editar" @click="togglePreview" />
      </nav>
      <aside class="pilot-help designer-left-panel">
        <section class="designer-panel-section">
          <header><strong>Elementos</strong><span>Agregar al documento</span></header>
          <div class="element-palette">
            <button type="button" @click="addDesignerElement('logo')"><BioNexusIcon name="image" :size="18" /><span>Logo dinámico</span></button>
            <button type="button" @click="textPropertiesDialog?.openCreate()"><BioNexusIcon name="text_fields" :size="18" /><span>Texto libre</span></button>
            <button type="button" @click="examTablePropertiesDialog?.openCreate(clonePlain(createElementModel('exam-table')))"><BioNexusIcon name="table_chart" :size="18" /><span>Tabla de exámenes</span></button><button type="button" @click="tablePropertiesDialog?.openCreate()"><BioNexusIcon name="table" :size="18" /><span>Tabla libre</span></button>
            <button type="button" @click="addDesignerElement('qr')"><BioNexusIcon name="qr_code_2" :size="18" /><span>Código QR</span></button>
            <button type="button" @click="addDesignerElement('separator')"><BioNexusIcon name="horizontal_rule" :size="18" /><span>Separador</span></button>
            <button type="button" @click="addDesignerElement('rectangle')"><BioNexusIcon name="rectangle" :size="18" /><span>Rectángulo</span></button>
            <button type="button" @click="requestImageFile"><BioNexusIcon name="add_photo_alternate" :size="18" /><span>Imagen</span></button>
            <input ref="imageFileInput" class="visually-hidden" type="file" accept="image/png,image/jpeg,image/webp,image/gif" @change="handleImageFile">
          </div>
        </section>
        <section class="designer-panel-section">
          <header><strong>Capas</strong><span>{{ extraElements.length }} elementos</span></header>
          <p v-if="extraElements.length===0" class="empty-layers">El lienzo está vacío.</p>
          <button v-for="item in [...extraElements].reverse()" :key="item.id" type="button" class="layer-row" :class="{active:selectedIds.includes(item.id)}" @click="selectElement(item.id,$event.shiftKey||$event.ctrlKey||$event.metaKey)"><span>{{ elementLabel(item.type) }}</span><small>{{ item.locked ? 'Bloqueado' : item.type==='group' ? item.children.length+' elementos' : 'Elemento visual' }}</small></button>
        </section>
        <section class="designer-panel-section">
          <header><strong>Documento</strong><span>Diseño del comprobante</span></header>
          <p class="document-status">{{ dirty ? 'Cambios pendientes' : 'Borrador sincronizado' }}</p>
        </section>
      </aside>

      <section ref="viewport" class="canvas-viewport">
        <BioNexusDocumentPreview v-if="preview" :document-json="previewDocumentJson" :laboratory="laboratory" :zoom="zoom" title="Vista previa del comprobante" />
        <div v-else class="stage-scaler" :style="stageScalerStyle">
          <div ref="stageHost" class="stage-host"></div>
        </div>
      </section>
      <aside class="designer-right-panel">
        <section class="designer-panel-section"><header><strong>Propiedades</strong><span>{{ selectedId==='logo' ? 'Logo' : 'Texto' }}</span></header>
          <dl><dt>Elemento</dt><dd>{{ selectedCount>1 ? selectedCount+' elementos seleccionados' : selectedElementLabel }}</dd><dt>Página</dt><dd>{{ selectedPageLabel }} · {{ orientation==='portrait' ? 'Vertical' : 'Horizontal' }}</dd><dt>Zoom</dt><dd>{{ Math.round(zoom*100) }}%</dd></dl>
          <div class="property-action-groups">
            <section class="property-action-group"><strong>Elemento</strong><BioNexusActionButton v-if="canEditSelectedProperties" variant="primary" icon="edit" @click="openSelectedProperties">Editar propiedades</BioNexusActionButton><div class="property-actions property-actions-element"><button type="button" @click="duplicateSelected">Duplicar</button><button type="button" @click="toggleSelectedLock">{{ selectedLockLabel }}</button><button type="button" class="danger" @click="deleteSelected">Eliminar</button></div><div class="property-actions property-actions-group"><button type="button" :disabled="selectedCount<2 || selectedExtras.some(item=>item.locked)" @click="groupSelected">Agrupar</button><button type="button" :disabled="selectedExtra?.type!=='group' || selectedExtra.locked" @click="ungroupSelected">Desagrupar</button></div></section>
            <section class="property-action-group"><strong>Orden de capa</strong><div class="property-actions"><button type="button" @click="moveSelectedLayer('front')">Traer al frente</button><button type="button" @click="moveSelectedLayer('up')">Subir</button><button type="button" @click="moveSelectedLayer('down')">Bajar</button><button type="button" @click="moveSelectedLayer('back')">Enviar al fondo</button></div></section>
            <section class="property-action-group"><strong>Alineación en la página</strong><small class="property-action-help">Se aplica a todos los objetos seleccionados.</small><div class="property-actions property-actions-alignment"><button type="button" @click="alignSelected('left')">Izquierda</button><button type="button" @click="alignSelected('center')">Centro</button><button type="button" @click="alignSelected('right')">Derecha</button></div></section>
            <section class="property-action-group"><strong>Alineación entre objetos</strong><small class="property-action-help">Referencia: borde izquierdo o superior del primer objeto seleccionado.</small><div class="property-actions property-actions-object-alignment"><button type="button" :disabled="selectedCount<2" @click="alignSelectedObjects('vertical')">Borde izquierdo</button><button type="button" :disabled="selectedCount<2" @click="alignSelectedObjects('horizontal')">Borde superior</button></div></section>
          </div>
        </section>
        <GenericTablePropertiesPanel v-if="selectedExtra?.type==='generic-table'" :model="selectedExtra.table" :tokens="tokenCatalog" class="designer-panel-section" @change="refreshSelectedGenericTable" />        <section v-if="selectedExtra && ['image','rectangle','separator'].includes(selectedExtra.type)" class="designer-panel-section visual-properties-panel">
          <header><strong>{{ selectedExtra.type==='image' ? 'Imagen' : selectedExtra.type==='rectangle' ? 'Rectángulo' : 'Separador' }}</strong><span>Estilo visual</span></header>
          <p v-if="imageFileError && selectedExtra.type==='image'" class="property-error">{{ imageFileError }}</p>
          <template v-if="selectedExtra.type==='image'">
            <BioNexusFormField label="Archivo" :field-id="'image-file-'+selectedExtra.id" :help="selectedExtra.fileName || 'PNG, JPG, WEBP o GIF. Máximo 5 MB.'" wide><button :id="'image-file-'+selectedExtra.id" type="button" class="visual-file-button" @click="requestImageFile">{{ selectedExtra.src ? 'Reemplazar imagen' : 'Seleccionar imagen' }}</button></BioNexusFormField>
            <BioNexusFormField label="Ajuste" :field-id="'image-fit-'+selectedExtra.id"><BioNexusSearchableSelect :id="'image-fit-'+selectedExtra.id" v-model="selectedExtra.fit" :options="imageFitOptions" placeholder="Seleccione el ajuste" @update:model-value="refreshSelectedVisual()" /></BioNexusFormField>
            <BioNexusFormField label="Texto alternativo" :field-id="'image-alt-'+selectedExtra.id" :help="selectedExtra.alt.length + ' de 160 caracteres'" wide><input :id="'image-alt-'+selectedExtra.id" v-model.trim="selectedExtra.alt" class="bio-nexus-field" maxlength="160" @input="refreshSelectedVisual()"></BioNexusFormField>
          </template>
          <div class="property-grid">
            <BioNexusFormField v-if="selectedExtra.type==='rectangle'" label="Relleno" :field-id="'fill-'+selectedExtra.id"><div class="color-field"><input v-model="selectedExtra.fillColor" type="color" @input="refreshSelectedVisual()"><input :id="'fill-'+selectedExtra.id" v-model.trim="selectedExtra.fillColor" class="bio-nexus-field" maxlength="7" @input="refreshSelectedColor('fillColor')" @change="normalizeSelectedColors"></div></BioNexusFormField>
            <BioNexusFormField v-if="selectedExtra.type==='rectangle'" label="Opacidad de relleno" :field-id="'fill-opacity-'+selectedExtra.id" help="Entre 0 y 100 %."><input :id="'fill-opacity-'+selectedExtra.id" v-model.number="selectedExtra.fillOpacity" class="bio-nexus-field" type="number" min="0" max="100" @input="refreshSelectedVisual()"></BioNexusFormField>
            <BioNexusFormField v-if="selectedExtra.type!=='image' || selectedExtra.borderWidth>0" label="Color de borde" :field-id="'stroke-'+selectedExtra.id"><div class="color-field"><input v-model="selectedExtra.strokeColor" type="color" @input="refreshSelectedVisual()"><input :id="'stroke-'+selectedExtra.id" v-model.trim="selectedExtra.strokeColor" class="bio-nexus-field" maxlength="7" @input="refreshSelectedColor('strokeColor')" @change="normalizeSelectedColors"></div></BioNexusFormField>
            <BioNexusFormField :label="selectedExtra.type==='separator' ? 'Grosor' : 'Grosor de borde'" :field-id="'stroke-width-'+selectedExtra.id" help="Entre 0 y 20 px."><input :id="'stroke-width-'+selectedExtra.id" v-model.number="selectedExtra.borderWidth" class="bio-nexus-field" type="number" min="0" max="20" step="1" @input="refreshSelectedVisual()"></BioNexusFormField>
            <BioNexusFormField label="Estilo de línea" :field-id="'line-style-'+selectedExtra.id"><BioNexusSearchableSelect :id="'line-style-'+selectedExtra.id" v-model="selectedExtra.lineStyle" :options="lineStyleOptions" placeholder="Seleccione el estilo" @update:model-value="refreshSelectedVisual()" /></BioNexusFormField>
            <BioNexusFormField v-if="selectedExtra.type!=='separator'" label="Radio de esquina" :field-id="'radius-'+selectedExtra.id" help="Entre 0 y 80 px."><input :id="'radius-'+selectedExtra.id" v-model.number="selectedExtra.cornerRadius" class="bio-nexus-field" type="number" min="0" max="80" @input="refreshSelectedVisual()"></BioNexusFormField>
            <BioNexusFormField label="Opacidad" :field-id="'opacity-'+selectedExtra.id" help="Entre 0 y 100 %."><input :id="'opacity-'+selectedExtra.id" v-model.number="selectedExtra.opacity" class="bio-nexus-field" type="number" min="0" max="100" @input="refreshSelectedVisual()"></BioNexusFormField>
          </div>
        </section>
        <section v-if="pagePreset==='custom'" class="designer-panel-section custom-page-panel"><header><strong>Tamaño personalizado</strong><span>Milímetros</span></header>
          <div class="property-grid">
            <BioNexusFormField label="Ancho" field-id="custom-page-width" help="Entre 80 y 500 mm."><input id="custom-page-width" v-model.number="customPageWidth" class="bio-nexus-field" type="number" min="80" max="500" step="1" @change="applyCustomPageSize"></BioNexusFormField>
            <BioNexusFormField label="Alto" field-id="custom-page-height" help="Entre 80 y 700 mm."><input id="custom-page-height" v-model.number="customPageHeight" class="bio-nexus-field" type="number" min="80" max="700" step="1" @change="applyCustomPageSize"></BioNexusFormField>
          </div>
        </section>
        <section class="designer-panel-section page-margin-panel"><header><strong>Márgenes de página</strong><span>Área segura</span></header>
          <div class="property-grid">
            <BioNexusFormField label="Superior" field-id="margin-top" help="0 a 50 mm."><input id="margin-top" :value="marginMm.top" class="bio-nexus-field" type="number" min="0" max="50" step="0.5" @input="updateMarginMm('top',$event)"></BioNexusFormField>
            <BioNexusFormField label="Derecho" field-id="margin-right" help="0 a 50 mm."><input id="margin-right" :value="marginMm.right" class="bio-nexus-field" type="number" min="0" max="50" step="0.5" @input="updateMarginMm('right',$event)"></BioNexusFormField>
            <BioNexusFormField label="Inferior" field-id="margin-bottom" help="0 a 50 mm."><input id="margin-bottom" :value="marginMm.bottom" class="bio-nexus-field" type="number" min="0" max="50" step="0.5" @input="updateMarginMm('bottom',$event)"></BioNexusFormField>
            <BioNexusFormField label="Izquierdo" field-id="margin-left" help="0 a 50 mm."><input id="margin-left" :value="marginMm.left" class="bio-nexus-field" type="number" min="0" max="50" step="0.5" @input="updateMarginMm('left',$event)"></BioNexusFormField>
          </div>
        </section>

      </aside>
    </section>
    <Teleport to="body">
      <nav v-if="contextMenu.open" ref="contextMenuElement" class="receipt-context-menu" :style="{left:contextMenu.x+'px',top:contextMenu.y+'px'}" tabindex="-1" role="menu" aria-label="Acciones del elemento seleccionado" @contextmenu.prevent>
        <header><strong>{{ selectedElementLabel }}</strong><small>{{ selectedCount }} seleccionado{{ selectedCount===1?'':'s' }}</small></header>
        <section><span>Elemento</span><button type="button" role="menuitem" @click="runContextAction(duplicateSelected)">Duplicar <kbd>Ctrl+D</kbd></button><button type="button" role="menuitem" @click="runContextAction(toggleSelectedLock)">{{ selectedLockLabel }}</button></section>
        <section><span>Agrupación</span><button type="button" role="menuitem" :disabled="!canContextGroup" @click="runContextAction(groupSelected)">Agrupar</button><button type="button" role="menuitem" :disabled="!canContextUngroup" @click="runContextAction(ungroupSelected)">Desagrupar</button></section>
        <section><span>Orden de capa</span><button type="button" role="menuitem" @click="runContextAction(()=>moveSelectedLayer('front'))">Traer al frente</button><button type="button" role="menuitem" @click="runContextAction(()=>moveSelectedLayer('up'))">Subir</button><button type="button" role="menuitem" @click="runContextAction(()=>moveSelectedLayer('down'))">Bajar</button><button type="button" role="menuitem" @click="runContextAction(()=>moveSelectedLayer('back'))">Enviar al fondo</button></section>
        <section><span>Alineación en la página</span><button type="button" role="menuitem" @click="runContextAction(()=>alignSelected('left'))">Izquierda</button><button type="button" role="menuitem" @click="runContextAction(()=>alignSelected('center'))">Centro</button><button type="button" role="menuitem" @click="runContextAction(()=>alignSelected('right'))">Derecha</button></section>
        <section><span>Alineación entre objetos</span><button type="button" role="menuitem" :disabled="selectedCount<2" @click="runContextAction(()=>alignSelectedObjects('vertical'))">Borde izquierdo</button><button type="button" role="menuitem" :disabled="selectedCount<2" @click="runContextAction(()=>alignSelectedObjects('horizontal'))">Borde superior</button></section>
        <button type="button" class="context-danger" role="menuitem" @click="runContextAction(deleteSelected)">Eliminar <kbd>Supr</kbd></button>
      </nav>
    </Teleport>
    <BioNexusDialog ref="templateDialog" title="Modelos de comprobante" subtitle="Selecciona un punto de partida. Todos los elementos seguirán siendo editables." size="wide" body-class="template-gallery-body" @close="selectedTemplateId=null">
      <section class="template-gallery" aria-label="Modelos disponibles">
        <button v-for="template in receiptTemplates" :key="template.id" type="button" class="template-card" :class="{selected:selectedTemplateId===template.id}" :aria-pressed="selectedTemplateId===template.id" @click="selectedTemplateId=template.id">
          <span class="template-preview" :class="'template-preview-'+template.id" aria-hidden="true">
            <span v-if="template.id==='blank'" class="preview-paper preview-paper-blank"><i class="preview-empty-mark">+</i></span>
            <span v-else-if="template.id==='classic'" class="preview-paper preview-paper-classic"><i class="preview-logo"></i><i class="preview-heading"></i><i class="preview-meta"></i><i class="preview-table"></i><i class="preview-totals"></i><i class="preview-footer"></i></span>
            <span v-else-if="template.id==='compact'" class="preview-paper preview-paper-compact"><i class="preview-logo"></i><i class="preview-heading"></i><i class="preview-compact-meta"></i><i class="preview-table"></i><i class="preview-totals"></i></span>
            <span v-else class="preview-paper preview-paper-minimal"><i class="preview-minimal-heading"></i><i class="preview-minimal-meta"></i><i class="preview-table"></i><i class="preview-totals"></i></span>
            <span class="preview-chip">{{ template.name }}</span>
          </span>
          <span class="template-card-copy"><strong>{{ template.name }}</strong><small>{{ template.description }}</small><span class="template-card-action">Seleccionar modelo</span></span>
          <BioNexusIcon v-if="selectedTemplateId===template.id" class="template-selected-icon" name="check_circle" :size="22" />
        </button>
      </section>
      <p v-if="dirty" class="template-warning">Aplicar un modelo reemplazará los elementos actuales. El cambio podrá deshacerse con Ctrl+Z.</p>
      <template #footer>
        <BioNexusActionButton variant="secondary" @click="templateDialog?.close()">Cancelar</BioNexusActionButton>
        <BioNexusActionButton variant="primary" icon="check" :disabled="!selectedTemplateId" @click="applySelectedTemplate">Aplicar modelo</BioNexusActionButton>
      </template>
    </BioNexusDialog>
    <BioNexusConfirmDialog ref="clearConfirmDialog" />
    <DesignerTextPropertiesDialog ref="textPropertiesDialog" :tokens="tokenCatalog" @apply="applyTextProperties" /><DesignerTablePropertiesDialog ref="tablePropertiesDialog" :tokens="tokenCatalog" @apply="applyTableProperties" /><BioNexusConfirmDialog ref="discardChangesDialog" />
  <DesignerExamTablePropertiesDialog ref="examTablePropertiesDialog" :exam-field-options="examFieldOptions" :total-field-options="totalFieldOptions" @apply="applyExamTableProperties" />
</main>
</template>

<script setup>
import DesignerExamTablePropertiesDialog from '@/components/documents/designer/DesignerExamTablePropertiesDialog.vue';
import { onBeforeRouteLeave, useRoute } from "vue-router";
import { computed,nextTick,onBeforeUnmount,onMounted,ref } from "vue";
import Konva from "konva";
import BioNexusActionButton from "@/components/ui/BioNexusActionButton.vue";
import BioNexusIcon from "@/components/ui/BioNexusIcon.vue";
import BioNexusSearchableSelect from "@/components/ui/BioNexusSearchableSelect.vue";
import BioNexusFormField from "@/components/ui/BioNexusFormField.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
import BioNexusConfirmDialog from "@/components/ui/BioNexusConfirmDialog.vue";
import BioNexusDocumentPreview from "@/components/documents/BioNexusDocumentPreview.vue";import DesignerTextPropertiesDialog from "@/components/documents/designer/DesignerTextPropertiesDialog.vue";import DesignerTablePropertiesDialog from "@/components/documents/designer/DesignerTablePropertiesDialog.vue";import GenericTablePropertiesPanel from "@/components/documents/designer/GenericTablePropertiesPanel.vue";import{createGenericTable,genericTableCellGeometry,genericTableSize,normalizeGenericTable,resizeGenericTable}from"@/components/documents/designer/genericTableModel.js";
import { useBioNexusToast } from "@/composables/useBioNexusToast";
import { useAuthorizationStore } from "@/stores/authorization";
import { useDocumentDesignerEngine } from "@/components/documents/designer/useDocumentDesignerEngine.js";
import { getLaboratory } from "@/services/laboratoryService";
import { laboratoryDocumentContext, laboratoryLogoUrl, resolveDocumentTokens } from "@/components/documents/designer/documentPreviewContext.js";
import { richTextPlainText } from "@/components/documents/designer/richTextContent.js";
import { patientReceiptDocumentAdapter } from "@/components/documents/designer/adapters/patientReceiptDocumentAdapter.js";

const route = useRoute();
const documentId = Number(route.params.documentId);

const MM_TO_PX=96/25.4;const PX_PER_MM=MM_TO_PX;const MIN_ZOOM=.25,MAX_ZOOM=4,PREVIEW_ZOOM_STEP=.1;
const DOCUMENT_TYPE=patientReceiptDocumentAdapter.documentType;
const documentSchemaVersion = 1;
const authorization=useAuthorizationStore();
const toast=useBioNexusToast();
const clearConfirmDialog=ref(null);
const discardChangesDialog=ref(null);
const designerReady=ref(false);
const patientReceiptDesignerUnsavedChanges=true;
const laboratoryId=computed(()=>Number(laboratory.value?.id||1));
const canSaveDraft=computed(()=>authorization.hasPermission("document-definitions.update"));
const pageOptions=Object.freeze([
  {value:"letter",label:"Carta (216 × 279 mm)",width:215.9,height:279.4},
  {value:"legal",label:"Oficio (216 × 356 mm)",width:215.9,height:355.6},
  {value:"a4",label:"A4 (210 × 297 mm)",width:210,height:297},
  {value:"custom",label:"Personalizado",width:180,height:240},
]);
const orientationOptions=Object.freeze([{value:'portrait',label:'Vertical'},{value:'landscape',label:'Horizontal'}]);
const imageFitOptions=Object.freeze([{value:'contain',label:'Contener'},{value:'cover',label:'Cubrir'},{value:'stretch',label:'Estirar'}]);
const lineStyleOptions=Object.freeze([{value:'solid',label:'Sólido'},{value:'dashed',label:'Guiones'},{value:'dotted',label:'Puntos'}]);
const alignmentOptions=Object.freeze([{value:'left',label:'Izquierda'},{value:'center',label:'Centro'},{value:'right',label:'Derecha'}]);
const receiptTemplates=patientReceiptDocumentAdapter.templates;
const examFieldOptions=patientReceiptDocumentAdapter.examFieldOptions;
const totalFieldOptions=patientReceiptDocumentAdapter.totalFieldOptions;
const tokenCatalog=patientReceiptDocumentAdapter.tokenCatalog;
const fonts=["Inter","Arial","Roboto","Courier New","Georgia","Times New Roman"],fontSizes=[8,9,10,11,12,14,16,18,20,24,28,32];
const viewport=ref(null),stageHost=ref(null),richEditor=ref(null),designerRoot=ref(null),templateDialog=ref(null),textPropertiesDialog=ref(null),tablePropertiesDialog=ref(null),examTablePropertiesDialog=ref(null),imageFileInput=ref(null),selectedTemplateId=ref(null),imageFileError=ref(''),laboratory=ref(null),laboratoryLoading=ref(false),laboratoryError=ref(""),extraElements=ref([]),elementSequence=ref(0),pagePreset=ref("letter"),orientation=ref("portrait"),pageWidth=ref(215.9*MM_TO_PX),pageHeight=ref(279.4*MM_TO_PX),pageMargins=ref({top:24,right:24,bottom:24,left:24}),customPageWidth=ref(180),customPageHeight=ref(240),textLineHeight=ref(1.15),textParagraphGap=ref(2),textPadding=ref(5),zoomMode=ref("page"),selectedId=ref(null),selectedIds=ref([]),textEditing=ref(false),textHtml=ref('<p><strong><span class="dynamic-token" data-field="laboratory.name" contenteditable="false">{{laboratory.name}}</span></strong></p><p>RIF: <span class="dynamic-token" data-field="laboratory.rif" contenteditable="false">{{laboratory.rif}}</span></p><p>Teléfono: <span class="dynamic-token" data-field="laboratory.phone1" contenteditable="false">{{laboratory.phone1}}</span></p><p>Dirección: <span class="dynamic-token" data-field="laboratory.address" contenteditable="false">{{laboratory.address}}</span></p><p>Paciente: <span class="dynamic-token" data-field="patient.name" contenteditable="false">{{patient.name}}</span></p><p>Documento: <span class="dynamic-token" data-field="patient.documentNumber" contenteditable="false">{{patient.documentNumber}}</span></p>'),textBox=ref({x:230,y:70,width:480,height:145}),activeFont=ref("Inter"),activeSize=ref(16),selectedToken=ref(null),draggingText=ref(false),dragStart=ref({pointerX:0,pointerY:0,x:0,y:0});
let stage,layer,pageRect,safeAreaRect,logoGroup,logoRect,logoLabel,textHitRect,transformer,resizeObserver,marginTooltip;let marginGuides=[];const extraNodes=new Map();
const textVisible=ref(false);const editorZoomBeforePreview=ref(.75),editorZoomModeBeforePreview=ref("page");
function restoreSnapshot(raw){const value=typeof raw==="string"?JSON.parse(raw):raw;if(!value||value.version !== documentSchemaVersion)return;const migrated=[];if(value.logo)migrated.push(createElementModel("logo",{...value.logo,id:"legacy-logo"}));if(value.text?.html)migrated.push(createElementModel("rich-text",{id:"legacy-text",x:value.text.x,y:value.text.y,width:value.text.width,height:value.text.height,text:String(value.text.html).replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim()}));pagePreset.value=value.page?.preset||"letter";orientation.value=value.page?.orientation||"portrait";pageWidth.value=Number(value.page?.width)||215.9*MM_TO_PX;pageHeight.value=Number(value.page?.height)||279.4*MM_TO_PX;pageMargins.value={...pageMargins.value,...value.page?.margins};textLineHeight.value=Number(value.textSpacing?.lineHeight)||1.15;textParagraphGap.value=Number(value.textSpacing?.paragraphGap)||0;textPadding.value=Number(value.textSpacing?.padding)||5;zoom.value=Number(value.zoom)||.75;textBox.value={...textBox.value,...value.text};textHtml.value=String(value.text?.html||textHtml.value);extraElements.value=[...migrated,...(Array.isArray(value.elements)?value.elements.map(item=>createElementModel(item.type,item)):[])];elementSequence.value=extraElements.value.reduce((max,item)=>Math.max(max,Number(String(item.id).split("-").pop())||0),0);selectedId.value=null;nextTick(()=>{buildStage()})}
const { preview, zoom, busy:versionBusy, documentSnapshot, dirty, canUndo, canRedo, pushHistory, undo, redo, markSaved, loadDocument, saveDocument }=useDocumentDesignerEngine({
  documentId,
  documentType:DOCUMENT_TYPE,
  initialPreview:route.query.preview === "1",
  initialZoom:.75,
  serializeDocument:()=>({version:documentSchemaVersion,page:{preset:pagePreset.value,orientation:orientation.value,width:pageWidth.value,height:pageHeight.value,margins:pageMargins.value},elements:extraElements.value}),
  restoreDocument:raw=>restoreSnapshot(raw),
});
const previewDocumentJson=computed(()=>{try{return JSON.parse(documentSnapshot.value)}catch{return null}});
const hasUnsavedChanges=computed(()=>designerReady.value&&dirty.value);
async function confirmDiscardChanges(){
  if(!hasUnsavedChanges.value)return true;
  return Boolean(await discardChangesDialog.value?.ask({kicker:"Confirmación",title:"Descartar cambios",message:"Hay cambios sin guardar. ¿Deseas salir y descartarlos?",icon:"warning",variant:"danger",confirmIcon:"delete",confirmText:"Sí, salir y descartar cambios",cancelText:"Continuar editando"}));
}
function handleBeforeUnload(event){if(!hasUnsavedChanges.value||versionBusy.value)return;event.preventDefault();event.returnValue=""}
onBeforeRouteLeave(async()=>await confirmDiscardChanges());
const laboratoryPreviewContext=computed(()=>laboratoryDocumentContext(laboratory.value));
const laboratoryPreviewLogoUrl=computed(()=>laboratoryLogoUrl(laboratory.value));
const selectedExtra=computed(()=>extraElements.value.find(item=>item.id===selectedId.value)||null);
const selectedExtras=computed(()=>extraElements.value.filter(item=>selectedIds.value.includes(item.id)));
const selectedCount=computed(()=>selectedIds.value.length);
const selectedElementLabel=computed(()=>selectedExtra.value?elementLabel(selectedExtra.value.type):'Ninguno');const canEditSelectedProperties=computed(()=>['rich-text','generic-table','exam-table'].includes(selectedExtra.value?.type));
const selectedPageLabel=computed(()=>({letter:'Carta',legal:'Oficio',a4:'A4',custom:'Personalizado'})[pagePreset.value]||pagePreset.value);
const selectedLockLabel=computed(()=>selectedExtras.value.length&&selectedExtras.value.every(item=>item.locked)?'Desbloquear':'Bloquear');
const contextMenuElement=ref(null);
const contextMenu=ref({open:false,x:0,y:0});
const canContextGroup=computed(()=>selectedCount.value>=2&&!selectedExtras.value.some(item=>item.locked));
const canContextUngroup=computed(()=>selectedExtra.value?.type==='group'&&!selectedExtra.value.locked);
const tableTotalWidth=computed(()=>selectedExtra.value?.type==='exam-table'?selectedExtra.value.columns.reduce((sum,column)=>sum+(Number(column.width)||0),0):0);
const stageScalerStyle=computed(()=>({width:`${pageWidth.value*zoom.value}px`,height:`${pageHeight.value*zoom.value}px`}));
const textOverlayStyle=computed(()=>({left:`${textBox.value.x*zoom.value}px`,top:`${textBox.value.y*zoom.value}px`,width:`${textBox.value.width*zoom.value}px`,minHeight:`${textBox.value.height*zoom.value}px`,transformOrigin:"top left",fontSize:`${16*zoom.value}px`,lineHeight:String(textLineHeight.value),padding:`${textPadding.value*zoom.value}px`,boxSizing:"border-box","--paragraph-gap":`${textParagraphGap.value*zoom.value}px`}));
function buildStage(){stage?.destroy();extraNodes.clear();stage=new Konva.Stage({container:stageHost.value,width:pageWidth.value,height:pageHeight.value});layer=new Konva.Layer();stage.add(layer);pageRect=new Konva.Rect({x:0,y:0,width:pageWidth.value,height:pageHeight.value,fill:"#fff",shadowColor:"#223b57",shadowBlur:18,shadowOpacity:.16});layer.add(pageRect);safeAreaRect=new Konva.Rect({x:pageMargins.value.left,y:pageMargins.value.top,width:Math.max(1,pageWidth.value-pageMargins.value.left-pageMargins.value.right),height:Math.max(1,pageHeight.value-pageMargins.value.top-pageMargins.value.bottom),stroke:'#f1722c',strokeWidth:1.5,dash:[8,6],fill:'rgba(241,114,44,.035)',listening:false,name:'safe-area-guide'});layer.add(safeAreaRect);createMarginGuides();stage.on('pointerdown',event=>{if(event.target===stage||event.target===pageRect)clearSelection()});stage.on('contextmenu',event=>{event.evt?.preventDefault();if(event.target===stage||event.target===pageRect)closeContextMenu()});transformer=new Konva.Transformer({rotateEnabled:false,keepRatio:false,anchorSize:10,borderStroke:'#f1722c',borderStrokeWidth:2,anchorStroke:'#f1722c',anchorFill:'#fff',anchorCornerRadius:2,enabledAnchors:['top-left','top-center','top-right','middle-left','middle-right','bottom-left','bottom-center','bottom-right'],boundBoxFunc:(oldBox,newBox)=>constrainTransformBox(oldBox,newBox)});layer.add(transformer);

extraElements.value.forEach(renderExtraElement);selectElement(selectedId.value);textVisible.value=false;layer.draw()}
const marginGuideCursor=Object.freeze({left:'ew-resize',right:'ew-resize',top:'ns-resize',bottom:'ns-resize'});
function marginLimit(side){const horizontal=side==='left'||side==='right',pageSize=horizontal?pageWidth.value:pageHeight.value,opposite=horizontal?(side==='left'?pageMargins.value.right:pageMargins.value.left):(side==='top'?pageMargins.value.bottom:pageMargins.value.top);return Math.max(0,Math.min(50*PX_PER_MM,pageSize-opposite-24))}
function marginPosition(side){if(side==='left')return pageMargins.value.left;if(side==='right')return pageWidth.value-pageMargins.value.right;if(side==='top')return pageMargins.value.top;return pageHeight.value-pageMargins.value.bottom}
function marginFromPosition(side,position){return side==='right'?pageWidth.value-position:side==='bottom'?pageHeight.value-position:position}
function marginGuidePoints(side){const left=pageMargins.value.left,top=pageMargins.value.top,right=pageWidth.value-pageMargins.value.right,bottom=pageHeight.value-pageMargins.value.bottom;return side==='left'||side==='right'?[0,top,0,bottom]:[left,0,right,0]}
function showMarginTooltip(side,node){if(!marginTooltip)return;const value=(pageMargins.value[side]/PX_PER_MM).toFixed(1)+' mm';marginTooltip.text(value);marginTooltip.visible(true);if(side==='left'||side==='right')marginTooltip.position({x:Math.max(4,node.x()+7),y:Math.max(4,pageMargins.value.top+7)});else marginTooltip.position({x:Math.max(4,pageMargins.value.left+7),y:Math.max(4,node.y()+7)});marginTooltip.moveToTop();layer?.batchDraw()}
function updateMarginFromGuide(side,node){const position=side==='left'||side==='right'?node.x():node.y(),value=Math.max(0,Math.min(marginLimit(side),marginFromPosition(side,position)));pageMargins.value={...pageMargins.value,[side]:value};updateSafeAreaGuide();showMarginTooltip(side,node)}
function finishMarginDrag(side,node){updateMarginFromGuide(side,node);marginTooltip?.visible(false);applyMargins()}
function createMarginGuides(){marginGuides=[];for(const side of ['left','right','top','bottom']){const vertical=side==='left'||side==='right',guide=new Konva.Line({name:'margin-guide-'+side,points:marginGuidePoints(side),x:vertical?marginPosition(side):0,y:vertical?0:marginPosition(side),stroke:'#2f7598',strokeWidth:1.2,dash:[6,4],hitStrokeWidth:14,draggable:true,dragBoundFunc:position=>vertical?{x:Math.max(side==='right'?pageWidth.value-marginLimit(side):0,Math.min(side==='right'?pageWidth.value:marginLimit(side),position.x)),y:0}:{x:0,y:Math.max(side==='bottom'?pageHeight.value-marginLimit(side):0,Math.min(side==='bottom'?pageHeight.value:marginLimit(side),position.y))}});guide.on('mouseenter',()=>{stage.container().style.cursor=marginGuideCursor[side];guide.stroke('#f1722c');layer.batchDraw()});guide.on('mouseleave',()=>{stage.container().style.cursor='default';guide.stroke('#2f7598');layer.batchDraw()});guide.on('dragstart',()=>showMarginTooltip(side,guide));guide.on('dragmove',()=>updateMarginFromGuide(side,guide));guide.on('dragend',()=>finishMarginDrag(side,guide));marginGuides.push(guide);layer.add(guide)}marginTooltip=new Konva.Text({text:'',visible:false,padding:5,fill:'#17445d',fontFamily:'Inter',fontSize:12,fontStyle:'bold',listening:false});layer.add(marginTooltip);updateSafeAreaGuide()}function normalizePageMargins(){const horizontalLimit=Math.max(0,(pageWidth.value-24)/2),verticalLimit=Math.max(0,(pageHeight.value-24)/2);pageMargins.value={top:Math.min(120,verticalLimit,Math.max(0,Number(pageMargins.value.top)||0)),right:Math.min(120,horizontalLimit,Math.max(0,Number(pageMargins.value.right)||0)),bottom:Math.min(120,verticalLimit,Math.max(0,Number(pageMargins.value.bottom)||0)),left:Math.min(120,horizontalLimit,Math.max(0,Number(pageMargins.value.left)||0))}}
function updateSafeAreaGuide(){if(!safeAreaRect)return;safeAreaRect.setAttrs({x:pageMargins.value.left,y:pageMargins.value.top,width:Math.max(1,pageWidth.value-pageMargins.value.left-pageMargins.value.right),height:Math.max(1,pageHeight.value-pageMargins.value.top-pageMargins.value.bottom),visible:!preview.value});safeAreaRect.moveToTop();for(const guide of marginGuides){const side=String(guide.name()).replace('margin-guide-',''),vertical=side==='left'||side==='right';guide.points(marginGuidePoints(side));guide.position({x:vertical?marginPosition(side):0,y:vertical?0:marginPosition(side)});guide.visible(!preview.value);guide.moveToTop()}marginTooltip?.moveToTop();transformer?.moveToTop();layer?.batchDraw()}
function constrainTransformBox(oldBox,newBox,options={}){const separator=Boolean(options.separator),minWidth=separator?4:24,minHeight=separator?0:24,safeLeft=pageMargins.value.left,safeTop=pageMargins.value.top,safeRight=pageWidth.value-pageMargins.value.right,safeBottom=pageHeight.value-pageMargins.value.bottom,left=Math.max(safeLeft,newBox.x),right=Math.min(safeRight,newBox.x+newBox.width),top=separator?newBox.y:Math.max(safeTop,newBox.y),bottom=separator?newBox.y+newBox.height:Math.min(safeBottom,newBox.y+newBox.height),width=right-left,height=bottom-top;if(width<minWidth||(!separator&&height<minHeight))return oldBox;return{x:left,y:top,width,height,rotation:0}}function safeBounds(width,height){return{minX:pageMargins.value.left,minY:pageMargins.value.top,maxX:Math.max(pageMargins.value.left,pageWidth.value-pageMargins.value.right-width),maxY:Math.max(pageMargins.value.top,pageHeight.value-pageMargins.value.bottom-height)}}function clampNodeToMargins(node,width=node.width?.()||0,height=node.height?.()||0){const bounds=safeBounds(width*node.scaleX(),height*node.scaleY());node.position({x:Math.max(bounds.minX,Math.min(bounds.maxX,node.x())),y:Math.max(bounds.minY,Math.min(bounds.maxY,node.y()))})}const marginMm=computed(()=>({top:Number((pageMargins.value.top/PX_PER_MM).toFixed(1)),right:Number((pageMargins.value.right/PX_PER_MM).toFixed(1)),bottom:Number((pageMargins.value.bottom/PX_PER_MM).toFixed(1)),left:Number((pageMargins.value.left/PX_PER_MM).toFixed(1))}));
function updateMarginMm(side,event){const value=Math.max(0,Math.min(50,Number(event?.target?.value)||0));pageMargins.value={...pageMargins.value,[side]:value*PX_PER_MM};applyMargins()}
function fitContentToSafeArea(){
  const entries=[...extraNodes.entries()].map(([id,node])=>({node,model:extraElements.value.find(item=>item.id===id)})).filter(entry=>entry.model&&entry.node?.isVisible());
  if(!entries.length)return;
  const getBounds=()=>entries.map(entry=>entry.node.getClientRect({relativeTo:layer,skipShadow:true,skipStroke:false})).reduce((result,box)=>({x:Math.min(result.x,box.x),y:Math.min(result.y,box.y),right:Math.max(result.right,box.x+box.width),bottom:Math.max(result.bottom,box.y+box.height)}),{x:Infinity,y:Infinity,right:-Infinity,bottom:-Infinity});
  const safeLeft=pageMargins.value.left,safeTop=pageMargins.value.top,safeRight=pageWidth.value-pageMargins.value.right,safeBottom=pageHeight.value-pageMargins.value.bottom,safeWidth=Math.max(1,safeRight-safeLeft),safeHeight=Math.max(1,safeBottom-safeTop);
  let bounds=getBounds();
  const contentWidth=bounds.right-bounds.x;
  if(contentWidth>safeWidth){
    const ratio=safeWidth/contentWidth;
    entries.forEach(({node,model})=>{node.x(safeLeft+(node.x()-bounds.x)*ratio);node.scaleX(node.scaleX()*ratio);model.x=node.x();model.scaleX=node.scaleX()});
    bounds=getBounds();
  }
  let dx=0,dy=0;
  if(bounds.x<safeLeft)dx=safeLeft-bounds.x;else if(bounds.right>safeRight)dx=safeRight-bounds.right;
  const contentHeight=bounds.bottom-bounds.y;
  if(contentHeight<=safeHeight){if(bounds.y<safeTop)dy=safeTop-bounds.y;else if(bounds.bottom>safeBottom)dy=safeBottom-bounds.bottom}else dy=safeTop-bounds.y;
  if(dx!==0||dy!==0)entries.forEach(({node,model})=>{node.position({x:node.x()+dx,y:node.y()+dy});model.x=node.x();model.y=node.y()});
  transformer?.forceUpdate();layer?.batchDraw();
}function applyMargins(){normalizePageMargins();updateSafeAreaGuide();fitContentToSafeArea();refreshTransformerSelection();layer?.batchDraw();pushHistory()}function wireNode(node,id){node.dragBoundFunc(pos=>{const width=id==="logo"?logoRect.width():textBox.value.width,height=id==="logo"?logoRect.height():textBox.value.height,bounds=safeBounds(width,height);return{x:Math.max(bounds.minX,Math.min(bounds.maxX,pos.x)),y:Math.max(bounds.minY,Math.min(bounds.maxY,pos.y))}});node.on("pointerdown",()=>selectElement(id));node.on("dragmove transform",()=>syncNode(id,node));node.on("dblclick dbltap",()=>{if(id==="text")beginTextEdit()})}
function syncNode(id,node){if(id==="text"){const scaleX=node.scaleX(),scaleY=node.scaleY();textBox.value={x:node.x(),y:node.y(),width:Math.max(120,node.width()*scaleX),height:Math.max(60,node.height()*scaleY)};node.width(textBox.value.width);node.height(textBox.value.height);node.scale({x:1,y:1})}else{const width=Math.max(40,logoRect.width()*node.scaleX()),height=Math.max(30,logoRect.height()*node.scaleY());logoRect.size({width,height});logoLabel.size({width,height});node.scale({x:1,y:1})}layer.batchDraw()}
function clearSelection(){selectedId.value=null;selectedIds.value=[];if(transformer){transformer.nodes([]);transformer.visible(false)}layer?.batchDraw()}
function refreshTransformerSelection(){if(!transformer)return;const nodes=selectedIds.value.map(id=>extraNodes.get(id)).filter(node=>node&&!node.getAttr('locked'));if(!nodes.length){transformer.nodes([]);transformer.visible(false);layer.batchDraw();return}const singleType=nodes.length===1?selectedExtras.value[0]?.type:null,isSingleSeparator=singleType==='separator',isSingleGroup=singleType==='group';transformer.visible(true);transformer.enabledAnchors(isSingleGroup?[]:isSingleSeparator?['middle-left','middle-right']:['top-left','top-center','top-right','middle-left','middle-right','bottom-left','bottom-center','bottom-right']);transformer.keepRatio(false);transformer.rotateEnabled(!isSingleSeparator&&!isSingleGroup);transformer.flipEnabled(false);transformer.boundBoxFunc((oldBox,newBox)=>isSingleGroup?oldBox:constrainTransformBox(oldBox,newBox,{separator:isSingleSeparator}));transformer.nodes(nodes);transformer.forceUpdate();transformer.moveToTop();layer.batchDraw()}
function selectElement(id,toggle=false){if(!id){clearSelection();return}if(toggle){selectedIds.value=selectedIds.value.includes(id)?selectedIds.value.filter(value=>value!==id):[...selectedIds.value,id]}else selectedIds.value=[id];selectedId.value=selectedIds.value.length?selectedIds.value[selectedIds.value.length-1]:null;refreshTransformerSelection()}
function elementLabel(type){return({'exam-table':'Detalle de exámenes','generic-table':'Tabla libre','rich-text':'Texto libre',logo:'Logo dinámico',qr:'Código QR',separator:'Separador',rectangle:'Rectángulo',image:'Imagen',group:'Grupo'})[type]||'Elemento'}
function textTemplate(text,x,y,width,height=76,fontSize=12){return createElementModel('rich-text',{text,x,y,width,height,fontSize,lineHeight:1.15,padding:6})}
function templateElements(id){const left=pageMargins.value.left,top=pageMargins.value.top,safeWidth=pageWidth.value-pageMargins.value.left-pageMargins.value.right;if(id==='blank')return[];if(id==='classic')return[createElementModel('logo',{x:left,y:top,width:130,height:85}),textTemplate('{{laboratory.name}}\nRIF: {{laboratory.rif}}\n{{laboratory.address}}',left+150,top,safeWidth-150,85,13),textTemplate('Paciente: {{patient.name}}\nDocumento: {{patient.documentNumber}}\nComprobante: {{document.number}} · {{document.date}}',left,top+105,safeWidth,70,12),createElementModel('exam-table',{x:left,y:top+195,width:safeWidth}),textTemplate('Gracias por su preferencia.',left,top+520,safeWidth,45,11)];if(id==='compact')return[createElementModel('logo',{x:left,y:top,width:96,height:60}),textTemplate('{{laboratory.name}} · RIF {{laboratory.rif}}\nPaciente: {{patient.name}} · {{patient.documentNumber}}',left+110,top,safeWidth-110,60,11),createElementModel('exam-table',{x:left,y:top+82,width:safeWidth,columns:[{id:'name',title:'Examen',field:'name',width:Math.max(180,safeWidth-300),align:'left'},{id:'quantity',title:'Cant.',field:'quantity',width:55,align:'center'},{id:'unitPrice',title:'Precio',field:'unitPrice',width:80,align:'right'},{id:'taxTotal',title:'Imp.',field:'taxTotal',width:70,align:'right'},{id:'total',title:'Total',field:'total',width:90,align:'right'}]})];if(id==='minimal')return[textTemplate('{{laboratory.name}}',left,top,safeWidth,42,16),textTemplate('Paciente: {{patient.name}} · Documento: {{patient.documentNumber}}\nComprobante: {{document.number}} · {{document.date}}',left,top+55,safeWidth,55,11),createElementModel('exam-table',{x:left,y:top+125,width:safeWidth,columns:[{id:'name',title:'Examen o servicio',field:'name',width:Math.max(220,safeWidth-230),align:'left'},{id:'quantity',title:'Cant.',field:'quantity',width:55,align:'center'},{id:'unitPrice',title:'Precio',field:'unitPrice',width:80,align:'right'},{id:'total',title:'Total',field:'total',width:95,align:'right'}]})];return[]}
function openTemplateGallery(){selectedTemplateId.value=null;templateDialog.value?.open()}
function applySelectedTemplate(){const id=selectedTemplateId.value;if(!id)return;pushHistory();if(id!=='blank'){pagePreset.value=id==='minimal'?'a4':'letter';orientation.value='portrait';applyPagePreset(pagePreset.value)}nextTick(()=>{extraElements.value=templateElements(id);selectedId.value=null;buildStage();fitPage();pushHistory()});templateDialog.value?.close()}
function defaultExamColumns(){return[{id:'code',title:'Código',field:'code',width:80,align:'left'},{id:'name',title:'Examen o servicio',field:'name',width:220,align:'left'},{id:'quantity',title:'Cant.',field:'quantity',width:60,align:'center'},{id:'unitPrice',title:'Precio',field:'unitPrice',width:90,align:'right'},{id:'taxRate',title:'Impuesto %',field:'taxRate',width:90,align:'right'},{id:'taxTotal',title:'Impuesto',field:'taxTotal',width:90,align:'right'},{id:'total',title:'Total',field:'total',width:90,align:'right'}]}
function defaultTotalRows(){return[{id:'subtotal',enabled:true,label:'Subtotal',field:'subtotal',bold:false},{id:'discount',enabled:false,label:'Descuento',field:'discount',bold:false},{id:'otherCharges',enabled:false,label:'Otros cargos',field:'otherCharges',bold:false},{id:'taxTotal',enabled:true,label:'Impuestos',field:'taxTotal',bold:false},{id:'grandTotal',enabled:true,label:'Total general',field:'grandTotal',bold:true}]}
function normalizeColumns(columns){const source=Array.isArray(columns)&&columns.length?columns:defaultExamColumns();return source.map((column,index)=>({id:String(column.id||('column-'+index)),title:String(column.title||'Columna'),field:String(column.field||'name'),width:Math.max(40,Number(column.width)||100),align:['left','center','right'].includes(column.align)?column.align:'left'}))}
function validHex(value){return /^#[0-9a-f]{6}$/i.test(String(value||''))}
function clampPercent(value,fallback){const number=Number(value);return Number.isFinite(number)?Math.max(0,Math.min(100,number)):fallback}
function normalizeLineStyle(value){return ['solid','dashed','dotted'].includes(value)?value:'solid'}
function lineDash(style){return style==='dashed'?[10,6]:style==='dotted'?[2,5]:[]}
function hexToRgba(hex,opacity){const value=validHex(hex)?hex:'#000000',r=parseInt(value.slice(1,3),16),g=parseInt(value.slice(3,5),16),b=parseInt(value.slice(5,7),16);return 'rgba('+r+','+g+','+b+','+(clampPercent(opacity,100)/100)+')'}
function createElementModel(type,overrides={}){const id=overrides.id||("element-"+(++elementSequence.value));const base={id,type,x:overrides.x??pageMargins.value.left,y:overrides.y??pageMargins.value.top,width:overrides.width??(type==='separator'?420:type==='qr'?110:type==='exam-table'?490:type==='generic-table'?160:type==='logo'?140:260),height:overrides.height??(type==='separator'?4:type==='exam-table'?190:type==='generic-table'?56:type==='qr'?110:type==='logo'?100:90),locked:Boolean(overrides.locked),z:overrides.z??extraElements.value.length,...overrides,id,type};if(type==='generic-table'){base.table=normalizeGenericTable(overrides.table||createGenericTable());const size=genericTableSize(base.table);base.width=size.width;base.height=size.height}if(type==='exam-table'){base.columns=normalizeColumns(overrides.columns);base.showHeader=overrides.showHeader!==false;base.showBorders=overrides.showBorders!==false;base.rowHeight=Math.max(20,Number(overrides.rowHeight)||30);base.totalRows=Array.isArray(overrides.totalRows)&&overrides.totalRows.length?overrides.totalRows:defaultTotalRows();base.styles={header:{background:'#eaf1f5',textColor:'#263238',fontFamily:'Inter',fontSize:12,bold:true,borderColor:'#78909c',borderWidth:1},body:{background:'#ffffff',alternateBackground:'#f8fbfd',textColor:'#263238',fontFamily:'Inter',fontSize:11,borderColor:'#cfd8dc',borderWidth:1},totals:{background:'#ffffff',grandTotalBackground:'#eaf1f5',textColor:'#263238',fontFamily:'Inter',fontSize:11,borderColor:'#cfd8dc',borderWidth:1},outer:{background:'#ffffff',borderColor:'#78909c',borderWidth:1},...(overrides.styles||{})}}if(type==='rich-text'){base.text=String(overrides.text??'');base.html=String(overrides.html||'');base.fontFamily=overrides.fontFamily||'Inter';base.fontSize=Math.max(8,Number(overrides.fontSize)||14);base.textColor=overrides.textColor||'#263238';base.backgroundColor=overrides.backgroundColor||'#ffffff';base.bold=Boolean(overrides.bold);base.italic=Boolean(overrides.italic);base.underline=Boolean(overrides.underline);base.align=overrides.align||'left';base.lineHeight=Math.max(.8,Number(overrides.lineHeight)||1.2);base.paragraphGap=Math.max(0,Number(overrides.paragraphGap)||0);base.padding=Math.max(0,Number(overrides.padding)||8)}if(type==='image'){base.src=String(overrides.src||'');base.fileName=String(overrides.fileName||'');base.alt=String(overrides.alt||'');base.fit=['contain','cover','stretch'].includes(overrides.fit)?overrides.fit:'contain';base.borderWidth=Math.max(0,Number(overrides.borderWidth)||0);base.strokeColor=validHex(overrides.strokeColor)?overrides.strokeColor:'#78909c';base.cornerRadius=Math.max(0,Number(overrides.cornerRadius)||0);base.opacity=clampPercent(overrides.opacity,100);base.lineStyle=normalizeLineStyle(overrides.lineStyle)}if(type==='rectangle'){base.fillColor=validHex(overrides.fillColor)?overrides.fillColor:'#eaf1f5';base.fillOpacity=clampPercent(overrides.fillOpacity,100);base.strokeColor=validHex(overrides.strokeColor)?overrides.strokeColor:'#78909c';base.borderWidth=Math.max(0,Number(overrides.borderWidth)??1);base.cornerRadius=Math.max(0,Number(overrides.cornerRadius)||0);base.opacity=clampPercent(overrides.opacity,100);base.lineStyle=normalizeLineStyle(overrides.lineStyle)}if(type==='separator'){base.strokeColor=validHex(overrides.strokeColor)?overrides.strokeColor:'#34495e';base.borderWidth=Math.max(1,Number(overrides.borderWidth)||2);base.opacity=clampPercent(overrides.opacity,100);base.lineStyle=normalizeLineStyle(overrides.lineStyle)}if(type==='group'){base.children=Array.isArray(overrides.children)?clonePlain(overrides.children):[];base.width=Math.max(4,Number(overrides.width)||4);base.height=Math.max(4,Number(overrides.height)||4)}return base}
function createLaboratoryLogoNode(model){const group=new Konva.Group({id:model.id,width:model.width,height:model.height}),background=new Konva.Rect({width:model.width,height:model.height,fill:'#f5f9fb',stroke:'#9fb8c6',dash:[7,5],cornerRadius:4});group.add(background);const src=laboratoryPreviewLogoUrl.value;if(!src){group.add(new Konva.Text({text:'Logo no configurado',width:model.width,height:model.height,align:'center',verticalAlign:'middle',fontFamily:'Inter',fontSize:13,fill:'#526a7a'}));return group}const image=new Image();image.onload=()=>{const ratio=Math.min(model.width/image.width,model.height/image.height),width=image.width*ratio,height=image.height*ratio;group.add(new Konva.Image({image,x:(model.width-width)/2,y:(model.height-height)/2,width,height,listening:false}));background.dash([]);layer?.batchDraw()};image.onerror=()=>{group.add(new Konva.Text({text:'Logo no disponible',width:model.width,height:model.height,align:'center',verticalAlign:'middle',fontSize:12,fill:'#c0392b'}));layer?.batchDraw()};image.src=src;return group}
function createImageNode(model){
  const group=new Konva.Group({id:model.id,width:model.width,height:model.height,opacity:model.opacity/100});
  const background=new Konva.Rect({width:model.width,height:model.height,fill:model.src?'rgba(255,255,255,.01)':'#f5f9fb',cornerRadius:model.cornerRadius,listening:true});
  const content=new Konva.Group({clipX:0,clipY:0,clipWidth:model.width,clipHeight:model.height,listening:false});
  const border=new Konva.Rect({width:model.width,height:model.height,fill:'transparent',stroke:model.borderWidth?model.strokeColor:'transparent',strokeWidth:model.borderWidth,dash:lineDash(model.lineStyle),cornerRadius:model.cornerRadius,listening:false});
  group.add(background);group.add(content);
  if(!model.src){content.add(new Konva.Text({text:'Selecciona una imagen',width:model.width,height:model.height,align:'center',verticalAlign:'middle',fontSize:14,fill:'#607d8b',listening:false}));group.add(border);return group}
  const image=new Image();
  image.onload=()=>{let x=0,y=0,width=model.width,height=model.height;if(model.fit!=='stretch'){const ratio=model.fit==='cover'?Math.max(model.width/image.width,model.height/image.height):Math.min(model.width/image.width,model.height/image.height);width=image.width*ratio;height=image.height*ratio;x=(model.width-width)/2;y=(model.height-height)/2}content.destroyChildren();content.add(new Konva.Image({image,x,y,width,height,listening:false}));layer?.batchDraw()};
  image.onerror=()=>{content.destroyChildren();content.add(new Konva.Text({text:'No fue posible mostrar la imagen',width:model.width,height:model.height,align:'center',verticalAlign:'middle',fontSize:13,fill:'#c0392b',listening:false}));layer?.batchDraw()};
  image.src=model.src;group.add(border);return group
}
function renderExtraElement(model){let node;if(model.type==='group'){node=new Konva.Group({id:model.id,width:model.width,height:model.height});for(const child of model.children){const childModel=createElementModel(child.type,{...clonePlain(child),id:child.id,x:child.x,y:child.y});renderExtraElement(childModel);const childNode=extraNodes.get(child.id);if(!childNode)continue;childNode.off();childNode.draggable(false);childNode.listening(true);childNode.position({x:child.x,y:child.y});childNode.moveTo(node);extraNodes.delete(child.id)}}else if(model.type==='separator')node=new Konva.Line({id:model.id,points:[0,0,model.width,0],stroke:model.strokeColor,strokeWidth:model.borderWidth,dash:lineDash(model.lineStyle),opacity:model.opacity/100});else if(model.type==='qr'){node=new Konva.Group({id:model.id});node.add(new Konva.Rect({width:model.width,height:model.height,fill:'#fff',stroke:'#34495e'}),new Konva.Text({text:'QR',width:model.width,height:model.height,align:'center',verticalAlign:'middle',fontSize:28,fill:'#34495e'}))}else if(model.type==='exam-table'){node=createExamTableNode(model)}else if(model.type==='generic-table'){node=createGenericTableNode(model)}else if(model.type==='rich-text'){node=createRichTextNode(model)}else if(model.type==='logo')node=createLaboratoryLogoNode(model);else if(model.type==='image'){node=createImageNode(model)}else{node=new Konva.Rect({id:model.id,width:model.width,height:model.height,fill:hexToRgba(model.fillColor,model.fillOpacity),stroke:model.strokeColor,strokeWidth:model.borderWidth,dash:lineDash(model.lineStyle),cornerRadius:model.cornerRadius,opacity:model.opacity/100})}node.position({x:model.x,y:model.y});node.dragBoundFunc(pos=>{const bounds=safeBounds(model.width,model.height);return{x:Math.max(bounds.minX,Math.min(bounds.maxX,pos.x)),y:Math.max(bounds.minY,Math.min(bounds.maxY,pos.y))}});node.draggable(!model.locked);node.setAttr('locked',model.locked);node.on('dblclick dbltap',()=>{if(model.type==='rich-text'||model.type==='generic-table'||model.type==='exam-table'){selectElement(model.id);openSelectedProperties()}});node.on('pointerdown',event=>{event.cancelBubble=true;const source=event.evt;if(source?.button===2&&selectedIds.value.includes(model.id))return;selectElement(model.id,Boolean(source?.shiftKey||source?.ctrlKey||source?.metaKey))});node.on('contextmenu',event=>{event.evt?.preventDefault();event.cancelBubble=true;openContextMenu(event.evt,model.id)});node.on('transformstart',()=>transformer?.moveToTop());node.on('dragend transformend',()=>syncExtraModel(model.id,node));extraNodes.set(model.id,node);layer.add(node);transformer?.moveToTop()}
function examSampleRows(){return patientReceiptDocumentAdapter.sampleExamRows}
function receiptSummary(){return patientReceiptDocumentAdapter.sampleSummary}
function richTextRuns(html,text,context,defaults={}){
  if(!html)return[{...defaults,text:resolveDocumentTokens(text||'',context)}];
  const documentValue=new DOMParser().parseFromString(String(html),'text/html'),runs=[];
  function visit(node,style={...defaults}){
    if(node.nodeType===Node.TEXT_NODE){const value=resolveDocumentTokens(node.textContent||'',context);if(value)runs.push({...style,text:value});return}
    if(node.nodeType!==Node.ELEMENT_NODE)return;
    if(node.tagName==='BR'){runs.push({...style,text:'\n'});return}
    const css=node.style||{},computed={...style};
    const weight=String(css.fontWeight||'').toLowerCase(),decoration=String(css.textDecoration||'').toLowerCase();
    computed.bold=style.bold||node.tagName==='B'||node.tagName==='STRONG'||weight==='bold'||Number(weight)>=600;
    computed.italic=style.italic||node.tagName==='I'||node.tagName==='EM'||String(css.fontStyle||'').toLowerCase()==='italic';
    computed.underline=style.underline||node.tagName==='U'||decoration.includes('underline')||String(css.textDecorationLine||'').toLowerCase().includes('underline');
    computed.fontFamily=css.fontFamily||style.fontFamily;
    computed.fontSize=parseFloat(css.fontSize)||style.fontSize;
    computed.color=css.color||style.color;
    computed.backgroundColor=css.backgroundColor||style.backgroundColor;
    computed.align=css.textAlign||style.align;
    computed.lineHeight=parseFloat(css.lineHeight)||style.lineHeight;

    const block=node.tagName==='DIV'||node.tagName==='P',before=runs.length;
    if(block&&before>0&&!String(runs[runs.length-1].text).endsWith('\n'))runs.push({...computed,text:'\n'});
    node.childNodes.forEach(child=>visit(child,computed));
    if(block&&runs.length>before&&!String(runs[runs.length-1].text).endsWith('\n'))runs.push({...computed,text:'\n'});
  }
  documentValue.body.childNodes.forEach(node=>visit(node,{...defaults}));
  if(runs.length&&runs[runs.length-1].text==='\n')runs.pop();
  return runs;
}
function createRichTextNode(model){
  const group=new Konva.Group({id:model.id,width:model.width,height:model.height});
  group.add(new Konva.Rect({width:model.width,height:model.height,fill:model.backgroundColor||'#ffffff',stroke:'#9fb8c6',dash:[5,4]}));
  const defaults={fontFamily:model.fontFamily||'Inter',fontSize:Number(model.fontSize)||14,color:model.textColor||'#263238',backgroundColor:'transparent',bold:Boolean(model.bold),italic:Boolean(model.italic),underline:Boolean(model.underline),align:model.align||'left',lineHeight:Number(model.lineHeight)||1.2};
  const runs=richTextRuns(model.html,model.text,laboratoryPreviewContext.value,defaults),maximumWidth=Math.max(20,model.width-model.padding*2),maximumHeight=Math.max(20,model.height-model.padding*2),lines=[];
  let line={items:[],width:0,height:0,align:'left'};
  const commitLine=()=>{lines.push(line);line={items:[],width:0,height:0,align:'left'}};
  const measure=item=>{const probe=new Konva.Text({text:item.text,fontFamily:item.fontFamily,fontSize:item.fontSize,fontStyle:(item.bold?'bold ':'')+(item.italic?'italic':''),lineHeight:item.lineHeight,padding:0});return Math.max(.5,probe.width())};
  for(const run of runs){
    const pieces=String(run.text).split(/(\n|\s+)/);
    for(const piece of pieces){
      if(!piece)continue;
      if(piece==='\n'){commitLine();continue}
      const item={...run,text:piece};
      item.width=measure(item);item.height=Math.max(1,item.fontSize*item.lineHeight);
      if(line.items.length&&line.width+item.width>maximumWidth)commitLine();
      line.items.push(item);line.width+=item.width;line.height=Math.max(line.height,item.height);line.align=item.align||line.align;
    }
  }
  if(line.items.length||!lines.length)commitLine();
  let y=Number(model.padding)||0;
  for(const current of lines){
    if(y+current.height>(Number(model.padding)||0)+maximumHeight)break;
    let x=Number(model.padding)||0;
    if(current.align==='center')x+=Math.max(0,(maximumWidth-current.width)/2);
    else if(current.align==='right')x+=Math.max(0,maximumWidth-current.width);
    const spaces=current.items.filter(item=>/^\s+$/.test(item.text)).length;
    const justifyExtra=current.align==='justify'&&spaces?Math.max(0,(maximumWidth-current.width)/spaces):0;
    for(const item of current.items){
      const background=String(item.backgroundColor||'').toLowerCase();
      if(background&&background!=='transparent'&&background!=='rgba(0, 0, 0, 0)')group.add(new Konva.Rect({x,y,width:item.width,height:current.height,fill:item.backgroundColor,listening:false}));
      group.add(new Konva.Text({x,y,text:item.text,fontFamily:item.fontFamily,fontSize:item.fontSize,fontStyle:(item.bold?'bold ':'')+(item.italic?'italic':''),textDecoration:item.underline?'underline':'',fill:item.color||model.textColor||'#263238',lineHeight:item.lineHeight,padding:0,listening:false}));
      x+=item.width+(justifyExtra&&/^\s+$/.test(item.text)?justifyExtra:0);
    }
    y+=current.height;
  }
  return group;
}
function createGenericTableNode(model){model.table=normalizeGenericTable(model.table);const size=genericTableSize(model.table);model.width=size.width;model.height=size.height;const group=new Konva.Group({id:model.id});model.table.rows.forEach((row,rowIndex)=>row.cells.forEach((cell,columnIndex)=>{if(cell.hidden)return;const geometry=genericTableCellGeometry(model.table,rowIndex,columnIndex);group.add(new Konva.Rect({x:geometry.x,y:geometry.y,width:geometry.width,height:geometry.height,fill:cell.backgroundColor,stroke:cell.borderColor,strokeWidth:cell.borderWidth,dash:lineDash(cell.borderStyle)}),new Konva.Text({x:geometry.x+cell.padding,y:geometry.y+cell.padding,width:Math.max(1,geometry.width-cell.padding*2),height:Math.max(1,geometry.height-cell.padding*2),text:resolveDocumentTokens(cell.content,laboratoryPreviewContext.value),fontFamily:cell.fontFamily,fontSize:cell.fontSize,fontStyle:(cell.bold?"bold ":"")+(cell.italic?"italic":""),textDecoration:cell.underline?"underline":"",align:cell.align,verticalAlign:cell.verticalAlign,fill:cell.textColor}))}));return group}function createExamTableNode(model){
  const group=new Konva.Group({id:model.id});
  const rows=examSampleRows();
  const summary=receiptSummary();
  const columns=model.columns;
  const rowHeight=Math.max(20,Number(model.rowHeight)||30);
  const headerHeight=model.showHeader?rowHeight:0;
  const activeTotals=model.totalRows.filter(row=>row.enabled);
  const totalWidth=columns.reduce((sum,column)=>sum+(Number(column.width)||0),0);
  const styles=model.styles;
  const fontStyle=style=>[style.bold?'bold':'',style.italic?'italic':''].filter(Boolean).join(' ')||'normal';
  const decoration=style=>style.underline?'underline':'';
  model.width=totalWidth;
  model.height=headerHeight+(rows.length+activeTotals.length)*rowHeight;
  group.width(model.width);group.height(model.height);
  let x=0;
  if(model.showHeader){
    for(const column of columns){
      const style=styles.header,padding=Math.max(0,Number(style.padding)||0),borderWidth=model.showBorders?Math.max(0,Number(style.borderWidth)||0):0;
      group.add(new Konva.Rect({x,y:0,width:column.width,height:rowHeight,fill:style.background,stroke:style.borderColor,strokeWidth:borderWidth}));
      group.add(new Konva.Text({x:x+padding,y:0,width:Math.max(1,column.width-padding*2),height:rowHeight,text:column.title,align:column.align,verticalAlign:'middle',fontFamily:style.fontFamily,fontSize:style.fontSize,fontStyle:fontStyle(style),textDecoration:decoration(style),fill:style.textColor,ellipsis:true,wrap:'none'}));
      x+=column.width;
    }
  }
  rows.forEach((row,rowIndex)=>{
    x=0;const y=headerHeight+rowIndex*rowHeight;
    for(const column of columns){
      const style=styles.body,padding=Math.max(0,Number(style.padding)||0),borderWidth=model.showBorders?Math.max(0,Number(style.borderWidth)||0):0;
      group.add(new Konva.Rect({x,y,width:column.width,height:rowHeight,fill:rowIndex%2?style.alternateBackground:style.background,stroke:style.borderColor,strokeWidth:borderWidth}));
      group.add(new Konva.Text({x:x+padding,y,width:Math.max(1,column.width-padding*2),height:rowHeight,text:String(row[column.field]??''),align:column.align,verticalAlign:'middle',fontFamily:style.fontFamily,fontSize:style.fontSize,fontStyle:fontStyle(style),textDecoration:decoration(style),fill:style.textColor,ellipsis:true,wrap:'none'}));
      x+=column.width;
    }
  });
  activeTotals.forEach((row,totalIndex)=>{
    const y=headerHeight+(rows.length+totalIndex)*rowHeight,style=styles.totals,padding=Math.max(0,Number(style.padding)||0),borderWidth=model.showBorders?Math.max(0,Number(style.borderWidth)||0):0,lastWidth=columns.length?columns[columns.length-1].width:totalWidth,labelWidth=Math.max(0,totalWidth-lastWidth),fill=row.id==='grandTotal'?style.grandTotalBackground:style.background;
    group.add(new Konva.Rect({x:0,y,width:labelWidth,height:rowHeight,fill,stroke:style.borderColor,strokeWidth:borderWidth}));
    group.add(new Konva.Rect({x:labelWidth,y,width:lastWidth,height:rowHeight,fill,stroke:style.borderColor,strokeWidth:borderWidth}));
    const effective={...style,bold:row.bold||style.bold};
    group.add(new Konva.Text({x:padding,y,width:Math.max(1,labelWidth-padding*2),height:rowHeight,text:row.label,align:'right',verticalAlign:'middle',fontFamily:style.fontFamily,fontSize:style.fontSize,fontStyle:fontStyle(effective),textDecoration:decoration(style),fill:style.textColor,ellipsis:true,wrap:'none'}));
    group.add(new Konva.Text({x:labelWidth+padding,y,width:Math.max(1,lastWidth-padding*2),height:rowHeight,text:String(summary[row.field]??''),align:'right',verticalAlign:'middle',fontFamily:style.fontFamily,fontSize:style.fontSize,fontStyle:fontStyle(effective),textDecoration:decoration(style),fill:style.textColor,ellipsis:true,wrap:'none'}));
  });
  if(model.showBorders&&Number(styles.outer.borderWidth)>0)group.add(new Konva.Rect({x:0,y:0,width:model.width,height:model.height,fill:'transparent',stroke:styles.outer.borderColor,strokeWidth:styles.outer.borderWidth,listening:false}));
  return group;
}


function openSelectedProperties(){const model=selectedExtra.value;if(model?.type==='rich-text')textPropertiesDialog.value?.openEdit(clonePlain(model));else if(model?.type==='generic-table')tablePropertiesDialog.value?.openEdit(clonePlain(model));else if(model?.type==='exam-table')examTablePropertiesDialog.value?.openEdit(clonePlain(model))}function applyTextProperties(payload){if(payload.mode==='create'){const model=createElementModel('rich-text',{...payload.values,x:pageMargins.value.left,y:pageMargins.value.top,width:360,height:110});extraElements.value=[...extraElements.value,model];renderExtraElement(model);selectElement(model.id)}else{const model=extraElements.value.find(item=>item.id===payload.id);if(!model)return;Object.assign(model,payload.values);extraNodes.get(model.id)?.destroy();renderExtraElement(model);selectElement(model.id)}layer.batchDraw();pushHistory()}function applyTableProperties(payload){if(payload.mode==='create'){const model=createElementModel('generic-table',{table:payload.table});extraElements.value=[...extraElements.value,model];renderExtraElement(model);selectElement(model.id)}else{const model=extraElements.value.find(item=>item.id===payload.id);if(!model)return;model.table=normalizeGenericTable(payload.table);const size=genericTableSize(model.table);model.width=size.width;model.height=size.height;extraNodes.get(model.id)?.destroy();renderExtraElement(model);selectElement(model.id)}layer.batchDraw();pushHistory()}
function applyExamTableProperties(payload){let model;if(payload.mode==='create'){model=createElementModel('exam-table',payload.values);extraElements.value=[...extraElements.value,model]}else{model=extraElements.value.find(item=>item.id===payload.id);if(!model)return;Object.assign(model,clonePlain(payload.values))}model.width=model.columns.reduce((sum,column)=>sum+(Number(column.width)||0),0);extraNodes.get(model.id)?.destroy();renderExtraElement(model);selectElement(model.id);layer.batchDraw();pushHistory()}function addTextBlock(){const model=createElementModel('rich-text',{text:'',x:pageMargins.value.left,y:pageMargins.value.top,width:360,height:110});extraElements.value=[...extraElements.value,model];renderExtraElement(model);selectElement(model.id);layer.batchDraw();pushHistory()}


function refreshSelectedGenericTable(){const model=selectedExtra.value;if(!model||model.type!=="generic-table")return;const old=extraNodes.get(model.id);old?.destroy();renderExtraElement(model);selectElement(model.id);layer.batchDraw();pushHistory()}



function syncExtraModel(id,node){const model=extraElements.value.find(item=>item.id===id);if(!model)return;const scaleX=Math.abs(node.scaleX()),scaleY=Math.abs(node.scaleY());model.x=node.x();model.y=node.y();if(model.type==='group'){node.scale({x:1,y:1});transformer?.moveToTop();layer.batchDraw();pushHistory();return}if(model.type==='generic-table'){model.table=resizeGenericTable(model.table,model.width*scaleX,model.height*scaleY);const genericSize=genericTableSize(model.table);model.width=genericSize.width;model.height=genericSize.height}else if(model.type==='exam-table'){model.columns=model.columns.map(column=>({...column,width:Math.max(40,Math.round(column.width*scaleX))}));model.rowHeight=Math.max(20,Math.round((Number(model.rowHeight)||30)*scaleY));model.width=model.columns.reduce((sum,column)=>sum+column.width,0);model.height=Math.max(20,model.height*scaleY)}else if(model.type==='separator'){model.width=Math.max(4,model.width*scaleX);model.height=Math.max(4,model.height)}else{model.width=Math.max(4,(node.width?.()||model.width)*scaleX);model.height=Math.max(4,(node.height?.()||model.height)*scaleY)}node.scale({x:1,y:1});if(model.type==='exam-table'||model.type==='generic-table'||model.type==='rich-text'||model.type==='logo'||model.type==='qr'||model.type==='image'||model.type==='rectangle'||model.type==='separator'){const old=extraNodes.get(model.id);old?.destroy();renderExtraElement(model);selectElement(model.id)}transformer?.moveToTop();layer.batchDraw();pushHistory()}
function requestImageFile(){imageFileError.value='';if(imageFileInput.value){imageFileInput.value.value='';imageFileInput.value.click()}}
function handleImageFile(event){const file=event.target.files?.[0];if(!file)return;const allowed=['image/png','image/jpeg','image/webp','image/gif'];if(!allowed.includes(file.type)){imageFileError.value='Selecciona una imagen PNG, JPG, WEBP o GIF.';return}if(file.size>5*1024*1024){imageFileError.value='La imagen no puede superar 5 MB.';return}const reader=new FileReader();reader.onerror=()=>{imageFileError.value='No fue posible leer la imagen seleccionada.'};reader.onload=()=>{let model=selectedExtra.value?.type==='image'?selectedExtra.value:null;if(!model){model=createElementModel('image');extraElements.value=[...extraElements.value,model]}model.src=String(reader.result||'');model.fileName=file.name;imageFileError.value='';refreshSelectedVisual(model);selectElement(model.id)};reader.readAsDataURL(file)}
function refreshSelectedColor(property){const model=selectedExtra.value;if(!model||!validHex(model[property]))return;refreshSelectedVisual()}
function normalizeSelectedColors(){const model=selectedExtra.value;if(!model)return;for(const property of ['fillColor','strokeColor']){if(property in model&&!validHex(model[property]))model[property]=property==='fillColor'?'#eaf1f5':'#78909c'}refreshSelectedVisual()}
function refreshSelectedVisual(target=selectedExtra.value){const model=target;if(!model||!['image','rectangle','separator'].includes(model.type))return;const node=extraNodes.get(model.id);if(model.type==='rectangle'&&node){node.setAttrs({fill:hexToRgba(model.fillColor,model.fillOpacity),stroke:model.strokeColor,strokeWidth:Math.max(0,Number(model.borderWidth)||0),dash:lineDash(model.lineStyle),cornerRadius:Math.max(0,Number(model.cornerRadius)||0),opacity:clampPercent(model.opacity,100)/100});transformer?.forceUpdate();transformer?.moveToTop();layer.batchDraw();return}if(model.type==='separator'&&node){node.setAttrs({stroke:model.strokeColor,strokeWidth:Math.max(1,Number(model.borderWidth)||1),dash:lineDash(model.lineStyle),opacity:clampPercent(model.opacity,100)/100});transformer?.forceUpdate();transformer?.moveToTop();layer.batchDraw();return}const old=extraNodes.get(model.id);old?.destroy();renderExtraElement(model);selectElement(model.id);layer.batchDraw()}
function addDesignerElement(type){const model=createElementModel(type);extraElements.value=[...extraElements.value,model];renderExtraElement(model);selectElement(model.id);layer.batchDraw();pushHistory()}
function clonePlain(value){return JSON.parse(JSON.stringify(value))}
function cloneGroupChildren(children){return children.map(child=>createElementModel(child.type,{...clonePlain(child),id:undefined}))}
function groupSelected(){if(selectedIds.value.length<2)return;const selected=selectedIds.value.map(id=>extraElements.value.find(item=>item.id===id)).filter(Boolean);if(selected.length<2||selected.some(item=>item.locked))return;const selectedSet=new Set(selected.map(item=>item.id)),indexes=selected.map(item=>extraElements.value.findIndex(entry=>entry.id===item.id)),boxes=selected.map(item=>extraNodes.get(item.id)?.getClientRect({relativeTo:layer})).filter(Boolean);if(boxes.length!==selected.length)return;const minX=Math.min(...boxes.map(box=>box.x)),minY=Math.min(...boxes.map(box=>box.y)),maxX=Math.max(...boxes.map(box=>box.x+box.width)),maxY=Math.max(...boxes.map(box=>box.y+box.height)),absoluteChildren=selected.flatMap(item=>item.type==='group'?item.children.map(child=>({...clonePlain(child),x:item.x+child.x,y:item.y+child.y})): [{...clonePlain(item),x:item.x,y:item.y}]),children=absoluteChildren.map(child=>({...child,x:child.x-minX,y:child.y-minY})),group=createElementModel('group',{x:minX,y:minY,width:maxX-minX,height:maxY-minY,children,locked:false});selected.forEach(item=>{extraNodes.get(item.id)?.destroy();extraNodes.delete(item.id)});const list=extraElements.value.filter(item=>!selectedSet.has(item.id)),insertAt=Math.min(list.length,Math.max(...indexes)-selected.filter((item,index)=>indexes[index]<Math.max(...indexes)).length);list.splice(insertAt,0,group);extraElements.value=list;renderExtraElement(group);normalizeLayerOrder();selectElement(group.id);pushHistory()}
function ungroupSelected(){const group=selectedExtra.value;if(!group||group.type!=='group'||group.locked)return;const index=extraElements.value.findIndex(item=>item.id===group.id),restored=group.children.map(child=>createElementModel(child.type,{...clonePlain(child),id:child.id,x:group.x+child.x,y:group.y+child.y,locked:false}));extraNodes.get(group.id)?.destroy();extraNodes.delete(group.id);const list=[...extraElements.value];list.splice(index,1,...restored);extraElements.value=list;restored.forEach(renderExtraElement);normalizeLayerOrder();selectedIds.value=restored.map(item=>item.id);selectedId.value=restored.at(-1)?.id||null;refreshTransformerSelection();pushHistory()}
function closeContextMenu(){contextMenu.value={...contextMenu.value,open:false}}
function openContextMenu(source,id){if(!source)return;if(!selectedIds.value.includes(id))selectElement(id);const margin=8,menuWidth=238,menuHeight=520;contextMenu.value={open:true,x:Math.max(margin,Math.min(globalThis.innerWidth-menuWidth-margin,source.clientX)),y:Math.max(margin,Math.min(globalThis.innerHeight-menuHeight-margin,source.clientY))};nextTick(()=>{const element=contextMenuElement.value;if(!element)return;const rect=element.getBoundingClientRect();contextMenu.value={...contextMenu.value,x:Math.max(margin,Math.min(globalThis.innerWidth-rect.width-margin,contextMenu.value.x)),y:Math.max(margin,Math.min(globalThis.innerHeight-rect.height-margin,contextMenu.value.y))};element.focus()})}
function runContextAction(action){if(!contextMenu.value.open)return;action();closeContextMenu()}
function handleContextScroll(event){if(contextMenuElement.value?.contains(event.target))return;closeContextMenu()}function handleContextOutside(event){if(contextMenu.value.open&&!contextMenuElement.value?.contains(event.target))closeContextMenu()}
function duplicateSelected(){const source=selectedExtra.value;if(!source)return;const overrides={...clonePlain(source),id:undefined,x:source.x+20,y:source.y+20,z:extraElements.value.length,locked:false};if(source.type==='group')overrides.children=cloneGroupChildren(source.children);const copy=createElementModel(source.type,overrides);extraElements.value=[...extraElements.value,copy];renderExtraElement(copy);selectElement(copy.id);layer.batchDraw();pushHistory()}
function deleteSelected(){if(!selectedIds.value.length)return;selectedIds.value.forEach(id=>{extraNodes.get(id)?.destroy();extraNodes.delete(id)});extraElements.value=extraElements.value.filter(item=>!selectedIds.value.includes(item.id));clearSelection();normalizeLayerOrder();pushHistory()}
function toggleSelectedLock(){const model=selectedExtra.value;if(!model)return;model.locked=!model.locked;const node=extraNodes.get(model.id);node?.draggable(!model.locked);node?.setAttr('locked',model.locked);selectElement(model.id);pushHistory()}
function normalizeLayerOrder(){extraElements.value.forEach((item,index)=>{item.z=index;extraNodes.get(item.id)?.zIndex(index+1)});transformer?.moveToTop();layer?.batchDraw()}
function moveSelectedLayer(direction){const id=selectedId.value,index=extraElements.value.findIndex(item=>item.id===id);if(index<0)return;let target=direction==='front'?extraElements.value.length-1:direction==='back'?0:direction==='up'?Math.min(extraElements.value.length-1,index+1):Math.max(0,index-1);if(target===index)return;const list=[...extraElements.value],item=list.splice(index,1)[0];list.splice(target,0,item);extraElements.value=list;normalizeLayerOrder();pushHistory()}
function alignSelected(mode){const ids=selectedIds.value.length?selectedIds.value:[selectedId.value].filter(Boolean);if(!ids.length)return;let moved=false;for(const id of ids){const node=extraNodes.get(id),model=extraElements.value.find(item=>item.id===id);if(!node||!model||model.locked)continue;const box=node.getClientRect({relativeTo:layer}),safeLeft=pageMargins.value.left,safeRight=pageWidth.value-pageMargins.value.right,targetX=mode==='left'?safeLeft:mode==='right'?safeRight-box.width:(safeLeft+safeRight-box.width)/2;node.x(node.x()+targetX-box.x);clampNodeToMargins(node,node.width?.()||model.width||0,node.height?.()||model.height||0);model.x=node.x();model.y=node.y();moved=true}if(!moved)return;refreshTransformerSelection();layer.batchDraw();pushHistory()}
function alignSelectedObjects(axis){if(selectedIds.value.length<2)return;const referenceId=selectedIds.value[0],referenceNode=extraNodes.get(referenceId),referenceModel=extraElements.value.find(item=>item.id===referenceId);if(!referenceNode||referenceModel?.locked)return;const referenceBox=referenceNode.getClientRect({relativeTo:layer});let moved=false;for(const id of selectedIds.value.slice(1)){const node=extraNodes.get(id),model=extraElements.value.find(item=>item.id===id);if(!node||!model||model.locked)continue;const box=node.getClientRect({relativeTo:layer});if(axis==='vertical')node.x(node.x()+referenceBox.x-box.x);else node.y(node.y()+referenceBox.y-box.y);clampNodeToMargins(node,node.width?.()||model.width||0,node.height?.()||model.height||0);model.x=node.x();model.y=node.y();moved=true}if(!moved)return;refreshTransformerSelection();layer.batchDraw();pushHistory()}

async function saveDraft(){if(!dirty.value||!canSaveDraft.value||versionBusy.value)return;try{const saved=await saveDocument(documentSchemaVersion);if(saved)toast.success(patientReceiptDocumentAdapter.labels.saveSuccess)}catch(error){toast.error(String(error?.data?.message||error?.message||patientReceiptDocumentAdapter.labels.saveError))}}
async function clearDocument(){if(extraElements.value.length===0)return;const accepted=await clearConfirmDialog.value?.ask({title:"Limpiar comprobante",message:"Se eliminarán todos los elementos del comprobante actual. Esta acción podrá deshacerse mientras permanezcas en el editor.",confirmText:"Limpiar comprobante",confirmIcon:"delete_sweep",variant:"danger"});if(!accepted)return;extraElements.value=[];elementSequence.value=0;clearSelection();buildStage();pushHistory();toast.success("Se eliminaron todos los elementos del comprobante.")}
async function togglePreview(){
  if(!preview.value){
    editorZoomBeforePreview.value=zoom.value;
    editorZoomModeBeforePreview.value=zoomMode.value;
    preview.value=true;
    transformer?.visible(false);
    updateSafeAreaGuide();
    layer?.batchDraw();
    await nextTick();
    fitWidth();
    return;
  }
  preview.value=false;
  await nextTick();
  buildStage();
  applyZoom(editorZoomBeforePreview.value,editorZoomModeBeforePreview.value);
}
async function toggleFullscreen(){if(!document.fullscreenElement)await designerRoot.value?.requestFullscreen?.();else await document.exitFullscreen?.()}
function cleanupPrintFrame(frame){setTimeout(()=>frame?.remove(),300)}
function printProof(){
  if(!stage||!layer)return;
  closeContextMenu?.();
  const previousPreview=preview.value;
  const previousTransformerVisibility=transformer?.visible();const previousSafeAreaVisibility=safeAreaRect?.visible();
  preview.value=true;
  transformer?.visible(false);
  safeAreaRect?.visible(false);
  layer.batchDraw();
  nextTick(()=>{
    const widthMm=pageWidth.value/3.7795275591;
    const heightMm=pageHeight.value/3.7795275591;
    const image=stage.toDataURL({pixelRatio:2});
    const frame=document.createElement('iframe');
    frame.setAttribute('data-bio-nexus-receipt-print-frame','');
    frame.setAttribute('aria-hidden','true');
    Object.assign(frame.style,{position:'fixed',right:'0',bottom:'0',width:'1px',height:'1px',border:'0',opacity:'0',pointerEvents:'none'});
    document.body.appendChild(frame);
    const printDocument=frame.contentDocument;
    if(!printDocument){cleanupPrintFrame(frame);return}
    const escapedTitle='Comprobante del paciente';
    printDocument.open();
    printDocument.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapedTitle}</title><style>@page{size:${widthMm}mm ${heightMm}mm;margin:0}html,body{width:${widthMm}mm;height:${heightMm}mm;margin:0;padding:0;overflow:hidden;background:#fff}*{box-sizing:border-box}img{display:block;width:${widthMm}mm;height:${heightMm}mm;object-fit:fill;-webkit-print-color-adjust:exact;print-color-adjust:exact}</style></head><body><img alt="Comprobante del paciente" src="${image}"></body></html>`);
    printDocument.close();
    const restore=()=>{preview.value=previousPreview;transformer?.visible(previousTransformerVisibility??!previousPreview);safeAreaRect?.visible(previousSafeAreaVisibility??!previousPreview);layer?.batchDraw()};
    const printWindow=frame.contentWindow;
    if(!printWindow){restore();cleanupPrintFrame(frame);return}
    frame.onload=()=>{setTimeout(()=>{try{printWindow.focus();printWindow.print()}finally{restore();cleanupPrintFrame(frame)}},60)};
  })
}
function handleDesignerKeydown(event){if(event.key==='Escape'&&contextMenu.value.open){event.preventDefault();closeContextMenu();return}const target=event.target;if(target?.isContentEditable||['INPUT','SELECT','TEXTAREA'].includes(target?.tagName))return;const key=event.key.toLowerCase();if((event.ctrlKey||event.metaKey)&&key==='z'){event.preventDefault();event.shiftKey?redo():undo()}else if((event.ctrlKey||event.metaKey)&&key==='y'){event.preventDefault();redo()}else if((event.ctrlKey||event.metaKey)&&key==='d'){event.preventDefault();duplicateSelected()}else if(event.key==='Delete'){event.preventDefault();deleteSelected()}else if(event.key==='Escape'){if(preview.value)togglePreview();if(textEditing.value)finishTextEdit()}}
async function loadLaboratory(){laboratoryLoading.value=true;laboratoryError.value="";try{laboratory.value=await getLaboratory()}catch(error){laboratoryError.value=String(error?.message||"No fue posible cargar los datos del laboratorio.")}finally{laboratoryLoading.value=false}}
function applyPagePreset(value){const preset=pageOptions.find(item=>item.value===value);if(!preset)return;const width=value==='custom'?Math.max(80,Math.min(500,Number(customPageWidth.value)||180)):preset.width,height=value==='custom'?Math.max(80,Math.min(700,Number(customPageHeight.value)||240)):preset.height,landscape=orientation.value==='landscape';pageWidth.value=(landscape?height:width)*MM_TO_PX;pageHeight.value=(landscape?width:height)*MM_TO_PX;nextTick(()=>{buildStage();fitPage()})}
function applyCustomPageSize(){if(pagePreset.value!=='custom')return;applyPagePreset('custom')}
function clampZoom(value){return Math.max(MIN_ZOOM,Math.min(MAX_ZOOM,Math.round(value*100)/100))}
function viewportSpace(){if(!viewport.value)return{width:0,height:0};const style=getComputedStyle(viewport.value),paddingX=parseFloat(style.paddingLeft||0)+parseFloat(style.paddingRight||0),paddingY=parseFloat(style.paddingTop||0)+parseFloat(style.paddingBottom||0);return{width:Math.max(100,viewport.value.clientWidth-paddingX-8),height:Math.max(100,viewport.value.clientHeight-paddingY-8)}}
function applyZoom(value,mode="manual"){zoomMode.value=mode;zoom.value=clampZoom(value);nextTick(()=>{if(viewport.value){viewport.value.scrollLeft=mode==="width"?0:Math.max(0,(viewport.value.scrollWidth-viewport.value.clientWidth)/2);viewport.value.scrollTop=0}})}
function setZoom(value){applyZoom(value,"manual")}
function changeZoom(delta){applyZoom(zoom.value+delta,"manual")}
function fitPage(){const space=viewportSpace();if(!space.width||!space.height)return;applyZoom(Math.min(space.width/pageWidth.value,space.height/pageHeight.value),"page")}
function fitWidth(){const space=viewportSpace();if(!space.width)return;applyZoom(space.width/pageWidth.value,"width")}
function recalculateActiveZoom(){if(zoomMode.value==="page")fitPage();else if(zoomMode.value==="width")fitWidth()}
function handleTextPointerDown(event){selectElement("text");if(textEditing.value||event.button!==0)return;draggingText.value=true;dragStart.value={pointerX:event.clientX,pointerY:event.clientY,x:textBox.value.x,y:textBox.value.y};globalThis.addEventListener("pointermove",handleTextPointerMove);globalThis.addEventListener("pointerup",finishTextDrag,{once:true})}function handleTextPointerMove(event){if(!draggingText.value)return;const nextX=dragStart.value.x+(event.clientX-dragStart.value.pointerX)/zoom.value,nextY=dragStart.value.y+(event.clientY-dragStart.value.pointerY)/zoom.value,bounds=safeBounds(textBox.value.width,textBox.value.height);textBox.value={...textBox.value,x:Math.max(bounds.minX,Math.min(bounds.maxX,nextX)),y:Math.max(bounds.minY,Math.min(bounds.maxY,nextY))};textHitRect?.position({x:textBox.value.x,y:textBox.value.y});layer?.batchDraw()}function finishTextDrag(){draggingText.value=false;globalThis.removeEventListener("pointermove",handleTextPointerMove);pushHistory()}function beginTextEdit(){selectElement("text");selectedToken.value=null;textEditing.value=true;transformer.visible(false);textHitRect.visible(false);nextTick(()=>{richEditor.value.innerHTML=textHtml.value;richEditor.value.focus();layer.batchDraw()})}function finishTextEdit(){if(!textEditing.value){selectedToken.value=null;return}captureText();pushHistory();selectedToken.value=null;textEditing.value=false;if(textHitRect&&!textHitRect.isDestroyed?.())textHitRect.visible(true);if(transformer&&!transformer.isDestroyed?.())transformer.visible(true);layer?.batchDraw()}function captureText(){restoreTokenText();textHtml.value=sanitizeHtml(richEditor.value?.innerHTML??"")}const TOKEN_LABELS=Object.freeze({"laboratory.name":"{{laboratory.name}}","laboratory.rif":"{{laboratory.rif}}","laboratory.phone1":"{{laboratory.phone1}}","laboratory.address":"{{laboratory.address}}","patient.name":"{{patient.name}}","patient.documentNumber":"{{patient.documentNumber}}","patient.sex":"{{patient.sex}}","patient.address":"{{patient.address}}","patient.phone":"{{patient.phone}}","patient.age":"{{patient.age}}","document.number":"{{document.number}}","document.date":"{{document.date}}","currency.usdRate":"{{currency.usdRate}}","currency.rateDate":"{{currency.rateDate}}"});
function tokenFromNode(node){return node?.nodeType===Node.ELEMENT_NODE?node.closest?.(".dynamic-token"):node?.parentElement?.closest?.(".dynamic-token")}
function handleEditorClick(event){const token=event.target.closest?.(".dynamic-token");selectedToken.value=token??null;if(!token)return;const range=document.createRange();range.selectNode(token);const selection=globalThis.getSelection?.();selection?.removeAllRanges();selection?.addRange(range)}
function selectionTouchesToken(){const selection=globalThis.getSelection?.();if(!selection?.rangeCount)return false;const range=selection.getRangeAt(0);return Boolean(tokenFromNode(range.startContainer)||tokenFromNode(range.endContainer)||Array.from(richEditor.value?.querySelectorAll(".dynamic-token")??[]).some(token=>range.intersectsNode(token)))}
function protectTokenMutation(event){if(selectionTouchesToken()&&event.inputType?.startsWith("format")!==true)event.preventDefault()}
function restoreTokenText(){richEditor.value?.querySelectorAll(".dynamic-token[data-field]").forEach(token=>{const key=token.dataset.field,label=TOKEN_LABELS[key];if(label&&token.textContent!==label)token.textContent=label;token.contentEditable="false"})}
function formatSelectedToken(name,value){const token=selectedToken.value;if(!token)return;switch(name){case "bold":token.style.fontWeight=token.style.fontWeight==="700"||token.style.fontWeight==="bold"?"400":"700";break;case "italic":token.style.fontStyle=token.style.fontStyle==="italic"?"normal":"italic";break;case "underline":token.style.textDecoration=token.style.textDecoration.includes("underline")?"none":"underline";break;case "foreColor":token.style.color=value;break;case "fontName":token.style.fontFamily=value;break;case "justifyLeft":case "justifyCenter":case "justifyRight":token.closest("p")?.style.setProperty("text-align",name.replace("justify","").toLowerCase());break}}function command(name,value=null){richEditor.value?.focus();if(selectedToken.value){formatSelectedToken(name,value);captureText();return}document.execCommand(name,false,value);captureText()}function applyFont(value){activeFont.value=value;command("fontName",value)}function applyFontSize(value){activeSize.value=Number(value);richEditor.value?.focus();if(selectedToken.value){selectedToken.value.style.fontSize=`${value}px`;captureText();return}document.execCommand("fontSize",false,"7");richEditor.value?.querySelectorAll('font[size="7"]').forEach(node=>{node.removeAttribute("size");node.style.fontSize=`${value}px`});captureText()}function pastePlainText(event){if(selectionTouchesToken()){event.preventDefault();return}event.preventDefault();document.execCommand("insertText",false,event.clipboardData?.getData("text/plain")??"");captureText()}function sanitizeHtml(html){const doc=new DOMParser().parseFromString(String(html||""),"text/html");doc.querySelectorAll("script,style,iframe,object,embed,link,meta,form,input,button,textarea,select").forEach(node=>node.remove());doc.body.querySelectorAll("*").forEach(node=>{for(const attr of Array.from(node.attributes))if(attr.name.toLowerCase().startsWith("on"))node.removeAttribute(attr.name)});return doc.body.innerHTML}
onMounted(async()=>{globalThis.addEventListener("beforeunload",handleBeforeUnload);globalThis.addEventListener("keydown",handleDesignerKeydown);globalThis.addEventListener('pointerdown',handleContextOutside,true);globalThis.addEventListener('resize',closeContextMenu);globalThis.addEventListener('scroll',handleContextScroll,true);buildStage();resizeObserver=new ResizeObserver(()=>recalculateActiveZoom());resizeObserver.observe(viewport.value);await loadLaboratory();try{const draft=await loadDocument();if(draft?.documentJson)restoreSnapshot(draft.documentJson);else{extraElements.value=[];selectedId.value=null;buildStage()}await nextTick();markSaved()}catch(error){toast.error(String(error?.data?.message||error?.message||"No fue posible cargar el comprobante."));extraElements.value=[];selectedId.value=null;buildStage();savedDocument.value=documentSnapshot.value}pushHistory();designerReady.value=true;nextTick(fitPage)});onBeforeUnmount(()=>{designerReady.value=false;resizeObserver?.disconnect();globalThis.removeEventListener("beforeunload",handleBeforeUnload);globalThis.removeEventListener("pointermove",handleTextPointerMove);globalThis.removeEventListener("keydown",handleDesignerKeydown);globalThis.removeEventListener('pointerdown',handleContextOutside,true);globalThis.removeEventListener('resize',closeContextMenu);globalThis.removeEventListener('scroll',handleContextScroll,true);stage?.destroy()});
</script>

<style scoped>
.pilot-page{display:grid;grid-template-rows:auto minmax(0,1fr);height:calc(100dvh - var(--bio-nexus-sticky-navigation-offset) - 28px);min-height:620px;overflow:hidden}.pilot-toolbar{display:flex;align-items:center;justify-content:flex-start;flex-wrap:nowrap;gap:5px;min-height:44px;padding:5px 8px;overflow-x:auto;overflow-y:hidden;scrollbar-width:thin;border-bottom:1px solid var(--bio-nexus-color-border);background:var(--bio-nexus-color-surface)}.toolbar-group{display:flex;align-items:center;gap:5px}.page-select{width:250px}.orientation-select{width:130px}.page-select :deep(.bio-search-trigger),.orientation-select :deep(.bio-search-trigger){height:34px;min-height:34px;padding:5px 10px}.pilot-select,.format-select{height:32px;border:1px solid var(--bio-nexus-color-border-strong);border-radius:var(--bio-nexus-radius-sm);background:#fff;color:var(--bio-nexus-color-text)}.zoom-value{min-width:54px;height:32px;border:1px solid var(--bio-nexus-color-border-strong);border-radius:var(--bio-nexus-radius-sm);background:#fff;cursor:pointer}.pilot-workspace{display:grid;grid-template-columns:230px minmax(0,1fr) 350px;min-height:0}.pilot-help{padding:14px;border-right:1px solid var(--bio-nexus-color-border);background:var(--bio-nexus-color-surface);font-size:12px;line-height:1.45}.pilot-help p{margin:9px 0}.canvas-viewport{min-width:0;min-height:0;padding:28px;overflow:auto;background:#e7eef3}.stage-scaler{position:relative;margin:0 auto}.stage-host{position:absolute;inset:0;transform-origin:top left;transform:scale(v-bind(zoom))}.text-overlay{position:absolute;z-index:3;box-sizing:border-box;overflow:visible;color:#111;line-height:1.35;pointer-events:auto}.text-overlay:not(.editing){cursor:move}.rich-editor{box-sizing:border-box;width:100%;min-height:100%;padding:5px;outline:0;background:transparent}.rich-editor p{margin:0 0 var(--paragraph-gap,4px)}.rich-editor p:last-child{margin-bottom:0}.text-block-editor{min-height:110px;resize:vertical}.property-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;align-items:start}.token-catalog{display:grid;gap:6px}.token-catalog>div{display:flex;flex-wrap:wrap;gap:5px}.token-catalog button{min-height:28px;padding:4px 7px;border:1px solid var(--bio-nexus-color-border);border-radius:999px;background:var(--bio-nexus-color-accent-soft);color:var(--bio-nexus-color-accent-strong);cursor:pointer}.totals-designer{display:grid;gap:7px;padding-top:10px;border-top:1px solid var(--bio-nexus-color-border)}.total-row-editor{display:grid;grid-template-columns:90px 1fr 1fr;gap:7px;padding:8px;border:1px solid var(--bio-nexus-color-border);border-radius:6px;background:#fff}.total-row-editor .column-actions{grid-column:1/-1}.text-overlay.editing .rich-editor{border:1px solid var(--bio-nexus-color-accent);background:#fff;box-shadow:0 0 0 3px rgb(241 114 44 / 16%)}.rich-toolbar{position:absolute;z-index:6;top:calc(100% + 6px);bottom:auto;left:0;display:flex;align-items:center;flex-wrap:nowrap;gap:3px;box-sizing:border-box;width:100%;max-width:100%;height:42px;overflow-x:auto;overflow-y:hidden;padding:4px;border:1px solid var(--bio-nexus-color-border-strong);border-radius:var(--bio-nexus-radius-md);background:#fff;box-shadow:var(--bio-nexus-shadow-md);white-space:nowrap}.rich-toolbar button,.color-control{display:grid;place-items:center;width:30px;height:30px;padding:0;border:1px solid transparent;border-radius:var(--bio-nexus-radius-sm);background:transparent;cursor:pointer}.rich-toolbar button:hover,.color-control:hover{border-color:var(--bio-nexus-color-border-strong);background:var(--bio-nexus-color-info-soft)}.format-select{width:110px}.size-select{width:66px}.color-control{position:relative}.color-control input{position:absolute;width:1px;height:1px;opacity:0}.rich-editor :deep(.dynamic-token),.dynamic-token{display:inline-block;padding:1px 4px;border-radius:999px;background:var(--bio-nexus-color-accent-soft);color:var(--bio-nexus-color-accent-strong);font-weight:700}@media(max-width:1050px){.pilot-toolbar{flex-wrap:wrap}.pilot-page{height:auto;overflow:visible}.pilot-workspace{grid-template-columns:1fr}.pilot-help{display:none}.canvas-viewport{height:72dvh}}
.designer-left-panel,.designer-right-panel{min-width:0;overflow:auto;background:var(--bio-nexus-color-surface)}.designer-right-panel{padding:14px;border-left:1px solid var(--bio-nexus-color-border);overflow-x:hidden;scrollbar-gutter:stable}.designer-panel-section{display:grid;gap:8px;padding-bottom:14px;margin-bottom:14px;border-bottom:1px solid var(--bio-nexus-color-border)}.designer-panel-section header{display:flex;align-items:center;justify-content:space-between;gap:8px}.designer-panel-section header span,.designer-panel-section small{color:var(--bio-nexus-color-text-muted);font-size:10px}.element-palette{display:grid;grid-template-columns:1fr 1fr;gap:6px}.element-palette button,.layer-row{display:grid;gap:4px;min-height:54px;padding:8px;border:1px solid var(--bio-nexus-color-border);border-radius:6px;background:#fff;color:var(--bio-nexus-color-text);text-align:left;cursor:pointer}.element-palette button:disabled{opacity:.48;cursor:not-allowed}.layer-row.active{border-color:var(--bio-nexus-color-primary);background:var(--bio-nexus-color-info-soft)}.designer-panel-section dl{display:grid;grid-template-columns:80px 1fr;gap:7px;margin:0;font-size:11px}.designer-panel-section dt{color:var(--bio-nexus-color-text-muted)}.designer-panel-section dd{margin:0;font-weight:700}.document-status{margin:0;padding:8px;border-radius:6px;background:var(--bio-nexus-color-info-soft);font-size:11px}.visually-hidden{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}.visual-file-button{width:100%;min-height:38px;border:1px solid var(--bio-nexus-color-border);border-radius:6px;background:#fff;color:var(--bio-nexus-color-primary);font-weight:700;cursor:pointer}.color-field{display:grid;grid-template-columns:42px minmax(0,1fr);gap:8px;align-items:center}.color-field input[type=color]{width:42px;height:38px;padding:3px;border:1px solid var(--bio-nexus-color-border);border-radius:6px;background:#fff}.empty-layers{margin:0;padding:12px;border:1px dashed var(--bio-nexus-color-border);border-radius:6px;color:var(--bio-nexus-color-text-muted);text-align:center}.property-error{color:var(--bio-nexus-color-danger);font-size:11px}.document-actions{margin-left:auto;flex:0 0 auto;justify-content:flex-end;border-top:0;padding-top:0}.document-actions :deep(.bio-nexus-action-button){width:34px;min-width:34px;height:34px;padding:0}.receipt-designer-toolbar>.toolbar-group{min-width:0}.receipt-designer-toolbar :deep(.bio-nexus-action-button){white-space:nowrap;flex:0 0 auto}.receipt-designer-toolbar::after{content:"";flex:0 0 1px}.document-actions{position:sticky;right:0;z-index:4;padding-left:8px;background:var(--bio-nexus-color-surface);box-shadow:-8px 0 12px -12px #263238}.document-actions :deep(.bio-nexus-action-button){flex:0 0 34px}.table-option{display:flex;align-items:center;gap:7px;font-size:11px}.table-column-list{display:grid;gap:7px}.table-column-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:6px;padding:7px;border:1px solid var(--bio-nexus-color-border);border-radius:6px;background:#fff}.table-column-row input,.table-column-row select{box-sizing:border-box;width:100%;min-width:0;height:32px;border:1px solid var(--bio-nexus-color-border);border-radius:4px;padding:4px 6px;font-size:11px}.column-actions{grid-column:1/-1;display:flex;justify-content:flex-end;gap:4px}.table-total-width{display:grid;grid-template-columns:90px 1fr 22px;align-items:center;gap:6px;font-size:11px}.table-total-width input{box-sizing:border-box;width:100%;height:32px;border:1px solid var(--bio-nexus-color-border);border-radius:4px;padding:4px 6px}.column-actions button,.add-column-button{min-height:28px;border:1px solid var(--bio-nexus-color-border);border-radius:4px;background:#fff;cursor:pointer}.table-designer-panel{min-width:0}@media(max-width:1250px){.pilot-workspace{grid-template-columns:210px minmax(0,1fr)}.designer-right-panel{display:none}}.property-actions{display:grid;grid-template-columns:1fr 1fr;gap:5px}.property-actions button{min-height:30px;border:1px solid var(--bio-nexus-color-border);border-radius:5px;background:#fff;cursor:pointer}.property-actions .danger{color:var(--bio-nexus-color-danger)}.preview-mode .designer-left-panel,.preview-mode .designer-right-panel,.preview-mode .receipt-designer-toolbar{display:none}.preview-mode .pilot-workspace{grid-template-columns:54px minmax(0,1fr)}.preview-mode .canvas-viewport{grid-column:2;min-width:0}.editor-preview-toolbar{grid-column:1;position:relative;z-index:3;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:8px;min-width:0;padding:12px 8px;overflow-x:hidden;overflow-y:auto;border-right:1px solid var(--bio-nexus-color-border);background:var(--bio-nexus-color-surface);box-shadow:4px 0 14px rgb(34 59 87 / 8%)}.editor-preview-zoom-value{box-sizing:border-box;width:40px;min-width:40px;height:30px;padding:0 2px;border:1px solid var(--bio-nexus-color-border-strong);border-radius:var(--bio-nexus-radius-sm);background:#fff;color:var(--bio-nexus-color-text);font:600 10px var(--bio-nexus-font-family,Inter,Arial,sans-serif);cursor:pointer}.editor-preview-rail-divider{display:block;width:28px;height:1px;margin:2px 0;background:var(--bio-nexus-color-border)}@media(max-width:580px){.preview-mode .pilot-workspace{grid-template-columns:46px minmax(0,1fr)}.editor-preview-toolbar{gap:6px;padding:9px 5px}.editor-preview-zoom-value{width:34px;min-width:34px;font-size:9px}.preview-mode .canvas-viewport{padding:12px}}.receipt-designer-page:fullscreen{height:100dvh;background:var(--bio-nexus-color-surface)}@media print{body *{visibility:hidden!important}.receipt-designer-page,.receipt-designer-page *{visibility:visible!important}.receipt-designer-page{position:absolute;inset:0;height:auto}.receipt-designer-toolbar,.designer-left-panel,.designer-right-panel{display:none!important}.pilot-workspace{display:block!important}.canvas-viewport{padding:0;background:#fff;overflow:visible}.stage-scaler{margin:0}}/* El dialogo usa Teleport; los estilos se limitan globalmente a su body-class. */
:global(.template-gallery-body){padding:20px 22px 18px!important;background:#f6f9fb}
:global(.template-gallery-body .template-gallery){display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
:global(.template-gallery-body .template-card){position:relative;display:grid;grid-template-columns:176px minmax(0,1fr);gap:16px;align-items:center;min-height:206px;padding:16px;border:1px solid #cad9e4;border-radius:12px;background:#fff;color:#1e2b3d;text-align:left;box-shadow:0 5px 16px rgba(28,58,82,.07);cursor:pointer;transition:border-color .16s ease,box-shadow .16s ease,transform .16s ease}
:global(.template-gallery-body .template-card:hover){border-color:#7fa8bf;box-shadow:0 9px 24px rgba(28,58,82,.13);transform:translateY(-1px)}
:global(.template-gallery-body .template-card.selected){border-color:#f1722c;box-shadow:0 0 0 3px rgba(241,114,44,.16),0 9px 24px rgba(28,58,82,.13)}
:global(.template-gallery-body .template-preview){position:relative;display:grid;place-items:center;width:176px;height:172px;border-radius:9px;background:linear-gradient(145deg,#e7eef3,#f8fbfd);overflow:hidden}
:global(.template-gallery-body .preview-paper){position:relative;display:block;width:104px;height:139px;border:1px solid #b9c9d4;border-radius:3px;background:#fff;box-shadow:0 4px 12px rgba(31,58,78,.18);overflow:hidden}
:global(.template-gallery-body .preview-paper-minimal){width:104px;height:139px}
:global(.template-gallery-body .preview-paper i){position:absolute;display:block;box-sizing:border-box}
:global(.template-gallery-body .preview-logo){left:9px;top:9px;width:20px;height:15px;border:1px solid #7894a5;background:#eef4f7}
:global(.template-gallery-body .preview-heading){left:35px;right:9px;top:9px;height:5px;background:#537d95;box-shadow:0 8px 0 #b4c5cf,0 16px 0 #d3dfe5}
:global(.template-gallery-body .preview-meta){left:9px;right:9px;top:36px;height:16px;border:1px solid #c5d3dc;background:repeating-linear-gradient(180deg,#f5f8fa 0 4px,#dbe5eb 4px 5px)}
:global(.template-gallery-body .preview-compact-meta){left:35px;right:9px;top:19px;height:12px;background:repeating-linear-gradient(180deg,#d6e2e8 0 3px,transparent 3px 6px)}
:global(.template-gallery-body .preview-table){left:9px;right:9px;top:58px;height:46px;border:1px solid #8ca7b6;background:repeating-linear-gradient(180deg,#e4edf2 0 7px,#fff 7px 14px)}
:global(.template-gallery-body .preview-table:after){content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 24px,#b7c8d2 24px 25px)}
:global(.template-gallery-body .preview-totals){right:9px;top:108px;width:48px;height:15px;background:repeating-linear-gradient(180deg,#c4d3dc 0 3px,transparent 3px 6px)}
:global(.template-gallery-body .preview-footer){left:9px;right:9px;bottom:8px;height:3px;background:#d0dce3}
:global(.template-gallery-body .preview-paper-compact .preview-table){top:40px;height:62px}
:global(.template-gallery-body .preview-paper-compact .preview-totals){top:108px}
:global(.template-gallery-body .preview-empty-mark){position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:grid;place-items:center;width:34px;height:34px;border:1px dashed #94adbb;border-radius:50%;color:#62859a;font:300 24px/1 Arial}
:global(.template-gallery-body .preview-minimal-heading){left:10px;right:10px;top:12px;height:7px;background:#557f96}
:global(.template-gallery-body .preview-minimal-meta){left:10px;right:10px;top:28px;height:14px;background:repeating-linear-gradient(180deg,#d4e0e6 0 3px,transparent 3px 6px)}
:global(.template-gallery-body .preview-minimal-table){left:10px;right:10px;top:52px;height:55px;border:1px solid #8ea6b4;background:repeating-linear-gradient(180deg,#e4edf2 0 8px,#fff 8px 16px)}
:global(.template-gallery-body .preview-minimal-total){right:10px;bottom:13px;width:45px;height:5px;background:#557f96;box-shadow:0 -8px 0 #c2d1d9}
:global(.template-gallery-body .preview-chip){position:absolute;left:8px;bottom:7px;padding:3px 7px;border-radius:999px;background:rgba(30,53,70,.86);color:#fff;font-size:10px;font-weight:700}
:global(.template-gallery-body .template-card-copy){display:grid;gap:8px;align-content:center}
:global(.template-gallery-body .template-card-copy strong){font-size:17px;color:#223b57}
:global(.template-gallery-body .template-card-copy small){font-size:12px;line-height:1.45;color:#667d8d}
:global(.template-gallery-body .template-card-action){margin-top:5px;color:#2f7598;font-size:12px;font-weight:700}
:global(.template-gallery-body .template-selected-icon){position:absolute;right:12px;top:12px;color:#f1722c}
:global(.template-gallery-body .template-warning){margin:16px 0 0;padding:11px 13px;border:1px solid #efd2b6;border-radius:7px;background:#fff7ed;color:#6d4a2b;font-size:12px}
@media(max-width:900px){:global(.template-gallery-body .template-gallery){grid-template-columns:1fr}:global(.template-gallery-body .template-card){grid-template-columns:150px 1fr}:global(.template-gallery-body .template-preview){width:150px}}
@media(max-width:580px){:global(.template-gallery-body){padding:14px!important}:global(.template-gallery-body .template-card){grid-template-columns:1fr}:global(.template-gallery-body .template-preview){width:100%}}
.property-action-groups{display:grid;gap:14px;margin-top:14px}.property-action-group{display:grid;gap:7px}.property-action-group>strong{font-size:12px;color:var(--bio-text-secondary,#637b91);font-weight:700}.property-actions-element{grid-template-columns:repeat(3,minmax(0,1fr))}.property-actions-alignment{grid-template-columns:repeat(3,minmax(0,1fr))}

.property-actions-object-alignment{grid-template-columns:repeat(2,minmax(0,1fr))}.property-action-help{display:block;color:var(--bio-text-secondary,#637b91);font-size:12px;line-height:1.35}.property-actions button:disabled{cursor:not-allowed;opacity:.5}

.property-actions-group{grid-template-columns:repeat(2,minmax(0,1fr));margin-top:7px}
:global(.receipt-context-menu){position:fixed;z-index:10050;display:grid;width:238px;max-height:calc(100dvh - 16px);overflow:auto;padding:6px;border:1px solid var(--bio-nexus-color-border-strong);border-radius:10px;background:#fff;box-shadow:0 16px 38px rgba(28,58,82,.24);color:var(--bio-nexus-color-text);font-size:12px;outline:none}
:global(.receipt-context-menu header){display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 9px 9px;border-bottom:1px solid var(--bio-nexus-color-border)}
:global(.receipt-context-menu header strong){overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
:global(.receipt-context-menu header small),:global(.receipt-context-menu section>span){color:var(--bio-nexus-color-text-muted);font-size:10px}
:global(.receipt-context-menu section){display:grid;gap:2px;padding:6px 0;border-bottom:1px solid var(--bio-nexus-color-border)}
:global(.receipt-context-menu section>span){padding:3px 9px;font-weight:700;text-transform:uppercase;letter-spacing:.04em}
:global(.receipt-context-menu button){display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;min-height:30px;padding:6px 9px;border:0;border-radius:5px;background:transparent;color:inherit;text-align:left;cursor:pointer}
:global(.receipt-context-menu button:hover:not(:disabled)),:global(.receipt-context-menu button:focus-visible){background:var(--bio-nexus-color-info-soft);outline:none}
:global(.receipt-context-menu button:disabled){opacity:.42;cursor:not-allowed}
:global(.receipt-context-menu kbd){color:var(--bio-nexus-color-text-muted);font:10px/1.2 inherit}
:global(.receipt-context-menu .context-danger){margin-top:5px;color:var(--bio-nexus-color-danger)}
@media(max-width:580px){:global(.receipt-context-menu){width:min(238px,calc(100vw - 16px))}}
</style>

<style scoped>
/* receipt-toolbar-single-row */

.pilot-toolbar{
  flex-wrap:nowrap;
  overflow-x:auto;
  overflow-y:hidden;
  scrollbar-width:thin;
  min-width:0;
}
.pilot-toolbar>*{flex:0 0 auto}
.pilot-toolbar .page-select{width:clamp(180px,14vw,250px)}
.pilot-toolbar .orientation-select{width:clamp(108px,9vw,130px)}
@media(max-width:1050px){
  .pilot-toolbar{flex-wrap:nowrap}
  .pilot-toolbar .page-select{width:180px}
  .pilot-toolbar .orientation-select{width:108px}
}

</style>
