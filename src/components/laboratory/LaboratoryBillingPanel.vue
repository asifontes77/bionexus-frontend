<template>
  <div class="billing-sections">
    <BioNexusSectionPanel
      v-for="section in sections"
      :key="section.key"
      :title="section.title"
      :description="section.description"
      :icon="section.icon"
      variant="accent"
      class="billing-section"
    >
      <div class="billing-section-fields">
        <BioNexusCheckbox
          v-model="model[section.printField]"
          :label="section.printLabel"
          :disabled="disabled"
          class="billing-print-checkbox"
        />

        <BioNexusFormField
          :label="section.numberLabel"
          :field-id="section.key + '-number'"
        >
          <BioNexusNumericInput
            :id="section.key + '-number'"
            v-model="model[section.numberField]"
            :min="0"
            :decimals="0"
            :disabled="disabled"
          />
        </BioNexusFormField>

        <BioNexusFormField
          v-if="section.rowsField"
          label="Filas máximas de descripción"
          :field-id="section.key + '-rows'"
        >
          <BioNexusNumericInput
            :id="section.key + '-rows'"
            v-model="model[section.rowsField]"
            :min="5"
            :max="15"
            :decimals="0"
            :disabled="disabled"
          />
        </BioNexusFormField>
      </div>
    </BioNexusSectionPanel>
  </div>
</template>
<script setup>
import BioNexusNumericInput from "@/components/ui/BioNexusNumericInput.vue";
import BioNexusCheckbox from "@/components/ui/BioNexusCheckbox.vue";
import BioNexusSectionPanel from "@/components/ui/BioNexusSectionPanel.vue";
import BioNexusFormField from "@/components/ui/BioNexusFormField.vue";
defineProps({model:{type:Object,required:true},disabled:{type:Boolean,default:false}});
const sections=Object.freeze([{key:"invoice",title:"Factura",description:"Configura la impresión y numeración de las facturas.",icon:"receipt_long",printField:"print_invoice",printLabel:"Imprimir al ingresar al paciente",numberField:"invoice_number",numberLabel:"Correlativo de factura",rowsField:"rows_description_invoices"},{key:"receipt",title:"Comprobante",description:"Configura la impresión y numeración de los comprobantes.",icon:"description",printField:"print_receipt",printLabel:"Imprimir al ingresar al paciente",numberField:"receipt_number",numberLabel:"Correlativo de comprobante",rowsField:"rows_description_receipt"},{key:"sample",title:"Toma de muestra",description:"Configura la impresión y numeración de la toma de muestra.",icon:"science",printField:"print_sample_take",printLabel:"Imprimir al ingresar al paciente",numberField:"voucher_number",numberLabel:"Correlativo de toma"}]);
</script>
<style scoped>
.billing-sections {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--bio-nexus-space-4);
  align-items: stretch;
}

.billing-section {
  min-width: 0;
  height: 100%;
}

.billing-section-fields {
  display: grid;
  gap: var(--bio-nexus-space-4);
  align-content: start;
}

.billing-print-checkbox {
  min-height: 38px;
}

@media (max-width: 1100px) {
  .billing-sections {
    grid-template-columns: 1fr;
  }
}
</style>
