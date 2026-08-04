<template>
  <v-container pa-0 fluid fill-height class="align-start">
    <div class="d-flex">
      <v-list width="300" color="background" class="pt-0" style="border-right: 1px solid rgba(0,0,0,.12)">
        <v-subheader 
          class="sidebar primary--text d-flex flex-column align-start altura"
        >
          <div class="text-h6 pl-8">FACTURAS EMITIDAS</div>
          <div class="text-h7 pl-8">POR PACIENTES</div>
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
              @click="getPatientInvoiceList()"
            >
              <v-icon :class="rotar ? 'rotate-item' : ''">mdi-cached</v-icon>
            </v-btn>
          </div>
        </v-subheader>
        <div class="control-height">
          <div
            class="list-all"
            :class="activeAll ? 'secondary100' : ''"
            @click="getAllInvoice()"
          >
            <div class="content-all">
              <div class="title-all" :class="activeAll ? 'secondary--text' : 'texto--text'">Todas las Facturas</div>
              <div :class="activeAll ? 'secondary--text' : 'texto--text'">
                de fecha {{ date }}
              </div>
            </div>
            <div class="icon-all">
              <v-icon
                v-if="!activeAll"
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
            </div>
          </div>
          <v-list
            flat
            three-line
            class="py-0"
          >
            <v-list-item-group
              v-model="selected"
              active-class="secondary--text"
            >
              <template
                v-for="item in patientList"
              >
                <v-list-item :key="item.id" style="border-bottom: 1px solid #F0F0F0">
                  <template v-slot:default="{ active }">
                    <v-list-item-content>
                      <v-list-item-title>{{ item.patient_position }} {{ item.name }}</v-list-item-title>
                      <v-list-item-subtitle>Facturas #: {{ item.invoice }}</v-list-item-subtitle>
                      <v-list-item-subtitle>Notas de créditos #: {{ item.creditnote }}</v-list-item-subtitle>
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
      <Invoice-table
        :key="invoiceTableKey"
        :invoice-list="invoiceList"
        :headers="headers"
        @change-list="getPatientInvoiceList()"
      />
    </div>
  </v-container>
</template>

<script>
import pacientsMixin from '@/mixins/services/pacientsMixin'
import invoiceMixin from '@/mixins/services/invoiceMixin'
import InvoiceTable from '@/components/modules/movements/InvoiceTable'

export default {
  name: 'InvoiceMovements',
  components: {InvoiceTable},
  mixins: [pacientsMixin, invoiceMixin],
  data() {
    return {
      date: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
      menuDate: false,
      rotar: true,
      patientList: [],
      invoiceList: [],      
      headers: [
        {text: 'Fecha', align: 'start', value: 'date'},
        {text: 'Nº', align: 'start', value: 'no_invoice'},
        {text: 'Tipo de documento', align: 'start', value: 'document_type'},
        {text: 'RIF', align: 'start', value: 'rif'},
        {text: 'Monto', align: 'end', value: 'total'},
        {text: 'Monto Exento', align: 'end', value: 'exento'},
        {text: 'Base Imponible', align: 'end', value: 'tax_base'},
        {text: '% Alicuota', align: 'end', value: 'iva'},
        {text: 'Impuesto IVA', align: 'end', value: 'iva_total'},
        {text: 'Acción', value: 'actions', align: 'center', sortable: false },
      ],
      invoiceTableKey: 0,
      selected: null,
      selectedPatient: null,
      activeAll: false,
    }
  },
  watch: {
    'date': {
        handler() {
          this.getPatientInvoiceList()
        },
    },
    'selected': {
        handler(value) {
          this.createList(value)
        }
      },
  },
  async mounted() {
    await this.getPatientInvoiceList()
  },
  methods: {
    async getPatientInvoiceList() {
      this.rotar = true
      this.invoiceList = []
      this.patientList = []
      this.selected = null
      const newQuery = {
        date: this.date,
      }
      const result = await this.getPatientsWithInvoice(newQuery)
      if (result) {
        
        this.patientList = result
      }
      this.rotar = false
    },    
    async createList(value) {
      this.invoiceList = []
      this.activeAll = false
      if (typeof value === 'undefined') {   
        this.selectedPatient = null
      } else {    
        this.selectedPatient = await this.patientList[value] 
        this.getInvoiceList()
      }
    },
    async getInvoiceList() {
      if (this.selectedPatient) {
        const newInvoice = this.selectedPatient.invoice.split(",")
        const newNumers = {
          number: newInvoice,
        }
        const result = await this.getInvoiceByNumber(newNumers)
        if (result) {     
          if (this.selectedPatient.creditnote.length !== 0) {
            const newNC = this.selectedPatient.creditnote.split(",")
            const newNCNumers = {
              number: newNC,
            }
            const resultNc = await this.getNCByNumber(newNCNumers)
            this.createInvoiceList(result.concat(resultNc))
          } else {
            this.createInvoiceList(result)
          }
          this.invoiceTableKey += 1
        }
      }
    },
    async createInvoiceList(result) {
      this.headers = [
        {text: 'Fecha', align: 'start', value: 'date', width: '120px'},
        {text: 'Nº', align: 'start', value: 'no_invoice', width: '100px'},
        {text: 'Tipo de documento', align: 'start', value: 'document_type', width: '120px'}
      ]
      this.invoiceList = []
      if (result) {
        let ini = true
        let Hdescription = []
        await this.asyncForEach(result, async (element) => {
          let description = ''
          let niva = 1
          element.foot_payments.forEach(campos => {
            if (campos.description !== 'Exonerado:') {
              if (campos.description === 'TOTAL A PAGAR') {
                description = 'total'
                element[description] = this.formatNumber(campos.total)
                if (ini) {
                  let newCampo = {
                    id: 0,
                    text: 'Monto',
                    align: 'end',
                    value: 'total',
                    width: '120px'
                  }
                  Hdescription.push(newCampo)
                }
              } else if (campos.description === 'SUB-TOTAL') {
                description = 'subtotal'
                element[description] = this.formatNumber(campos.total)
              } else if (campos.description === 'IVA:') {
                description = `tax_base_${campos.value.split('.')[0]}`
                element[description] = this.formatNumber(campos.sobre)
                description = `iva_${campos.value.split('.')[0]}`
                element[description] = this.formatNumber(campos.value)
                description = `iva_total${campos.value.split('.')[0]}`
                element[description] = this.formatNumber(campos.total)
                if (ini) {
                  let newCampo = {
                    id: 3 + niva,
                    text: 'Base Imponible',
                    align: 'end',
                    value: `tax_base_${campos.value.split('.')[0]}`,
                    width: '120px'
                  }
                  Hdescription.push(newCampo)
                  niva +=1
                  newCampo = {
                    id: 3 + niva,
                    text: '% Alicuota',
                    align: 'end',
                    value: `iva_${campos.value.split('.')[0]}`,
                    width: '100px'
                  }
                  Hdescription.push(newCampo)
                  niva +=1
                  newCampo = {
                    id: 3 + niva,
                    text: 'Impuesto IVA',
                    align: 'end',
                    value: `iva_total${campos.value.split('.')[0]}`,
                    width: '120px'
                  }
                  Hdescription.push(newCampo)
                  niva +=1
                }
              } else if (campos.description === 'IGTF:') {
                description = `IGFT`
                element[description] = this.formatNumber(campos.total)
                if (ini) {
                  let newCampo = {
                    id: 3,
                    text: `IGFT ${campos.value.split('.')[0]}%`,
                    align: 'end',
                    value: 'IGFT',
                    width: '100px'
                  }
                  Hdescription.push(newCampo)
                }
              } else if (campos.description === 'DESCUENTO (%)') {
                description = `DESCUENTO`
                element[description] = this.formatNumber(campos.total)
                if (ini) {
                  let newCampo = {
                    id: 1,
                    text: 'Descuento',
                    align: 'end',
                    value: 'DESCUENTO',
                    width: '80px'
                  }
                  Hdescription.push(newCampo)
                }
              }
            }
          })
          if (ini) {
            let newCampo = {
              id: 2,
              text: 'Monto Exento',
              align: 'end',
              value: 'exento',
              width: '120px'
            }
            Hdescription.push(newCampo)
            ini = false
            Hdescription.sort((a, b) => a.id - b.id)
            Hdescription = Hdescription.map(object => {
              let { id, ...rest } = object
              return rest
            })
            newCampo = {text: 'Acción', value: 'actions', align: 'center', sortable: false, width: '80px' }
            Hdescription.push(newCampo)
          }
        })
        this.headers = this.headers.concat(Hdescription)
        this.invoiceList = result
      }
      this.invoiceTableKey += 1
    },
    async getAllInvoice() {
      if (!this.activeAll) {
        this.selected = null
        const newAll = {
          date: this.date,
        }
        const result = await this.getInvoicesDate(newAll)
        await this.createInvoiceList(result)
        this.activeAll = true
      } else {
        this.activeAll = false
      }
    },    
    formatNumber(number) {
      return new Intl.NumberFormat('de-DE', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      }).format(number);
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
.ancho-sidebar {
  height: 115px;
  width: calc(100vw - 370px);
}
.width-table {
  width: calc(100vw - 370px);
}
.control-height {
    max-height: calc(100vh - 115px - 72px);
    min-height: calc(100vh - 115px - 72px);
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
    height: 115px;
  }
  .table-height {
    max-height: calc(100vh - 115px - 64px);
    overflow-x: hidden;
    overflow-y: auto;
  }
  .list-all {
    width: 100%;
    border-bottom: 1px solid rgb(240, 240, 240);
    background-color: white;
    min-height: 64px;
    padding: 0 16px;
    display: flex;
    cursor: pointer;
  }
  .content-all {
    display: flex;
    flex-wrap: wrap;
    flex: 1 1;
    overflow: hidden;
    padding: 12px 0;
  }
  .title-all {
    line-height: 1.2;
    margin-bottom: 2px;
    font-size: 1rem;
  }
  .icon-all {
    margin-left: 16px;
    padding-bottom: 10px;
    display: flex;
    align-items: flex-end;
    align-self: stretch;
    justify-content: flex-end;
    white-space: nowrap;
    flex-direction: column;
  }
</style>
