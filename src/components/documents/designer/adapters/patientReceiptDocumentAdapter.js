export const patientReceiptDocumentAdapter=Object.freeze({
  documentType:'patient-receipt',
  labels:Object.freeze({document:'Comprobante',saveSuccess:'Comprobante guardado correctamente.',saveError:'No fue posible guardar el comprobante.'}),
  templates:Object.freeze([
    {id:'blank',name:'En blanco',description:'Lienzo limpio para diseñar desde cero.',icon:'draft'},
    {id:'classic',name:'Clásico',description:'Logo, encabezado, paciente, tabla completa y pie.',icon:'description'},
    {id:'compact',name:'Compacto',description:'Distribución horizontal y tabla optimizada.',icon:'view_compact'},
    {id:'minimal',name:'Minimalista',description:'Diseño limpio en A4 con información esencial.',icon:'article'},
  ]),
  tokenCatalog:Object.freeze([
    {key:'laboratory.name',label:'Laboratorio'},{key:'laboratory.rif',label:'RIF'},{key:'laboratory.phone1',label:'Teléfono'},
    {key:'laboratory.address',label:'Dirección del laboratorio'},{key:'patient.name',label:'Paciente'},{key:'patient.documentNumber',label:'C.I.'},
    {key:'patient.sex',label:'Sexo'},{key:'patient.address',label:'Dirección del paciente'},{key:'patient.phone',label:'Teléfono del paciente'},
    {key:'patient.age',label:'Edad'},{key:'document.number',label:'Núm. comprobante'},{key:'document.date',label:'Fecha'},
    {key:'currency.usdRate',label:'Tasa USD/Bs.'},{key:'currency.rateDate',label:'Fecha de la tasa'},{key:'document.subtotal',label:'Subtotal'},
    {key:'document.taxTotal',label:'Impuestos'},{key:'document.total',label:'Total'},
  ]),
  examFieldOptions:Object.freeze([
    {value:'code',label:'Código'},{value:'name',label:'Examen o servicio'},{value:'quantity',label:'Cantidad'},
    {value:'unitPrice',label:'Precio unitario'},{value:'lineSubtotal',label:'Subtotal de línea'},{value:'taxDescription',label:'Impuesto'},
    {value:'taxRate',label:'% impuesto'},{value:'taxTotal',label:'Impuesto calculado'},{value:'total',label:'Total con impuesto'},
  ]),
  totalFieldOptions:Object.freeze([
    {value:'subtotal',label:'Subtotal'},{value:'discount',label:'Descuento'},{value:'otherCharges',label:'Otros cargos'},
    {value:'taxTotal',label:'Impuestos'},{value:'grandTotal',label:'Total general'},
  ]),
  sampleExamRows:Object.freeze([
    {code:'HEM-001',name:'Hematología completa',quantity:'1',unitPrice:'25,00',lineSubtotal:'25,00',taxDescription:'IVA',taxRate:'16,00',taxTotal:'4,00',total:'29,00'},
    {code:'QUI-010',name:'Glucosa',quantity:'1',unitPrice:'12,50',lineSubtotal:'12,50',taxDescription:'Exo',taxRate:'0,00',taxTotal:'0,00',total:'12,50'},
    {code:'ORI-002',name:'Examen de orina',quantity:'1',unitPrice:'10,00',lineSubtotal:'10,00',taxDescription:'IVA',taxRate:'16,00',taxTotal:'1,60',total:'11,60'},
  ]),
  sampleSummary:Object.freeze({subtotal:'47,50',discount:'0,00',otherCharges:'0,00',taxTotal:'5,60',grandTotal:'53,10'}),
});