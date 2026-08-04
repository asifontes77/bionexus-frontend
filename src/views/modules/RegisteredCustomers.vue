<template>
  <v-container pa-0 fluid fill-height class="align-start">
    <div>
      <div class="d-flex align-center justify-space-between sidebar bar-movement">
        <div class="pa-4">
          <div class="mb-6 text-h6 primary--text">CLIENTES REGISTRADOS</div>
        </div> 
        <div class="px-6 col-sidebar">
          <v-btn v-if="!itemEdit" color="primary" @click="newRecord()">nuevo cliente</v-btn>
        </div>       
      </div>
      <div v-if="!itemEdit" class="pa-10 altura-tabla">
        <customers-table @active-edit="activeEdit" :reset-table="resetTable" />
      </div>
      <div v-else class="pa-10 altura-tabla">
        <v-btn
          text
          color="secondary"
          @click="itemEdit=!itemEdit"
        >
          <v-icon left>mdi-arrow-left-bold</v-icon>
          volver
        </v-btn>
        <customers-edit
          :item-edit-tmp="changeEdit"
          @close-model="itemEdit=!itemEdit"
          @accept-edit="acceptEdit"
        />
      </div>
    </div>
  </v-container>
</template>
<script>
import CustomersTable from '@/components/modules/movements/CustomersTable'
import CustomersEdit from '@/components/modules/movements/CustomersEdit'
import clientMixin from '@/mixins/services/clientMixin'

export default {
  name: 'RegisteredCustomers',
  components: {CustomersTable, CustomersEdit},
  mixins: [clientMixin],
  data() {
    return {      
      itemEdit: false,
      changeEdit: {},
      resetTable: false,
    }
  },
  methods: {
    activeEdit(item) {
      this.itemEdit = true
      this.changeEdit = item
    },
    newRecord() {
      this.changeEdit = {
        id: -1,
        business_nam: '',
        address: '',
        phone: '',
        person_charge: '',
        discount: 0.00,
        rif: '',
        Print_invoice: 0,
        hide_client: 0,
        tariff: 1,
        credit: 0,
        charge_dollars: 0
      }
      this.itemEdit = true
    },
    async acceptEdit(item) {
      var result = null
      if (item.id === -1) {
        delete item.id
        result = await this.createClient(item)
      } else {
        result = await this.updateClient(item.id, item)
      }
      this.itemEdit = false
      this.resetTable = true
    },
  },
}
</script>
<style scoped>
.bar-movement {
  min-height: 60px;
  max-height: 60px;
  width: calc(100vw - 56px);
}
.altura-tabla {
  width: calc(100vw - 56px);
  overflow-y: hidden;
  overflow-x: hidden;
}
.col-sidebar {
  width: 200px;
  display: flex;
  flex-direction: column;
}
</style>