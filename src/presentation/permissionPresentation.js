const moduleLabels = Object.freeze({
  general: "General",
  "sample-types": "Tipos de muestra",
  parasiticforms: "Formas parasitarias",
  antibiotic: "Antibióticos",
  germs: "Gérmenes",
  patients: "Pacientes",
  security: "Seguridad y autorizaci\u00f3n",
  typepayment: "Formas de pago",
});

const permissionLabels = Object.freeze({
  "parasiticforms.change-status": "Cambiar estado",
  "antibiotic.read": "Consultar",
  "germs.read": "Consultar",
  "germs.create": "Crear",
  "germs.update": "Actualizar",
  "germs.change-status": "Cambiar estado",
  "antibiotic.create": "Crear",
  "antibiotic.update": "Actualizar",
  "antibiotic.change-status": "Cambiar estado",
  "parasiticforms.create": "Crear",
  "parasiticforms.read": "Consultar",
  "parasiticforms.update": "Actualizar",
  "antibiotic.read":
    "Permite consultar el catálogo de antibióticos.",
  "antibiotic.create":
    "Permite crear antibióticos.",
  "antibiotic.update":
    "Permite actualizar la descripción y las siglas de antibióticos.",
  "antibiotic.change-status":
    "Permite activar o inactivar antibióticos.",
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

const permissionDescriptions = Object.freeze({
  "parasiticforms.change-status":
    "Permite cambiar el estado de las formas parasitarias.",
  "parasiticforms.create":
    "Permite registrar nuevas formas parasitarias.",
  "parasiticforms.read":
    "Permite consultar las formas parasitarias.",
  "parasiticforms.update":
    "Permite actualizar las formas parasitarias.",
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
  const groups = new Map();

  for (const sourcePermission of Array.isArray(permissions) ? permissions : []) {
    const permission = presentPermission(sourcePermission);

    if (!groups.has(permission.moduleKey)) {
      groups.set(permission.moduleKey, {
        key: permission.moduleKey,
        label: permission.moduleLabel,
        permissions: [],
      });
    }

    groups.get(permission.moduleKey).permissions.push(permission);
  }

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      permissions: group.permissions.sort((left, right) =>
        left.displayName.localeCompare(right.displayName, "es"),
      ),
    }))
    .sort((left, right) =>
      left.label.localeCompare(right.label, "es"),
    );
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
