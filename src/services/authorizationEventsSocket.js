import { io } from 'socket.io-client'
let socket = null
export function connectAuthorizationEventsSocket(token, onUpdated) {
  disconnectAuthorizationEventsSocket()
  if (typeof token !== 'string' || token.trim() === '') return
  socket = io('/authorization-events', { auth: { token }, transports: ['websocket'], reconnection: true, reconnectionDelay: 1000, reconnectionDelayMax: 10000 })
  socket.on('authorization.updated', () => onUpdated?.())
}
export function disconnectAuthorizationEventsSocket() {
  if (socket) { socket.removeAllListeners(); socket.disconnect() }
  socket = null
}
