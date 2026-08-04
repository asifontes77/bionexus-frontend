import axios from "axios"

import { basePath } from '@/config';

const config = {
    headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Access-Control-Allow-Origin': '*', 
        'authorization': `Bearer ${localStorage.getItem('token') ? localStorage.getItem('token') : ''}`,
    },
}

const cashRegisterMixins = {
  methods: {
    createCash_register(changes) {
      return axios
      .post(`${basePath}/api/cash_register/`, changes, config)
      .then((response) => response.data)
      .catch(function (error) {
        // handle error
        console.log(error);
        this.$store.commit('alert', {
          color: 'error',
          text: 'Problemas para registrar la caja',
        })
      })
    },
    updateCash_register(id, changes) {
      return axios
      .patch(`${basePath}/api/cash_register/${id}`, changes, config)
      .then((response) => response.data)
      .catch(function (error) {
        // handle error
        console.log(error);
        this.$store.commit('alert', {
          color: 'error',
          text: 'Problemas para registrar la caja',
        })
      })
    },    
    getCash_registerLists() {
      return axios
      .get(`${basePath}/api/cash_register`, config)
      .then((response) => response.data)
      .catch(function (error) {
        // handle error
        console.log(error);
        this.$toast.error('Problemas para obtener la lista de movimientos de caja')
      })
    },
    getCash_register(id) {
      return axios
      .get(`${basePath}/api/cash_register/${id}`, config)
      .then((response) => response.data)
      .catch(function (error) {
        // handle error
        console.log(error);
        this.$toast.error('Problemas para obtener el movimiento de caja')
      })
    },    
    getCash_registerDateResult(change) {
      return axios
      .post(`${basePath}/api/cash_register/date`, change, config)
      .then((response) => response.data)
      .catch(function (error) {
          // handle error
          console.log('hay error: ',error);
          this.$toast.error('Problemas para obtener el movimiento de caja')
      })
    },
  },
}

export default cashRegisterMixins