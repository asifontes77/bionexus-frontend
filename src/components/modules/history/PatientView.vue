<template>
    <v-row v-if="patient" class="mx-auto caption card-patient">
        <v-col cols="12" sm="3">
            <div class="d-flex" >
                <div class="font-weight-bold">
                    #&nbsp;{{ patient.id }}, Secuencia&nbsp;{{ patient.patient_position }}
                </div>
            </div>
            <div class="d-flex" >
                <div class="font-weight-bold">Edad:&nbsp;</div>{{ patient.age }} {{ patient.month_year }}, {{ patient.sex===0 ? 'femenino' : 'masculino' }}
            </div>
            <div class="d-flex" >
                <div class="font-weight-bold">Teléfono:&nbsp;</div>{{ patient.phone }}
            </div>
            <div class="d-flex" >
                <div class="font-weight-bold">C.I.:&nbsp;</div>{{ patient.document_number }}
            </div>
            <div class="d-flex" >
                <div class="font-weight-bold">Email:&nbsp;</div>{{ patient.email === '' ? '----' : patient.email }}
            </div>
        </v-col>
        <v-col cols="12" sm="3">
            <div class="d-flex" >
                <div class="font-weight-bold">Atendido:&nbsp;</div>{{ patient.attended }}
            </div>
            <div v-if="patient.canceled === 0" class="d-flex" >
                <div class="font-weight-bold">Entregado:&nbsp;</div>{{ patient.delivered }}
            </div>
            <div v-if="patient.canceled === 0" class="d-flex" >
                <div class="font-weight-bold">Fecha:&nbsp;</div>{{ formatDate(patient.deliver_date) }}
            </div>
            <div v-if="patient.canceled === 0" class="d-flex" >
                <div class="font-weight-bold">Recibido:&nbsp;</div>{{ patient.receive }}
            </div>
            <div v-if="patient.canceled === 1" class="d-flex" >
                <div class="font-weight-bold secondary--text">Anulado:&nbsp;</div><span class="secondary--text">{{ patient.user_canceled }}</span>
            </div>
        </v-col>
        <v-col cols="12" sm="3">
            <div class="d-flex" >
                <div class="font-weight-bold">Referido:&nbsp;</div>{{ patient.business_name }}
            </div>
            <div class="d-flex" >
                <div class="font-weight-bold">Factura #:&nbsp;</div>{{ patient.invoice }}
            </div>
            <div class="d-flex" >
                <div class="font-weight-bold">Total:&nbsp;</div>
                <div 
                    v-if="patient.total_no_dollars !== patient.total"
                >
                    &nbsp;$&nbsp;{{ formatNumber(patient.total) }}
                </div>
                <div v-else>
                    &nbsp;Bs.&nbsp;{{ formatNumber(patient.total_no_dollars) }}
                </div>
            </div>
            <div class="d-flex" >
                <div class="font-weight-bold">Pagado:&nbsp;</div>{{ formatNumber(patient.total_canceled) }}
            </div>
        </v-col>
        <v-col cols="12" sm="3">
            <div class="font-weight-bold">OBSERVACION:</div>
            <div v-if="patient.observation !== ''" class="caption font-italic">
                {{ patient.observation }}
            </div>
            <div v-else class="caption font-italic">
                Sin observación...
            </div>
        </v-col>
    </v-row>
</template>

<script>
import usersMixin from '@/mixins/services/usersMixin'
import functionMixin from '@/mixins/util/functionMixin'

export default {
    name: 'usersMixin',
    mixins: [ usersMixin, functionMixin ],
    props: {
        patient: {
            type: Object,
            default: () => {},
        },
    },
    watch: {
        'patient': {
          handler() {
            this.buscarCancelado()
          },
        },
    },
    computed: {
      height() {
        switch (this.$vuetify.breakpoint.name) {
          case 'xs': return 220
          case 'sm': return 400
          case 'md': return 500
          case 'lg': return 600
          case 'xl': return 800
        }
      },
    },
    mounted() {
        this.buscarCancelado()
    },  
    methods: {
        formatDate(newDate) {
            if (newDate) {
                return newDate.replace('T', ' ').substring(0, 16)
            }
            return ''
        },
        async buscarCancelado() {  
            if (this.patient) {
                if (this.patient.user_id_canceled !== 0) {
                    const result = await this.getUserById(this.patient.user_id_canceled)
                    this.patient.user_canceled = result.name
                } else {
                    this.patient.user_canceled = ''
                }
            }
        }
    },
}
</script>
<style scoped>
.card-patient {
    background-color: var(--v-sidebar-base);
    border-left: 1px solid #CDBE92;
    width:100%;
}
</style>