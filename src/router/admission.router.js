import { authGuard } from '@/auth/authGuard'

const PatientAdmission = () => import('@/views/modules/PatientAdmission.vue')
const Worksheet = () => import('@/views/modules/PatientWorksheet.vue')

const View404 = () => import('@/views/View404.vue')
const meta = {layout: 'SuiteLayout', title: 'Ingreso de pacientes', insideModule: true }
const routes = [
    {
        path: '',
        name: 'PatientAdmission',
        component: PatientAdmission,
        beforeEnter: authGuard,
        meta: {
            ...meta,
        }
    },
    {
        path: '/worksheet',
        name: 'Worksheet',
        component: Worksheet,
        meta: {
            ...meta,
        }
    },
]

export default routes