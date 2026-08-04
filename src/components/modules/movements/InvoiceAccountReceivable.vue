<template>
  <div id="printV" v-html="miDiv"></div>
</template>
<script>
  import invoiceMixin from '@/mixins/services/invoiceMixin'
  import functionMixin from '@/mixins/util/functionMixin'

  export default {
    name: 'InvoiceAccountReceivable',
    mixins: [invoiceMixin, functionMixin],
    props: {
      invoiceItem: {
        type: Object,
        default: () => {},
      },
      clientId: {
        type: Number,
        default: 0,
      },
    },
    data() {
      return {
        miDiv: '',
        viewHtml: [],
        rowsVoucher: 15,
        printFactura: '',
        client: null,
      }
    },
    async mounted() {
      await this.laboratory()
      await this.putCliente()
      await this.putInvoice()
      await this.getHtml()
      this.putViewHtml()

    },
    methods: {
      async laboratory() {
        const result = await this.getVoucherFormat(1)
        this.rowsVoucher = result.rows_description_invoices
        this.printFactura = result.voucher_format
      },
      async putCliente() {
        const result = await this.getClient(this.clientId)
        if (result) this.client = result
      },
      async putInvoice() {
        this.viewHtml = []
        const noInvoice = this.invoiceItem.invoice.split(',')
        await this.asyncForEach(noInvoice, async (item) => {
          const newInvoice = {
            invoice: item,
            itemInvoice: await this.getInvoice(item),
            html: '',
          }
          this.viewHtml.push(newInvoice)
        })        
      },
      async getHtml() {
        await this.asyncForEach(this.viewHtml, async (itemNo) => {
          var detalle = ''
          var tipoFactura = this.printFactura
          await this.asyncForEach(itemNo.itemInvoice.invoiceitems, async (item) => {
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
          const numberDescriptions = itemNo.itemInvoice.invoiceitems.length
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
          tipoFactura = tipoFactura.replace('[fecha]', this.formatDate(itemNo.itemInvoice.date))
          tipoFactura = tipoFactura.replace('[razon-social]', itemNo.itemInvoice.business_name)
          tipoFactura = tipoFactura.replace('[rif]', itemNo.itemInvoice.rif)
          tipoFactura = tipoFactura.replace('[domicilio]', itemNo.itemInvoice.address)
          tipoFactura = tipoFactura.replace('[name]', '--Varios--')
          tipoFactura = tipoFactura.replace('[phone]', this.client.phone)
          var textFoot = ''
          var ini = 0
          await this.asyncForEach(itemNo.itemInvoice.foot_payments, async (item) => {
            if (item.active) {
              textFoot += `<tr>
                <td colspan="3" style="padding: 5px 10px; text-align: right;">
                    ${item.description}`
                if (item.value !== null) {
                    textFoot += ` ${item.value }`
                }
                if (ini > 1 && ini !== itemNo.itemInvoice.foot_payments.length - 1) {
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
          tipoFactura = tipoFactura.replace('[noInvoice]', itemNo.itemInvoice.no_invoice)
          itemNo.html = tipoFactura
        })
      },
      async putViewHtml() {
        var parrafo = ''
        await this.asyncForEach(this.viewHtml, async (itemNo) => {
          parrafo += itemNo.html
          parrafo += `<div style="page-break-after: always;"></div>`
        })
        this.miDiv = parrafo
      },
      async asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
          await callback(array[index], index, array);
        }
      },
      async getInvoice(no) {
        const result = await this.getInvoiceNo(no)
        if (result) return result
        return null
      },
      formatDate(date) {
        if (date.length === 0) return ''
        const newDate = date.substring(0, 10).split('-')
        return `${newDate[2]}-${newDate[1]}-${newDate[0]}`
      },
    },
  }
</script>