<template>
  <v-dialog
      v-model="show"
      transition="dialog-top-transition"
      persistent
      max-width="800"
  >
    <v-card v-if="dollarValue">
      <v-card-title class="text-h5 grey lighten-2">
        Forma de pago
      </v-card-title>
      <v-card-text class="mt-4">
        <v-card color="sidebarlite" elevation="2" class="mt-6">
          <v-card-text>
            <v-simple-table fixed-header>
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-right primary--text" style="width: calc(100% - 200px)">Total en Bs.</th>
                    <th class="text-right primary--text" style="width: 150px">{{ formatNumber(totalCancel) }}</th>
                  </tr>
                  <tr v-if="cancelDollars">                  
                    <th class="text-right primary--text" style="width: calc(100% - 400px)">Total en $(USD).</th>
                    <th class="text-right primary--text" style="width: 150px">{{ formatNumber(calculateDollars()) }}</th>
                  </tr>
                </thead>
              </template>
            </v-simple-table>
          </v-card-text>
        </v-card>
        <v-card color="sidebarlite" elevation="2" class="mt-6">
          <v-card-text>
            <v-simple-table fixed-header>
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
                    <td class="text-right info--text">Total a pagar</td>
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
              Registra forma de pago
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
      <v-card-actions>
        <v-spacer></v-spacer>
        <div>
          <v-btn
            color="gray300"
            text
            @click="$emit('change-model',false)"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            text
            :disabled="!noMorePayment"
            @click="sendPaymentMethod()"
          >
            Aceptar
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import functionMixin from '@/mixins/util/functionMixin'
import createNumberMask from 'text-mask-addons/dist/createNumberMask'
import waypayMixin from '@/mixins/services/waypayMixin'
import examsListMixin from '@/mixins/services/examsListMixin'
export default {
  name: 'TypePaymentDialog',
  mixins: [functionMixin, waypayMixin, examsListMixin],
  model: {
    prop: 'show',
    event: 'change-model',
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    wayPayTmp: {
      type: Array,
      default: () => [],
    },
    totalCancelTmp: {
      type: Number,
      default: 0,
    },
    cancelDollars: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      wayPay: this.wayPayTmp,
      totalCancel: this.totalCancelTmp, 
      currencyMask: createNumberMask({
        prefix: "",
        includeThousandsSeparator: false,
        allowNegative: false,
        allowDecimal: true,
        decimalLimit: 2,
      }),
      dollarValue: null,      
      totalPay: 0,
      saldo: 0,
      moreToPay: false,
      itemSelectFP: null,
      itemMontoFP: 0,
      itemLabel1: '',
      itemLabel2: '',
      itemMonto1: '',
      itemMonto2: '',
      typePayment: null,
      noMorePayment: false,
    }
  },
  watch: {
    'saldo': {
      handler(value) {
        if (value <= 0) {
          this.noMorePayment = true
        } else {
          this.noMorePayment = false
        }
      },
    },
  },
  async mounted() {
    await this.getDollar()
    await this.typePaymentActive()
    this.startPayment()
  },
  methods: {
    startPayment() {
      if (this.cancelDollars) {
        this.totalPay = this.calculateDollars()
      } else {
        this.totalPay = JSON.parse(JSON.stringify(this.totalCancel))
      }    
      this.saldo = this.totalPay
    },
    sendPaymentMethod() {
      const newWayPay = {
        wayPay: this.wayPay,
        total: this.totalPay,
      }
      this.$emit('accept-cancellation', newWayPay)
    },
    async getDollar() {
      const result = await this.getDollarValue()
      if (result) {
        this.dollarValue = result
        const date = this.dollarValue.date
        this.dollarValue.date = date.split('T')[0]
        this.dollarValue.value = parseFloat(this.dollarValue.value)
      }
    },
    async typePaymentActive() {
      const payment =  await this.getTypePayment()
      var isDisa = false
      if (this.cancelDollars) isDisa = true
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
    calculateDollars() {
      if (this.dollarValue.value) {
        const total = Math.round(this.totalCancel / this.dollarValue.value)
        return total
      }
      return 0
    },
    async deleteItem(item) {
      const tsaldo = Number(item.amount)
      this.wayPay = this.wayPay.filter((nodo) => nodo.id_type_payment !== item.id_type_payment)
      this.saldo += tsaldo
    },
    putMoreToPay() {
      if (this.moreToPay === false) {
        this.itemSelectFP = null
        this.itemMontoFP = 0
        this.itemLabel1 = ''
        this.itemLabel2 = ''
        this.itemMonto1 = ''
        this.itemMonto2 = ''
      }
      if (this.dollarValue) {
        this.typePayment[0].disable = true
        this.typePayment[1].disable = false
      } else {
        this.typePayment[0].disable = false
        this.typePayment[1].disable = true
      }
      this.moreToPay = !this.moreToPay
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
      this.totalCancel = this.totalPay - this.saldo
      this.moreToPay = false      
    },
    placeDescription(id) {
      const item = this.typePayment.find(objet => objet.id === id)
      return item.description
    },
  },
}
</script>