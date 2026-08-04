<template>
  <v-container pa-0 fluid fill-height class="align-start">
    <div class="d-flex">
        <v-list width="300" color="background" class="pt-0">
            <v-subheader class="sidebar primary--text shadow">GRUPO EXÁMENES</v-subheader>
            <v-list-item-group v-model="selectedGroupId" color="primary" class="control-height">
                <v-list-item v-for="item in groupList" :key="item.id" @click="selectionClick(item)">
                    <v-list-item-icon>
                        <v-icon :color="item.its_exam ? '' : 'secondary'">mdi-select-group</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-subtitle :class="!item.its_exam ? 'no-exam' : ''">{{ item.description }}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-icon>
                        <v-icon v-if="item.annulled">mdi-eye-off</v-icon>
                    </v-list-item-icon>
                </v-list-item>
            </v-list-item-group>
        </v-list>
        <div>
            <v-app-bar color="sidebar" height="48" class="width-table">
                <v-subheader v-if="selectedGroup" class="primary--text">{{ selectedGroup.description }}</v-subheader>
                <v-spacer></v-spacer>
                <div>
                    <v-btn
                        depressed
                        color="primary"
                        @click="activeNewGrupo=!activeNewGrupo"
                    >
                        Nuevo grupo
                    </v-btn>
                </div>
                <div v-if="selectedGroup">
                    <v-tooltip left>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                icon
                                color="secondary"
                                v-bind="attrs"
                                v-on="on"
                                @click="createNewCosts()"
                            >
                                <v-icon>mdi-cash-multiple</v-icon>
                            </v-btn>
                        </template>
                        <span>Actualizar todos los precios</span>
                    </v-tooltip>
                    <v-menu
                        left
                        bottom
                        :disabled="!selectedGroup"
                    >
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                icon
                                v-bind="attrs"
                                v-on="on"
                            >
                                <v-icon>mdi-dots-vertical</v-icon>
                            </v-btn>
                        </template>
                        <v-list>
                            <v-list-item
                                v-for="item in menuGroup"
                                :key="item.value"
                                @click="clickMenu(item)"
                            >
                                <v-list-item-icon>
                                    <v-icon>{{ item.icon }}</v-icon>
                                </v-list-item-icon>
                                <v-list-item-title>{{ item.text }}</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </div>
            </v-app-bar>
            <exams-table 
                v-if="examsList" 
                :database-list="examsList" 
                @menu-actions="menuActions"
            />
        </div>
        <price-change-dialog
            :key="keyRestart"
            v-model="activatePriceDialog"
            @change-prices="changePrices" 
        />
        <edit-group-dialog
            v-if="activateEditGroup && selectedGroup"
            v-model="activateEditGroup"
            :selected-group = "selectedGroupTMP"
            @change-group="changeGroup"
        />
        <edit-exam-dialog
            v-if="examId !=='0'"
            :key="keyNewEdit"
            v-model="activateEditExam"
            :exam-id="examId"
            @save-changes="saveChanges"
        />
        <new-group
            v-if="activeNewGrupo"
            v-model="activeNewGrupo"
            @save-group="saveGroup"
        />
        <create-exam
            v-if="activateNewExam"
            v-model="activateNewExam"
            :selected-group="selectedGroupTMP"
            @save-exam="saveExam"
        />
    </div>
  </v-container>
</template>

<script>
import examsListMixin from '@/mixins/services/examsListMixin'
import ExamsTable from '@/components/modules/exams/ExamsTable.vue'
import PriceChangeDialog from '@/components/modules/exams/PriceChangeDialog.vue'
import EditGroupDialog from '@/components/modules/exams/EditGroupDialog.vue'
import EditExamDialog from '@/components/modules/exams/EditExamDialog.vue'
import CreateExam from '@/components/modules/exams/createExam.vue'
import NewGroup from '@/components/modules/exams/newGroup.vue'
export default {
    name: "ExamsList",
    components: {
        ExamsTable,
        PriceChangeDialog,
        EditGroupDialog,
        EditExamDialog,
        NewGroup, 
        CreateExam,
    },
    mixins: [examsListMixin],
    data() {
        return {
            keyRestart: 0,
            keyNewEdit:0,
            groupList: [],
            selectedGroup: null,
            selectedExam: null,
            selectedGroupTMP: null,
            selectedExamTMP: null,
            examId: '0',
            selectedGroupId: null,
            examsList: null,
            activatePriceDialog: false,
            activateEditGroup: false,
            activateEditExam: false,
            activateNewExam: false,
            activeNewGrupo: false,
            menuGroup: [
                {
                    value: 'edit',
                    text: 'Editar grupo',
                    icon: 'mdi-pencil'
                },
                {
                    value: 'hide',
                    text: 'Ocultar grupo',
                    icon: 'mdi-eye-off',
                },
                {
                    value: 'newExam',
                    text: 'Nuevo examen',
                    icon: 'mdi-new-box',
                }
            ],
        }
    },
    mounted() {
        this.getGroupList()
    },
    methods: {
        async getGroupList() {
            this.groupList = await this.getExamGroupListAll()   
            console.log('lista: ', this.groupList)
        },
        async selectionClick(item) {
            this.selectedGroup = item
            this.examsList = await this.getExamListByGroup(item.id)
        },
        menuActions(item, action) {
            if (action === 'Ocultar') this.changeHideExam(item)
            if (action === 'Editar') this.changeEditExam(item)
        },
        clickMenu(itemMenu) {
            if (itemMenu.value === 'hide') this.changeHide()
            if (itemMenu.value === 'edit') this.changeEditGroup()
            if (itemMenu.value === 'newExam') this.createExam()
        },
        createNewCosts() {
            this.keyRestart += 1
            this.activatePriceDialog = !this.activatePriceDialog
        },
        changeEditGroup() {
            this.selectedGroupTMP = JSON.parse(JSON.stringify(this.selectedGroup))
            this.activateEditGroup = !this.activateEditGroup
        },
        createExam() {
            this.selectedGroupTMP = JSON.parse(JSON.stringify(this.selectedGroup))
            this.activateNewExam = true
        },
        changeEditExam(item) {
            this.examId = item.id.toString()
            this.activateEditExam = true
            this.keyNewEdit += 1
        },
        async changeHide() {
            let valor = 0
            const id = this.selectedGroup.id
            if (this.selectedGroup.active === 0) valor = 1
            const change = {
                active: valor
            }
            const result = await this.updateExamgroup(id, change)
            if (result) {
                this.selectedGroup.active = valor
            }
        },
        async changeHideExam(item) {
            let valor = 0
            const id = item.id
            if (item.annulled === 0) valor = 1
            const change = {
                annulled: valor
            }
            const result = await this.updateExamList(id, change)
            if (result) {
                item.annulled = valor
            }
        },
        async asyncForEach(array, callback) {
            for (let index = 0; index < array.length; index++) {
                await callback(array[index], index, array);
            }
        },
        saveGroup() {
            this.getGroupList()
            this.selectedGroup = null
        },
        async saveExam() {
            this.examsList = await this.getExamListByGroup(this.selectedGroup.id)
        },
        async changePrices(costList, onlyThisGroup) {
            const shippingList = []
            costList.forEach((item) => {
                if (item.active) {
                    const increment = item.increment.toString().replace(',', '.')
                    const newItem = {
                        value: item.value,
                        increment: increment,
                        aboutWho: item.aboutWho,
                    }
                    shippingList.push(newItem)
                }
            })
            var listChanges
            if (onlyThisGroup) {
                listChanges = await this.getExamListByGroup(this.selectedGroup.id)
            } else {
                listChanges = await this.getExamList()
            }
            await this.asyncForEach(listChanges, async (exam) => {
                const updateFields = {}
                shippingList.forEach((campo) => {
                    if (campo.value === 'cost1') { 
                        updateFields.cost1 = parseInt(exam[campo.aboutWho]) + Math.round(parseInt(exam[campo.aboutWho]) * campo.increment / 100)
                    }
                    if (campo.value === 'cost2') { 
                        updateFields.cost2 = parseInt(exam[campo.aboutWho]) + Math.round(parseInt(exam[campo.aboutWho]) * campo.increment / 100)
                    }
                    if (campo.value === 'cost3') { 
                        updateFields.cost3 = parseInt(exam[campo.aboutWho]) + Math.round(parseInt(exam[campo.aboutWho]) * campo.increment / 100)
                    }
                    if (campo.value === 'cost4') { 
                        updateFields.cost4 = parseInt(exam[campo.aboutWho]) + Math.round(parseInt(exam[campo.aboutWho]) * campo.increment / 100)
                    }
                    if (campo.value === 'cost5') { 
                        updateFields.cost5 = parseInt(exam[campo.aboutWho]) + Math.round(parseInt(exam[campo.aboutWho]) * campo.increment / 100)
                    }
                    if (campo.value === 'cost6') { 
                        updateFields.cost6 = parseInt(exam[campo.aboutWho]) + Math.round(parseInt(exam[campo.aboutWho]) * campo.increment / 100)
                    }
                })
                const result = await this.updateExamList(exam.id, updateFields)
                if (result) {
                    this.examsList = null
                }
            })
        },
        async changeGroup(selecGroup) {
            const modifyGroup = {
                annulled: selecGroup.annulled ? '1' : '0',
                description: selecGroup.description,
                its_exam: selecGroup.its_exam ? '1' : '0',
            }
            const result = await this.updateExamgroup(selecGroup.id, modifyGroup)
            if (result) {
                this.selectedGroup.description = selecGroup.description
                this.selectedGroup.annulled = selecGroup.annulled 
                this.selectedGroup.its_exam = selecGroup.its_exam 
            }
        },
        async saveChanges() {
            this.examsList = await this.getExamListByGroup(this.selectedGroup.id)
        },
    },
}
</script>

<style scoped>
.control-height {
    max-height: calc(100vh - 121px);
    overflow-x: hidden;
    overflow-y: auto;
    border-top: 1px solid var(--v-gray-base);
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
</style>
