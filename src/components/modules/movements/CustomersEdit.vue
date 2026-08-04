<template>
  <div>
    <v-row>
      <v-col cols="12" sm="8">
        <v-card
          elevation="2"
          color="sidebarlite"
          class="mt-4"
        >
          <v-card-title class="justify-space-between">
            {{ itemEdit.business_name }}
            <v-icon color="primary">mdi-pencil</v-icon>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="white">
            <v-form
              ref="form"
              v-model="valid"
              lazy-validation
            >
              <v-text-field
                v-model="itemEdit.business_name"
                dense
                outlined
                :rules="nameRules"
                label="Razón social"
                placeholder="Escriba"
                :counter="100"
                maxlength="100"
                required
              />
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model="itemEdit.rif"
                    dense
                    outlined
                    :rules="rifRules"
                    label="RIF"
                    placeholder="Escriba"
                    :counter="20"
                    maxlength="20"
                    required
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="itemEdit.person_charge"
                    dense
                    outlined
                    :rules="personRules"
                    label="Persona a cargo"
                    placeholder="Escriba"
                    :counter="60"
                    maxlength="60"
                    required
                  />
                </v-col>
              </v-row>
              <v-textarea
                  v-model="itemEdit.address"
                  outlined
                  rows="3"
                  :rules="rulesObservation"
                  :counter="200"
                  maxlength="200"
                  label="Dirección"
                  required
              />
              <v-row>
                <v-col cols="4">
                  <v-text-field
                    v-model="itemEdit.phone"
                    v-mask="maskPhone"
                    label="Teléfono"
                    placeholder="Escriba"
                    maxlength="20"
                    outlined
                    dense
                  />
                </v-col>
                <v-col cols="4">
                  <v-text-field
                    v-model="itemEdit.discount"
                    v-mask="currencyMask"
                    label="Descuento"
                    outlined
                    dense
                  />
                </v-col>
                <v-col cols="4">
                  <v-select
                    v-model="itemEdit.tariff"
                    :items="itemsTariff"
                    label="Tarifa"
                    dense
                    outlined
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="4" class="d-flex align-center">
                  <v-switch
                    v-model="switch1"
                    label="Cobrar en"
                    hide-details
                    class="mt-0"
                  />
                  <v-icon right>mdi-currency-usd</v-icon>
                  
                </v-col>
                <v-col cols="8" class="d-flex align-center">
                  <v-switch
                    v-model="switch2"
                    label="Imprimir factura al ingreso de paciente"
                    hide-details
                    class="mt-0"
                  />
                  <v-icon right>mdi-printer-outline</v-icon>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="4" class="d-flex align-center">
                  <v-switch
                    v-model="switch3"
                    label="Ocultar cliente"
                    hide-details
                    class="mt-0"
                  />
                  <v-icon right>mdi-delete-outline</v-icon>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="$emit('close-model')">Cancelar</v-btn>
            <v-btn text :disabled="!valid" color="primary" @click="acceptEdit()">Aceptar</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
<script>
  import createNumberMask from 'text-mask-addons/dist/createNumberMask'
  import laboratorioMixin from '@/mixins/services/laboratoryMixin'

  export default {
    name: 'CustomersEdit',
    mixins: [laboratorioMixin],
    props: {
      itemEditTmp: {
        type: Object,
        default: () => ({})
      },
    },
    data() {
      return {
        itemEdit: this.itemEditTmp,
        valid: false,
        nameRules: [
          v => !!v || 'Nombre es requerido',
          v => (v && v.length <= 100) || 'debe tener menos de 100 caracteres.',
        ],
        rifRules: [
          v => !!v || 'RIF es requerido',
          v => (v && v.length <= 20) || 'debe tener menos de 20 caracteres.',
        ],
        personRules: [
          v => !!v || 'Persona a cargo es requerido',
          v => (v && v.length <= 60) || 'debe tener menos de 60 caracteres.',
        ],
        rulesObservation: [
          v => !!v || 'Dirección es requerido',
          v => (v && v.length <= 200) || 'debe tener menos de 200 caracteres.',
        ],
        maskPhone: '+58 #### ### ####',
        currencyMask: createNumberMask({
          prefix: "",
          includeThousandsSeparator: false,
          allowNegative: false,
          allowDecimal: true,
          decimalLimit: 2,
        }),
        itemsTariff: [1,2,3,4,5,6],
        switch1: false,
        switch2: false,
        switch3: false,
      }
    },
    watch: {
      'switch1': {
        handler(value) {
          if (value) {
            this.itemEdit.charge_dollars = 1
          } else {
            this.itemEdit.charge_dollars = 0
          }
        }
      },
      'switch2': {
        handler(value) {
          if (value) {
            this.itemEdit.Print_invoice = 1
          } else {
            this.itemEdit.Print_invoice = 0
          }
        }
      },
      'switch3': {
        handler(value) {
          if (value) {
            this.itemEdit.hide_client = 1
          } else {
            this.itemEdit.hide_client = 0
          }
        }
      }, 
    },
    async mounted() {
      await this.getLaboratoryData()
      this.putData()
      this.$refs.form.validate();
    },
    methods: {
      async acceptEdit() {
        this.$emit('accept-edit', this.itemEdit)
      },
      async getLaboratoryData() {
        const result = await this.getUniqueLabData(1)
        if (result) {
          this.maskPhone = result.mask_phone
        }
      },
      putData() {
        if (this.itemEdit.charge_dollars === 1) {
          this.switch1 = true
        }
        if (this.itemEdit.Print_invoice === 1) {
          this.switch2 = true
        }
        if (this.itemEdit.hide_client === 1) {
          this.switch3 = true
        }
      },
    },
  }
</script>