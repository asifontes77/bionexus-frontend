<template>
  <v-dialog
    v-model="show"
    transition="dialog-top-transition"
    persistent
    max-width="500"
  >
    <v-card>
      <v-card-title class="text-h5 sidebarlite primary--text">
        Anular paciente
      </v-card-title>
      <v-card-text class="mt-4">
        <v-text-field
          v-model="username"
          label="Coloque nombre de usuario"
          type="text"
          placeholder="Ingresar nombre de usuario"
          required
        />
        <v-text-field
          v-model="password"
          label="Contraseña"
          type="password"
          placeholder="Contraseña"
          required
        />
        <div class="secondary--text" v-if="error">Nombre de usuario o contraseña INCORRECTA!</div>
        <div class="secondary--text" v-if="unauthorizedUser">Usuario sin permiso de ANULAR</div>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          text
          @click="anular()"
        >
          Anular
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
import loginMixin from '@/mixins/services/loginMixin'

export default {
  name: 'CancelPatientDialog',
  mixins: [loginMixin],
  model: {
    prop: 'show',
    event: 'change-model',
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    id: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      username: "",
      password: "",
      error: false,
      unauthorizedUser: false,
    }
  },
  watch: {
    'id': {
      handler() {
        this.username = ""
        this.password = ""
      },
    },
  },
  methods: {
    async anular() {
      this.error = false
      this.unauthorizedUser = false
      const filter = {
        user_name: this.username.toLowerCase(),
        password: this.password,
      }
      const result = await this.getLoginToEmailPassword(filter)
      if (result) {
        if (result.status === 404) {
          this.error = true
        } else {
          if (result.user.roles.includes('annular')) {
            this.$emit('cancellation-permission', true)
            this.$emit('change-model',false)
          } else {
            this.unauthorizedUser = true
          }
        }
      } else {
        this.error = true
      }
    },
  },
}
</script>