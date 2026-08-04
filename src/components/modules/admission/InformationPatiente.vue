<template>
  <div class="ma-6">
    <v-card elevation="2">
        <v-card-text>
            <v-row>
                <v-col cols="12" sm="6">
                    <v-text-field
                        v-model="newPatient.name"
                        label="Nombre y apellidos del pacinte"
                        placeholder="Nombre y apellidos"
                        outlined
                        :rules="rulesBlank"
                        :counter="100"
                        maxlength="100"
                        dense
                        class="mb-1"
                    />
                    <div class="d-flex mb-1">
                        <v-select
                            v-model="newPatient.verification_code"
                            :items="verificationList"
                            placeholder="V o E"
                            outlined
                            dense
                            class="verification-code"
                        />
                        <v-text-field
                            v-model="newPatient.document_number"
                            v-mask="currencyMask"
                            label="Documento de identidad"
                            placeholder="Documento de identidad"
                            outlined
                            dense
                            class="document-number"
                        />
                        <v-btn depressed color="primary" style="height: 40px" @click="searchCI()">
                            <v-icon>mdi-magnify</v-icon>
                        </v-btn>
                    </div>
                    <v-row>
                        <v-col cols="12" sm="4">
                            <v-menu
                                ref="menu"
                                v-model="menu"
                                :close-on-content-click="false"
                                transition="scale-transition"
                                offset-y
                                min-width="auto"
                            >
                                <template v-slot:activator="{ on, attrs }">
                                    <v-text-field
                                        v-model="newPatient.birth_date"
                                        outlined
                                        dense
                                        label="Fecha nacimiento"
                                        append-icon="mdi-calendar"
                                        readonly
                                        v-bind="attrs"
                                        v-on="on"
                                    />
                                </template>
                                <v-date-picker
                                    v-model="newPatient.birth_date"
                                    locale="es"
                                    min="1890-01-01"
                                    :max="currentYear"
                                    no-title
                                    @change="changeDate()"
                                />
                            </v-menu>
                        </v-col>
                        <v-col cols="12" sm="4">
                            <div class="d-flex">
                                <v-text-field
                                    v-model.number="newPatient.age"
                                    type="number"
                                    min="1"
                                    label="Edad"
                                    placeholder="Documento de identidad"
                                    outlined
                                    dense
                                />
                                <v-menu offset-y>
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-btn
                                            color="primary"
                                            v-bind="attrs"
                                            v-on="on"
                                            style="height: 40px"
                                        >
                                            {{ newPatient.month_year }}
                                        </v-btn>
                                    </template>
                                    <v-list v-model="newPatient.month_year">
                                        <v-list-item
                                        v-for="(item, index) in itemsAge"
                                        :key="index"
                                        @change="changeAge(item.value)"
                                        >
                                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                                        </v-list-item>
                                    </v-list>
                                </v-menu>
                            </div>
                        </v-col>
                        <v-col cols="12" sm="4">
                            <v-select
                                v-model="newPatient.sex"
                                :items="itemsSex"
                                item-text="title"
                                item-value="value"
                                label="Sexo"
                                dense
                                outlined
                            />
                        </v-col>
                    </v-row>
                    <v-row class="mt-0">
                        <v-col cols="12" sm="4">
                            <v-text-field
                                v-if="laboratory"
                                v-model="newPatient.phone"
                                v-mask="maskPhone"
                                label="Teléfono"
                                placeholder="Escriba"
                                outlined
                                dense
                            />
                        </v-col>
                    </v-row>
                    <v-row class="mt-0">
                        <v-col cols="12" sm="6">
                            <v-select
                                v-model="newPatient.sample"
                                :items="itemsSample"
                                label="Muestra"
                                dense
                                outlined
                            />
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-select
                                v-if="itemsSampleType"
                                v-model="newPatient.sample_type"
                                :items="itemsSampleType"
                                item-text="description"
                                item-value="description"
                                label="Tipo de muestra"
                                dense
                                outlined
                            />
                        </v-col>
                    </v-row>
                    <v-textarea
                        v-model="newPatient.address"
                        outlined
                        rows="4"
                        :rules="rulesAndress"
                        :counter="250"
                        maxlength="250"
                        label="Domicilio"
                        placeholder="No dejar en blanco"
                    />
                </v-col>
                <v-col cols="12" sm="6">
                    <v-checkbox
                        v-model="newPatient.email_sent"
                        label="Enviar resultados por Email"
                        maxlength="100"
                        class="mt-0 pt-0"
                    />
                    <v-text-field
                        v-if="newPatient.email_sent"
                        :disabled="!newPatient.email_sent"
                        v-model="newPatient.email"
                        placeholder="Escriba"
                        :rules="rulesEmail"
                        :counter = 100
                        maxlength="100"
                        outlined
                        dense
                    />
                    <v-text-field
                        v-model="newPatient.suggested"
                        label="Sugerido por"
                        placeholder="Escriba..."
                        outlined
                        :counter = 60
                        maxlength="60"
                        dense
                        class="mt-1"
                        :class="!newPatient.email_sent ? 'mt-10': ''"
                    />
                    <v-select
                        v-if="itemsClient"
                        v-model="newPatient.client_id"
                        :items="itemsClient"
                        item-text="business_name"
                        item-value="id"
                        label="Referido por"
                        dense
                        outlined
                        @change="verifyTariff()"
                    />
                    <v-textarea
                        v-model="newPatient.observation"
                        outlined
                        rows="4"
                        :rules="rulesObservation"
                        :counter="100"
                        maxlength="100"
                        label="Observación"
                    />
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
  </div>
</template>

<script>
import laboratorioMixin from '@/mixins/services/laboratoryMixin'
import pacientsMixin from '@/mixins/services/pacientsMixin'
import createNumberMask from 'text-mask-addons/dist/createNumberMask'
export default {
    name: 'InformationPatiente',
    mixins: [laboratorioMixin, pacientsMixin],
    props: {
        newPatient: {
            type: Object,
            default: () => {},
        },
        register: {
            type: Object,
            default: () => {},
        },
    },
    data() {
        return {
            menu: false,
            currentYear: '',
            itemsAge: [
                { title: 'Año(s)', value: 'Años' },
                { title: 'Mes(es)', value: 'Meses' },
                { title: 'Día(s)', value: 'Días' },
            ],
            itemsSex: [
                {title: 'Femenino', value: 0},
                {title: 'Masculino', value: 1}
            ],
            itemsSample: ['Tomada aquí', 'Referida'],
            itemsSampleType: null,
            maskPhone: '+58 #### ### ####',
            verificationList: ['', 'V', 'E'],
            laboratory: null,
            itemsClient: null,
            rulesObservation: [v => v.length <= 100 || 'Máximo 100 caracteres'],
            rulesBlank: [
                v => !!v || 'Nombre es requerido',
                v => (v && v.length <= 100) || 'El nombre debe tener menos de 100 caracteres',
            ],
            rulesEmail: [
                v => !!v || 'E-mail es requerido',
                v => /^(([^<>()[\]\\.,;:\s@']+(\.[^<>()\\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v) || 'El email debe ser válido',
            ],
            rulesAndress: [
                v => v.length <= 250 || 'Máximo 250 caracteres',
                v => !!v || 'Este campo es obligatorio',
            ],
            currencyMask: createNumberMask({
                prefix: "",
                includeThousandsSeparator: true,
                allowNegative: false,
                thousandsSeparatorSymbol: ".",
                allowDecimal: false,
            }),
            tariff: 1,
        }
    },
    mounted() {
        this.getLaboratoryData()
        this.getCurrentYear()
    },
    methods: {
        getCurrentYear() {
            const fecha = new Date()
            const año = fecha.getFullYear()
            const mes = fecha.getMonth() + 1
            const dia = fecha.getDate()
            this.currentYear = `${año}-${mes < 10 ? '0' + mes : mes}-${dia < 10 ? '0' + dia : dia}`
        },
        async getLaboratoryData() {
            this.laboratory = await this.getUniqueLabData(1)
            if (this.laboratory !== null) {
                this.maskPhone = this.laboratory.mask_phone
            }
            this.itemsSampleType = await this.getSampleTypeData()
            this.itemsClient = await this.getClientData()
        },
        changeAge(type) {
            this.newPatient.month_year = type
        },
        async searchCI() {
            const ci = this.newPatient.document_number
            const newPatR = await this.getPatientForCi(ci)
            if (newPatR) {
                let date = newPatR.birth_date.split('T')[0]
                date = new Date(Date.parse(date))
                const dateT = (new Date(date - (date).getTimezoneOffset() * 60000)).toISOString().substr(0, 10)
                const start = date
                const end = new Date();
                const difference = this.calculateDateDifference(start, end)
                if (difference.years > 0) {
                    this.newPatient.age = difference.years
                    this.changeAge('Años')
                } else if (difference.months > 0) {
                    this.newPatient.age = difference.months
                    this.changeAge('Meses')
                } else if (difference.days > 0) {
                    this.newPatient.age = difference.days
                    this.changeAge('Días')
                } else {
                    this.newPatient.age = 0
                    this.changeAge('Días')
                }
                
                this.newPatient.name = newPatR.name
                this.newPatient.verification_code = newPatR.verification_code
                this.newPatient.birth_date = dateT
                this.newPatient.sex = newPatR.sex
                this.newPatient.phone = newPatR.phone
                this.newPatient.address = newPatR.address
                if (newPatR.email.length !== 0) {
                    this.newPatient.email_sent = true
                    this.newPatient.email = newPatR.email
                } else {
                    this.newPatient.email_sent = false
                    this.newPatient.email = ''
                }
            }
        },
        changeDate() {
            let date = new Date(Date.parse(this.newPatient.birth_date))
            const dateT = (new Date(date - (date).getTimezoneOffset() * 60000)).toISOString().substr(0, 10)
            const start = date
            const end = new Date();
            const difference = this.calculateDateDifference(start, end)
            if (difference.years > 0) {
                this.newPatient.age = difference.years
                this.changeAge('Años')
            } else if (difference.months > 0) {
                this.newPatient.age = difference.months
                this.changeAge('Meses')
            } else if (difference.days > 0) {
                this.newPatient.age = difference.days
                this.changeAge('Días')
            } else {
                this.newPatient.age = 0
                this.changeAge('Días')
            }
        },
        calculateDateDifference(startDate, endDate) {
            const diffTime = Math.abs(endDate - startDate)
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            const years = Math.floor(diffDays / 365)
            const months = Math.floor((diffDays % 365) / 30)
            const days = Math.floor((diffDays % 365) % 30)
            return { years, months, days }
        },
        async verifyTariff() {
            let newTariff = 1
            let printInvoice = this.register.printInvoice
            this.newPatient.business_name = 'Ambulatorio'
            if (this.newPatient.client_id !== 1) {
                const client = await this.getClient(this.newPatient.client_id)
                newTariff = client.tariff
                printInvoice = client.Print_invoice === 1 ? true : false
                // printReceipt = client.print_receipt === 1 ? true : false
                this.newPatient.business_name = client.business_name
            }
            this.$emit('change_tariff', newTariff)
            this.$emit('Print_invoice', printInvoice)
        },
    },
}
</script>
<style scoped>
.document-number {
    width: 200px;
}
.verification-code {
    width: 80px;
    max-width: 80px;
    text-transform: uppercase;
}
</style>