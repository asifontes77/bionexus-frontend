<template>
  <v-container pa-0 fluid fill-height class="align-start">
    <div>
      <div class="d-flex align-center justify-space-between sidebar bar-movement">
        <div class="pa-4">
          <div class="mb-6 text-h6 primary--text">USUARIOS REGISTRADOS</div>
        </div> 
        <div class="px-6 col-sidebar">
          <v-btn v-if="!itemEdit" color="primary" @click="newRecord()">nuevo usuario</v-btn>
        </div>       
      </div>
      <div v-if="!itemEdit" class="pa-10 altura-tabla">
        <users-table
          @active-edit="activeEdit"
          :reset-table="resetTable"
        />
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
        <user-edit
          :item-edit-tmp="changeEdit"
          @accept-edit="acceptEdit"
          @close-model="itemEdit=!itemEdit"
        />
      </div>
    </div>
  </v-container>
</template>
<script>
import UsersTable from '@/components/modules/setting/UsersTable'
import UserEdit from '@/components/modules/setting/UserEdit'
import usersMixin from '@/mixins/services/usersMixin'

export default {
  name: 'RegisteredUsers',
  components: {UsersTable, UserEdit},
  mixins: [usersMixin],
  data() {
    return {      
      itemEdit: false,
      changeEdit: {},
      resetTable: false,
    }
  },
  methods: {
    activeEdit(item) {
      delete item.password
      this.itemEdit = true
      this.changeEdit = item
    },
    newRecord() {
      this.changeEdit = {
        id: -1,
        name: '',
        user_name: '',
        college_number: '',
        password: '',
        telephone: '',
        direction: '',
        position: '',
        email: '',
        roles: '',
        passwordSignature: '',
        hide_user: 0,
      }
      this.itemEdit = true
    },
    async acceptEdit(item) {
      var result = null
      if (item.id === -1) {
        delete item.id
        result = await this.createUser(item)
      } else {
        result = await this.changeUserById(item.id, item)
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