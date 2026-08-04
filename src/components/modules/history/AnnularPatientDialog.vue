<template>
  <v-dialog
    v-model="show"
    transition="dialog-top-transition"
    persistent
    max-width="800"
  >
    <v-card>
      <v-card-title class="text-h5 sidebarlite primary--text">
        Anular paciente
        <v-spacer></v-spacer>
        <div class="d-flex align-center">
          <v-btn
            v-if="dollarValue"
            text
            color="primary"
            class="px-0 mr-2"
            style="min-width: 0;"
            @click="newDollar = !newDollar"
          >
              <v-icon>mdi-loupe</v-icon>
          </v-btn>
          <div v-if="dollarValue" class="caption secondary--text">Valor del dolar ({{ dollarValue.date }}) $ {{ formatNumber(dollarValue.value) }}</div>
        </div>
      </v-card-title>
      <v-card-text>
        <div class="mt-2 font-weight-medium">
          Forma de pago recibido
        </div>
        <v-data-table
          v-if="wayPayPatient.waypayitems"
          :headers="headers"
          :items="wayPayPatient.waypayitems"
          hide-default-footer
        >
        </v-data-table>
      </v-card-text>
      <v-card-text>
        <v-card color="sidebarlite" elevation="2">
          <v-card-text>
            <div class="mt-2 font-weight-medium primary--text">
              Seleccione la devolución
            </div>
            <v-simple-table v-if="selectedPatient" fixed-header>
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-right primary--text" style="width: calc(100% - 400px)">Total en Bs.</th>
                    <th class="text-right primary--text" style="width: 200px">{{ formatNumber(selectedPatient.total) }}</th>
                  </tr>
                  <tr v-if="selectedPatient.total_dollars !== 0">                  
                    <th class="text-right primary--text" style="width: calc(100% - 400px)">Total en $(USD).</th>
                    <th class="text-right primary--text" style="width: 200px">{{ formatNumber(selectedPatient.total_dollars) }}</th>
                  </tr>
                </thead>
              </template>
            </v-simple-table>
            <v-simple-table fixed-header class="mt-4">
              <template v-slot:default>
                <thead>
                  <tr>
                    <th></th>
                    <th class="text-left primary--text">DESCRIPCION</th>
                    <th class="text-left primary--text">DATO 1</th>
                    <th class="text-left primary--text">DATA 2</th>
                    <th class="text-right primary--text">MONTO</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td class="text-right info--text">Total a devolver</td>
                    <td class="text-right info--text">{{ formatNumber(totalPay) }}</td>
                  </tr>
                  <tr
                    v-for="(item, index) in wayPay"
                    :key="index"
                  >
                    <td class="text-center">
                      <v-btn icon color="secondary" @click="deleteItem(item)">
                        <v-icon>mdi-delete-outline</v-icon>
                      </v-btn>
                    </td>
                    <td class="text-left caption">
                      {{ placeDescription(item.id_type_payment) }}
                    </td>
                    <td class="text-left">{{ item.description_1 }}</td>
                    <td class="text-left">{{ item.description_2 }}</td>
                    <td class="text-right">{{ formatNumber(item.amount) }}</td>
                  </tr>
                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td class="text-right info--text">Saldo</td>
                    <td class="text-right info--text">{{ formatNumber(saldo) }}</td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
            <v-btn
              color="primary"
              class="mt-2"
              :disabled="noMorePayment"
              @click="putMoreToPay()">
              <v-icon left>mdi-cash-sync</v-icon>
              Registra forma de anulación
            </v-btn>
            <v-card v-if="moreToPay" class="mt-2" style="border: 1px solid gray">
              <v-card-text class="mb-6">
                <v-row>
                  <v-col cols="4">
                    <v-select
                      v-model="itemSelectFP"
                      :items="typePayment"
                      item-disabled="disable"
                      label="Forma de pago"
                      item-text="description"
                      item-value="id"
                      dense
                      outlined
                      hide-details
                      @change="changePaymentMethod()"
                    />
                  </v-col>
                  <v-col cols="2">
                    <v-text-field
                      v-if="itemLabel1 !== ''"
                      v-model="itemMonto1"
                      :label="itemLabel1"
                      outlined
                      hide-details
                      dense
                    />
                  </v-col>
                  <v-col cols="2">
                    <v-text-field
                      v-if="itemLabel2 !== ''"
                      v-model="itemMonto2"
                      :label="itemLabel2"
                      outlined
                      hide-details
                      dense
                    />
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      v-model="itemMontoFP"
                      v-mask="currencyMask"
                      label="Monto"
                      outlined
                      hide-details
                      dense
                    />
                  </v-col>
                </v-row>
              </v-card-text>
              <v-divider></v-divider>
              <v-card-actions class="pl-4">
                <v-btn
                  outlined
                  color="secondary"
                  class="mt-2"
                  @click="registerPaymentMethod()"
                >
                  Registra forma de pago
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-card-text>
        </v-card>
      </v-card-text>      
      <v-card-text>
        <v-alert
          v-if="canceledPatient"
          border="left"
          colored-border
          type="info"
          elevation="2"
          class="mt-2"
        >
          <div>Paciente ANULADO satisfactoriamente.</div>
          <div v-if="billPatient">
            Proceda a crear Nota de crédito por cada factura impresa, 
            <v-btn
              text
              color="primary"
              @click="$router.push({name: 'issuedInvoices'})"
            >
              ir a facturación
            </v-btn>
          </div>
        </v-alert>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          v-if="canceledPatient"
          color="primary"
          text
          @click="$emit('change-model',false)"
        >
          Salir
        </v-btn>
        <v-btn
          v-else
          color="primary"
          text
          @click="anular()"
        >
          Anular
        </v-btn>
        <v-btn
          color="gray300"
          text
          @click="$emit('change-model',false)"
        >
          Cancelar
        </v-btn>
      </v-card-actions>
    </v-card>
    <new-dollar-dialog 
        v-model="newDollar"
        @set-newdolar="activeNewDollar"
    />
  </v-dialog>
</template>
<script>
import waypayMixin from '@/mixins/services/waypayMixin'
import TypePaymentMixin  from '@/mixins/services/TypePaymentMixin'
import createNumberMask from 'text-mask-addons/dist/createNumberMask'
import NewDollarDialog from '@/components/modules/admission/NewDollarDialog.vue'
import pacientsMixin from '@/mixins/services/pacientsMixin'

export default {
  name: 'AnnularPatientDialog',
  components: { NewDollarDialog },
  mixins: [ waypayMixin, TypePaymentMixin, pacientsMixin ],
  model: {
    prop: 'show',
    event: 'change-model',
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    selectedPatient: {
      type: Object,
      default: () => ({})
    },
  },
  data() {
    return {
      wayPayPatient: {},
      totalPay: 0,
      saldo: 0,
      wayPay: [],      
      noMorePayment: false,
      itemSelectFP: null,
      itemMontoFP: 0,
      itemLabel1: '',
      itemLabel2: '',
      itemMonto1: '',
      itemMonto2: '',
      typePayment: null,
      moreToPay: false,
      dollarValue: null,      
      newDollar: false,
      canDolares: false,
      canceledPatient: false,
      billPatient: false,
      currencyMask: createNumberMask({
          prefix: "",
          includeThousandsSeparator: false,
          allowNegative: false,
          allowDecimal: true,
          decimalLimit: 2,
      }),
      headers: [
      {text: 'Descripción', align: 'start', value: 'description'},
      {text: 'Data 1', align: 'start', value: 'description_1'},
      {text: 'Data 2', align: 'start', value: 'description_2'},
      {text: 'Monto', align: 'end', value: 'amount'},
      ],
    }
  },
  async mounted() {
    await this.searchWayPay()
    await this.startPayment()
    await this.typePaymentActive()
    this.getDollar()
  },
  methods: {
    async anular() {
      const clientId = localStorage.clientId
      const fechaActual = this.currentDate()
      const newwayPay = {
        id_users: clientId,
        id_patients: this.selectedPatient.id,
        id_client: this.selectedPatient.client_id,
        date: fechaActual,
        date_patients: fechaActual,
        annulment: true,
      }
      let result = await this.setwayPay(newwayPay)
      const wayPayId = result.id
      await this.asyncForEach(this.wayPay, async (item) => {
        item.id_way_pay = wayPayId
        result = await this.setWayPayItems(item)
      })
      const annulledPatient = {
        canceled: true,
        cancellation_date: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
        user_id_canceled: clientId,
      }
      result = await this.updatePatient(this.selectedPatient.id, annulledPatient)
      this.canceledPatient = true
      if (result.invoice) {
        this.billPatient = true
      }
      this.$emit('canceled-patient')
    },
    async setWayPayItems(item) {
      const result = await this.setNewWayPay(item)
      return result
    },
    async searchWayPay() {
      const result = await this.getWaypayPatientId(this.selectedPatient.id)
      if (result) {
        if (result.waypayitems) {
          await this.asyncForEach(result.waypayitems, async (tipo) => {
            tipo.description_1 = tipo.description_1.replace('.', ',')
            tipo.amount = this.formatNumber(tipo.amount)
            tipo.description = await this.buscarDescripcion(tipo.id_type_payment)
          })
        }    
      }
      this.wayPayPatient = result
    },
    async buscarDescripcion(id) {
      const result = await this.getTypepaymentId(id)
      if (result) {
        return result.description
      }
      return ''
    },    
    async asyncForEach(array, callback) {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
      }
    },   
    formatNumber(number) {
      return new Intl.NumberFormat('de-DE', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      }).format(number);
    },
    startPayment() {
      if (this.selectedPatient.total_dollars !== 0) {
        this.totalPay = JSON.parse(JSON.stringify(this.selectedPatient.total_dollars))
      } else {
        this.totalPay = JSON.parse(JSON.stringify(this.selectedPatient.total))
      }    
      this.saldo = this.totalPay
    },
    putMoreToPay() {
      console.log('llego')
      if (this.moreToPay === false) {
        this.itemSelectFP = null
        this.itemMontoFP = 0
        this.itemLabel1 = ''
        this.itemLabel2 = ''
        this.itemMonto1 = ''
        this.itemMonto2 = ''
      }
      if (this.selectedPatient.total_dollars !== 0) {
        this.typePayment[0].disable = true
        this.typePayment[1].disable = false
      } else {
        this.typePayment[0].disable = false
        this.typePayment[1].disable = true
      }
      this.moreToPay = !this.moreToPay
    },    
    async typePaymentActive() {
      const payment =  await this.getTypePayment()
      var isDisa = false
      if (this.selectedPatient.total_dollars !== 0) isDisa = true
      payment.forEach((item) => {
        if (item.description === 'Efectivo-dólares') {
          if (isDisa) {
            item.disable = false
          } else {
            item.disable = true
          }
        }
        if (item.description === 'Efectivo') {
          if (isDisa) {
            item.disable = true
          } else {
            item.disable = false
          }
        }
      })
      this.typePayment = payment
    },    
    changePaymentMethod() {
      this.itemMonto1 = ''
      this.itemMonto2 = ''
      const item = this.typePayment.find(objet => objet.id === this.itemSelectFP)
      this.itemLabel1 = item.description_1
      this.itemLabel2 = item.description_2
      if (this.itemSelectFP === 2) {
        this.itemMonto1 = '$ ' + this.dollarValue.value
        this.itemMonto2 = this.dollarValue.date
      }
    },    
    async activeNewDollar(dolar) {
      this.newDollar = false
      if (dolar !== '') {
        dolar = dolar.toString()
        dolar = dolar.replace('.', '')
        dolar = dolar.replace(',', '.')
        if (isNaN(dolar) === false) {
          const newValue = { value: dolar, }
          const result = await this.setNewDolar(newValue)
          if (result) {
            this.getDollar()
          }
        }
      }
      this.getDollar()
    },
    currentDate() {
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
      const fechaActual = anio + "-" + mes + "-" + dia
      return fechaActual
    },
    async getDollar() {
      this.dollarValue = await this.getDollarValue()
      const date = this.dollarValue.date
      this.dollarValue.date = date.split('T')[0]
    },
    registerPaymentMethod() {
      var monto = this.itemMontoFP
      const newItem = {
        'id_type_payment': this.itemSelectFP,
        'description_1': this.itemMonto1,
        'description_2': this.itemMonto2,
        'amount': monto,
        'dollar': this.canDolares ? 1 : 0,
        'dollar_value': this.canDolares ? this.dollarValue.value : 0,
        'dollar_date': this.canDolares ? this.dollarValue.date : null,
      }
      this.wayPay.push(newItem)
      this.saldo -= monto
      this.moreToPay = false      
    },
    placeDescription(id) {
      const item = this.typePayment.find(objet => objet.id === id)
      return item.description
    },
    async deleteItem(item) {
      const tsaldo = Number(item.amount)
      this.wayPay = this.wayPay.filter(objeto => objeto.id_type_payment !== item.id_type_payment)
      this.saldo += tsaldo
    },
  },

}
</script>