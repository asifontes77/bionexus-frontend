<template>
    <v-container pa-0 fluid fill-height class="align-start flex-column">
        <div class="px-4 d-flex align-center toolbar-history" :class="closeCard ? 'close-card' : ''" style="position: relative;">
            <div class="pr-2" style="width:234px;min-width: 234px;">
                <v-toolbar-title v-show="!closeCard">Historia</v-toolbar-title>
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
                                outlined
                                readonly
                                dense
                                hide-details
                                prepend-icon="mdi-calendar-blank-outline"
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
                        depressed
                        class="ml-2"
                        @click="getPatientListNew()"
                    >
                        <v-icon :class="rotar ? 'rotate-item' : ''">mdi-cached</v-icon>
                    </v-btn>
                </div>
                <v-card v-show="!closeCard" color="#D3DEE1" class="mt-2">
                    <v-card-text
                        v-if="selectedPatient"
                        class="d-flex align-center py-1"
                        :class="selectedPatient.canceled ? 'secondary100' : 'blue200'"
                    >
                        <v-icon left :color="selectedPatient.canceled ? 'secondary' : 'primary'">
                            {{ selectedPatient.canceled === 0 ? 'mdi-account-outline' : 'mdi-account-remove-outline' }}
                        </v-icon>
                        <span :class="selectedPatient.canceled ? 'secondary--text' : 'primary--text'">
                            {{ selectedPatient.name }}
                        </span>
                    </v-card-text>

                </v-card>
            </div> 
            <patient-view v-if="patientList" v-show="!closeCard" :patient="selectedPatient"/>
            <v-card v-if="selectedPatient" v-show="closeCard" :color="selectedPatient.canceled ? 'secondary100' : 'blue200'" height="40" class="mt-2">
                <v-card-text
                    v-if="selectedPatient"
                    class="d-flex align-center py-1"
                >
                    <v-badge
                        color="primary"
                        overlap
                        bottom
                        :content="selectedPatient.patient_position"
                        class="change-font"
                    >
                        <v-icon color="primary">
                            {{ selectedPatient.canceled === 0 ? 'mdi-account-outline' : 'mdi-account-remove-outline' }}
                        </v-icon>
                    </v-badge>
                    <span class="ml-4" :class="selectedPatient.canceled ? 'secondary--text' : 'primary--text'">
                        {{ selectedPatient.name }}
                    </span>
                </v-card-text>

            </v-card>
            <v-btn icon color="secondary" class="cerrar" @click="closeCard=!closeCard">
                <v-icon>mdi-dots-horizontal</v-icon>
            </v-btn>
        </div>
        <div v-if="patientList" class="d-flex content-height" :class="closeCard ? 'close-control-height' : ''" style="width: 100%;">
            <v-navigation-drawer
                permanent
                width="250"
                color="background"
            >
                <v-list width="250" color="background" class="pt-0" style="border-right: 1px solid rgba(0,0,0,.12)">
                    <div class="control-height" :class="closeCard ? 'close-control-height' : ''">
                        <v-list-group
                            v-for="item in patientList"
                            :key="item.id"
                            v-model="item.active"
                            no-action
                            class="narrow"
                            style="border-bottom: 1px solid rgba(0,0,0,.12)"
                            :style="item.canceled === 1 ? 'background-color:#f7f7f7' : item.active ? 'background-color:#D3DEE1' : 'background-color:#F0F0F0'"
                            @click="activeExam(null, item)"
                        >
                            <template v-slot:activator>
                                <v-list-item-icon>
                                    <v-badge
                                        :color="item.active ? 'primary' : 'gray300'"
                                        overlap
                                        bottom
                                        :content="item.patient_position"
                                        class="change-font"
                                    >
                                        <v-icon :color="item.active ? 'primary' : 'gray300'">
                                            {{ item.canceled === 0 ? 'mdi-account-outline' : 'mdi-account-remove-outline' }}
                                        </v-icon>
                                    </v-badge>
                                </v-list-item-icon>
                                <v-list-item-content>
                                    <v-list-item-subtitle :class="item.active ? 'primary--text' : 'gray300--text'">{{ item.name }}</v-list-item-subtitle>
                                </v-list-item-content>
                            </template>
                            <v-list-item
                                v-for="exam in item.exams"
                                :key="exam.id"
                                class="pl-6"
                                @click="activeExam(exam, item)"
                                :disabled="item.canceled !== 0"
                            >
                                <v-list-item-icon class="mr-2">
                                    <v-icon 
                                        :color="exam.status === 2 ? 'primary' : exam.status === 1 ? 'secondary' : 'gray300'"
                                    >
                                    {{ exam.status === 2 ? 'mdi-thumb-up-outline' : exam.status === 1 ? 'mdi-text-box-edit-outline' : 'mdi-emoticon-sad-outline' }}
                                    </v-icon>
                                </v-list-item-icon>
                                <v-list-item-content>
                                    <v-list-item-subtitle class="caption">
                                        {{ exam.description }}
                                    </v-list-item-subtitle>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list-group>
                    </div>
                </v-list>
            </v-navigation-drawer>            
            <div
                class="pt-2 pb-6 px-6"
                style="width: calc(100% - 300px); min-width: 872px;"
            >
                <div v-if="selectedExam">
                    <exam-view v-if="selectedExam.status !== 0" :key="viewKey" :exam="selectedExam" :close-card="closeCard" />
                    <exam-global v-if="selectedExam.status === 0" :key="editKey" :exam="selectedExam" :close-card="closeCard" />
                </div>
            </div>                
            <v-navigation-drawer
                permanent
                right
                expand-on-hover
                height="100%"
            >
                <v-list v-if="selectedPatient" nav dense>
                    <v-list-item
                        v-if="selectedExam"
                        :disabled = "!selectedExam.status===1"
                        @click="activeClearExam = true"
                    >
                        <v-list-item-icon>
                            <v-icon color="error">mdi-trash-can-outline</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title class="error--text">Limpiar resultado</v-list-item-title>
                    </v-list-item>
                    <v-list-item
                        @click="executeReportPatient()"
                    >
                        <v-list-item-icon>
                            <v-icon color="primary">mdi-printer</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title class="primary--text">Imprimir resultados</v-list-item-title>
                    </v-list-item>
                    <v-list-item
                        @click="printComprobante()"
                    >
                        <v-list-item-icon>
                            <v-icon color="primary">mdi-printer-pos</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title class="primary--text">Imp. comprobante</v-list-item-title>
                    </v-list-item>
                    <v-list-item
                        @click="printTMuestra()"
                    >
                        <v-list-item-icon>
                            <v-icon color="primary">mdi-printer-pos</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title class="primary--text">Imp. toma de muestra</v-list-item-title>
                    </v-list-item>
                    <v-divider v-if="!selectedPatient.invoice"></v-divider>
                    <v-list-item
                        v-if="!selectedPatient.invoice"
                        @click="printInvoice()"
                    >
                        <v-list-item-icon>
                            <v-icon color="primary">mdi-invoice-text-edit-outline</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title class="primary--text">Facturar</v-list-item-title>
                    </v-list-item>
                    <v-divider></v-divider>
                    <v-list-item
                        @click="outPdf()"
                    >
                        <v-list-item-icon>
                            <v-icon color="primary">mdi-file-pdf-box</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title class="primary--text">Exportar PDF</v-list-item-title>
                    </v-list-item>
                    <v-divider></v-divider>
                    <v-list-item
                        :disabled="!selectedPatient || selectedPatient.canceled===1"
                        @click="activeCPatient()"
                    >
                        <v-list-item-icon>
                            <v-icon color="secondary">mdi-account-cancel</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title class="secondary--text">Anular paciente</v-list-item-title>
                    </v-list-item>
                </v-list>
                <v-list disabled>
                    <v-list-item
                        v-if="selectedPatient && selectedExam && selectedExam.status === 1"
                        class="blue200"
                    >
                        <v-list-item-icon>
                            <v-icon color="primary">mdi-text-box-edit-outline</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-subtitle class="primary--text">
                                Procesado por:
                            </v-list-item-subtitle>
                            <v-list-item-subtitle class="primary--text">
                                {{ selectedExam.process_name }}
                            </v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item
                        v-if="selectedPatient && selectedExam && selectedExam.status === 2"
                        color="blue200"
                    >
                        <v-list-item-icon>
                            <v-icon color="primary">mdi-thumb-up-outline</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-subtitle class="primary--text">
                                Aprobado por:                                 
                            </v-list-item-subtitle>
                            <v-list-item-subtitle class="primary--text">
                                {{ selectedExam.approved_name }}
                            </v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-navigation-drawer>                
        </div>
        <v-snackbar
            v-model="activeAlert.activate"
            :timeout="activeAlert.timeout"
            color="error"
            elevation="4"
        >
            <v-icon color="white" left class="mr-2">mdi-alert-circle-outline</v-icon>
            {{ activeAlert.text }}

            <template v-slot:action="{ attrs }">
                <v-btn
                    color="white"
                    text
                    v-bind="attrs"
                    @click="activeAlert.activate = false"
                >
                Close
                </v-btn>
            </template>
        </v-snackbar>
        <clear-result-dialog
            v-if="selectedExam"
            v-model="activeClearExam"
            :examen="selectedExam.description"
            @limpiar_examen="acceptClearResult()"
        />
        <report-patient
            v-if="activeReportPatient" 
            v-show="!activeReportPatient"
            :is-print="isPrint"
            :key="reportPatientKey"
            :id="selectedIdReport"
            @return-html="returnHtml"
        />
        <cancel-patient-dialog
            v-if="selectedPatient"
            v-model="activeCancelPatient"
            :id="selectedPatient.id"
            @cancellation-permission="cancellationPermission()"
        />
        <annular-patient-dialog
            v-if="selectedPatient && activeAnnularPatient"
            v-model="activeAnnularPatient"
            :selected-patient="selectedPatient"
            @canceled-patient="canceledPatient()"
        />
        <print-receipt
            v-if="patientIdR"
            :id="patientIdR"
            :key="reportPatientKey"
            :can-dolares="canDolares"
            @close-print="patientIdR=null"
        />
        <Invoice-dialog v-if="activeInvoice" :key="activeInvoiceKey" v-model="activeInvoice" :selected-patient="selectedPatient" @close-invoice="closeInvoice"/>
    </v-container>
</template>

<script>
import pacientsMixin from '@/mixins/services/pacientsMixin'
import usersMixin from '@/mixins/services/usersMixin'
import PatientView from '@/components/modules/history/PatientView.vue'
import ExamView from '@/components/modules/history/ExamView.vue'
import AnnularPatientDialog from '@/components/modules/history/AnnularPatientDialog.vue'
import ClearResultDialog from '@/components/modules/history/ClearResultDialog.vue'
import ReportPatient from '@/components/modules/history/ReportPatient.vue'
import ExamGlobal from '@/components/modules/history/ExamGlobal.vue'
import CancelPatientDialog from '@/components/modules/history/CancelPatientDialog.vue'
import PrintReceipt from '@/components/modules/admission/PrintReceipt.vue'
import InvoiceDialog from '@/components/modules/history/InvoiceDialog.vue'

export default {
    name: 'PatientHistory',
    components: {
        PatientView, 
        ExamView,
        ClearResultDialog,
        ReportPatient,
        ExamGlobal,
        AnnularPatientDialog,
        CancelPatientDialog,
        PrintReceipt,
        InvoiceDialog,
        ReportPatient,
    },
    mixins: [pacientsMixin, usersMixin],
    data() {
        return {
            date: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
            menuDate: false,
            selectedPatient: null,
            selectedExam: null,
            patientList: null,
            patientIdR: null,
            activeAlert: {
                activate: false,
                text: '',
                timeout: 4000,
            },
            rotar: true,
            activeClearExam: false,
            viewKey: 0,
            editKey: 0,
            activeReportPatient: false,
            selectedIdReport: 0,
            reportPatientKey: 0,
            user: null,
            activeCancelPatient: false,
            activeAnnularPatient: false,
            closeCard: false,
            activeInvoice: false,
            activeInvoiceKey: 0,
            isPrint: true,
            canDolares: false,
        }
    },
    watch: {
      'date': {
          handler() {
            this.selectedPatient = null
            this.patientList = null
            this.getPatientListNew()
          },
      },
    },
    async mounted() {
        await this.getPatientListNew()  
        const id = localStorage.clientId
        this.user = await this.getUserById(id)
    },
    methods: {
        activeCPatient() {
            this.activeCancelPatient = true
        },
        cancellationPermission() {
            this.activeAnnularPatient = true
        },
        async getPatientListNew() {
            this.rotar = true
            this.patientList = await this.getPatientsDateOrder(this.date)
            if (this.patientList) {
                await this.asyncForEach(this.patientList, async (patient) => {
                    patient.attended = await this.nameDelivered(patient.user_id)
                    patient.delivered = await this.nameDelivered(patient.delivery_id)
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
            this.selectedPatient = null
            this.selectedExam = null
            this.rotar = false
        },        
        async asyncForEach(array, callback) {
            for (let index = 0; index < array.length; index++) {
                await callback(array[index], index, array);
            }
        },
        async activeExam(exam, item) {
            this.selectedExam = exam
            this.selectedPatient = item
            if (this.selectedPatient.dollar_price_date === null) {
                this.canDolares = false
            } else {
                this.canDolares = true
            }
            this.patienteViewKey += 1
            this.viewKey += 1
            this.editKey += 1
        },
        async nameDelivered(id) {
            var entregado = ''
            if (id) {
                const result = await this.getUserById(id)
                if (result) {
                    entregado = result.name
                }
            }
            return entregado
        },
        printComprobante() {
            this.reportPatientKey += 1
            this.patientIdR = this.selectedPatient.id
        },
        async printTMuestra() {
            const result = await this.getPatientVoucher(this.selectedPatient.id) 
            if (!result) {
                this.activeAlert.activate = true
                this.activeAlert.text = 'Problema al Imprimir, verificar Impresora'
            }
        },
        printInvoice() {
            this.activeInvoiceKey += 1
            this.activeInvoice = true
        },
        async closeInvoice(id) {
            this.activeInvoice = false
            const result = await this.getPatient(id)
            this.selectedPatient = result
            const indice = this.patientList.findIndex(objeto => objeto.id === id)
            if (indice !== -1) {
                this.patientList[indice] = this.selectedPatient
            }
            this.activeInvoice = false
        },
        async acceptClearResult() {
            const envio = {
                status: 0,
                result: null,
                processed_id: 0,
                approved_id: 0,
            }
            const result = await this.setUpdateExam(this.selectedExam.id, envio)
            if (result) {
                this.selectedExam.status = 0
                this.selectedExam.process_name = ''
                this.selectedExam.approved_name = ''
            }
            this.activeClearExam = false
        },
        async searchProcessed(id) {
            const result = await this.getProcessed(id)
            if (result) {
                return result.name
            }
            return 'No registrado'
        },
        executeReportPatient() {
            if (this.selectedPatient) {
                this.selectedIdReport = this.selectedPatient.id
                this.reportPatientKey += 1
                this.activeReportPatient = true
            }
        },
        canceledPatient() {
            this.activeAnnularPatient = false
            this.selectedPatient = null
            this.getPatientListNew()
        },
        outPdf() {
            this.selectedIdReport = this.selectedPatient.id
            this.isPrint = false
            this.reportPatientKey += 1
            this.activeReportPatient = true
        },
        async returnHtml(html) {
            const updatePat = {
                result_html: html,
            }
            const result = await this.updatePatient(this.selectedIdReport, updatePat)
            if (result) {
                const name = `${this.date}-${this.selectedPatient.patient_position}.pdf`
                const resultPdf = await this.generatePdfFromHtmlOut(this.selectedIdReport, name)
                this.$toast.info('Felicidades, Archivo de PDF generado satisfactoriamente')

            }
            this.activeReportPatient = false
            this.isPrint = true
        },
    },
}
</script>

<style scoped>
.toolbar-history {
    background-color: var(--v-sidebar-base);
    min-height:135px;
    width:100%;
}
.close-card {
    min-height:66px !important;
    height:66px !important;
}
.control-height {
    max-height: calc(100vh - 135px - 72px);
    min-height: calc(100vh - 135px - 72px);
    overflow-x: hidden;
    overflow-y: auto;
    border-top: 1px solid var(--v-gray-base);
}
.close-control-height, .close-content-height {
    max-height: calc(100vh - 130px) !important;
    min-height: calc(100vh - 130px) !important;
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
.set-title {
position: absolute;
top: -10px;
left: 10px;
z-index: 10;
}
.cerrar {
    position: absolute;
    bottom: 0;
    right: 0;
}
</style>
