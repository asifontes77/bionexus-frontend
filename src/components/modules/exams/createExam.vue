<template>
<v-dialog
      v-model="show"
      transition="dialog-top-transition"
      persistent
      max-width="600"
  >
    <v-card>
      <v-toolbar color="sidebar">
          Crear nuevo examen
      </v-toolbar>
      <v-form
        ref="form"
        v-model="valid"
        lazy-validation
      >
        <v-card-text class="mt-4">
          <div>
            <v-text-field
              v-model="selectedExam.description"
              label="Descripción"
              :rules="descriptionRules"
              required
              counter="60"
              maxlength="60"
              outlined
              dense
            />
            <v-text-field
              v-model="selectedExam.abbreviation"
              label="Abreviatura"
              :rules="abbreviationRules"
              required
              outlined
              counter="10"
              maxlength="10"
              dense
            />
          </div>
          <v-card outlined class="mx-auto">
            <v-card-title>Tarifa</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="4">
                  <v-text-field
                    v-model="selectedExam.cost1"
                    v-mask="currencyMask"
                    type="text"
                    label="Precio 1"
                    outlined
                    dense
                  />
                </v-col>
                <v-col cols="4">
                  <v-text-field
                    v-model="selectedExam.cost2"
                    v-mask="currencyMask"
                    type="text"
                    label="Precio 2"
                    outlined
                    dense
                  />
                </v-col>
                <v-col cols="4">
                  <v-text-field
                    v-model="selectedExam.cost3"
                    v-mask="currencyMask"
                    type="text"
                    label="Precio 3"
                    outlined
                    dense
                  />
                </v-col>
                <v-col cols="4">
                  <v-text-field
                    v-model="selectedExam.cost4"
                    v-mask="currencyMask"
                    type="text"
                    label="Precio 4"
                    outlined
                    dense
                  />
                </v-col>
                <v-col cols="4">
                  <v-text-field
                    v-model="selectedExam.cost5"
                    v-mask="currencyMask"
                    type="text"
                    label="Precio 5"
                    outlined
                    dense
                  />
                </v-col>
                <v-col cols="4">
                  <v-text-field
                    v-model="selectedExam.cost6"
                    v-mask="currencyMask"
                    type="text"
                    label="Precio 6"
                    outlined
                    dense
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
          <v-select
            v-if="taxList"
            v-model="selectedExam.tax_id"
            :items="taxList"
            item-text="description"
            item-value="id"
            label="Tipo de impuesto"
            dense
            outlined
            class="mt-4"
          />
          <v-row>
            <v-col cols="6">
              <v-switch
                v-model="selectedExam.annulled"
                color="warning"
                hide-details
                class="mt-0"
              >
                <template v-slot:label>
                  <v-icon :color="selectedExam.annulled ? 'secondary' : ''" class="mr-2">{{ selectedExam.annulled ? 'mdi-eye-off' : 'mdi-eye'}}</v-icon>
                  <span :class="selectedExam.annulled ? 'secondary--text' : ''">Anulado</span>
                </template>
              </v-switch>
            </v-col>
            <v-col cols="6">
              <v-switch
                v-model="selectedExam.special_test"
                color="primary"
                hide-details
                class="mt-0"
              >
                <template v-slot:label>
                  <v-icon :color="selectedExam.special_test ? 'primary' : ''" class="mr-2">mdi-ambulance</v-icon>
                  <span :class="selectedExam.special_test ? 'primary--text' : ''">Prueba especial</span>
                </template>
              </v-switch>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
            <v-btn text @click="$emit('change-model',false)">Cancelar</v-btn>
            <v-btn text :disabled="!valid" color="primary" @click="createNewExam()">Registrar</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
<script>
  import createNumberMask from 'text-mask-addons/dist/createNumberMask'
  import examsListMixin from '@/mixins/services/examsListMixin'

  export default {
    name: 'createExam',
    mixins: [examsListMixin],
    model: {
        prop: 'show',
        event: 'change-model',
    },
    props: {
        show: {
            type: Boolean,
            default: false,
        },
        selectedGroup: {
          type: Object,
          default: () => {},
        },
    },
    data() {
      return {
        valid: false,
        taxList: null,
        selectedExam: {
          description: '',
          abbreviation: '',
          cost1: 0,
          cost2: 0,
          cost3: 0,
          cost4: 0,
          cost5: 0,
          cost6: 0,
          tax_id: 1,
          annulled: 0,
          special_test: 0,
          group_id: 0,
        },
        descriptionRules: [
            v => !!v || 'Descripción es requerido',
            v => (v && v.length <= 60) || 'La descripción debe tener menos de 150 caracteres',
        ],
        abbreviationRules: [
            v => !!v || 'Abreviatura es requerido',
            v => (v && v.length <= 10) || 'La abreviatura debe tener menos de 150 caracteres',
        ],
        currencyMask: createNumberMask({
          prefix: "",
          includeThousandsSeparator: true,
          allowNegative: false,
          thousandsSeparatorSymbol: "",
          allowDecimal: true,
          decimalSymbol: ".",
          decimalLimit: 2,
          allowLeadingZeroes: true,
        }),
      }
    },
    async mounted() {
      this.taxList = await this.getTaxList()
      this.$refs.form.validate();
    },
    methods: {
      async createNewExam() {
        const idGroup = this.selectedGroup.id
        this.selectedExam.group_id = idGroup
        const result = await this.createExamList(this.selectedExam);
        if (result) {
          this.$emit('save-exam')
          this.$emit('change-model',false)
        }

      },
    },
  }
</script>