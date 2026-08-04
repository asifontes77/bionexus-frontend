import laboratoryMixin from '@/mixins/services/laboratoryMixin'

export default {
  methods: {
    revertirNumero(numero) {
      if (numero !== '') {
        numero = numero.toString()
        var decimal = ''
        var entero = ''
        const dec = numero.substring(numero.length -3, numero.length -2)
        if (dec === ',') {
          decimal =  numero.substring(numero.length -2)
          entero = numero.substring(numero.length -3,0)
          entero = entero.replace('.', '')
          entero = entero.replace('$', '')
          numero = parseFloat(entero + '.' + decimal)
        } else {
          entero = numero
          entero = entero.replace('.', '')
          numero = parseFloat(entero)
        }
      }
      return numero
    },
    redondeo(numero, decimales) {
      var flotante = parseFloat(numero);
      var resultado = Math.round(flotante * Math.pow(10, decimales)) / Math.pow(10, decimales);
      return resultado;
    },
    dateOnly(date) {
      if (date) {
        const arrayDate = date.split('T')
        if (arrayDate.length !== 0) return arrayDate[0]
      }
      return ''
    },
    async getPayments(foot) {      
      const newPayments = [
        {
            active: true,
            only_dollars: false,
            description: 'SUB-TOTAL',
            input: false,
            value: null,
            sobre: null,
            total: 0,
        },
      ]
      if (foot.length !== 0) {
        newPayments.push(foot[1])
        newPayments[1].total = 0
      } else {
        const newItem = {
          active: true,
          only_dollars: false,
          description: 'DESCUENTO (%)',
          input: true,
          value: 0,
          sobre: null,
          total: 0,
        }
        newPayments.push(newItem)
      }
      const listTax = await laboratoryMixin.methods.getTaxs()
      if (listTax) {
          listTax.forEach((item) => {
            if (item.description !== 'IGTF') {
              const newItem = {
                active: item.always_subtotal ? true : false,
                only_dollars: item.only_dollars,
                description: item.description.includes('IVA') ? 'IVA:' : `${item.description}:`,
                input: false,
                value: item.value,
                sobre: 0,
                total: 0,
              }
              newPayments.push(newItem)
            } else {
              if (!item.hide) {
                const newItem = {
                  active: item.always_subtotal ? true : false,
                  only_dollars: item.only_dollars,
                  description: item.description.includes('IVA') ? 'IVA:' : `${item.description}:`,
                  input: false,
                  value: item.value,
                  sobre: 0,
                  total: 0,
                }
                newPayments.push(newItem)
              }
            }
              
          })
      }
      const newItem = {
          active: true,
          only_dollars: false,
          description: 'TOTAL A PAGAR',
          input: false,
          value: null,
          sobre: null,
          total: 0,
      }
      newPayments.push(newItem)
      return newPayments
    },
    async calculateTotals(foot, inDollars, listExams, wayPayDl = 0) {
      const newFootPayments = await this.getPayments(foot)
      let subTotal = 0
      listExams.forEach((item) => {
        subTotal += parseFloat(item.total.toString().replace(',', '.'))
      })
      newFootPayments[0].total = subTotal
      newFootPayments[1].total = (subTotal * newFootPayments[1].value / 100).toFixed(2) * -1
      let index = 2
      const listTaxT = await laboratoryMixin.methods.getTaxs()
      listTaxT.forEach((item, ii) => {
        if (ii !== 0) {
          if (!item.only_dollars) {
            let totalTax = 0
            let tax = parseFloat(item.value)
            var listTax = []
            if (listExams.length !== 0) {
              if ('tax_amount' in listExams[0]) {
                listTax = listExams.filter((objeto) => parseFloat(objeto.tax_amount.toString().replace(',', '.')) === tax)
              }
            }
            if (listTax.length !== 0) {
                listTax.forEach((item) => {
                    const total = parseFloat(item.total.toString().replace(',', '.'))
                    totalTax += total
                })
            }
            newFootPayments[index].sobre = totalTax
            newFootPayments[index].total = Math.round(totalTax * tax / 100)
            newFootPayments[index].active = item.always_subtotal ? true : false
            if (totalTax !== 0) {
                newFootPayments[index].active = true
            }
          } else {
            let tax = parseFloat(item.value)
            let totalTax = 0
            if (wayPayDl === -1) {
              totalTax = subTotal
            } else {
              totalTax = wayPayDl
              if (totalTax < 0) totalTax * -1
            }
            newFootPayments[index].sobre = totalTax
            newFootPayments[index].total = (totalTax * tax / 100).toFixed(2)
            newFootPayments[index].active = item.always_subtotal ? true : false
            if (totalTax !== 0) {
                newFootPayments[index].active = true
            }
          }
        }
        index += 1
      })
      index = 0
      let totPayment = 0
      newFootPayments.forEach((item) => {
          if (index + 1 !== newFootPayments.length) {
              if (index === 0) {
                  totPayment = parseFloat(item.total)
              } else {
                  totPayment += parseFloat(item.total)
              }
          }
          index += 1
      })
      newFootPayments[newFootPayments.length - 1].total = totPayment
      return newFootPayments
    },    
    formatNumber(number) {
      return new Intl.NumberFormat('de-DE', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      }).format(number);
    },
    formatNumberNoDecimal(number) {
      return new Intl.NumberFormat('de-DE', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0 
      }).format(number);
    },
    formatDateToYYYYMMDD(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },         
    formatTime12Hour(date) {
      const newDate = date.split(':')
      let hours = parseInt(newDate[0], 10);
      let minutes = parseInt(newDate[1], 10);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // La hora '0' debe ser '12'
      minutes = minutes < 10 ? '0' + minutes : minutes;
      const strTime = hours + ':' + minutes + ' ' + ampm;
      return strTime;
    },
    convertNumberFormatDecimal(number, decimal) {
      var decimalNumber = number.replace(/\./g, '').replace(',', '.')
      if (decimal === 0) {
        decimalNumber = parseInt(decimalNumber, 10)
      } else {
        decimalNumber = parseFloat(decimalNumber)
      }
      return decimalNumber
    },
    applyTestFomat() {
      return `<!DOCTYPE html>
      <html lang="es">
        <head>
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <title>PRUEBAS ESPECIALES</title>
        </head>
        <body>
          <div style="width: 90%; background-color:white; font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif; font-size: 12px; margin: 20px auto 20px auto;">
                  <div style="display: flex; justify-content: space-between;">
                      <div style="width: 100%; display: flex;">
                          <div style="width: 100px">
                              <img src="[src_image]" style="max-width: 100%; max-height: 100px;" />
                          </div>
                          <div style="margin-left: 10px">
                              <div style="font-size: 14px; font-weight: 700;">[business_name]</div>
                              <div style="font-weight: 700;">RIF: [rif_lab]</div>
                              <div style="font-size: 10px; margin-top: 5px">[address_lab]</div>
                              <div style="font-size: 10px;">Teléfonos: [phone_1], [phone_2] Email: [email]</div>
                          </div>
                      </div>
                  </div>
              <div style="font-weight: 700; font-size: 14px; text-align: center; margin: 20px; 0">PRUEBAS ESPECIALES</div>
            <div style="width: 100%; border: 2px solid black; border-radius: 4px; margin-bottom: 10px;">
              <div style="display: flex">
                <div style="width: 70%;padding: 5px 10px;">
                  Laboratorio de referencia:&nbsp;[laboratory-name]
                </div>
              </div>
              <div style="border-top: 1px solid black; padding: 5px 10px;">Dirección:&nbsp;[address]</div>
              <div style="display: flex; border-top: 1px solid black;">
                <div style="width: 50%; padding: 5px 10px;">Teléfonos:&nbsp;[special-phone-1],&nbsp;[special-phone-2]</div>
                <div style="width: 50%; border-left: 1px solid black; padding: 5px 10px;">correo:&nbsp;[special-email]</div>
              </div>
            </div>
                  <div style="width: 100%; border: 2px solid black; border-radius: 4px; margin-bottom: 10px;">
                      <div style="display: flex;">
                <div style="width: 50%; padding: 5px 10px;">Paríodo desde:&nbsp;[firstDate]</div>
                <div style="width: 50%; border-left: 1px solid black; padding: 5px 10px;">hasta:&nbsp;[lastDate]</div>
              </div>
                  </div>
                  [place-patients]
              </div>
        </body>
      <html>`
    },
    patientTestFormat() {
      return `<div style="width: 100%; border: 2px solid black; border-radius: 4px; margin-bottom: 10px;">
      <div style="display: flex;">
          <div style="width: 25%; padding: 5px 10px;">Ingreso:&nbsp;[patient-date]</div>
          <div style="width: 25%; border-left: 1px solid black; padding: 5px 10px;">Secuencia:&nbsp;[patient_position]</div>
          <div style="width: 50%; border-left: 1px solid black; padding: 5px 10px;">Paciente:&nbsp;[patient-name]</div>
      </div>
      <div style="display: flex; border-top: 1px solid black;">
          <div style="width: 20%; padding: 5px 10px;">CI:&nbsp;[patient-ci]</div>
          <div style="width: 15%; border-left: 1px solid black; padding: 5px 10px;">Edad:&nbsp;[patient-age]</div>
          <div style="width: 15%; border-left: 1px solid black; padding: 5px 10px;">Sexo:&nbsp;[patient-sex]</div>
          <div style="width: 50%; border-left: 1px solid black; padding: 5px 10px;">Muestra:&nbsp;[sample_type]</div>
      </div>
      <div style="display: flex; border-top: 1px solid black;">
          <div style="width: 100%; padding: 5px 10px;">Observación:&nbsp;[patient-observation]</div>
      </div>
      <div style="display: flex; border-top: 1px solid black;">
          <div style="width: 100%; padding: 5px 10px;">Exámenes a realizar:&nbsp;<div style="display: flex; flex-direction: column;">[patient-exams]</div></div>
      </div>
  </div>`
    },
  },
}