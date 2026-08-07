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

const usersMixin = {
    methods: {
        sendUserImageFile(formData) {
            return axios
                .post(`${basePath}/api/users/upload`, formData)
                .then((response) => response.data)
                .catch((error) => {
                    console.log('hay error: ',error);
                    this.$toast.error('Problemas para registrar el usuario')
                })
        },

        changeUserById(id, change) {
            return axios
            .patch(`${basePath}/api/users/${id}`, change, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log('hay error: ',error);
                this.$toast.error('Problemas para registrar el usuario')
            })
        },

        createUser(newUser) {
            return axios
            .post(`${basePath}/api/users/insert`, newUser, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log('hay error: ',error);
                this.$toast.error('Problemas para registrar el usuario')
            })
        },

        getUserById(id) {
            return axios
            .get(`${basePath}/api/users/${id}`, config)
            .then((response) => response.data)
            .catch((error) => {
                console.log('hay error: ',error);
                this.$toast.error('Problemas para obtener el usuario')
            })
        },

        getUsersOrder() {
            return axios
            .get(`${basePath}/api/users/order`, config)
            .then((response) => response.data)
            .catch((error) => {
                console.log('hay error: ',error);
                this.$toast.error('Problemas para obtener los usuarios')
            })
        },

        getSignatureUsers() {
            return axios
            .get(`${basePath}/api/users/listsignature`, config)
            .then((response) => response.data)
            .catch((error) => {
                console.log('hay error: ',error);
                this.$toast.error('Problemas para obtener los usuarios')
            })
        },

        verifyEmail(email) {
            return axios
                .get(`${basePath}/api/users/verify/${email}`, config)
                .then((response) => response.data)
                .catch((error) => {
                    console.log('hay error: ',error);
                    this.$toast.error('Problemas para obtener los usuarios')
                })
        },

        verifyEmailId(id, email) {
            return axios
                .get(`${basePath}/api/users/verify-id/${id}/${email}`, config)
                .then((response) => response.data)
                .catch((error) => {
                    console.log('hay error: ',error);
                    this.$toast.error('Problemas para obtener el usuario')
                })
        },
        verifySignature(id, passwordSignature) {
            const body = {
                userId: id,
                passwordSignature,
            }

            return axios
                .post(`${basePath}/api/users/verify-signature`, body, config)
                .then((response) => response.data)
                .catch((error) => {
                    console.log('hay error: ',error);
                    this.$toast.error('Problemas para verificar la contraseÃ±a del usuario')
                })
        },
    },
}

export default usersMixin
