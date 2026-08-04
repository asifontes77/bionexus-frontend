<template>
  <v-container pa-0 fluid fill-height class="align-start">
    <div>
      <div class="d-flex align-center flex-wrap sidebar bar-movement">
        <div class="pa-2" style="width: 300px;">
          <div class="mb-6 text-h6 primary--text">PRUEBAS ESPECIALES</div>
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
            v-model="specialSelection"
            :items="listSpecial"
            label="Laboratorio"
            item-text="description"
            item-value="id"
            dense
            outlined
            hide-details
            class="mt-2"
            @change="generateQuery()"
          />       
        </div>
        <div class="pa-2 col-sidebar col-right pr-6">
          <div class="d-flex justify-end align-end">        
            <v-btn
              outlined
              color="primary"
              depressed
              :disabled="disabledPrint"
              @click="activePrint()"
            >
              <v-icon left>mdi-printer</v-icon>
              imprimir
            </v-btn>
          </div>
        </div>
      </div>
      <div class="pa-10 altura-tabla">
        <queries-table v-if="newQuery" :new-query="newQuery" @btn-print="btnPrintEnabled" />
      </div>
      <print-special-test v-if="sendPrint" :new-query="newQueryPrint" @close-print="sendPrint=false" />
    </div>
  </v-container>
</template>
<script>
  import specialTestsMixin  from '@/mixins/services/specialTestsMixin'
  import QueriesTable from '@/components/modules/history/QueriesTable.vue'
  import functionMixin from '@/mixins/util/functionMixin'
  import PrintSpecialTest from '@/components/modules/history/PrintSpecialTest.vue'

  export default {
    name: 'SpecialTestResults',
    components: {QueriesTable, PrintSpecialTest},
    mixins: [specialTestsMixin, functionMixin],
    data() {
      return {
        menuDate: false,
        date: [],
        especialSelection: 0,
        listSpecial: [],
        specialSelection: 0,
        newQuery: null,
        disabledPrint: true,
        selectedItems: [],
        newQueryPrint: {},
        sendPrint: false,
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
      await this.searchSpeciallList()
      await this.getDate()
    },
    methods: {
      btnPrintEnabled(enabled, selected) {
        this.disabledPrint = !enabled
        this.selectedItems = selected
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
          laboratory: this.specialSelection,
        }
      },
      async searchSpeciallList() {
        const result = await this.getSpecialTestLabList()
        if (result) {
          this.listSpecial = result.map(({ id, description }) => ({ id, description }))
          console.log('this.listSpecial: ', this.listSpecial)
        }
        const newObject = {
          id: 0,
          description: '**SIN SELECCION**'
        }
        this.listSpecial.unshift(newObject)
      },
      activePrint() {        
        var firstDate
        var lastDate
        if (this.date.length !== 0) {
          firstDate = this.date[0]
          lastDate = this.date[1]
        } else if (this.date.length === 1) {
          firstDate = this.date[0]
          lastDate = this.date[0]
        }
        this.newQueryPrint = {
          firstDate: firstDate,
          lastDate: lastDate,
          laboratory: this.specialSelection,
          items: this.selectedItems
        }
        this.sendPrint = true
      },
      getDate() {
        const now = new Date();
        const firstDate = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        this.date.push(this.formatDateToYYYYMMDD(firstDate))
        this.date.push(this.formatDateToYYYYMMDD(lastDate))
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
.col-right {
  display: flex;
  width: calc(100% - 600px);
}
</style>
