import { authGuard } from '@/auth/authGuard'

const PatientHistory = () => import('@/views/modules/PatientHistory.vue')
const ResultsByEmail = () => import('@/views/modules/ResultsByEmail.vue')
const SpecialTestResults = () => import('@/views/modules/SpecialTestResults.vue')
const View404 = () => import('@/views/View404.vue')
const meta = {layout: 'SuiteLayout', title: 'Historia de pacientes', insideModule: true }
const routes = [
    {
        path: '',
        name: 'PatientHistory',
        component: PatientHistory,
        beforeEnter: authGuard,
        meta: {
            ...meta,
        }
    },
    {
        path: '/email',
        name: 'ResultsByEmail',
        component: ResultsByEmail,
        beforeEnter: authGuard,
        meta: {
            ...meta,
        }
    },
    {
        path: '/special',
        name: 'SpecialTestResults',
        component: SpecialTestResults,
        beforeEnter: authGuard,
        meta: {
            ...meta,
        }
    },
]

export default routes