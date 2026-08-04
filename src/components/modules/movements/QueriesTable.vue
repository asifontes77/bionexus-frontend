<template>
  <div class="table-container">
    <v-data-table
      v-model="selected"
      :headers="headers"
      :height="tableHeight"
      fixed-header
      :items="databaseList"
      :items-per-page="itemsPerPage"
      :item-class="rowClass"
      :loading="loading"
      :single-select="singleSelect"
      :show-select="showSelect"
      style="overflow-x: auto"
      loading-text="Cargando... por favor espere"
      :footer-props="{
        'show-current-page': true,
        'show-first-last-page': true,
        'items-per-page-text': 'Elementos por página',
        'items-per-page-options': [5, 10, 15, 20, 25, -1],
        'items-per-page-all-text': 'Todos',
      }"
    >
      <template v-slot:[`item.canceled`]="{ item }">
        <v-icon v-if="item.canceled===1" color="gray300">mdi-close-circle</v-icon>
      </template>
      <template v-slot:[`item.admission_time`]="{ item }">
        {{ formatTime12Hour(item.admission_time) }}
      </template>    
      <template v-slot:[`item.age`]="{ item }">
        {{ item.age }} {{ item.month_year }}
      </template>
      <template v-slot:[`item.sex`]="{ item }">
        <v-icon v-if="item.sex===1" color="secondary">mdi-face-man</v-icon>
        <v-icon v-else color="secondary">mdi-face-woman</v-icon>
      </template>
      searchUser(id)
      <template v-slot:[`item.user_id`]="{ item }">
        {{ searchUser(item.user_id) }}
      </template>
      <template v-slot:[`item.total`]="{ item }">
       {{ formatNumber(item.total) }}
      </template>
      <template v-slot:[`item.total_dollars`]="{ item }">
       {{ formatNumber(item.total_dollars) }}
      </template>
      <template v-slot:[`item.total_canceled`]="{ item }">
        <v-icon v-if="parseFloat(item.total_canceled)!==0" color="primary">mdi-check-bold</v-icon>
        <v-icon v-else color="secondary">mdi-close-thick</v-icon>
      </template>
      <template v-slot:[`item.delivery_id`]="{ item }">
        <v-icon v-if="item.delivery_id!==0" color="primary">mdi-check-bold</v-icon>
      </template>
      <template v-slot:[`item.client_id`]="{ item }">
        <v-tooltip v-if="item.client_id!==1" left>
          <template v-slot:activator="{ on, attrs }">
            <v-icon
              color="primary"
              v-bind="attrs"
              v-on="on"
            >mdi-check-bold</v-icon>
          </template>
          <span>{{ item.client_name }}</span>
        </v-tooltip>        
      </template>      
    </v-data-table>
  </div>
</template>
<script>
  import pacientsMixin from '@/mixins/services/pacientsMixin'
  import usersMixin from '@/mixins/services/usersMixin'
  import functionMixin from '@/mixins/util/functionMixin'

  export default {
    name: 'QueriesTable',
    mixins: [pacientsMixin, usersMixin, functionMixin],
    props: {
      newQuery: {
        type: Object,
        default: () => ({})
      },
      showSelect: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        databaseList: [], 
        itemsPerPage: 20,
        headers: [
          {text: '', align: 'star', value: 'canceled', width: '50px', sortable: false},
          {text: 'Fecha', align: 'star', value: 'admission_date', width: '150px' },
          {text: 'Hora', align: 'star', value: 'admission_time', width: '100px', sortable: false},
          {text: '#', align: 'center', value: 'id', width: '100px', sortable: false},
          {text: 'Secuencia', align: 'center', value: 'patient_position', width: '90px', sortable: false},
          {text: 'Nombre', align: 'star', value: 'name', width: '150px'},
          {text: 'CI', align: 'star', value: 'document_number', width: '90px'},
          {text: 'Edad', align: 'star', value: 'age', width: '100px'},
          {text: 'Sexo', align: 'star', value: 'sex', width: '90px'},
          {text: 'Teléfono', align: 'star', value: 'phone', width: '150px'},
          {text: 'Total Bs.', align: 'end', value: 'total', width: '90px'},
          {text: 'Total $.', align: 'end', value: 'total_dollars', width: '90px'},
          {text: 'Cancelado', align: 'center', value: 'total_canceled', width: '90px'},
          {text: 'Entregado', align: 'center', value: 'delivery_id', width: '90px'},
          {text: 'En crédito', align: 'center', value: 'client_id', width: '90px'},
        ],
        selected: [],
        tableHeight: `${window.innerHeight - 350}px`,
        loading: true,
        singleSelect: false,
      }
    },
    watch: {
      'newQuery': {
        handler() {
          this.generateQuery()
        }
      },
      'selected': {
        handler(value) {
          if (this.showSelect) this.$emit('selected-quantity', value)
        },
      },
    },
    mounted() {
      this.generateQuery()
      window.addEventListener('resize', this.updateTableHeight)
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.updateTableHeight);
    },
    methods: {
      rowClass(item) {
        return item.canceled ? 'canceled-row' : '';
      },
      updateTableHeight() {
        this.tableHeight = `${window.innerHeight - 350}px`;
      },
      async generateQuery() {   
        this.loading = true   
        const result = await this.getPatientsWithQueries(this.newQuery)
        if (result) {
          this.databaseList = await Promise.all(result.map(async obj => {
            let user_name = await this.searchUser(obj.user_id)
            let client_name = ''
            if (obj.client_id !== 1) client_name = await this.searchClient(obj.client_id)
            return {
              ...obj,
              user_name: user_name,
              client_name: client_name,
            }
          }))
        }
        this.loading = false
      },
      async searchUser(id) {
        const result = await this.getUserById(id)
        return result.name
      },
      async searchClient(id) {
        const result = await this.getClients(id)
        return result.business_name
      },
    },
  }
</script>
<style scoped>
.table-container {
  overflow-x: auto;
  width: 100%;
}
</style>