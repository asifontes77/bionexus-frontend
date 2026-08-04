import axios from "axios"

import { basePath } from '@/config';

const config = {
    headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Access-Control-Allow-Origin': '*', 
        'authorization': `Bearer ${localStorage.getItem('token') ? localStorage.getItem('token') : ''}`,
    },
}

const routinesMixin = {
  methods: {
    getRoutinesList() {
      return axios
      .get(`${basePath}/api/routines`, config)
      .then((response) => response.data)
      .catch(function (error) {
        // handle error
        console.log(error);
        this.$toast.error('Problemas para obtener las rutinas')
      })
    },
    getRoutines(id) {return axios
      .get(`${basePath}/api/routines/${id}`, config)
      .then((response) => response.data)
      .catch(function (error) {
        // handle error
        console.log(error);
        this.$toast.error('Problemas para obtener la rutina')
      })
    },
    updateRoutines(id, change) {
      return axios
      .patch(`${basePath}/api/routines/${id}`, change, config)
      .then((response) => response.data)
      .catch(function (error) {
        // handle error
        console.log('hay error: ',error);
        this.$toast.error('Problemas para registrar la rutina')
      })
    },    
    createRoutines(newGroup) {
      return axios
      .post(`${basePath}/api/routines/`, newGroup, config)
      .then((response) => response.data)
      .catch(function (error) {
        // handle error
        console.log(error);
        this.$toast.error('Problemas para registrar la rutina')
      })
    },
    deleteRoutines(id) {
      return axios
      .delete(`${basePath}/api/routines/${id}`, config)
      .then((response) => response.data)
      .catch(function (error) {
        // handle error
        console.log(error);
        this.$toast.error('Problemas para eliminar la rutina')
      })
    },
    countWithLike(description) {
      return axios
      .get(`${basePath}/api/routines/count/${description}`, config)
      .then((response) => response.data)
      .catch(function (error) {
        // handle error
        console.log(error);
        this.$toast.error('Problemas para contar las rutinas')
      })
    },
    getExamgroupsViewList() {
      return axios
      .get(`${basePath}/api/examgroup/view/0`, config)
      .then((response) => response.data)
      .catch(function (error) {
        // handle error
        console.log(error);
        this.$toast.error('Problemas para obtener el grupo de rutinas')
      })
    },
  }
}

export default routinesMixin