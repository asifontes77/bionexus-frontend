<template>
  <div class="d-flex flex-column align-start">
    <v-btn
      text
      color="secondary"
      @click="$emit('close-invoice')"
    >
      <v-icon left>mdi-arrow-left-bold</v-icon>
      volver
    </v-btn>
    <div id="printV" v-html="miDiv" style="width: 100%;"></div>    
  </div>
</template>
<script>
import pacientsMixin from '@/mixins/services/pacientsMixin'
import taxMixin from '@/mixins/services/taxMixin'
import functionMixin from '@/mixins/util/functionMixin'
import accountsreceivableMixin from '@/mixins/services/accountsreceivableMixin'

export default {
  name: 'CreateInvoice',
  mixins: [pacientsMixin, taxMixin, functionMixin, accountsreceivableMixin],
  props: {
    selectedInvoice: {
      type: Array,
      default: () => [],
    },
    clientSelection: {
      type: Number,
      default: 1,
    },
    activateCreateInvoice: {
      type: Boolean,
      default: false,
    },
    dollarValue: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      currentDate: '',
      client: {},
      listItems: [],
      subTotal: 0,
      discount: 0,
      chargeDollars: false,
      discountToal: 0,
      listTax: [],
      totalFooter: 0,

      printFactura: '',
      rowsVoucher: 15,
      footPayments: [],
      miDiv: '',
    }
  },
  watch: {
    'activateCreateInvoice': {
      handler(value) {
        if (value) {
          this.recordReceivables() 
        }
      },
    },
  },
  async mounted() {
    await this.voucherFormat()
    await this.searchClient()
    await this.createDate()
    await this.getItems()
    await this.createFoot()
    this.printCreateInvoice()
  },
  methods: {
    async voucherFormat() {
      const result = await this.getVoucherFormat(1)
      this.printFactura = result.voucher_format
      this.rowsVoucher = result.rows_description_invoices
    },
    async searchClient() {
      const result = await this.getClients(this.clientSelection)
      if (result) {
        this.client = result
        this.discount = parseFloat(this.client.discount)
        this.chargeDollars = this.client.charge_dollars ? true : false
      }
    },
    createDate() {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0')
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const year = today.getFullYear()
      this.currentDate = `${day}-${month}-${year}`
    },
    async getItems() {
      const clientIds = {
        clientIds: this.selectedInvoice
      }
      const result = await this.getPatientsWithClient(clientIds)
      if (result) {
        const resultado = []
        for (let i = 0; i < result.length; i += this.rowsVoucher) {
          let grupo = result.slice(i, i + this.rowsVoucher)
          const newItem = {
            noInvoice: 0,
            list: grupo,
            footer: null,
            invoice: '',
            total: 0,
          }
          resultado.push(newItem)
        }
        this.listItems = resultado
      }
    },
    async createFoot() {
      await this.asyncForEach(this.listItems, async (item) => {
        var footPayments = await this.calculateTotals([], this.chargeDollars, item.list)
        footPayments[1].value = await this.discount
        footPayments = await this.calculateTotals(footPayments, this.chargeDollars, item.list)
        item.footer = footPayments
      })
    },
    async asyncForEach(array, callback) {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
      }
    },    
    async printCreateInvoice() {   
      var detalle = ''
      await this.asyncForEach(this.listItems, async (listItem) => {
        var tipoFactura = this.printFactura
        listItem.list.forEach((item) => {
          const newLinea = `
            <tr>
              <td style="width: 10%; padding: 1px 10px; border-left: 2px solid black; text-align: center;">
                ${this.formatNumberNoDecimal(item.amount)}
              </td>
              <td style="width: 50%; padding: 1px 10px; border-left: 1px solid black; text-align: left;">
                ${item.description}
              </td>
              <td style="width: 20%; padding: 1px 10px; border-left: 1px solid black; text-align: right;">
                ${this.formatNumber(item.total / item.amount)}
              </td>
              <td style="width: 20%; padding: 1px 10px; border-right: 2px solid black; border-left: 1px solid black; text-align: right;">
                ${this.formatNumber(item.total)}
              </td>
            </tr>`
          detalle += newLinea
        })
        const numberDescriptions = listItem.list.length
        if (numberDescriptions < this.rowsVoucher) {
          for (var i = 0; i < this.rowsVoucher - numberDescriptions; i += 1) {
            const newLinea = `
              <tr>
                <td style="width: 10%; padding: 1px 10px; border-left: 2px solid black; text-align: center;">
                  &nbsp
                </td>
                <td style="width: 50%; padding: 1px 10px; border-left: 1px solid black; text-align: left;">
                  &nbsp
                </td>
                <td style="width: 20%; padding: 1px 10px; border-left: 1px solid black; text-align: right;">
                  &nbsp
                </td>
                <td style="width: 20%; padding: 1px 10px; border-right: 2px solid black; border-left: 1px solid black; text-align: right;">
                  &nbsp
                </td>
              </tr>`
            detalle += newLinea
          }
        }
        tipoFactura = tipoFactura.replace('[list_description]', detalle)
        tipoFactura = tipoFactura.replace('[fecha]', this.currentDate)
        tipoFactura = tipoFactura.replace('[razon-social]', this.client.business_name)
        tipoFactura = tipoFactura.replace('[rif]', this.client.rif)
        tipoFactura = tipoFactura.replace('[domicilio]', this.client.address)
        tipoFactura = tipoFactura.replace('[name]', `--Varios--`)
        tipoFactura = tipoFactura.replace('[phone]', this.client.phone)
        var textFoot = ''
        var ini = 0
        await this.asyncForEach(listItem.footer, async (item) => {
          if (item.active) {
            textFoot += `<tr>
              <td colspan="3" style="padding: 5px 10px; text-align: right;">
                  ${item.description}`
              if (item.value !== null) {
                  textFoot += ` ${this.formatNumber(item.value) }`
              }
              if (ini > 1 && ini !== this.footPayments.length - 1) {
                textFoot += ` %`
              }
              if (item.sobre !== null) {
                  textFoot += ` SOBRE ${this.formatNumber(parseFloat(item.sobre))}`
              }
              textFoot += `</td>
              <td style="padding: 5px 10px; border-bottom: 2px solid black; border-right: 2px solid black; border-left: 2px solid black; text-align: right;">
                  ${this.formatNumber(parseFloat(item.total))}
              </td>
            </tr>`
          }
          ini += 1
        })
        tipoFactura = tipoFactura.replace('[totales]', textFoot)
        tipoFactura = tipoFactura.replace('[noInvoice]', 'XXXX')
        listItem.invoice = tipoFactura  
      })
      this.placeInvoices()
    },
    async placeInvoices() {
      var parrafo = ''
      await this.asyncForEach(this.listItems, async (listItem) => {   
        parrafo += listItem.invoice
        parrafo += `<div style="page-break-after: always;"></div>`
      })
      this.miDiv = parrafo
    },
    async recordReceivables() {
      await this.asyncForEach(this.listItems, async (listItem) => {
        const result = await this.getIncreaseInvoice()
        const noInvoice = parseInt(result.invoice_number) + 1
        listItem.noInvoice = noInvoice
        listItem.invoice = await listItem.invoice.replace(/XXXX/g, noInvoice.toString() )
        const change = {
          invoice_number: noInvoice,
        }
        await this.increaseInvoice(change)
        const idInvoice = await this.registerInvoice(noInvoice, listItem.footer)
        await this.registerInvoiceItems(idInvoice, listItem.list )
      })
      this.miDiv = ''
      await this.rePrintInvoice()
      await this.$htmlToPaper("printV")
      this.endRegisterInvoice()
    },
    async rePrintInvoice() {
      let parrafo = ''
      await this.asyncForEach(this.listItems, async (listItem) => {
        parrafo += listItem.invoice
        parrafo += `<div style="page-break-after: always;"></div>`
      })
      this.miDiv = parrafo
    },
    async registerInvoice(NoFact, items) {
      const total = parseFloat(items[items.length-1].total)
      const newInvoice = {
        no_invoice: NoFact,
        id_patients: 0,
        business_name: this.client.business_name,
        document_type: 'Factura',
        rif: this.client.rif,
        address: this.client.address,
        id_users: localStorage.clientId,
        subtotal: 0,
        discount: this.discount,
        discount_total: 0,
        iva: 0,
        iva_total: 0,
        tax_base: 0,
        total: total,
        paying: 0,
        foot_payments: items,
        id_client: this.clientSelection,
      }
      var result = await this.insertNewInvoice(newInvoice)
      return result.id
    },
    async registerInvoiceItems(invoiceId, list ) {
      await this.asyncForEach(list, async (item) => {
        const newInvoiceItem = {
          id_invoice: invoiceId,
          id_exams: item.exam_id,
          quantity: item.amount,
          description: item.description,
          amount: item.total / item.amount,
          total: item.total,
        }
        await this.insertNewInvoiceItem(newInvoiceItem)
      })
    },
    async endRegisterInvoice() {
      let listFact = ''
      let total = 0
      await this.asyncForEach(this.listItems, async (listItem) => {
        total += parseFloat(listItem.footer[listItem.footer.length-1].total)
        if (listFact.length !== 0) listFact += ', '
        listFact += listItem.noInvoice.toString()
      })
      const newCustomerAccounts = {
        client_id: this.clientSelection,
        invoice: listFact,
        total: total,
        total_dollars: this.chargeDollars ? total / this.dollarValue.value : 0,
      }
      const result = await this.createAccountsReceivable(newCustomerAccounts)
      if (result) {
        this.$emit('record-receivables', listFact)
      }
    },
  },
}
</script>
<style scoped>
.style-invoice {
  max-width: 1118px;
  width: 100%;
  margin: 0 auto;
  font-size: 0.75rem !important;
  letter-spacing: 0.0333333333em !important;
  line-height: 1.25rem;
  font-family: "Roboto", sans-serif;
}
.style-head {
  width: 100%;
  border: 2px solid black;
  border-radius: 5px;  
}
.style-body {
  width: 100%;
  border: 2px solid black;
}
.style-footer {
  font-size: 0.75rem !important;
  letter-spacing: 0.0333333333em !important;
  line-height: 1.25rem;
  font-family: "Roboto", sans-serif;
  width: 100%;
}
.style-total {
  width: 100%;
  border-left: 2px solid black;
  border-right: 2px solid black;
  border-bottom: 2px solid black;
}
</style>