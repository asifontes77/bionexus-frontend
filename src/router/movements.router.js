import { authGuard } from '@/auth/authGuard'

const ClosesCash = () => import('@/views/modules/ClosesCash.vue')
const InvoiceMovements = () => import('@/views/modules/InvoiceMovements.vue')
const CancelAccountsReceivable = () => import('@/views/modules/CancelAccountsReceivable')
const MovementConsultation = () => import('@/views/modules/MovementConsultation.vue')
const AccountsReceivable = () => import('@/views/modules/AccountsReceivable.vue')
const RegisteredCustomers = () => import('@/views/modules/RegisteredCustomers.vue')
const meta = {layout: 'SuiteLayout', title: 'Configuración', insideModule: true }
const routes = [
  {
    path: 'cash',
    name: 'Cash',
    component: ClosesCash,
    beforeEnter: authGuard,
    meta: {
        ...meta,
    }
  },
  {
    path: 'invoice',
    name: 'issuedInvoices',
    component: InvoiceMovements,
    beforeEnter: authGuard,
    meta: {
        ...meta,
    }
  },
  {
    path: 'cancelinvoice',
    name: 'cancelAccountsReceivable',
    component: CancelAccountsReceivable,
    beforeEnter: authGuard,
    meta: {
        ...meta,
    }
  },  
  {
    path: 'consultation',
    name: 'consultation',
    component: MovementConsultation,
    beforeEnter: authGuard,
    meta: {
        ...meta,
    }
  },
  {
    path: 'accounts-receivable',
    name: 'accountsReceivable',
    component: AccountsReceivable,
    beforeEnter: authGuard,
    meta: {
        ...meta,
    }
  },
  {
    path: 'customers',
    name: 'registeredCustomers',
    component: RegisteredCustomers,
    beforeEnter: authGuard,
    meta: {
        ...meta,
    }
  },
  

]

export default routes