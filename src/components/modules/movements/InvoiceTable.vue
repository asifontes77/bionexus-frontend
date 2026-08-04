<template>
  <div class="d-flex flex-column">
    <div class="sidebar sidebar-dos">
      <div class="d-flex justify-end align-end">        
        <v-btn
          v-if="!activateViewInvoice"
          outlined
          color="primary"
          depressed
          :disabled="databaseList.length === 0"
          @click="activePrint()"
        >
          <v-icon left>mdi-printer</v-icon>
          imprimir
        </v-btn>
      </div>
    </div>
    <div v-if="!activateViewInvoice" id="printV" class="width-table pa-6">
      <v-data-table
        v-if="databaseList.length !== 0"
        :headers="headers"
        ref="dataTable"
        style="overflow-x: auto"
        :items="databaseList"
        :items-per-page="itemsPerPage"
        :footer-props="{
          'show-current-page': true,
          'show-first-last-page': true,
          'items-per-page-text': 'Elementos por página',
          'items-per-page-options': [5, 10, 15, 20, 25, -1],
          'items-per-page-all-text': 'Todos',
        }"
      >
        <template v-slot:[`item.actions`]="{ item }">
          <v-icon
            small
            color="secondary"
            @click="viewInvoiceItem(item)"
          >
            mdi-eye-arrow-right
          </v-icon>
        </template>
        <template v-slot:[`item.date`]="{ item }">
          {{ item.date.substring(0, 10) }}
        </template>
        <template v-slot:[`item.exento`]="{ item }">
          {{ formatNumber(item.exento) }}
        </template>
        <template v-slot:[`item.document_type`]="{ item }">
          <div v-if="item.document_type === 'NC'" class="secondary--text">
            {{ item.document_type }}
          </div>
          <div v-else class="primary--text">
            {{ item.document_type }}
          </div>
        </template>
      </v-data-table>
    </div>
    <div v-else class="width-table pa-6">
      <v-btn
        text
        color="secondary"
        @click="activateViewInvoice=!activateViewInvoice"
      >
        <v-icon left>mdi-arrow-left-bold</v-icon>
        volver
      </v-btn>
      <Invoice-dialog
        v-if="invoiceItem"
        :invoice-item-tmp="invoiceItem"
        @change-list="changeList()"
      />
    </div>
  </div>
</template>
<script>
import InvoiceDialog from '@/components/modules/movements/InvoiceDialog.vue'

export default {
  name: 'InvoiceTable',
  components: { InvoiceDialog },
  props: {
    invoiceList: {
      type: Array,
      default: () => [],
    },
    headers: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      databaseList: [],
      activateViewInvoice: false,
      invoiceItem: null,
      itemsPerPage: 20,
    }
  },
  watch: {
    'invoiceList': {
        handler() {
          this.mountedTable()
        },
    },
  },
  mounted() {
    this.mountedTable()
  },
  methods: {
    mountedTable() {
      const newList = JSON.parse(JSON.stringify(this.invoiceList))
        this.databaseList = newList.map(item => {
        var exento = (parseInt(item.subtotal.replace('.', '').replace(',', '.'), 10) - parseInt(item.discount_total.replace('.', '').replace(',', '.'), 10) - parseInt(item.tax_base_16.replace('.', '').replace(',', '.'), 10) - parseInt(item.tax_base_8.replace('.', '').replace(',', '.'), 10))
        return {
          ...item,
          exento,
        }
      })
    },
    changeList() {
      this.mountedTable()
      this.$emit('change-list')
    },
    formatNumber(number) {
      return new Intl.NumberFormat('de-DE', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      }).format(number);
    },
    viewInvoiceItem(item) {
      this.activateViewInvoice = true
      this.invoiceItem = item
    },
    async activePrint() {
      const tableHTML = this.$refs.dataTable.$el.innerHTML;
      const printWindow = window.open('', '', 'height=700, width=1240');
      printWindow.document.write('<html><head><title>Print Table</title>');
      printWindow.document.write('<style>table { width: 100%; border-collapse: collapse; font-family: "Roboto", sans-serif; font-size: 10px; } table, th, td { border: 1px solid black; } th, td { padding: 10px; text-align: left; } th { background-color: #f2f2f2; } .v-data-footer { display: none; } th:last-child, td:last-child { display: none; }</style>');
      printWindow.document.write('</head><body >');
      printWindow.document.write('<div style="padding: 30px 20px;">')
      printWindow.document.write('<table>' + tableHTML + '</table>');
      printWindow.document.write('</div>')
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.addEventListener('afterprint', function() {
        printWindow.close();
      });
    }
  },
}
</script>
<style scoped>
.width-table {
  width: calc(100vw - 350px);
  max-height: calc(100vh - 115px - 72px);
  min-height: calc(100vh - 115px - 72px);
}
.sidebar-dos {
  height: 115px;
  width: calc(100vw - 370px);
  padding: 20px;
}
.v-data-table {
  max-height: 100%; /* Establece la altura máxima de la tabla */
  overflow-y: auto;  /* Habilita el scroll vertical */
}
</style>
