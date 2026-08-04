export default {
  isTokenExpired(token) {
    if (!token) return true
    const decodedToken = this.parseJwt(token)
    if (!decodedToken) return true
    if (!decodedToken.exp) return true
    const expirationTime = decodedToken.exp * 1000
    const currentTime = new Date().getTime()
    return currentTime > expirationTime
  },
  parseJwt(token) {
    try {
      return JSON.parse(atob(token.split('.')[1]))
    } catch (error) {
      return null
    }
  },
}