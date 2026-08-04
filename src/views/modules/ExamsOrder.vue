<template>
  <v-container pa-0 fluid fill-height class="align-start">
    <v-sheet
      width="100%"
      style="position: relative; height: calc(100vh - 64px);"
    >
      <div class="fill-height" style="width: calc(100% - 300px);">
        <div>
          <div class="d-flex justify-space-between align-center px-6 py-4 sidebar primary--text">
            <div class="text-h6">Ordenar exámenes</div>
            <div>
              <v-btn color="primary" outlined @click="moveGroup()">
                registrar
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
        <div class="pa-6 list" style="height: calc(100vh - 100px); overflow-x: hidden; overflow-y: auto">
          <v-row>
            <v-col cols="6">
              <div class="text-h6">GRUPO DE EXAMENES</div>
              <draggable v-model="listGroup" v-bind="dragOptions" :move="onMove" handle=".item" @start="dragging = true" @end="endDragging">
                <transition-group type="transition" :name="!drag ? 'flip-list' : null">
                  <div v-for="element in listGroup" class="list-group" :key="element.id">
                    <div class="d-flex align-center item" :class="element.active ? 'active' : ''">
                      <div class="row-hover">
                        <v-icon color="primary">mdi-drag-vertical</v-icon>
                      </div>           
                      <div style="width: 40px;">
                        <v-btn icon color="secondary" @click="createExamList(element)">
                          <v-icon color="primary">mdi-select-group</v-icon>
                        </v-btn>
                      </div>
                      <div style="width: 40px">
                        <v-btn icon color="secondary" @click="activeSelectedGroup(element)">
                          <v-icon>mdi-cog</v-icon>
                        </v-btn>
                      </div>
                      <div style="width: calc(100% - 88px)">
                        {{element.description}}
                      </div>
                      <div  class="mr-1 text-right" style="width: 48px">
                        <v-btn icon color="secondary" :class="!element.annulled ? 'rotate' : ''" @click="activeSubGroup(element)">
                          <v-icon>mdi-chevron-down</v-icon>
                        </v-btn>
                      </div>
                    </div>
                  </div>
                </transition-group>
              </draggable>
            </v-col>
            <v-col cols="6" style="border-left: 1px solid var(--v-gray-base);">
              <div class="text-h6">EXAMENES GRUPO {{ examName }}</div>
              <div v-if="listExams">
                <exam-list
                  :key="listExamsKey"
                  v-model="listExams"
                  :rows-tmp="listExams"
                  @change-row="changeRow"
                  @active-selected-exa="activeSelectedExa"
                />
              </div>
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
        <div v-if="activeSettingGroup">
          <div class="px-2 py-4">
            <div class="font-weight-medium"> Grupo: {{ selectedGroup.description }}</div>
          </div>
          <v-divider></v-divider>
          <div class="px-2 py-4">
            <v-text-field
              v-model="selectedGroup.description"
              label="Descripción"
              dense
              outlined
              hide-details
              maxlength="60"
            />
            <v-switch
              v-model="selectedGroup.annulled"
              label="Grupo Inactivo"
              color="secondary"
              hide-details
            />
            <v-switch
              v-model="selectedGroup.its_exam"
              label="Es examen de laboratorio"
              color="primary"
              hide-details
            />
          </div>
        </div>
        <div v-if="activeSettingExam">
          <div class="px-2 py-4">
            <div class="font-weight-medium"> Examen: <span class="caption">{{ selectedExa.description }}</span></div>
          </div>
          <v-divider></v-divider>
          <div class="px-2 py-4">
            <v-text-field
              v-model="selectedExa.description"
              label="Descripción"
              dense
              outlined
              hide-details
              maxlength="60"
            />
            <v-text-field
              v-model="selectedExa.abbreviation"
              label="Abreviatura"
              dense
              outlined
              hide-details
              maxlength="10"
              class="mt-4"
            />
            <v-switch
              v-model="selectedExa.annulled"
              label="Examen oculto"
              color="secondary"
              hide-details
            />
            <v-select
              v-model="selectedExa.group_id"
              :items="listGroup"
              item-text="description"
              item-value="id"
              label="Cambiar de grupo"
              dense
              outlined
              class="mt-4"
              @change="changeGroup()"
            />
          </div>
        </div>
      </v-navigation-drawer>
    </v-sheet>
  </v-container>
</template>

<script>
import examsListMixin from '@/mixins/services/examsListMixin'
import draggable from 'vuedraggable'
import ExamList from '@/components/modules/setting/ExamList.vue'

export default {
    name: 'OrderExams',
    components: { draggable, ExamList },
    mixins: [examsListMixin],
    data () {
      return {
        saveLoad: false,
        drawer: true,
        listGroup: null,
        drag: false,
        dragging: false,
        selectedGroup: null,
        selectedExa: null,
        listExams: null,
        listExamsKey: 0,
        examName: '',
        active: true,
        activeSettingGroup: false,
        activeSettingExam: false,
      }
    },
    async mounted() {
      await this.getGroupList()
    },
    computed: {
      dragOptions() {
        return {
          animation: 200,
          group: "description",
          disabled: false,
          ghostClass: "ghost"
        };
      },
    },
    watch: {
      isDragging(newValue) {
        if (newValue) {
          this.delayedDragging = true;
          return;
        }
        this.$nextTick(() => {
          this.delayedDragging = false;
        });
      },
      selectedGroup: {
        handler(value) {
          if (value) {
            this.listExams = this.selectedGroup.examlists
            this.examName = this.selectedGroup.description
          } else {
            this.listExams = null
            this.examName = ''
            this.activeSettingGroup = false
            this.activeSettingExam = false
          }
        }
      },
    },
    methods: {
      async getGroupList() {
        this.listGroup = await this.getExamGroupListJoined()
        this.cleanActive()
      },
      onMove({ relatedContext, draggedContext }) {
        const relatedElement = relatedContext.element
        const draggedElement = draggedContext.element
        return (
          (!relatedElement || !relatedElement.fixed) && !draggedElement.fixed
        )
      },
      endDragging() {
        this.dragging = false
        if (this.listExams) this.clearExamList()
        this.selectedGroup = null
        this.cleanActive()
      },
      async moveGroup() {
        this.saveLoad = true
        await this.listGroup.forEach((element, index) => {
          element.position = index
          element.examlists.forEach((exa, indexE) => {
            exa.position = indexE
            exa.group_id = element.id
          })
        })
        await this.moveGroupTwo()
        this.saveLoad = false
      },
      async moveGroupTwo() {
        await Promise.all(this.listGroup.map(item => this.processItemGroup(item)))
      },
      async processItemExa(exa) {
        const newItem = {
          description: exa.description,
          position: exa.position,
          group_id: exa.group_id,
          abbreviation: exa.abbreviation,
          annulled: exa.annulled,
        }
        console.log('newItem: ', newItem)
        const result = await this.updateExamList(exa.id, newItem)
      },
      async processItemGroup(group) {
        const newItem = {
          description: group.description,
          position: group.position,
          annulled: group.annulled,
          its_exam: group.its_exam,
        }
        const result = await this.updateExamgroup(group.id, newItem)
        if (result) {
          await Promise.all(group.examlists.map(item => this.processItemExa(item)))
        }
      },
      activeSelectedGroup(group) {
        this.cleanActive()
        group.active = true
        this.selectedGroup = group
        this.activeSettingGroup = true
        this.activeSettingExam = false
      },
      clearExamList() {
        this.listExams = null
        this.examName = ''
        this.listExamsKey += 1
      },
      createExamList(group) {
        this.cleanActive()
        group.active = true
        this.selectedGroup = group
        this.listExamsKey += 1
      },
      activeSelectedExa(exa) {
        this.selectedExa = exa
        this.activeSettingGroup = false
        this.activeSettingExam = true
      },
      activeSubGroup(group, notClose=false) {
        if (group.active) {
          group.active = false
        } else {
          if (!notClose) this.cleanActive()
          this.selectedGroup = group
          this.selectedGroup.active = true
        }
      },
      cleanActive() {
        this.listGroup.forEach((element) => {
          element.active = false
        })
        this.activeSettingGroup = false
        this.activeSettingExam = false
      },
      changeGroup() {
        if (this.selectedExa) {
          const exaTmp = JSON.parse(JSON.stringify(this.selectedExa))
          const indexRemove = this.selectedGroup.examlists.indexOf(this.selectedExa)
          this.selectedGroup.examlists.splice(indexRemove, 1)
          this.selectedGroup = this.listGroup.find((object) => object.id === exaTmp.group_id)
          const cantidad = this.selectedGroup.examlists.length
          exaTmp.position = cantidad
          this.selectedGroup.examlists.push(exaTmp)
          this.createExamList(this.selectedGroup)
        }
      },
      changeRow(newRow) {
        this.selectedGroup.examlists = newRow
      },
    },
}
</script>
<style scoped>
.item {
  background-color: white;
  height: 40px;
}
.item.active {
  background-color: #D3DEE1;
}
.rotate {
  transform: rotate(-180deg)
}
.item-child {
  background-color: white;
  height: 40px;
}
.row-hover {
  display: none;
  cursor: move;
}
.list-group:hover>.item {
  background-color: var(--v-gray-base) !important;
}
.list-group:hover .row-hover {
  display: block;
}
.flip-list-move {
  transition: transform 0.5s;
}
.no-move {
  transition: transform 0s;
}
</style>