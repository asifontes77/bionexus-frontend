<template>
  <v-dialog
        v-if="user"
        v-model="show"
        transition="dialog-top-transition"
        persistent
        max-width="600"
    >
        <v-card>
            <v-card-title class="text-h5 grey lighten-2">
                Gestionar tu cuenta
            </v-card-title>
            <v-card-text class="mt-4">
                <div
                    v-if="imgUser"
                    class="d-flex justify-center mb-6"
                    style="position: relative;"
                >
                    <div>
                        <v-img
                            aspect-ratio="1"
                            :src="`${imgUser}`"
                            :lazy-src="`${imgUser}`"
                            width="150"
                            class="img-style"
                        />
                    </div>
                    <div class="btn-position">
                        <v-btn icon color="primary" @click="changeImg()">
                            <v-icon>
                                mdi-circle-edit-outline
                            </v-icon>
                        </v-btn>
                    </div>
                </div>
                <v-text-field
                    v-model="user.name"
                    label="Su nombre"
                    placeholder="Escriba su nombre...."
                    outlined
                    dense
                    maxlength="100"
                    :rules="rulesBlank"
                />
                <v-text-field
                    v-model="user.user_name"
                    label="Su nombre de usuario"
                    placeholder="Escriba su nombre...."
                    outlined
                    dense
                    maxlength="100"
                    @keydown.space.prevent
                    :rules="rulesBlank"
                />
                <div v-if="errorTxt !== ''" class="ml-2 mt-n6 mb-2 caption error--text">
                    {{ errorTxt }}
                </div>
                <v-text-field
                    v-model="user.email"
                    label="Su correo"
                    placeholder="Escriba su correo...."
                    outlined
                    dense
                    maxlength="100"
                    :rules="rulesEmail"
                />
                <div class="ml-2 mt-n6">                    
                    <span v-if="activeVerifyEmail" class="caption error--text">El corre existe, cambie</span>
                </div>
                <v-switch
                    v-model="changePassword"
                    label="Cambiar contraseña"
                    class="mt-0"
                />
                <div v-if="changePassword" class="mb-6">
                    <v-row>
                        <v-col cols="6">
                            <v-text-field
                                v-model="newPassword1"
                                type="password"
                                label="Contraseña"
                                placeholder="Escriba su contraseña...."
                                outlined
                                dense
                                maxlength="500"
                                hide-details
                            />
                        </v-col>
                        <v-col cols="6">
                            <v-text-field
                                v-model="newPassword2"
                                type="password"
                                label="Repita contraseña"
                                placeholder="Escriba su contraseña...."
                                outlined
                                dense
                                maxlength="500"
                                hide-details
                            />
                        </v-col>
                    </v-row>
                    <div>
                        <span v-if="!passwordsMatch()" class="caption error--text">Las contraseñas no coinciden</span>
                        <span v-if="newPassword1 === ''" class="caption error--text">Las contraseñas no puede quedar en blanco</span>
                    </div>
                </div>
                <v-text-field
                    v-model="user.position"
                    label="Cargo"
                    placeholder="Escriba su cargo...."
                    outlined
                    dense
                    :rules="rulesBlankC"
                />
                <v-row>
                    <v-col cols="6">
                        <v-text-field
                            v-model="user.telephone"
                            v-mask="maskPhone"
                            label="Teléfono"
                            placeholder="Escriba su teléfono...."
                            outlined
                            dense
                            :rules="rulesBlankT"
                        />
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <div v-if="errorChange">
                    <v-icon color="error" left>mdi-alert-circle</v-icon>
                    <span class="caption error--text">Verificar problemas de datos</span>
                </div>
                <v-spacer></v-spacer>
                <div>
                    <v-btn
                        color="gray300"
                        text
                        @click="$emit('change-model',false)"
                    >
                        Cancelar
                    </v-btn>
                    <v-btn
                        color="primary"
                        text
                        @click="changeData()"
                    >
                        Aceptar
                    </v-btn>
                </div>
            </v-card-actions>
        </v-card>
        <input ref="fileInput" class="d-none" type="file" @change="onFileChange" />
    </v-dialog>
</template>

<script>
import loginMixin from '@/mixins/services/loginMixin'
import usersMixin from '@/mixins/services/usersMixin'
import laboratorioMixin from '@/mixins/services/laboratoryMixin'
import { basePath } from '@/config';

export default {
    name: 'EditUserDialog',
    mixins: [loginMixin, usersMixin, laboratorioMixin],
    model: {
        prop: 'show',
        event: 'change-model',
    },
    props: {
        show: {
            type: Boolean,
            default: false,
        },
        id: {
            type: Number,
            default: 1,
        }
    },
    data() {
        return {
            basePath,
            user: null,
            errorTxt: '',
            emailUser: '',
            imgUser: null,
            selectedFile: '',
            formData: null,
            newPassword1: '',
            newPassword2: '',
            changePassword: false,
            maskPhone: '',
            activeVerifyEmail: false,
            rulesEmail: [
                v => !!v || 'E-mail es requerido',
                v => /^(([^<>()[\]\\.,;:\s@']+(\.[^<>()\\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v) || 'El email debe ser válido',
            ],
            rulesBlank: [
                v => !!v || 'Nombre es requerido',
                v => (v && v.length <= 100) || 'El nombre debe tener menos de 100 caracteres',
            ],
            rulesBlankC: [
                v => !!v || 'Cargo es requerido',
                v => (v && v.length <= 100) || 'El nombre debe tener menos de 100 caracteres',
            ],
            rulesBlankT: [
                v => !!v || 'Cargo es requerido',
                v => (v && v.length <= 100) || 'El nombre debe tener menos de 100 caracteres',
            ],
            errorChange: false,
        }
    },
    async mounted() {
        await this.getUserData()
        const result = await this.getUniqueLabData(1)
        this.maskPhone = result.mask_phone
    },
    methods: {
        passwordsMatch() {
            return this.newPassword1 === this.newPassword2
        },
        async getUserData() {
            this.user = await this.getLoginToclientId(this.id)
            this.emailUser = JSON.parse(JSON.stringify(this.user.email))
            this.imgUser = `${this.basePath}/images/${JSON.parse(JSON.stringify(this.user.url_photo))}`
        },
        async changeData() {
            if (this.verifyData()) {
                const newChange = JSON.parse(JSON.stringify(this.user))
                if (this.selectedFile) {
                    const formData = new FormData()
                    formData.append("file", this.selectedFile)
                    const result = await this.sendUserImageFile(formData)
                    newChange.url_photo = result
                }
                delete newChange.id
                delete newChange.token
                delete newChange.password
                delete newChange.createdAt
                delete newChange.updatedAt
                if (this.changePassword) {
                    newChange.password = this.newPassword1
                }
                newChange.user_name = newChange.user_name.toLowerCase()
                console.log('newChange: ', newChange)
                const resultU = await this.changeUserById(this.user.id, newChange)
                if (resultU) {
                    const existeNombre = "response" in resultU
                    if (existeNombre) {
                        this.errorTxt = resultU.response
                        return
                    }
                    this.$emit('change-user')
                }
            } else {
                this.errorChange = true
            }
            
            
        },
        async verifyData() {
            let isTrue = true
            if (this.user.name === '') isTrue = false
            if (this.user.user_name === '') isTrue = false
            if (this.user.email === '') isTrue = false
            if (this.user.position === '') isTrue = false
            if (this.user.telephone === '') isTrue = false
            if (this.changePassword) {
                if (this.newPassword1 === '') isTrue = false
                if (!this.passwordsMatch()) isTrue = false
            }
            return isTrue
        },
        changeImg() {
            this.$refs.fileInput.click()
            this.formData = new FormData();
            this.formData.append("file", this.selectedFile);
        },
        onFileChange(e) {
            this.selectedFile = e.target.files[0];
            this.imgUser = URL.createObjectURL(this.selectedFile)
        },
    }
}
</script>
<style scoped>
.img-style {
    border: 2px solid var(--v-sidebar-base);
    border-radius: 50%;
}
.btn-position {
    position: absolute;
    bottom: 0;
    right: 180px;
}
</style>