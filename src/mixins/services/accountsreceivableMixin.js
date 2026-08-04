import axios from "axios"
import store from '@/store'
import { basePath } from '@/config';

//import { basePath } from '@/config';

const config = {
  headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      'Access-Control-Allow-Origin': '*', 
      'authorization': `Bearer ${localStorage.getItem('token') ? localStorage.getItem('token') : ''}`,
  },
}

const accountsreceivableMixin = {
  methods: {
    createAccountsReceivable(newAccount) {
      return axios
      .post(`${basePath}/api/accountsreceivable/`, newAccount, config)
      .then((response) => response.data)
      .catch(function (error) {
          // handle error
          console.log(error);
          this.$toast.error('Problemas para registrar cuentas por cobrar')
      })
    },

    updateAccountsReceivable(id, newAccount) {
      return axios
        .patch(`${basePath}/api/accountsreceivable/${id}`, newAccount, config)
        .then((response) => response.data)
        .catch(function (error) {
            // handle error
            console.log(error);
            this.$toast.error('Problemas para registrar cuentas por cobrar')
        })
    },

    getAccountsReceivableWithClientBetweenDate(newQuery) {
      return axios
      .post(`${basePath}/api/accountsreceivable/client-date`, newQuery, config)
      .then((response) => response.data)
      .catch(function (error) {
          // handle error
          this.$toast.error('Problemas para obtener cuentas por cobrar')
      })
    }
  }
}

export default accountsreceivableMixin
