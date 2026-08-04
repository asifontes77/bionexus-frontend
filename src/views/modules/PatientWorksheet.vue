<template>
  <v-container pa-0 fluid fill-height class="align-start">
    <div class="d-flex">
      <v-list width="300" color="background" class="pt-0" style="border-right: 1px solid rgba(0,0,0,.12)">
        <v-subheader 
          class="sidebar primary--text d-flex flex-column justify-center altura"
        >
        <div class="text-h6">HOJA DE TRABAJO</div>
        <div class="d-flex">
          <v-menu
            v-model="menuDate"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="date"
                prepend-icon="mdi-calendar"
                outlined
                readonly
                dense
                hide-details
                v-bind="attrs"
                v-on="on"
              />
            </template>
            <v-date-picker
              v-model="date"
              locale="es"
              @input="menuDate = false"
            />
          </v-menu>
          <v-btn
            fab
            small
            color="secondary"
            class="ml-1"
            @click="getPatientListNew()"
          >
            <v-icon :class="rotar ? 'rotate-item' : ''">mdi-cached</v-icon>
          </v-btn>
        </div>
        </v-subheader>
        <div class="control-height">
          <v-list>
            <v-list-item-group
              v-model="selectGroupI"
              color="primary"
            >
              <v-list-item                          
                v-for="item in groupList"
                :key="item.id"
                style="border-bottom: 1px solid var(--v-gray-base);"
              >
                <v-list-item-content>
                  <v-list-item-title>{{ item.description }}</v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn icon @click="listExam(item)">
                    <v-icon color="secundary">mdi-format-list-checkbox</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </div>
      </v-list>
      <Workshee-table
        :database-list="patientList"
        :select-group="selectGroup"
        :name-workshee="nameWorkshee"
        :date-workshee="date"
        :key="patientListkey"
      />     
    </div>
  </v-container>
</template>
<script>
import groupHTMixin from '@/mixins/services/groupHTMixin'
import examsListMixin from '@/mixins/services/examsListMixin'
import pacientsMixin from '@/mixins/services/pacientsMixin'
import WorksheeTable from '@/components/modules/workshee/WorksheeTable'

export default {
  name: 'PatientWorksheet',
  components: {WorksheeTable},
  mixins: [groupHTMixin, pacientsMixin, examsListMixin],
  data() {
    return {
      date: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
      menuDate: false,
      groupList: [],
      selectGroup: [],
      selectGroupI: null,
      patientList: null,
      patientListkey: 0,
      rotar: false,
      selected: [],
      nameWorkshee: '',
    }
  },
  async mounted() {
    await this.getGroupList()
  },
  methods: {
    async getGroupList() {
      const result = await this.getGroupHtListActive()
      await this.asyncForEach(result, async (itemGroup) => {
        await this.asyncForEach(itemGroup.grouphtitems, async (item) => {
          const resultExa = await this.getExam(item.examId)
          item.work_sheet = resultExa.work_sheet
        })
      })
      this.groupList = result
      this.selectGroup = []
    },
    getPatientListNew() {},
    async listExam(nodo) {
      this.nameWorkshee = nodo.description
      this.selectGroup = nodo.grouphtitems
      console.log('nodo: ', this.selectGroup)
      const groupId = []
      await this.asyncForEach(nodo.grouphtitems, async (item) => {
        await groupId.push(item.examId)
      })   
      const result = await this.getPatientsDateWorksheetResult(this.date)
      this.patientListkey +=1
      result.forEach(row => {
        row.exams = row.exams.filter(objeto => groupId.includes(objeto.examlistsId))
      })
      this.patientList = result.filter(objeto => objeto.exams.length !== 0)
    },       
    async asyncForEach(array, callback) {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
      }
    },
  },
}
</script>
<style scoped>
.altura {
  height: 115px;
}
.control-height {
  max-height: calc(100vh - 115px - 72px);
  min-height: calc(100vh - 115px - 72px);
  overflow-x: hidden;
  overflow-y: auto;
  border-top: 1px solid var(--v-gray-base);
  background-color: white;
}
</style>