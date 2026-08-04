<template>
  <div id="printR"></div>
</template>
<script>
  import specialTestsMixin  from '@/mixins/services/specialTestsMixin'
  import functionMixin from '@/mixins/util/functionMixin'
  import pacientsMixin from '@/mixins/services/pacientsMixin'
  import { basePath } from '@/config';

  export default {
    name: 'PrintEpacialTest',
    mixins: [specialTestsMixin, pacientsMixin, functionMixin],
    props: {
      newQuery: {
        type: Object,
        default: () => ({})
      },
    },
    data() {
      return {
        printFormatHtml: '',
        laboratory: {},
        specialLab: {},
        basePath,
      }
    },
    async mounted() {
      await this.getLaboratory()
      await this.getSpecialLab()
      await this.createPrint()
    },
    methods: {
      async getLaboratory() {
        const result = await this.getVoucherFormat(1)
        if(result) {
          this.laboratory = result
        }
      },
      async getSpecialLab() {
        const result = await this.getSpecialTestLab(this.newQuery.laboratory)
        if(result) {
          this.specialLab = result
        }
      },
      async getPatientId(id) {
        const result = await this.getPatient(id)
        if(result) {
          return result
        }
        return null
      },
      async createPrint() {
        var testFormat = await this.applyTestFomat()
        var testPatient = await this.patientTestFormat()
        testFormat = testFormat.replace('[src_image]', `${this.basePath}/images/${this.laboratory.logo}` )
        testFormat = testFormat.replace('[business_name]', this.laboratory.business_name)
        testFormat = testFormat.replace('[rif_lab]', this.laboratory.rif)
        testFormat = testFormat.replace('[address_lab]', this.laboratory.address)
        testFormat = testFormat.replace('[phone_1]', this.laboratory.phone_1)
        testFormat = testFormat.replace('[phone_2]', this.laboratory.phone_2)
        testFormat = testFormat.replace('[email]', this.laboratory.email)
        testFormat = testFormat.replace('[laboratory-name]', this.specialLab.description)
        testFormat = testFormat.replace('[address]', this.specialLab.address)
        testFormat = testFormat.replace('[special-phone-1]', this.specialLab.phone_1)
        testFormat = testFormat.replace('[special-phone-2]', this.specialLab.phone_2)
        testFormat = testFormat.replace('[special-email]', this.specialLab.email)
        testFormat = testFormat.replace('[firstDate]' ,this.newQuery.firstDate)
        testFormat = testFormat.replace('[lastDate]' ,this.newQuery.lastDate)
        var listPatient = ''
        await this.asyncForEach(this.newQuery.items, async (item) => {
          var testItem = testPatient
          testItem = testItem.replace('[patient-date]', item.admission_date)
          testItem = testItem.replace('[patient_position]', item.patient_position)
          testItem = testItem.replace('[patient-name]', item.name)
          testItem = testItem.replace('[patient-ci]', item.document_number)
          testItem = testItem.replace('[patient-age]', item.age + ' ' + item.month_year)
          testItem = testItem.replace('[patient-sex]', item.sex = 1 ? 'Masculino' : 'Femenino')
          testItem = testItem.replace('[sample_type]', item.sample_type)
          testItem = testItem.replace('[patient-observation]', item.observation)
          var listExam = ''
          await this.asyncForEach(item.exams, async (itemExam) => {
            var itemHtml =`<div>${itemExam.description}</div>`
            listExam += itemHtml
          })
          testItem = testItem.replace('[patient-exams]', listExam)
          listPatient += testItem
        })
        testFormat = testFormat.replace('[place-patients]', listPatient)
        var parrafo = document.createElement('div')
        var miDiv = document.getElementById("printR")
        parrafo.innerHTML = testFormat
        miDiv.appendChild(parrafo)
        this.printHtml()
      },
      printHtml() {
        this.$nextTick(() => {
          this.$htmlToPaper("printR")
          this.$emit('close-print')
        })
      },      
      async asyncForEach(array, callback) {
            for (let index = 0; index < array.length; index++) {
                await callback(array[index], index, array);
            }
        },
    },
  }
</script>