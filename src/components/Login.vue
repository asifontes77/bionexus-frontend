<template>
   <v-app style="width: 100vw" >
      <v-main>
         <v-container fluid fill-height>
            <v-layout align-center justify-center>
               <span class="bg"></span>
               <v-flex xs12 sm8 md4>
                  <v-card v-if="!invalidLicense" class="elevation-12">
                     <v-toolbar dark color="primary">
                        <v-toolbar-title>Inicie sesión en su cuenta para continuar.</v-toolbar-title>
                     </v-toolbar>
                     <v-card-text>
                        <v-text-field
                           v-model="username"
                           label="Coloque nombre de usuario"
                           type="text"
                           placeholder="Ingresar nombre de usuario"
                           required
                           @keydown.space.prevent
                        />
                        <v-text-field
                           v-model="password"
                           label="Contraseña"
                           type="password"
                           placeholder="Contraseña"
                           required
                        />
                        <div class="secondary--text" v-if="error">Nombre de usuario o contraseña INCORRECTA!</div>
                        <v-btn class="mt-4" color="primary" @click="login()">Iniciar sesión</v-btn>
                     </v-card-text>
                  </v-card>
                  <v-card v-else color="cardhome" dark class="elevation-12">
                     <v-card-title class="text-h6">
                        Problema con la licencia de su sistema...
                     </v-card-title>
                     <v-card-text>
                        Solicite la llave de su licencia
                        <v-text-field
                           v-model="newLicense"
                           label="Coloque la llave de la licencia"
                           type="text"
                           placeholder="Ingresa...."
                        />
                        <v-btn class="mt-4" color="primary" @click="setLicense()">registrar</v-btn>
                     </v-card-text>
                  </v-card>
               </v-flex>
            </v-layout>
         </v-container>
      </v-main>
   </v-app>
 </template>
 
 <script>
 import auth from '@/logic/auth'
 import laboratoryMixin from '@/mixins/services/laboratoryMixin'
 export default {
   name: "Login",
   mixins: [laboratoryMixin],
   data() {
     return {
       username: '',
       password: '',
       error: false,
       invalidLicense: false,
       newLicense: '',
     }
   },
   methods: {
      async login() {
         const filter = {
            username: this.username.toLowerCase(),
            password: this.password,
         }
         const response = await auth.login(filter)
         console.log('response: ', response)
         if (response === undefined) {
            this.error = true
         } else {
            if (response.hasOwnProperty('response')) {
               if (response.response === 'INVALID_LICENSE_KEY') {
                  this.invalidLicense = true
               } else {
                  this.error = true
               }
            } else {
               await auth.setToken(response)
               location.reload()
            }            
         }
         const snackbar = {
            visible: false,
            color: 'info',
            type: 'info',
            text: null,
            timeout: 5000,
            multiline: false,
            icon: 'mdi-information',
         }
         localStorage.setItem('snackbar', JSON.stringify(snackbar))
      },
      async setLicense() {
         const newChange = {
            license: this.newLicense,
         }
         const result = await this.updateLaboratory(1, newChange)
         if (result) {
            window.location.reload()
         }
      },
   },
 }
 </script>
<style scoped>
.bg {
   background: url(../assets/toro.svg) no-repeat center center;
   background-size: 50%;
   background-color: var(--v-bluebackground-base);
   transform: scale(1.1);
   width: 100%;
   height: 100%;
   position: absolute;
   top: 0;
   left: 0;
}
</style>