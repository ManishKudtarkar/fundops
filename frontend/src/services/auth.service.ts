import api from "./api";
import type { User } from "../types";

/**
 * Decodes JWT token to extract payload (businessId, role, etc.)
 * Note: This is just for reading, actual validation happens on backend
 */
function decodeJWT(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const decoded = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return decoded;
  } catch {
    return null;
  }
}

export async function login(email: string, password: string) {
  const { data } = await api.post("/auth/login", { email, password });
  const token = data.data.token as string;
  const user = data.data.user as User;

  // Decode JWT to extract businessId
  const decoded = decodeJWT(token);
  if (decoded?.businessId) {
    user.businessId = decoded.businessId;
  }

  // Extract businessName from user object if provided
  if (data.data.businessName) {
    user.businessName = data.data.businessName;
  }

  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  return { token, user };
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
}

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function getBusinessId(): string | null {
  const user = getStoredUser();
  return user?.businessId || null;
}

export function getBusinessName(): string | null {
  const user = getStoredUser();
  return user?.businessName || null;
}

export function isSuperAdmin(): boolean {
  const user = getStoredUser();
  return user?.role === "SUPER_ADMIN";
}

export function isBusinessAdmin(): boolean {
  const user = getStoredUser();
  return user?.role === "BUSINESS_ADMIN";
}

export function getUserRole(): string | null {
  const user = getStoredUser();
  return user?.role || null;
}

export function isAuthenticated() {
  return Boolean(
    localStorage.getItem("token") || localStorage.getItem("accessToken")
  );
}
