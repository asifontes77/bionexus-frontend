import loginMixin from '@/mixins/services/loginMixin'
import store from '@/store'
import router from '@/router'

export default {
  setToken(response) {
    const client = {
      id: response.user.id,
      name: response.user.name,
      roles: response.user.roles,
      token: response.token,
      college: response.user.college_number,
      position: response.user.position,
      photo: response.url_photo === "undefined" || response.url_photo === null ? '' : response.url_photo,
      telephone: response.user.telephone,
      email: response.user.email
    }
    store.commit('setClient', client)
    localStorage.token = response.token
    localStorage.clientId = response.user.id
    localStorage.username = response.user.name
    localStorage.college_number = response.user.college_number
    localStorage.roles = response.user.roles
    localStorage.position = response.user.position
    localStorage.url_photo = response.url_photo === "undefined" || response.url_photo === null ? '' : response.url_photo
    localStorage.telephone = response.user.telephone
    localStorage.email = response.user.email
    const today = new Date()
    localStorage.dateIn = today.toISOString()
    router.replace({ 
      name: "home", 
      params:{ 
        username: response.user.name,
        college_number: response.user.college_number,
        roles: response.user.roles,
        position: response.user.position,
        clientId: response.user.id,
        photo: response.user.photo,
        telephone: response.user.telephone,
        email: response.user.email,
      } 
    })
  },
  async login({ username, password}) {
    const filter = {
      user_name: username,
      password: password,
    }
    return await loginMixin.methods.getLoginToEmailPassword(filter)
  },
}