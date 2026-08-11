import api from "./api";
import type { Product, StockMovement, Pagination } from "../types";

export async function getProducts(params?: {
  search?: string;
  category?: string;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}) {
  const { data } = await api.get("/products", { params });
  const payload = data.data;
  return {
    products: payload.products as Product[],
    pagination: payload.pagination as Pagination,
  };
}

export async function getProduct(id: string) {
  const { data } = await api.get(`/products/${id}`);
  return data.data as Product & { stockMovements: StockMovement[] };
}

export async function createProduct(payload: Partial<Product>) {
  const { data } = await api.post("/products", payload);
  return data.data as Product;
}

export async function updateProduct(id: string, payload: Partial<Product>) {
  const { data } = await api.put(`/products/${id}`, payload);
  return data.data as Product;
}

export async function deleteProduct(id: string) {
  return api.delete(`/products/${id}`);
}

export async function createStockMovement(
  id: string,
  payload: {
    quantity: number;
    movementType: "IN" | "OUT" | "ADJUSTMENT";
    reason: string;
  }
) {
  const { data } = await api.post(`/products/${id}/stock`, payload);
  return data.data;
}
