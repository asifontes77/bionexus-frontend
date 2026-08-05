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
        getExamListByGroup(groupId) {
            return axios
            .get(`${basePath}/api/examlists/group/${groupId}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener la lista de exámenes')
            })
        },
        createExamList(changes) {
            return axios
            .post(`${basePath}/api/examlists/`, changes, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener la lista de exámenes')
            })
        },
        createExamgroup(changes) {
            return axios
            .post(`${basePath}/api/examgroup/`, changes, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para registrar el grupo de exámenes')
            })
        },
        updateExamList(id, changes) {
            return axios
            .patch(`${basePath}/api/examlists/${id}`, changes, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para registrar el exámenes')
            })
        },
        getExamList() {
            return axios
            .get(`${basePath}/api/examlists`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener la lista de exámenes')
            })
        },  
        getExam(id) {
            return axios
            .get(`${basePath}/api/examlists/${id}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener el examen')
            })
        },      
        updateExamgroup(groupId, change) {
            return axios
            .patch(`${basePath}/api/examgroup/${groupId}`, change, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log('hay error: ',error);
                this.$toast.error('Problemas para registrar el grupo de exámenes')
            })
        },
        getExamListByidGroup(groupId) {
            return axios
            .get(`${basePath}/api/examlists/grouplist/${groupId}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener el grupo de exámenes')
            })
        },
        getExamListByDescription(description) {
            return axios
            .get(`${basePath}/api/examlists/search-description/${description}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener la lista de exámenes')
            })
        },        
        getExamTaxById(id) {
            return axios
            .get(`${basePath}/api/tax/${id}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener el impuesto del examen')
            })
        },
        getExamById(exam_id) {
            return axios
            .get(`${basePath}/api/examlists/${exam_id}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener el examen')
            })
        },
        getExamListById(exam_id) {
            return axios
            .get(`${basePath}/api/examlists/get-id/${exam_id}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener el examen')
            })
        },
        getExamGroupList() {
            return axios
            .get(`${basePath}/api/examgroup`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log('hay error: ',error);
                this.$toast.error('Problemas para lista los grupos')
            })
        },
        getExamGroupListJoined() {
            return axios
            .get(`${basePath}/api/examgroup/group/0`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log('hay error: ',error);
                this.$toast.error('Problemas para listar los grupos de exámenes')
            })
        },
        getDollarValue() {
            return axios
            .get(`${basePath}/api/dollarvalue/get`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log('hay error: ',error);
                this.$toast.error('Problemas para obtener el Dollar')
            })
        },
        getTypePayment() {
            return axios
            .get(`${basePath}/api/typepayment`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log('hay error: ',error);
                this.$toast.error('Problemas para obtener el tipo de pago')
            })
        },
        setNewDolar(newDolar) {
            return axios
            .post(`${basePath}/api/dollarvalue/`, newDolar, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para registrar el Dollar')
            })
        },
        getExamGroupListAll() {
            return axios
            .get(`${basePath}/api/examgroup/all`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log('hay error: ',error);
                this.$toast.error('Problemas para listar los grupos de exámenes')
            })
        },
        getTaxList() {
            return axios
            .get(`${basePath}/api/tax`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log('hay error: ',error);
                this.$toast.error('Problemas para obtener lista de impuestos')
            })
        },
        setNewCosts(shippingList, onlyThisGroup) {
            return axios
            .post(`${basePath}/api/examlists/new-costs`, shippingList, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log('hay error: ',error);
                this.$toast.error('Problemas para registrar los nuevos costos')
            })
        },
        getExamDescriptionById(id) {
            return axios
            .post(`${basePath}/api/examlists/description-id/${id}`, change, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log('hay error: ',error);
                this.$toast.error('Problemas para obtener las descripciones de exámenes')
            })
        },
    },
}

export default notificationsMixin
