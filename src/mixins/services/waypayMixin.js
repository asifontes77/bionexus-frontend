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

const waypayMixin = {
  methods: {
    getWaypayPatientId(id) {
      return axios
      .get(`${basePath}/api/waypay/patient/${id}`, config)
      .then((response) => response.data)
      .catch((error) => {
          console.log('hay error: ',error);
        this.$toast.error('Problemas para obtener las forma de pago')
      })
    },    
    getDollarValue() {
      return axios
      .get(`${basePath}/api/dollarvalue/get`, config)
      .then((response) => response.data)
      .catch(function (error) {
          // handle error
          console.log('hay error: ',error);
          this.$toast.error('Problemas para obtener el valor del dolar')
      })
    },    
    setNewDolar(newDolar) {
      return axios
      .post(`${basePath}/api/dollarvalue/`, newDolar, config)
      .then((response) => response.data)
      .catch(function (error) {
          // handle error
          console.log(error);
          this.$toast.error('Problemas para registrar el valor del dolar')
      })
    },
  },
}

export default waypayMixin