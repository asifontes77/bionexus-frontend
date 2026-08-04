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

const invoiceMixin = {
  methods: {
    getInvoice(id) {
      return axios
        .get(`${basePath}/api/invoice/${id}`, config)
        .then((response) => response.data)
        .catch(function (error) {
            // handle error
            console.log(error);
            this.$toast.error('Problemas para obtener las factura')
        })
    },
    getInvoiceNo(no_invoice) {
      return axios
        .get(`${basePath}/api/invoice/no/${no_invoice}`, config)
        .then((response) => response.data)
        .catch(function (error) {
            // handle error
            console.log(error);
            this.$toast.error('Problemas para obtener las factura')
        })
    },    
    getVoucherFormat(id) {
        return axios
        .get(`${basePath}/api/laboratory/${id}`, config)
        .then((response) => response.data)
        .catch(function (error) {
            // handle error
            console.log('hay error: ',error);
            this.$toast.error('Problemas para obtener información del laboratorio')
        })
    },
    getClient(id) {
        return axios
        .get(`${basePath}/api/client/${id}`, config)
        .then((response) => response.data)
        .catch(function (error) {
            // handle error
            console.log(error);
            this.$toast.error('Problemas para obtener información del cliente')
        })
    },
    getInvoiceByNumber(numbres) {
      return axios
        .post(`${basePath}/api/invoice/numbers`, numbres, config)
        .then((response) => response.data)
        .catch(function (error) {
          // handle error
          console.log(error);
          this.$toast.error('Problemas para registras la factura')
        })
    },
    getNCByNumber(numbres) {
      return axios
        .post(`${basePath}/api/invoice/creditnote`, numbres, config)
        .then((response) => response.data)
        .catch(function (error) {
          // handle error
          console.log(error);
          this.$toast.error('Problemas para obtener la factura')
        })
    },
    getInvoicesDate(admission) {
      return axios
      .post(`${basePath}/api/invoice/date`, admission, config)
      .then((response) => response.data)
      .catch(function (error) {
        // handle error
        console.log(error);
        this.$toast.error('Problemas para obtener las facturas')
      })
  },
  }
}

export default invoiceMixin