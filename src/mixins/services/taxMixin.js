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

const taxMixin = {
  methods: {
    getTaxs() {
      return axios
        .get(`${basePath}/api/tax`, config)
        .then((response) => response.data)
        .catch(function (error) {
            // handle error
            console.log(error);
            this.$toast.error('Problemas para obtener el impuesto')
        })
    },
  },
}

export default taxMixin