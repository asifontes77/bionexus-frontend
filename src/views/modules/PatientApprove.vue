<template>
    <v-container pa-0 fluid fill-height class="align-start flex-column">
        <div class="d-flex align-center toolbar-history" :class="closeCard ? 'close-card' : ''" style="position: relative;">
            <div class="pl-4 pr-2" style="width:234px;min-width: 234px;">
                <v-toolbar-title v-show="!closeCard">APROBAR</v-toolbar-title>
                <div class="d-flex" :class="closeCard ? 'mt-4' : ''">
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
                                prepend-icon="mdi-calendar-blank-outline"
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
                        @click="changeByGroup()"
                    >
                        <v-icon :class="rotar ? 'rotate-item' : ''">mdi-cached</v-icon>
                    </v-btn>
                </div>
                <div v-if="!closeCard" class="d-flex align-center">
                    <div style="width: 30px">
                        <v-btn icon class="ml-n2" @click="activeGroup=!activeGroup">
                            <v-icon>mdi-dots-horizontal</v-icon>
                        </v-btn>
                    </div>
                    <div style="width: calc(100% - 30px)">
                        <v-fade-transition>
                            <v-select
                                v-if="activeGroup"
                                v-model="group.id"
                                :items="groupItems"
                                label="Seleccione grupo"
                                dense
                                outlined
                                :disabled="approved.signature"
                                hide-details
                                item-text="description"
                                item-value="id"
                                class="mt-2"
                                @change="changeByGroup()"
                            />
                        </v-fade-transition>
                    </div>
                </div>
            </div>
            <patient-view v-if="patientList" v-show="!closeCard" :patient="selectedPatient" />
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
                width="234"
                max-width="234"
                color="background"
            >
                <v-list width="234" color="background" class="pt-0" style="border-right: 1px solid rgba(0,0,0,.12)">
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
                                <v-list-item-icon class="mr-2">
                                    <v-icon :color="item.active ? 'primary' : 'gray300'"
                                    >
                                    {{ item.canceled === 0 ? 'mdi-account-outline' : 'mdi-account-remove-outline' }}
                                    </v-icon>
                                </v-list-item-icon>
                                <v-list-item-content @click="activePatient(item)">
                                    <v-list-item-title>{{ item.patient_position }}</v-list-item-title>
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
                                    <v-list-item-subtitle>
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
                <div v-if="selectedPatient">
                    <div v-if="selectedExamAll">
                        <exam-view-list :key="viewAllKey" :exam="selectedExamAll" :close-card="closeCard" />
                    </div>
                    <div v-if="selectedExam">
                        <exam-view v-if="selectedExam.status !== 0" :key="viewKey" :exam="selectedExam" :close-card="closeCard" />
                        <exam-edit v-if="selectedExam.status === 0" :key="editKey" :exam="selectedExam" :close-card="closeCard" />
                    </div>
                </div>
            </div>            
            <v-navigation-drawer
                v-model="drawer"
                :mini-variant.sync="mini"
                permanent
                right
                height="100%"
                color="background"
                class="control-height"
            >
                <v-list-item class="px-2">
                    <v-list-item-avatar>
                        <v-icon>mdi-check-decagram-outline</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-title>Aprobar</v-list-item-title>
                    <v-btn
                        icon
                        @click.stop="mini = !mini"
                    >
                        <v-icon>mdi-chevron-left</v-icon>
                    </v-btn>
                </v-list-item>
                <v-divider></v-divider>              
                <div v-if="!mini">                    
                    <div class="d-flex flex-column content-div">
                        <div v-if="selectedPatient" class="px-2">
                            <v-select
                                v-model="approved.id"
                                :items="userItems"
                                label="Seleccione usuario"
                                dense
                                outlined
                                :disabled="approved.signature"
                                hide-details
                                item-text="name"
                                item-value="id"
                                class="mt-6 mx-1"
                            />
                            <v-text-field
                                v-model="signatureKey"
                                outlined
                                dense
                                label="Coloque la clave de firma"
                                type="password"
                                :rules="[rules.required]"
                                :append-outer-icon="approved.signature ? 'mdi-lock-check-outline' : 'mdi-lock-check'"
                                class="mt-6 mx-1"
                                :disabled="approved.signature"
                                @click:append-outer="activeApprovedSignature()"

                            />
                        </div>
                    </div>
                </div>
                <div v-if="approved.signature">
                    <v-list v-if="!selectedExam" dense>
                        <v-list-item @click="approveResultAll()" >
                            <v-list-item-icon>
                                <v-icon color="primary">mdi-thumb-up-outline</v-icon>
                            </v-list-item-icon>
                            <v-list-item-content>
                                <v-list-item-title>Aprobar resultados</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>                                    
                    </v-list>
                    <div v-if="selectedExam">
                        <v-list v-if="selectedExam.status !== 0" dense>
                            <v-list-item @click="approveResult()" >
                                <v-list-item-icon>
                                    <v-icon color="primary">
                                        {{ selectedExam.status===1 ? 'mdi-thumb-up-outline' : 'mdi-thumb-down-outline' }}
                                    </v-icon>
                                </v-list-item-icon>
                                <v-list-item-content>
                                    <v-list-item-title>
                                        {{ selectedExam.status===1 ? 'Aprobar resultado' : 'Desaprobar resultado' }}
                                    </v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                            <v-list-item @click="clearResult()" >
                                <v-list-item-icon>
                                    <v-icon color="error">mdi-trash-can-outline</v-icon>
                                </v-list-item-icon>
                                <v-list-item-content>
                                    <v-list-item-title>Limpiar resultado</v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>                                       
                        </v-list>
                    </div>
                </div>
            </v-navigation-drawer>
        </div>
    </v-container>
</template>

<script>
import pacientsMixin from '@/mixins/services/pacientsMixin'
import usersMixin from '@/mixins/services/usersMixin'
import groupHTMixin from '@/mixins/services/groupHTMixin'
import PatientView from '@/components/modules/history/PatientView.vue'
import ExamView from '@/components/modules/history/ExamView.vue'
import ExamEdit from '@/components/modules/history/ExamEdit.vue'
import ExamViewList from '@/components/modules/history/ExamViewList.vue'

export default {
    name: 'PatientApprove',
    components: { PatientView, ExamView, ExamEdit, ExamViewList },
    mixins: [pacientsMixin, usersMixin, groupHTMixin],
    data() {
        return {
            group: {
                id: null,
                listItems: null,
            },
            groupItems: null,
            activeGroup: false,
            date: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
            menuDate: false,
            selectedPatient: null,
            selectedExam: null,
            selectedExamAll: null,
            indexSelected: null,
            rotar: true,
            patientList: [],
            viewKey: 0,
            viewAllKey: 0,
            editKey: 0,
            signatureKey: '',
            approved: {
                id: null,
                signature: false,
                name: '',
                college: ''
            },
            rules: {
                required: value => !!value || 'Requerido.',
            },
            userItems: null,
            closeCard: false,
            drawer: true,
            mini: true,
        }
    },
    watch: {
      'date': {
          handler() {
            this.changeByGroup()
          },
      },
    },
    async mounted() {
        await this.getPatientListNew() 
        this.userItems = await this.getSignatureUsers()
        await this.getGroupListItems()
    },
    methods: {
        async getGroupListItems() {
            this.groupItems = await this.getGroupHtListActive()
            const newItem = {
                id: 0,
                description: 'Todos',
                grouphtitems: [],
            }
            this.groupItems.unshift(newItem)
        },
        async getPatientListByGroup() {
            const itemGroup = await this.getGroupHt(this.group.id)
            const group = []
            itemGroup.grouphtitems.forEach((item) => {
                group.push(item.examId)
            })            
            const result = await this.getPatientsDateGroupResult(this.date)
            result.forEach(row => {
                row.exams = row.exams.filter(objeto => group.includes(objeto.examlistsId))
            })
            this.patientList = result.filter(objeto => objeto.exams.length !== 0)
        },
        async getPatientListNew() {
            this.rotar = true
            this.patientList = await this.getPatientsDateResult(this.date)
            if (this.patientList) {
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
            this.selectedPatient = null
            this.selectedExam = null
            this.rotar = false

        },       
        async asyncForEach(array, callback) {
            for (let index = 0; index < array.length; index++) {
                await callback(array[index], index, array);
            }
        },
        async searchProcessed(id) {
            const result = await this.getProcessed(id)
            if (result) {
                return result.name
            }
            return 'No registrado'
        },
        activeExam(exam, item) {
            this.selectedExam = exam
            if (exam) {
                this.selectedExamAll = null
                console.log('activo exam')
            }
            this.indexSelected = 0
            this.selectedPatient = item
            this.viewKey += 1
            this.editKey += 1
        },
        activePatient(item) {
            this.selectedExam = null
            this.selectedExamAll = item.exams
            this.selectedPatient = item
            this.viewAllKey += 1
        },
        async approveResult() {
            if (this.selectedExam) {
                const id = this.selectedExam.id
                let newStatus = 2
                let newApprovedId = this.approved.id
                if (this.selectedExam.status===2) {
                    newStatus = 1
                    newApprovedId = 0
                }
                const changes = {
                        status: newStatus,
                        approved_id: this.approved.id
                    }
                const result = await this.setUpdateExam(id, changes)
                if (result) {
                    this.selectedExam.status = newStatus
                    this.selectedExam.approved_id = newApprovedId
                }
            }
        },
        async approveResultAll() {
            if (this.selectedPatient) {
                await this.asyncForEach(this.selectedPatient.exams, async (exam) => {
                    if (exam.status !== 0 && exam.status !== 2) {
                        this.selectedExam = exam
                        await this.approveResult()
                    }
                })
                this.selectedExam = null
            }
        },
        async clearResult() {
            const id = this.selectedExam.id
            const changes = {
                status: 0,
                approved_id: 0,
                processed_id: 0,
                result: null,
            }
            const result = await this.setUpdateExam(id, changes)
            if (result) {
                this.selectedExam.status = 0
                this.selectedExam.approved_id = 0
                this.selectedExam.processed_id = 0
                this.selectedExam.result = null
            }
        },
        async activeApprovedSignature() {
            this.approved.signature = false
            if (this.signatureKey.length !== 0) {
                const result = await this.verifySignature(this.approved.id, this.signatureKey)
                console.log('firma: ', result)
                if (result) {
                    if (result.status !== 404) {
                        this.approved.name = result.user.name
                        this.approved.college = result.user.college_number
                        this.approved.signature = true
                    }
                }
            }
        },
        changeByGroup() {
            this.selectedPatient = null
            if (!this.activeGroup) {
                this.getPatientListNew()
            } else {
                if (this.group.id === 0) {
                    this.getPatientListNew()
                } else {
                    this.getPatientListByGroup()
                }
            }
        },
    }
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
.cerrar {
    position: absolute;
    bottom: 0;
    right: 0;
}
.close-control-height, .close-content-height {
    max-height: calc(100vh - 130px) !important;
    min-height: calc(100vh - 130px) !important;
}
</style>
