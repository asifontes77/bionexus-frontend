<template>
  <div>
    <v-row>
      <v-col cols="12" sm="8">
        <v-card
          elevation="2"
          color="sidebarlite"
          class="mt-4"
        >
          <v-card-title class="justify-space-between">
            {{ itemEdit.name }}
            <v-icon color="primary">mdi-pencil</v-icon>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="white">
            <v-form
              ref="form"
              v-model="valid"
              lazy-validation
            >
            <v-text-field
              v-model="itemEdit.name"
              dense
              outlined
              :rules="nameRules"
              label="Nombre completo"
              placeholder="Escriba"
              :counter="100"
              maxlength="100"
              required
            />
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="itemEdit.user_name"
                  dense
                  outlined
                  :rules="nameUserRules"
                  label="Nombre usuario"
                  placeholder="Escriba"
                  :counter="20"
                  maxlength="20"
                  required
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="itemEdit.telephone"
                  v-mask="maskPhone"
                  label="Teléfono"
                  placeholder="Escriba"
                  maxlength="20"
                  outlined
                  dense
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="itemEdit.email"
                  dense
                  outlined
                  :rules="rulesEmail"
                  label="E-mail"
                  placeholder="Escriba"
                  :counter="100"
                  maxlength="100"
                  required
                />
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="roles"
                  :items="listRoles"
                  outlined
                  chips
                  label="Roles"
                  multiple
                  dense
                ></v-select>
              </v-col>
            </v-row>
            <v-textarea
              v-model="itemEdit.direction"
              outlined
              rows="3"
              :rules="rulesDirection"
              :counter="100"
              maxlength="100"
              label="Dirección"
              required
            />
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="itemEdit.position"
                  dense
                  outlined
                  :rules="rulesPosition"
                  label="Cargo"
                  placeholder="Escriba"
                  :counter="50"
                  maxlength="50"
                  required
                />
              </v-col>
              <v-col cols="6">
                <v-switch
                    v-if="itemEdit.id !== -1"
                    v-model="changePassword"
                    label="Cambiar contraseña"
                    class="mt-0"
                    @change="activePassword"
                />
                <div v-if="changePassword">
                  <v-text-field
                    v-model="password"
                    type="password"
                    label="Contraseña"
                    placeholder="Escriba su contraseña...."
                    :rules="passwordRules"
                    outlined
                    dense
                    maxlength="500"
                  />
                  <v-text-field
                    v-model="confirmPassword"
                    type="password"
                    label="Repita contraseña"
                    placeholder="Escriba su contraseña...."
                    :rules="confirmPasswordRules"
                    outlined
                    dense
                    maxlength="500"
                    class="mt-2"
                  />
                </div>
              </v-col>
            </v-row>
            <v-divider class="mb-4"></v-divider>
            <v-row>
              <v-col cols="6">
                <div
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
                      <v-btn icon color="primary" @click="changeImg('icon')">
                          <v-icon>
                              mdi-circle-edit-outline
                          </v-icon>
                      </v-btn>
                  </div>
                </div>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="itemEdit.college_number"
                  dense
                  outlined
                  label="Nº de colegiatura"
                  placeholder="Escriba"
                  :counter="50"
                  maxlength="50"
                  required
                />
                <v-switch
                    v-if="itemEdit.id !== -1"
                    v-model="changeSignature"
                    label="Cambiar clave de firma"
                    class="mt-0"
                    @change="activeSignature"
                />
                <div v-if="changeSignature">
                  <v-text-field
                    v-model="claveSignature"
                    type="password"
                    label="Clave de firma"
                    placeholder="Escriba su clave...."
                    :rules="claveRules"
                    outlined
                    dense
                    maxlength="500"
                  />
                  <v-text-field
                    v-model="confirmSignature"
                    type="password"
                    label="Repita clave de firma"
                    placeholder="Escriba su clave...."
                    :rules="confirmSignatureules"
                    outlined
                    dense
                    maxlength="500"
                    class="mt-2"
                  />
                </div>
                <div
                  class="d-flex justify-center mb-6"
                  style="position: relative;"
                >
                  <div>
                      <v-img
                          aspect-ratio="1"
                          :src="`${imgSignature}`"
                          :lazy-src="`${imgSignature}`"
                          width="150"
                          class="img-style-signature"
                      />
                  </div>
                  <div class="btn-position-signature">
                      <v-btn icon color="primary" @click="changeImg('signature')">
                          <v-icon>
                              mdi-circle-edit-outline
                          </v-icon>
                      </v-btn>
                  </div>
                </div>
              </v-col>
            </v-row>
            </v-form>
            <input ref="fileInput" class="d-none" type="file" @change="onFileChange" />
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="$emit('close-model')">Cancelar</v-btn>
            <v-btn text :disabled="!valid" color="primary" @click="acceptEdit()">Aceptar</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
<script>
  import laboratorioMixin from '@/mixins/services/laboratoryMixin'
  import usersMixin from '@/mixins/services/usersMixin'
  import { basePath } from '@/config';

  export default {
    name: 'UserEdit',
    mixins: [laboratorioMixin, usersMixin],
    props: {
      itemEditTmp: {
        type: Object,
        default: () => ({})
      },
    },
    data() {
      return {
        basePath,
        itemEdit: this.itemEditTmp,
        valid: false,
        roles: [],
        listRoles: [
          'admin',
          'annular',
          'user',
        ],
        nameRules: [
          v => !!v || 'Nombre es requerido',
          v => (v && v.length <= 100) || 'debe tener menos de 100 caracteres.',
        ],
        nameUserRules: [
          v => !!v || 'Nombre usuario es requerido',
          v => (v && v.length <= 100) || 'debe tener menos de 100 caracteres.',
        ],
        rulesEmail: [
          v => !!v || 'E-mail es requerido',
          v => /^(([^<>()[\]\\.,;:\s@']+(\.[^<>()\\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v) || 'El email debe ser válido',
        ],
        rulesDirection: [
          v => !!v || 'Dirección es requerido',
          v => (v && v.length <= 100) || 'debe tener menos de 100 caracteres.',
        ],
        rulesPosition: [
        v => !!v || 'Cargo es requerido',
          v => (v && v.length <= 50) || 'debe tener menos de 50 caracteres.',
        ],
        passwordRules: [
          v => !!v || 'La contraseña es obligatoria',
          v => (v && v.length >= 6) || 'La contraseña debe tener al menos 6 caracteres',
        ],
        
        claveRules: [
          v => !!v || 'La clave es obligatoria',
          v => (v && v.length >= 6) || 'La clave debe tener al menos 6 caracteres',
        ],
        confirmPasswordRules: [
          v => !!v || 'Debes confirmar tu contraseña',
          v => (v === this.password) || 'Las contraseñas no coinciden',
        ],
        confirmSignatureules: [
          v => !!v || 'Debes confirmar tu clave de firma',
          v => (v === this.claveSignature) || 'Las claves no coinciden',
        ],
        maskPhone: '+58 #### ### ####',        
        imgUser: null,       
        imgSignature: null,
        formData: null,
        formDataSignature: null,
        selectedFile: '',
        selectedFileSignature: '',
        password: '',
        confirmPassword: '',
        claveSignature: '',
        confirmSignature: '',
        changePassword: false,
        changeSignature: false,
        type: '',
      }
    },
    watch: {
      'roles': {
        handler(value) {
          this.itemEdit.roles = ''
          if (value.length !== 0) {
            value.forEach(element => {
              if (this.itemEdit.roles.length !== 0) this.itemEdit.roles += ','
              this.itemEdit.roles += element
            })
          }
        }
      },
    },
    async mounted() {
      await this.getLaboratoryData()
      this.putData()
      this.$refs.form.validate()
    },
    methods: {
      async getLaboratoryData() {
        const result = await this.getUniqueLabData(1)
        if (result) {
          this.maskPhone = result.mask_phone
        }
      },
      putData() {
        if (this.itemEdit.roles.length !== 0) {
          this.roles = this.itemEdit.roles
        }
        if (this.itemEdit.id === -1) {          
          this.changePassword = true
        }
        this.imgUser = `${this.basePath}/images/${this.itemEdit.url_photo}`
        this.imgSignature = `${this.basePath}/images/${this.itemEdit.url_signature}`
      },
      onFileChange(e) {
        if (this.type === 'icon') {
          this.selectedFile = e.target.files[0];
          this.imgUser = URL.createObjectURL(this.selectedFile)
        } else {
          this.selectedFileSignature = e.target.files[0];
          this.imgSignature = URL.createObjectURL(this.selectedFileSignature)
        }
      },
      changeImg(type) {
        this.type = type
        if (type === 'icon') {
          this.$refs.fileInput.click()
          this.formData = new FormData();
          this.formData.append("file", this.selectedFile);
        } else {
          this.$refs.fileInput.click()
          this.formDataSignature = new FormData();
          this.formDataSignature.append("file", this.selectedFileSignature);
        }
      },
      async acceptEdit() {
        if (this.selectedFile) {
          const formData = new FormData()
          formData.append("file", this.selectedFile)
          const result = await this.sendUserImageFile(formData)
          this.itemEdit.url_photo = result
        }
        if (this.selectedFileSignature) {
          const formData = new FormData()
          formData.append("file", this.selectedFileSignature)
          const result = await this.sendUserImageFile(formData)
          this.itemEdit.url_signature = result
        }
        if (this.changePassword) this.itemEdit.password = this.password
        if (this.confirmSignature) this.itemEdit.passwordSignature = this.claveSignature
        this.$emit('accept-edit', this.itemEdit)
      },
      activePassword() {
        this.$refs.form.validate()
      },
      activeSignature() {
        this.$refs.form.validate()
      }
    },
  }
</script>
<style scoped>
.img-style {
    border: 2px solid var(--v-sidebar-base);
    border-radius: 50%;
}
.img-style-signature {
    border: 2px solid var(--v-sidebar-base);
    height: 100px;
    width: 250px;
}
.btn-position {
    position: absolute;
    bottom: 0;
    right: 160px;
}
.btn-position-signature {
  position: absolute;
  bottom: 0;
  right: 140px;
}
</style>
