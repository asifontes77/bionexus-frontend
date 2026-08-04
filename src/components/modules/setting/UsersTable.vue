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
    <template v-slot:item.hide_user="{ item }">
      <v-icon
        color="gray300"
        @click="editItem(item)"
      >
        mdi-delete-outline
      </v-icon>
    </template>
    <template v-slot:item.roles="{ item }">
      <v-chip-group column>
        <v-chip
          v-for="(role, index) in item.roles"
          :key="index"
          class="mx-1"
          color="green"
          small
          text-color="white"
        >
          {{ role }}
        </v-chip>
      </v-chip-group>
    </template>
    <template v-slot:item.actions="{ item }">      
      <v-icon
        v-if="item.id !== 1"
        color="primary"
        @click="editItem(item)"
      >
        mdi-pencil
      </v-icon>
    </template>
  </v-data-table>
</template>
<script>
  import usersMixin from '@/mixins/services/usersMixin'

  export default {
    name: 'UsersTable',
    mixins: [usersMixin],
    data() {
      return {
        headers: [
        {text: '', align: 'center', value: 'hide_user', width: '50px', sortable: false},
        {text: 'Nombre completo', align: 'star', value: 'name', width: '150px'},
        {text: 'Nombre de usuario', align: 'star', value: 'user_name', width: '150px'},
        {text: 'Teléfono', align: 'star', value: 'telephone', width: '150px'},
        {text: 'Email', align: 'star', value: 'email', width: '150px'},
        {text: 'Dirección', align: 'star', value: 'direction', width: '150px', sortable: false },
        {text: 'Cargo', align: 'star', value: 'position', width: '90px'},
        {text: 'Nº colegiatura', align: 'star', value: 'college_number', width: '90px', sortable: false},
        {text: 'Roles', align: 'star', value: 'roles', width: '200px', sortable: false},
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
          if (value) this.getUsers()
        },
      },
    },
    mounted() {
      this.getUsers()
    },
    methods: {
      async getUsers() {
        this.loading = true
        const result = await this.getUsersOrder()
        if (result) {          
          this.databaseList = await  result.map(item => {
            var newRoles = item.roles.split(',')
            return {
              ...item,
              roles: newRoles,
            }
          })
        }
        this.loading = false
      },
      rowClass(item) {
        return item.hide_user === 1 ? 'canceled-row' : '';
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