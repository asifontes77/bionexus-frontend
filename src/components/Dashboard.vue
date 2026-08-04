<template>
    <div class="fill-height">
        <v-navigation-drawer
            v-if="users"
            color="sidebar"
            permanent
            expand-on-hover
        >
            <v-list
                v-for="item in items"
                :key="item.title"
                dense
                nav
                class="py-0"
            >
                <v-list-item
                    v-if="(item.sons === 0)"
                    :disabled="verifyDisabled(item.role) ? false : true" 
                    class="hover-list"
                    @click="goRouter(item.link)"
                >
                    <v-list-item-icon>
                        <v-icon>{{ item.icon}}</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                </v-list-item>
                <v-list-group
                    v-else
                    :prepend-icon="item.icon"
                >
                    <template v-slot:activator>
                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                    </template>
                    <v-list-item
                        v-for="child in item.items"
                        :disabled="verifyDisabled(child.role) ? false : true"
                        :key="child.title"
                        class="hover-list ml-6"
                    >
                        <v-list-item-title
                            @click="goRouter(child.link)"
                        >
                            {{ child.title }}
                        </v-list-item-title>
                    </v-list-item>
                </v-list-group>
            </v-list>
        </v-navigation-drawer>
    </div>
</template>
    
<script>

export default {
    props: {
        users: {
            type: Object,
            default: () => ({})
        }
    },
    data () {
        return {
            items: [
                {
                    title: 'Inicio',
                    icon: 'mdi-home-variant-outline',
                    link: { name: 'home' },
                    sons: 0,
                    role: ['user', 'admin']
                },
                {
                    title: 'Historia',
                    icon: 'mdi-clipboard-text-clock-outline',
                    link: { name: 'PatientHistory' },
                    sons: 0,
                    role: ['user', 'admin']
                },
                {
                    title: 'Rutina diaria',
                    icon: 'mdi-account-switch',
                    link: { name: 'setting' },
                    sons: 1,
                    role: ['user', 'admin'],
                    items: [
                        {
                            title: 'Ingreso de pacientes',
                            link: { name: 'PatientAdmission' },
                            role: ['user', 'admin'],
                        },
                        {
                            title: 'Hoja de trabajo',
                            link: { name: 'Worksheet' },
                            role: ['user', 'admin'],
                        },
                        {
                            title: 'Aprobar resultados',
                            link: { name: 'PatientApprove' },
                            role: ['user', 'admin'],
                        },
                        {
                            title: 'Entrega resultados por email',
                            link: { name: 'ResultsByEmail' },
                            role: ['user', 'admin'],
                        },
                        {
                            title: 'Pruebas especiales',
                            link: { name: 'SpecialTestResults' },
                            role: ['user', 'admin'],
                        }
                    ]
                },
                {
                    title: 'Movimientos',
                    icon: 'mdi-receipt-text-check-outline',
                    link: { name: 'setting' },
                    sons: 1,
                    role: ['user', 'admin'],
                    items: [
                        {
                            title: 'Caja',
                            link: { name: 'Cash' },
                            role: ['admin'],
                        },
                        {
                            title: 'Consultas',
                            link: { name: 'consultation' },
                            role: ['admin'],
                        },
                        {
                            title: 'Cuentas por cobrar',
                            link: { name: 'accountsReceivable' },
                            role: ['admin'],
                        },
                        {
                            title: 'Cancelación cuentas por cobrar',
                            link: { name: 'cancelAccountsReceivable' },
                            role: ['admin'],
                        },
                        {
                            title: 'Facturas emitidas',
                            link: { name: 'issuedInvoices' },
                            role: ['admin'],
                        },
                        {
                            title: 'Clientes registrados',
                            link: { name: 'registeredCustomers' },
                            role: ['admin'],
                        }
                    ]
                },
                {
                    title: 'Configuración',
                    icon: 'mdi-tune',
                    link: { name: 'setting' },
                    sons: 1,
                    role: ['admin'],
                    items: [
                        {
                            title: 'Lista exámenes',
                            link: { name: 'ExamsList' },
                            role: ['admin'],
                        },
                        {
                            title: 'Ordenar exámenes',
                            link: { name: 'ExamsOrder' },
                            role: ['admin'],
                        },
                        {
                            title: 'Rutinas de exámenes',
                            link: { name: 'Routines' },
                            role: ['admin'],
                        },
                        {
                            title: 'Lista antibióticos',
                            link: { name: 'Antibiotic' },
                            role: ['admin'],
                        },
                        {
                            title: 'Lista germenes',
                            link: { name: 'Germs' },
                            role: ['admin'],
                        },
                        {
                            title: 'Formas parasitarias',
                            link: { name: 'Parasitic' },
                            role: ['admin'],
                        },
                        {
                            title: 'Grupo de hojas de trabajo',
                            link: { name: 'WorkGroup' },
                            role: ['admin'],
                        },
                        {
                            title: 'Pruebas especiales',
                            link: { name: 'SpecialTests' },
                            role: ['admin'],
                        },
                        {
                            title: 'Forma de pagos',
                            link: { name: 'TypePayment' },
                            role: ['admin'],
                        },
                        {
                            title: 'Usuarios',
                            link: { name: 'Users' },
                            role: ['admin'],
                        },
                        {
                            title: 'Laboratorio',
                            link: { name: 'Laboratory' },
                            role: ['admin'],
                        }
                    ]
                },
                {
                    title: 'Acerca de',
                    icon: 'mdi-help-circle',
                    sons: 0,
                    role: ['user', 'admin'],
                },
            ],
        }
    },
    computed: {
        layout() {
            return layouts['SuiteLayout']
        }
    },
    methods: {
        logout() {
            this.$router.replace({name:'login'})
        },
        verifyDisabled(role) {
            const roleUser = this.users.roles.split(',')
            let admit = false
            roleUser.forEach(role => {
                if (role.includes(role)) admit = true                
            })
            return admit
        },
        goRouter(link) {
            this.$router.push(link).catch(err => {
                if (err.name !== 'NavigationDuplicated') {
                    console.error(err);
                }
            })
        },
    },
}
</script>
<style scoped>
.fill-height {
    max-height: calc(100vh - 65px);
    height: calc(100vh - 65px);
    background-color: var(--v-sidebar-base);
}
.hover-list:hover {
    cursor: pointer;
    background-color: #E1D0A0;
}
</style>