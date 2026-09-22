import fs from "node:fs";
import path from "node:path";
const root=process.cwd();
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const view=read("src/views/TariffsView.vue");
const cell=read("src/components/tariffs/TariffOrderSelectCell.vue");
const service=read("src/services/tariffService.js");
const router=read("src/router/index.js");
const theme=read("src/styles/components.css");
const viewTokens=[
  "tariffs.create","tariffs.update","BioNexusDataGrid","BioNexusContextMenu","BioNexusDialog",
  "BioNexusStateDialog","BioNexusConfirmDialog","BioNexusActionButton","requestCloseDialog",
  "Confirmación","Descartar cambios","Hay cambios sin guardar. ¿Deseas salir y descartarlos?","Cancelar","Sí, salir y descartar cambios","variant:row.isActive?\"danger\":\"default\"","BioNexusGridToggleCell",
  "hasChanges","fieldErrors.name","createTechnicalCode","reorderTariffs","saveOrder","orderDirty",
  "handleKeyboardOrder","acceptKeyboardPosition","cancelKeyboardPosition","TariffOrderSelectCell",
  "selectedOrderId","tariff-order-selected-cell","cellClassRules","tariff-order-selected",
  "selectForOrder","tariff-position-number","Boolean(row.isDefault)","Registros de precio"
];
for(const token of viewTokens)if(!view.includes(token))throw new Error("TARIFF_ADMIN_VIEW_MISSING_"+token);
for(const token of ["/api/tariffs","/status","/default"])if(!service.includes(token))throw new Error("TARIFF_ADMIN_SERVICE_MISSING_"+token);
for(const token of ['name: "configuration-tariffs"','permissions: ["tariffs.read"]','permission: "tariffs.read"'])if(!router.includes(token))throw new Error("TARIFF_ADMIN_ROUTE_MISSING_"+token);
for(const token of ["BIO NEXUS TARIFFS ADMIN START","SELECCIONADO · ↑ ↓ · ENTER · ESC",".tariff-order-check",".tariff-position-number"])if(!theme.includes(token))throw new Error("TARIFF_ADMIN_THEME_MISSING_"+token);
if(view.includes("<style"))throw new Error("TARIFF_VIEW_LOCAL_STYLE_FORBIDDEN");
if(cell.includes("<style"))throw new Error("TARIFF_CELL_LOCAL_STYLE_FORBIDDEN");
if(view.includes("<button"))throw new Error("TARIFF_NATIVE_BUTTON_FORBIDDEN");
if(view.includes('pinned:"left"')||view.includes('pinned:"right"'))throw new Error("UNPINNED_TARIFF_ORDER");
if(view.includes('setGridOption?.("rowData"'))throw new Error("TARIFF_ROW_DATA_DOUBLE_WRITE");
if(view.includes('.tariff-order-selected-cell[col-id="name"]){position:relative'))throw new Error("AG_CELL_POSITION_PRESERVED");
console.log("[OK] Tarifas protegida, estandarizada y con CSS centralizado.");
for(const token of ["Cambios sin guardar","Existen cambios sin guardar en la tarifa.","Los valores editados se perderán.","Continuar editando"])if(view.includes(token))throw new Error("TARIFF_DISCARD_LEGACY_TEXT_"+token);
