# Flujos Funcionales (Reconstrucción Definitiva)

Basados en la lectura unificada de los 97 componentes, vistas, mixins, y las 33 rutas registradas:

## Login y Logout
* **Ruta**: `/login` (Renderizado mediante `BlankLayout`).
* **Vista**: `Login.vue`. Lanza POST `/api/users/session` delegando a `loginMixin.js`.
* **Logout**: Ausente como vista/ruta. Delega limpieza en componentes padre (`SuiteLayout.vue`) vaciando `localStorage`. 
* **Efectos Secundarios**: Sobrescritura pura de Storage sin control Vuex consistente. 

## Módulo de Admisión y Registro de Pacientes
* **Ruta**: `/admission` -> `/admission/`
* **Layout**: `SuiteLayout` + `PatientAdmissionLayout`.
* **Componentes Anidados (Paciente)**: `PatientAdmission.vue` renderiza `InformationPatiente.vue` donde se inserta el `pacientsMixin.js`. El CRUD transacciona en `/api/patients/`.
* **Selección de Exámenes y Pago**: Dentro del mismo Admission, `SelectExams.vue` consume listas (`examsListMixin.js`) y `TypePayment.vue` (`TypePaymentMixin`). Todo esto se consolida de una forma local sin delegar estado padre.

## Módulo Historial, Edición de Resultados y PDF
* **Flujos**: 
  * Historial Central: `/history` maneja búsquedas, vista de lista (`ExamViewList.vue`) y acceso individual al paciente. 
  * Captura de Resultados: `/history` lanza `ExamEdit.vue` o `ExamGlobal.vue` cargando `groupHTMixin` y realizando peticiones al endpoint `api/groupHtItems/`.
  * PDF/Impresión: Existen rutas directas de exportación (`/email`) y componentes como `PrintReceipt.vue`, `PrintSpecialTest.vue`.

## Aprobación y Anulación
* **Flujo**: `/approve` con `PatientApprove.vue`.
* Aprobaciones delegadas con peticiones al array de pacientes en estado "pendiente" en `pacientsMixin.js` (`/api/patients/dateresult/`).

## Módulo Financiero (Caja, Cuentas por Cobrar, Facturación)
* **Facturas**: Se resuelven en `/movements/invoice` (InvoiceMovements) pidiendo recibos (`invoiceMixin.js` -> `/api/invoice/`).
* **Caja**: Ruta `/movements/cash`, vista `ClosesCash.vue`.
* **Cuentas por Cobrar**: Ruta `/movements/accounts-receivable` y vista de cancelación (`CancelAccountsReceivable.vue`).
* **Riesgo asociado**: Este flujo usa endpoints que cruzan estados visuales frágiles (Si ocurre un re-render durante `ClosesCash.vue`, se pierde el query del `cashRegisterMixins` ya que no usan store Vuex para persistencia de la query actual).

## Módulo Configuración Médica
* **Rutas Hijas bajo `/setting`**: `/setting/antibiotic`, `/setting/germs`, `/setting/parasitic`, `/setting/routines`, `/setting/specialtests`. 
* Todos son CRUD paralelos donde la complejidad reside en el gran número de Vistas diferentes, que aunque repetitivas en su patrón (Data Table -> Modal -> Axios Mixin), implican una ventana de error muy grande por copy-paste.

## Riesgos y Conclusiones de Migración
- **Riesgo Funcional**: Muy Alto. El sistema depende de 17 contenedores Axios separados (MIXINS).
- **Riesgo Migratorio Front**: Extremadamente Alto si se opta por un Big Bang. Strangler Fig posee limitaciones técnicas altas ya que compilar la actual SPA particionada requeriría arquitecturas de Micro-Frontends e Iframes que el actual Vue CLI Router no soporta nativamente. 
- **Verificación Backend**: Queda estrictamente pendiente validar si las promesas no resueltas de pago y anulación dejan al backend inconsistente al omitir un "Rollback" si falla el HTTP en lote.

