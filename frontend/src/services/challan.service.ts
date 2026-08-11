import api from "./api";
import type { Challan, Pagination } from "../types";

export async function getChallans(params?: {
  page?: number;
  limit?: number;
  status?: string;
  customerId?: string;
}) {
  const { data } = await api.get("/challans", { params });
  return {
    challans: data.data.challans as Challan[],
    pagination: data.data.pagination as Pagination,
  };
}

export async function getChallan(id: string) {
  const { data } = await api.get(`/challans/${encodeURIComponent(id)}`);
  return data.data as Challan;
}

export async function createChallan(payload: {
  customerId: string;
  items: { productId: string; quantity: number }[];
}) {
  const { data } = await api.post("/challans", payload);
  return data.data as Challan;
}

export async function confirmChallan(id: string) {
  const { data } = await api.post(`/challans/${encodeURIComponent(id)}/confirm`);
  return data.data as Challan;
}

export async function cancelChallan(id: string) {
  const { data } = await api.post(`/challans/${encodeURIComponent(id)}/cancel`);
  return data.data as Challan;
}

export async function deleteChallan(id: string) {
  const { data } = await api.delete(`/challans/${encodeURIComponent(id)}`);
  return data.data as Challan;
}
