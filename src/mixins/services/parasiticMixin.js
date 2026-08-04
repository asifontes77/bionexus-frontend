import axios from "axios"

import { basePath } from '@/config';

const config = {
    headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Access-Control-Allow-Origin': '*', 
        'authorization': `Bearer ${localStorage.getItem('token') ? localStorage.getItem('token') : ''}`,
    },
}

const notificationsMixin = {
    methods: {
        getParasiticLists() {
            return axios
            .get(`${basePath}/api/parasiticforms`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener la lista de parásitos')
            })
        },
        getParasiticListsOrder() {
            return axios
            .get(`${basePath}/api/parasiticforms/order`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener la lista de parásitos')
            })
        },        
        getParasiticById(id) {
            return axios
            .get(`${basePath}/api/parasiticforms/${id}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener el parásito')
            })
        },
        updateParasitic(id, changes) {
            return axios
            .patch(`${basePath}/api/parasiticforms/${id}`, changes, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para registrar el parásito')
            })
        },
        createParasitic(newParasitic) {
            return axios
            .post(`${basePath}/api/parasiticforms/`, newParasitic, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para registrar el parásito')
            })
        },
},
}

export default notificationsMixin