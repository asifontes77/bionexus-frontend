<template>
  <v-dialog
    v-model="show"
    transition="dialog-top-transition"
    persistent
    max-width="800"
  >
    <v-card>
      <v-card-title class="text-h5 sidebarlite primary--text">
        Facturar
      </v-card-title>
      <v-card-text v-if="newPatient" class="mt-6">
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
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="secondary"
          text
          @click="$emit('change-model',false)"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          text
          @click="imprimir()"
        >
          Imprimir
        </v-btn>
      </v-card-actions>
    </v-card>
    <print-invoice v-if="activePrint" :new-patient="newPatient" :can-dolares="canDolares" @close-print="closePrint()" />
  </v-dialog>
</template>
<script>
import PrintInvoice from '@/components/modules/admission/PrintInvoice.vue'
export default {
  name: 'InvoiceDialog',
  components: { PrintInvoice },
  model: {
    prop: 'show',
    event: 'change-model',
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    selectedPatient: {
      type: Object,
      default: () => ({})
    },
  },
  data() {
    return {
      newPatient: null,
      activePrint: false,
      rulesBlank: [v => !!v || 'Este campo es obligatorio'],
      rulesAndress: [
          v => v.length <= 250 || 'Máximo 250 caracteres',
          v => !!v || 'Este campo es obligatorio',
      ],
      canDolares: false,
    }
  },
  mounted() {
    this.newPatient = this.selectedPatient
  },
  methods: {
    imprimir() {
      if (this.selectedPatient.total_dollars > 0) this.canDolares = true
      this.activePrint = true
    },
    closePrint() {
      this.activePrint = false
      this.$emit('close-invoice', this.selectedPatient.id)
    },
  },
}
</script>