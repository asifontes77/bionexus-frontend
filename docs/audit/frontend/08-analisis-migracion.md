# Análisis de Migración (Fallo de Hitos y Bloqueos Identificados)

## Evaluaciones Técnicas

### 1. Migrar Directamente a Vue 3 + Vuetify 3 (Big Bang)
**Beneficios**: LTS oficial. Composition API. Desempeño.  
**Riesgos**: CRÍTICOS. La dependencia total a Vuetify 2 renderizando Tablas nativas impactadas por el EOL es un "Breaking Change" total sobre ~90+ componentes. Destruiría los subflujos en `exams/`.
**Riesgo Específico**: `draggableComponent.vue` colapsaría al no operar más bajo el ciclo de vida del Options API.

### 2. Migrar de Vue Router / Vuex a Pinia.
**Recomendado**: Sí pero aplazado a una Fase 3 (ver Plan). Existe limitadísimo uso estricto global del `store.js` actual porque todos los mixins confían netamente en guardar sobre `localStorage`. Re-mapear eso sería complejo pero curativo.

### 3. Mantener Vue 2.7 y Desacoplar (Temporario / Viable)
**Beneficios**: Estabilidad controlada. Habilita una pre-migración de la Composition API sin fracturar el DOM UI. Solucionará el dolor latente de los 17 Mixins anidados.  
**Bloqueos Reales Detectados**: 
- Estructura `webpack` en vue.config.
- `vue-html-to-paper` probablemente carezca de TS definitions.

## Estrategia Seleccionada
**ESTABILIZAR ANTES DE MIGRAR.**
La estrategia Strangler Fig requerirá crear un proxy reverso o micro-frontends porque actualmente la configuración de Vue Router empuja todo los assets en un único index.html. El sobrecosto operativo frente a estabilizar Mixins debería descartarlo por defecto.

