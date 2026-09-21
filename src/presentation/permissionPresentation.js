const moduleLabels = Object.freeze({
  "patient-history": "Historia de pacientes",
  "application-settings": "Configuración de la aplicación",
  "dollar-value": "Valor del dólar",
  "exam-catalog": "Catálogo de exámenes",
  "security": "Seguridad y autorización",
  "security-roles": "Administración de roles",
  "security-users": "Administración de usuarios",
  "laboratory": "Laboratorio",
  "patient-admission": "Ingreso de pacientes",
  "patient-results-email": "Laboratorio",
  "type-payment": "Formas de pago",
  "worksheet-groups": "Grupos de hojas de trabajo",
  "worksheet-group-items": "Grupos de hojas de trabajo",
  "special-tests": "Laboratorios de referencia",
  "special-test-items": "Laboratorios de referencia",
  "tariffs": "Tarifas",
  "tax": "Impuestos",
  general: "General",
  parasiticforms: "Formas parasitarias",
  antibiotic: "Antibióticos",
  germs: "Gérmenes",
  typepayment: "Formas de pago",
  currencies: "Monedas",
  routines: "Rutinas de exámenes",
  "sample-types": "Tipos de muestra",
});

const permissionLabels = Object.freeze({  "patients.cancel": "Autorizar anulaciones de ingresos",
  "patient-admission.close": "Registrar ingreso completo",
  "patient-results-email.read": "Consultar correo de resultados",
  "patient-results-email.send": "Enviar correo de resultados",
  "special-tests.read": "Consultar",
  "special-tests.create": "Crear",
  "special-tests.update": "Actualizar",
  "worksheet-groups.read": "Consultar",
  "worksheet-groups.create": "Crear",
  "worksheet-groups.update": "Actualizar",
  "antibiotic.read": "Consultar",
  "antibiotic.create": "Crear",
  "antibiotic.update": "Actualizar",
  "germs.read": "Consultar",
  "germs.create": "Crear",
  "germs.update": "Actualizar",
  "parasiticforms.read": "Consultar",
  "parasiticforms.create": "Crear",
  "parasiticforms.update": "Actualizar",
  "security.permissions.read": "Consultar permisos",
  "security.roles.assign-permissions": "Asignar permisos a roles",
  "security.roles.create": "Crear roles",
  "security.roles.read": "Consultar roles",
  "security.roles.update": "Actualizar roles",
  "security.users.assign-permissions": "Asignar excepciones de permisos",
  "security.users.assign-roles": "Asignar roles a usuarios",
  "security.users.create": "Crear usuarios",
  "security.users.read": "Consultar usuarios",
  "security.users.update": "Actualizar usuarios",
});

const permissionDescriptions = Object.freeze({  "patients.cancel": "Permite autorizar la anulacion de un ingreso de paciente y registrar la devolucion de sus pagos asociados.",
  "patient-admission.close": "Permite registrar de forma atómica el paciente, sus exámenes y formas de pago.",
  "antibiotic.read": "Permite consultar el catálogo de antibióticos.",
  "antibiotic.create": "Permite registrar antibióticos.",
  "antibiotic.update": "Permite actualizar antibióticos y cambiar su estado.",
  "germs.read": "Permite consultar el catálogo de gérmenes.",
  "germs.create": "Permite registrar gérmenes.",
  "germs.update": "Permite actualizar gérmenes y cambiar su estado.",
  "parasiticforms.read": "Permite consultar formas parasitarias.",
  "parasiticforms.create": "Permite registrar formas parasitarias.",
  "parasiticforms.update": "Permite actualizar formas parasitarias y cambiar su estado.",
  "patient-results-email.read": "Permite consultar la entrega de resultados por correo.",
  "patient-results-email.send": "Permite enviar o reenviar resultados aprobados por correo.",
  "special-tests.read": "Permite consultar laboratorios de referencia y sus pruebas asociadas.",
  "special-tests.create": "Permite registrar laboratorios de referencia.",
  "special-tests.update": "Permite actualizar el laboratorio, cambiar su estado y administrar sus pruebas asociadas.",
  "worksheet-groups.read": "Permite consultar grupos de hojas de trabajo y sus elementos.",
  "worksheet-groups.create": "Permite registrar grupos de hojas de trabajo.",
  "worksheet-groups.update": "Permite actualizar el grupo, cambiar su estado y administrar sus elementos.",
  "security.permissions.read":
    "Permite consultar el cat\u00e1logo de permisos.",
  "security.roles.assign-permissions":
    "Permite asignar permisos a los roles.",
  "security.roles.create":
    "Permite crear nuevos roles.",
  "security.roles.read":
    "Permite consultar los roles y sus permisos.",
  "security.roles.update":
    "Permite actualizar los roles configurables.",
  "security.users.assign-permissions":
    "Permite configurar excepciones individuales de permisos.",
  "security.users.assign-roles":
    "Permite asignar roles a los usuarios.",
  "security.users.create":
    "Permite crear nuevos usuarios.",
  "security.users.read":
    "Permite consultar usuarios y su autorizaci\u00f3n.",
  "security.users.update":
    "Permite actualizar los usuarios.",
});

const hiddenPermissionCodes = new Set([  "antibiotic.change-status",
  "currencies.change-status",
  "exam-catalog.change-status",
  "germs.change-status",
  "parasiticforms.change-status",
  "sample-types.change-status",
  "special-tests.change-status",
  "tariffs.change-status",
  "tariffs.set-default",
  "tax.change-status",
  "typepayment.change-status",
  "worksheet-groups.change-status",
]);

const hiddenPermissionPrefixes = Object.freeze([
  "special-test-items.",
  "worksheet-group-items.",
]);

function isPermissionVisible(value) {
  const code = getPermissionCode(value);
  return !hiddenPermissionCodes.has(code) && !hiddenPermissionPrefixes.some((prefix) => code.startsWith(prefix));
}


const visualPermissionConsolidations = Object.freeze({
  "security-roles": Object.freeze([
    Object.freeze({ key: "security.roles.read", name: "Consultar", description: "Permite consultar los roles y el catalogo de permisos.", codes: Object.freeze(["security.roles.read", "security.permissions.read"]) }),
    Object.freeze({ key: "security.roles.create", name: "Crear", description: "Permite crear nuevos roles.", codes: Object.freeze(["security.roles.create"]) }),
    Object.freeze({ key: "security.roles.update", name: "Actualizar", description: "Permite actualizar roles y administrar sus permisos.", codes: Object.freeze(["security.roles.update", "security.roles.assign-permissions"]) }),
  ]),
  "security-users": Object.freeze([
    Object.freeze({ key: "security.users.read", name: "Consultar", description: "Permite consultar usuarios y su autorizacion.", codes: Object.freeze(["security.users.read"]) }),
    Object.freeze({ key: "security.users.create", name: "Crear", description: "Permite crear nuevos usuarios.", codes: Object.freeze(["security.users.create"]) }),
    Object.freeze({ key: "security.users.update", name: "Actualizar", description: "Permite actualizar usuarios, asignar roles y administrar excepciones de permisos.", codes: Object.freeze(["security.users.update", "security.users.assign-roles", "security.users.assign-permissions"]) }),
  ]),
});

function normalizeText(value) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function capitalize(value) {
  if (value === "") {
    return "";
  }

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}

function humanizeSegment(value) {
  const normalized = normalizeText(value)
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ");

  return capitalize(normalized);
}

export function getPermissionCode(value) {
  if (value && typeof value === "object") {
    return normalizeText(value.code).toLowerCase();
  }

  return normalizeText(value).toLowerCase();
}

export function getPermissionModule(value) {
  const code = getPermissionCode(value);
  const separatorIndex = code.indexOf(".");
  const codeModule = separatorIndex > 0 ? code.slice(0, separatorIndex) : "";

  if (code === "patients.cancel") return "patient-history";
  if (codeModule === "worksheet-group-items") return "worksheet-groups";
  if (codeModule === "patient-results-email") return "laboratory";
  if (codeModule === "special-test-items") return "special-tests";
  if (code.startsWith("security.users.")) return "security-users";
  if (code.startsWith("security.roles.") || code.startsWith("security.permissions.")) return "security-roles";

  if (value && typeof value === "object") {
    const explicitModule = normalizeText(value.module).toLowerCase();
    if (explicitModule !== "" && explicitModule !== "general") return explicitModule;
  }

  return codeModule || "general";
}

export function getPermissionModuleLabel(value) {
  const moduleName = getPermissionModule(value);

  return (
    moduleLabels[moduleName] ||
    humanizeSegment(moduleName) ||
    moduleLabels.general
  );
}

export function getPermissionDisplayName(value) {
  const code = getPermissionCode(value);

  if (permissionLabels[code]) {
    return permissionLabels[code];
  }

  if (value && typeof value === "object") {
    const providedName = normalizeText(value.name);

    if (providedName !== "" && providedName.toLowerCase() !== code) {
      return providedName;
    }
  }

  const segments = code
    .split(".")
    .filter((segment) => segment !== "");

  if (segments.length === 0) {
    return "Permiso";
  }

  if (segments.length === 1) {
    return humanizeSegment(segments[0]);
  }

  return humanizeSegment(segments.slice(1).join(" "));
}

export function getPermissionDescription(value) {
  const code = getPermissionCode(value);

  if (permissionDescriptions[code]) {
    return permissionDescriptions[code];
  }

  if (value && typeof value === "object") {
    const providedDescription = normalizeText(value.description);

    if (providedDescription !== "") {
      return providedDescription;
    }
  }

  return "Permite " +
    getPermissionDisplayName(value).toLowerCase() +
    ".";
}

export function presentPermission(permission) {
  return {
    ...permission,
    technicalCode: getPermissionCode(permission),
    moduleKey: getPermissionModule(permission),
    moduleLabel: getPermissionModuleLabel(permission),
    displayName: getPermissionDisplayName(permission),
    displayDescription: getPermissionDescription(permission),
  };
}

export function groupPermissionsForPresentation(permissions) {
  const visiblePermissions = (Array.isArray(permissions) ? permissions : [])
    .filter((permission) => isPermissionVisible(permission))
    .map((permission) => presentPermission(permission));
  const byCode = new Map(visiblePermissions.map((permission) => [permission.technicalCode, permission]));
  const consumedCodes = new Set();
  const groups = new Map();

  function ensureGroup(moduleKey, moduleLabel) {
    if (!groups.has(moduleKey)) groups.set(moduleKey, { key: moduleKey, label: moduleLabel, permissions: [] });
    return groups.get(moduleKey);
  }

  for (const [moduleKey, definitions] of Object.entries(visualPermissionConsolidations)) {
    for (const definition of definitions) {
      const members = definition.codes.map((code) => byCode.get(code)).filter(Boolean);
      if (members.length === 0) continue;
      members.forEach((member) => consumedCodes.add(member.technicalCode));
      const activeMembers = members.filter((member) => member.isActive);
      const primary = members[0];
      ensureGroup(moduleKey, moduleLabels[moduleKey] || primary.moduleLabel).permissions.push({
        ...primary,
        id: primary.id,
        technicalCode: definition.key,
        displayName: definition.name,
        displayDescription: definition.description,
        moduleKey,
        moduleLabel: moduleLabels[moduleKey] || primary.moduleLabel,
        memberIds: members.map((member) => member.id),
        activeMemberIds: activeMembers.map((member) => member.id),
        isActive: activeMembers.length === members.length,
      });
    }
  }

  for (const permission of visiblePermissions) {
    if (consumedCodes.has(permission.technicalCode)) continue;
    ensureGroup(permission.moduleKey, permission.moduleLabel).permissions.push({
      ...permission,
      memberIds: [permission.id],
      activeMemberIds: permission.isActive ? [permission.id] : [],
    });
  }

  return Array.from(groups.values())
    .map((group) => ({ ...group, permissions: group.permissions.sort((left, right) => left.displayName.localeCompare(right.displayName, "es")) }))
    .sort((left, right) => left.label.localeCompare(right.label, "es"));
}

export function formatPermissionCode(value) {
  const code = getPermissionCode(value);

  if (code === "") {
    return "Permiso";
  }

  return (
    getPermissionModuleLabel(code) +
    ": " +
    getPermissionDisplayName(code)
  );
}
