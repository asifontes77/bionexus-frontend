let excelJsPromise;
let pdfMakePromise;

async function loadExcelJS() {
  excelJsPromise ??= import("exceljs").then((module) => module.default ?? module);
  return excelJsPromise;
}

async function loadPdfMake() {
  pdfMakePromise ??= Promise.all([
    import("pdfmake/build/pdfmake"),
    import("pdfmake/build/vfs_fonts"),
  ]).then(([pdfModule, fontModule]) => {
    const pdfMake = pdfModule.default ?? pdfModule;
    const fontExports = fontModule.default ?? fontModule;
    const vfs = fontExports?.pdfMake?.vfs ?? fontExports?.vfs ?? fontExports;
    if (!vfs || typeof vfs !== "object" || !vfs["Roboto-Medium.ttf"]) {
      throw new Error("PDFMAKE_VFS_ROBOTO_MISSING");
    }
    if (typeof pdfMake.addVirtualFileSystem === "function") pdfMake.addVirtualFileSystem(vfs);
    else pdfMake.vfs = { ...(pdfMake.vfs ?? {}), ...vfs };
    return pdfMake;
  });
  return pdfMakePromise;
}



const ROUTE_EXPORT_NAMES = Object.freeze({
  "type-payments": "Formas de pago",
  parasiticforms: "Formas parasitarias",
  roles: "Roles y permisos",
  users: "Usuarios y autorizacion",
});

function safeFileName(value) {
  return String(value || "exportacion-bio-nexus")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "exportacion-bio-nexus";
}

function resolveExportIdentity(options = {}) {
  const explicitTitle = String(options.title || "").trim();
  const routeName = String(globalThis?.location?.pathname || "")
    .split("/")
    .filter(Boolean)
    .at(-1) || "";
  const mappedTitle = ROUTE_EXPORT_NAMES[routeName] || "";
  const visibleTitle = [
    document.querySelector("main h1")?.textContent,
    document.querySelector("main h2")?.textContent,
    document.querySelector(".page-title")?.textContent,
    document.querySelector(".breadcrumb li:last-child")?.textContent,
  ].map((value) => String(value || "").trim()).find(Boolean) || "";
  const title = explicitTitle || mappedTitle || visibleTitle || "Exportacion Bio Nexus";
  const fileName = safeFileName(options.fileName || title);
  return { title, fileName };
}

function resolveGridValue(api, column, node) {
  const definition = column.getColDef();
  if (typeof api.getCellValue === "function") return api.getCellValue({ rowNode: node, colKey: column });
  if (typeof node.getValue === "function") return node.getValue(column);
  if (definition.field && node.data) {
    return definition.field.split(".").reduce((current, segment) => current?.[segment], node.data);
  }
  return "";
}

function formatGridValue(api, column, node, value) {
  const definition = column.getColDef();
  const parameters = typeof definition.cellRendererParams === "function"
    ? definition.cellRendererParams({ api, column, colDef: definition, data: node.data, node, value })
    : definition.cellRendererParams;
  if (typeof value === "boolean") return value ? (parameters?.onLabel || "Si") : (parameters?.offLabel || "No");
  if (typeof definition.valueFormatter === "function") {
    const formatted = definition.valueFormatter({ api, column, colDef: definition, data: node.data, node, value });
    if (formatted !== null && formatted !== undefined) return formatted;
  }
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value;
  if (typeof value === "object") return JSON.stringify(value);
  return value;
}

function collect(api, options = {}) {
  const excluded = new Set(["actions", ...(options.excludeColumns || [])]);
  const selected = Array.isArray(options.selectedColumnIds) && options.selectedColumnIds.length
    ? new Set(options.selectedColumnIds)
    : null;
  const columns = api.getAllDisplayedColumns().filter((column) => {
    const definition = column.getColDef();
    return (!selected || selected.has(column.getColId()))
      && !excluded.has(column.getColId())
      && !excluded.has(definition.field)
      && definition.suppressExport !== true;
  });
  const headers = columns.map((column) => column.getColDef().headerName || column.getColId());
  const rows = [];
  api.forEachNodeAfterFilterAndSort((node) => {
    if (!node.data || node.group) return;
    rows.push(columns.map((column) => {
      const value = resolveGridValue(api, column, node);
      return formatGridValue(api, column, node, value);
    }));
  });
  return { headers, rows };
}

function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function exportGridToExcel(api, options = {}) {
  const ExcelJS = await loadExcelJS();
  const { title, fileName } = resolveExportIdentity(options);
  const { headers, rows } = collect(api, options);
  if (!headers.length) throw new Error("No hay columnas visibles para exportar.");
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Bio Nexus";
  workbook.created = new Date();
  const sheet = workbook.addWorksheet(title.slice(0, 31));
  const lastColumn = headers.length;

  sheet.mergeCells(1, 1, 1, lastColumn);
  const titleCell = sheet.getCell(1, 1);
  titleCell.value = title;
  titleCell.font = { bold: true, size: 16, color: { argb: "FF17445D" } };
  titleCell.alignment = { vertical: "middle", horizontal: "left" };
  sheet.getRow(1).height = 24;

  sheet.mergeCells(2, 1, 2, lastColumn);
  const dateCell = sheet.getCell(2, 1);
  dateCell.value = new Date().toLocaleString("es-VE");
  dateCell.font = { size: 10, color: { argb: "FF607080" } };
  dateCell.alignment = { vertical: "middle", horizontal: "left" };

  const headerRowNumber = 4;
  const header = sheet.getRow(headerRowNumber);
  headers.forEach((value, index) => {
    const cell = header.getCell(index + 1);
    cell.value = value;
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F6F8B" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: { style: "thin", color: { argb: "FFB8CAD7" } },
      left: { style: "thin", color: { argb: "FFB8CAD7" } },
      bottom: { style: "thin", color: { argb: "FFB8CAD7" } },
      right: { style: "thin", color: { argb: "FFB8CAD7" } },
    };
  });
  rows.forEach((row) => sheet.addRow(row));

  const dataEndRow = headerRowNumber + rows.length;
  sheet.autoFilter = { from: { row: headerRowNumber, column: 1 }, to: { row: dataEndRow, column: lastColumn } };
  sheet.views = [{ state: "frozen", ySplit: headerRowNumber }];
  sheet.columns.slice(0, lastColumn).forEach((column, index) => {
    const values = [headers[index], ...rows.map((row) => row[index])].map((value) => String(value ?? ""));
    column.width = Math.min(45, Math.max(12, ...values.map((value) => value.length + 2)));
  });

  const buffer = await workbook.xlsx.writeBuffer();
  download(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), fileName + ".xlsx");
}

export async function exportGridToPdf(api, options = {}, orientation = "portrait") {
  const pdfMake = await loadPdfMake();
  const { title, fileName } = resolveExportIdentity(options);
  const { headers, rows } = collect(api, options);
  if (!headers.length) throw new Error("No hay columnas visibles para exportar.");
  const normalizedOrientation = orientation === "landscape" ? "landscape" : "portrait";
  const body = [
    headers.map((value) => ({ text: String(value), style: "header" })),
    ...rows.map((row) => row.map((value) => ({ text: String(value ?? ""), style: "cell" }))),
  ];
  const gridLayout = {
    hLineWidth: () => 0.6,
    vLineWidth: () => 0.6,
    hLineColor: () => "#B8CAD7",
    vLineColor: () => "#B8CAD7",
    paddingLeft: () => 4,
    paddingRight: () => 4,
    paddingTop: () => 3,
    paddingBottom: () => 3,
  };
  pdfMake.createPdf({
    pageOrientation: normalizedOrientation,
    pageMargins: [26, 38, 26, 34],
    info: { title, creator: "Bio Nexus" },
    content: [
      { text: title, style: "title" },
      { text: new Date().toLocaleString("es-VE"), style: "date" },
      { table: { headerRows: 1, widths: headers.map(() => "*"), body }, layout: gridLayout },
    ],
    footer: (current, total) => ({ text: current + " / " + total, alignment: "center", fontSize: 8, color: "#607080" }),
    styles: {
      title: { fontSize: 15, bold: true, color: "#17445D", margin: [0, 0, 0, 4] },
      date: { fontSize: 8, color: "#607080", margin: [0, 0, 0, 10] },
      header: { bold: true, color: "#FFFFFF", fillColor: "#1F6F8B", fontSize: 8 },
      cell: { fontSize: 7.5, color: "#263746" },
    },
    defaultStyle: { font: "Roboto", fontSize: 7.5 },
  }).download(fileName + ".pdf");
}
