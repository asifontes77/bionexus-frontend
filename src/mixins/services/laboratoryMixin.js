import axios from "axios"

import { basePath } from '@/config';

const config = {
    headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Access-Control-Allow-Origin': '*', 
        'authorization': `Bearer ${localStorage.getItem('token') ? localStorage.getItem('token') : ''}`,
    },
}

const uploadConfig = {
    headers: {
        'authorization': `Bearer ${localStorage.getItem('token') ? localStorage.getItem('token') : ''}`,
    },
}

const laboratoryMixin = {
    methods: {
        getUniqueLabData(id) {
            return axios
            .get(`${basePath}/api/laboratory/${id}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log('hay error: ',error);
                this.$toast.error('Problemas para obtener información del laboratorio')
            })
        },
        getLaboratorySetting()  {
            return axios
            .get(`${basePath}/api/laboratory/1`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener información del laboratorio')
            })
        },
        getSampleTypeData() {
            return axios
            .get(`${basePath}/api/sampletype`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener información del laboratorio')
            })
        },
        insertNewSampletype(register) {
            return axios
            .post(`${basePath}/api/Sampletype/`, register)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para registrar información del laboratorio')
            })
        },
        getClientData() {
            return axios
            .get(`${basePath}/api/client`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener información de los clientes')
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
        createClient(register) {
            return axios
            .post(`${basePath}/api/client/`, register)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para registrar información del cliente')
            })
        },
        getTariffData(id) {
            return axios
            .get(`${basePath}/api/laboratory/tariff/${id}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener información de arancel del laboratorio')
            })
        },
        sendImageFile(formData) {
            return axios
            .post(`${basePath}/api/laboratory/upload`, formData, uploadConfig)
            .then((response) => response.data)
            .catch((error) => {
                console.log('hay error: ',error);
                this.$toast.error('Problemas para registrar información del laboratorio')
            })
        },
        updateLaboratory(id, changes) {
            return axios
            .patch(`${basePath}/api/laboratory/${id}`, changes, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para registrar información del laboratorio')
            })
        },
        getTaxs() {
            return axios
            .get(`${basePath}/api/tax`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener impuesto del laboratorio')
            })
        },
        updateTax(id, changes) {
            return axios
            .patch(`${basePath}/api/tax/${id}`, changes, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para registrar impuesto del laboratorio')
            })
        },
        createTax(newTax) {
            return axios
            .post(`${basePath}/api/tax/`, newTax)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para registrar impuesto')
            })
        },
        deleteTax(id) {
            return axios
            .delete(`${basePath}/api/tax/${id}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para eliminar el impuesto')
            })
        }
    },
}

export default laboratoryMixin
