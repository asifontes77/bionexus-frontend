# Plan Recomendado (Definitivo)

Al estar ante un sistema Vue 2 / Vuetify fuertemente entretejido a través de 17 HTTP Mixins paralelos y monolitos Vue en la construcción de historias clínicas:

## Recomendación Táctica Front-end
**ESTABILIZAR ANTES DE MIGRAR**. Reescritura parcial es peligrosa y un abordaje SPA global limita fuertemente la coexistencia.

## Fase 0: Pruebas Exploratorias No Regresivas y Blindaje E2E
* **Objetivo**: Asegurar un entorno de test automatizado E2E que grave los flujos clínicos vitales.

## Fase 1: Desacoplamiento de Lógica de Negocio HTTP (Mixins -> Composables)
* **Objetivo**: Abandono estricto de los `mixins` para peticiones Axios.
* **Tareas**: Traducir las 164 llamadas a Fetch/Axios en una capa `api/` o vanilla JS abstracta, solucionando la vulnerabilidad del header "config" estático dependiente de `localStorage` al arrancar.

## Fase 2: Configuración de Entorno (Vite o Vue 2.7)
* **Objetivo**: Abandono de secreto crudo `auth_config.json` e IP estática local al utilizar `process.env`. Upgrading a Vue 2.7 para beneficiarse en nativo de la Composition API sin romper `Vuetify 2`.

## Fase 3: Modernización Arquitectónica y Desplome de Monolitos
* **Objetivo**: Segregar al `draggableComponent.vue` de >1200 líneas y fraccionar los Layouts.

## Fase 4: Big Bang Controlado a Vue 3 / Vuetify 3 (Largo Plazo)
* **Objetivo**: Superada la Fase 2 y 3, migrar las etiquetas obsoletas hacia Vite completo y Vue 3 Composition API genuina.

