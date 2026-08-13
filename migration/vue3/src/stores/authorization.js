import { defineStore } from "pinia";
import { getAuthorizationContext } from "@/services/authorizationService";

function emptyAuthorization() {
  return {
    context: null,
    loading: false,
    loaded: false,
    error: "",
  };
}

function normalizeCode(code) {
  return typeof code === "string" ? code.trim() : "";
}

export const useAuthorizationStore = defineStore("authorization", {
  state: () => emptyAuthorization(),

  getters: {
    userId: (state) => state.context?.userId ?? null,

    roles: (state) => state.context?.roles ?? [],

    permissions: (state) => state.context?.permissions ?? [],

    deniedPermissions: (state) => state.context?.deniedPermissions ?? [],

    hasContext: (state) => state.context !== null,
  },

  actions: {
    async loadContext(options = {}) {
      const force = options.force === true;

      if (this.loading || (this.loaded && !force)) {
        return this.context;
      }

      this.loading = true;
      this.error = "";

      try {
        this.context = await getAuthorizationContext();

        this.loaded = true;
        return this.context;
      } catch (error) {
        this.context = null;
        this.loaded = false;
        this.error =
          typeof error?.message === "string"
            ? error.message
            : "No fue posible cargar la autorización.";

        throw error;
      } finally {
        this.loading = false;
      }
    },

    hasRole(roleCode) {
      const normalizedCode = normalizeCode(roleCode);

      if (normalizedCode === "" || !this.context) {
        return false;
      }

      return this.context.roles.includes(normalizedCode);
    },

    hasPermission(permissionCode) {
      const normalizedCode = normalizeCode(permissionCode);

      if (normalizedCode === "" || !this.context) {
        return false;
      }

      if (this.context.deniedPermissions.includes(normalizedCode)) {
        return false;
      }

      return this.context.permissions.includes(normalizedCode);
    },

    hasAnyPermission(permissionCodes) {
      if (!Array.isArray(permissionCodes)) {
        return false;
      }

      return permissionCodes.some((permissionCode) =>
        this.hasPermission(permissionCode),
      );
    },

    hasAllPermissions(permissionCodes) {
      if (!Array.isArray(permissionCodes)) {
        return false;
      }

      return permissionCodes.every((permissionCode) =>
        this.hasPermission(permissionCode),
      );
    },

    clear() {
      this.$reset();
    },
  },
});
