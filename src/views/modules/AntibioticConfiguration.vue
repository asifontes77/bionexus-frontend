<template>
  <v-container pa-0 fluid fill-height class="align-start">
    <v-sheet
      width="100%"
      style="position: relative; height: calc(100vh - 64px);"
    >
        <div class="fill-height" style="width: calc(100% - 500px);">
            <div>
                <div class="d-flex justify-space-between align-center px-6 py-4 sidebar primary--text">
                    <div class="text-h6">Lista de antibióticos</div>
                    <div>
                        <v-btn color="primary" outlined @click="setAntibiotic()">
                            registrar
                        </v-btn>
                        <v-btn color="secondary" outlined class="ml-1" @click="newAntibiotic()">
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
                    v-for="element in listAntibiotic"
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
                        <div style="width: 80px">
                            {{element.siglas}}
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
            <div v-if="activeSetting" class="px-2 py-4">
                <v-text-field
                    v-model="selectItem.description"
                    label="Descripción"
                    dense
                    outlined
                    hide-details
                    maxlength="50"
                    @blur="changeUpper('description')"

                />
                <v-text-field
                    v-model="selectItem.siglas"
                    label="Siglas"
                    dense
                    outlined
                    hide-details
                    maxlength="10"
                    class="mt-4"
                    @blur="changeUpper('siglas')"
                />
                <v-switch
                    v-model="selectItem.annulled"
                    label="Ocultar"
                    color="secondary"
                    hide-details
                />
                <div v-if="selectItem.id < 0" class="mt-6">
                    <v-btn color="secondary" outlined class="ml-1" @click="cancelAntibiotic()">
                        cancelar
                    </v-btn>
                </div>
            </div>
        </v-navigation-drawer>
    </v-sheet>
  </v-container>
</template>

<script>
import antibioticMixin  from '@/mixins/services/antibioticMixin'

export default {
    name: 'AntibioticConfiguration',
    mixins: [antibioticMixin],
    data() {
        return {
            saveLoad: false,
            drawer: true,
            activeSetting: false,
            listAntibiotic: null,
            selectItem: null,
            newRecord: 0,
        }
    },
    async mounted() {
      await this.getAntibioticList()
    },
    methods: {
        async setAntibiotic() {
            this.saveLoad = true
            await Promise.all(this.listAntibiotic.map(item => this.processItem(item)))
            this.saveLoad = false
        },
        changeUpper(type) {
            if (type === 'description') {
                this.selectItem.description = this.selectItem.description.toUpperCase()
            }
            if (type === 'siglas') {
                this.selectItem.siglas = this.selectItem.siglas.toUpperCase()
            }            
        },
        async processItem(element) {
            const id = element.id
            const newItem = {
                description: element.description,
                siglas: element.siglas,
                annulled: element.annulled,
            }
            let result = null
            if (id < 0) {
                result = await this.createAntibiotic(newItem)
                if (result) element.id = result.id
            } else {
                result = await this.updateAntibiotic(id, newItem)
            }
        },
        async getAntibioticList() {
            this.listAntibiotic = await this.getAntibioticLists()
            this.changeActive()
        },
        changeActive() {
            this.listAntibiotic.forEach(element => {
                element.active = false
            });
        },
        async activeSelected(element) {
            await this.changeActive()
            element.active = true
            this.selectItem = element
            this.activeSetting = true
        },
        newAntibiotic() {
            this.changeActive()
            this.newRecord += 1
            const newElement = {
                id: this.newRecord * -1,
                description: `NUEVO ${this.newRecord}`,
                siglas: '',
                annulled: false,
                active: true,
            }
            this.listAntibiotic.push(newElement)
            this.selectItem = newElement
            this.activeSetting = true
        },
        cancelAntibiotic() {
            const index = this.listAntibiotic.findIndex(item=> item === this.selectItem.id)
            this.listAntibiotic.splice(index, 1)
            this.activeSetting = false
        },
    },
}
</script>
<style scoped>
.list-group:hover>.item {
  background-color: var(--v-gray-base) !important;
}
.item {
  background-color: white;
  height: 40px;
}
.item.active {
  background-color: #D3DEE1;
}
</style>
