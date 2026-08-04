# Resumen Ejecutivo

## Estado general
La aplicación frontend es una Single Page Application (SPA) transaccional compleja empresarial desarrollada inicialmente con Vue 2 y Vuetify 2. No usa en profundidad Vuex para el ciclo vital sino estado en LocalStorage. Contiene un problema fundamental de modularidad al enroscar cientos de llamadas a APIs dentro de "Mixins de Servicios".
Vue 2 alcanzó el final de su vida útil (EOL) en diciembre de 2023 y Vuetify 2 carece de ruta pasiva de Upgrade a Vue 3.

## Alcance analizado
Cobertura 100% Macro y Estructural:
- 97 archivos Vue.
- 18 mixins.
- 164 llamadas a endpoints HTTP identificadas y documentadas en URLs.
- Estructura `Router` (33 rutas controladas via Guard).
- Exposición de riesgos financieros cruzados y visuales.

## Limitaciones de la auditoría
- Las validaciones exactas frente a XSS no pueden comprobarse completamente sin la validación del Backend debido a las inyecciones de `v-html` en el frontend, y lo mismo aplica para los rollbacks de Cierres de Cajas.

## Riesgos críticos & altos
1. **Configuración HTTP con token capturado durante la inicialización (Alto)**: Provocará continuos errores 401 impredecibles por persistencia cruda en JS const.
2. **Archivos Monolíticos**: Componentes superando las +1200 líneas de código con lógica acoplada, arriesgando el testing de las configuraciones de los Exámenes. 
3. **Uso potencial de XSS via v-html (Sujeto a validación backend)**.

## Diez hallazgos principales
1. **[FE-ARCH-001]** Stack tecnológico basado en Vue 2.6.x (EOL).
2. **[FE-ARCH-002]** Inyección global manual (`Vue.prototype.$user`).
3. **[FE-ARCH-003]** Token de API atado permanentemente al arranque por falla de scope en Mixins.
4. **[FE-API-004]** 17 Mixins de Servicio que concentran y duplican llamadas HTTP..
5. **[FE-SEC-005]** LocalStorage (56 usos) Almacena en memoria persistente email, id de cliente y rol operativo, lo cual aumenta exposición local..
6. **[FE-VUE-006]** Enorme dificultad para migrar a Vuetify 3 (Cambios severos de Slots Data Tables).
7. **[FE-VUE-007]** `draggableComponent.vue` requiere separación URGENTE.
8. **[FE-SEC-008]** Rutas seguras están funcionales con `authGuard`, pero insuficientes sin un Interceptor 401 central.
9. **[FE-TEST-009]** Total ausencia (0%) configuraciones de testing en repo.
10. **[FE-MIG-010]** Patrón Strangler Fig requiere gran refactorización dado que la SPA se empaqueta en bundle único (implicaría IFrames o Server-Proxy-Routing para particionado).

## Recomendación final
**ESTABILIZAR ANTES DE MIGRAR.** 
Ejecutar una Fase táctica previa a cualquier Upgrade que unifique la refactorización de Mixins a puros "Vanilla JS APIs", remueva Vuetify de los componentes atascados, e instaure estado puro en Pinia/Vuex y no Storage. Reescritura parcial es peligrosa; Reescritura Total será incosteable sin estos pasos.

## Nivel de confianza de la auditoría
Alto (A nivel de Inventario exhaustivo y extracción estática en todo árbol).

