import type { AuthBindings } from "@refinedev/core";

const TOKEN_KEY = "frontend_auth_token";

export const authProvider: AuthBindings = {
  login: async ({ token }) => {
    localStorage.setItem(TOKEN_KEY, token || "demo-token");
    return { success: true, redirectTo: "/" };
  },
  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    return { success: true, redirectTo: "/login" };
  },
  check: async () => {
    if (localStorage.getItem(TOKEN_KEY)) {
      return { authenticated: true };
    }
    return { authenticated: false, redirectTo: "/login" };
  },
  getPermissions: async () => null,
  getIdentity: async () => null,
  onError: async () => ({ error: undefined }),
};
