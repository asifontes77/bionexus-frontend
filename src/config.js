// COMENTARIO EXPLICATIVO:
// Se actualiza la ruta base de la API para que el cliente busque al backend 
// en el servidor local en lugar de intentar conectar a la IP de la red vieja.

// export const basePath = 'https://192.168.100.32:3000'; // <-- ANTERIOR
export const basePath = 'https://localhost:3000';         // <-- NUEVO