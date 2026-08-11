import type { Challan } from "../../types";

export class ChallanDocumentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChallanDocumentError";
  }
}

export interface ChallanDocumentLine {
  srNo: number;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ChallanDocumentModel {
  challanNumber: string;
  status: string;
  createdAt: string;
  generatedAt: Date;
  customerName: string;
  businessName: string;
  mobile: string;
  email: string;
  address: string;
  lines: ChallanDocumentLine[];
  totalItems: number;
  totalQuantity: number;
  subtotal: number;
  totalAmount: number;
}

export function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatDocumentDate(value: string | Date) {
  const date = new Date(value);

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatGeneratedDateTime(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(value);
}

export function safeNumber(value: unknown) {
  const number = typeof value === "string" ? Number(value) : Number(value);

  return Number.isFinite(number) ? number : NaN;
}

export function buildChallanDocumentModel(challan: Challan): ChallanDocumentModel {
  if (!challan) {
    throw new ChallanDocumentError("Unable to generate the challan PDF. Please try again.");
  }

  const items = Array.isArray(challan.items) ? challan.items : [];

  if (items.length === 0) {
    throw new ChallanDocumentError("Unable to generate the challan PDF. This challan has no items.");
  }

  const lines = items.map((item, index) => {
    const quantity = safeNumber(item.quantity);
    const unitPrice = safeNumber(item.unitPrice);
    const productName = item.productName || item.product?.name;
    const sku = item.sku || item.product?.sku;

    if (!productName) {
      throw new ChallanDocumentError("Unable to generate the challan PDF. A product name is missing.");
    }

    if (!sku) {
      throw new ChallanDocumentError("Unable to generate the challan PDF. A product SKU is missing.");
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new ChallanDocumentError("Unable to generate the challan PDF. An item quantity is invalid.");
    }

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new ChallanDocumentError("Unable to generate the challan PDF. An item price is invalid.");
    }

    return {
      srNo: index + 1,
      productName,
      sku,
      quantity,
      unitPrice,
      total: quantity * unitPrice,
    } satisfies ChallanDocumentLine;
  });

  const totalQuantity = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = lines.reduce((sum, line) => sum + line.total, 0);

  return {
    challanNumber: challan.challanNumber || challan.id,
    status: challan.status,
    createdAt: challan.createdAt,
    generatedAt: new Date(),
    customerName: challan.customer?.name || "Not available",
    businessName: challan.customer?.businessName || "Not available",
    mobile: challan.customer?.mobile || "Not available",
    email: challan.customer?.email || "Not available",
    address: challan.customer?.address || "Not available",
    lines,
    totalItems: lines.length,
    totalQuantity,
    subtotal,
    totalAmount: subtotal,
  };
}
