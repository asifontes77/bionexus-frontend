<template>
  <div class="ma-6">
    <div>
      <div v-if="newPatient.total_dollars !== 0" class="d-flex align-center">
        <div class="ml-2 caption secondary--text">Valor del dolar ({{ dollarValue.date }}) $ {{ numberFormat(dollarValue.value) }}</div>
      </div>
      <div>
        
        
      </div>
      <v-card color="sidebarlite" elevation="2" class="mt-6">
        <v-card-text>
          <v-row>
            <v-col cols="5"></v-col>
            <v-col cols="7">
              <div class="d-flex justify-space-between align-center">
                <div style="width: 260px;"></div>
                <div class="caption primary--text font-weight-bold" style="width: 145px; text-align: right"> Bs.</div>
                <div class="caption primary--text font-weight-bold" style="width: 145px; text-align: right"> Dólares</div>
              </div>
              <div
                v-for="(payment, index) in foot_payments"
                :key="index"                                    
              >
                <div v-if="payment.active" class="d-flex justify-space-between align-center">
                  <div class="d-flex justify-start align-center" style="width: 260px;">
                    <div class="caption primary--text" :class="index + 1 === foot_payments.length ? 'font-weight-bold' : ''" style="text-align: right">
                        {{ payment.description }}
                    </div>
                    <div v-if="payment.value !== null" class="caption primary--text d-flex justify-start align-center">
                      <div v-if="payment.input" style="width: 125px">
                        <v-text-field
                            v-model.number="payment.value"
                            type="number"
                            outlined
                            dense
                            hide-details
                            class="ml-1 caption white"
                            @change="goTotals()"
                        />
                      </div>
                      <div v-else class="ml-2">
                        {{ payment.value }} %
                      </div>
                      <div v-if="payment.sobre !== null" class="ml-2">
                        sobre {{ payment.sobre }}
                      </div>
                    </div>
                    <div v-else style="width: 125px"></div>
                  </div>
                  <div class="caption primary--text" :class="index + 1 === foot_payments.length ? 'font-weight-bold' : ''" style="width: 145px; text-align: right">
                    <div v-if="index + 1 === foot_payments.length - 1">0,00</div>
                    <div v-else>
                      <div v-if="index + 1 === foot_payments.length">
                        {{ numberFormat((payment.total - foot_payments[foot_payments.length - 2].total) * dollarValue.value)  }}
                      </div>
                      <div v-else>
                        {{ numberFormat(payment.total * dollarValue.value) }}
                      </div>
                    </div>
                  </div>
                  <div class="caption primary--text" :class="index + 1 === foot_payments.length ? 'font-weight-bold' : ''" style="width: 145px; text-align: right">
                    {{ numberFormat(payment.total) }}
                  </div>
                </div>
              </div> 
            </v-col>
          </v-row>
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
                  <th class="text-right primary--text">MONTO Bs.</th>
                  <th class="text-right primary--text">MONTO Dólares</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td class="text-right info--text">Sub total</td>
                  <td class="text-right info--text"></td>
                  <td class="text-right info--text">{{ numberFormat(subTotal) }}</td>
                </tr>
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td class="text-right info--text">IGTF sobre {{ numberFormat(igtfSobre) }}</td>
                  <td class="text-right info--text"></td>
                  <td class="text-right info--text">{{ numberFormat(igtf) }}</td>
                </tr>
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td class="text-right info--text">Total a pagar</td>
                  <td class="text-right info--text"></td>
                  <td class="text-right info--text">{{ numberFormat(totalPay) }}</td>
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
                  <td class="text-right">{{ numberFormat(item.amount) }}</td>
                  <td class="text-right">{{ numberFormat(item.amountDollar) }}</td>
                </tr>
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td class="text-right info--text">Saldo</td>
                  <td class="text-right info--text"></td>
                  <td class="text-right info--text">{{ numberFormat(saldo) }}</td>
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
            Selecciona forma de pago
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
    </div>
  </div>
</template>

<script>
import functionMixin from '@/mixins/util/functionMixin'
import examsListMixin from '@/mixins/services/examsListMixin'
import createNumberMask from 'text-mask-addons/dist/createNumberMask'

export default {
  name: 'TypePayment',
  mixins: [examsListMixin, functionMixin],
  props: {
    newExams: {
      type: Array,
      default: () => [],
    },
    newPatient: {
        type: Object,
        default: () => {},
    },
    dollarValue: {
      type: Object,
        default: () => {},
    },
    wayPay: {
      type: Array,
      default: () => [],
    },

  },
  data() {
    return {
      refreshKey: 0,
      typePayment: null,
      totalPay: 0,
      saldo: 0,
      subTotal: 0,
      igtf: 0,
      igtfP: 3,
      igtfSobre: 0,
      foot_payments: null,
      moreToPay: false,
      itemSelectFP: null,
      itemMontoFP: 0,
      itemLabel1: '',
      itemLabel2: '',
      itemMonto1: '',
      itemMonto2: '',
      canDolares: false,
      noMorePayment: false,
      currencyMask: createNumberMask({
          prefix: "",
          includeThousandsSeparator: false,
          allowNegative: false,
          allowDecimal: true,
          decimalLimit: 2,
      }),
    }
  },
  async mounted() {
    await this.typePaymentActive()
    this.startPayment()
  },
  methods: {
    startPayment() {
      console.log('start: ', this.newPatient)
      this.foot_payments = JSON.parse(JSON.stringify(this.newPatient.foot_payments))
      this.newPatient.total = this.newPatient.foot_payments[this.newPatient.foot_payments.length - 1].total
      this.subTotal = parseFloat(this.newPatient.foot_payments[this.newPatient.foot_payments.length - 1].total) - parseFloat(this.newPatient.foot_payments[this.newPatient.foot_payments.length- 2].total)
      this.igtf = this.newPatient.foot_payments[this.newPatient.foot_payments.length- 2].total
      this.igtfP = this.newPatient.foot_payments[this.newPatient.foot_payments.length- 2].value
      this.igtfSobre = this.newPatient.foot_payments[this.newPatient.foot_payments.length- 2].sobre
      this.saldo = this.newPatient.total
      this.totalPay = JSON.parse(JSON.stringify(this.newPatient.total))
    },
    numberFormat(value) {
      value = parseFloat(value)
      let newPreci = value.toFixed(2)
      newPreci = newPreci.replace('.', ',')
      return newPreci
    },
    async typePaymentActive() {
      const payment =  await this.getTypePayment()
      this.typePayment = payment
    },
    async deleteItem(item) {
      await this.$emit('delete-waypay',item)
      await this.calculateIgtf()
      this.calculateSaldo()
    },
    placeDescription(id) {
      const item = this.typePayment.find(objet => objet.id === id)
      return item.description
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
      this.moreToPay = !this.moreToPay
    },
    registerPaymentMethod() {
      const item = this.typePayment.find(objet => objet.id === this.itemSelectFP)
      const isDollars = item.only_dollars === 1 ? true : false
      const newItem = {
        'id_type_payment': this.itemSelectFP,
        'description_1': this.itemMonto1,
        'description_2': this.itemMonto2,
        'amount': 0,
        'amountDollar': 0,
        'dollar': isDollars ? 1 : 0,
        'dollar_value': this.dollarValue.value,
        'dollar_date': this.dollarValue.date,
      }
      if (!isDollars) {
        var monto = this.itemMontoFP / this.dollarValue.value
        newItem.amountDollar = monto.toFixed(2)
        newItem.amount = this.itemMontoFP    
      } else {
        newItem.amount = 0
        newItem.amountDollar = this.itemMontoFP
      }
      this.newPatient.way_pay_dollars = this.totalPay
      this.wayPay.push(newItem)
      if (!isDollars) {
        this.calculateIgtf()
      }
      this.moreToPay = false
      this.calculateSaldo()    
      this.calculateDollars()
    },
    calculateIgtf() {
      var total = 0.0
      this.wayPay.forEach(item =>{
        total += parseFloat(item.amount) / parseFloat(this.dollarValue.value);
      })
      this.igtfSobre = (parseFloat(this.subTotal) - total).toFixed(2)
      this.igtf = (parseFloat(this.igtfSobre) * parseFloat(this.igtfP) / 100).toFixed(2)
      if (this.igtf < 0 ) this.igtf = 0
      this.totalPay = parseFloat(this.subTotal.toFixed(2)) + parseFloat(this.igtf)
    },
    calculateSaldo() {
      this.saldo = parseFloat(this.totalPay)
      this.wayPay.forEach(item =>{
        this.saldo = this.saldo - parseFloat(item.amountDollar)
        this.saldo = parseFloat(this.saldo.toFixed(2))
      })
    },
    changePaymentMethod() {
      this.itemMonto1 = ''
      this.itemMonto2 = ''
      const item = this.typePayment.find(objet => objet.id === this.itemSelectFP)
      this.itemLabel1 = item.description_1
      this.itemLabel2 = item.description_2
      if (this.itemSelectFP === 1) {
        this.itemMonto1 = '$ ' + this.dollarValue.value
        this.itemMonto2 = this.dollarValue.date
      }
    },    
    async goTotals() {
      var wayPayDl = parseFloat(this.foot_payments[this.foot_payments.length- 2].sobre)
      this.foot_payments = await this.calculateTotals(this.foot_payments, true, this.newExams, wayPayDl)
      this.subTotal = parseFloat(this.foot_payments[this.foot_payments.length - 1].total) - parseFloat(this.foot_payments[this.foot_payments.length- 2].total)
      this.totalPay = parseFloat(this.subTotal) + parseFloat(this.igtf)
      this.calculateSaldo()
      this.calculateDollars()
    },
    async calculateDollars() {
      this.newPatient.total = this.totalPay
      var wayPayDl = parseFloat(this.igtfSobre)
      this.newPatient.foot_payments = await this.calculateTotals(this.foot_payments, true, this.newExams, wayPayDl)
      this.newPatient.total_dollars = parseFloat(this.totalPay).toFixed(2)
      this.newPatient.total = (parseFloat(this.totalPay) * parseFloat(this.dollarValue.value)).toFixed(2)
      this.newPatient.total_canceled = (parseFloat(this.totalPay) - parseFloat(this.saldo)).toFixed(2)
      this.newPatient.dollar_price = parseFloat(this.dollarValue.value).toFixed(2)
      this.newPatient.dollar_price_date = this.dollarValue.date
      this.newPatient.subtotal = this.subTotal
      this.newPatient.way_pay_dollars = wayPayDl
    },    
    async asyncForEach(array, callback) {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
      }
    },
  },
}
</script>