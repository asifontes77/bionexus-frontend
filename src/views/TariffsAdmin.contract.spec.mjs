import fs from "node:fs";
import path from "node:path";
const root=process.cwd();
const view=fs.readFileSync(path.join(root,"src/views/TariffsView.vue"),"utf8");
const service=fs.readFileSync(path.join(root,"src/services/tariffService.js"),"utf8");
const router=fs.readFileSync(path.join(root,"src/router/index.js"),"utf8");
for(const token of ["tariffs.create","tariffs.update","tariffs.change-status","tariffs.set-default","BioNexusDataGrid","BioNexusContextMenu","BioNexusDialog","BioNexusStateDialog","BioNexusGridToggleCell","hasChanges","fieldErrors.name","createTechnicalCode","reorderTariffs","saveOrder","orderDirty","handleKeyboardOrder","acceptKeyboardPosition","cancelKeyboardPosition","TariffOrderSelectCell","selectedOrderId","tariff-order-selected-cell","cellClassRules","tariff-order-selected","selectForOrder","tariff-position-number","SELECCIONADO · ↑ ↓ · ENTER · ESC","Boolean(row.isDefault)","Registros de precio"])if(!view.includes(token))throw new Error("TARIFF_ADMIN_VIEW_MISSING_"+token);
for(const endpoint of ["/api/tariffs","/status","/default"])if(!service.includes(endpoint))throw new Error("TARIFF_ADMIN_SERVICE_MISSING_"+endpoint);
for(const token of ['name: "configuration-tariffs"','permissions: ["tariffs.read"]','permission: "tariffs.read"'])if(!router.includes(token))throw new Error("TARIFF_ADMIN_ROUTE_MISSING_"+token);
console.log("[OK] Administrador base de tarifas protegido y conectado.");

if(view.includes('pinned:"left"')||view.includes('pinned:"right"'))throw new Error("UNPINNED_TARIFF_ORDER");
if(view.includes('setGridOption?.("rowData"'))throw new Error("TARIFF_ROW_DATA_DOUBLE_WRITE");

if(view.includes('.tariff-order-selected-cell[col-id="name"]){position:relative'))throw new Error("AG_CELL_POSITION_PRESERVED");
