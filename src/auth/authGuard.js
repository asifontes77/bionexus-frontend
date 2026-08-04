import { router } from '@/router'
import tokenUtils from '@/logic/tokenUtils'

export function authGuard(to, from, next) {
  if (localStorage.getItem('token')) {
    const verifyToken = tokenUtils.isTokenExpired(localStorage.getItem('token'))
    if (verifyToken) {
      next('/login')
    } else {
      next()
    }
  } else {
    next('/login')
  }
}
