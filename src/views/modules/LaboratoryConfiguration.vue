<template>
  <v-container pa-0 fluid fill-height class="align-start">
    <div class="d-flex justify-space-between sidebar" style="width: 100%">
        <div class="px-6 py-4 text-h6 primary--text">
            Datos de laboratorio
        </div>
        <div class="px-6 py-4 text-h6">
            <v-btn
                color="primary"
                outlined @click="setLaboratory()"
            >
                registrar
            </v-btn>
        </div>
    </div>
    <v-progress-linear v-if="activeProgress" indeterminate color="primary" />
    <div class="pa-6" style="width: 100%; height: calc(100vh - 134px); overflow-x: hidden; overflow-y: auto">
        <v-tabs
            v-model="tabL"
            color="primary"
        >
            <v-tab
                v-for="item in itemsTab"
                :key="item.text"
            >
            <v-icon color="secondary" left>{{ item.icon }}</v-icon>
                {{ item.text }}
            </v-tab>
            <v-tab-item>
                <div class="pa-6" style="width: 100%">
                    <image-laboratory v-if="dataLaboratory" :data-laboratory="dataLaboratory" />
                </div>
            </v-tab-item>
            <v-tab-item>
                <div class="pa-6" style="width: 100%">
                    <general-laboratory
                        v-if="dataLaboratory"
                        :data-laboratory="dataLaboratory"
                    />
                </div>
            </v-tab-item>
            <v-tab-item>
                <div class="pa-6" style="width: 100%">
                    <billing-laboratory
                        v-if="dataLaboratory"
                        :data-laboratory="dataLaboratory"
                        :data-tax="dataTax"
                        @add-tax="addTax()"
                        @delete-tax="activeDeleteTax"
                    />
                </div>
            </v-tab-item>
            <v-tab-item>
                <div class="pa-6" style="width: 100%">
                    <send-email v-if="dataLaboratory" :data-laboratory="dataLaboratory" />
                </div>
            </v-tab-item>
        </v-tabs>
        <v-alert
            :value="activeAlert"
            color="error"
            dark
            icon="mdi-alert-circle"
            transition="scale-transition"
            class="mx-6"
        >
            <div
                v-for="(item, index) in textAlert"
                :key="index"
            >
                {{ item }}
            </div>
        </v-alert>
    </div>
  </v-container>
</template>

<script>
import laboratoryMixin from '@/mixins/services/laboratoryMixin'
import ImageLaboratory from '@/components/modules/setting/ImageLaboratory.vue'
import GeneralLaboratory from '@/components/modules/setting/GeneralLaboratory.vue'
import BillingLaboratory from '@/components/modules/setting/BillingLaboratory.vue'
import SendEmail from '@/components/modules/setting/SendEmail.vue'
export default {
    components: { ImageLaboratory, GeneralLaboratory, BillingLaboratory, SendEmail },
    name: 'LaboratoryConfiguration',
    mixins: [laboratoryMixin],
    data() {
        return {
            activeProgress: false,
            tabL: 0,
            activeAlert: false,
            textAlert: [],
            itemsTab: [
                {text: 'Logo', icon: 'mdi-image-area'},
                {text: 'General', icon: 'mdi-hospital-building'},
                {text: 'Factura / Toma de muestra', icon: 'mdi-receipt-text-outline'},
                {text: 'Envío por correo', icon: 'mdi-email-fast-outline'}
            ],
            saveLoad: false,
            dataLaboratory: null,
            dataTax: null,
        }
    },
    async mounted() {
      await this.getDataLaboratory()
      this.getDataTax()
    },
    methods: {
        async getDataTax() {
            const result = await this.getTaxs()
            if (result) {
                this.dataTax = result
            }
        },
        async getDataLaboratory() {
            const result = await this.getLaboratorySetting()
            this.dataLaboratory = result
            console.log('this.dataLaboratory: ', this.dataLaboratory)
        },
        async setLaboratory() {
            if (this.changeValid()) {
                this.activeProgress = true
                const dataLaboratoryTmp = JSON.parse(JSON.stringify(this.dataLaboratory))
                console.log('dataLaboratoryTmp: ', dataLaboratoryTmp)
                const id = dataLaboratoryTmp.id
                delete dataLaboratoryTmp.id
                await this.updateLaboratory(id, dataLaboratoryTmp)
                this.activeProgress = false
            }
            this.setTax()
        },
        async setTax() {
            await this.asyncForEach(this.dataTax, async (item) => {
                const changes = JSON.parse(JSON.stringify(item))
                const id = changes.id
                delete changes.id
                if (id === -1) {
                    await this.createTax(changes)
                } else {
                    await this.updateTax(id, changes)
                }                
            })
        },
        async asyncForEach(array, callback) {
            for (let index = 0; index < array.length; index++) {
                await callback(array[index], index, array);
            }
        },
        changeValid() {
            let valid = true
            this.textAlert = []
            this.activeAlert = false
            if (this.dataLaboratory.business_name === '') {
                valid = false
                this.textAlert.push('Razón social no puede quedar en blanco')
            }
            if (this.dataLaboratory.name === '') {
                valid = false
                this.textAlert.push('Nombre de laboratorio no puede quedar en blanco')
            }
            if (this.dataLaboratory.address === '') {
                valid = false
                this.textAlert.push('Domicilio no puede quedar en blanco')
            }
            if (this.dataLaboratory.email === '') {
                valid = false
                this.textAlert.push('Correo no puede quedar en blanco')
            }
            if (this.dataLaboratory.rif === '') {
                valid = false
                this.textAlert.push('RIF no puede quedar en blanco')
            }
            if (this.dataLaboratory.phone_1 === '') {
                valid = false
                this.textAlert.push('Teléfono (1) no puede quedar en blanco')
            }
            if (this.dataLaboratory.mask_phone === '') {
                valid = false
                this.textAlert.push('Máscara de teléfono no puede quedar en blanco')
            }
            if (!valid) {
                this.activeAlert = true
                setInterval(() => {
                    this.activeAlert = false
                }, 10000);
            }
            return valid
        },
        async activeDeleteTax(id, index) {
            if (id !== -1) {
                await this.deleteTax(id)
            }
            this.dataTax.splice(index, 1)
            this.$emit('delete-tax', index)
        }, 
        async addTax() {
            const newTax = {
                description: '**nuevo**',
                value: 0,
                only_dollars: 0,
                always_subtotal: 0,
            }
            const result = await this.createTax(newTax)
            if (result) {
                console.log('tax: ', result)
                this.dataTax.push(result)
            }
        },
    },
}
</script>
