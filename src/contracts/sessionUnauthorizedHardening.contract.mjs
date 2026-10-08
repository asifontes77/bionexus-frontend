import { readFileSync } from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

const main = readFileSync('src/main.js', 'utf8')
const lifecycle = readFileSync('src/components/session/SessionLifecycle.vue', 'utf8')
const apiClient = readFileSync('src/api/apiClient.js', 'utf8')

test('un fallo transitorio de autorizacion inicial no limpia una sesion vigente', () => {
  assert.doesNotMatch(main, /authorizationStore\.loadContext\(\)\.catch[\s\S]*?sessionStore\.clear\(\)/)
})

test('un fallo generico al renovar no se trata automaticamente como vencimiento real', () => {
  assert.doesNotMatch(lifecycle, /catch\s*\{\s*await expireSession\(\)\s*\}/)
})

test('Unauthorized correlaciona el 401 con el token usado por la solicitud', () => {
  assert.match(apiClient, /requestToken/)
  assert.match(apiClient, /currentToken/)
  assert.match(apiClient, /requestToken\s*!==\s*currentToken/)
  assert.match(apiClient, /detail:\s*\{[^}]*path[^}]*requestToken/)
})