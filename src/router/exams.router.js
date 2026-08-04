import { authGuard } from '@/auth/authGuard'

const ExamsList = () => import('@/views/modules/ExamsList.vue')
const meta = {layout: 'SuiteLayout', title: 'lista de exámenes', insideModule: true }
const routes = [
    {
        path: '',
        name: 'ExamsList',
        component: ExamsList,
        beforeEnter: authGuard,
        meta: {
            ...meta,
        }
    },
]

export default routes