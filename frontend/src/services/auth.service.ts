import api from "./api";
import type { User } from "../types";

export async function login(email: string, password: string) {
  const { data } = await api.post("/auth/login", { email, password });
  const token = data.data.token as string;
  const user = data.data.user as User;
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

export function isAuthenticated() {
  return Boolean(
    localStorage.getItem("token") || localStorage.getItem("accessToken")
  );
}
