<template>
    <section class="fill-height">
        <v-app-bar
            v-if="users"
            app
            color="sidebar"
        >
            <div class="d-flex align-center">
                <v-img
                    alt="Toro Logo"
                    class="shrink mr-2"
                    contain
                    :src="require('@/assets/icon.png')"
                    transition="scale-transition"
                    width="40"
                />
            </div>
            <v-toolbar-title class="ml-6 primary--text">Sistema de Análisis Clínicos TORO</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        icon
                        color="primary"
                        v-bind="attrs"
                        v-on="on"
                        @click="toggleFullScreen"
                    >
                        <v-icon>
                            {{ isFullScreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen' }}
                        </v-icon>
                    </v-btn>
                </template>
                <span>{{ isFullScreen ? 'Salir de Pantalla Completa' : 'Activar Pantalla Completa'}}</span>
            </v-tooltip>
            <span class="secondary--text caption mr-4">{{ users.name }}</span>
            <v-menu
                v-model="menu"
                :close-on-content-click="false"
                :nudge-width="200"
                offset-x
            >
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        fab
                        dark
                        small
                        color="primary"
                        v-bind="attrs"
                        v-on="on"
                    >
                        <v-icon v-if="!users.url_photo">mdi-account</v-icon>
                        <v-img
                            v-else
                            class="img-photo"
                            :src="`${basePath}/images/${users.url_photo}`"
                        />
                    </v-btn>
                </template>
                <v-card color="sidebarlite">
                    <v-list color="primary">
                        <v-list-item>
                            <v-list-item-avatar>
                                <v-img
                                    class="border-img"
                                    :src="`${basePath}/images/${users.url_photo}`"
                                />
                            </v-list-item-avatar>
                            <v-list-item-content>
                                <v-list-item-title class="white--text">{{ users.name }}</v-list-item-title>
                                <v-list-item-subtitle class="white--text">{{ users.position }}</v-list-item-subtitle>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                    <v-list color="sidebarlite">
                        <v-list-item class="caption" style="min-height: 28px">Teléfono: {{ users.telephone }}</v-list-item>
                        <v-list-item class="caption" style="min-height: 28px">Correo: {{ users.email }}</v-list-item>
                    </v-list>
                    <v-card-text>
                        <v-btn outlined color="primary" @click="activeEditUsuer = !activeEditUsuer">
                            <v-icon color="secondary" left>
                                mdi-circle-edit-outline
                            </v-icon>
                            gestionar tu cuenta
                        </v-btn>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                            text
                            @click="menu = false"
                        >
                            Cancelar
                        </v-btn>
                        <v-btn
                            color="primary"
                            text
                            @click="logout"
                        >
                            Cerrar sesión
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-menu>
        </v-app-bar>
        <div class="d-flex">
            <dashboard :users="users" />
            <v-container pa-0 fluid fill-height class="d-flex">
                <router-view />
            </v-container>
        </div>
        <edit-user-dialog v-if="activeEditUsuer" v-model="activeEditUsuer" :id="users.id" @change-user="changeUser()"/>
    </section>
</template>

<script>
import Dashboard from '@/components/Dashboard.vue'
import loginMixin from '@/mixins/services/loginMixin'
import EditUserDialog from '@/components/modules/users/EditUserDialog.vue'
import { basePath } from '@/config';

export default {
    name: 'SuiteLayout',
    components: { Dashboard, EditUserDialog },
    mixins: [loginMixin],
    data() {
        return {
            basePath,
            menu: false,
            users: null,
            activeEditUsuer: false,
            isFullScreen: false,
        }
    },
    async mounted() {
        const id = localStorage.clientId
        this.users = await this.getLoginToclientId(id)
        if (!localStorage.token) {
            this.logout()
        } else {
            if (!this.verifyDates(localStorage.dateIn)) {
                this.logout()
            } 
        }
    },
    methods: {
        verifyDates(dateIn) {
            const fecha1 = new Date()
            const fecha2 = new Date(dateIn)
            const diferenciaEnMilisegundos = Math.abs(fecha2 - fecha1)
            if (diferenciaEnMilisegundos > 86400000) {
                return false
            }
            return true
        },
        logout() {
            localStorage.clear()
            const client = {
                  id: null,
                  name: '',
                  roles: '',
                  token: '',
                  college: '',
                  position: '',
                  photo: null,
                  telephone: '',
                  email: ''
               }
            this.$store.commit('setClient', client)
            this.$router.replace({name:'login'})
        },
        changeUser() {
            this.activeEditUsuer = false
            this.logout()
        },
        toggleFullScreen() {
            if (!document.fullscreenElement) {
                // Activar pantalla completa
                document.documentElement.requestFullscreen().then(() => {
                    this.isFullScreen = true;
                }).catch((err) => {
                    console.error(`Error al intentar activar pantalla completa: ${err.message}`);
                });
            } else {
                // Salir de pantalla completa
                document.exitFullscreen().then(() => {
                    this.isFullScreen = false;
                }).catch((err) => {
                    console.error(`Error al intentar salir de pantalla completa: ${err.message}`);
                });
            }
        }
    },
}
</script>
<style scoped>
.border-img {
    border: 1px solid gray;
}
.img-photo {
    border-radius: 50%;
    display: inline-flex;
    height: inherit;
    width: inherit;
    border: 1px solid gray;
    height: 40px; min-width: 40px; width: 40px;
}
</style>