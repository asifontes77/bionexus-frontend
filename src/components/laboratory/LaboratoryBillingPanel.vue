<template>
  <section class="bio-nexus-panel laboratory-panel">
    <div class="bio-nexus-panel-heading"><div><p class="bio-nexus-panel-eyebrow">Documentos e impresiÃ³n</p><h3>Factura, comprobante y toma de muestra</h3></div></div>
    <div class="document-grid">
      <article v-for="section in sections" :key="section.key" class="bio-nexus-section">
        <div class="bio-nexus-section-heading"><h4 class="bio-nexus-section-title">{{ section.title }}</h4></div>
        <div class="section-body">
          <label class="check"><input v-model="model[section.printField]" type="checkbox" :disabled="disabled"><span>{{ section.printLabel }}</span></label>
          <BioNexusFormField :label="section.numberLabel" :field-id="section.key+'-number'"><input v-model.number="model[section.numberField]" class="bio-nexus-field" type="number" min="0" :disabled="disabled"></BioNexusFormField>
          <BioNexusFormField v-if="section.rowsField" label="Filas mÃ¡ximas de descripciÃ³n" :field-id="section.key+'-rows'"><input v-model.number="model[section.rowsField]" class="bio-nexus-field" type="number" min="5" max="15" :disabled="disabled"></BioNexusFormField>
        </div>
      </article>
    </div>


  </section>
</template>
<script setup>
import BioNexusFormField from "@/components/ui/BioNexusFormField.vue";
defineProps({model:{type:Object,required:true},disabled:{type:Boolean,default:false}});
const sections=Object.freeze([{key:"invoice",title:"Factura",printField:"print_invoice",printLabel:"Imprimir al ingresar al paciente",numberField:"invoice_number",numberLabel:"Correlativo de factura",rowsField:"rows_description_invoices"},{key:"receipt",title:"Comprobante",printField:"print_receipt",printLabel:"Imprimir al ingresar al paciente",numberField:"receipt_number",numberLabel:"Correlativo de comprobante",rowsField:"rows_description_receipt"},{key:"sample",title:"Toma de muestra",printField:"print_sample_take",printLabel:"Imprimir al ingresar al paciente",numberField:"voucher_number",numberLabel:"Correlativo de toma"}]);
</script>
<style scoped>.document-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--bio-nexus-space-3)}.section-body,.printer-grid{display:grid;gap:var(--bio-nexus-space-3);padding:var(--bio-nexus-space-4)}.printer-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.printer,.taxes{margin-top:var(--bio-nexus-space-4)}.check{display:inline-flex;align-items:center;gap:var(--bio-nexus-space-2);min-height:var(--bio-nexus-control-height);color:var(--bio-nexus-color-text-secondary);font-weight:var(--bio-nexus-font-weight-bold)}.tax-list{display:grid;gap:var(--bio-nexus-space-2);padding:var(--bio-nexus-space-3)}.tax-row{display:grid;grid-template-columns:minmax(170px,1fr) 110px repeat(3,auto) auto;gap:var(--bio-nexus-space-3);align-items:center}@media(max-width:1050px){.document-grid{grid-template-columns:1fr}.tax-row{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:620px){.printer-grid,.tax-row{grid-template-columns:1fr}}</style>
