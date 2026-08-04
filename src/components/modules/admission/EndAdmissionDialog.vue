<template>
  <v-dialog
        v-model="show"
        transition="dialog-top-transition"
        persistent
        max-width="500"
    >
    <v-card>
        <v-card-title class="text-h5 sidebarlite primary--text">
          Culminación ingreso de paciente
        </v-card-title>
        <v-card-text class="mt-10">
            El paciente {{ newPatient }}, fué registrado satisfactoriamente
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="$emit('cerrar_ingreso')"
          >
            Aceptar
          </v-btn>
        </v-card-actions>
    </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: 'EndAdmissionDialog',
    model: {
        prop: 'show',
        event: 'change-model',
    },
    props: {
        show: {
            type: Boolean,
            default: false,
        },
        newPatient: {
            type: String,
            default: '',
        },
    },
}
</script>
