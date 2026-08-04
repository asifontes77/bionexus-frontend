<template>
  <div class="d-flex flex-column" style="position: relative;"> 
    <div class="btn-print">
      <div class="d-flex justify-space-between">
        <div class="d-flex">
          <div class="text-h6 primary--text">{{ invoiceItem.document_type === 'NC' ? 'NOTA DE CRÉDITO' : 'FACTURA' }}</div>
        </div>
        <div class="pr-6">
          <div class='d-flex align-center justify-end mb-2'>
            <v-btn
              color="primary"
              depressed
              @click="activeInvoicePrint()"
            >
              <v-icon left>mdi-printer</v-icon>
              imprimir copia
            </v-btn>
            <v-menu
              offset-y
            >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                class="ml-2"
                fab
                dark
                small
                color="secondary"
                v-bind="attrs"
                v-on="on"
              >
                <span class="text-h6">?</span>
              </v-btn>
            </template>
            <div class="caption message-print">
              Esta impresión es solo para uso interno, si desea imprimir nuevamente un formulario de factura, 
              debes crear primero una <span class="font-weight-medium">Nota de Crédito</span> y luego <span class="font-weight-medium">Reimprimir factura</span>.
            </div>
            </v-menu>
          </div>
          <div class="d-flex align-center justify-end">
            <v-btn
              v-if="invoiceItem.document_type !== 'NC'"
              outlined
              color="primary"
              depressed
              class="mr-2"
              @click="activeCreditNotePrint()"
            >
              <v-icon left>mdi-invoice-text-plus</v-icon>
              Generar nota de crédito
            </v-btn>
            <v-btn
              v-if="invoiceItem.document_type === 'NC'"
              outlined
              color="primary"
              depressed
              @click="activeGenerateInvoice()"
            >
              <v-icon left>mdi-invoice-text-plus</v-icon>
              generar Factura
            </v-btn>
          </div>
        </div>
      </div>
    </div>
    <div id="printV" v-html="miDiv"></div>
    <start-dialog
      v-model="startDialog"
      :title="titleStart"
      :description = "descriptionStart"
      @btn-active-action="activePrimtCR()"
    />
  </div>
</template>
<script>
import pacientsMixin from '@/mixins/services/pacientsMixin'
import invoiceMixin from '@/mixins/services/invoiceMixin'
import startDialog from '@/components/util/startDialog.vue'
import functionMixin from '@/mixins/util/functionMixin'

export default {
  name: 'InvoiceDialog',
  components: { startDialog },
  mixins: [pacientsMixin, invoiceMixin, functionMixin],
  props: {
    invoiceItemTmp: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      miDiv: '',      
      rowsVoucher: 15,
      printFactura: '',
      itemPatient: null,
      noInvoice: 0,
      noCreditnote: null,
      invoiceItem: {},
      startDialog: false,
      titleStart: '',
      descriptionStart: '',
    }
  },
  watch: {
    'invoiceItem': {
      handler() {
        this.printCreateInvoice()
      },
    },
    'activeInvoicePrint': {
      handler(value) {
        if (value) {
          this.printHTML()
        }
      },
    },
  },
  async mounted() {
    this.invoiceItem = await JSON.parse(JSON.stringify(this.invoiceItemTmp))
    const result = await this.getVoucherFormat(1)
    this.printFactura = result.voucher_format
    this.rowsVoucher = result.rows_description_invoices
    this.printCreateInvoice()
  },
  methods: {
    async printCreateInvoice() {      
      const resultP = await this.getPatientById(this.invoiceItem.id_patients)
      if (resultP) this.itemPatient = await resultP
      var detalle = ''
      var tipoFactura = this.printFactura
      this.invoiceItem.invoiceitems.forEach((item) => {
        const newLinea = `
					<tr>
						<td style="width: 10%; padding: 1px 10px; border-left: 2px solid black; text-align: center;">
							${item.quantity}
						</td>
						<td style="width: 50%; padding: 1px 10px; border-left: 1px solid black; text-align: left;">
							${item.description}
						</td>
						<td style="width: 20%; padding: 1px 10px; border-left: 1px solid black; text-align: right;">
							${this.formatNumber(item.amount)}
						</td>
						<td style="width: 20%; padding: 1px 10px; border-right: 2px solid black; border-left: 1px solid black; text-align: right;">
							${this.formatNumber(item.total)}
						</td>
					</tr>`
        detalle += newLinea
      })
      const numberDescriptions = this.invoiceItem.invoiceitems.length
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
      tipoFactura = tipoFactura.replace('[fecha]', this.formatDate(this.invoiceItem.date))
      tipoFactura = tipoFactura.replace('[razon-social]', this.invoiceItem.business_name)
      tipoFactura = tipoFactura.replace('[rif]', this.invoiceItem.rif)
      tipoFactura = tipoFactura.replace('[domicilio]', this.invoiceItem.address)
      tipoFactura = tipoFactura.replace('[name]', `(${this.itemPatient.patient_position}) ${this.itemPatient.name}`)
      tipoFactura = tipoFactura.replace('[phone]', this.itemPatient.phone)
      var textFoot = ''
      var ini = 0
      await this.asyncForEach(this.invoiceItem.foot_payments, async (item) => {
        if (item.active) {
          textFoot += `<tr>
            <td colspan="3" style="padding: 5px 10px; text-align: right;">
                ${item.description}`
            if (item.value !== null) {
                textFoot += ` ${item.value }`
            }
            if (ini > 1 && ini !== this.invoiceItem.foot_payments.length - 1) {
              textFoot += ` %`
            }
            if (ini  === this.invoiceItem.foot_payments.length - 1 || ini  === 0) {
              textFoot += ` Bs.`
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
      tipoFactura = tipoFactura.replace('[noInvoice]', this.invoiceItem.no_invoice)
      var parrafo = tipoFactura
      parrafo += `<div style="page-break-after: always;"></div>`
      if (this.invoiceItem.document_type === 'NC') {
        parrafo = parrafo.replace('Factura Nº', 'Nota de crédito Nº')
      } else {
        parrafo = parrafo.replace('Nota de crédito Nº', 'Factura Nº')
      }
      this.miDiv = parrafo
    },
    formatDate(date) {
      if (date.length === 0) return ''
      const newDate = date.substring(0, 10).split('-')
      return `${newDate[2]}-${newDate[1]}-${newDate[0]}`
    },
    async activeInvoicePrint() {
      await this.$htmlToPaper("printV")
    },
    async activeCreditNotePrint() {
      let result = await this.getIncreaseInvoice()
      this.noInvoice = parseInt(result.creditnote_number) + 1
      const change = {
        creditnote_number: this.noInvoice,
      }
      await this.increaseInvoice(change)
      const newInvoice = {
          id_patients: this.invoiceItem.id_patients,
          business_name: this.invoiceItem.business_name,
          document_type: 'NC',
          rif: this.invoiceItem.rif,
          address: this.invoiceItem.address,
          id_users: localStorage.clientId,
          subtotal: this.convertNumberFormatDecimal(this.invoiceItem.subtotal, 1),
          discount: this.convertNumberFormatDecimal(this.invoiceItem.discount, 1),
          discount_total: this.convertNumberFormatDecimal(this.invoiceItem.discount_total, 1),
          iva: this.convertNumberFormatDecimal(this.invoiceItem.iva, 1),
          iva_total: this.convertNumberFormatDecimal(this.invoiceItem.iva_total, 1),
          tax_base: this.convertNumberFormatDecimal(this.invoiceItem.tax_base, 1),
          total: this.convertNumberFormatDecimal(this.invoiceItem.total, 1),
          paying: this.invoiceItem.paying,
          no_invoice: this.noInvoice,
          foot_payments: this.invoiceItem.foot_payments,
      }
      const resultIV = await this.insertNewInvoice(newInvoice)
      const newId = resultIV.id
      await this.asyncForEach(this.invoiceItem.invoiceitems, async (item) => {
        const newItem = {
          id_invoice: newId,
          quantity: item.quantity,
          description: item.description,
          amount: item.amount,
          id_exams: item.id_exams,
          total: item.total,
        }
        await this.setNewInvoiceItems(newItem)
      })
      if (this.itemPatient.creditnote.length !== 0) this.itemPatient.creditnote += ', '
      this.itemPatient.creditnote += this.noInvoice 
      const newInvoicePatient = {
        creditnote: this.itemPatient.creditnote
      }
      await this.updatePatient(this.itemPatient.id, newInvoicePatient)    
      this.noCreditnoteNumber = newId
      this.titleStart = 'Imprimir Nota de Crédito',
      this.descriptionStart = 'Coloque formulario de Nota de Crédito en su impresora y dé clic en Aceptar.',
      this.startDialog = true,
      this.noCreditnote = true
    },
    async activePrimtCR() {
      this.startDialog = false
      const result = await this.getInvoice(this.noCreditnoteNumber)
      if (result) {
        this.invoiceItem = result
        await this.printCreateInvoice()
        await this.$htmlToPaper("printV")
      }
      this.$emit('change-list')
    },
    async setNewInvoiceItems(item) {
      const result = await this.insertNewInvoiceItem(item)
      return result
    },
    async activeGenerateInvoice() {
      let result = await this.getIncreaseInvoice()
      this.noInvoice = parseInt(result.invoice_number) + 1
      const change = {
        invoice_number: this.noInvoice,
      }
      await this.increaseInvoice(change)
      const newInvoice = {
          id_patients: this.invoiceItem.id_patients,
          business_name: this.invoiceItem.business_name,
          document_type: 'Factura',
          rif: this.invoiceItem.rif,
          address: this.invoiceItem.address,
          id_users: localStorage.clientId,
          subtotal: this.convertNumberFormatDecimal(this.invoiceItem.subtotal, 1),
          discount: this.convertNumberFormatDecimal(this.invoiceItem.discount, 1),
          discount_total: this.convertNumberFormatDecimal(this.invoiceItem.discount_total, 1),
          iva: this.convertNumberFormatDecimal(this.invoiceItem.iva, 1),
          iva_total: this.convertNumberFormatDecimal(this.invoiceItem.iva_total, 1),
          tax_base: this.convertNumberFormatDecimal(this.invoiceItem.tax_base, 1),
          total: this.convertNumberFormatDecimal(this.invoiceItem.total, 1),
          paying: this.invoiceItem.paying,
          no_invoice: this.noInvoice,
          foot_payments: this.invoiceItem.foot_payments,
      }
      const resultIV = await this.insertNewInvoice(newInvoice)
      await this.asyncForEach(this.invoiceItem.invoiceitems, async (item) => {
        const newItem = {
          id_invoice: resultIV.id,
          quantity: item.quantity,
          description: item.description,
          amount: item.amount,
          id_exams: item.id_exams,
          total: item.total,
        }
        await this.setNewInvoiceItems(newItem)
      })
      this.itemPatient.invoice += `, ${this.noInvoice}` 
      const newInvoicePatient = {
        invoice: this.itemPatient.invoice
      }
      await this.updatePatient(this.itemPatient.id, newInvoicePatient)
      this.noCreditnoteNumber = resultIV.id
      this.titleStart = 'Imprimir Factura',
      this.descriptionStart = 'Coloque formulario de Factura en su impresora y dé clic en Aceptar.',
      this.startDialog = true,
      this.noCreditnote = true
    },
    async asyncForEach(array, callback) {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
      }
    },
  },
}
</script>
<style scoped>
.btn-print {
  position: absolute;
  top:-160px;
  left: 0;
  width: 100%;
}
.message-print {
  width: 300px;
  background-color: white;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 5px 5px -3px rgba(0, 0, 0, .2), 0 8px 10px 1px rgba(0, 0, 0, .14), 0 3px 14px 2px rgba(0, 0, 0, .12);
}
</style>