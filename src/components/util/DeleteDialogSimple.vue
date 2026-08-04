<template>
    <v-dialog v-model="dialogDelete" width="550">
      <v-card>
        <v-card-title class="text-h5 lighten-2 d-flex justify-space-between">
          <div>{{ title }}</div>
          <v-btn
            color="grey"
            plain
            style="font-size: 1rem"
            @click="$emit('change-model', false)"
          >
            <v-icon color="grey">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text align="center">
          <v-icon x-large color="warning" class="pb-5"> mdi-alert-circle </v-icon>
          <div class="mt-4">¿Está seguro de eliminar</div>
          <div class="font-weight-bold"> {{ elementToDelete }} ?</div>
        </v-card-text>
        <v-card-actions class="justify-center pb-10">
          <v-btn
            large
            outlined
            color="primary"
            @click="$emit('change-model', false)"
          >
            CANCELAR
          </v-btn>
          <v-btn
            large
            color="primary"
            depressed
            class="ml-5"
            @click="$emit('btn-active-action')"
          >
            SI ELIMINAR
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  <script>
  export default {
    name: 'DeleteDialogSimple',
    model: {
      prop: 'dialogDelete',
      event: 'change-model',
    },
    props: {
      dialogDelete: {
        type: Boolean,
        default: false,
      },
      title: {
        type: String,
        default: '',
      },
      elementToDelete: {
        type: String,
        default: '',
      },
    },
  }
  </script>
