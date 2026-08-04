<template>
  <v-container pa-0 fluid fill-height class="align-start">
    <v-sheet
      width="100%"
      style="position: relative; height: calc(100vh - 64px);"
    >
      <div class="fill-height" style="width: calc(100% - 500px);">
        <div>
          <div class="d-flex justify-space-between align-center px-6 py-4 sidebar primary--text">
            <div class="text-h6">Forma de pagos</div>
            <div>
              <v-btn color="primary" outlined @click="setFP()">
                registrar
              </v-btn>
              <v-btn color="secondary" outlined class="ml-1" @click="newFP()">
                Nuevo
              </v-btn>
            </div>
          </div>
          <div style="width: 100%">
            <v-progress-linear
              v-if="saveLoad"
              indeterminate
              color="primary"
            />
          </div>
        </div>
        <div class="pa-6 list" style="height: calc(100vh - 134px); overflow-x: hidden; overflow-y: auto">
          <div
            v-for="element in listFP"
            :key="element.id"
            class="list-group item" 
            :class="element.active ? 'active' : ''"
          >
            <div class="d-flex align-center">
              <div style="width: 40px">
                <v-btn icon color="secondary" @click="activeSelected(element)">
                  <v-icon>mdi-cog</v-icon>
                </v-btn>
              </div>
              <div v-if="element.annulled" style="width: 40px">
                <v-icon>mdi-eye-off</v-icon>
              </div>
              <div style="width: calc(100% - 120px)">
                {{element.description}}
              </div>
            </div>
          </div>
        </div>
      </div>
      <v-navigation-drawer
        v-model="drawer"
        absolute
        right
        permanent
        width="500"
      >
        <div class="d-flex align-center px-6 sidebar primary--text" style="padding-top: 18px; padding-bottom: 17px">
          <v-icon left color="secondary">mdi-cog-outline</v-icon>
          <div class="text-h6">Configuración</div>
        </div>
        <v-divider></v-divider>
        <div v-if="activeSetting" class="pa-4">
          <v-text-field
            v-model="selectItem.description"
            label="Denominación"
            dense
            outlined
            hide-details
            maxlength="50"
            class="mb-4"
          />
          <v-text-field
            v-model="selectItem.description_1"
            label="Descripción 1"
            dense
            outlined
            hide-details
            maxlength="50"
            class="mb-4"
          />
          <v-text-field
            v-model="selectItem.description_2"
            label="Descripción 2"
            dense
            outlined
            hide-details
            maxlength="50"
          />
          <v-switch
            v-model="selectItem.only_dollars"
            label="En dólares"
            color="primary"
            hide-details
          />
          <v-switch
            v-model="selectItem.annulled"
            label="Ocultar"
            color="secondary"
            hide-details
          />
          <div v-if="selectItem.id < 0" class="mt-6">
            <v-btn color="secondary" outlined class="ml-1" @click="cancelFP()">
              cancelar
            </v-btn>
          </div>
        </div>
      </v-navigation-drawer>
    </v-sheet>
  </v-container>
</template>
<script>
  import TypePaymentMixin from '@/mixins/services/TypePaymentMixin'
  export default {
    name: 'TypePayment',
    mixins: [TypePaymentMixin],
    data() {
      return {
        saveLoad: false,
        listFP: null,
        activeSetting: false,
        selectItem: null,
        drawer: true,
        newRecord: 0,
      }
    },
    async mounted() {
      await this.getFPList()
    },
    methods: {
      async setFP() {
        this.saveLoad = true
        await Promise.all(this.listFP.map(item => this.processItem(item)))
        this.saveLoad = false
      },
      newFP() {
        this.changeActive()
        this.newRecord += 1
        const newElement = {
            id: this.newRecord * -1,
            description: `Nueva Forma de pago ${this.newRecord}`,
            description_1: '',
            description_2: '',
            annulled: false,
            only_dollars: false,
            active: true,
        }
        this.listFP.push(newElement)
        this.selectItem = newElement
        this.activeSetting = true
      },
      cancelFP() {
        const index = this.listFP.findIndex(item=> item === this.selectItem.id)
        this.listFP.splice(index, 1)
        this.selectItem = null
        this.activeSetting = false
      },
      async processItem(element) {
        const id = element.id
        const newItem = {
          description: element.description,
          description_1: element.description_1,
          description_2: element.description_2,
          only_dollars: element.only_dollars,
          annulled: element.annulled,
        }
        let result = null
        if (id < 0) {
          result = await this.createTypepayment(newItem)
          if (result) element.id = result.id
        } else {
          result = await this.updateTypepayment(id, newItem)
        }
      },
      changeActive() {
        this.listFP.forEach(element => {
          element.active = false
        });
      },
      async activeSelected(element) {
        await this.changeActive()
        element.active = true
        this.selectItem = element
        this.activeSetting = true
        console.log('paso')
      },
      async getFPList() {
        this.listFP = await this.getTypePayment()
        this.changeActive()
      },
      changeActive() {
        this.listFP.forEach(element => {
          element.active = false
        });
      },
    },
  }
</script>