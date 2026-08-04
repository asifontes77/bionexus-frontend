# Pruebas y Regresión

## Estado actual de Testing
No se hallaron dependencias de tests unitarios (Jest/Vitest/Mocha) en `/package.json`.
El proyecto carece de configuración (archivos spec.js, test.js o carpeta `tests`).
La cobertura actual es Inexistente (`0%`).

## Matriz Minima de Regresión Obligatoria 

Se requiere diseñar un conjunto agresivo E2E (Ej. Cypress / Playwright) previo a mover el stack debido a la criticidad acoplada del front-end. Los flujos MÍNIMOS a proteger (y que interactúan con `localStorage` y `mixins` delicados simultaneamente) son:

1. **Login y Autenticación de Token Invalido**: Probar expiración emulada con `tokenUtils.js` -> 401 redirect a `/login`.
2. **Flujo de Admisión y Registro (PatientAdmission)**: Probar que un formulario de paciente nuevo dispare correctamente la amalgama de 5 Mixins distintos (exige Mockear base de datos clínica de Germenes - `groupHtMixin`).
3. **Flujo Financiero Crítico**: (PrintReceipt & InvoiceDialog) -> Verificar la cancelación de cuentas por cobrar para prevenir huecos inflacionarios en caja. 
4. **Prueba de Macros Visuales**: El render del componente `draggableComponent.vue` al interactuar masivamente con las tablas (`v-html`). Cuidado con inyecciones XSS en el arrastre virtual.

