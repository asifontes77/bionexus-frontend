<template>
  <v-data-table
    :headers="headers"
    :height="tableHeight"
    fixed-header
    :items="databaseList"
    :items-per-page="itemsPerPage"
    :item-class="rowClass"
    :loading="loading"
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
    <template v-slot:item.hide_client="{ item }">
      <v-icon v-if="item.hide_client===1" color="gray300">
        mdi-delete-outline
      </v-icon>
    </template>
    <template v-slot:item.business_name="{ item }">
      <td class="truncate-3-lines">{{ item.business_name }}</td>
    </template>
    <template v-slot:[`item.discount`]="{ item }">
      {{ formatNumber(item.discount) }}
    </template>
    <template v-slot:[`item.charge_dollars`]="{ item }">
      <v-icon v-if="item.charge_dollars===1" color="primary">
        mdi-check-bold
      </v-icon>
      <v-icon v-else color="secondary">
        mdi-close-thick
      </v-icon>
    </template>
    <template v-slot:[`item.Print_invoice`]="{ item }">
      <v-icon v-if="item.Print_invoice===1" color="primary">
        mdi-check-bold
      </v-icon>
      <v-icon v-else color="secondary">
        mdi-close-thick
      </v-icon>
    </template>
    <template v-slot:[`item.tariff`]="{ item }">
      <v-chip
        small
        color="green"
        text-color="white"
      >
        {{ item.tariff }}
      </v-chip>
    </template>
    <template v-slot:item.address="{ item }">
      <td class="truncate-3-lines">{{ item.address }}</td>
    </template>
    <template v-slot:item.actions="{ item }">      
      <v-icon
        color="primary"
        @click="editItem(item)"
      >
        mdi-pencil
      </v-icon>
    </template>
  </v-data-table>
</template>
<script>
  import clientMixin from '@/mixins/services/clientMixin'
  import functionMixin from '@/mixins/util/functionMixin'

  export default {
    name: 'CustomersTable',
    mixins: [clientMixin, functionMixin],
    props: {
      resetTable: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        headers: [
          {text: '', align: 'center', value: 'hide_client', width: '50px', sortable: false},
          {text: 'Razón social', align: 'star', value: 'business_name', width: '150px'},
          {text: 'RIF', align: 'star', value: 'rif', width: '90px'},
          {text: 'Persona a cargo', align: 'star', value: 'person_charge', width: '150px' },
          {text: 'Dirección', align: 'star', value: 'address', width: '150px', sortable: false },
          {text: 'Teléfono', align: 'star', value: 'phone', width: '150px'},
          {text: 'Descuento', align: 'end', value: 'discount', width: '90px', sortable: false},
          {text: 'Tarifa', align: 'center', value: 'tariff', width: '90px', sortable: false},
          {text: 'Cobro en $', align: 'center', value: 'charge_dollars', width: '90px', sortable: false},
          {text: 'Imprimir factura', align: 'center', value: 'Print_invoice', width: '90px', sortable: false},
          {text: 'Acción', value: 'actions', align: 'center', width: '50px', sortable: false },
        ],
        tableHeight: `${window.innerHeight - 350}px`,
        databaseList: [], 
        itemsPerPage: 20,
        loading: true,
      }
    },
    watch: {
      'resetTable': {
        handler(value) {
          if (value) this.getClients()
        },
      },
    },
    mounted() {
      this.getClients()
    },
    methods: {
      async getClients() {
        this.loading = true
        const result = await this.getClientListAll()
        if (result) {
          this.databaseList = result
        }
        this.loading = false
      },
      rowClass(item) {
        return item.hide_client === 1 ? 'canceled-row' : '';
      },
      editItem(item) {
        this.$emit('active-edit', item)
      },
    },

  }
</script>
<style scoped>
.truncate-3-lines {
  height: 64px !important;      /* Altura fija */
  overflow: hidden;  /* Oculta el contenido desbordante */
  display: -webkit-box;
  -webkit-line-clamp: 3; /* Limita a 3 líneas */
  -webkit-box-orient: vertical;
  white-space: normal;
  text-overflow: ellipsis; /* Muestra "..." al final del contenido */
}
.v-data-table td {
  vertical-align: top;
}
</style>