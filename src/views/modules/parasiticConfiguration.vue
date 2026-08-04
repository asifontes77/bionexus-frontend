<template>
  <v-container pa-0 fluid fill-height class="align-start">
    <v-sheet
        width="100%"
        style="position: relative; height: calc(100vh - 64px);"
    >
        <div class="fill-height" style="width: calc(100% - 500px);">
            <div>
                <div class="d-flex justify-space-between align-center px-6 py-4 sidebar primary--text">
                    <div class="text-h6">Lista de forma parasitaria</div>
                    <div>
                        <v-btn color="primary" outlined @click="setParasitic()">
                            registrar
                        </v-btn>
                        <v-btn color="secondary" outlined class="ml-1" @click="newParasitic()">
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
                    v-for="element in listParasitic"
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
                        <div style="width: calc(100% - 80px)">
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
            <div v-if="activeSetting" class="px-6 py-4">
                <v-text-field
                    v-model="selectItem.description"
                    label="Descripción"
                    dense
                    outlined
                    hide-details
                    maxlength="50"

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
import parasiticMixin from '@/mixins/services/parasiticMixin'

export default {
    name: 'parasiticConfiguration',
    mixins: [parasiticMixin],
    data() {
        return {
            listParasitic: null,
            drawer: true,
            selectItem: null,
            activeSetting: false,
            newRecord: 0,
            saveLoad: false,
        }
    },
    async mounted() {
      await this.getParasiticList()
    },
    methods: {
        async getParasiticList() {
            this.listParasitic = await this.getParasiticLists()
            console.log('this.listParasitic: ', this.listParasitic)
            this.changeActive()
        },
        changeActive() {
            this.listParasitic.forEach(element => {
                element.active = false
            });
        },
        async setParasitic() {
            this.saveLoad = true
            await Promise.all(this.listParasitic.map(item => this.processItem(item)))
            this.saveLoad = false
        },
        async processItem(element) {
            const id = element.id
            const newItem = {
                description: element.description,
                annulled: element.annulled,
            }
            let result = null
            if (id < 0) {
                result = await this.createParasitic(newItem)
                if (result) element.id = result.id
            } else {
                result = await this.updateParasitic(id, newItem)
            }
        },
        newParasitic() {
            this.changeActive()
            this.newRecord += 1
            const newElement = {
                id: this.newRecord * -1,
                description: `NUEVO ${this.newRecord}`,
                annulled: false,
                active: true,
            }
            this.listParasitic.push(newElement)
            this.selectItem = newElement
            this.activeSetting = true
        },
        async activeSelected(element) {
            await this.changeActive()
            element.active = true
            this.selectItem = element
            this.activeSetting = true
        },
        cancelAntibiotic() {
            const index = this.listParasitic.findIndex(item=> item === this.selectItem.id)
            this.listParasitic.splice(index, 1)
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
