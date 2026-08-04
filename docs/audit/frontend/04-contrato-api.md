# Contrato con el Backend (Inventario Definitivo)

Este inventario fue reconstruido extrayendo exhaustivamente (Pasada 3) los 17 Mixins HTTP mediante parseo Regex. 

## Endpoints por Mixin

### accountsreceivableMixin.js
* `POST|PATCH` -> `/api/accountsreceivable/`
* `PATCH` -> `/api/accountsreceivable/${id}`
* `POST` -> `/api/accountsreceivable/client-date`

### antibioticMixin.js
* `GET|POST|PATCH|DELETE` -> `/api/antibiotic`, `/api/antibiotic/order`, `/api/antibiotic/${id}`
* `GET` -> `/api/list-germs/list`, `/api/list-germs/${id}`

### cashRegisterMixins.js
* `GET|POST|PATCH` -> `/api/cash_register/`, `/api/cash_register/${id}`, `/api/cash_register/date`

### clientMixin.js
* `GET|POST` -> `/api/client/`, `/api/client/all`, `/api/client/${id}`

### examsListMixin.js *(Complejidad Alta)*
* `/api/examlists/group/${groupId}`
* `/api/examlists/${id}`
* `/api/examlists/search-description/${description}`
* `/api/tax/${id}`
* `/api/dollarvalue/get`
* `/api/examlists/new-costs`

### groupHTMixin.js
* `/api/groupHt/group/0`
* `/api/groupHt/${id}`
* `/api/groupHt/count/${description}`

### invoiceMixin.js
* `/api/invoice/${id}`
* `/api/invoice/creditnote`
* `/api/invoice/numbers`

### loginMixin.js
* `POST` -> `/api/users/session` (Autenticación)
* `GET` -> `/api/users/${userId}`

### pacientsMixin.js *(Extremadamente Denso)*
* `/api/patients`
* `/api/patients/ci/${ci}`
* `/api/patients/totalmonth/`
* `/api/waypay/`
* `/api/patients/date/${admission_date}`
* `/api/patients/mailer/${id}`
* `/api/patients/pdf/${id}`
* (Se omiten listados idénticos repetidos. Mapeo indica cruces constantes entre pacients, waypay, e invoices).

### usersMixin.js
* `POST` -> `/api/users/upload` (Perfil foto)
* `GET` -> `/api/users/verify/${email}`

## Conclusión Técnica del Contrato
El endpoint base siempre se determina estáticamente vía `${basePath}` importado desde `config.js`. Esto implica que los Mixins construyen el URL directamente. 
Se detectaron serios riesgos de DRY (Don't Repeat Yourself), donde *pacientsMixin* llama endpoints que naturalmente le pertenecen a *invoiceMixin* o *laboratoryMixin* (Vulnerabilidad de modularidad).
