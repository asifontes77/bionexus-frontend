<template>
    <v-dialog
        v-model="show"
        transition="dialog-top-transition"
        persistent
        max-width="600"
    >
        <v-card>
            <v-card-title class="text-h5 grey lighten-2">
                Nuevo valor del Dolar
            </v-card-title>
            <v-card-text class="mt-10">
                <v-text-field
                    v-model="newDolar"
                    v-mask="currencyMask"
                    label="Valor del dolar"
                    placeholder="Coloque el valor del dolar"
                    outlined
                    dense
                />
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <div>
                    <v-btn
                        color="gray300"
                        text
                        @click="$emit('change-model',false)"
                    >
                        Cancelar
                    </v-btn>
                    <v-btn
                        color="primary"
                        text
                        :disabled="newDolar===''"
                        @click="$emit('set-newdolar', newDolar)"
                    >
                        Aceptar
                    </v-btn>
                </div>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import createNumberMask from 'text-mask-addons/dist/createNumberMask'

export default {
    name: 'NewDollarDialog',
    model: {
        prop: 'show',
        event: 'change-model',
    },
    props: {
        show: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            newDolar: '',            
            currencyMask: createNumberMask({
                prefix: "",
                includeThousandsSeparator: true,
                allowNegative: false,
                thousandsSeparatorSymbol: ".",
                decimalSymbol: ',',
                allowDecimal: true,
            }),
        }
    },
}
</script>
