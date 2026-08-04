<template>
  <v-container pa-0 fluid fill-height class="align-start">
    <div class="d-flex">
      <v-list width="300" color="background" class="pt-0" style="border-right: 1px solid rgba(0,0,0,.12)">
        <v-subheader 
          class="sidebar primary--text d-flex flex-column justify-center altura"
        >        
          <div class="text-h6">CIERRE DE CAJA</div>
          <div class="d-flex">
            <v-menu
              v-model="menuDate"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="date"
                  prepend-icon="mdi-calendar"
                  outlined
                  readonly
                  dense
                  hide-details
                  v-bind="attrs"
                  v-on="on"
                />
              </template>
              <v-date-picker
                v-model="date"
                locale="es"
                @input="menuDate = false"
              />
            </v-menu>
            <v-btn
              fab
              small
              color="secondary"
              class="ml-1"
              @click="getDateList()"
            >
              <v-icon :class="rotar ? 'rotate-item' : ''">mdi-cached</v-icon>
            </v-btn>
          </div>
        </v-subheader>
        <div class="control-height">
          <v-list
            flat
            two-line
            class="py-0"
          >
            <v-list-item-group
              v-model="selected"
              active-class="secondary--text"
            >
              <template
                v-for="item in usersList"
              >
                <v-list-item :key="item.id">
                  <template v-slot:default="{ active }">
                    <v-list-item-content>
                      <v-list-item-title>{{ item.name }}</v-list-item-title>
                      <v-list-item-subtitle>{{ item.position }}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-list-item-action-text v-text="item.action"></v-list-item-action-text>
                      <v-icon
                        v-if="!active"
                        color="grey lighten-1"
                      >
                        mdi-star-outline
                      </v-icon>
                      <v-icon
                        v-else
                        color="yellow darken-3"
                      >
                        mdi-star
                      </v-icon>
                    </v-list-item-action>
                  </template>
                </v-list-item>
              </template>
            </v-list-item-group>
          </v-list>
        </div>
      </v-list>
      <div>
        <div class="sidebar ancho-sidebar">
          <div class="pr-6 pt-6 d-flex justify-end">
            <v-btn
              outlined
              color="primary"
              depressed
              :disabled="!selectedUser"
              @click="activatePrinter()"
            >
              <v-icon left>mdi-printer</v-icon>
              imprimir
            </v-btn>
            <v-btn
              color="primary"
              depressed
              :disabled="!selectedUser"
              class="ml-2"
              @click="activateSave()"
            >
              registrar
            </v-btn>
          </div>
        </div>        
        <div v-if="activeRegister">
          <div class="width-table pa-6">
            <div class="d-flex justify-center font-weight-medium">CIERRE DE CAJA {{ date }}</div>
            <div>Cajero: <span class="caption">{{ selectedUser.name }}</span></div>
            <v-row>
              <v-col cols="12" sm="8">
                <v-card id="card_ini" outlined flat class="mt-4">
                  <v-card-text>
                    <v-data-table
                      dense
                      class="table-height"
                      :headers="headers"
                      :items="itemsList"
                      hide-default-footer
                    >
                      <template v-slot:[`item.ingress`]="{ item }">
                        {{ formatNumber(item.ingress) }}
                      </template>
                      <template v-slot:[`item.egress`]="{ item }">
                        {{ formatNumber(item.egress) }}
                      </template>
                      <template v-slot:[`item.total`]="{ item }">
                        <strong>{{ formatNumber(item.ingress - item.egress) }}</strong>
                      </template>
                    </v-data-table>
                  </v-card-text>
                </v-card>                
              </v-col>
            </v-row>            
            <div>
              <div class="mt-4">Depósitos:</div>
              <v-row class="mt-4">
                <v-col cols="12" md="6">
                  <div v-for="(itemDep, index) in cashRegister.deposits" :key="index">
                    <v-card outlined flat style="position: relative">
                      <v-btn
                        icon
                        color="gray300"
                        class="btn-close"
                        @click="closeItem(itemDep)"
                      >
                        <v-icon>mdi-close-circle</v-icon>
                      </v-btn>
                      <div class="deposito-step">{{ index + 1 }}</div>
                      <v-card-text>                        
                        <v-text-field
                          v-model="itemDep.bank"
                          label="Banco"
                          placeholder="Ingresar"
                          outlined
                          hide-details
                          dense
                          class="mb-4"
                        />
                        <v-text-field
                          v-model="itemDep.number"
                          label="Nº planilla"
                          placeholder="Ingresar"
                          outlined
                          hide-details
                          dense
                          class="mb-4"
                        />
                        <v-text-field
                          v-model="itemDep.amount"
                          label="Total depósito"
                          placeholder="Ingresar"
                          outlined
                          hide-details
                          dense
                          class="mb-4"
                        />
                        <v-text-field
                          v-model="itemDep.cash"
                          label="Total efectivo"
                          placeholder="Ingresar"
                          outlined
                          hide-details
                          dense
                        />
                      </v-card-text>
                    </v-card>
                  </div>
                  <div class="d-flex justify-end no-imprimir">
                    <v-btn
                      text
                      color="primary"
                      @click="addDeposit()"
                    >
                      Agregar
                    </v-btn>
                  </div>
                </v-col>
              </v-row>
            </div>
          </div>
        </div>
      </div>
      <div id="printV"
        style="background-color: white;"
        :style="voucherOculto ? 'display: none' : 'display: block'"
      >
        <div v-html="contentTot" style="margin: 20px; background-color: white;"></div>
      </div> 
    </div>
  </v-container>
</template>

<script>
  import usersMixin from '@/mixins/services/usersMixin'
  import cashRegisterMixins from '@/mixins/services/cashRegisterMixins';
  import TypePaymentMixin from '@/mixins/services/TypePaymentMixin'
  import functionMixin from '@/mixins/util/functionMixin'

  const NUMBER_FORMATTER = new Intl.NumberFormat('de-DE', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
  });

  export default {
    name: 'ClosesCash',
    mixins: [usersMixin, TypePaymentMixin, cashRegisterMixins, functionMixin],
    data() {
      return {
        date: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
        menuDate: false,
        rotar: true,
        usersList: [],
        selected: null,
        selectedUser: null,
        itemsList: [],
        cashRegister: {},
        activeRegister: false,
        deposits: [
          {
            bank: '',
            number: '',
            amount: 0,
            cash: 0,
          },
        ],
        headers: [
          {text: 'Descripción', align: 'start', value: 'text'},
          {text: 'Entrada', align: 'end', value: 'ingress'},
          {text: 'Salida', align: 'end', value: 'egress'},
          {text: 'Total', align: 'end', value: 'total'},
        ],        
        contentTot: '',        
        voucherOculto: true,
      }
    },
    async mounted() {
      await this.getUserList()    
    },
    watch: {
      'date': {
        handler() {
          this.getDateList()
        },
      },
      'selected': {
        handler(value) {
          this.createList(value)
        }
      },
    },
    methods: {
      async getTypepayments() {
        this.activeRegister = false
        this.itemsList = []
        this.cashRegister = {}
        const newCash = {
          date: this.date,
          idUser: this.selectedUser.id,
        }
        const resultCash = await this.getCash_registerDateResult(newCash)
        if (resultCash) {
          if (resultCash.length !== 0) {
            this.cashRegister = resultCash[0]
            this.itemsList = this.cashRegister.totals
          }
        }
        if (Object.keys(this.cashRegister).length === 0) {
          const result = await this.getTypePayment()
          console.log('result: ', result)
          let index = 0
          await this.asyncForEach(result, async (element) => {
            const totalMovements = await this.cargarTotalesItem(element.id)        
            const newItemList = {
              text: element.description,
              id: index,
              id_type_payment: element.id,
              ingress: element.only_dollars ? totalMovements.total_dollars_not_annulled : totalMovements.total_not_annulled,
              egress: element.only_dollars ? totalMovements.total_dollars_annulled : totalMovements.total_annulled,
            }
            index += 1
            this.itemsList.push(newItemList)
          });
          this.cashRegister.id = await -1
          this.cashRegister.admission_date = this.date
          this.cashRegister.user_id = await this.selectedUser.id
          this.cashRegister.totals = await this.itemsList
          this.cashRegister.deposits = await this.deposits
        }
        this.activeRegister = true
      },
      async cargarTotalesItem(id) {
        const newAnswer= {
          date: this.date,
          idUser: this.selectedUser.id,
          idTypePay: id,
        }
        const totalpay = await this.getInvoiceTotales(newAnswer)
        console.log('totalpay: ', totalpay)
        return totalpay
      },
      async getUserList() {
        this.rotar = true
        this.usersList = []
        const result = await this.getUsersOrder()
        if (result) {
          this.usersList = result
        }
        this.rotar = false
      },
      getDateList() {
        if (this.selectedUser) {
          this.getTypepayments()
        }
      },
      createList(value) {
        if (typeof value === 'undefined') { 
          this.activeRegister = false         
          this.selectedUser = null
          this.cashRegister = {}
        } else {
          this.selectedUser = this.usersList[value]        
          this.getTypepayments()
        }
      },       
      async asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
          await callback(array[index], index, array);
        }
      },
      formatNumber(number) {
        return NUMBER_FORMATTER.format(number);
      },
      addDeposit() {
        const newDeposit = {
          bank: '',
          number: '',
          amount: 0,
          cash: 0,
        }
        this.cashRegister.deposits.push(newDeposit)
      },
      async activateSave() {
        const newRegister = {
          user_id: this.cashRegister.user_id,
          admission_date: this.cashRegister.admission_date,
          deposits: this.cashRegister.deposits,
          totals: this.cashRegister.totals,
        }
        var result = null
        console.log('newRegister: ', newRegister)
        if (this.cashRegister.id === -1) {
          result = await this.createCash_register(newRegister)
        } else {
          result = await this.updateCash_register(this.cashRegister.id, newRegister)
        }
        if (result) {
          this.getTypepayments()
        }
      },
      closeItem(itemDep) {
        this.cashRegister.deposits = this.cashRegister.deposits.filter(objeto => objeto !== itemDep)
      },
      async activatePrinter() {
        this.voucherOculto = await false
        await this.createContent()
        await this.$htmlToPaper("printV")
        this.voucherOculto = true
      },
      async createContent() {
        var content = ''
        content += `<div class="d-flex justify-center font-weight-medium">CIERRE DE CAJA ${this.date}</div>
        <div class="font-weight-medium">Cajero: ${this.selectedUser.name }</div><div class="mt-4">`
        content += document.getElementById("card_ini").innerHTML
        content += `</div><div class="mt-4 font-weight-medium">Depósitos:</div>`
        var index = 1
        await this.asyncForEach(this.cashRegister.deposits, async (itemDep) => {
          content += `<div class="mt-4 v-card width-80" style="position: relative">
            <div class="deposito-step">${index}</div>
            <div class="v-card-text pb-0 d-flex">
              <div class="caption">Banco</div>
              <div class="pl-2">${itemDep.bank}</div>
            </div>
            <div class="v-card-text pb-0 d-flex">
              <div class="caption">Nº de planilla</div>
              <div class="pl-2">${itemDep.number}</div>
            </div>            
            <div class="v-card-text pb-0 d-flex">
              <div class="caption">Total depósito</div>
              <div class="pl-2">${this.formatNumber(itemDep.amount)}</div>
            </div>
            <div class="v-card-text d-flex">
              <div class="caption">Total efectivo</div>
              <div class="pl-2">${this.formatNumber(itemDep.cash)}</div>
            </div></div>`
            index += 1
        })

        this.contentTot = await content
        this.contentTot = `<div style="padding: 20px;background: white;">${this.contentTot}</div>`
      },
    },
  }
</script>
<style scoped>
.ancho-sidebar {
  height: 135px;
  width: calc(100vw - 370px);
}
.width-table {
  width: calc(100vw - 370px);
}
.control-height {
    max-height: calc(100vh - 135px - 72px);
    min-height: calc(100vh - 135px - 72px);
    overflow-x: hidden;
    overflow-y: auto;
    border-top: 1px solid var(--v-gray-base);
}
.content-height {    
    max-height: calc(100vh - 200px);
    min-height: calc(100vh - 200px);
}
.content-div {
    height: 100%;
    border-left: 1px solid var(--v-gray-base);
}
.no-exam {
    color: var(--v-secondary-base) !important;
}
.width-table {
      width: calc(100vw - 368px);
  }
  .shadow {
    box-shadow: 0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%);
  }
  .altura {
    height: 135px;
  }
  .table-height {
    max-height: calc(100vh - 115px - 64px);
    overflow-x: hidden;
    overflow-y: auto;
  }
  .btn-close {
    position: absolute;
    top: -16px;
    right: 22px;
  }
  .deposito-step {    
    position: absolute;
    top: -8px;
    right: 5px;
    border-radius: 50%;
    background-color: #CA6702;
    color: white;
    height: 21px;
    width: 21px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
  }
</style>
