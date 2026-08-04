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

const snackBarStore = {
  state: {
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
    snackbar: (state) => state.snackbar,
  },
  mutations: {
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
}

export default snackBarStore
