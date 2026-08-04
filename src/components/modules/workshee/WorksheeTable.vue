<template>
  <div class="d-flex flex-column">
    <div class="sidebar sidebar-dos">
      <div class="d-flex justify-end align-end">
        <v-btn
          outlined
          color="primary"
          depressed
          :disabled="selected.length === 0"
          @click="activePrint()"
        >
          <v-icon left>mdi-printer</v-icon>
          imprimir
        </v-btn>
      </div>
    </div>
    <div class="width-table pa-6">
      <v-data-table
        v-if="databaseList"
        v-model="selected"
        class="table-height"
        :headers="headers"
        :items="databaseList"
        :single-expand="singleExpand"
        :single-select="singleSelect"
        item-key="id"
        show-expand
        show-select
        :items-per-page="25"
        :footer-props="{
          'show-current-page': true,
          'show-first-last-page': true,
          'items-per-page-text': 'Elementos por página',
          'items-per-page-options': [5, 10, 15, 20, 25],
        }"
      >
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
        <template v-slot:expanded-item="{ headers, item }">
          <td :colspan="headers.length">
            <p v-for="row in item.exams" :key="row.id">
              {{ row.description }}
            </p>
          </td>
        </template>
      </v-data-table>
    </div>
    <div id="printV" :style="voucherOculto ? 'display: none' : 'display: block'">
    </div>
  </div>
</template>

<script>
import laboratoryMixin from '@/mixins/services/laboratoryMixin'

export default {
  name: 'WorksheeTable',
  mixins: [laboratoryMixin],
  props: {
    databaseList: {
      type: Array,
      default: () => [],
    },
    selectGroup: {
      type: Array,
      default: () => [],
    },
    nameWorkshee: {
      type: String,
      default: '',
    },
    dateWorkshee: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      headers: [
        {text: 'Sec. / #', align: 'start', value: 'patient_position'},
        {text: 'Paciente', align: 'start', value: 'name'},
        {text: 'Edad', align: 'start', value: 'age'},
        {text: 'Sexo', align: 'start', value: 'sex'},
        {text: 'Hora ingreso', align: 'start', value: 'admission_time'},
        {text: 'Teléfono', align: 'start', value: 'phone'},
        {text: '', value: 'data-table-expand' },
      ],
      singleExpand: true,
      singleSelect: false,
      selected: [],
      voucherOculto: true,
    }
  },
  methods: {
    listExam(exams) {
      let result = ''
      exams.forEach(item => {
        result += `<p>${item.description}</p>`
      })
      return result
    },    
    currentDate() {
      const fecha = new Date()
      const anio = fecha.getFullYear()
      var mes = fecha.getMonth() + 1
      var dia = fecha.getDate()
      if (mes < 10) {
          mes = "0" + mes
      }
      if (dia < 10) {
          dia = "0" + dia
      }
      const fechaActual = anio + "-" + mes + "-" + dia
      return fechaActual
    },
    async activePrint() {
      const result = await this.getLaboratorySetting()
      var worksheeFormat = result.workshee_format
      var bodyWorkshee = `<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-top: 10px;">
              <tr>
                <td style="width: 15%;vertical-align: top;text-align: left;padding: 5px;border-bottom: 2px solid black;">
                   <div style="display: flex;flex-direction: column;">
                        <strong>Sec / #</strong>
                        [reg]
                    </div>
                </td>
                <td style="width: 25%;vertical-align: top;text-align: left;padding: 5px;border-bottom: 2px solid black;">
                   <div style="display: flex;flex-direction: column;">
                        <strong>Paciente</strong>
                        [name_patient]
                    </div>
                </td>
                <td style="width: 15%;vertical-align: top;text-align: left;padding: 5px;border-bottom: 2px solid black;">
                   <div style="display: flex;flex-direction: column;">
                        <strong>Edad</strong>
                        [age_patient]
                    </div>
                </td>
                <td style="width: 15%;vertical-align: top;text-align: left;padding: 5px;border-bottom: 2px solid black;">
                   <div style="display: flex;flex-direction: column;">
                        <strong>Sexo</strong>
                        [sex_patient]
                    </div>
                </td>
                <td style="width: 15%;vertical-align: top;text-align: left;padding: 5px;border-bottom: 2px solid black;">
                   <div style="display: flex;flex-direction: column;">
                        <strong>Hora ingreso</strong>
                        [time_patient]
                    </div>
                </td>
                <td style="width: 15%;vertical-align: top;text-align: left;padding: 5px;border-bottom: 2px solid black;">
                   <div style="display: flex;flex-direction: column;">
                        <strong>Teléfono</strong>
                        [phone_patient]
                    </div>
                </td>
              </tr>
              <tr>
                  <td colspan="6" style="vertical-align: top;text-align: left;padding: 5px;">
                    <div style="display: flex;flex-direction: column;">
                          <strong>Observación</strong>
                          [observacion]
                      </div>
                  </td>
              </tr>
                <tr>
                  <td colspan="6" style="vertical-align: top;text-align: left;padding: 5px;">
                      <div style="display: flex;flex-direction: column;font-family: 'Courier New'; line-height: 1.5;">
                        [text_ht]
                      </div>
                  </td>
                </tr>
            </table>`
      worksheeFormat = worksheeFormat.replace('[name_workshee]', this.nameWorkshee )
      worksheeFormat = worksheeFormat.replace('[fecha]', this.dateWorkshee )
      worksheeFormat = worksheeFormat.replace('[fecha_actual]', this.currentDate())
      var parrafo = ''
      await this.asyncForEach(this.selected, async (item) => {
        var textRow = bodyWorkshee
        textRow = textRow.replace('[reg]', `${item.patient_position} / ${item.id}` )
        textRow = textRow.replace('[name_patient]', `${item.name}` )
        textRow = textRow.replace('[age_patient]', `${item.age} ${item.month_year}` )
        textRow = textRow.replace('[sex_patient]', `${item.sex === 1 ? 'Masculino' : 'Femenino'}` )
        textRow = textRow.replace('[time_patient]', `${item.admission_time}` )
        textRow = textRow.replace('[phone_patient]', `${item.phone}` )
        textRow = textRow.replace('[observacion]', `${item.observation}` )
        var textExa = await this.createTextExa(item.exams)
        textRow = textRow.replace('[text_ht]', textExa)
        parrafo += textRow
      })
      worksheeFormat = worksheeFormat.replace('[body]', parrafo)
      var miDiv = document.getElementById("printV")
      miDiv.innerHTML= ''
      var parrafoFin = document.createElement('div');
      parrafoFin.innerHTML = worksheeFormat
      miDiv.appendChild(parrafoFin)
      this.voucherOculto = await false      
      var paragraphs = miDiv.getElementsByTagName("p");
      for (var i = 0; i < paragraphs.length; i++) {
        paragraphs[i].style.lineHeight = "1.5";
      }
      await this.$htmlToPaper("printV")
      this.voucherOculto = true
    },       
    async asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    },
    async createTextExa(listExa) {
      var textExa = ''
      var textCount = 0
      await this.asyncForEach(listExa, async (item) => {
        var nodo = await this.selectGroup.filter((nodo) => nodo.examId === item.examlistsId)
        if (textCount + nodo[0].work_sheet.length > 100) {
          textExa += '<br>'
          textExa += nodo[0].work_sheet
          textCount = 0
        } else {
          textExa += `${nodo[0].work_sheet} `
          textCount += nodo[0].work_sheet.length
        }
      })
      return textExa
    },
  },
}
</script>
<style scoped>
.width-table {
  width: calc(100vw - 356px);
}
.table-height {
  max-height: calc(100vh - 115px - 64px);
  overflow-x: hidden;
  overflow-y: auto;
}
.sidebar-dos {
  height: 115px;
  width: calc(100vw - 370px);
  padding: 20px;
}
</style>
