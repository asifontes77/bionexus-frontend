<template>
  <div class="table-container">
    <v-data-table
      v-model="selectedItems"
      :headers="headers"
      :items="databaseList"
      :single-expand="singleExpand"
      :expanded.sync="expanded"
      item-key="id"
      show-expand
      show-select
      :single-select="singleSelect"
      :loading="loading"
      loading-text="Cargando... por favor espere"
      style="overflow-x: auto"
      hide-default-footer
    >
      <template v-slot:[`item.sex`]="{ item }">
        <v-icon v-if="item.sex===1 || item.sex==='Masculino'" color="secondary">mdi-face-man</v-icon>
        <v-icon v-else color="secondary">mdi-face-woman</v-icon>
      </template>
      <template v-slot:[`item.age`]="{ item }">
        {{ item.age }} {{ item.month_year }}
      </template>
      <template v-slot:[`item.admission_time`]="{ item }">
        {{ formatTime12Hour(item.admission_time) }}
      </template>
      <template v-slot:expanded-item="{ headers, item }">
        <td :colspan="headers.length">
          <div v-for="exam in item.exams" :key="item.id - exam.id" class="ml-2">
            - {{ exam.description }}
          </div>
        </td>
      </template>
    </v-data-table>
  </div>
</template>
<script>
  import specialTestsMixin  from '@/mixins/services/specialTestsMixin'
  import functionMixin from '@/mixins/util/functionMixin'

  export default {
    name: 'QueriesTable',
    mixins: [specialTestsMixin, functionMixin],
    props: {
      newQuery: {
        type: Object,
        default: () => ({})
      },
    },
    data() {
      return {
        singleSelect: false,
        singleExpand: false,
        databaseList: [], 
        expanded: [],
        selectedItems: [],
        headers: [
          {text: 'Fecha', align: 'star', value: 'admission_date', width: '150px' },
          {text: 'Hora', align: 'star', value: 'admission_time', width: '100px', sortable: false},
          {text: 'Secuencia', align: 'center', value: 'patient_position', width: '90px', sortable: false},
          {text: 'Paciente', align: 'star', value: 'name', width: '150px'},
          {text: 'CI', align: 'star', value: 'document_number', width: '90px'},
          {text: 'Edad', align: 'star', value: 'age', width: '100px', sortable: false},
          {text: 'Sexo', align: 'star', value: 'sex', width: '90px', sortable: false},
          {text: 'Teléfono', align: 'star', value: 'phone', width: '150px', sortable: false},
          {text: 'Observación', align: 'star', value: 'observation', sortable: false, width: '150px'}
        ],
        loading: true,
      }
    },
    watch: {
      'newQuery': {
        handler() {
          this.generateQuery()
        }
      },
      'selectedItems': {
        handler(value) {
          if (value.length !== 0) {
            this.$emit('btn-print', true, value)
          } else {
            this.$emit('btn-print', false, value)
          }
        }
      },
    },
    mounted() {
      this.generateQuery()
    },
    methods: {
      async generateQuery() {
        if (this.newQuery) {
          this.loading = true
          this.databaseList = []
          const result = await this.getSpecialTestLab(this.newQuery.laboratory)
          console.log('this.newQuery: ', result)
          if (result && this.newQuery.laboratory !== 0) {
            const exam = []
            result.specialTestItems.forEach((item) => {
              exam.push(item.exam_list_Id)
            })
            const newQuery = {
              firstDate: this.newQuery.firstDate,
              lastDate: this.newQuery.lastDate,
              examIds: exam,
            }
            console.log('newQuery: ', newQuery)
            const resultPac = await this.getPatientsSpecial(newQuery)
            if (resultPac) {
              this.databaseList = resultPac
            console.log('this.databaseList: ', this.databaseList)
            }
          }
        }
        this.loading = false
      }, 
    },
  }
</script>