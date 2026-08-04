<template>
    <div class="ma-6">
        <v-row no-gutters>
            <v-col cols="3">
                <div class="d-flex">
                    <v-btn-toggle v-model="toggleSearch">
                        <v-btn style="height: 41px">
                            <v-icon>mdi-select-group</v-icon>
                        </v-btn><v-btn style="height: 41px">
                            <v-icon>mdi-alpha-r-circle-outline</v-icon>
                        </v-btn>
                        <v-btn style="height: 41px">
                            <v-icon>mdi-magnify</v-icon>
                        </v-btn>
                    </v-btn-toggle>
                    <v-select
                        v-if="toggleSearch===0"
                        v-model="selectedGroup"
                        :items="groupList"
                        item-text="description"
                        item-value="id"
                        hide-details
                        dense
                        outlined
                        @change="getSelectedGroup()"
                    />
                    <v-text-field
                        v-if="toggleSearch===2"
                        v-model="searchExam"
                        hide-details
                        outlined
                        dense
                        clear-icon="mdi-close-circle"
                        clearable
                        @click:clear="getSelectedGroup()"
                        @input="getSearchExam()"
                    />
                </div>
                <v-card v-if="toggleSearch===1" style="border: 1px solid gray; overflow-y: auto; height: calc(100vh - 333px)">
                    <v-list dense>
                        <v-list-item-group v-if="routinesList" v-model="itemSelectExam" color="primary">
                            <v-list-item 
                                v-for="item in routinesList" 
                                :key="item.id"
                                color="primary"
                                class="pt-0"
                                @click="getSelectedRoutine(item)"
                            >
                                <v-list-item-content>
                                    <v-list-item-title>{{ item.description }}</v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list-item-group>
                    </v-list>
                </v-card>
                <v-card v-else style="border: 1px solid gray; overflow-y: auto; height: calc(100vh - 333px)">
                    <v-list dense>
                        <v-list-item-group v-if="selectedExam" v-model="itemSelectExam" color="primary">
                            <v-list-item 
                                v-for="item in selectedExam" 
                                :key="item.id"
                                color="primary"
                                class="pt-0"
                                @click="activeExamSelection(item)"
                            >
                                <v-list-item-content>
                                    <v-list-item-title>{{ item.description }}</v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list-item-group>
                    </v-list>
                </v-card>
            </v-col>
            <v-col cols="9">
                <v-select
                    v-model="tariffTmp"
                    :items="tariffList"
                    label="Seleccione tarifa"                    
                    item-text="name"
                    item-value="value"
                    outlined
                    dense
                    class="ml-2"
                    style="width: 250px;"
                    @change="getSelectedTariff()"
                />
                <v-simple-table
                    v-if="newExams"
                    fixed-header
                    class="style-table"
                >
                    <template v-slot:default>
                        <thead>
                            <tr>
                                <th></th>
                                <th class="text-center primary--text">#</th>
                                <th class="text-center primary--text">CANT</th>
                                <th class="text-left primary--text">DESCRIPCION</th>
                                <th class="text-center primary--text">IMPUESTO</th>
                                <th class="text-right primary--text">%</th>
                                <th class="text-right primary--text">PRECIO U.</th>
                                <th class="text-right primary--text">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="item in newExams"
                                :key="item.id"
                            >
                                <td class="text-center">
                                    <v-btn icon color="secondary" @click="deleteExam(item)">
                                        <v-icon>mdi-delete-outline</v-icon>
                                    </v-btn>
                                </td>
                                <td class="text-center caption">{{ item.exam_id }}</td>
                                <td class="text-center caption">{{ item.amount }}</td>
                                <td class="text-left caption">{{ item.description }}</td>
                                <td class="text-center caption">{{ item.tax_description }}</td>
                                <td class="text-right caption">{{ item.tax_amount }}</td>
                                <td class="text-right caption">{{ item.price }}</td>
                                <td class="text-right caption primary--text">{{ item.total }}</td>
                            </tr>
                        </tbody>
                    </template>
                </v-simple-table>
                <v-card color="sidebarlite" elevation="2">
                    <v-card-text>
                        <v-row>
                            <v-col cols="5">
                                <div class="caption secondary--text">Van {{ newExams.length }}</div>
                                <div class="d-flex align-center">
                                    <v-btn
                                        text
                                        color="primary"
                                        class="px-0 mr-2"
                                        style="min-width: 0;"
                                        @click="newDollar = !newDollar"
                                    >
                                        <v-icon>mdi-loupe</v-icon>
                                    </v-btn>
                                    <div v-if="dollarValue" class="caption secondary--text">Valor del dolar ({{ dollarValue.date }}) $ {{ numberFormat(dollarValue.value) }}</div>
                                </div>
                            </v-col>
                            <v-col cols="7">
                                <div
                                    v-for="(payment, index) in newPatient.foot_payments"
                                    :key="index"                                    
                                >
                                    <div v-if="payment.active" class="d-flex justify-space-between align-center">
                                        <div class="d-flex justify-start align-center" style="width: 260px;">
                                            <div class="caption primary--text" :class="index + 1 === newPatient.foot_payments.length ? 'font-weight-bold' : ''" style="text-align: right">
                                                {{ payment.description }}
                                            </div>
                                            <div v-if="payment.value !== null" class="caption primary--text d-flex justify-start align-center">
                                                <div v-if="payment.input" style="width: 125px">
                                                    <v-text-field
                                                        v-model.number="payment.value"
                                                        type="number"
                                                        outlined
                                                        dense
                                                        hide-details
                                                        class="ml-1 caption white"
                                                        @change="goTotals()"
                                                    />
                                                </div>
                                                <div v-else class="ml-2">
                                                    {{ payment.value }} %
                                                </div>
                                                <div v-if="payment.sobre !== null" class="ml-2">
                                                    sobre {{ payment.sobre }}
                                                </div>
                                            </div>
                                            <div v-else style="width: 125px"></div>
                                        </div>
                                        <div class="caption primary--text" :class="index + 1 === newPatient.foot_payments.length ? 'font-weight-bold' : ''" style="width: 145px; text-align: right">
                                            $ {{ numberFormat(payment.total) }}
                                        </div>
                                        <div class="caption primary--text" :class="index + 1 === newPatient.foot_payments.length ? 'font-weight-bold' : ''" style="width: 145px; text-align: right">
                                            <div v-if="index + 1 === newPatient.foot_payments.length - 1">0,00</div>
                                            <div v-else>
                                                <div v-if="index + 1 === newPatient.foot_payments.length">
                                                    Bs. {{ numberFormat((payment.total - newPatient.foot_payments[newPatient.foot_payments.length - 2].total) * dollarValue.value)  }}
                                                </div>
                                                <div v-else>
                                                    Bs. {{ numberFormat(payment.total * dollarValue.value) }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <new-dollar-dialog 
            v-model="newDollar"
            @set-newdolar="activeNewDollar"
        />
    </div>
</template>

<script>
import examsListMixin from '@/mixins/services/examsListMixin'
import RutinesMixin  from '@/mixins/services/RoutinesMixin'
import functionMixin from '@/mixins/util/functionMixin'
import NewDollarDialog from '@/components/modules/admission/NewDollarDialog.vue'

export default {
    components: { NewDollarDialog },
    name: 'SelectExams',
    mixins: [examsListMixin, RutinesMixin, functionMixin],
    props: {
        newExams: {
            type: Array,
            default: () => [],
        },
        newPatient: {
            type: Object,
            default: () => {},
        },
        tariff: {
            type: Number,
            default: 1,
        },
        dollarValue: {
            type: Object,
            default: () => {},
        },
    },
    data() {
        return {
            groupList: null,
            routinesList: null,
            toggleSearch: 0,
            selectedGroup: 1,
            selectedRoutine: 1,
            searchExam: null,
            itemSelectExam: null,
            selectedExam: null,
            newDollar: false,
            canDolares: true,
            tariffList: [
                {name: 'Tarifa 1', value: 1},
                {name: 'Tarifa 2', value: 2},
                {name: 'Tarifa 3', value: 3},
                {name: 'Tarifa 4', value: 4},
                {name: 'Tarifa 5', value: 5},
                {name: 'Tarifa 6', value: 6},
            ],
            tariffTmp: this.tariff
        }
    },  
    watch: {
        'tariff': {
          handler(value) {
            this.tariffTmp = value
            this.getSelectedTariff()
          }
        },
    },
    async mounted() {
        await this.getGroupList()
        await this.getRoutines()
        this.getSelectedGroup()
        this.newPatient.foot_payments = await this.calculateTotals(this.newPatient.foot_payments, this.canDolares, this.newExams)
    },
    methods: {
        numberFormat(value) {
            value = parseFloat(value)
            let newPreci = value.toFixed(2)
            newPreci = newPreci.replace('.', ',')
            return newPreci
        },
        async getDollar() {
            this.dollarValue = await this.getDollarValue()
            const date = this.dollarValue.date
            this.dollarValue.date = date.split('T')[0]
        },
        async getGroupList() {
            this.groupList = await this.getExamGroupList()
        },
        async getRoutines() {
            this.routinesList = await this.getRoutinesList()
        },
        async getSelectedGroup() {
            this.searchExam = ''
            this.toggleSearch = 0
            this.selectedExam = await this.getExamListByidGroup(this.selectedGroup)
        },
        async getSelectedRoutine(items) {
            const listItems = items.registered_exams
            await this.asyncForEach(listItems, async (item) => {
                const newExa = await this.getExamById(item.examId)
                this.activeExamSelection(newExa)
            })
        },
        async getSearchExam() {
            if (this.searchExam !== '') {
                this.selectedExam = await this.getExamListByDescription(this.searchExam)
            } else {
                this.toggleSearch = 0
                this.getSelectedGroup()
            }
        },
        activeNewDollar(dollar) {
            this.newDollar = false
            this.$emit('new-dollar', dollar)
        },        
        async asyncForEach(array, callback) {
            for (let index = 0; index < array.length; index++) {
                await callback(array[index], index, array);
            }
        },        
        // changeDollares() {
        //     this.goTotals()
        // },
        async activeExamSelection(item) {
            const found = await this.newExams.find(itemE => itemE.examlistsId === item.id)
            if (found === undefined) {
                const result = await this.getExamTaxById(item.tax_id)
                let newPreci = item.cost1
                if (this.tariff === 2) newPreci = item.cost2
                if (this.tariff === 3) newPreci = item.cost3
                if (this.tariff === 4) newPreci = item.cost4
                if (this.tariff === 5) newPreci = item.cost5
                if (this.tariff === 6) newPreci = item.cost6
                newPreci = parseFloat(newPreci)
                const taxAmount = parseFloat(result.value)
                const taxTotal = Math.round(newPreci * taxAmount / 100)
                newPreci = newPreci.toFixed(2)
                newPreci = newPreci.replace('.', ',')
                const enterExam = {
                    patientsId: -1,
                    examlistsId: item.id,
                    group_id: item.group_id,
                    position: item.position,
                    description: item.description,
                    amount: 1,
                    price: newPreci,
                    total: newPreci,
                    tax_description: result.description,
                    tax_amount: taxAmount.toFixed(2).replace('.', ','),
                    tax_total: Math.round(taxTotal).toFixed(2).replace('.', ','),
                }
                await this.newExams.push(enterExam)
            } else {
                found.amount += 1
                const amount = parseFloat(found.amount.toString().replace(',', '.'))
                const total = parseFloat(found.total.toString().replace(',', '.'))
                const taxAmount = parseFloat(found.tax_amount.toString().replace(',', '.'))
                const taxTotal = Math.round((amount * total) * taxAmount / 100).toFixed(2).replace('.', ',')
                const newPreci = (amount * total).toFixed(2).toString().replace('.', ',')
                found.total = newPreci
                found.tax_total = taxTotal
            }
            var wayPayDl = -1
            this.newPatient.foot_payments = await this.calculateTotals(this.newPatient.foot_payments, this.canDolares, this.newExams, wayPayDl)
            this.calculateDollars()            
        },        
        async calculateDollars() {
            const totPayment = (this.newPatient.foot_payments[this.newPatient.foot_payments.length - 1].total - this.newPatient.foot_payments[this.newPatient.foot_payments.length - 2].total)
            this.newPatient.total = totPayment * this.dollarValue.value
            this.newPatient.dollar_price_date = this.dollarValue.date
            this.newPatient.total_dollars = Math.round(totPayment)
            this.$emit("clear_way_pay")            
        },               
        async deleteExam(item) {
            const index = this.newExams.indexOf(item)
            this.newExams.splice(index, 1)
            var wayPayDl = -1
            this.newPatient.foot_payments = await this.calculateTotals(this.newPatient.foot_payments, this.canDolares, this.newExams,wayPayDl)
            this.calculateDollars()
        },
        async goTotals() {
            var wayPayDl = -1
            this.newPatient.foot_payments = await this.calculateTotals(this.newPatient.foot_payments, this.canDolares, this.newExams, wayPayDl)
            this.calculateDollars()
        },
        async asyncForEach(array, callback) {
            for (let index = 0; index < array.length; index++) {
                await callback(array[index], index, array);
            }
        },
        async getSelectedTariff() {
            this.$emit('change_tariff', this.tariffTmp)
            console.log('this.newExams: ', this.selectedExam)
            const listExa = JSON.parse(JSON.stringify(this.newExams))
            await this.$emit('delete_exams')
            await this.asyncForEach(listExa, async (item) => {
                const id = item.examlistsId
                const exam = this.selectedExam.find(examItem => examItem.id === id);
                this.activeExamSelection(exam)
            })
        },
    },
}
</script>
<style scoped>
.window-height {
    height: calc(100vh - 290px);
    overflow: hidden;
}
.style-table {
    height: calc(100vh - 510px);
    max-height: calc(100vh - 510px);
    overflow-y: auto;
}
</style>
