const userStore = {
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
    },
    actions: {
    },
}
export default userStore