<template>
    <div v-if="dataLaboratory" style="width: 100%">
        <v-card outlined>
            <v-card-text>
                <v-row>
                    <v-col cols="12" sm="6">
                        <v-text-field
                            v-model="dataLaboratory.business_name"
                            label="Razón Social"
                            placeholder="Escriba razón social"
                            outlined
                            dense
                            maxlength="100"
                            :rules="rulesBlank"
                        />
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-text-field
                            v-model="dataLaboratory.name"
                            label="Nombre"
                            placeholder="Escriba nombre"
                            outlined
                            dense
                            maxlength="50"
                            :rules="rulesBlank"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12" sm="6">
                        <v-textarea
                            v-model="dataLaboratory.address"
                            label="Domicilio"
                            placeholder="Escriba domicilio"
                            outlined
                            rows="3"
                            row-height="25"
                            maxlength="200"
                            :counter = 200
                            :rules="rulesBlank"
                        />
                        <v-text-field
                            v-model="dataLaboratory.email"
                            label="Dirección de correo"
                            placeholder="Escriba dirección de correo"
                            outlined
                            dense
                            maxlength="100"
                            :rules="rulesEmail"
                            type="email"
                        />
                        <v-text-field
                            v-model="dataLaboratory.url"
                            label="Ubicación página web"
                            placeholder="Escriba ubicación página web"
                            outlined
                            dense
                            maxlength="100"
                        />
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-text-field
                            v-model="dataLaboratory.rif"
                            label="Registro fiscal"
                            placeholder="Escriba registro fiscal"
                            outlined
                            dense
                            maxlength="20"
                            :rules="rulesBlank"
                        />
                        <v-text-field
                            v-model="dataLaboratory.phone_1"
                            label="Teléfono (1)"
                            placeholder="Escriba teléfono"
                            v-mask="dataLaboratory.mask_phone"
                            outlined
                            dense
                            maxlength="20"
                            :rules="rulesBlank"
                        />
                        <v-text-field
                            v-model="dataLaboratory.phone_2"
                            label="Teléfono (2)"
                            placeholder="Escriba teléfono"
                            v-mask="dataLaboratory.mask_phone"
                            outlined
                            dense
                            maxlength="20"
                        />
                        <v-card color="cardhome" dark>
                            <v-card-text class="pb-0">
                                Licencia
                            </v-card-text>
                            <v-card-title class="pt-0 text-h6">
                                {{ dataLaboratory.license }}
                            </v-card-title>
                        </v-card>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
        <v-card v-if="settingQR" outlined class="mt-4">
            <v-card-text>
                <v-row>
                    <v-col cols="12" sm="6">
                        <v-switch
                            v-model="settingQR.activeQR"
                            label="Activar QR"
                        />
                        <canvas
                            v-if="settingQR.activeQR"
                            ref="qrCanvas"
                            width="200"
                            height="200"
                        />
                    </v-col>
                    <v-col v-if="settingQR.activeQR" cols="12" sm="6">
                        <v-text-field
                            v-model="settingQR.fn"
                            label="Nombre de contacto"
                            placeholder="Escriba nombre de contacto"
                            outlined
                            dense
                        />
                        <v-text-field
                            v-model="settingQR.email"
                            label="Correo de contacto"
                            placeholder="Escriba correo de contacto"
                            outlined
                            dense
                            :rules="rulesEmail"
                            type="email"
                        />
                        <v-text-field
                            v-model="settingQR.phone"
                            label="Teléfono de contacto"
                            placeholder="Escriba teléfono"
                            v-mask="dataLaboratory.mask_phone"
                            outlined
                            dense
                            maxlength="15"
                            :rules="rulesBlank"
                        />
                        <v-text-field
                            v-model="settingQR.bioanalista"
                            label="Nombre de bioanalista responsable"
                            placeholder="Escriba nombre"
                            outlined
                            dense
                            clearable
                            clear-icon="mdi-close-circle"
                            @click:clear="clearMessage('bioanalista')"
                        />
                        <v-text-field
                            v-model="settingQR.codigo"
                            label="Número de permiso sanitario de bioanalista responsable"
                            placeholder="Escriba código"
                            outlined
                            dense
                            clearable
                            clear-icon="mdi-close-circle"
                            @click:clear="clearMessage('codigo')"
                        />
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
        <v-card outlined class="mt-4">
            <v-card-text>
                <v-row>
                    <v-col cols="12" sm="6">
                        <v-text-field
                            v-model="dataLaboratory.mask_phone"
                            label="Máscara de teléfono"
                            placeholder="Escriba máscara de teléfono"
                            outlined
                            dense
                            maxlength="20"
                            :rules="rulesBlank"
                        />
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
import QRCode from 'qrcode'

export default {
    name: 'GeneralLaboratory',
    props: {
        dataLaboratory: {
            type: Object,
            default: () => ({})
        },
    },
    data() {
        return {
            marker: true,
            vCardData: '',
            settingQR: null,
            personalData: {
                fn: 'Laboratorio Toro',
                email: 'correo@example.com',
                phone: '+56984550830',
                bioanalista: 'Ana Rosa',
                codigo: '22-55555-89',
            },        
            rulesBlank: [
                v => !!v || 'Información es requerido',
            ],
            rulesEmail: [
                v => !!v || 'E-mail es requerido',
                v => /^(([^<>()[\]\\.,;:\s@']+(\.[^<>()\\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v) || 'El email debe ser válido',
            ],
        }
    },
    watch: {
        settingQR: {
            deep: true,
            handler() {
                this.renderQRCode()
            }
        }
    },
    computed: {
        generatevCardData() {
            const telefono = this.settingQR.phone.replace(new RegExp(' ', 'g'), '')
            let datosQR = `BEGIN:VCARD\nVERSION:3.0\nFN:${this.settingQR.fn}\nORG:${this.settingQR.fn}\nTEL:${telefono}\nEMAIL:${this.settingQR.email}`
            if (this.settingQR.bioanalista !== '') {
                datosQR += `\nBIOANALISTA:${this.settingQR.bioanalista}\nCODIGO:${this.settingQR.codigo}`
            }
            datosQR += `\nEND:VCARD`
            return datosQR
        },
    },
    async mounted() {
        this.settingQR = await this.dataLaboratory.settingQR
        if (this.settingQR) {
            if (this.settingQR.fn === '') this.settingQR.fn = this.dataLaboratory.name
            if (this.settingQR.phone === '') this.settingQR.phone = this.dataLaboratory.phone_1
            if (this.settingQR.email === '') this.settingQR.email = this.dataLaboratory.email
        }
    },
    methods: {
        async renderQRCode() {
            if (!this.settingQR || !this.settingQR.activeQR) return

            await this.$nextTick()

            if (!this.$refs.qrCanvas) return

            try {
                await QRCode.toCanvas(this.$refs.qrCanvas, this.generatevCardData, {
                    width: 200
                })
            } catch (error) {
                console.error('No se pudo generar el codigo QR.', error)
            }
        },
        clearMessage (type) {
            if (type === 'bioanalista') this.settingQR.bioanalista = ''
            if (type === 'codigo') this.settingQR.codigo = ''
        },
    },
}
</script>
