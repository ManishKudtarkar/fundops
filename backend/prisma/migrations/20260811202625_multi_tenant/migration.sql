-- ============================================================
-- Multi-Tenant Migration
-- Phase 1: Enums
-- Phase 2: Business table
-- Phase 3: Seed default business
-- Phase 4: Add businessId to all tenant-owned tables
-- Phase 5: Backfill existing data to default business
-- Phase 6: Make businessId NOT NULL where required
-- Phase 7: Unique / index changes
-- Phase 8: AuditLog table
-- ============================================================

-- ─── Phase 1: New / altered enums ────────────────────────────

-- Extend Role enum with new roles
ALTER TYPE "Role" ADD VALUE 'SUPER_ADMIN';
ALTER TYPE "Role" ADD VALUE 'BUSINESS_ADMIN';

-- BusinessStatus enum
CREATE TYPE "BusinessStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'INACTIVE');

-- AuditAction enum
CREATE TYPE "AuditAction" AS ENUM (
  'LOGIN',
  'LOGOUT',
  'CREATE_CUSTOMER',
  'UPDATE_CUSTOMER',
  'DELETE_CUSTOMER',
  'CREATE_PRODUCT',
  'UPDATE_PRODUCT',
  'DELETE_PRODUCT',
  'STOCK_IN',
  'STOCK_OUT',
  'STOCK_ADJUSTMENT',
  'CREATE_CHALLAN',
  'CONFIRM_CHALLAN',
  'CANCEL_CHALLAN',
  'DELETE_CHALLAN',
  'CREATE_USER',
  'UPDATE_USER',
  'ROLE_CHANGE',
  'BUSINESS_CREATED',
  'BUSINESS_SUSPENDED',
  'BUSINESS_ACTIVATED'
);

-- ─── Phase 2: Business table ──────────────────────────────────

CREATE TABLE "Business" (
    "id"          TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "legalName"   TEXT,
    "email"       TEXT,
    "phone"       TEXT,
    "address"     TEXT,
    "city"        TEXT,
    "state"       TEXT,
    "country"     TEXT,
    "postalCode"  TEXT,
    "gstin"       TEXT,
    "logoUrl"     TEXT,
    "status"      "BusinessStatus" NOT NULL DEFAULT 'ACTIVE',
    "settings"    JSONB,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Business_status_idx" ON "Business"("status");

-- ─── Phase 3: Seed default business ──────────────────────────
-- All existing data will be assigned to this business.
-- The UUID is fixed so we can reference it below.

INSERT INTO "Business" (
    "id", "name", "legalName", "status", "createdAt", "updatedAt"
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'FundOps Demo Business',
    'FundOps Demo Business',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ─── Phase 4a: Add nullable businessId to User ───────────────
-- SUPER_ADMIN has no business, so this stays nullable.

ALTER TABLE "User"
    ADD COLUMN "businessId" TEXT,
    ADD COLUMN "isActive"   BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "User"
    ADD CONSTRAINT "User_businessId_fkey"
    FOREIGN KEY ("businessId") REFERENCES "Business"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "User_businessId_idx" ON "User"("businessId");
CREATE INDEX "User_role_idx" ON "User"("role");

-- ─── Phase 4b: Update existing ADMIN users to SUPER_ADMIN ────
-- The existing admin@fundops.com becomes SUPER_ADMIN (platform owner).
-- Other seed users become BUSINESS_ADMIN / regular roles within the default business.

UPDATE "User" SET "role" = 'SUPER_ADMIN'   WHERE "email" = 'admin@fundops.com';
UPDATE "User" SET "role" = 'BUSINESS_ADMIN', "businessId" = '00000000-0000-0000-0000-000000000001'
  WHERE "role" = 'SALES' OR "role" = 'WAREHOUSE' OR "role" = 'ACCOUNTS';

-- ─── Phase 4c: Add nullable businessId to Customer ───────────

ALTER TABLE "Customer" ADD COLUMN "businessId" TEXT;

-- ─── Phase 4d: Add nullable businessId to Product ────────────

ALTER TABLE "Product" ADD COLUMN "businessId" TEXT;

-- ─── Phase 4e: Add nullable businessId to StockMovement ──────

ALTER TABLE "StockMovement" ADD COLUMN "businessId" TEXT;

-- ─── Phase 4f: Add nullable businessId to Challan ────────────

ALTER TABLE "Challan" ADD COLUMN "businessId" TEXT;

-- ─── Phase 5: Backfill all existing rows to default business ──

UPDATE "Customer"      SET "businessId" = '00000000-0000-0000-0000-000000000001';
UPDATE "Product"       SET "businessId" = '00000000-0000-0000-0000-000000000001';
UPDATE "StockMovement" SET "businessId" = '00000000-0000-0000-0000-000000000001';
UPDATE "Challan"       SET "businessId" = '00000000-0000-0000-0000-000000000001';

-- ─── Phase 6: Make businessId NOT NULL on tenant tables ───────

ALTER TABLE "Customer"      ALTER COLUMN "businessId" SET NOT NULL;
ALTER TABLE "Product"       ALTER COLUMN "businessId" SET NOT NULL;
ALTER TABLE "StockMovement" ALTER COLUMN "businessId" SET NOT NULL;
ALTER TABLE "Challan"       ALTER COLUMN "businessId" SET NOT NULL;

-- ─── Phase 6b: Foreign key constraints ───────────────────────

ALTER TABLE "Customer"
    ADD CONSTRAINT "Customer_businessId_fkey"
    FOREIGN KEY ("businessId") REFERENCES "Business"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Product"
    ADD CONSTRAINT "Product_businessId_fkey"
    FOREIGN KEY ("businessId") REFERENCES "Business"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "StockMovement"
    ADD CONSTRAINT "StockMovement_businessId_fkey"
    FOREIGN KEY ("businessId") REFERENCES "Business"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Challan"
    ADD CONSTRAINT "Challan_businessId_fkey"
    FOREIGN KEY ("businessId") REFERENCES "Business"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- ─── Phase 7: Index additions ─────────────────────────────────

-- Customer
CREATE INDEX "Customer_businessId_idx"        ON "Customer"("businessId");
CREATE INDEX "Customer_businessId_status_idx" ON "Customer"("businessId", "status");
CREATE INDEX "Customer_businessId_createdAt_idx" ON "Customer"("businessId", "createdAt");

-- Product: replace globally-unique SKU with per-business unique
DROP INDEX IF EXISTS "Product_sku_key";
ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_sku_key";
CREATE UNIQUE INDEX "Product_businessId_sku_key" ON "Product"("businessId", "sku");
CREATE INDEX "Product_businessId_idx"          ON "Product"("businessId");
CREATE INDEX "Product_businessId_sku_idx"      ON "Product"("businessId", "sku");
CREATE INDEX "Product_businessId_createdAt_idx" ON "Product"("businessId", "createdAt");

-- StockMovement
CREATE INDEX "StockMovement_businessId_idx"           ON "StockMovement"("businessId");
CREATE INDEX "StockMovement_businessId_productId_idx" ON "StockMovement"("businessId", "productId");
CREATE INDEX "StockMovement_businessId_createdAt_idx" ON "StockMovement"("businessId", "createdAt");

-- Challan
CREATE INDEX "Challan_businessId_idx"          ON "Challan"("businessId");
CREATE INDEX "Challan_businessId_status_idx"   ON "Challan"("businessId", "status");
CREATE INDEX "Challan_businessId_createdAt_idx" ON "Challan"("businessId", "createdAt");

-- User email index
CREATE INDEX "User_email_idx" ON "User"("email");

-- ─── Phase 8: AuditLog table ──────────────────────────────────

CREATE TABLE "AuditLog" (
    "id"          TEXT NOT NULL,
    "businessId"  TEXT,
    "userId"      TEXT,
    "action"      "AuditAction" NOT NULL,
    "entityType"  TEXT,
    "entityId"    TEXT,
    "metadata"    JSONB,
    "ipAddress"   TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "AuditLog"
    ADD CONSTRAINT "AuditLog_businessId_fkey"
    FOREIGN KEY ("businessId") REFERENCES "Business"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AuditLog"
    ADD CONSTRAINT "AuditLog_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "AuditLog_businessId_idx" ON "AuditLog"("businessId");
CREATE INDEX "AuditLog_userId_idx"     ON "AuditLog"("userId");
CREATE INDEX "AuditLog_action_idx"     ON "AuditLog"("action");
CREATE INDEX "AuditLog_createdAt_idx"  ON "AuditLog"("createdAt");
