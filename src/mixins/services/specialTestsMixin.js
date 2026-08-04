import axios from "axios"

import { basePath } from '@/config';

const config = {
  headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      'Access-Control-Allow-Origin': '*', 
      'authorization': `Bearer ${localStorage.getItem('token') ? localStorage.getItem('token') : ''}`,
  },
}

const specialTestsMixin = {
  methods: {
    getSpecialTestLabList() {
      return axios
        .get(`${basePath}/api/specialtestlab`, config)
        .then((response) => response.data)
        .catch(function (error) {
            // handle error
            console.log(error);
            this.$toast.error('Problemas para obtener la lista de pruebas especiales')
        })
    },
    getSpecialTestLab(id) {
      return axios
      .get(`${basePath}/api/specialtestlab/${id}`, config)
      .then((response) => response.data)
      .catch(function (error) {
          // handle error
          console.log(error);
          this.$toast.error('Problemas para ver el laboratorio')
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
    getPatientsSpecial(newQuery) {
      return axios
        .post(`${basePath}/api/patients/speciallist/`, newQuery, config)
        .then((response) => response.data)
        .catch(function (error) {
            // handle error
            console.log(error);
            this.$toast.error('Problemas para seleccionar los pacientes')
        })
    },
    createSpecialTestLab(newItem) {
      return axios
        .post(`${basePath}/api/specialtestlab/`, newItem, config)
        .then((response) => response.data)
        .catch(function (error) {
            // handle error
            console.log(error);
            this.$toast.error('Problemas para registrar el laboratorio')
        })
    },
    createSpecialTestItems(newItem) {
      return axios
        .post(`${basePath}/api/specialtestItems/`, newItem, config)
        .then((response) => response.data)
        .catch(function (error) {
            // handle error
            console.log(error);
            this.$toast.error('Problemas para registrar el test')
        })
    },
    deleteTestItems(id) {
      return axios
      .delete(`${basePath}/api/specialtestItems/${id}`, config)
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
        this.$toast.error('Problemas para eliminar el grupo de exámenes');
      });
    },
    updateSpecialTestLab(id, change) {
      return axios
      .patch(`${basePath}/api/specialtestlab/${id}`, change, config)
      .then((response) => response.data)
      .catch(function (error) {
          // handle error
          console.log('hay error: ',error);
          this.$toast.error('Problemas para registrar el laboratorio')
      })
    },
    updateSpecialTestItems(id, change) {
      return axios
      .patch(`${basePath}/api/specialtestItems/${id}`, change, config)
      .then((response) => response.data)
      .catch(function (error) {
          // handle error
          console.log('hay error: ',error);
          this.$toast.error('Problemas para registrar el laboratorio')
      })
    },
  }
}
export default specialTestsMixin