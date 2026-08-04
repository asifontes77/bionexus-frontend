<template>
  <v-dialog v-model="dialogStart" width="550">
    <v-card>
      <v-card-title class="text-h5 grey lighten-2 d-flex justify-space-between">
        <div>{{ title }}</div>
      </v-card-title>
      <v-card-text align="center" class="mt-10">
        <v-icon x-large color="warning" class="pb-5"> mdi-alert-circle </v-icon>
        <div class="font-weight-bold">
          {{ description }}
        </div>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn
          large
          color="primary"
          depressed
          class="ml-5"
          @click="$emit('btn-active-action')"
        >
          aceptar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
  export default {
    name: 'startDialog',
    model: {
      prop: 'dialogStart',
      event: 'change-model',
    },
    props: {
      dialogStart: {
        type: Boolean,
        default: false,
      },
      title: {
        type: String,
        default: '',
      },
      description: {
        type: String,
        default: '',
      },
    },
  }
</script>