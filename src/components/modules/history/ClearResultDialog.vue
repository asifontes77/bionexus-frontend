<template>
    <v-dialog
        v-model="show"
        transition="dialog-top-transition"
        persistent
        max-width="500"
    >
        <v-card>
            <v-card-title class="text-h5 sidebarlite primary--text">
                Limpiar resultados
            </v-card-title>
            <v-card-text class="mt-10">
                ¿Desea limpiar los resultados del examen {{ examen }}?
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="primary"
                    text
                    @click="$emit('limpiar_examen')"
                >
                    Si Limpiar
                </v-btn>
                <v-btn
                    color="gray300"
                    text
                    @click="$emit('change-model',false)"
                >
                    Cancelar
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: 'ClearResultDialog',
    model: {
        prop: 'show',
        event: 'change-model',
    },
    props: {
        show: {
            type: Boolean,
            default: false,
        },
        examen: {
            type: String,
            default: '',
        },
    },
}
</script>
