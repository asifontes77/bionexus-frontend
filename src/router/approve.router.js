import { authGuard } from '@/auth/authGuard'

const PatientApprove = () => import('@/views/modules/PatientApprove.vue')
const meta = {layout: 'SuiteLayout', title: 'Aprobar pacientes', insideModule: true }
const routes = [
    {
        path: '',
        name: 'PatientApprove',
        component: PatientApprove,
        beforeEnter: authGuard,
        meta: {
            ...meta,
        }
    },
]

export default routes