<template>
  <v-container pa-0 fluid fill-height class="align-start">
    <div>
      <div class="d-flex align-center flex-wrap sidebar bar-movement">
        <div class="pa-2" style="width: 260px;">
          <div class="mb-6 text-h6 primary--text">CUENTAS POR COBRAR</div>
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
        <div class="pa-2 text-h8 font-weight-medium col-sidebar">
          <div class="d-flex justify-space-between">
            <div>TOTAL Bs.</div>
            <div>{{ formatNumber(total) }}</div>
          </div>
          <div v-if="dollarValue" class="d-flex align-center justify-space-between">
            <div class="caption secondary--text">
              <div>Valor del dolar ({{ dollarValue.date }})</div>
              <div>$ {{ formatNumber(dollarValue.value) }}</div>
            </div>
            <v-btn
              text
              color="primary"
              class="px-0 mr-2"
              style="min-width: 0;"
              @click="newDollar = !newDollar"
            >
              <v-icon>mdi-loupe</v-icon>
            </v-btn>
          </div>
          <div class="d-flex justify-space-between">            
            <div>TOTAL EN $</div>
            <div>{{ formatNumber(totalDollars) }}</div>
          </div>
        </div>
        <div v-if="selected.length !== 0" class="pa-2 col-sidebar" style="width: 200px">
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
            @click="activateCreateInvoice()"
          >
            facturar
          </v-btn>
        </div>
        <div v-if="createInvoice" class="pa-2 col-sidebar">
          <v-btn
            outlined
            color="secondary"
            class="mt-2"
            @click="btnRegisterCreateInvoice"
          >
            imprimir y registrar
          </v-btn>
          <v-progress-linear
            v-if="activeRegisterCreateInvoice"
            indeterminate
            color="secondary"
          />
        </div>
      </div>
      <div v-if="!createInvoice" class="pa-10 altura-tabla">
        <queries-table
          :new-query="newQuery"
          :show-select="showSelect"
          @selected-quantity="selectedQuantity"
        />
      </div>
      <div v-else class="pa-10 altura-tabla">
        <create-invoice
          v-if="createInvoice"
          :selected-invoice="selectedId"
          :client-selection="clientSelection"
          :activate-create-invoice="registerCreateInvoice"
          :dollar-value="dollarValue"
          @close-invoice="closeInvoice()"
          @record-receivables="recordReceivables"
        />
      </div>
      <new-dollar-dialog 
        v-model="newDollar"
        @set-newdolar="activeNewDollar"
      />
    </div>
  </v-container>
</template>
<script>
  import QueriesTable from '@/components/modules/movements/QueriesTable.vue'
  import CreateInvoice from '@/components/modules/movements/CreateInvoice.vue'
  import pacientsMixin from '@/mixins/services/pacientsMixin'
  import waypayMixin from '@/mixins/services/waypayMixin'
  import functionMixin from '@/mixins/util/functionMixin'
  import NewDollarDialog from '@/components/modules/admission/NewDollarDialog.vue'

  export default {
    name: 'AccountsReceivable',
    components: {QueriesTable, CreateInvoice, NewDollarDialog},
    mixins: [pacientsMixin, functionMixin, waypayMixin],
    data() {
      return {
        menuDate: false,
        date: [],
        clientSelection: 0,
        listClient: [],
        newQuery: null,
        total: 0,
        totalDollars: 0,
        dollarValue: null,
        showSelect: true,
        selected: [],
        selectedId: [],
        createInvoice: false,
        newDollar: false,
        registerCreateInvoice: false,
        activeRegisterCreateInvoice: false,
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
      await this.getDollar()
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
      async getDollar() {
        const result = await this.getDollarValue()
        if (result) {
          this.dollarValue = result
          const date = this.dollarValue.date
          this.dollarValue.date = date.split('T')[0]
        }
      },
      async searchClientList() {
        let result = await this.getClientList()
        if (result) {
          result = result.filter(item => item.id !== 1)
          this.listClient = result.map(({ id, business_name }) => ({ id, business_name }))
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
        this.newQuery = await {
          firstDate: firstDate,
          lastDate: lastDate,
          namePatient: '',
          userSelection: 0,
          clientSelection: this.clientSelection,
          clientSelectionStatus: 0,
          ciPatient: '',
          invoice: true,
        }
        const result = await this.getPatientsWithQueriesTotal(this.newQuery)
        if (result) {
          this.total = result.total
          this.totalDollars = Math.round(result.total / this.dollarValue.value)
        }
      },
      formatDateToYYYYMMDD(date) {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      },
      selectedQuantity(value) {
        this.selected = value
      },
      activateCreateInvoice() {
        this.selectedId = this.selected.map(objeto => objeto.id)
        this.createInvoice = true
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
      }, 
      activatePrintRegister() {
        console.log('activatePrintRegister')
      },
      closeInvoice() {
        this.createInvoice=false
        this.selected=[]
      },
      btnRegisterCreateInvoice() {
        this.activeRegisterCreateInvoice = true
        this.registerCreateInvoice = true
      },
      async recordReceivables(listFact) {
        await this.asyncForEach(this.selectedId, async (item) => {
          const newChange = {
            invoice: listFact,
          }
          await this.updatePatient(item, newChange)
        })
        this.activeRegisterCreateInvoice = false
        this.closeInvoice()
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