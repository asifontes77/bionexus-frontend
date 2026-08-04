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
        getAntibioticLists() {
            return axios
            .get(`${basePath}/api/antibiotic`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener lista de antibíoticos')
                
            })
        }, 
        getAntibioticListsOrder() {
            return axios
            .get(`${basePath}/api/antibiotic/order`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$store.error('Problemas para obtener lista de antibíoticos')
            })
        },       
        getAntibioticById(id) {
            return axios
            .get(`${basePath}/api/antibiotic/${id}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener el antibíotico')
            })
        },
        updateAntibiotic(id, changes) {
            return axios
            .patch(`${basePath}/api/antibiotic/${id}`, changes, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para registrar el antibíotico')
            })
        },
        createAntibiotic(newAntibiotic) {
            return axios
            .post(`${basePath}/api/antibiotic/`, newAntibiotic, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para registrar el antibíotico')
            })
        },
        getListGermsOrder() {
            return axios
            .get(`${basePath}/api/list-germs/list`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener los germenes')
            })
        },
        createGerm(newGerm) {
            return axios
            .post(`${basePath}/api/list-germs/`, newGerm, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para registrar el germen')
            })
        },
        updateGerm(id, changes) {
            return axios
            .patch(`${basePath}/api/list-germs/${id}`, changes, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para registrar el germen')
            })
        },
    },
}

export default notificationsMixin
