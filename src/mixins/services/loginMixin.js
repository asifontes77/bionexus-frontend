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
        getLoginToEmailPassword(filter) {
            return axios
                .post(`${basePath}/api/users/session`, filter, config)
                .then((response) => response.data)
                .catch((error) => {
                    console.log('hay error: ',error);
                    this.$toast.error('Problemas para obtener el usuario')
                })
        },

        getLoginToEmailclientId(userId) {
            return axios
                .get(`${basePath}/api/users/${userId}`, config)
                .then((response) => response.data)
                .catch((error) => {
                    console.log('hay error: ',error);
                    this.$toast.error('Problemas para obtener el usuario')
                })
        },

        getLoginToclientId(userId) {
            return axios
                .get(`${basePath}/api/users/${userId}`, config)
                .then((response) => response.data)
                .catch((error) => {
                    console.log('hay error: ',error);
                    this.$toast.error('Problemas para obtener el usuario')
                })
        },
    },
}

export default notificationsMixin