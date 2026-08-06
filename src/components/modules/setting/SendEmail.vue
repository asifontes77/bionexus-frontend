<template>
  <div v-if="dataLaboratory" style="width: 100%">
    <v-card v-if="dataLaboratory.sendEmail" outlined>
        <v-card-text>
            <v-switch
                v-model="dataLaboratory.sendEmail.isGmail"
                label="El correo de envío es Gmail"
            />
            <v-row v-if="!dataLaboratory.sendEmail.isGmail">
                <v-col cols="12" sm="6">
                    <v-text-field
                        v-model="dataLaboratory.sendEmail.host"
                        label="Descripción de Host"
                        placeholder="Escriba host"
                        outlined
                        dense
                    />
                    <v-text-field
                        v-model="dataLaboratory.sendEmail.port"
                        label="Puerto"
                        placeholder="Escriba puerto"
                        outlined
                        type="number"
                        min="0"
                        dense
                    />
                    <v-checkbox
                        v-model="dataLaboratory.sendEmail.secure"
                        label="Es con SSL"
                    />
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" sm="6">
                    <v-text-field
                        v-model="dataLaboratory.sendEmail.user"
                        label="Nombre usuario"
                        placeholder="Escriba user"
                        outlined
                        dense
                    />
                    <v-text-field
                        v-model="dataLaboratory.sendEmail.pass"
                        label="Contraseña usuario"
                        placeholder="Escriba una nueva contrasena"
                        type="password"
                        hint="Dejela vacia para conservar la contrasena actual"
                        persistent-hint
                        outlined
                        dense
                    />
                    <v-text-field
                        v-model="dataLaboratory.sendEmail.from"
                        label="Dirigido por (from)"
                        placeholder="Escriba from"
                        outlined
                        dense
                    />
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
    name: 'SendEmail',
    props: {
        dataLaboratory: {
            type: Object,
            default: () => ({})
        },
    },
    async mounted() {
        let sendEmail = await this.dataLaboratory.sendEmail
        if (sendEmail === null) {
            sendEmail = {
                isGmail: true,
                host: '',
                port: null,
                secure: false,
                user: '',
                pass: '',
                from: '',
            }
        }
        this.dataLaboratory.sendEmail = sendEmail
    },
}
</script>
