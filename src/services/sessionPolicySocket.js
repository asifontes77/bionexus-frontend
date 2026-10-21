import { io } from 'socket.io-client'
import { resolveSocketNamespace } from '@/api/apiUrl'

let socket = null
let policyHandler = null

export function connectSessionPolicySocket(token, onPolicy) {
  disconnectSessionPolicySocket()
  if (typeof token !== 'string' || token.trim() === '') return
  policyHandler = typeof onPolicy === 'function' ? onPolicy : null
  socket = io(resolveSocketNamespace('/session-policy'), {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000
  })
  socket.on('session-policy.updated', (payload) => policyHandler?.(payload))
}

export function disconnectSessionPolicySocket() {
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
  }
  socket = null
  policyHandler = null
}
export function getSessionPolicySocketId() {
  return socket?.connected && typeof socket.id === 'string' ? socket.id : ''
}
