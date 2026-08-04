<template>
  <v-container pa-0 fluid fill-height class="align-start">
    <div class="d-flex">
      <v-list width="300" color="background" class="pt-0" style="border-right: 1px solid rgba(0,0,0,.12)">
        <v-subheader 
          class="sidebar primary--text d-flex flex-column justify-center altura"
        >
          <div class="text-h6">RESULTADOS POR EMAIL</div>          
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
          <v-list
            flat
            two-line
            class="py-0"
          >
            <v-list-item-group
              v-model="settings"
              multiple
              active-class=""
            >
            <v-list-item
              v-for="item in patientList"
              :key="item.id"        
              style="border-bottom: 1px solid rgba(0,0,0,.12)"
              :style="item.active ? 'background-color:#D3DEE1' : 'background-color:#F0F0F0'"
            >
              <template v-slot:default="{ active }">
                <v-list-item-action>
                  <v-checkbox :input-value="active"></v-checkbox>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title>{{ item.patient_position }}</v-list-item-title>
                  <v-list-item-subtitle>{{ item.name }}</v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-icon>
                  <v-icon :color="item.email_status ? 'primary' : 'secondary'">
                    {{ item.email_status ? 'mdi-checkbox-marked-circle-plus-outline' : 'mdi-checkbox-marked-circle-minus-outline' }}
                  </v-icon>
                </v-list-item-icon>
              </template>
            </v-list-item>
            </v-list-item-group>
          </v-list>
        </div>
      </v-list>
      <div>
        <div class="sidebar ancho-sidebar">
          <div class="pr-6 pt-6 d-flex justify-end">
            <v-btn
              outlined
              color="primary"
              depressed
              :disabled="settings.length === 0"
              @click="activateShipping()"
            >
              <v-icon left>mdi-email-fast-outline</v-icon>
              enviar
            </v-btn>
          </div>
        </div>
        <v-progress-linear
          v-if="sendingEmail"
          indeterminate
          color="primary"
        />
        <div class="width-table pa-6">
          <v-data-table
            v-if="selectedList.length !== 0"
            :items="selectedList"
            class="table-height"
            :headers="headers"
          >
            <template v-slot:[`item.email_status`]="{ item }">
              <v-icon :color="item.email_status ? 'primary' : 'secondary'">
                {{ item.email_status ? 'mdi-checkbox-marked-circle-plus-outline' : 'mdi-checkbox-marked-circle-minus-outline' }}
              </v-icon>
            </template>
            <template v-slot:[`item.age`]="{ item }">
              {{ item.age }} {{ item.month_year }}
            </template>
            <template v-slot:[`item.sex`]="{ item }">
              <div v-if="item.sex === 1" >Masculino</div>
              <div v-else>Femenino</div>
            </template>
            <template v-slot:[`item.patient_position`]="{ item }">
              {{ `${item.patient_position} / ${item.id}` }}
            </template>
          </v-data-table>
        </div>
      </div>
      <report-patient
        v-if="activeReportPatient" 
        v-show="!activeReportPatient"
        :is-print="isPrint"
        :key="reportPatientKey"
        :id="selectedIdReport"
        @return-html="returnHtml"
      />
    </div>
  </v-container>
</template>

<script>
import pacientsMixin from '@/mixins/services/pacientsMixin'
import ReportPatient from '@/components/modules/history/ReportPatient.vue'

  export default {
    name: 'ResultsByEmail',
    components: { ReportPatient },
    mixins: [pacientsMixin],
    data() {
      return {
          date: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
          menuDate: false,          
          patientList: [],
          rotar: true,
          selectedList: [],
          settings: [],
          sendingEmail: false,
          headers: [
            {text: '', align: 'center', value: 'email_status', sortable: false },
            {text: 'Sec. / #', align: 'start', value: 'patient_position'},
            {text: 'Paciente', align: 'start', value: 'name'},
            {text: 'Edad', align: 'start', value: 'age'},
            {text: 'Sexo', align: 'start', value: 'sex'},
            {text: 'Hora ingreso', align: 'start', value: 'admission_time'},
            {text: 'Teléfono', align: 'start', value: 'phone'},
            {text: 'Email', align: 'start', value: 'email' },
          ],
          activeReportPatient: false,
          reportPatientKey: 0,
          selectedIdReport: null,
          isPrint: false,
          htmlPdf: false,
      }
    },
    watch: {
      'date': {
        handler() {
          this.getPatientListNew()
        },
      },
      'settings': {
        handler(value) {
          this.createList(value)
        }
      },
    },
    async mounted() {
      await this.getPatientListNew()        
    },
    methods: {
      async getPatientListNew() {
        console.log('paso')
        this.rotar = true
        this.patientList = []
        const result = await this.getPatientResultsDatesApproved(this.date)
        if (result) {
          this.patientList = result
          await this.asyncForEach(this.patientList, async (patient) => {
            if (patient.exams.length !== 0) {
              await this.asyncForEach(patient.exams, async (exam) => {
                if (exam.processed_id !== 0) {
                  exam.process_name = await this.searchProcessed(exam.processed_id)
                } else {
                  exam.process_name = ''
                }
                if (exam.approved_id !== 0) {
                  exam.approved_name = await this.searchProcessed(exam.approved_id)
                } else {
                  exam.approved_name = ''
                }
              })
            }
          })
        }
        this.rotar = false
      },
      async searchProcessed(id) {
        const result = await this.getProcessed(id)
        if (result) {
          return result.name
        }
        return 'No registrado'
      },             
      async asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
          await callback(array[index], index, array);
        }
      },
      activePatient(item, active) {
        console.log('active: ', active)
        console.log('selectedList: ', item)
      },
      createList(value) {
        this.selectedList = []
        value.forEach((element) => {
          const item = this.patientList[element]
          this.selectedList.push(item)
        })
      },
      async activateShipping() {
        this.sendingEmail = true
        await this.asyncForEach(this.selectedList, async (patient) => {
          this.htmlPdf = false
          this.activeReportPatient = true
          this.reportPatientKey += 1
          this.selectedIdReport = patient.id
          await this.esperarVariableTrue()
          const result = await this.enviarCorreo(patient.id)
          if (result) {
            const updatePat = {
              email_status: true,
            }
            const marco = await this.updatePatient(patient.id, updatePat)
            if (marco) {
              patient.email_status = true
            }
          }
        })
        this.getPatientListNew()
        this.sendingEmail = false
      },
      async returnHtml(html) {
        const updatePat = {
          result_html: html,
          deliver_date: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
          delivery_id: localStorage.clientId,
          receive: 'por correo',
        }
        const result = await this.updatePatient(this.selectedIdReport, updatePat)
        if (result) this.htmlPdf = true
      },
      async esperarVariableTrue() {
        return new Promise(resolve => {
          const esperar = () => {
            if (this.htmlPdf) {
              resolve();
            } else {
              setTimeout(esperar, 100)
            }
          };
          esperar()
        });
      },
    },
  }
</script>

<style scoped>
.ancho-sidebar {
  height: 135px;
  width: calc(100vw - 370px);
}
.width-table {
  width: calc(100vw - 370px);
}
.control-height {
    max-height: calc(100vh - 135px - 72px);
    min-height: calc(100vh - 135px - 72px);
    overflow-x: hidden;
    overflow-y: auto;
    border-top: 1px solid var(--v-gray-base);
}
.content-height {    
    max-height: calc(100vh - 200px);
    min-height: calc(100vh - 200px);
}
.content-div {
    height: 100%;
    border-left: 1px solid var(--v-gray-base);
}
.no-exam {
    color: var(--v-secondary-base) !important;
}
.width-table {
      width: calc(100vw - 368px);
  }
  .shadow {
    box-shadow: 0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%);
  }
  .altura {
    height: 135px;
  }
  .table-height {
    max-height: calc(100vh - 115px - 64px);
    overflow-x: hidden;
    overflow-y: auto;
  }
</style>
