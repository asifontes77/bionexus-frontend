<template>
  <v-dialog
      v-model="show"
      transition="dialog-top-transition"
      persistent
      max-width="600"
  >
    <v-card>
      <v-toolbar color="sidebar">
          Nuevo grupo de examen
      </v-toolbar>
      <v-form
        ref="form"
        v-model="valid"
        lazy-validation
      >
        <v-card-text class="mt-4">
          <v-text-field
              v-model="description"
              label="Descripción"
              :counter="150"
              :rules="descriptionRules"
              required
              outlined
              dense
              hide-details
          />
          <v-switch
              v-model="itsExam"
              :label="itsExam ? 'Es análisis clínico': 'No es análisis clínico'"
              color="primary"
              hide-details
              class="mt-0"
          />
        </v-card-text>
        <v-card-actions>
            <v-btn text @click="$emit('change-model',false)">Cancelar</v-btn>
            <v-btn text :disabled="!valid" color="primary" @click="createGroup()">Registrar</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
<script>
  import examsListMixin from '@/mixins/services/examsListMixin'
  
  export default {
    name: 'newGroup',
    mixins: [examsListMixin],
    model: {
        prop: 'show',
        event: 'change-model',
    },
    props: {
        show: {
            type: Boolean,
            default: false,
        }
    },
    data() {
      return {
        valid: false,
        description: '',
        itsExam: true,
        descriptionRules: [
            v => !!v || 'Descripción es requerido',
            v => (v && v.length <= 100) || 'La descripción debe tener menos de 150 caracteres',
        ],
      }
    },
    async mounted() {
      this.$refs.form.validate();
    },
    methods: {
      async createGroup() {
        if (this.description !== '') {
          const newGroup = {
            description: this.description,
            its_exam: this.itsExam ? 1: 0,
            annulled: 0,
          }
          const result = await this.createExamgroup(newGroup);
          if (result) {
            this.description = ''
            this.$emit('save-group')
            this.$emit('change-model',false)
          }
        }
      },
    },
  }
</script>