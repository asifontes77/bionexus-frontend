import axios from "axios"

import { basePath } from '@/config';

const config = {
  headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      'Access-Control-Allow-Origin': '*', 
      'authorization': `Bearer ${localStorage.getItem('token') ? localStorage.getItem('token') : ''}`,
  },
}

const TypePaymentMixin = {
  methods: {
    getTypepaymentId(id) {
      return axios
      .get(`${basePath}/api/typepayment/${id}`, config)
      .then((response) => response.data)
      .catch(function (error) {
          // handle error
          console.log('hay error: ',error);
          this.$toast.error('Problemas para obtener los tipos de pago')
      })
    },
    getTypePayment() {
      return axios
      .get(`${basePath}/api/typepayment`, config)
      .then((response) => response.data)
      .catch(function (error) {
          // handle error
          console.log('hay error: ',error);
      })
    },
    getInvoiceTotales(change) {
      return axios
      .post(`${basePath}/api/waypay/totales`, change, config)
      .then((response) => response.data)
      .catch(function (error) {
          // handle error
          console.log('hay error: ',error);
          this.$toast.error('Problemas para obtener los totales de las formas de pago')
      })
    },
    createTypepayment(change) {
      return axios
      .post(`${basePath}/api/typepayment/`, change, config)
      .then((response) => response.data)
      .catch(function (error) {
        // handle error
        console.log(error);
        this.$toast.error('Problemas para registrar forma de pago')
      })
    },
    updateTypepayment(id, change) {
      return axios
      .patch(`${basePath}/api/typepayment/${id}`, changes, config)
      .then((response) => response.data)
      .catch(function (error) {
          // handle error
          console.log(error);
          this.$toast.error('Problemas para registrar forma de pago')
      })
    }
  },
}

export default TypePaymentMixin