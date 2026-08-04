<template>    
  <div id="printR"></div>
</template>
<script>
  import pacientsMixin from '@/mixins/services/pacientsMixin'
  import ExamsListMixis from '@/mixins/services/examsListMixin';
  import functionMixin from '@/mixins/util/functionMixin'
  import { basePath } from '@/config';

  export default {
    name: 'PrintInvoice',
    mixins: [pacientsMixin, functionMixin, ExamsListMixis],
    props: {
      newPatient: {
        type: Object,
        default: () => ({})
      },
      canDolares: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        printFormat: '',
        printFormatHtml: '',
        rowsInvoices: 15,
        noInvoice: 0,
        basePath,
        totVoices: '',
        dollarValue: null,
      }
    },
    async mounted() {
      await this.getDollar()
      await this.getLaboratory()
      await this.createPrint()
    },
    methods: {
      async getDollar() {
        const result = await this.getDollarValue()
        if (result) {
          this.dollarValue = result
          const date = this.dollarValue.date
          this.dollarValue.date = date.split('T')[0]
        }
      },
      async getLaboratory() {
        const result = await this.getVoucherFormat(1)
        if (result) {
          const fecha = new Date()
          const anio = fecha.getFullYear()
          var mes = fecha.getMonth() + 1
          var dia = fecha.getDate()
          if (mes < 10) {
              mes = "0" + mes
          }
          if (dia < 10) {
              dia = "0" + dia
          }
          const fechaActual = dia + "-" + mes + "-" + anio
          let receipt = result.voucher_format
          receipt = receipt.replace('[fecha]', fechaActual)
          this.printFormat = receipt
          this.rowsInvoices = result.rows_description_invoices
          this.noInvoice = parseInt(result.invoice_number) + 1
          this.increaseInvoiceNumber()
        }
      },
      async createPrint() { 
        this.printFormat = this.printFormat.replace('[razon-social]', this.newPatient.business_name)
        this.printFormat = this.printFormat.replace('[domicilio]', this.newPatient.address)
        this.printFormat = this.printFormat.replace('[rif]', this.newPatient.rif)
        this.printFormat = this.printFormat.replace('[name]', this.newPatient.name)
        this.printFormat = this.printFormat.replace('[phone]', this.newPatient.phone)
        const pages = []
        var pageCount = 1
        
        var detalle = ''
        var index = 0
        var subTotal = 0        
        var subtotalT = 0
        var listExaInvoice = []
        await this.asyncForEach(this.newPatient.exams, async (item) => {
          const newLinea = `
          <tr>
            <td style="width: 10%; padding: 1px 10px; border-left: 2px solid black; text-align: center;">
              ${this.formatNumberNoDecimal(item.amount)}
            </td>
            <td style="width: 50%; padding: 1px 10px; border-left: 1px solid black; text-align: left;">
              ${item.description}
            </td>
            <td style="width: 20%; padding: 1px 10px; border-left: 1px solid black; text-align: right;">
              ${this.formatNumber(item.price * this.dollarValue.value)}
            </td>
            <td style="width: 20%; padding: 1px 10px; border-right: 2px solid black; border-left: 1px solid black; text-align: right;">
              ${this.formatNumber(item.total * this.dollarValue.value)}
            </td>
          </tr>`
          detalle += newLinea
          const newInvoiceItem = {
            id_invoice: 0,
            pageCount,
            id_exams: item.examlistsId,
            quantity: item.amount,
            description: item.description,
            amount: item.price * this.dollarValue.value,
            total: item.total * this.dollarValue.value,
            detalle: newLinea,
            subtotal: parseFloat(item.total)
          }
          listExaInvoice.push(newInvoiceItem)
          subTotal += item.total * this.dollarValue.value
          index += 1
          if (index === this.rowsInvoices) {
            var newItem = {
              subTotal,
              pageCount,
              noInvoice: this.noInvoice,
            }
            pages.push(newItem)
            index = 0
            this.noInvoice += 1
            await this.increaseInvoiceNumber()
            subTotal = 0
            pageCount += 1
          }
        })
        if (index !== 0) {
          var newItem = {
            subTotal,
            pageCount,
            noInvoice: this.noInvoice,
          }
          pages.push(newItem)
        }
        var pageNumber = 0
        await this.asyncForEach(pages, async (itemPage) => {
          pageNumber += 1
          var pagePrint = this.printFormat
          const filteredArray = listExaInvoice.filter(item => item.pageCount === itemPage.pageCount);
          var index = 0
          var listDetail = ''
          subtotalT = 0
          await this.asyncForEach(filteredArray, async (itemD) => {
            index += 1
            listDetail += itemD.detalle
            subtotalT += itemD.subtotal
          })
          if (index < this.rowsInvoices) {
            for (var i = 0; i < this.rowsInvoices - index; i += 1) {
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
              listDetail += newLinea
            }
          }
          itemPage.listExaInvoice = filteredArray
          pagePrint = pagePrint.replace('[noInvoice]', itemPage.noInvoice)
          pagePrint = pagePrint.replace('[list_description]', listDetail)
          var footPayments = await this.calculateTotals([], this.canDolares, [])
          var wayPayDs = 0
          if (subtotalT === parseFloat(this.newPatient.subtotal)) {
            wayPayDs = parseFloat(this.newPatient.way_pay_dollars) * parseFloat(this.dollarValue.value)
          } else {
            wayPayDs = subtotalT * parseFloat(this.newPatient.way_pay_dollars) / parseFloat(this.newPatient.subtotal)
            wayPayDs = parseFloat((wayPayDs * parseFloat(this.dollarValue.value)).toFixed(2))
          }
          footPayments = await this.calculateTotals(footPayments, this.canDolares, filteredArray, wayPayDs)
          itemPage.footPayments = footPayments
          var textFoot = ''
          var ini = 0
          await this.asyncForEach(footPayments, async (foot) => {
            if (foot.active) {
              textFoot += `<tr>
                  <td colspan="3" style="padding: 5px 10px; text-align: right;">
                    ${foot.description}`
                  if (foot.value !== null) {
                      textFoot += ` ${foot.value }`
                  }
                  if (ini > 1 && ini !== footPayments.length - 1) {
                    textFoot += ` %`
                  }
                  if (ini  === footPayments.length - 1 || ini  === 0) {
                    textFoot += ` Bs.`
                  }
                  if (foot.sobre !== null) {
                    textFoot += ` SOBRE ${this.formatNumber(parseFloat(foot.sobre))}`
                  }
                  textFoot += `</td>
                  <td style="padding: 5px 10px; border-bottom: 2px solid black; border-right: 2px solid black; border-left: 2px solid black; text-align: right;">
                    ${this.formatNumber(parseFloat(foot.total))}
                  </td>
              </tr>`
            }
            ini += 1
          })
          pagePrint = pagePrint.replace('[totales]', textFoot)
          this.printFormatHtml += pagePrint
          if (pageNumber < pages.length) {
            this.printFormatHtml += `<div style="page-break-after: always;"></div>`
          }
        })
        var parrafo = document.createElement('div')
        var miDiv = document.getElementById("printR")
        parrafo.innerHTML = this.printFormatHtml
        miDiv.appendChild(parrafo)
        this.printHtml(pages)
      },
      printHtml(arrayPrinting) {
        this.$nextTick(() => {
          this.$htmlToPaper("printR")
          this.saveInvoice(arrayPrinting)
        })
      },
      async increaseInvoiceNumber() {
        if (this.totVoices !== '') {
          this.totVoices += ', '
        }
        this.totVoices += this.noInvoice
        let change = {
          invoice_number: this.noInvoice,
        }
        await this.increaseInvoice(change)
      },
      async asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
          await callback(array[index], index, array);
        }
      },
      async saveInvoice(arrayPrinting) {
        await this.asyncForEach(arrayPrinting, async (item) => {
          const invoiceId = await this.registerInvoice(item.footPayments, item.noInvoice)
          await this.asyncForEach(item.listExaInvoice, async (itemExa) => {
            await this.setNewInvoiceItems(invoiceId,itemExa)
          })
        })
        const change = {
          invoice: this.totVoices,
        }
        await this.putNumbersInvoices(this.newPatient.id, change)
        this.$emit('close-print')
      },
      async registerInvoice(footPayments, noInvoice) {
        const newInvoice = {
          id_patients: this.newPatient.id,
          no_invoice: noInvoice,
          business_name: this.newPatient.business_name,
          document_type: 'Factura',
          rif: this.newPatient.rif,
          address: this.newPatient.address,
          id_users: localStorage.clientId,
          paying: this.newPatient.client_id === 1 ? 1 : 0,
          foot_payments: footPayments,
        }
        var result = await this.insertNewInvoice(newInvoice)
        return result.id
      },
      async setNewInvoiceItems(invoiceId,item) {
        const newInvoiceItem = {
          id_invoice: invoiceId,
          id_exams: item.exam_id,
          quantity: item.quantity,
          description: item.description,
          amount: item.amount,
          total: item.total,
        }
        const result = await this.insertNewInvoiceItem(newInvoiceItem)
        return result
      },
    },
  }
</script>