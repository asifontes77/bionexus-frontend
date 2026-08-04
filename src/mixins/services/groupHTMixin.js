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
        getExamgroupsListGroup() {
            return axios
            .get(`${basePath}/api/groupHt/group/0`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error(`Problemas para obtener la lista de grupo de exámenes`)
            })
        },
        getGroupHt(id) {
            return axios
            .get(`${basePath}/api/groupHt/${id}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error(`Problemas para obtener el grupo de exámenes`)
            })
        },
        countWithLike(description) {
            return axios
            .get(`${basePath}/api/groupHt/count/${description}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para contar la cantidad de grupo de exámenes')
            })
        },
        getGroupHtListActive() {
            return axios
            .get(`${basePath}/api/groupHt/list`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);                
                this.$toast.error(`Problemas para obtener la lista de grupo activos de exámenes`)
            })
        },
        getExamgroupsViewList() {
            return axios
            .get(`${basePath}/api/examgroup/view/0`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para ver el grupo de exámenes')
            })
        },
        deleteGroupItems(id) {
            return axios
            .delete(`${basePath}/api/groupHtItems/${id}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para eliminar el grupo de exámenes')
            })
        },
        deleteGroupHt(id) {
            return axios
            .delete(`${basePath}/api/groupHt/${id}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para eliminar el grupo')
            })
        },
        updateGroupHt(id, change) {
            return axios
            .patch(`${basePath}/api/groupHt/${id}`, change, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log('hay error: ',error);
                this.$toast.error('Problemas para registrar el grupo de exámenes')
            })
        },
        updateGroupItemsHt(id, change) {
            return axios
            .patch(`${basePath}/api/groupHtItems/${id}`, change, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log('hay error: ',error);
                this.$toast.error('Problemas para registrar el grupo de exámenes')
            })
        },
        createGroupHt(newGroup) {
            return axios
            .post(`${basePath}/api/groupHt/`, newGroup, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para registrar el grupo de exámenes')
            })
        },
        createGroupItemsHt(newGroup) {
            return axios
            .post(`${basePath}/api/groupHtItems/`, newGroup, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para registrar el grupo de exámenes')
            })
        },
        getTotalExamWithGroup(query) {
            return axios
            .post(`${basePath}/api/exams/groupHtItems/`, query, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener los totales de grupo de exámenes')
            })
        },
    },
}

export default notificationsMixin