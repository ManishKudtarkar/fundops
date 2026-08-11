import api from "./api";
import type { StockMovement, Pagination } from "../types";

export interface MovementFilters {
  search?: string;
  productId?: string;
  movementType?: "IN" | "OUT" | "ADJUSTMENT";
  dateFrom?: string;
  dateTo?: string;
  referenceId?: string;
  page?: number;
  limit?: number;
}

export async function getInventoryMovements(filters?: MovementFilters) {
  const { data } = await api.get("/inventory/movements", { params: filters });
  return {
    movements: data.data.movements as StockMovement[],
    pagination: data.data.pagination as Pagination,
  };
}
