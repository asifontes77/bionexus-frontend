<template>
  <v-container pa-0 fluid fill-height class="align-start">
    <div class="d-flex" style="position: relative; height: calc(100vh - 64px); width: 100%">
      <div class="fill-height" style="width: calc(100% - 300px);">
        <div>
          <div class="d-flex justify-space-between align-center px-6 py-4 sidebar primary--text">
              <div class="text-h6">Laboratorios de prueba especiales</div>
              <div>
                  <v-btn color="primary" outlined @click="setGroup()">
                      registrar
                  </v-btn>
                  <v-btn color="secondary" outlined class="ml-1" @click="newLab()">
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
        <div class="pa-6 list" style="height: calc(100vh - 134px); overflow-x: hidden; overflow-y: auto;">
          <v-row>
            <v-col cols="12" sm="4" class="control-height">
              <div class="font-weight-medium primary--text">
                Laboratorios
              </div>
              <v-divider></v-divider>
              <v-list two-line>
                <v-list-item-group
                  v-model="selectedLab"
                  active-class="primary--text"
                >
                  <template v-for="(labItem, index) in listLab">
                    <v-list-item :key="labItem.id" @click="activeSelectLab(labItem)">
                      <template v-slot:default="{ active }">
                        <v-list-item-icon>
                          <v-icon v-if="!active" color="yellow darken-3">
                              mdi-select-group
                          </v-icon>
                          <v-icon v-else color="secondary">
                              mdi-select-group
                          </v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                          <v-list-item-title>
                            {{ labItem.description }}
                          </v-list-item-title>
                          <v-list-item-subtitle>
                            teléfonos: {{ labItem.phone_1 }} {{ labItem.phone_2 }}
                          </v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon v-if="active" color="secondary">
                                mdi-check-bold
                            </v-icon>
                        </v-list-item-action>
                      </template>
                    </v-list-item>
                    <v-divider
                      v-if="index < labItem.length - 1"
                      :key="index + 100000"
                    />
                  </template>
                </v-list-item-group>
              </v-list>
            </v-col>
            <v-col cols="12" sm="4" class="border control-height">
              <div class="font-weight-medium primary--text">
                  Exámenes registrados
              </div>
              <v-divider></v-divider>
              <div
                  v-for="item in listSelectLab"
                  :key="item.id"
                  @click="activeSelectExam(item)"
                  style="cursor: pointer;"
              >
                <div
                  class="d-flex align-center px-4 row-group"
                  :class="item.active ? 'active' : ''"
                >
                  <div style="display: inline-flex; min-width: 24px; align-self: flex-start; margin-right: 32px; padding: 12px 0;">
                    <v-icon :color="item.active ? 'secondary' : 'yellow darken-3'">
                      mdi-needle
                    </v-icon>
                  </div>
                  <div style="
                    align-items: center;
                    align-self: center;
                    display: flex;
                    flex-wrap: wrap;
                    flex: 1 1;
                    overflow: hidden;
                    padding: 12px 0;"
                  >
                    <v-list-item-subtitle>
                      {{ item.description }}
                    </v-list-item-subtitle>
                  </div>
                    <v-list-item-action>
                      <v-icon v-if="item.active" color="secondary">
                        mdi-check-bold
                      </v-icon>
                    </v-list-item-action>
                </div>
              </div>
            </v-col>
            <v-col cols="12" sm="4" class="border control-height">
              <div class="font-weight-medium primary--text">
                Lista exámenes de laboratorio
              </div>
              <v-divider></v-divider>
              <v-list>                
                <v-list-group
                  v-for="groupE in listExam"
                  :key="groupE.id"
                  prepend-icon="mdi-select-group"
                >
                  <template v-slot:activator>
                      <v-list-item-content>
                          <v-list-item-title>{{ groupE.description }}</v-list-item-title>
                      </v-list-item-content>
                  </template>
                  <v-list-item
                      v-for="(exam) in groupE.examlists"
                      :key="groupE.id + exam.id"
                      link
                      class="ml-4"
                  >
                    <v-list-item-icon>
                      <v-icon color="secondary">mdi-needle</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>{{ exam.description }}</v-list-item-title>
                    <v-list-item-action>
                      <v-btn v-if="activeSetting" icon color="primary" @click="putTest(exam)">
                        <v-icon>mdi-arrow-left-bold-circle-outline</v-icon>
                      </v-btn>
                    </v-list-item-action>
                  </v-list-item>
                </v-list-group>
              </v-list>
            </v-col>
          </v-row>
        </div>
      </div>
      <v-navigation-drawer
        v-model="drawer"
        absolute
        right
        permanent
        width="300"
      >
        <div class="d-flex align-center px-6 sidebar primary--text" style="padding-top: 18px; padding-bottom: 17px">
          <v-icon left color="secondary">mdi-cog-outline</v-icon>
          <div class="text-h6">Configuración</div>
        </div>
        <v-divider></v-divider>
        <div v-if="activeSetting" class="px-4 py-4" style="border-bottom: 1px solid rgba(0, 0, 0, 0.12);">
          <div class="font-weight-medium primary--text">
            Laboratorio
          </div>
          <div>
            <v-text-field
              v-model="selectLab.description"
              label="Descripción"
              dense
              outlined
              hide-details
              maxlength="50"
              class="mt-4"
            />            
            <v-textarea
              v-model="selectLab.address"
              label="Dirección"
              outlined
              rows="3"
              row-height="25"
              maxlength="200"
              :counter="200"
              class="mt-4"
            />
            <v-text-field
              v-model="selectLab.phone_1"
              label="Teléfono 1"
              v-mask="maskPhone"
              dense
              outlined
              hide-details
            />             
            <v-text-field
              v-model="selectLab.phone_2"
              label="Teléfono 2"
              v-mask="maskPhone"
              dense
              outlined
              hide-details
              class="mt-2"
            />
            <v-switch
                v-model="selectLab.annulled"
                color="secondary"
                hide-details
                class="mt-2"
              >
                <template v-slot:label>
                  <span :class="selectLab.annulled ? 'secondary--text' : ''">Anulado</span>
                </template>
              </v-switch> 
          </div>
        </div>
        <div v-if="activeSettingE" class="px-4 py-4" style="border-bottom: 1px solid rgba(0, 0, 0, 0.12);">
          <div class="font-weight-medium primary--text">
            Examen
          </div>
          <div>
            <v-text-field
              v-model="selectItem.description"
              label="Descripción"
              dense
              outlined
              hide-details
              maxlength="60"
              class="mt-4"
            />
            <v-btn color="secondary" class="mt-2" @click="itemDelete(selectItem)">
              <v-icon left>mdi-trash-can-outline</v-icon>
              eliminar
            </v-btn>
          </div>
        </div>
      </v-navigation-drawer>
    </div>
  </v-container>
</template>
<script>
import specialTestsMixin  from '@/mixins/services/specialTestsMixin'
import createNumberMask from 'text-mask-addons/dist/createNumberMask'

export default {
  name: 'SpecialTestsConfiguration', 
  mixins: [specialTestsMixin],
  data() {
    return {
      saveLoad: false,
      drawer: true,
      selectedLab: null,
      listLab: [],
      listSelectLab: null,
      selectItem: null,
      selectLab: null,
      activeSetting: false,
      activeSettingE: false,
      listExam: null,
      countIdE: 0,
      maskPhone: '+58 #### ### ####',
    }
  },
  async mounted() {
    await this.getSpecialList()
    await this.getListExam()
  },
  methods: {
    async getSpecialList() {
      this.listLab = await this.getSpecialTestLabList();
      if (this.listLab.length !== 0) {
        this.listLab.forEach(element => {
            const newListItem = element.specialTestItems.map(objeto => ({
                ...objeto, 
                active: false, 
            }))
            element.special_test_items = newListItem
        })
      }
    },    
    async getListExam() {
      this.listExam = await this.getExamgroupsViewList()
    },
    activeSelectLab(labItem) {
      this.listSelectLab = labItem.special_test_items
      this.activeSetting = true
      this.selectLab = labItem
    },    
    async activeSelectExam(item) {
      await this.cleanActive()
      this.selectItem = item
      this.selectItem.active = true
      this.activeSettingE = true
    },        
    cleanActive() {
      this.listSelectLab.forEach((element) => {
        element.active = false
      })
    },
    async putTest(exam) {
      console.log('this.selectedLab: ', this.selectLab)
      const resultadoFind = this.listSelectLab.find((objeto) => objeto.exam_list_Id === exam.id)
      if (!resultadoFind) {
        this.cleanActive()
        const newItem = {
          specialTestLabId: this.selectLab.id,
          description: exam.description,          
          exam_list_Id: exam.id,
        }
        console.log('newItem: ', newItem)
        const result = await this.createSpecialTestItems(newItem)
        if (result) {
          newItem.id = result.id
          newItem.active = true
          this.selectLab.special_test_items.push(newItem)
          this.listLab
          this.selectItem = newItem
          this.activeSettingE = true
        }
      }
    },
    async itemDelete(item) {
      if (item.id > 0) {
        const result = await this.deleteTestItems(item.id)
        if (result) {
          this.deleteItemDefinitively(item)
        }
      } else {
        this.deleteItemDefinitively(item)
      }
    },
    deleteItemDefinitively(item) {
      this.selectItem = null
      this.activeSettingE = false
      const newArray = this.selectLab.special_test_items.filter((itemD) => parseInt(itemD.exam_list_Id, 10) !== parseInt(item.exam_list_Id, 10));
      console.log('newArray: ', newArray)
      this.selectLab.special_test_items = newArray
      this.listSelectLab = newArray
    },
    async newLab() {
      const newItem = {
        description: '**nuevo registro**',
        address: '',
        phone_1: '',
        phone_2: '',
        email: '',
      }
      const result = await this.createSpecialTestLab(newItem)
      if (result) {
        await this.getSpecialList()
      }
    },
    async setGroup() {
      await this.asyncForEach(this.listLab, async (itemLab) => {
        await this.registerLaboratory(itemLab);
      })
    },
    async registerLaboratory(itemLab) {
      this.saveLoad = true
      const newItem = {
        description: itemLab.description,
        address: itemLab.address,
        phone_1: itemLab.phone_1,
        phone_2: itemLab.phone_2,
        email: itemLab.email,
        annulled: itemLab.annulled,
      }
      const result = await this.updateSpecialTestLab(itemLab.id, newItem)
      if (result) {
        await this.asyncForEach(itemLab.special_test_items, async (itemTest) => {
          await this.registerTest(itemTest)
        })
      }
      this.saveLoad = false
    },
    async registerTest(itemTest) {
      const newItem = {
        exam_list_Id: itemTest.exam_list_Id,
        specialTestLabId: itemTest.specialTestLabId,
        description: itemTest.description,
      }
      const result = await this.updateSpecialTestItems(itemTest.id,newItem)      
    },
    async asyncForEach(array, callback) {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
      }
    },
  },
}
</script>