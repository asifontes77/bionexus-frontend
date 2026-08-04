# Seguridad

## Autenticación
Existencia confirmada de una solución combinada con:
- Auth0 (`@auth0/auth0-spa-js`).
- Guards personalizados en `src/auth/authGuard.js`.
- Utilidades de token en `src/logic/tokenUtils.js`.

El AuthGuard sí interrumpe la progresión a rutas hijas mediante chequeo manual al localstorage. Sin embargo, su confiabilidad es estrictamente de "Control visual del Frontend", puesto que si se salta (faking el token), las llamadas de Mixin fallarán del lado del backend. Ningún componente interno limpia agresivamente el storage si hay un 401.

## Vulnerabilidades Detectadas
- **Tokens y Cabeceras en Memoria Interrumpida (Alto Riesgo)**: Los Mixins declaran `const config` global al archivo. Esto ocasiona que Vue capture el token inicial. Un logout no destruirá bien el acceso sin refrescar `window.location.reload` o sobreescribirlo reactivamente a través de un store (`Vuex`).
- **Almacenamiento Local Fuerte**: `localstorage` almacena datos crudos sensibles (roles, emails, telefono, nombre). 
- **Lectura de archivos JSON duros**: `auth_config.json` empaquetado directamente en el bundle web.
- **SSL Fijo Local**: Claves privadas hardcodeadas para desarrollo SSL locales dentro de `vue.config.js` (`fs.readFileSync('local.key')`).
- **XSS Vector**: 17 usos de `v-html`. Alta probabilidad de inyección si la información que entra como Prop desde Backend carece de filtrado.
