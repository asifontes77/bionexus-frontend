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
} from "@/models/authorization";

export async function getAuthorizationContext() {
  const response = await apiRequest("/api/authorization/context");

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
