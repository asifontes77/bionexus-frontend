import { apiRequest } from "@/api/apiClient";
import {
  normalizeAuthorizationContext,
  normalizeOverrideInput,
  normalizePermissionIds,
  normalizePermissionOverrides,
  normalizeRoleIds,
  normalizeSecurityPermissions,
  normalizeSecurityRoles,
  normalizeUserAuthorization,
  normalizeAuthorizationUsers,
  normalizeSafeUser,
} from "@/models/authorization";

export async function getAuthorizationContext() {
  const response = await apiRequest("/api/authorization/me");

  return normalizeAuthorizationContext(response);
}

export async function getAuthorizationRoles() {
  const response = await apiRequest("/api/authorization/roles");

  return normalizeSecurityRoles(response);
}

export async function getAuthorizationPermissions() {
  const response = await apiRequest("/api/authorization/permissions");

  return normalizeSecurityPermissions(response);
}

export async function getAuthorizationUsers() {
  const response = await apiRequest("/api/authorization/users");

  return normalizeAuthorizationUsers(response);
}

export async function createUser(user) {
  const response = await apiRequest("/api/users/insert", {
    method: "POST",
    body: user,
  });

  return normalizeSafeUser(response);
}

export async function updateUser(userId, changes) {
  const response = await apiRequest(`/api/users/${userId}`, {
    method: "PATCH",
    body: changes,
  });

  return normalizeSafeUser(response);
}

export async function getRolePermissions(roleId) {
  const response = await apiRequest(
    `/api/authorization/roles/${roleId}/permissions`,
  );

  return normalizeSecurityPermissions(response);
}

export async function createAuthorizationRole(role) {
  const response = await apiRequest("/api/authorization/roles", {
    method: "POST",
    body: role,
  });

  return normalizeSecurityRoles([response])[0] ?? null;
}

export async function updateAuthorizationRole(roleId, changes) {
  const response = await apiRequest(`/api/authorization/roles/${roleId}`, {
    method: "PATCH",
    body: changes,
  });

  return normalizeSecurityRoles([response])[0] ?? null;
}

export async function replaceRolePermissions(roleId, permissionIds) {
  const response = await apiRequest(
    `/api/authorization/roles/${roleId}/permissions`,
    {
      method: "PUT",
      body: {
        permissionIds: normalizePermissionIds(permissionIds),
      },
    },
  );

  return normalizeSecurityPermissions(response);
}

export async function getUserAuthorization(userId) {
  const response = await apiRequest(`/api/authorization/users/${userId}`);

  return normalizeUserAuthorization(response);
}

export async function replaceUserRoles(userId, roleIds) {
  const response = await apiRequest(
    `/api/authorization/users/${userId}/roles`,
    {
      method: "PUT",
      body: {
        roleIds: normalizeRoleIds(roleIds),
      },
    },
  );

  return normalizeSecurityRoles(response);
}

export async function replaceUserPermissionOverrides(userId, overrides) {
  const response = await apiRequest(
    `/api/authorization/users/${userId}/permission-overrides`,
    {
      method: "PUT",
      body: {
        overrides: normalizeOverrideInput(overrides),
      },
    },
  );

  return normalizePermissionOverrides(response);
}
export async function uploadUserAsset(file, assetType) {
  if (!["photos", "signatures"].includes(assetType)) throw new Error("Tipo de imagen de usuario invalido.");
  const formData = new FormData();
  formData.append("file", file, file.name);
  const response = await apiRequest(`/api/users/upload/${assetType}`, {
    method: "POST",
    body: formData,
    preserveBody: true,
  });
  return typeof response === "string" ? response : response?.filename ?? response?.message ?? response;
}
export async function verifyUserEmail(email, userId = null) {
  const encodedEmail = encodeURIComponent(email.trim());
  const path = Number.isInteger(userId) && userId > 0
    ? `/api/users/verify-id/${userId}/${encodedEmail}`
    : `/api/users/verify/${encodedEmail}`;
  return apiRequest(path);
}
export async function verifyUserSignature(userId, passwordSignature) {
  return apiRequest("/api/users/verify-signature", {
    method: "POST",
    body: { userId, passwordSignature },
  });
}
