import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

const SNACKBAR_TYPES = {
  success: {
    color: 'primary',
    icon: 'mdi-checkbox-marked-circle',
  },
  info: {
    color: 'info',
    icon: 'mdi-information',
  },
  warning: {
    color: 'warning',
    icon: 'mdi-alert',
  },
  error: {
    color: 'error',
    icon: ' mdi-close-circle',
  },
}

export default new Vuex.Store({
  state: {
    id: null,
    name: null,
    roles: 'ini',
    token:'',
    college: '',
    position: '',
    photo: '',
    telephone: '',
    email: '',
    snackbar: {
      visible: false,
      color: 'info',
      type: 'info',
      text: null,
      timeout: 5000,
      multiline: false,
      icon: 'mdi-information',
    },
  },
  getters: {
      clientId: (state) => state.id,
      nameUser: (state) => state.name,
      token: (state) => state.token,
      roles: (state) => state.roles,
      collegeNumber: (state) => state.college,
      position: (state) => state.position,
      photo: (state) => state.photo,
      telephone: (state) => state.telephone,
      email: (state) => state.email,
      snackbar: (state) => state.snackbar,
      isLoggedIn(state) {
        return state.token !== '' ? true : false;
      },
      isToken(state) {
        return state.token
      },
  },
  mutations: {
      setAvailableModule(state, modules) {
        state.availableModules = modules
      },
      setClient(state, client) {
        state.id = client.id
        state.name = client.name
        state.roles = client.roles
        state.token = client.token      
        state.college = client.college
        state.position = client.position
        state.photo = client.photo
        state.telephone = client.telephone
        state.email = client.email
      },
      alert(state, payload) {
        state.snackbar.text = payload.text
        state.snackbar.multiline = payload.text.length > 50
        if (payload.multiline) {
          state.snackbar.multiline = payload.multiline
        }
        if (payload.type) {
          const type = SNACKBAR_TYPES[payload.type]
          if (type) {
            state.snackbar.color = type.color
            state.snackbar.icon = type.icon
          }
        }
        if (payload.timeout) {
          state.snackbar.timeout = payload.timeout
        }
        state.snackbar.visible = true
      },
      closeAlert(state) {
        state.snackbar.visible = false
        state.snackbar.multiline = false
        state.snackbar.text = null
      },
  },
  actions: {
  },
})
