export const PermissionEffect = Object.freeze({
  Allow: "allow",
  Deny: "deny",
});

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asBoolean(value) {
  return value === true || value === 1;
}

function asNullableString(value) {
  return typeof value === "string" ? value : null;
}

function asPositiveInteger(value) {
  return Number.isInteger(value) && value > 0 ? value : null;
}

function normalizeStringCollection(value) {
  return Array.from(
    new Set(
      asArray(value)
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter((item) => item !== ""),
    ),
  ).sort((left, right) => left.localeCompare(right));
}

export function normalizeAuthorizationContext(value) {
  if (!value || typeof value !== "object") return null;

  const userId = asPositiveInteger(value.userId);

  if (userId === null) return null;

  return {
    userId,
    roles: normalizeStringCollection(value.roles),
    permissions: normalizeStringCollection(value.permissions),
    deniedPermissions: normalizeStringCollection(value.deniedPermissions),
  };
}

export function normalizeSecurityRole(value) {
  if (!value || typeof value !== "object") return null;

  const id = asPositiveInteger(value.id);
  const code = typeof value.code === "string" ? value.code.trim() : "";

  if (id === null || code === "") return null;

  return {
    id,
    code,
    name: typeof value.name === "string" ? value.name : "",
    description: asNullableString(value.description),
    isSystem: asBoolean(value.isSystem),
    isActive: asBoolean(value.isActive),
  };
}

export function normalizeSecurityRoles(value) {
  return asArray(value)
    .map(normalizeSecurityRole)
    .filter((role) => role !== null)
    .sort((left, right) => left.code.localeCompare(right.code));
}

export function normalizeSecurityPermission(value) {
  if (!value || typeof value !== "object") return null;

  const id = asPositiveInteger(value.id);
  const code = typeof value.code === "string" ? value.code.trim() : "";

  if (id === null || code === "") return null;

  return {
    id,
    code,
    name: typeof value.name === "string" ? value.name : "",
    description: asNullableString(value.description),
    module: typeof value.module === "string" ? value.module.trim() : "",
    isActive: asBoolean(value.isActive),
  };
}

export function normalizeSecurityPermissions(value) {
  return asArray(value)
    .map(normalizeSecurityPermission)
    .filter((permission) => permission !== null)
    .sort((left, right) => {
      if (left.module !== right.module) {
        return left.module.localeCompare(right.module);
      }

      return left.code.localeCompare(right.code);
    });
}

export function normalizeSafeUser(value) {
  if (!value || typeof value !== "object") return null;

  const id = asPositiveInteger(value.id);

  if (id === null) return null;

  return {
    id,
    name: typeof value.name === "string" ? value.name : "",
    userName: typeof value.user_name === "string" ? value.user_name : "",
    collegeNumber: asNullableString(value.college_number),
    telephone: typeof value.telephone === "string" ? value.telephone : "",
    photo: asNullableString(value.url_photo),
    signature: asNullableString(value.url_signature),
    direction: asNullableString(value.direction),
    position: asNullableString(value.position),
    email: asNullableString(value.email),
    roles: typeof value.roles === "string" ? value.roles : "",
    hidden: asBoolean(value.hide_user),
    createdAt: typeof value.createdAt === "string" ? value.createdAt : null,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : null,
  };
}

export function normalizeSafeUsers(value) {
  return asArray(value)
    .map(normalizeSafeUser)
    .filter((user) => user !== null)
    .sort((left, right) => {
      const nameComparison = left.name.localeCompare(right.name);

      if (nameComparison !== 0) {
        return nameComparison;
      }

      return left.userName.localeCompare(right.userName);
    });
}

export function normalizePermissionOverride(value) {
  if (!value || typeof value !== "object") return null;

  const permission = normalizeSecurityPermission(value.permission);

  const effect = value.effect;

  if (
    permission === null ||
    (effect !== PermissionEffect.Allow && effect !== PermissionEffect.Deny)
  ) {
    return null;
  }

  return {
    permission,
    effect,
  };
}

export function normalizePermissionOverrides(value) {
  return asArray(value)
    .map(normalizePermissionOverride)
    .filter((override) => override !== null)
    .sort((left, right) => {
      if (left.permission.module !== right.permission.module) {
        return left.permission.module.localeCompare(right.permission.module);
      }

      if (left.permission.code !== right.permission.code) {
        return left.permission.code.localeCompare(right.permission.code);
      }

      return left.effect.localeCompare(right.effect);
    });
}

export function normalizeUserAuthorization(value) {
  if (!value || typeof value !== "object") return null;

  const user = normalizeSafeUser(value.user);

  if (user === null) return null;

  return {
    user,
    assignedRoles: normalizeSecurityRoles(value.assignedRoles),
    inheritedPermissions: normalizeSecurityPermissions(
      value.inheritedPermissions,
    ),
    permissionOverrides: normalizePermissionOverrides(
      value.permissionOverrides,
    ),
    context: normalizeAuthorizationContext(value.context),
  };
}

export function normalizeRoleIds(value) {
  return Array.from(
    new Set(
      asArray(value).filter((roleId) => Number.isInteger(roleId) && roleId > 0),
    ),
  );
}

export function normalizePermissionIds(value) {
  return Array.from(
    new Set(
      asArray(value).filter(
        (permissionId) => Number.isInteger(permissionId) && permissionId > 0,
      ),
    ),
  );
}

export function normalizeOverrideInput(value) {
  const normalized = [];
  const permissionIds = new Set();

  for (const item of asArray(value)) {
    if (!item || typeof item !== "object") continue;

    const permissionId = asPositiveInteger(item.permissionId);

    const effect = item.effect;

    if (
      permissionId === null ||
      (effect !== PermissionEffect.Allow && effect !== PermissionEffect.Deny) ||
      permissionIds.has(permissionId)
    ) {
      continue;
    }

    permissionIds.add(permissionId);

    normalized.push({
      permissionId,
      effect,
    });
  }

  return normalized;
}
