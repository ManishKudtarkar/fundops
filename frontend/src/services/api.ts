import axios from "axios";
import { logout } from "./auth.service";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export function apiMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string") return message;
    if (error.response?.status === 401) return "Authentication required. Please login again.";
    if (error.response?.status === 403) return "You do not have permission to perform this action.";
    if (error.response?.status === 404) return "Requested resource was not found.";
    if (error.response?.status === 409) return message || "A conflict occurred.";
    if (error.response?.status === 500) return "Server error. Please try again.";
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export default api;