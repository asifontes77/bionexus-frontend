# Calidad del Código y Deuda Técnica

## Deuda Técnica, Componentes Monolíticos y Bloqueos de Migración

* **97 Componentes Vue localizados.** Inspeccionados íntegramente de manera procedimental.
* Se hallaron 17 usos crudos de `v-html` dentro de los componentes. Esto constituye un riesgo alto para ataques XSS si el backend no higieniza exhaustivamente las cadenas de origen.
* Existen 56 referencias directas a `localStorage`. (Cero de SessionStorage).

### Aspectos Críticos Identificados
1. **Componentes Monolíticos**: Sobresale `draggableComponent.vue` con 1216 líneas de código dentro de la sub-carpeta de Exámenes. Además `EditExamDialog.vue` (290), `Exam125` (733 líneas), y `Exams122` (573 líneas) demuestran falta total de segregación de UI.
2. **Abuso de Mixins como Servicios HTTP**: Habiendo 17 mixins de peticiones separadas, cada componente importa entre 3 a 5 mixins. Esto genera el "Callback Hell de Props de Mixins", donde rastrear colisiones y mutaciones stateful se torna un reto abismal. Además los catch globales no están encapsulados provocando "silencios y pop-ups huérfanos".
3. **Bloqueos Específicos para Vite & Vue 3**:
   - `Vuetify 2.x` acopla visualmente los 97 componentes bajo sintaxis que fue depreciada en Vuetify 3 (`v-data-table` en Vuetify 3 altera las `slots` y render loops). Su refactor sería titánico.
   - Migrar a `PrimeVue` o `Quasar` requeriría tirar 100% de la capa de interfaz. 
   - La persistencia descansa sobre variables quemadas en export (Ej `Vue.prototype.$user`).
   
### Recomendación Directa
La refactorización progresiva en el modelo actual requerirá: **Estabilizar Antes de Migrar**.
Significa remover antes a los mixins transformándolos a composables puros en Vue 2.7 o a Vanilla JS Files y aislar los estados reactivos, luego saltar a Vite sin salir de Vue 2.7, y por último planificar la reescritura hacia Vue 3 + Vuetify/PrimeVue. Reescritura Total desde 0 sobre un monolito acoplado con riesgo clínico puede salir catastróficamente mal. 

- Desacoplar los Mixins en utilidades `async`/`await` JS Puras (servicios `axios`).
- Modernizar a Vue 3 / Composition API para un mejor aislamiento transversal.
