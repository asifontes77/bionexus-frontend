<template>
  <v-container pa-0 fluid fill-height class="align-start">
    <div>
      <div class="d-flex align-center flex-wrap sidebar bar-movement">
        <div class="pa-2" style="width: 260px;">
          <div class="text-h6 pl-8">CANCELACIÓN</div>
          <div class="mb-2 text-h7 pl-8">CUENTAS POR COBRAR</div>
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
                  v-model="dateRangeText"
                  label="Período"
                  outlined
                  prepend-icon="mdi-calendar"
                  readonly
                  dense
                  v-bind="attrs"
                  v-on="on"
                />
              </template>
              <v-date-picker
                v-model="date"
                range
                locale="es"
                no-title
              >
                <v-spacer></v-spacer>
                <v-btn
                  text
                  color="primary"
                  @click="menuDate = false"
                >
                  OK
                </v-btn>
              </v-date-picker>
            </v-menu>
        </div>
        <div class="pa-2 col-sidebar">
          <v-select
            v-model="clientSelection"
            :items="listClient"
            label="Cliente"
            item-text="business_name"
            item-value="id"
            dense
            outlined
            hide-details
            class="mt-2"
            @change="generateQuery()"
          />
        </div>
        <div v-if="selected.length !== 0" class="pa-2 col-sidebar">
          <div class="text-h8 font-weight-medium d-flex align-center">
            <v-chip
              color="primary"
              text-color="white"
              class="mr-2"
            >
              {{ selected.length }}
            </v-chip>
            Seleccionado
          </div>
          <v-btn
            outlined
            color="secondary"
            class="mt-2"
            @click="activateReceivePayment()"
          >
            cancelar selección
          </v-btn>
        </div>
      </div>
      <div class="pa-10 altura-tabla">
        <queries-table-invoices 
          v-if="newQuery"
          :key="newQueryKey"
          :new-query="newQuery"
          @selected-quantity="selectedQuantity"
        />
      </div>
    </div>
    <type-payment-dialog
      v-if="activateTypePayment"
      v-model="activateTypePayment"
      :key="typePaymentKey"
      :way-pay-tmp="wayPay"
      :total-cancel-tmp="totalCancel"
      :cancel-dollars="cancelDollars"
      @accept-cancellation="acceptCancellation"
    />
  </v-container>
</template>
<script>
  import pacientsMixin from '@/mixins/services/pacientsMixin'
  import accountsreceivableMixin from '@/mixins/services/accountsreceivableMixin'
  import QueriesTableInvoices from '@/components/modules/movements/QueriesTableInvoices'
  import TypePaymentDialog from '@/components/modules/movements/TypePaymentDialog.vue'
  export default {
    name: 'CancelAccountsReceivable',
    components: {QueriesTableInvoices, TypePaymentDialog},
    mixins: [pacientsMixin, accountsreceivableMixin],
    data() {
      return {
        date: [],
        listClient: [],
        clientSelection: 0,
        menuDate: false,
        newQuery: null,
        selected: [],
        wayPay: [],
        totalCancel: 0,
        activateTypePayment: false,
        cancelDollars: false,
        typePaymentKey: 0,
        newQueryKey: 0,
      }
    },
    watch: {
      'date': {
        handler() {
          this.generateQuery()
        },
      },
    },
    computed: {
      dateRangeText () {
        return this.date.join(' ~ ')
      },
    },
    async mounted() {
      await this.searchClientList()
      await this.getDate()
    },
    methods: {
      getDate() {
        const now = new Date();
        const firstDate = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        this.date.push(this.formatDateToYYYYMMDD(firstDate))
        this.date.push(this.formatDateToYYYYMMDD(lastDate))
      },
      async searchClientList() {
        let result = await this.getClientList()
        if (result) {
          result = result.filter(item => item.id !== 1)
          this.listClient = result.map(({ id, business_name, charge_dollars }) => ({ id, business_name, charge_dollars }))
        }
        if (this.listClient.length !== 0) {
          this.clientSelection = this.listClient[0].id
        }          
      },
      async generateQuery() {
        var firstDate
        var lastDate
        if (this.date.length !== 0) {
          firstDate = this.date[0]
          lastDate = this.date[1]
        } else if (this.date.length === 1) {
          firstDate = this.date[0]
          lastDate = this.date[0]
        }
        this.newQueryKey += 1
        this.newQuery = await {
          clientId: this.clientSelection,
          firstDate: firstDate,
          lastDate: lastDate,
        }
        const itemSelected = this.listClient.find(objeto => objeto.id === this.clientSelection)
        this.cancelDollars = itemSelected.charge_dollars === 0 ? false : true
        this.selected = []
      },
      formatDateToYYYYMMDD(date) {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      },      
      selectedQuantity(value) {
        this.selected = value
        if (this.selected.length !== 0) {
          this.totalCancel = this.selected.reduce((acumulador, item) => acumulador + parseFloat(item.total), 0)
        }
      },
      activateReceivePayment() {
        this.typePaymentKey += 1
        this.activateTypePayment = true
      },
      async acceptCancellation(wayPay) {
        const fechaActual = this.currentDate()
        const newWayPay = {
          id_users: localStorage.clientId,
          id_patients: 0,
          id_client: this.clientSelection,
          date: fechaActual,
          date_patients: fechaActual,
          annulment: false,
        }
        var result = await this.setwayPay(newWayPay)
        const wayPayId = result.id
        wayPay.wayPay.forEach(async (item) => {
          item.id_way_pay = wayPayId
          result = await this.setNewWayPay(item)
        })
        await this.asyncForEach(this.selected, async (item) => {
          const newChanges = {
            total_canceled: wayPay.total,
            user_id_canceled: localStorage.clientId,
            date_canceled: fechaActual,
          }
          result = await this.updateAccountsReceivable(item.id, newChanges)
        })
        
        this.generateQuery()
        this.activateTypePayment = false
      },
      async asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
          await callback(array[index], index, array);
        }
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
    },
  }
</script>
<style scoped>
.altura {
  height: 115px;
}
.bar-movement {
  min-height: 115px;
  width: calc(100vw - 56px);
}
.col-sidebar {
  min-height: 115px;
  width: 250px;
  border-left: 1px solid #CDBE92;
  display: flex;
  flex-direction: column;
}
.altura-tabla {
  width: calc(100vw - 70px);
  overflow-y: hidden;
  overflow-x: hidden;
}
</style>