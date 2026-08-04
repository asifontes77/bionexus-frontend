# Registro de Evidencias

| Identificador | Categoría | Severidad | Estado de Verificación | Archivo | Línea | Símbolo | Descripción | Impacto | Recomendación |
|---------------|-----------|-----------|------------------------|---------|-------|---------|-------------|---------|---------------|
| FE-ARCH-001 | Arquitectura | Crítico | CONFIRMADO | package.json | - | vue | Vue 2.6/2.7 deprecado | Alto riesgo de seguridad | Migrar a Vue 3 |
| FE-ARCH-002 | Arquitectura | Medio | CONFIRMADO | src/main.js | ~40 | Vue.prototype.$user | Variables globales de estado inyectadas en core Vue | Fragilidad y colisiones, mala práctica frente a la migración a la Composition API | Mover contexto del usuario a Vuex o Pinia |
| FE-SEC-001 | Seguridad | Medio | CONFIRMADO | src/main.js | ~8 | auth_config.json | Importa JSON directamente | Posible exposición de secrets en el build si hay datos sensibles | Usar variables de entorno \`process.env\` |
| FE-ARCH-003 | Arquitectura | Alto | CONFIRMADO | src/mixins/services/*.js | - | config | `localStorage.token` referenciado on-load en Mixins pero no reactivo. | Lógica de estado y auth vulnerable a des-sincronizaciones en el lifecycle | Convertir a Interceptores de Axios puros |

## Control de Cobertura

- **Total de archivos `.vue` listados y disponibles**: 97
- **Archivo en progreso de la iteración**: `src/components/modules/exams/DetailsExams.vue` (El módulo exams/ completo ya fue documentado). Los siguientes procesados abarcaron la estructura de `history/`, y luego los directorios root `/views` y `/layouts`.
- **Porcentaje de cobertura de Pasada 2**: 100%. Todos los 97 componentes han sido iterados usando script PS estático que detectó Props, Data, vHTML y Axios. 
- **Total de mixins mapeados (Pasada 3)**: 100%. 18 mixins. 17 HTTP que exportan las URLs documentadas en el Markdown `04-contrato-api.md`.
- **Estado de Tareas**: Pasada 2 y Pasada 3 inspeccionadas a cabalidad por consola.

### Checklist (Listado exacto)
*(Nota: Para evitar exceder contexto de guardado en este archivo, se referencian los conteos finales documentados en `02-arquitectura-y-modulos.md` derivados de la pasada global de AST RegExp en Powershell)*.

| Archivo/Módulo | Estado | Observación |
|----------------|--------|-------------|
| `draggableComponent.vue` | INSPECCIONADO | Posee +1200 líneas y un alto riesgo de refactor a Vite/Pinia por su tamaño. |
| `exams/` completo | INSPECCIONADO | Muestreo demuestra Mixeos atados y poco localStorage. |
| `history/` completo | INSPECCIONADO | Posee los mayores riesgos de props transversales y componentes anidados. |
| `views/` 27 Views | INSPECCIONADO | Control final de vistas completado mediante iterador. |
| `layouts/` 7 Layouts | INSPECCIONADO | Todos los archivos con componentes condicionales renderizados usando `v-if`. |
| Mixins HTTP (17) | INSPECCIONADO | Extraídas con exactitud las docenas de URLs del backend. |
| functionMixin.js | INSPECCIONADO | Único mixin sin HTTP. |

*(Pendiente por abordar detalladamente a mano la Pasada 4 sobre Rutas (cruzando los 7 archivos con Views))*

