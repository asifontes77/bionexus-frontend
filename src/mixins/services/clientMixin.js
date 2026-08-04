import axios from "axios"
import store from '@/store'

import { basePath } from '@/config';

const config = {
  headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      'Access-Control-Allow-Origin': '*', 
      'authorization': `Bearer ${localStorage.getItem('token') ? localStorage.getItem('token') : ''}`,
  },
}

const clientMixin = {
  methods: {
    getClients(id) {
      return axios
      .get(`${basePath}/api/client/${id}`, config)
      .then((response) => response.data)
      .catch(function (error) {
          // handle error
          console.log(error);
          this.$store.commit('alert', {
            color: 'error',
            text: 'Problemas para obtener el cliente',
          })
      })
    },
    getClientList() {
        return axios
        .get(`${basePath}/api/client/`, config)
        .then((response) => response.data)
        .catch(function (error) {
            // handle error
            console.log(error);
            this.$store.commit('alert', {
              color: 'error',
              text: 'Problemas para obtener la lista clientes',
            })
        })
    },
    getClientListAll() {
      return axios
      .get(`${basePath}/api/client/all`, config)
      .then((response) => response.data)
      .catch(function (error) {
          // handle error
          console.log(error);
          this.$toast.error('Problemas para obtener la lista clientes')
      })
    },
    updateClient(id, client) {
      return axios
        .patch(`${basePath}/api/client/${id}`, client, config)
        .then((response) => response.data)
        .catch(function (error) {
            // handle error
            console.log(error);
            this.$toast.error('Problemas para registrar el cliente')
        })
    },
    createClient(client) {
      return axios
        .post(`${basePath}/api/client/`, client, config)
        .then((response) => response.data)
        .catch(function (error) {
            // handle error
            console.log(error);
            this.$toast.error('Problemas para registrar el cliente')
        })
    }
  }
}

export default clientMixin