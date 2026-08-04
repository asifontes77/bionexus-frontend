const { defineConfig } = require('@vue/cli-service')
const path = require('path')
const fs = require('fs')

module.exports = defineConfig({
  transpileDependencies: [
    'vuetify'
  ],
  devServer: {
    https: {
      key: fs.readFileSync('local.key'),
      cert: fs.readFileSync('local.crt'),
    },
    // COMENTARIO EXPLICATIVO: 
    // Cambiamos el host de la IP fija del servidor anterior ('192.168.100.32') 
    // a 'localhost' para que corra de manera local en tu laptop.
    // host: '192.168.100.32', // <-- ANTERIOR (IP fija del servidor de red)
    host: 'localhost',         // <-- NUEVO (Entorno local)

    port: 8080,

    // COMENTARIO EXPLICATIVO: 
    // El proxy redirige las peticiones que hace la interfaz hacia el backend. 
    // Actualizamos la URL para que apunte al puerto 3000 de tu máquina local.
    // proxy: 'https://192.168.100.32:3000', // <-- ANTERIOR
    proxy: 'https://localhost:3000'         // <-- NUEVO
  }
})