# Preguntas Pendientes (Intersección con Entidades Externas)

Las siguientes preguntas fueron catalogadas tras el cierre exhaustivo front-end (inspección de 97 componentes Vue y extracción unida de los 18 mixins e inspección de sus 164 endpoints de Axios):

## Frontend - Backend (Resolubilidad Restringida)
* **Testing en flujos vitales Incompletos CATCH**: ¿Los endpoints de facturación de recibos (`invoiceMixin.js` y `Caja`) procesan transacciones de manera "sucia" (dirty reads)? El frontend utiliza popups locales pero no implementa compensación. ¿Compensa / hace rollback el backend si un mixin suelta un reject intermedio en aprobaciones por lotes?
* **XSS y Sanamiento**: El front-end inyecta a través de 17 etiquetas crudas `<span v-html="xxx">` variables provenientes de la API en `Exams` y `dragableComponent`. El backend ¿aplica DOMPurify profundo sobre las variables inyectadas durante la manipulación de resultados antes de grabarlas?
* **Paginación Mixins**: Varias rutas, como iteraciones cruzadas por `dates`, ¿escalarán sin colapsar el payload si Vue tiene que renderizarlos todos dentro de Options API local?

## Operación de Seguridad
* `Vue.prototype.$user` inicializa un cliente con un ID quemado `clientId`. ¿Estos son datos de ambiente de prueba o productivos persistentes?

## Impresión y Socket
* Aunque el Router y utilidades locales preparan visualmente el espacio, ¿cuándo se dispara una invalidación 403 directa de token si un Webhook asíncrono o correo reacciona desde una vista lejana en tiempo real? No hay interceptor en `axios` que prevenga que se mantenga el usuario logueado pero mudo.

