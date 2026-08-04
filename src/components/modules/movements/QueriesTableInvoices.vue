<template>
  <div class="table-container">
    <div v-if="!activateViewInvoice">
      <v-data-table
        :headers="headers"
        :height="tableHeight"
        fixed-header
        :items="databaseList"
        :items-per-page="itemsPerPage"
        :item-class="rowClass"
        :loading="loading"
        item-key="id"
        hide-default-footer
        style="overflow-x: auto"
        loading-text="Cargando... por favor espere"
      >
        <template v-slot:[`item.total`]="{ item }">
        {{ formatNumber(item.total) }}
        </template>
        <template v-slot:[`item.total_dollars`]="{ item }">
        {{ formatNumber(item.total_dollars) }}
        </template>
        <template v-slot:[`item.total_canceled`]="{ item }">
        {{ formatNumber(item.total_canceled) }}
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-icon
            small
            color="secondary"
            @click="viewInvoiceItem(item)"
          >
            mdi-eye-arrow-right
          </v-icon>
        </template>
        <template v-slot:[`item.createdAt`]="{ item }">
          {{ dateOnly(item.createdAt) }}
        </template>
        <template v-slot:[`item.date_canceled`]="{ item }">
          {{ dateOnly(item.date_canceled) }}
        </template>
        <template v-slot:item.select="{ item }">
          <v-checkbox
            v-if="parseFloat(item.total_canceled) === 0"
            v-model="selected"
            :value="item.id"
            hide-details
            class="mt-0 pt-0"
          ></v-checkbox>
        </template>
      </v-data-table>
    </div>
    <div v-else>
      <v-btn
        text
        color="secondary"
        @click="activateViewInvoice=!activateViewInvoice"
      >
        <v-icon left>mdi-arrow-left-bold</v-icon>
        volver
      </v-btn>
      <invoice-account-receivable
        v-if="invoiceItem"
        :invoice-item="invoiceItem"
        :client-id="clientId"
      />
    </div>
  </div>
</template>
<script>
  import accountsreceivableMixin from '@/mixins/services/accountsreceivableMixin'
  import functionMixin from '@/mixins/util/functionMixin'
  import InvoiceAccountReceivable from '@/components/modules/movements/InvoiceAccountReceivable.vue'

  export default {
    name: 'QueriesTableInvoices',
    components: {InvoiceAccountReceivable},
    mixins: [accountsreceivableMixin, functionMixin],
    props: {
      newQuery: {
        type: Object,
        default: () => ({})
      },
    },
    data() {
      return {
        databaseList: [],
        selected: [],
        tableHeight: `${window.innerHeight - 350}px`,
        itemsPerPage: -1,
        loading: true,
        singleSelect: false,
        showSelect: true,
        headers: [
          { text: '', value: 'select', width: '30px', sortable: false },
          {text: 'Fecha', align: 'star', value: 'createdAt', width: '90px' },
          {text: 'Facturas', align: 'star', value: 'invoice', width: '100px', sortable: false},
          {text: 'Total Bs.', align: 'end', value: 'total', width: '90px'},
          {text: 'Total $.', align: 'end', value: 'total_dollars', width: '90px'},
          {text: 'Recibido', align: 'end', value: 'total_canceled', width: '90px'},
          {text: 'Fecha cancelación', align: 'star', value: 'date_canceled', width: '100px', sortable: false, class: 'multi-line-header' },
          {text: 'Acción', value: 'actions', align: 'center', width: '50px', sortable: false },
        ],
        activateViewInvoice: false,
        invoiceItem: null,
        clientId: 0,
      }
    },
    watch: {
      'newQuery': {
        handler() {
          this.generateQuery()
        }
      },
      'selected': {
        handler(value) {
          this.selectedInvoice(value)
        },
      },
    },
    mounted() {
      this.generateQuery()
    },
    methods: {
      viewInvoiceItem(item) {
        this.activateViewInvoice = true
        this.invoiceItem = item
      },
      rowClass(item) {
        return parseFloat(item.total_canceled) !== 0 ? 'canceled-row' : '';
      },
      async generateQuery() {
        this.loading = true
        this.clientId = this.newQuery.clientId
        this.databaseList = []
        const result = await this.getAccountsReceivableWithClientBetweenDate(this.newQuery)
        if (result) {
          this.databaseList = result.map(objeto => ({
            ...objeto,
            select: false,
          }))
        }
        this.loading = false
      },
      selectedInvoice(value) {
        const newSelected = this.databaseList.filter(objeto => value.includes(objeto.id))
        this.$emit('selected-quantity', newSelected)
      },
    },
  }
</script>
<style scoped>
.table-container {
  overflow-x: auto;
  width: 100%;
}
</style>