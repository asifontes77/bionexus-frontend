<template>
    <v-dialog
        v-if="selectedExam"
        v-model="show"
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
    >
        <v-card>
            <v-toolbar
                color="sidebar"
            >
                <v-btn
                    icon
                    color="primary"
                    @click="$emit('change-model',false)"
                >
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-toolbar-title  class="primary--text">{{ selectedExam.description }}</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-toolbar-items>
                    <v-btn
                        text
                        color="secondary"
                        @click="saveChanges()"
                        >
                            Guardar
                    </v-btn>
                </v-toolbar-items>
            </v-toolbar>
            <v-tabs class="mt-4">
                <div class="border d-flex">
                    <v-tab>Detalle</v-tab>
                    <v-tab>Hoja de trabajo</v-tab>
                    <v-tab>Editar examen</v-tab>
                </div>
                <v-tab-item>
                    <div class="screen-height background">                        
                        <v-container>
                            <div class="pa-6">
                                <v-row>
                                    <v-col cols="12" sm="6">
                                        <v-text-field
                                            v-model="selectedExam.description"
                                            label="Descripción"
                                            counter="60"
                                            maxlength="60"
                                            outlined
                                            dense
                                        />
                                    </v-col>
                                    <v-col cols="12" sm="6">
                                        <v-text-field
                                            v-model="selectedExam.abbreviation"
                                            label="Abreviatura"
                                            outlined
                                            counter="10"
                                            maxlength="10"
                                            dense
                                        />
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="6" sm="2">
                                        <v-text-field
                                            v-model="selectedExam.cost1"
                                            v-mask="currencyMask"
                                            type="text"
                                            label="Precio 1"
                                            outlined
                                            dense
                                        />
                                    </v-col>
                                    <v-col cols="6" sm="2">
                                        <v-text-field
                                            v-model="selectedExam.cost2"
                                            type="number"
                                            label="Precio 2"
                                            outlined
                                            dense
                                        />
                                    </v-col>
                                    <v-col cols="6" sm="2">
                                        <v-text-field
                                            v-model="selectedExam.cost3"
                                            v-mask="currencyMask"
                                            type="text"
                                            label="Precio 3"
                                            outlined
                                            dense
                                        />
                                    </v-col>
                                    <v-col cols="6" sm="2">
                                        <v-text-field
                                            v-model="selectedExam.cost4"
                                            v-mask="currencyMask"
                                            type="text"
                                            label="Precio 4"
                                            outlined
                                            dense
                                        />
                                    </v-col>
                                    <v-col cols="6" sm="2">
                                        <v-text-field
                                            v-model="selectedExam.cost5"
                                            v-mask="currencyMask"
                                            type="text"
                                            label="Precio 5"
                                            outlined
                                            dense
                                        />
                                    </v-col>
                                    <v-col cols="6" sm="2">
                                        <v-text-field
                                            v-model="selectedExam.cost6"
                                            v-mask="currencyMask"
                                            type="text"
                                            label="Precio 6"
                                            outlined
                                            dense
                                        />
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="6" sm="2">
                                        <v-select
                                            v-if="taxList"
                                            v-model="selectedExam.tax_id"
                                            :items="taxList"
                                            item-text="description"
                                            item-value="id"
                                            label="Tipo de impuesto"
                                            dense
                                            outlined
                                        />
                                    </v-col>
                                    <v-col cols="6" sm="2">
                                        <v-switch
                                            v-model="selectedExam.annulled"
                                            color="warning"
                                            hide-details
                                            class="mt-0"
                                        >
                                            <template v-slot:label>
                                                <v-icon :color="selectedExam.annulled ? 'secondary' : ''" class="mr-2">{{ selectedExam.annulled ? 'mdi-eye-off' : 'mdi-eye'}}</v-icon>
                                                <span :class="selectedExam.annulled ? 'secondary--text' : ''">Anulado</span>
                                            </template>
                                        </v-switch>
                                    </v-col>
                                    <v-col cols="6" sm="3">
                                        <v-switch
                                            v-model="selectedExam.special_test"
                                            color="primary"
                                            hide-details
                                            class="mt-0"
                                        >
                                            <template v-slot:label>
                                                <v-icon :color="selectedExam.special_test ? 'primary' : ''" class="mr-2">mdi-ambulance</v-icon>
                                                <span :class="selectedExam.special_test ? 'primary--text' : ''">Prueba especial</span>
                                            </template>
                                        </v-switch>
                                    </v-col>
                                </v-row>
                            </div>
                        </v-container>
                    </div>
                </v-tab-item>
                <v-tab-item>
                    <div class="screen-height background">
                        <edit-worksheet-dialog :selected-exam="selectedExam" />
                    </div>
                </v-tab-item>
                <v-tab-item>
                    <div class="screen-height background">
                        <draggable-component :selected-exam="selectedExam" />
                    </div>
                </v-tab-item>
            </v-tabs>
        </v-card>
    </v-dialog>
</template>

<script>
import examsListMixin from '@/mixins/services/examsListMixin'
import EditWorksheetDialog from '@/components/modules/exams/EditWorksheetDialog.vue'
import DraggableComponent from '@/components/modules/exams/draggableComponent.vue'
import createNumberMask from 'text-mask-addons/dist/createNumberMask'

export default {
  components: { EditWorksheetDialog, DraggableComponent },
    name: 'EditExamDialog',
    mixins: [examsListMixin],
    model: {
        prop: 'show',
        event: 'change-model',
    },
    props: {
        show: {
            type: Boolean,
            default: false,
        },
        examId: {
            type: String,
            default: '0',
        },
    },
    data() {
        return {
            taxList: null,
            selectedExam: null,
            currencyMask: createNumberMask({
                prefix: "",
                includeThousandsSeparator: true,
                allowNegative: false,
                thousandsSeparatorSymbol: "",
                allowDecimal: true,
                decimalSymbol: ".",
                decimalLimit: 2,
                allowLeadingZeroes: true,
            }),
        }
    },
    async mounted() {
        this.taxList = await this.getTaxList()
        const list = await this.getExamById(this.examId)
        this.selectedExam = list
    },
    watch: {
        'selectedExam.description': {
            handler() {
                this.selectedExam.description = this.selectedExam.description.toUpperCase()
                this.selectedExam.description = this.selectedExam.description.substring(0,60)
            }
        },
        'selectedExam.abbreviation': {
            handler() {
                this.selectedExam.abbreviation = this.selectedExam.abbreviation.toUpperCase()
                this.selectedExam.abbreviation = this.selectedExam.abbreviation.substring(0,10)
            }
        },
    },
    methods: {
        async saveChanges() {
            this.undoActive()
            const result = await this.updateExamList(this.selectedExam.id, this.selectedExam)
            if (result) {
                this.$emit('save-changes')
                this.$emit('change-model',false)
            }
        },
        async undoActive() {
            let cantRow = this.selectedExam.format_vue.rowContainer.length
            this.selectedExam.format_vue.rowContainer.forEach((itemRow) => {
                if (itemRow.content.cols === 4) {
                    if (itemRow.content.stageColumns[3]) {
                        cantRow += this.contarRepeticiones('<p>', itemRow.content.stageColumns[3].content[0].text)
                    }
                }
                itemRow.content.stageColumns.forEach((itemCol) => {
                    let index = 1
                    itemCol.content.forEach((content) => {
                        content.active = false
                    })
                })
            })
            this.selectedExam.size = cantRow
        },
        contarRepeticiones(texto, cadena) {
            if (cadena.trim() !== '') {
                return cadena.split(texto).length - 2;
            }
            return 0
        }
    },
}
</script>
<style scoped>
.border {
    width: 100%;
    border-bottom: 1px solid var(--v-primary-base);
}
.screen-height {
    height: calc(100vh - 128px);
    max-height: calc(100vh - 128px);
    overflow-y: auto;
    overflow-x: hidden;
}
</style>
