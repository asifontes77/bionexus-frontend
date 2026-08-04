# Arquitectura y Módulos

## Entry Point
- Inicialización en `src/main.js`.
- Inicialización principal con Vue 2 y plugins globales como `v-mask`, `vue-html-to-paper`, `vue-toast-notification` y un usuario precargado en `$user` hardcodeado (riesgo arquitectónico alto al bypassar vuex state en bootstrap).

## Estructura de Directorios (Inspeccionado)
* `/src/assets`: Estilos CSS y logos.
* `/src/auth`: Contiene `authGuard.js` el cual chequea manualmente `localStorage.getItem('token')` pero sufre de un bug de validación asíncrona porque confía en localStorage y un decodificador síncrono.
* `/src/components`: 62 Componentes Vue de diversos tamaños. Se encontraron monstruos arquitectónicos (`draggableComponent.vue` con +1200 líneas lo que indica un componente sobre-acoplado de frontend monolítico y cero separación de dominios).
* `/src/layouts`: 7 plantillas renderizadas condicionalmente por el router.
* `/src/logic`: `auth.js` donde recae todo el parseo destructivo duro del usuario dentro del localstorage.
* `/src/mixins`: 18 Mixins hallados. 17 atados fuertemente a HTTP (`Axios`) y 1 de utilidades `functionMixin.js`.
* `/src/router`: 7 archivos JS totalizando 33 rutas.
* `/src/store`: 4 módulos Vuex cargados mediante root state.
* `/src/views`: 27 vistas padre.

## Sesión y Seguridad Angular (Confirmado Front-end)
* Todo el core de login empuja campos sensibles visualmente quemados a Storage (`token`, `clientId`, `telephone`, `email`, `roles`).
* El Vuex root muta `setClient`.
* El `localStorage` no es limpiado ni revocado con interceptores automatizados sino en componentes sueltos (Riesgo Crítico frente a tokens vencidos retenidos).
