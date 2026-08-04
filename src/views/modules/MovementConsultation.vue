<template>
  <v-container pa-0 fluid fill-height class="align-start">
    <div>
      <div class="d-flex align-center flex-wrap sidebar bar-movement">
        <div class="pa-2" style="width: 300px;">
          <div class="mb-6 text-h6 primary--text">CONSULTAS</div>
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
          <v-text-field
            v-model="namePatient"
            label="Nombre del paciente"
            placeholder="Nombre del paciente"
            outlined
            hide-details
            dense
            class="mt-2"
            @change="generateQuery()"
          />
          <v-text-field
            v-model="ciPatient"
            label="Documento de Identidad"
            placeholder="Escriba"
            outlined
            hide-details
            dense
            class="mt-2"
            @change="textCiPatient()"
          />
        </div>
        <div class="pa-2 col-sidebar">
          <v-select
            v-model="userSelection"
            :items="listUsers"
            label="Atendido por"
            item-text="name"
            item-value="id"
            dense
            outlined
            hide-details
            class="mt-2"
            @change="generateQuery()"
          />
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
          <v-select
            v-model="clientSelectionStatus"
            :items="listClientStatus"
            label="Cancelado"
            item-text="name"
            item-value="id"
            dense
            outlined
            hide-details
            class="mt-2"
            @change="generateQuery()"
          />
        </div>
      </div>
      <div class="pa-10 altura-tabla">
        <queries-table :new-query="newQuery" />
      </div>
    </div>
  </v-container>
</template>
<script>
  import QueriesTable from '@/components/modules/movements/QueriesTable.vue'
  import usersMixin from '@/mixins/services/usersMixin'
  import functionMixin from '@/mixins/util/functionMixin'
  import pacientsMixin from '@/mixins/services/pacientsMixin'
  
  export default {
    name: 'MovementConsultation',
    components: {QueriesTable},
    mixins: [usersMixin, pacientsMixin, functionMixin],
    data() {
      return {
        date: [],
        namePatient: '',
        ciPatient: '',
        userSelection: 0,
        clientSelection: 0,
        clientSelectionStatus: -1,
        menuDate: false,
        newQuery: null,
        listUsers: [],
        listClient: [],
        listClientStatus: [
          {name: 'TODOS', id: -1},
          {name: 'Cancelados', id: 1},
          {name: 'Pendiente', id: 0},
        ],

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
      await this.searchUserList()
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
      async textCiPatient() {
        if (this.ciPatient.length !== 0) {
          const num = Number(this.ciPatient)
          if (Number.isInteger(num)) {
            var numero = new Intl.NumberFormat('de-DE', { 
              minimumFractionDigits: 0, 
              maximumFractionDigits: 0 
            }).format(this.ciPatient)
            this.ciPatient = await numero
          }     
        }           
        this.generateQuery()
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
        this.newQuery = {
          firstDate: firstDate,
          lastDate: lastDate,
          namePatient: this.namePatient,
          userSelection: this.userSelection,
          clientSelection: this.clientSelection,
          clientSelectionStatus: this.clientSelectionStatus,
          ciPatient: this.ciPatient,
          invoice: false,
        }
      },
      async searchUserList() {
        const result = await this.getUsersOrder()
        if (result) {
          this.listUsers = result.map(({ id, name }) => ({ id, name }))
        }
        const newObject = {
          id: 0,
          name: '**SIN SELECCION**'
        }
        this.listUsers.unshift(newObject)
      },
      async searchClientList() {
        let result = await this.getClientList()
        if (result) {
          result = result.filter(item => item.id !== 1)
          this.listClient = result.map(({ id, business_name }) => ({ id, business_name }))
        }
        const newObject = {
          id: 0,
          business_name: '**SIN SELECCION**'
        }
        this.listClient.unshift(newObject)
      },
    },
  }
</script>
<style scoped>
.bar-movement {
  min-height: 115px;
  width: calc(100vw - 56px);
}
.altura-tabla {
  width: calc(100vw - 70px);
  overflow-y: hidden;
  overflow-x: hidden;
}
.col-sidebar {
  min-height: 115px;
  width: 300px;
  border-left: 1px solid #CDBE92;
  display: flex;
  flex-direction: column;
}
</style>