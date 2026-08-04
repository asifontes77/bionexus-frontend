<template>
  <div v-if="dataLaboratory" style="width: 100%">
    <v-row>
        <v-col cols="12" sm="6">
            <div class="font-weight-medium primary--text pl-1">
                Modelo de Factura
            </div>
            <v-card outlined>
                <div v-html="dataLaboratory.voucher_format" class="pa-2"></div>
            </v-card>
            <div class="font-weight-medium primary--text pl-1 mt-2">
                Modelo de Comprobante
            </div>
            <v-card outlined>
                <div v-html="receiptModel" class="pa-2"></div>
            </v-card>
        </v-col>
        <v-col cols="12" sm="6">
            <div class="font-weight-medium primary--text pl-1">
                Configuración factura
            </div>
            <v-card outlined>
                <v-card-text>
                    <v-row>
                        <v-col cols="12" sm="6">
                            <v-switch
                                v-model="dataLaboratory.print_invoice"
                                color="primary"
                                label="Imprimir factura al ingreso de paciente"
                                hide-details
                                class="mt-1"
                            />
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field
                                v-model.number="dataLaboratory.invoice_number"
                                label="Número correlativo de factura"
                                placeholder="Escriba número correlativo de factura"
                                outlined
                                dense
                                type="number"
                                min="0"
                                @blur="change('nInvoice')"
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" sm="6">
                            <v-text-field
                                v-model.number="dataLaboratory.rows_description_invoices"
                                label="Número máximo de filas en la descripción"
                                placeholder="Escriba cantidad de filas"
                                outlined
                                dense
                                type="number"
                                min="5"
                                max="15"
                                append-icon="mdi-receipt-text-outline"
                                @blur="change('nDescrip')"
                            />
                        </v-col>
                        <v-col cols="12" sm="6">
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
            <div class="font-weight-medium primary--text pl-1 mt-4">
                Configuración comprobante
            </div>
            <v-card outlined>
                <v-card-text>
                    <v-row>
                        <v-col cols="12" sm="6">
                            <v-switch
                                v-model="dataLaboratory.print_receipt"
                                color="primary"
                                label="Imprimir comprobante al ingreso de paciente"
                                hide-details
                                class="mt-1"
                            />
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field
                                v-model.number="dataLaboratory.receipt_number"
                                label="Número correlativo de comprobante"
                                placeholder="Escriba número correlativo de comprobante"
                                outlined
                                dense
                                type="number"
                                min="0"
                                @blur="change('nInvoice')"
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" sm="6">
                            <v-text-field
                                v-model.number="dataLaboratory.rows_description_receipt"
                                label="Número máximo de filas en la descripción"
                                placeholder="Escriba cantidad de filas"
                                outlined
                                dense
                                type="number"
                                min="5"
                                max="15"
                                append-icon="mdi-receipt-text-outline"
                                @blur="change('nDescrip')"
                            />
                        </v-col>
                        <v-col cols="12" sm="6">
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
            <div class="font-weight-medium primary--text pl-1 mt-4">
                Configuración toma muestra
            </div>
            <v-card outlined>
                <v-card-text>
                    <v-row>
                        <v-col cols="12" sm="6">
                            <v-switch
                                v-model="dataLaboratory.print_sample_take"
                                color="primary"
                                label="Imprimir toma de muestra al ingreso de paciente"
                                hide-details
                                class="mt-0"
                            />
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field
                                v-model.number="dataLaboratory.voucher_number"
                                label="Número correlativo de toma de muestra"
                                placeholder="Escriba número correlativo de toma de muestra"
                                outlined
                                dense
                                type="number"
                                min="0"
                                @blur="change('nVoucher')"
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" sm="6">
                            <v-text-field
                                v-model.number="dataLaboratory.printer_type"
                                label="Impresora Tiquera"
                                placeholder="Escriba el nombre"
                                outlined
                                dense
                            />
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field
                                v-model.number="dataLaboratory.printer_interface"
                                label="Localización en la red"
                                placeholder="Escriba..."
                                hint="Ej. //localhost/pos-80 o //192.168.1.15/nombre impresora"
                                persistent-hint
                                outlined
                                dense
                            />
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
            
            <div class="font-weight-medium primary--text pl-1 mt-4">
                Configuración de impuestos
            </div>
            <v-card outlined>
                <v-card-text>
                    <v-row>
                        <v-col cols="4" class=" pb-0"><div class="caption">Descripción</div></v-col>
                        <v-col cols="3" class=" pb-0"><div class="caption">Valor</div></v-col>
                        <v-col cols="2" class="pb-0 d-flex justify-center">
                            <div class="caption">Solo en dolares</div>
                        </v-col>
                        <v-col cols="2" class="pb-0 d-flex justify-center">
                            <div class="caption">Fijo en Sub-total</div>
                        </v-col>
                        <v-col cols="1" class="pb-0 d-flex justify-center">
                            <div class="caption">Ocultar</div>
                        </v-col>
                    </v-row>
                    <v-row v-for="(itemTax, index) in dataTax" :key="index">
                        <v-col cols="4">
                            <v-text-field
                                v-model="itemTax.description"
                                placeholder="Escriba..."
                                outlined
                                hide-details
                                dense
                            />
                        </v-col>
                        <v-col cols="3">
                            <v-text-field
                                v-model="itemTax.value"
                                v-mask="currencyMask"
                                placeholder="Escriba..."
                                outlined
                                hide-details
                                suffix="%"
                                dense
                            />
                        </v-col>
                        <v-col cols="2" class="d-flex justify-center">
                            <v-switch
                                v-model="itemTax.only_dollars"
                                hide-details
                                class="mt-0"
                            />
                        </v-col>
                        <v-col cols="2" class="d-flex justify-center">
                            <v-switch
                                v-model="itemTax.always_subtotal"
                                hide-details
                                class="mt-0"
                            />
                        </v-col>
                        <v-col cols="1" class="d-flex justify-center">
                            <v-switch
                                v-model="itemTax.hide"
                                hide-details
                                class="mt-0"
                            />
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-text>
                    <div class="d-flex justify-end" style="width: 100%;">
                        <v-menu offset-y>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    text
                                    color="secondary"
                                    v-bind="attrs"
                                    v-on="on"
                                >
                                    eliminar impuesto
                                </v-btn>
                            </template>
                            <v-list>
                                <v-list-item
                                    v-for="(item, index) in dataTax"
                                    :key="index"
                                    @click="$emit('delete-tax', item.id, index)"
                                >
                                <v-list-item-title>{{ item.description }}</v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                        <v-btn
                            text
                            color="primary"
                            @click="$emit('add-tax')"
                        >
                            Agregar impuesto
                        </v-btn>
                    </div>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
  </div>
</template>

<script>
import createNumberMask from 'text-mask-addons/dist/createNumberMask'
import laboratoryMixin from '@/mixins/services/laboratoryMixin'
import { basePath } from '@/config';

export default {
    name: 'BillingLaboratory',
    mixins: [laboratoryMixin],
    props: {
        dataLaboratory: {
            type: Object,
            default: () => ({})
        },
        dataTax: {
            type: Array,
            default: () => [],
        },
        valid: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            basePath,
            currencyMask: createNumberMask({
                prefix: "",
                includeThousandsSeparator: false,
                allowNegative: false,
                allowDecimal: true,
                decimalLimit: 2,
            }),
            receiptModel: '',
        }
    },
    mounted() {
        let receipt = this.dataLaboratory.receipt_format
        receipt = receipt.replace('[business_name]', this.dataLaboratory.business_name)
        receipt = receipt.replace('[rif_lab]', this.dataLaboratory.rif)
        receipt = receipt.replace('[address_lab]', this.dataLaboratory.address)
        receipt = receipt.replace('[phone_1]', this.dataLaboratory.phone_1)
        receipt = receipt.replace('[phone_2]', this.dataLaboratory.phone_2)
        receipt = receipt.replace('[email]', this.dataLaboratory.email)
        receipt = receipt.replace('[src_image]', `${this.basePath}/images/${this.dataLaboratory.logo}` )
        this.receiptModel = receipt
    },
    methods: {
        change(type) {
            if (type === 'nDescrip') {
                if(this.dataLaboratory.rows_description_invoices === '') {
                    this.dataLaboratory.rows_description_invoices = 5
                }
            } else if (type === 'nInvoice') {
                if(dataLaboratory.invoice_number === '') {
                    this.dataLaboratory.invoice_number = 0
                }
            } else if (type === 'nVoucher') {
                if(dataLaboratory.voucher_number === '') {
                    this.dataLaboratory.voucher_number = 0
                }
            }
        },
    },
}
</script>
