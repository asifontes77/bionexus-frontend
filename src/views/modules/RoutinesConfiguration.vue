<template>
  <v-container pa-0 fluid fill-height class="align-start">
    <div class="d-flex" style="position: relative; height: calc(100vh - 64px); width: 100%">
      <div class="fill-height" style="width: calc(100% - 300px);">
        <div>
          <div class="d-flex justify-space-between align-center px-6 py-4 sidebar primary--text">
            <div class="text-h6">Rutinas de exámenes</div>
            <div>
              <v-btn color="secondary" outlined class="ml-1" @click="newGroup()">
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
        <div class="pa-6 list" style="height: calc(100vh - 134px); overflow-x: hidden; overflow-y: hidden;">
          <v-row>
            <v-col cols="12" sm="4" class="control-height">
              <div class="font-weight-medium primary--text">
                  Rutinas
              </div>
              <v-divider></v-divider>
              <v-list two-line>
                <v-list-item-group
                  v-model="selectedGroup"
                  active-class="primary--text"
                >
                  <template v-for="(groupItem, index) in listGroup">
                    <v-list-item :key="groupItem.id" @click="activeSelectGroup(groupItem)">
                      <template v-slot:default="{ active }">
                        <v-list-item-icon>
                          <v-icon v-if="!active" color="secondary">
                            mdi-select-group
                          </v-icon>
                          <v-icon v-else color="yellow darken-3">
                            mdi-select-group
                          </v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                          <v-list-item-title>
                            {{ groupItem.description }}
                          </v-list-item-title>
                          <v-list-item-subtitle>
                            {{ groupItem.details }}
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
                        v-if="index < listGroup.length - 1"
                        :key="index + 100000"
                      />
                  </template>
                </v-list-item-group>
              </v-list>
            </v-col>
            <v-col cols="12" sm="4" class="border control-height">
              <div class="font-weight-medium primary--text">
                Exámenes en la rutina
              </div>
              <v-divider></v-divider>
              <div
                v-for="item in listSelectGroup"
                :key="item.examId"
                @click="activeSelectExam(item)"
              >
                <div
                  class="d-flex align-center px-4 row-group"
                  :class="item.active ? 'active' : ''"
                >
                  <div style="display: inline-flex; min-width: 24px; align-self: flex-start; margin-right: 32px; padding: 12px 0;">
                    <v-icon :color="item.active ? 'yellow darken-3' : 'secondary'">
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
            Grupo
          </div>
          <div>
            <v-text-field
              v-model="selectGroup.description"
              label="Descripción"
              dense
              outlined
              hide-details
              maxlength="50"
              class="mt-4"
            />
            <v-textarea
              v-model="selectGroup.details"
              outlined
              rows="3"
              row-height="25"
              maxlength="200"
              :counter="200"
              class="mt-4"
            />
            <v-btn color="secondary" @click="activeDelete('group')">
              <v-icon left>mdi-trash-can-outline</v-icon>
              eliminar
            </v-btn>            
            <v-btn color="primary" outlined class="ml-2" @click="setGroup()">
              registrar
            </v-btn>
          </div>
        </div>
        <div v-if="activeSettingE" class="px-4 py-4">
          <div class="font-weight-medium primary--text">
            Examen
          </div>
          <div class="mt-4 caption">
            {{ selectItem.description }}
          </div>
          <v-btn color="secondary" class="mt-4" @click="activeDelete('exam')">
            <v-icon left>mdi-trash-can-outline</v-icon>
            eliminar
          </v-btn>
        </div>
      </v-navigation-drawer>
      <delete-dialog-simple
        v-model="deleteDialog"
        :element-to-delete="seguroDelete"
        :title="titleDelete"
        @btn-active-action="deleteAction()"
      />
    </div>
  </v-container>
</template>

<script>
import RutinesMixin  from '@/mixins/services/RoutinesMixin'
import DeleteDialogSimple from '@/components/util/DeleteDialogSimple.vue'

let IDGLOBAL = 0

export default {
  name: 'RoutinesConfiguration',
  components: { DeleteDialogSimple},
  mixins: [RutinesMixin],
  data() {
      return {
          saveLoad: false,
          activeSetting: false,
          activeSettingE: false,
          drawer: true,
          listGroup: null,
          listExam: null,
          selectedGroup: null,
          selectedGrouItems: null,
          selectGroup: null,
          listSelectGroup: null,
          selectItem: null,
          deleteDialog: false,
          seguroDelete: '',
          titleDelete: '',
          typeDelete: null,
          countId: 0,
          countIdE: 0,
          controlOnStart: true
      }
  },
  async mounted() {
    await this.getGroupList()
    await this.getListExam()
  },
  methods: {
    async setGroup() {
      this.saveLoad = true
      const result = await this.updateRoutines(this.selectGroup.id, this.selectGroup) 
      this.saveLoad = false
    },
    async newGroup() {
      this.countId = await this.countWithLike('Nuevo')
      this.countId += 1
      const newItem = {
        description: `Nuevo (${this.countId})`,
        details: '',
        registered_exams: [],
      }
      const result = await this.createRoutines(newItem)
      if (result) {
        newItem.id = result.id
      }
      this.getGroupList()
    },      
    cleanActive() {
      this.listSelectGroup = this.listSelectGroup.map(group => ({
        ...group,
        active: false
      }))
    },
    async getGroupList() {
      this.listGroup = await this.getRoutinesList()
      if (this.listGroup.length !== 0) {
        this.listGroup.forEach(element => {
          const newListGroup = element.registered_exams.map(objeto => ({
            ...objeto, 
            active: false, 
          }))
          element.registered_exams = newListGroup
        })
      }
    },
    async getListExam() {
      this.listExam = await this.getExamgroupsViewList()
    },
    async activeSelectExam(item) {
      await this.cleanActive()
      this.selectItem = item
      this.selectItem.active = true
      this.activeSettingE = true
    },
    async putTest(exam) {
      const resultadoFind = this.listSelectGroup.find((objeto) => objeto.examId === exam.id)
      if (!resultadoFind) {
        const newItem = {
          description: exam.description,
          examId: exam.id,
        }
        this.selectGroup.registered_exams.push(newItem)
        await this.deleteActive()
        const result = await this.updateRoutines(this.selectGroup.id, this.selectGroup)
        this.listSelectGroup = result.registered_exams
        this.activeSettingE = false
      }
    },
    deleteActive() {
      this.selectGroup.registered_exams = this.selectGroup.registered_exams.map(objeto => {
        let newObjeto = { ...objeto }
        delete newObjeto.active
        return newObjeto
      });
    },
    activeSelectGroup(item) {
      this.selectGroup = item
      this.listSelectGroup = item.registered_exams
      this.activeSetting = true
    },
    activeDelete(type) {
      if (type === 'exam') {
        this.seguroDelete = this.selectItem.description
        this.titleDelete ='Eliminar examen'
      } else {
        this.seguroDelete = this.selectGroup.description
        this.titleDelete ='Eliminar grupo'
      }
      this.typeDelete = type
      this.deleteDialog = true
    },
    async deleteAction() {
      if (this.typeDelete === 'exam') {
        await this.deleteActive()
        const index = this.selectGroup.registered_exams.findIndex(objeto => objeto.examId === this.selectItem.examId)
        console.log('index: ', index)
        this.selectGroup.registered_exams.splice(index, 1);
        const result = await this.updateRoutines(this.selectGroup.id, this.selectGroup)
        if (result) {
          this.listSelectGroup = result.registered_exams
          this.activeSettingE = false
        }
      } else {
        const result = await this.deleteRoutines(this.selectGroup.id)
        if (result) {
          this.activeSetting = false
          this.listSelectGroup = null
          this.selectGroup = null
        }
      }
      this.deleteDialog = false
      await this.getGroupList()
      this.selectGroup = null
    },
  },
}
</script>
<style scoped>
.control-height {
  max-height: calc(100vh - 158px);
  overflow-x: hidden;
  overflow-y: auto;
  height: calc(100vh - 158px)
}
.border {
  border-left: 1px solid var(--v-gray-base);
}
.row-group {
  cursor: pointer;
}
.row-group.active {
  background-color: #D3DEE1;
}
.row-group:hover {
  background-color: #F6F6F6;
}
</style>