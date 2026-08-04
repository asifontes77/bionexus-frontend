<template>
    <div id="printV" style="background-color: white;">
        <div v-html="contentTot" style="margin: 20px; background-color: white;"></div>
    </div> 
</template>
  
<script>
    import pacientsMixin from '@/mixins/services/pacientsMixin'
    import laboratoryMixin from '@/mixins/services/laboratoryMixin'
    import usersMixin from '@/mixins/services/usersMixin'
    import { basePath } from '@/config';
    
    export default {
        name: 'ReportPatient',
        mixins: [pacientsMixin, laboratoryMixin, usersMixin],
        props: {
            id: {
                type: Number,
                default: 0,
            },
            isPrint: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                basePath,
                printHidden: true,
                selectedPatient: null,
                headHtml: null,
                contentTot: '',
                maximumRowsReport: 34,
            }
        },
        async mounted() {
            this.getPatient()  
        },
        methods: {
            async getPatient() {
                const result = await this.getPatientIdValidatedResult(this.id)
                if (result) {
                    this.selectedPatient = result 
                    await this.getLaboratory()
                    await this.colocaResult()
                    await this.imprimir()
                } else {
                    this.$toast.warning('Los exámenes reportados deben haber sido aprobados.')
                    return
                }
            },
            async getLaboratory() {
                const result = await this.getLaboratorySetting()
                if (result) {
                    this.headHtml = result.head_html
                    this.maximumRowsReport = result.maximum_rows_report
                }
                if (this.headHtml) {
                    this.headHtml = this.headHtml.replace('[Label_Laboratorio]', result.business_name)
                    let domicilio = `${result.address}<br>Teléfonos: ${result.phone_1}`
                    if (result.phone_2 !== '') {
                        domicilio += '  --  '+ result.phone_2
                    }
                    domicilio += `<br>Correo: ${result.email}`
                    if (result.url !== '') {
                        domicilio += `<br>${result.url}`
                    }
                    this.headHtml = this.headHtml.replace('[logo]',`${this.basePath}/images/${result.logo}`)
                    this.headHtml = this.headHtml.replace('[Label_Laboratorio]', result.business_name)
                    this.headHtml = this.headHtml.replace('[Label_domicilio]', domicilio)
                    this.headHtml = this.headHtml.replace('[NoPaciente]', this.selectedPatient.patient_position)
                    this.headHtml = this.headHtml.replace('[Nombre]', this.selectedPatient.name)
                    this.headHtml = this.headHtml.replace('[Edad]', this.selectedPatient.age + ' ' + this.selectedPatient.month_year)
                    this.headHtml = this.headHtml.replace('[CI]', this.selectedPatient.document_number)
                    this.headHtml = this.headHtml.replace('[Fecha]', this.selectedPatient.admission_date)
                    var alto = '680px'
                    if (this.isPrint) alto = '1000px'
                    this.headHtml = this.headHtml.replace(/\[alto_body\]/g, alto)  
                }
            },
            async colocaResult() {
                var approvedId = -1
                var content = ''
                var resultsContent = ''
                var totalRow = parseInt(this.maximumRowsReport, 10)
                await this.asyncForEach(this.selectedPatient.exams, async (item) => {
                    if (approvedId === -1) {
                        approvedId = item.approved_id
                        content += this.headHtml
                        var user = await this.getUserById(item.approved_id)
                        if (user.status === 404) {
                            content = content.replace('[Label_bionalista]', '')
                            content = content.replace(`<img src='[firma]' style='max-height:18mm; max-width:36mm;' />`, ``)
                        } else {
                            content = content.replace('[Label_bionalista]', `${user.name}<br>${user.college_number}`)
                            content = content.replace('[firma]', `${this.basePath}/images/${user.url_signature}`)
                        }
                    }
                    if (approvedId === item.approved_id) {
                        if ((totalRow - item.size) < 1) {
                            content = content.replace('[body]', resultsContent)
                            content += `<div style="page-break-after: always;"></div>`
                            content += this.headHtml
                            var user = await this.getUserById(item.approved_id)
                            if (user.status === 404) {
                                content = content.replace('[Label_bionalista]', '')
                                content = content.replace(`<img src='[firma]' style='max-height:18mm; max-width:36mm;' />`, ``)
                            } else {
                                content = content.replace('[Label_bionalista]', `${user.name}<br>${user.college_number}`)
                                content = content.replace('[firma]', `${this.basePath}/images/${user.url_signature}`)
                            }
                            resultsContent = ''
                            totalRow = parseInt(this.maximumRowsReport, 10)
                        }
                        if (this.isPrint) {
                            item.result = item.result.replace(/<p>/g, '<p style="font-size: 14px;">')
                        } else {
                            item.result = item.result.replace(/<p>/g, '<p style="font-size: 10px;">')
                        }
                        resultsContent += item.result
                        totalRow = totalRow - parseInt(item.size, 10)
                    } else {
                        content = content.replace('[body]', resultsContent)
                        content += this.headHtml
                        var user = await this.getUserById(item.approved_id)
                        if (user.status === 404) {
                            content = content.replace('[Label_bionalista]', '')
                            content = content.replace(`<img src='[firma]' style='max-height:18mm; max-width:36mm;' />`, ``)
                        } else {
                            content = content.replace('[Label_bionalista]', `${user.name}<br>${user.college_number}`)
                            content = content.replace('[firma]', `${this.basePath}/images/${user.url_signature}`)
                        }
                        resultsContent = ''
                        approvedId = item.approved_id
                        totalRow = parseInt(this.maximumRowsReport, 10)
                    }
                })
                if (resultsContent !== '') {
                    content = content.replace('[body]', resultsContent)
                }
                if (this.isPrint) {
                    content = content.replace(/font-size: 10px;/g, 'font-size: 14px;')
                }
                this.contentTot = await content
            },
            async asyncForEach(array, callback) {
                for (let index = 0; index < array.length; index++) {
                    await callback(array[index], index, array);
                }
            },
            async imprimir() {
                if (this.isPrint) {
                    this.printHidden = false
                    this.$htmlToPaper('printV')
                } else {
                    this.contentTot = `<div style="padding: 20px;background: white;">${this.contentTot}</div>`
                    this.$emit('return-html', this.contentTot)
                }
            }, 
        },
    }
</script>
  