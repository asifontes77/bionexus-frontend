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

const pacientsMixin = {
    methods: {
        getPatientLists() {
            return axios
            .get(`${basePath}/api/patients`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener la lista de pacientes')
            })
        },
        getPatient(id) {
            return axios
            .get(`${basePath}/api/patients/${id}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener el paciente')
            })
        },
        getPatientOrder(id) {
            return axios
            .get(`${basePath}/api/patients/idorder/${id}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener el paciente')
            })
        },
        getPatientForCi(ci) {
            return axios
            .get(`${basePath}/api/patients/ci/${ci}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener el paciente')
            })
        },
        getClients(id) {
            return axios
            .get(`${basePath}/api/client/${id}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener el paciente')
            })
        },
        getClientList() {
            return axios
            .get(`${basePath}/api/client/`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener el cliente')
            })
        },
        getPatientsWithClient(clientIds) {
            return axios
            .post(`${basePath}/api/exams/client/`, clientIds, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener los exámenes por cliente')
            })
        },
        getPatientsWithClientTax(clientIds) {
            return axios
            .post(`${basePath}/api/exams/clienttax/`, clientIds, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener el impuesto del cliente')
            })
        },
        getTotalPatientsMonth(query) {
            return axios
            .post(`${basePath}/api/patients/totalmonth/`, query, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener la lista de pacientes')
            })
        },
        setNewPatient(newPatient) {
            return axios
            .post(`${basePath}/api/patients/`, newPatient, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para registrar el paciente')
            })
        },
        insertNewInvoice(newInvoice) {
            return axios
            .post(`${basePath}/api/invoice/`, newInvoice, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para registrar la factura del paciente')
            })
        },        
        getInvoiceNo(no_invoice) {
            return axios
            .get(`${basePath}/api/invoice/no/${no_invoice}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener la factura')
            })
        },
        insertNewInvoiceItem(item) {            
            return axios
            .post(`${basePath}/api/invoiceitems/`, item, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener los items de la factura')
            })
        },
        setwayPay(newwayPay) {
            return axios
            .post(`${basePath}/api/waypay/`, newwayPay, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para registrar forma de pago')
            })
        },
        getPatientsWithQueries(query) {
            return axios
            .post(`${basePath}/api/patients/querieslist/`, query, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener la lista de pacientes')
            })
        },
        getPatientsWithQueriesTotal(query) {
            return axios
            .post(`${basePath}/api/patients/queriestotal/`, query, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener los totales por pacientes')
            })
        },
        setNewWayPay(newWayPay) {
            return axios
            .post(`${basePath}/api/waypayitems/`, newWayPay, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener los items de la forma de pago')
            })
        },
        getPatientsTotals(fechaActual) {
            return axios
            .get(`${basePath}/api/patients/total/${fechaActual}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener los totales por pacientes')
            })
        },
        createPatientPosition(patientId, total) {
            return axios
            .patch(`${basePath}/api/patients/${patientId}`, total, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener el paciente')
            })
        },
        getPatientPosition(patientId) {
            return axios
            .get(`${basePath}/api/patients/position/${patientId}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener la posición del paciente')
            })
        },
        getPatientVoucher(patientId) {
            return axios
            .get(`${basePath}/api/patients/voucher/${patientId}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener la factura del pacientes')
            })
        },
        getIncreaseInvoice() {
            return axios
            .get(`${basePath}/api/laboratory/1`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener información del laboratorio')
            })
        },
        increaseInvoice(changes) {
            return axios
            .patch(`${basePath}/api/laboratory/1`, changes, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para registrar información del laboratorio')
            })
        },       
        createInvoiceNo(id, changes) {
            return axios
            .patch(`${basePath}/api/invoice/${id}`, changes, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener factura')
            })
        },
        updatePatient(id, changes) {
            return axios
            .patch(`${basePath}/api/patients/${id}`, changes, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para registrar información del paciente')
            })
        },
        setNewExamsPatient(newExam) {
            return axios
            .post(`${basePath}/api/exams/`, newExam, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para registrar exámenes del paciente')
            })
        },
        putNumbersInvoices(patientId, change) {
            return axios
            .patch(`${basePath}/api/patients/${patientId}`, change, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para registrar el paciente')
            })
        },
        getVoucherFormat(id) {
            return axios
            .get(`${basePath}/api/laboratory/${id}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log('hay error: ',error);
                this.$toast.error('Problemas para obtener información del laboratorio')
            })
        },
        changeInvoiceTotals(totales, invoiceId) {
            return axios
            .patch(`${basePath}/api/invoice/${invoiceId}`, totales, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para registrar información de la factura')
            })
        },
        getInvoice(id) {
            return axios
            .get(`${basePath}/api/invoice/${id}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener información de la factura')
            })
        },
        getPatientById(id) {
            return axios
            .get(`${basePath}/api/patients/${id}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener información del paciente')
            })
        },
        getPatientList(admission_date) {
            return axios
            .get(`${basePath}/api/patients/date/${admission_date}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener información del paciente')
            })
        },
        getPatientsDateOrder(admission_date) {
            return axios
            .get(`${basePath}/api/patients/dateorder/${admission_date}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener información del paciente')
            })
        },
        getPatientsDateResult(admission_date) {
            return axios
            .get(`${basePath}/api/patients/dateresult/${admission_date}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener información del paciente')
            })
        },
        getPatientsWithInvoice(admission_date) {
            return axios
            .post(`${basePath}/api/patients/invoicelist`, admission_date, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener la lista de facturas del paciente')
            })
        },
        getPatientsIdResult(id) {
            return axios
            .get(`${basePath}/api/patients/idresult/${id}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener información del paciente')
            })
        },
        getPatientIdValidatedResult(id) {
            return axios
            .get(`${basePath}/api/patients/validresult/${id}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener información del paciente')
            })
        },

        getPatientsDateGroupResult(admission_date) {
            return axios
            .get(`${basePath}/api/patients/dateresult-group/${admission_date}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener información del paciente')
            })
        },        
        getPatientsDateWorksheetResult(admission_date) {
            return axios
            .get(`${basePath}/api/patients/worksheet/${admission_date}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener información del paciente')
            })
        },
        getPatientResultsDatesApproved(admission_date) {
            return axios
            .get(`${basePath}/api/patients/approved/${admission_date}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener de la lista de pacientes aprobados')
            })
        },
        getExamsPatient(id) {
            return axios
            .get(`${basePath}/api/exam/list-patient/${id}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener de la lista de exámenes por pacientes')
            })
        },
        getExamItem(id) {
            return axios
            .get(`${basePath}/api/exam/exam/${id}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener el examen')
            })
        },
        getExamFormat(exam_id) { 
            return axios
            .get(`${basePath}/api/examlists/${exam_id}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener de la lista de exámenes')
            })
        },
        setUpdateExam(id, changes) {
            return axios
            .patch(`${basePath}/api/exams/${id}`, changes, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener el examen')
            })
        },
        getProcessed(id) {
            return axios
            .get(`${basePath}/api/users/${id}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log(error);
                this.$toast.error('Problemas para obtener el usuario')
            })
        },
        enviarCorreo(id) {
            return axios
            .get(`${basePath}/api/patients/mailer/${id}`, config)
            .then((response) => response.data)
            .catch(function (error) {
                // handle error
                console.log('error de carga')
                console.log(error);
                this.$toast.error('Problemas para obtener el correo del paciente')
            })
        },
        generatePdfFromHtmlOut(id, name) {
            const configPdf = config
            configPdf.responseType = 'blob'
            return axios
            .get(`${basePath}/api/patients/pdf/${id}`, configPdf)
            .then((response) => {
                // Crear un enlace para descargar el archivo
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', name); // Nombre del archivo
    
                // Añadir el enlace al documento y simular el clic para iniciar la descarga
                document.body.appendChild(link);
                link.click();
    
                // Eliminar el enlace del DOM
                document.body.removeChild(link);
            })
            .catch(function (error) {
                // handle error
                console.log('error de carga')
                console.log(error);
                this.$toast.error('Problemas para generar el PDF del paciente')
            })
        }
    }
}

export default pacientsMixin