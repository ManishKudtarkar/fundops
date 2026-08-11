import api from "./api";
import type { Customer, Pagination } from "../types";

interface CustomerResponse {
  success: boolean;
  data: Customer | { customers: Customer[]; pagination: Pagination };
  message?: string;
}

export async function getCustomers(params?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const { data } = await api.get<CustomerResponse>("/customers", { params });
  const payload = data.data as { customers?: Customer[]; pagination?: Pagination } | Customer;
  return {
    customers: "customers" in payload ? payload.customers ?? [] : [],
    pagination: "pagination" in payload
      ? payload.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 0 }
      : { page: 1, limit: 10, total: 0, totalPages: 0 },
  };
}

export async function createCustomer(payload: Partial<Customer>) {
  const { data } = await api.post<CustomerResponse>("/customers", payload);
  return data.data as Customer;
}

export async function updateCustomer(id: string, payload: Partial<Customer>) {
  const { data } = await api.put<CustomerResponse>(`/customers/${id}`, payload);
  return data.data as Customer;
}

export async function deleteCustomer(id: string) {
  return api.delete(`/customers/${id}`);
}
