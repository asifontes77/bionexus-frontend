<template>    
  <div id="printR"></div>
</template>
<script>
  import pacientsMixin from '@/mixins/services/pacientsMixin'
  import ExamsListMixis from '@/mixins/services/examsListMixin';
  import functionMixin from '@/mixins/util/functionMixin'
  import { basePath } from '@/config';

  export default {
    name: 'PrintReceipt',
    mixins: [pacientsMixin, functionMixin, ExamsListMixis],
    props: {
      id: {
        type: Number,
        default: 0,
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
        rowsReceipt: 15,
        patient: null,
        noInvoice: 0,
        basePath,
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
          let receipt = result.receipt_format
          receipt = receipt.replace('[business_name]', result.business_name)
          receipt = receipt.replace('[rif_lab]', result.rif)
          receipt = receipt.replace('[address_lab]', result.address)
          receipt = receipt.replace('[phone_1]', result.phone_1)
          receipt = receipt.replace('[phone_2]', result.phone_2)
          receipt = receipt.replace('[email]', result.email)
          receipt = receipt.replace('[src_image]', `${this.basePath}/images/${result.logo}` )
          this.printFormat = receipt
          this.rowsReceipt = result.rows_description_receipt
          this.noInvoice = parseInt(result.receipt_number) + 1
          this.increaseInvoiceNumber()
        }
      },
      async createPrint() { 
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
        const result = await this.getPatientOrder(this.id)
        console.log('patient: ', result)
        this.printFormat = this.printFormat.replace('[razon-social]', result.business_name)
        this.printFormat = this.printFormat.replace('[domicilio]', result.address)
        this.printFormat = this.printFormat.replace('[rif]', result.rif)
        this.printFormat = this.printFormat.replace('[name]', result.name)
        this.printFormat = this.printFormat.replace('[phone]', result.phone)
        this.printFormat = this.printFormat.replace('[fecha]', fechaActual)
        this.printFormat = this.printFormat.replace('[noInvoice]', this.noInvoice)
        const pages = []
        var pageCount = 1
        var detalle = ''
        var index = 0
        var subTotal = 0
        var subtotalT = 0
        var listExaInvoice = []
        await this.asyncForEach(result.exams, async (item) => {
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
          if (index === this.rowsReceipt) {            
            var newItem = {
              subTotal,
              pageCount,
            }
            pages.push(newItem)
            index = 0
            subTotal = 0
            pageCount += 1
          }
        })
        if (index !== 0) {
          var newItem = {
            subTotal,
            pageCount,
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
          if (index < this.rowsReceipt) {
            for (var i = 0; i < this.rowsReceipt - index; i += 1) {
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
          pagePrint = pagePrint.replace('[list_description]', listDetail)
          var footPayments = await this.calculateTotals([], this.canDolares, [])
          var wayPayDs = 0
          if (subtotalT === parseFloat(result.subtotal)) {
            wayPayDs = parseFloat(result.way_pay_dollars) * parseFloat(this.dollarValue.value)
          } else {
            wayPayDs = subtotalT * parseFloat(result.way_pay_dollars) / parseFloat(result.subtotal)
            wayPayDs = parseFloat((wayPayDs * parseFloat(this.dollarValue.value)).toFixed(2))
          }
          footPayments = await this.calculateTotals(footPayments, this.canDolares, filteredArray, wayPayDs )
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
        this.printHtml()
        this.$emit('close-print')
      },
      printHtml() {
        this.$nextTick(() => {
          this.$htmlToPaper("printR")
        })
      },
      async increaseInvoiceNumber() {
        let change = {
          receipt_number: this.noInvoice,
        }
        await this.increaseInvoice(change)
      },
      async asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
          await callback(array[index], index, array);
        }
      },
    },
  }
</script>