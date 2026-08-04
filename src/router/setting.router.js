import { authGuard } from '@/auth/authGuard'

const ExamsList = () => import('@/views/modules/ExamsList.vue')
const ExamsOrder = () => import('@/views/modules/ExamsOrder.vue')
const Antibiotic = () => import('@/views/modules/AntibioticConfiguration.vue')
const Germs = () => import('@/views/modules/GermsConfiguration.vue')
const Parasitic = () => import('@/views/modules/parasiticConfiguration.vue')
const Laboratory = () => import('@/views/modules/LaboratoryConfiguration.vue')
const RegisteredUsers = () => import('@/views/modules/RegisteredUsers.vue')
const WorkGroup = () => import('@/views/modules/WorkGroupConfiguration.vue')
const SpecialTests = () => import('@/views/modules/SpecialTestsConfiguration.vue')
const TypePayment = () => import('@/views/modules/TypePayment.vue')
const Routines = () => import('@/views/modules/RoutinesConfiguration.vue')
const meta = {layout: 'SuiteLayout', title: 'Configuración', insideModule: true }
const routes = [
    {
        path: 'exams',
        name: 'ExamsList',
        component: ExamsList,
        beforeEnter: authGuard,
        meta: {
            ...meta,
        }
    },
    {
        path: 'order',
        name: 'ExamsOrder',
        component: ExamsOrder,
        beforeEnter: authGuard,
        meta: {
            ...meta,
        }
    },
    {
        path: 'germs',
        name: 'Germs',
        component: Germs,
        beforeEnter: authGuard,
        meta: {
            ...meta,
        }
    },
    {
        path: 'antibiotic',
        name: 'Antibiotic',
        component: Antibiotic,
        beforeEnter: authGuard,
        meta: {
            ...meta,
        }
    },
    {
        path: 'parasitic',
        name: 'Parasitic',
        component: Parasitic,
        beforeEnter: authGuard,
        meta: {
            ...meta,
        }
    },
    {
        path: 'workgroup',
        name: 'WorkGroup',
        component: WorkGroup,
        beforeEnter: authGuard,
        meta: {
            ...meta,
        }
    },
    {
        path: 'specialtests',
        name: 'SpecialTests',
        component: SpecialTests,
        beforeEnter: authGuard,
        meta: {
            ...meta,
        }
    },
    {
        path: 'typepayment',
        name: 'TypePayment',
        component: TypePayment,
        beforeEnter: authGuard,
        meta: {
            ...meta,
        }
    },        
    {
        path: 'routines',
        name: 'Routines',
        component: Routines,
        beforeEnter: authGuard,
        meta: {
            ...meta,
        }
    },
    {
        path: 'users',
        name: 'Users',
        component: RegisteredUsers,
        beforeEnter: authGuard,
        meta: {
            ...meta,
        }
    },    
    {
        path: 'laboratory',
        name: 'Laboratory',
        component: Laboratory,
        beforeEnter: authGuard,
        meta: {
            ...meta,
        }
    },
]

export default routes