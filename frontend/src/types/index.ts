export type Role =
  | "SUPER_ADMIN"
  | "BUSINESS_ADMIN"
  | "SALES"
  | "WAREHOUSE"
  | "ACCOUNTS";
export type CustomerType = "RETAIL" | "WHOLESALE" | "DISTRIBUTOR";
export type CustomerStatus = "LEAD" | "ACTIVE" | "INACTIVE";
export type StockMovementType = "IN" | "OUT" | "ADJUSTMENT";
export type ReferenceType = "SALES_CHALLAN" | "MANUAL" | "ADJUSTMENT";
export type ChallanStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";
export type BusinessStatus = "ACTIVE" | "SUSPENDED" | "INACTIVE";
export type FollowUpStatus = "PENDING" | "COMPLETED" | "CANCELLED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  businessId?: string | null;
  businessName?: string | null;
  isActive?: boolean;
}

export interface Business {
  id: string;
  name: string;
  legalName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  gstin?: string | null;
  status: BusinessStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FollowUp {
  id: string;
  businessId: string;
  customerId: string;
  title: string;
  notes?: string | null;
  status: FollowUpStatus;
  followUpDate: string;
  assignedTo?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  assignedToUser?: User;
}

export interface AuditLog {
  id: string;
  businessId?: string | null;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  user?: User;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email?: string | null;
  businessName: string;
  gstNumber?: string | null;
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate?: string | null;
  notes?: string | null;
  createdById?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: string | number;
  currentStock: number;
  minimumStock: number;
  location: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  quantity: number;
  movementType: StockMovementType;
  previousStock: number;
  newStock: number;
  referenceType: ReferenceType;
  referenceId?: string | null;
  reason: string;
  createdById: string;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    sku: string;
    location: string;
  };
  createdBy?: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}

export interface ChallanItem {
  id?: string;
  challanId?: string;
  productId: string;
  productName: string;
  sku: string;
  unitPrice: string | number;
  quantity: number;
  product?: {
    name?: string;
    sku?: string;
  };
}

export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  totalQuantity: number;
  status: ChallanStatus;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  items: ChallanItem[];
  createdBy?: User;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  pagination: Pagination;
}
