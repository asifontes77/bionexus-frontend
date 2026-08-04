<template>
  <div class="ma-6">
    <v-card elevation="2" class="pb-2">
        <v-card-text>
            <v-row>
                <v-col cols="12" sm="4">
                    <v-radio-group v-model="radioGroup" :disabled="newPatient.client_id!==1">
                        <v-radio 
                            label="Facturar"
                            value="0"
                        />
                        <v-radio 
                            label="Comprobante"
                            value="1"
                        />
                    </v-radio-group>
                    <v-checkbox
                        v-model="register.printVoucher"
                        :disabled="!register.printerInterface"
                        label="Imprimir Toma de muestra"
                        hide-details
                    />
                    <div class="mt-6">
                        Al dar clic en el botón indicado como <span class="font-weight-bold">"Registrar"</span> se procederá a validar los datos suministrados, 
                        si encuentra algún detalle le indicará, de lo contrario, registra el paciente e imprime los formatos 
                        seleccionados en las casillas de verificación.
                    </div>
                    <div class="mt-6 font-weight-bold font-italic">Recuerde seleccionar las impresoras para cada caso.</div>
                </v-col>
                <v-col cols="12" sm="8">
                    <v-checkbox
                        v-model="activePatient"
                        label="Razón social igual al paciente"
                        hide-details
                        class="mb-1"
                        @click="changePatient()"
                    />
                    <v-text-field
                        v-model="newPatient.business_name"
                        label="Razón Social"
                        placeholder="No dejar en blanco"
                        outlined
                        dense
                        :counter="100"
                        maxlength="100"
                        :rules="rulesBlank"
                    />
                    <v-text-field
                        v-model="newPatient.rif"
                        label="Documento de Identidad"
                        placeholder="No dejar en blanco"
                        outlined
                        dense
                        :counter="20"
                        maxlength="20"
                        :rules="rulesBlank"
                    />
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
            </v-row>
        </v-card-text>
    </v-card>
    
  </div>
</template>

<script>
import laboratorioMixin from '@/mixins/services/laboratoryMixin'
import pacientsMixin from '@/mixins/services/pacientsMixin'

export default {
    name: 'RegisterPatient',
    mixins: [laboratorioMixin, pacientsMixin],
    props: {
        register: {
            type: Object,
            default: () => {},
        },
        newPatient: {
        type: Object,
            default: () => {},
        },
    },
    data() {
        return {
            rulesBlank: [v => !!v || 'Este campo es obligatorio'],
            rulesAndress: [
                v => v.length <= 250 || 'Máximo 250 caracteres',
                v => !!v || 'Este campo es obligatorio',
            ],
            oculto: true,
            disabledPrint: false,
            activePatient: false,
            radioGroup: '1',
        }
    },
    watch: {
        'newPatient.client_id': {
          handler() {
            this.changeClient()
          }
        },
        'radioGroup': {
            handler(value) {
                console.log('value: ', value)
                this.register.printInvoice = false
                this.register.printReceipt = false
                if (value === '0') this.register.printInvoice = true
                if (value === '1') this.register.printReceipt = true
                console.log('this.register.printInvoice: ', this.register.printInvoice)
                console.log('this.register.printReceipt: ', this.register.printReceipt)
            }
        },
    },
    mounted() {        
        this.changeClient()
        if (this.register.printInvoice) this.radioGroup = 0
        if (this.radioGroup === 1) this.register.printReceipt = true
    },
    methods: {
        async changeClient() {
            if (this.newPatient.client_id !== 1) {
                const result = await this.getClient(this.newPatient.client_id) 
                if (result) {
                    if (!result.Print_invoice) {
                        this.register.printInvoice = false
                    } else {
                        if (result.id === 1) {
                            this.newPatient.business_name = ''
                            this.newPatient.rif = ''
                            this.newPatient.address = ''
                            if (this.activePatient) {
                                this.newPatient.business_name = this.newPatient.name
                                this.newPatient.rif = this.newPatient.document_number
                            }
                        } else {
                            this.activePatient = false
                            this.newPatient.business_name = result.business_name
                            this.newPatient.rif = result.rif
                            this.newPatient.address = result.address
                        }
                    }
                }
            }
        },
        async changePatient() {
            if (this.activePatient) {  
                const ci = this.newPatient.document_number
                const newPatR = await this.getPatientForCi(ci)
                if (newPatR) {
                    this.newPatient.address = newPatR.address
                }
                this.newPatient.business_name = this.newPatient.name
                this.newPatient.rif = this.newPatient.verification_code + '-' + this.newPatient.document_number.replace(/\./g, '')
            } else {
                this.newPatient.business_name = ''
                this.newPatient.rif = ''
                this.newPatient.address = ''
            }
        },
    },
}
</script>
