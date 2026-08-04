# Inventario Técnico

## Dependencias de Producción

| Nombre | Versión Declarada | Versión Resuelta | Riesgo de Reemplazo | Evidencia |
|--------|-------------------|------------------|---------------------|-----------|
| @auth0/auth0-spa-js | ^2.0.0 | 2.0.0 | Bajo | `package.json` |
| axios | ^1.1.3 | 1.7.5 | Bajo | `package.json` |
| core-js | ^3.8.3 | 3.26.1 | Bajo | `package.json` |
| node-cache | ^5.1.2 | 5.1.2 | Bajo | `package.json` |
| text-mask-addons | ^3.8.0 | 3.8.0 | Medio | Dependencias de máscaras pueden tener colisiones con Vue 3 |
| v-mask | ^2.3.0 | 2.3.0 | Medio | `package.json` |
| vue | ^2.6.14 | 2.7.14 | Alto | Requiere gran refactorización para Vue 3 |
| vue-drag-drop | ^1.1.4 | 1.1.4 | Medio | Comprobar soporte Vue 3 |
| vue-html-to-paper | ^1.0.2 | 1.0.2 | Medio | Comprobar soporte |
| vue-qr | ^4.0.9 | 4.0.9 | Bajo | `package.json` |
| vue-router | ^3.6.5 | 3.6.5 | Alto | `package.json` |
| vue-toast-notification | ^1 | 1.0.1 | Bajo | `package.json` |
| vue2-editor | ^2.10.3 | 2.10.3 | Alto | El nombre indica acoplamiento a Vue 2 |
| vuedraggable | ^2.24.3 | 2.24.3 | Medio | `package.json` |
| vuetify | ^2.6.0 | 2.6.12 | Muy Alto | Requiere migración a Vuetify 3 que tiene grandes roturas |
| vuex | ^3.6.2 | 3.6.2 | Alto | Migración recomendada a Pinia |

## Inventario Exacto

- **Total de archivos `.vue`**: 97
- **Total de archivos `.js`**: 35
- **Total de archivos `.ts`**: 0
- **Total exacto de vistas (`src/views`)**: 27
- **Total exacto de componentes (`src/components`)**: 62 
- **Total exacto de layouts**: 7
- **Total exacto root**: 1 (`src/App.vue`) - *(Aclaración matemática: 27 vistas + 62 componentes + 7 layouts + 1 root App = 97 archivos Vue comprobados)*.
- **Total exacto de mixins**: 18
- **Total exacto de routers**: 7 archivos `.js` definiendo rutas.
- **Total exacto de rutas declaradas**: 33 rutas.
- **Total exacto de llamadas HTTP**: 164 documentadas en inventario final de extractos URL.
- **Total exacto usos localStorage**: 56
- **Total exacto usos sessionStorage**: 0

*Nota: La data recolectada fue contada bajo inspección literal de terminal Powershell iterando recursivamente la extension.*

## Dependencias de Desarrollo
- @vue/cli-plugin-babel (5.0.8)
- @vue/cli-plugin-router
- @vue/cli-plugin-vuex
- @vue/cli-service
- sass (1.32.13)
- sass-loader (10.4.1)
- vue-cli-plugin-vuetify
- vue-template-compiler (2.7.16)
- vuetify-loader (1.9.2)

## Configuración y Entorno
- La aplicación usa Vue CLI (Webpack oculto).
- Configurado con proxy en `vue.config.js` hacia localhost:3000.

